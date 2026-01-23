import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRoles {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  roles: AppRole[];
}

export interface SuperAdminSettings {
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  maxSessionDuration: number;
}

const DEFAULT_SETTINGS: SuperAdminSettings = {
  allowPublicRegistration: true,
  requireEmailVerification: false,
  maxSessionDuration: 24,
};

export function useSuperAdmin() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [settings, setSettings] = useState<SuperAdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const checkIsSuperAdmin = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSuperAdmin(false);
        return false;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking super admin status:", error);
        setIsSuperAdmin(false);
        return false;
      }

      const result = !!data;
      setIsSuperAdmin(result);
      return result;
    } catch (error) {
      console.error("Error checking super admin:", error);
      setIsSuperAdmin(false);
      return false;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch all profiles (super_admin has RLS access to all)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        return;
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const userRoles = (roles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole);

        return {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          roles: userRoles.length > 0 ? userRoles : ["user" as AppRole],
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "super_admin_settings")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setSettings(data.value as unknown as SuperAdminSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    const isAdmin = await checkIsSuperAdmin();
    
    if (isAdmin) {
      await Promise.all([fetchUsers(), fetchSettings()]);
    }
    
    setIsLoading(false);
  }, [checkIsSuperAdmin, fetchUsers, fetchSettings]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();

      if (existing) {
        toast.info("Usuário já possui este papel");
        return false;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) {
        console.error("Error assigning role:", error);
        if (error.code === "42501") {
          toast.error("Sem permissão para atribuir papéis");
        } else {
          toast.error(`Erro ao atribuir papel: ${error.message}`);
        }
        return false;
      }

      toast.success(`Papel ${role} atribuído com sucesso`);
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast.error(error?.message || "Erro ao atribuir papel");
      return false;
    }
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    try {
      // Prevent removing last super_admin
      if (role === "super_admin") {
        const { data: superAdmins } = await supabase
          .from("user_roles")
          .select("id")
          .eq("role", "super_admin");

        if ((superAdmins?.length || 0) <= 1) {
          toast.error("Deve haver pelo menos 1 super admin no sistema");
          return false;
        }
      }

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) {
        console.error("Error revoking role:", error);
        if (error.code === "42501") {
          toast.error("Sem permissão para revogar papéis");
        } else {
          toast.error(`Erro ao revogar papel: ${error.message}`);
        }
        return false;
      }

      toast.success(`Papel ${role} revogado com sucesso`);
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Error revoking role:", error);
      toast.error(error?.message || "Erro ao revogar papel");
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<SuperAdminSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const merged = { ...settings, ...newSettings };

      const { error } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "super_admin_settings",
            value: merged as any,
            updated_at: new Date().toISOString(),
            updated_by: user?.id || null,
          },
          { onConflict: "key" }
        );

      if (error) {
        console.error("Error updating settings:", error);
        toast.error("Erro ao salvar configurações");
        return false;
      }

      setSettings(merged);
      toast.success("Configurações salvas");
      return true;
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(error?.message || "Erro ao salvar configurações");
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return false;
      }

      const response = await fetch(
        `https://ulzeeekfkgdhoojbiioo.supabase.co/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsemVlZWtma2dkaG9vamJpaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzE3MTcsImV4cCI6MjA4MjA0NzcxN30.05ykiyGs_DVmyvJAQ5Ej_cSUFNzH1HdlSXMFHqgLfno",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao remover usuário");
      }

      toast.success("Usuário removido com sucesso");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error?.message || "Erro ao remover usuário");
      return false;
    }
  };

  return {
    users,
    settings,
    isLoading,
    isSuperAdmin,
    fetchUsers,
    fetchSettings,
    updateSettings,
    assignRole,
    revokeRole,
    deleteUser,
    refetch: initialize,
  };
}
