import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BusinessHoursConfig {
  start_hour: number;
  end_hour: number;
  slot_interval: number;
  working_days: number[];
  lunch_break: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DEFAULT_CONFIG: BusinessHoursConfig = {
  start_hour: 8,
  end_hour: 20,
  slot_interval: 30,
  working_days: [1, 2, 3, 4, 5, 6], // Seg-Sáb
  lunch_break: {
    enabled: false,
    start: "12:00",
    end: "13:00",
  },
};

export function useBusinessHoursConfig() {
  const [config, setConfig] = useState<BusinessHoursConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "business_hours_config")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.value) {
        setConfig(data.value as unknown as BusinessHoursConfig);
      }
    } catch (error) {
      console.error("Erro ao buscar configuração de horários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: BusinessHoursConfig): Promise<boolean> => {
    try {
      const { data: existingData } = await supabase
        .from("app_settings")
        .select("id")
        .eq("key", "business_hours_config")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("app_settings")
          .update({ 
            value: JSON.parse(JSON.stringify(newConfig)),
            updated_at: new Date().toISOString() 
          })
          .eq("key", "business_hours_config");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("app_settings").insert([{
          key: "business_hours_config",
          value: JSON.parse(JSON.stringify(newConfig)),
        }]);

        if (error) throw error;
      }

      setConfig(newConfig);
      toast({
        title: "Configuração salva",
        description: "Os horários de funcionamento foram atualizados.",
      });
      return true;
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    config,
    isLoading,
    saveConfig,
    refetch: fetchConfig,
  };
}
