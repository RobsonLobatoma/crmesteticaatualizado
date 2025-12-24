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
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use upsert with onConflict to handle both insert and update
      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "appointment_form_config",
            value: JSON.parse(JSON.stringify(newConfig)) as Json,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          },
          { onConflict: "key" }
        );

      if (error) {
        console.error("Error saving form config:", error);
        if (error.code === "42501" || error.message?.includes("policy")) {
          toast.error("Sem permissão para salvar. Verifique se você é super admin.");
        } else {
          toast.error(`Erro ao salvar: ${error.message}`);
        }
        return false;
      }

      setConfig(newConfig);
      toast.success("Configuração salva com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error saving form config:", error);
      toast.error(error?.message || "Erro ao salvar configuração");
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
