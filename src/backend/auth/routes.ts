// Definições de rotas HTTP para autenticação (backend genérico)
// Aqui definimos handlers em estilo Express, mas sem acoplar a nenhuma lib.

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./schemas";
import type {
  LoginInput,
  SignupInput,
  PasswordResetRequestDTO,
  PasswordResetConfirmDTO,
} from "./schemas";
import { AuthError } from "./schemas";
import { AuthService } from "./services";

// Interfaces genéricas para request/response, para não depender de framework.
export interface HttpRequest {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  userAgent?: string;
}

export interface HttpResponse {
  status(code: number): this;
  json(payload: unknown): void;
  redirect(url: string): void;
}

export interface RouteHandler {
  (req: HttpRequest, res: HttpResponse): Promise<void> | void;
}

export interface AuthRoutesDeps {
  authService: AuthService;
}

const getContextFromRequest = (req: HttpRequest) => ({
  ip: req.ip ?? undefined,
  userAgent:
    (typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : Array.isArray(req.headers["user-agent"])
      ? req.headers["user-agent"][0]
      : undefined) ?? req.userAgent,
});

const handleAuthError = (res: HttpResponse, error: AuthError) => {
  switch (error.code) {
    case "EMAIL_ALREADY_IN_USE":
      res.status(409).json({ message: error.message, code: error.code });
      break;
    case "INVALID_CREDENTIALS":
      res.status(401).json({ message: error.message, code: error.code });
      break;
    case "USER_NOT_FOUND":
    case "INVALID_RESET_TOKEN":
    case "EXPIRED_RESET_TOKEN":
    case "RESET_TOKEN_USED":
      res.status(400).json({ message: error.message, code: error.code });
      break;
    default:
      res.status(400).json({ message: error.message, code: error.code });
  }
};

export const createAuthRoutes = (deps: AuthRoutesDeps) => {
  const { authService } = deps;

  // POST /api/auth/signup
  const signup: RouteHandler = async (req, res) => {
    try {
      const parsed = signupSchema.parse(req.body) as SignupInput;
      const ctx = getContextFromRequest(req);
      const auth = await authService.signUpWithEmail(parsed, ctx);
      res.status(201).json(auth);
    } catch (error: any) {
      if (error instanceof AuthError) {
        return handleAuthError(res, error);
      }

      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      res.status(500).json({ message: "Erro interno ao criar conta." });
    }
  };

  // POST /api/auth/login
  const login: RouteHandler = async (req, res) => {
    try {
      const parsed = loginSchema.parse(req.body) as LoginInput;
      const ctx = getContextFromRequest(req);
      const auth = await authService.loginWithEmail(parsed, ctx);
      res.status(200).json(auth);
    } catch (error: any) {
      if (error instanceof AuthError) {
        return handleAuthError(res, error);
      }

      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      res.status(500).json({ message: "Erro interno ao autenticar." });
    }
  };

  // POST /api/auth/forgot-password
  const forgotPassword: RouteHandler = async (req, res) => {
    try {
      const parsed: PasswordResetRequestDTO = forgotPasswordSchema.parse(req.body);
      await authService.requestPasswordReset(parsed);
      res.status(200).json({
        message:
          "Se este e-mail estiver cadastrado, enviaremos um link para redefinição de senha.",
      });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }

      res.status(500).json({ message: "Erro ao solicitar redefinição de senha." });
    }
  };

  // POST /api/auth/reset-password
  const resetPassword: RouteHandler = async (req, res) => {
    try {
      const parsed: PasswordResetConfirmDTO = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(parsed);
      res.status(200).json({ message: "Senha atualizada com sucesso." });
    } catch (error: any) {
      if (error instanceof AuthError) {
        return handleAuthError(res, error);
      }
      if (error?.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inválidos.",
          issues: error.issues,
        });
      }
      res.status(500).json({ message: "Erro ao redefinir senha." });
    }
  };

  return {
    signup,
    login,
    forgotPassword,
    resetPassword,
  };
};
