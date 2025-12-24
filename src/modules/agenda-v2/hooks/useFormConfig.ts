import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AppointmentFormConfig, 
  AppointmentFormFieldConfig,
  DEFAULT_FORM_CONFIG 
} from "@/modules/super-admin-v2/types/appointmentFormConfig";

export function useFormConfig() {
  const [config, setConfig] = useState<AppointmentFormConfig>(DEFAULT_FORM_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

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

  const getVisibleFields = (): AppointmentFormFieldConfig[] => {
    return config.fields
      .filter((f) => f.visible)
      .sort((a, b) => a.order - b.order);
  };

  const isFieldVisible = (fieldId: string): boolean => {
    const field = config.fields.find((f) => f.id === fieldId);
    return field?.visible ?? true;
  };

  const isFieldRequired = (fieldId: string): boolean => {
    const field = config.fields.find((f) => f.id === fieldId);
    return field?.required ?? false;
  };

  const getFieldLabel = (fieldId: string, defaultLabel: string): string => {
    const field = config.fields.find((f) => f.id === fieldId);
    return field?.label ?? defaultLabel;
  };

  const getFieldOrder = (fieldId: string): number => {
    const field = config.fields.find((f) => f.id === fieldId);
    return field?.order ?? 999;
  };

  return {
    config,
    isLoading,
    getVisibleFields,
    isFieldVisible,
    isFieldRequired,
    getFieldLabel,
    getFieldOrder,
    refetch: fetchConfig,
  };
}
