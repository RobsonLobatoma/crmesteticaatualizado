import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EvolutionInstanceConfig, WhatsappInstanceStatus } from "../types";
import type { Json } from "@/integrations/supabase/types";

interface InstanceFormData {
  name: string;
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
}

function normalizeEvolutionApiUrl(input: string) {
  const trimmed = input.trim();
  // Fix common misconfiguration saved as "https:https://domain" (double scheme)
  const fixed = trimmed.replace(/^(https?:)(https?:\/\/)/i, "$2");
  // If user saved without protocol, assume https
  const withProtocol = !/^https?:\/\//i.test(fixed) ? `https://${fixed}` : fixed;
  // Remove trailing slash
  return withProtocol.replace(/\/+$/, "");
}

export function useEvolutionInstances() {
  const { toast } = useToast();
  const [instances, setInstances] = useState<EvolutionInstanceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "whatsapp_evolution_instances")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const parsed = typeof data.value === "string" 
          ? JSON.parse(data.value) 
          : data.value;
        setInstances((parsed as { instances?: EvolutionInstanceConfig[] }).instances || []);
      } else {
        setInstances([]);
      }
    } catch (error) {
      console.error("Erro ao carregar instâncias:", error);
      toast({
        title: "Erro ao carregar instâncias",
        description: "Não foi possível carregar as instâncias do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const saveInstances = async (newInstances: EvolutionInstanceConfig[]) => {
    try {
      // First check if the record exists
      const { data: existing } = await supabase
        .from("app_settings")
        .select("id")
        .eq("key", "whatsapp_evolution_instances")
        .maybeSingle();

      const valuePayload = { instances: newInstances } as unknown as Json;

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("app_settings")
          .update({
            value: valuePayload,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "whatsapp_evolution_instances");
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("app_settings")
          .insert({
            key: "whatsapp_evolution_instances",
            value: valuePayload,
          });
        if (error) throw error;
      }

      setInstances(newInstances);
      return true;
    } catch (error) {
      console.error("Erro ao salvar instâncias:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createInstance = async (formData: InstanceFormData): Promise<boolean> => {
    const newInstance: EvolutionInstanceConfig = {
      id: `evo-${Date.now()}`,
      name: formData.name,
      evolutionApiUrl: normalizeEvolutionApiUrl(formData.evolutionApiUrl),
      evolutionApiKey: formData.evolutionApiKey,
      evolutionInstanceName: formData.evolutionInstanceName,
      status: "disconnected",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const success = await saveInstances([...instances, newInstance]);
    if (success) {
      toast({
        title: "Instância criada",
        description: `A instância "${formData.name}" foi criada com sucesso.`,
      });
    }
    return success;
  };

  const updateInstance = async (
    id: string,
    formData: Partial<InstanceFormData>
  ): Promise<boolean> => {
    const updatedInstances = instances.map((inst) =>
      inst.id === id
        ? {
            ...inst,
            ...formData,
            evolutionApiUrl: formData.evolutionApiUrl
              ? normalizeEvolutionApiUrl(formData.evolutionApiUrl)
              : inst.evolutionApiUrl,
            updatedAt: new Date().toISOString(),
          }
        : inst
    );

    const success = await saveInstances(updatedInstances);
    if (success) {
      toast({
        title: "Instância atualizada",
        description: "As configurações foram atualizadas com sucesso.",
      });
    }
    return success;
  };

  const deleteInstance = async (id: string): Promise<boolean> => {
    const filtered = instances.filter((inst) => inst.id !== id);
    const success = await saveInstances(filtered);
    if (success) {
      toast({
        title: "Instância removida",
        description: "A instância foi removida com sucesso.",
      });
    }
    return success;
  };

  const updateInstanceStatus = async (
    id: string,
    status: WhatsappInstanceStatus,
    phoneNumber?: string
  ): Promise<boolean> => {
    const updatedInstances = instances.map((inst) =>
      inst.id === id
        ? {
            ...inst,
            status,
            phoneNumber: phoneNumber || inst.phoneNumber,
            updatedAt: new Date().toISOString(),
          }
        : inst
    );
    return saveInstances(updatedInstances);
  };

  return {
    instances,
    isLoading,
    createInstance,
    updateInstance,
    deleteInstance,
    updateInstanceStatus,
    refetch: fetchInstances,
  };
}
