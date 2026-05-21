import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  getSessionCookieOptions,
  requireAuth,
  SESSION_COOKIE,
  signAuthToken,
  toSafeUser,
} from "@/lib/auth";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { accountDeleteSchema, accountUpdateSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const parsed = accountUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return failure("Usuário não encontrado.", 404);
    }

    if (parsed.data.action === "profile") {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { nome: parsed.data.nome },
      });

      return success(toSafeUser(updatedUser));
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return failure("Senha atual incorreta.", 401);
    }

    if (parsed.data.action === "email") {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: parsed.data.email,
          NOT: { id: user.id },
        },
        select: { id: true },
      });

      if (emailInUse) {
        return failure("Já existe um usuário com este e-mail.", 409);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { email: parsed.data.email },
      });

      const response = success(toSafeUser(updatedUser));
      response.cookies.set({
        ...getSessionCookieOptions(),
        value: signAuthToken(updatedUser),
      });

      return response;
    }

    const isSamePassword = await bcrypt.compare(
      parsed.data.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      return failure("A nova senha deve ser diferente da atual.", 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    const response = success(toSafeUser(updatedUser));
    response.cookies.set({
      ...getSessionCookieOptions(),
      value: signAuthToken(updatedUser),
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON inválido.", 400);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("Já existe um usuário com este e-mail.", 409);
    }

    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const parsed = accountDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return failure("Usuário não encontrado.", 404);
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return failure("Senha atual incorreta.", 401);
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return failure("Não é permitido apagar a última conta administradora.", 400);
      }
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = success({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON inválido.", 400);
    }

    return handleApiError(error);
  }
}
