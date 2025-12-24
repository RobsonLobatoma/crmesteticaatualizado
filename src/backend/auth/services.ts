// Backend de autenticação – serviços de domínio
// Nenhuma dependência de infraestrutura específica (sem Lovable Cloud).
// As integrações (DB, e-mail, OAuth, tokens) são abstrações injetadas.

import type {
  AuthResponseDTO,
  AuthUserDTO,
  ForgotPasswordInput,
  LoginInput,
  PasswordResetConfirmDTO,
  PasswordResetRequestDTO,
  ResetPasswordInput,
  SessionEntity,
  SignupInput,
  UserEntity,
} from "./schemas";
import { AuthError } from "./schemas";

// ==============================
//  Abstrações de infraestrutura
// ==============================

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  createUser(data: {
    email: string;
    passwordHash: string | null;
    name?: string | null;
    googleId?: string | null;
  }): Promise<UserEntity>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
}

export interface SessionRepository {
  createSession(data: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string | null;
    ip?: string | null;
    expiresAt: Date;
  }): Promise<SessionEntity>;
  revokeSessionById(sessionId: string): Promise<void>;
  revokeSessionByRefreshTokenHash(refreshTokenHash: string): Promise<void>;
}

export interface PasswordResetTokenRepository {
  createToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findValidToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    used: boolean;
  } | null>;
  markTokenAsUsed(id: string): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenManager {
  generateAccessToken(userId: string): Promise<string>;
  generateRefreshToken(sessionId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<{ userId: string } | null>;
}

export interface EmailSender {
  sendPasswordResetEmail(params: {
    email: string;
    resetLink: string;
  }): Promise<void>;
}

export interface GoogleProfile {
  id: string; // sub
  email: string;
  name?: string | null;
}

export interface GoogleOAuthService {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForUser(params: {
    code: string;
    state: string;
  }): Promise<GoogleProfile>;
}

export interface AuthServiceDeps {
  userRepo: UserRepository;
  sessionRepo: SessionRepository;
  resetTokenRepo: PasswordResetTokenRepository;
  passwordHasher: PasswordHasher;
  tokenManager: TokenManager;
  emailSender: EmailSender;
}

// ==================
//  Funções auxiliares
// ==================

const toAuthUserDTO = (user: UserEntity): AuthUserDTO => ({
  id: user.id,
  email: user.email,
  name: user.name ?? null,
});

const oneHourFromNow = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d;
};

// Geração de token "público" (string aleatória) desacoplada da forma de hash
const generatePublicToken = (length = 48): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint32Array(length);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(array);
  } else {
    // Fallback não-criptográfico – em ambiente real, use crypto seguro
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * chars.length);
    }
  }
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
};

// ==================
//  Serviço principal
// ==================

export class AuthService {
  private readonly userRepo: UserRepository;
  private readonly sessionRepo: SessionRepository;
  private readonly resetTokenRepo: PasswordResetTokenRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly tokenManager: TokenManager;
  private readonly emailSender: EmailSender;

  constructor(deps: AuthServiceDeps) {
    this.userRepo = deps.userRepo;
    this.sessionRepo = deps.sessionRepo;
    this.resetTokenRepo = deps.resetTokenRepo;
    this.passwordHasher = deps.passwordHasher;
    this.tokenManager = deps.tokenManager;
    this.emailSender = deps.emailSender;
  }

  // =============
  //  Cadastro
  // =============

  async signUpWithEmail(
    input: SignupInput,
    context?: { userAgent?: string | null; ip?: string | null }
  ): Promise<AuthResponseDTO> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AuthError(
        "EMAIL_ALREADY_IN_USE",
        "Já existe uma conta cadastrada com este e-mail."
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepo.createUser({
      email: input.email,
      passwordHash,
      name: input.name ?? null,
    });

    const sessionExpires = new Date();
    sessionExpires.setDate(sessionExpires.getDate() + 30); // 30 dias

    const refreshTokenPlain = generatePublicToken(64);
    const refreshTokenHash = await this.passwordHasher.hash(refreshTokenPlain);

    const session = await this.sessionRepo.createSession({
      userId: user.id,
      refreshTokenHash,
      userAgent: context?.userAgent ?? null,
      ip: context?.ip ?? null,
      expiresAt: sessionExpires,
    });

    const accessToken = await this.tokenManager.generateAccessToken(user.id);
    const refreshToken = await this.tokenManager.generateRefreshToken(session.id);

    return {
      user: toAuthUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  // =============
  //  Login
  // =============

  async loginWithEmail(
    input: LoginInput,
    context?: { userAgent?: string | null; ip?: string | null }
  ): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "E-mail ou senha inválidos."
      );
    }

    const ok = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );

    if (!ok) {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "E-mail ou senha inválidos."
      );
    }

    const sessionExpires = new Date();
    sessionExpires.setDate(sessionExpires.getDate() + 30);

    const refreshTokenPlain = generatePublicToken(64);
    const refreshTokenHash = await this.passwordHasher.hash(refreshTokenPlain);

    const session = await this.sessionRepo.createSession({
      userId: user.id,
      refreshTokenHash,
      userAgent: context?.userAgent ?? null,
      ip: context?.ip ?? null,
      expiresAt: sessionExpires,
    });

    const accessToken = await this.tokenManager.generateAccessToken(user.id);
    const refreshToken = await this.tokenManager.generateRefreshToken(session.id);

    return {
      user: toAuthUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  // =====================
  //  "Esqueci minha senha"
  // =====================

  async requestPasswordReset(input: PasswordResetRequestDTO): Promise<void> {
    const user = await this.userRepo.findByEmail(input.email);

    // Sempre responder 200, mesmo quando o usuário não existe,
    // para não vazar existência de e-mails.
    if (!user) return;

    const publicToken = generatePublicToken(64);
    const tokenHash = await this.passwordHasher.hash(publicToken);

    await this.resetTokenRepo.createToken({
      userId: user.id,
      tokenHash,
      expiresAt: oneHourFromNow(),
    });

    // O link exato (APP_URL) deve ser montado na camada de API / configuração.
    const resetLink = `https://example.com/auth/reset-password?token=${publicToken}`;

    await this.emailSender.sendPasswordResetEmail({
      email: user.email,
      resetLink,
    });
  }

  async resetPassword(input: PasswordResetConfirmDTO): Promise<void> {
    const publicToken = input.token;
    const tokenHash = await this.passwordHasher.hash(publicToken);

    const record = await this.resetTokenRepo.findValidToken(tokenHash);
    if (!record) {
      throw new AuthError(
        "INVALID_RESET_TOKEN",
        "O link de redefinição de senha é inválido."
      );
    }

    if (record.used) {
      throw new AuthError(
        "RESET_TOKEN_USED",
        "Este link de redefinição já foi utilizado."
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new AuthError(
        "EXPIRED_RESET_TOKEN",
        "O link de redefinição de senha expirou."
      );
    }

    const newPasswordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepo.updateUserPassword(record.userId, newPasswordHash);
    await this.resetTokenRepo.markTokenAsUsed(record.id);
  }
}
