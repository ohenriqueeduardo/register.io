import { handleApiError, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();

    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(
      users.map((user) => ({
        ...user,
        status: user.status === "ACTIVE" ? ("ATIVO" as const) : ("PENDENTE" as const),
      })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
