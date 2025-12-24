import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface RolePolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface RolePoliciesConfig {
  policies: RolePolicy[];
}

export const DEFAULT_ROLE_POLICIES: RolePoliciesConfig = {
  policies: [
    {
      id: "only_super_admin_promote",
      name: "Somente Super Admin pode promover",
      description: "Apenas super_admin pode atribuir roles admin ou moderator",
      enabled: true,
    },
    {
      id: "prevent_self_demotion",
      name: "Impedir auto-rebaixamento",
      description: "Usuários não podem remover seus próprios papéis de super_admin",
      enabled: true,
    },
    {
      id: "require_at_least_one_super_admin",
      name: "Manter pelo menos 1 super admin",
      description: "O sistema deve sempre ter pelo menos um super_admin ativo",
      enabled: true,
    },
  ],
};

export function useRolePolicies() {
  const [policies, setPolicies] = useState<RolePoliciesConfig>(DEFAULT_ROLE_POLICIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "role_management_policies")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setPolicies(data.value as unknown as RolePoliciesConfig);
      } else {
        setPolicies(DEFAULT_ROLE_POLICIES);
      }
    } catch (error) {
      console.error("Error fetching role policies:", error);
      setPolicies(DEFAULT_ROLE_POLICIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const savePolicies = async (newPolicies: RolePoliciesConfig) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "role_management_policies",
            value: JSON.parse(JSON.stringify(newPolicies)) as Json,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          },
          { onConflict: "key" }
        );

      if (error) {
        console.error("Error saving role policies:", error);
        if (error.code === "42501" || error.message?.includes("policy")) {
          toast.error("Sem permissão para salvar. Verifique se você é super admin.");
        } else {
          toast.error(`Erro ao salvar: ${error.message}`);
        }
        return false;
      }

      setPolicies(newPolicies);
      toast.success("Políticas salvas com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error saving role policies:", error);
      toast.error(error?.message || "Erro ao salvar políticas");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const togglePolicy = (policyId: string) => {
    const updated = {
      ...policies,
      policies: policies.policies.map((p) =>
        p.id === policyId ? { ...p, enabled: !p.enabled } : p
      ),
    };
    setPolicies(updated);
    return updated;
  };

  return {
    policies,
    isLoading,
    isSaving,
    savePolicies,
    togglePolicy,
    refetch: fetchPolicies,
  };
}
