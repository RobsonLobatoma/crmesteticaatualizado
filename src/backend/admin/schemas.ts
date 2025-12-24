// Backend de Super Admin – schemas, tipos e DDL de referência (Supabase)
// Camada independente de infraestrutura. As tabelas abaixo devem ser
// criadas no banco (por exemplo, Supabase) quando você integrar o backend.

import { z } from "zod";

// ========================================
//  Modelagem de banco pensada para Supabase
// ========================================
/**
 * SQL sugerido (Postgres / Supabase) – DOCUMENTAÇÃO, não é executado aqui.
 *
 *  -- 1) Enum de papéis da aplicação
 *  create type public.app_role as enum ('admin', 'moderator', 'user');
 *
 *  -- 2) Tabela de papéis por usuário (N papéis por usuário)
 *  create table public.user_roles (
 *    id uuid primary key default gen_random_uuid(),
 *    user_id uuid references auth.users(id) on delete cascade not null,
 *    role app_role not null,
 *    unique (user_id, role)
 *  );
 *
 *  alter table public.user_roles enable row level security;
 *
 *  -- 3) Função para checar papel sem recursão de RLS
 *  create or replace function public.has_role(_user_id uuid, _role app_role)
 *  returns boolean
 *  language sql
 *  stable
 *  security definer
 *  set search_path = public
 *  as $$
 *    select exists (
 *      select 1
 *      from public.user_roles
 *      where user_id = _user_id
 *        and role = _role
 *    );
 *  $$;
 *
 *  -- 4) Configurações globais da aplicação (usadas em "Super admin")
 *  create table public.app_settings (
 *    id uuid primary key default gen_random_uuid(),
 *    key text not null unique,
 *    value jsonb not null,
 *    created_at timestamptz not null default now(),
 *    updated_at timestamptz not null default now(),
 *    updated_by uuid references auth.users(id)
 *  );
 */

// ==============================
//  Tipos básicos de domínio
// ==============================

export const appRoleSchema = z.enum(["admin", "moderator", "user"]);
export type AppRole = z.infer<typeof appRoleSchema>;

export interface UserRoleEntity {
  id: string;
  userId: string;
  role: AppRole;
}

export interface AppSettingEntity {
  id: string;
  key: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string | null;
}

// ==============================
//  Schemas de entrada para rotas
// ==============================

export const superAdminUpdateSettingsSchema = z
  .object({
    // Exemplos de chaves comuns em um painel de Super admin.
    dailyLeadsTarget: z
      .number()
      .int()
      .min(0)
      .max(100000)
      .optional(),
    maintenanceMode: z.boolean().optional(),
    allowGoogleSignup: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar.",
  });

export type SuperAdminUpdateSettingsInput = z.infer<
  typeof superAdminUpdateSettingsSchema
>;

export const superAdminAssignRoleSchema = z.object({
  userId: z
    .string()
    .uuid({ message: "ID de usuário inválido." }),
  role: appRoleSchema,
});

export type SuperAdminAssignRoleInput = z.infer<
  typeof superAdminAssignRoleSchema
>;

export const superAdminRevokeRoleSchema = z.object({
  userId: z
    .string()
    .uuid({ message: "ID de usuário inválido." }),
  role: appRoleSchema,
});

export type SuperAdminRevokeRoleInput = z.infer<
  typeof superAdminRevokeRoleSchema
>;

// ==============================
//  DTOs usados nas respostas
// ==============================

export interface SuperAdminSettingsDTO {
  dailyLeadsTarget: number | null;
  maintenanceMode: boolean;
  allowGoogleSignup: boolean;
}

export interface SuperAdminUserWithRolesDTO {
  id: string;
  email: string;
  name?: string | null;
  roles: AppRole[];
}
