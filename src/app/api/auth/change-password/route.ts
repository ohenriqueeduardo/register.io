import { z } from "zod";
import bcrypt from "bcryptjs";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { getSessionCookieOptions, requireAuth, signAuthToken, toSafeUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres."),
});

export const POST = withLogging(async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, passwordHash: true, mustChangePassword: true, role: true, email: true, tokenVersion: true },
    });

    if (!dbUser) {
      return failure("Usuário não encontrado.", 404);
    }

    // Se não for primeiro acesso obrigatório, exige confirmação da senha atual
    if (!dbUser.mustChangePassword) {
      if (!parsed.data.currentPassword) {
        return failure("Informe a senha atual para alteração.", 400);
      }

      const passwordMatches = await bcrypt.compare(
        parsed.data.currentPassword,
        dbUser.passwordHash,
      );

      if (!passwordMatches) {
        return failure("Senha atual incorreta.", 400);
      }
    }

    const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        tokenVersion: dbUser.tokenVersion + 1,
      },
    });

    // Registra no log de auditoria
    await prisma.auditLog.create({
      data: {
        action: "PASSWORD_CHANGED",
        entity: "User",
        entityId: updatedUser.id,
        userId: updatedUser.id,
        status: "SUCCESS",
        metadata: { reason: dbUser.mustChangePassword ? "FIRST_LOGIN" : "USER_REQUEST" },
      },
    });

    const token = signAuthToken(updatedUser);
    const safe = toSafeUser(updatedUser);
    const response = success(safe);

    response.cookies.set({
      ...getSessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
});
