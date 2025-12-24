import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppointmentFormConfig, DEFAULT_FORM_CONFIG } from "../types/appointmentFormConfig";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export function useAppointmentFormConfig() {
  const [config, setConfig] = useState<AppointmentFormConfig>(DEFAULT_FORM_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "appointment_form_config")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setConfig(data.value as unknown as AppointmentFormConfig);
      } else {
        setConfig(DEFAULT_FORM_CONFIG);
      }
    } catch (error) {
      console.error("Error fetching form config:", error);
      setConfig(DEFAULT_FORM_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async (newConfig: AppointmentFormConfig) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({
          value: JSON.parse(JSON.stringify(newConfig)) as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "appointment_form_config");

      if (error) throw error;

      setConfig(newConfig);
      toast.success("Configuração salva com sucesso!");
      return true;
    } catch (error) {
      console.error("Error saving form config:", error);
      toast.error("Erro ao salvar configuração");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    config,
    isLoading,
    isSaving,
    saveConfig,
    refetch: fetchConfig,
  };
}
