// Re-export types from backend schemas
export type {
  AppRole,
  SuperAdminSettingsDTO,
  SuperAdminUserWithRolesDTO,
  SuperAdminUpdateSettingsInput,
  SuperAdminAssignRoleInput,
  SuperAdminRevokeRoleInput,
} from "@/backend/admin/schemas";

import type { AppRole } from "@/backend/admin/schemas";

// Mock data type for development
export interface MockUserRole {
  id: string;
  name: string;
  email: string;
  roles: AppRole[];
}
