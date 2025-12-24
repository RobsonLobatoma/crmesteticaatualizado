// Backend de Super Admin – serviços de domínio
// Aqui ficam apenas as regras de negócio. Integrações concretas com
// Supabase / banco real serão feitas depois através das interfaces.

import type {
  AppRole,
  AppSettingEntity,
  SuperAdminAssignRoleInput,
  SuperAdminRevokeRoleInput,
  SuperAdminSettingsDTO,
  SuperAdminUpdateSettingsInput,
  SuperAdminUserWithRolesDTO,
} from "./schemas";

// ==============================
//  Abstrações de infraestrutura
// ==============================

export interface SuperAdminSettingsRepository {
  /**
   * Retorna as configurações consolidadas para uso na interface.
   */
  getSettings(): Promise<SuperAdminSettingsDTO>;

  /**
   * Atualiza parcialmente as configurações globais. A implementação
   * típica em Supabase usaria a tabela app_settings para persistir
   * cada chave como um registro (key/value).
   */
  updateSettings(
    patch: SuperAdminUpdateSettingsInput,
    context: { updatedByUserId: string }
  ): Promise<SuperAdminSettingsDTO>;
}

export interface SuperAdminUserRolesRepository {
  /**
   * Lista papéis de um usuário específico.
   */
  getUserRoles(userId: string): Promise<AppRole[]>;

  /**
   * Lista usuários com seus papéis – usado na tela de Super admin.
   */
  listUsersWithRoles(): Promise<SuperAdminUserWithRolesDTO[]>;

  /**
   * Atribui um papel a um usuário (se ainda não existir).
   */
  assignRole(userId: string, role: AppRole): Promise<void>;

  /**
   * Remove um papel de um usuário.
   */
  revokeRole(userId: string, role: AppRole): Promise<void>;
}

export interface SuperAdminAuditLogger {
  log(event: {
    type: "SETTINGS_UPDATED" | "ROLE_ASSIGNED" | "ROLE_REVOKED";
    actorUserId: string;
    targetUserId?: string;
    payload?: Record<string, unknown>;
  }): Promise<void>;
}

export interface SuperAdminDeps {
  settingsRepo: SuperAdminSettingsRepository;
  userRolesRepo: SuperAdminUserRolesRepository;
  auditLogger?: SuperAdminAuditLogger; // opcional
}

// ==================
//  Serviço principal
// ==================

export class SuperAdminService {
  private readonly settingsRepo: SuperAdminSettingsRepository;
  private readonly userRolesRepo: SuperAdminUserRolesRepository;
  private readonly auditLogger?: SuperAdminAuditLogger;

  constructor(deps: SuperAdminDeps) {
    this.settingsRepo = deps.settingsRepo;
    this.userRolesRepo = deps.userRolesRepo;
    this.auditLogger = deps.auditLogger;
  }

  // -------------------
  //  Configurações globais
  // -------------------

  async getSettings(): Promise<SuperAdminSettingsDTO> {
    return this.settingsRepo.getSettings();
  }

  async updateSettings(
    input: SuperAdminUpdateSettingsInput,
    context: { actorUserId: string }
  ): Promise<SuperAdminSettingsDTO> {
    const updated = await this.settingsRepo.updateSettings(input, {
      updatedByUserId: context.actorUserId,
    });

    await this.auditLogger?.log({
      type: "SETTINGS_UPDATED",
      actorUserId: context.actorUserId,
      payload: input as Record<string, unknown>,
    });

    return updated;
  }

  // -------------------
  //  Papéis de usuário
  // -------------------

  async listUsersWithRoles(): Promise<SuperAdminUserWithRolesDTO[]> {
    return this.userRolesRepo.listUsersWithRoles();
  }

  async assignRole(
    input: SuperAdminAssignRoleInput,
    context: { actorUserId: string }
  ): Promise<void> {
    await this.userRolesRepo.assignRole(input.userId, input.role);

    await this.auditLogger?.log({
      type: "ROLE_ASSIGNED",
      actorUserId: context.actorUserId,
      targetUserId: input.userId,
      payload: { role: input.role },
    });
  }

  async revokeRole(
    input: SuperAdminRevokeRoleInput,
    context: { actorUserId: string }
  ): Promise<void> {
    await this.userRolesRepo.revokeRole(input.userId, input.role);

    await this.auditLogger?.log({
      type: "ROLE_REVOKED",
      actorUserId: context.actorUserId,
      targetUserId: input.userId,
      payload: { role: input.role },
    });
  }
}
