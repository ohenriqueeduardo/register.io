import bcrypt from "bcryptjs";
import {
  getSessionCookieOptions,
  signAuthToken,
  toSafeUser,
} from "@/lib/auth";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

export const POST = withLogging(async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const identifier = parsed.data.email.trim().toLowerCase();

    // Permite login por e-mail ou nome de usuário
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      return failure("Credenciais inválidas.", 401);
    }

    // Validação de exclusão / soft delete
    if (user.deletedAt) {
      return failure("Esta conta foi desativada ou removida.", 403);
    }

    // Validação de status da conta
    if (user.status === "BLOCKED") {
      return failure("Sua conta está bloqueada por segurança. Contate a administração.", 403);
    }

    if (user.status === "SUSPENDED") {
      return failure("Sua conta está temporariamente suspensa.", 403);
    }

    if (user.status === "INACTIVE") {
      return failure("Sua conta está inativa.", 403);
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return failure("Credenciais inválidas.", 401);
    }

    // Atualiza data do último login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAuthToken(updatedUser);
    const safeUser = toSafeUser(updatedUser);
    const response = success(safeUser);

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON inválido.", 400);
    }

    return handleApiError(error);
  }
});
