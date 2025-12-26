import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/integrations/supabase/AuthProvider";

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
  const { user } = useAuth();
  const [config, setConfig] = useState<BusinessHoursConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const getUserKey = () => user ? `user_${user.id}_business_hours` : null;

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;
    
    try {
      const userKey = getUserKey();
      
      // Primeiro tenta buscar config do usuário
      const { data: userData, error: userError } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", userKey)
        .single();

      if (userData?.value) {
        setConfig(userData.value as unknown as BusinessHoursConfig);
        setIsLoading(false);
        return;
      }

      // Fallback para config global
      const { data: globalData, error: globalError } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "business_hours_config")
        .single();

      if (globalError && globalError.code !== "PGRST116") {
        throw globalError;
      }

      if (globalData?.value) {
        setConfig(globalData.value as unknown as BusinessHoursConfig);
      }
    } catch (error) {
      console.error("Erro ao buscar configuração de horários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: BusinessHoursConfig): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar configurações.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const userKey = getUserKey()!;
      
      const { data: existingData } = await supabase
        .from("app_settings")
        .select("id")
        .eq("key", userKey)
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("app_settings")
          .update({ 
            value: JSON.parse(JSON.stringify(newConfig)),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq("key", userKey);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("app_settings").insert([{
          key: userKey,
          value: JSON.parse(JSON.stringify(newConfig)),
          updated_by: user.id
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
