import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { User, UserRole } from "@prisma/client";
import { getPrisma } from "./prisma";

export const SESSION_COOKIE = "register_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type CurrentUser = Omit<User, "passwordHash">;
export type SafeUser = Pick<
  User,
  "id" | "nome" | "email" | "role" | "createdAt" | "updatedAt"
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

export function signAuthToken(user: Pick<User, "id" | "email" | "role">) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
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
  } catch {
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
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
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

  if (user.role !== "ADMIN") {
    throw new AuthError("Sem permissão.", 403);
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

export function toSafeUser(user: SafeUser): SafeUser {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
