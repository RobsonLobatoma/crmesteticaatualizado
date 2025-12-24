// Backend de autenticação – tipos, esquemas e documentação de tabelas
// Esta camada é independente de infraestrutura (sem Lovable Cloud / Supabase).

import { z } from "zod";

// =========================
//  Modelagem de Banco (SQL)
// =========================

/**
 * Exemplo de DDL em Postgres (documentação – não é executado neste projeto):
 *
 *  create table public.users (
 *    id uuid primary key default gen_random_uuid(),
 *    email text not null unique,
 *    password_hash text,
 *    name text,
 *    google_id text unique,
 *    created_at timestamptz not null default now(),
 *    updated_at timestamptz not null default now()
 *  );
 *
 *  create table public.password_reset_tokens (
 *    id uuid primary key default gen_random_uuid(),
 *    user_id uuid not null references public.users(id) on delete cascade,
 *    token_hash text not null,
 *    expires_at timestamptz not null,
 *    used boolean not null default false,
 *    created_at timestamptz not null default now()
 *  );
 *
 *  create table public.sessions (
 *    id uuid primary key default gen_random_uuid(),
 *    user_id uuid not null references public.users(id) on delete cascade,
 *    refresh_token_hash text not null,
 *    user_agent text,
 *    ip text,
 *    expires_at timestamptz not null,
 *    created_at timestamptz not null default now(),
 *    revoked boolean not null default false
 *  );
 */

// ===============
//  Zod Schemas
// ===============

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Informe um e-mail válido." })
    .max(255, { message: "O e-mail deve ter até 255 caracteres." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(128, { message: "A senha deve ter no máximo 128 caracteres." }),
  name: z
    .string()
    .trim()
    .max(120, { message: "O nome deve ter até 120 caracteres." })
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Informe um e-mail válido." })
    .max(255),
  password: z.string().min(1, { message: "Informe a senha." }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Informe um e-mail válido." })
    .max(255),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(32, { message: "Token inválido." })
    .max(512),
  newPassword: z
    .string()
    .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." })
    .max(128),
});

// ======================
//  Tipos de DTO / Payload
// ======================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface AuthUserDTO {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponseDTO extends AuthTokensDTO {
  user: AuthUserDTO;
}

export type PasswordResetRequestDTO = z.infer<typeof forgotPasswordSchema>;
export type PasswordResetConfirmDTO = z.infer<typeof resetPasswordSchema>;

// ==========================
//  Entidades básicas (domínio)
// ==========================

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string | null;
  name?: string | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionEntity {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  ip?: string | null;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
}

export interface PasswordResetTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// ==========================
//  Erros de domínio padronizados
// ==========================

export class AuthError extends Error {
  public readonly code:
    | "EMAIL_ALREADY_IN_USE"
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "INVALID_RESET_TOKEN"
    | "EXPIRED_RESET_TOKEN"
    | "RESET_TOKEN_USED";

  constructor(code: AuthError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}
