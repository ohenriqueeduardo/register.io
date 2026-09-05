import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { User, UserRole, UserStatus } from "@prisma/client";
import { getPrisma } from "./prisma";
import { getLogger } from "./logger-context";

export const SESSION_COOKIE = "register_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tokenVersion?: number;
};

export type CurrentUser = Omit<User, "passwordHash">;
export type SafeUser = Pick<
  User,
  | "id"
  | "nome"
  | "email"
  | "role"
  | "status"
  | "username"
  | "mustChangePassword"
  | "createdAt"
  | "updatedAt"
  | "lastLoginAt"
>;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres.");
  }

  return secret;
}

export function isPublicRegistrationEnabled() {
  return (
    process.env.ALLOW_PUBLIC_REGISTRATION === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export function signAuthToken(
  user: Pick<User, "id" | "email" | "role"> & { tokenVersion?: number },
) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    } satisfies AuthTokenPayload,
    getJwtSecret(),
    { expiresIn: SESSION_TTL_SECONDS },
  );
}

export function verifyAuthToken(token: string) {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return payload;
  } catch (err: any) {
    getLogger().debug({ error: err?.message }, "Falha na validação do token JWT.");
    return null;
  }
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      nome: true,
      username: true,
      email: true,
      role: true,
      status: true,
      mustChangePassword: true,
      tokenVersion: true,
      lastLoginAt: true,
      deletedAt: true,
      permissions: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Se a conta estiver desativada, bloqueada, suspensa ou com soft delete, nega a sessão
  if (user.deletedAt !== null || user.status !== "ACTIVE") {
    return null;
  }

  // Se o tokenVersion não corresponder (sessão revogada remotamente), invalida
  if (
    typeof payload.tokenVersion === "number" &&
    payload.tokenVersion !== user.tokenVersion
  ) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Não autenticado.", 401);
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.role !== "MASTER_ADMIN") {
    throw new AuthError("Sem permissão de administrador.", 403);
  }

  return user;
}

export async function requireMasterAdmin() {
  const user = await requireAuth();

  if (user.role !== "MASTER_ADMIN") {
    throw new AuthError("Acesso restrito ao Administrador Master.", 403);
  }

  return user;
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function toSafeUser(user: Partial<SafeUser> & { id: string; nome: string; email: string; role: UserRole }): SafeUser {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    status: (user.status as UserStatus) || "ACTIVE",
    username: user.username || null,
    mustChangePassword: Boolean(user.mustChangePassword),
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt || new Date(),
    updatedAt: user.updatedAt || new Date(),
  };
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
