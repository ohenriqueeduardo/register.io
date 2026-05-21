import bcrypt from "bcryptjs";
import {
  getSessionCookieOptions,
  signAuthToken,
  toSafeUser,
} from "@/lib/auth";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { getPrisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return failure("Credenciais inválidas.", 401);
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return failure("Credenciais inválidas.", 401);
    }

    const token = signAuthToken(user);
    const response = success(toSafeUser(user));

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
}
