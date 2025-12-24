// Definições de rotas HTTP para funcionalidades de "Super admin".
// Não dependem de nenhum framework específico; você pode adaptar
// para Express, Fastify, edge functions etc. quando integrar.

import { z } from "zod";
import type {
  SuperAdminAssignRoleInput,
  SuperAdminRevokeRoleInput,
  SuperAdminUpdateSettingsInput,
} from "./schemas";
import {
  superAdminAssignRoleSchema,
  superAdminRevokeRoleSchema,
  superAdminUpdateSettingsSchema,
} from "./schemas";
import type { SuperAdminService } from "./services";
import type {
  HttpRequest,
  HttpResponse,
  RouteHandler,
} from "../auth/routes";

export interface SuperAdminRoutesDeps {
  superAdminService: SuperAdminService;
  /**
   * Função utilizada para extrair o ID do usuário autenticado
   * (que executa a ação). A verificação se ele realmente é
   * "super admin" deve ser feita em outra camada (middleware),
   * mas este hook facilita integrar com Supabase no futuro.
   */
  getActorUserId(req: HttpRequest): string | null;
}

const ensureActor = (deps: SuperAdminRoutesDeps, req: HttpRequest) => {
  const actorId = deps.getActorUserId(req);
  if (!actorId) {
    throw Object.assign(new Error("Não autenticado."), {
      statusCode: 401,
    });
  }
  return actorId;
};

export const createSuperAdminRoutes = (deps: SuperAdminRoutesDeps) => {
  const { superAdminService } = deps;

  // GET /api/super-admin/settings
  const getSettings: RouteHandler = async (_req, res) => {
    try {
      const settings = await superAdminService.getSettings();
      res.status(200).json(settings);
    } catch (error: any) {
      res.status(500).json({
        message: "Erro ao carregar configurações de Super admin.",
      });
    }
  };

  // PATCH /api/super-admin/settings
  const updateSettings: RouteHandler = async (req, res) => {
    try {
      const actorUserId = ensureActor(deps, req);
      const parsed = superAdminUpdateSettingsSchema.parse(
        req.body
      ) as SuperAdminUpdateSettingsInput;

      const updated = await superAdminService.updateSettings(parsed, {
        actorUserId,
      });

      res.status(200).json(updated);
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      if (error?.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({
        message: "Erro ao atualizar configurações de Super admin.",
      });
    }
  };

  // GET /api/super-admin/users-with-roles
  const listUsersWithRoles: RouteHandler = async (_req, res) => {
    try {
      const users = await superAdminService.listUsersWithRoles();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({
        message: "Erro ao listar usuários e papéis.",
      });
    }
  };

  // POST /api/super-admin/roles/assign
  const assignRole: RouteHandler = async (req, res) => {
    try {
      const actorUserId = ensureActor(deps, req);
      const parsed = superAdminAssignRoleSchema.parse(
        req.body
      ) as SuperAdminAssignRoleInput;

      await superAdminService.assignRole(parsed, { actorUserId });

      res.status(200).json({ message: "Papel atribuído com sucesso." });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      if (error?.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao atribuir papel ao usuário." });
    }
  };

  // POST /api/super-admin/roles/revoke
  const revokeRole: RouteHandler = async (req, res) => {
    try {
      const actorUserId = ensureActor(deps, req);
      const parsed = superAdminRevokeRoleSchema.parse(
        req.body
      ) as SuperAdminRevokeRoleInput;

      await superAdminService.revokeRole(parsed, { actorUserId });

      res.status(200).json({ message: "Papel removido com sucesso." });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      if (error?.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao remover papel do usuário." });
    }
  };

  return {
    getSettings,
    updateSettings,
    listUsersWithRoles,
    assignRole,
    revokeRole,
  };
};
