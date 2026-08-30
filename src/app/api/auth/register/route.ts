import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { isPublicRegistrationEnabled, toSafeUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

export const POST = withLogging(async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    if (!isPublicRegistrationEnabled()) {
      return failure("Cadastro público desativado.", 403);
    }

    const prisma = getPrisma();
    const existingUsersCount = await prisma.user.count();

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      return failure("Já existe um usuário com este e-mail.", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        nome: parsed.data.nome,
        email: parsed.data.email,
        passwordHash,
        role: existingUsersCount === 0 ? "ADMIN" : "USER",
      },
    });

    return success(toSafeUser(user), 201);
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
});
