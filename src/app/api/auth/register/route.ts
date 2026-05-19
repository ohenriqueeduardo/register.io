import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import {
  failure,
  handleApiError,
  success,
  validationFailure,
} from "@/lib/api-response";
import { registerSchema } from "@/lib/validators/auth";
import { toSafeUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return failure("E-mail ja cadastrado.", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        nome: parsed.data.nome,
        email: parsed.data.email,
        passwordHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(toSafeUser(user), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
