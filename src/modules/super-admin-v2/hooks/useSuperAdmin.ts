import { useState } from "react";
import type { AppRole, MockUserRole, SuperAdminSettingsDTO } from "../types";

// Mock data (placeholder sem usuários reais)
const mockRoles: MockUserRole[] = [];

const mockSettings: SuperAdminSettingsDTO = {
  dailyLeadsTarget: 0,
  maintenanceMode: false,
  allowGoogleSignup: false,
};

export const useSuperAdmin = () => {
  const [users, setUsers] = useState<MockUserRole[]>(mockRoles);
  const [settings, setSettings] = useState<SuperAdminSettingsDTO>(mockSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Future: Replace with actual API calls
  const fetchUsers = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const updateSettings = async (newSettings: Partial<SuperAdminSettingsDTO>) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSettings((prev) => ({ ...prev, ...newSettings }));
    setIsLoading(false);
  };

  const assignRole = async (userId: string, role: AppRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId && !user.roles.includes(role)
          ? { ...user, roles: [...user.roles, role] }
          : user,
      ),
    );
    setIsLoading(false);
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, roles: user.roles.filter((r) => r !== role) }
          : user,
      ),
    );
    setIsLoading(false);
  };

  return {
    users,
    settings,
    isLoading,
    fetchUsers,
    fetchSettings,
    updateSettings,
    assignRole,
    revokeRole,
  };
};
