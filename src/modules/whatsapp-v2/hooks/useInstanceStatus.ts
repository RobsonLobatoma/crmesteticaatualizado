import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EvolutionInstanceConfig, WhatsappInstanceStatus } from "../types";

interface StatusResult {
  status: WhatsappInstanceStatus;
  phoneNumber?: string | null;
  profileName?: string | null;
  error?: string;
}

interface UseInstanceStatusOptions {
  instance: EvolutionInstanceConfig | null;
  enabled?: boolean;
  pollingInterval?: number;
}

export function useInstanceStatus({
  instance,
  enabled = true,
  pollingInterval = 15000,
}: UseInstanceStatusOptions) {
  const [status, setStatus] = useState<WhatsappInstanceStatus>(
    instance?.status || "disconnected"
  );
  const [phoneNumber, setPhoneNumber] = useState<string | null>(
    instance?.phoneNumber || null
  );
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!instance || !enabled) return;

    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Não autenticado");
      }

      const response = await supabase.functions.invoke("evolution-check-status", {
        body: {
          evolutionApiUrl: instance.evolutionApiUrl,
          evolutionApiKey: instance.evolutionApiKey,
          instanceName: instance.evolutionInstanceName,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result: StatusResult = response.data;
      
      setStatus(result.status);
      setPhoneNumber(result.phoneNumber || null);
      setProfileName(result.profileName || null);
      setError(result.error || null);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      setStatus("error");
      console.error("Erro ao verificar status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [instance, enabled]);

  // Initial check
  useEffect(() => {
    if (instance && enabled) {
      checkStatus();
    }
  }, [instance?.id, enabled, checkStatus]);

  // Polling
  useEffect(() => {
    if (!instance || !enabled || pollingInterval <= 0) return;

    const intervalId = setInterval(checkStatus, pollingInterval);
    return () => clearInterval(intervalId);
  }, [instance?.id, enabled, pollingInterval, checkStatus]);

  // Reset when instance changes
  useEffect(() => {
    if (!instance) {
      setStatus("disconnected");
      setPhoneNumber(null);
      setProfileName(null);
      setError(null);
    }
  }, [instance]);

  return {
    status,
    phoneNumber,
    profileName,
    isLoading,
    error,
    refetch: checkStatus,
  };
}
