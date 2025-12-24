import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  working_days: [1, 2, 3, 4, 5, 6],
  lunch_break: {
    enabled: false,
    start: "12:00",
    end: "13:00",
  },
};

export function useBusinessHours() {
  const [config, setConfig] = useState<BusinessHoursConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    fetchConfig();
  }, []);

  const timeSlots = useMemo(() => {
    const slots: { time: string; hour: number; minute: number }[] = [];
    const { start_hour, end_hour, slot_interval, lunch_break } = config;

    let currentHour = start_hour;
    let currentMinute = 0;

    while (currentHour < end_hour || (currentHour === end_hour && currentMinute === 0)) {
      const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      
      // Check if this slot is during lunch break
      if (lunch_break.enabled) {
        const lunchStartHour = parseInt(lunch_break.start.split(":")[0]);
        const lunchEndHour = parseInt(lunch_break.end.split(":")[0]);
        
        if (currentHour >= lunchStartHour && currentHour < lunchEndHour) {
          // Skip lunch hours
          currentMinute += slot_interval;
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
          }
          continue;
        }
      }

      slots.push({ time, hour: currentHour, minute: currentMinute });

      currentMinute += slot_interval;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return slots;
  }, [config]);

  return {
    config,
    timeSlots,
    isLoading,
  };
}
