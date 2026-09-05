import { z } from "zod";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateUserSchema = z.object({
  nome: z.string().trim().min(2).optional(),
  username: z.string().trim().min(3).nullable().optional(),
  email: z.string().trim().email().optional(),
  permissions: z.array(z.string()).optional(),
});

export const GET = withLogging(async function GET(_request: Request, context: RouteContext) {
  try {
    await requireMasterAdmin();
    const { id } = await context.params;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
        tokenVersion: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        empresasCriadas: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            nomeEmpresa: true,
            cnpj: true,
            createdAt: true,
          },
        },
        targetAuditLogs: {
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            createdAt: true,
            status: true,
            metadata: true,
            user: { select: { id: true, nome: true, email: true } },
          },
        },
      },
    });

    if (!user) {
      return failure("Usuário não encontrado.", 404);
    }

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
});

export const PATCH = withLogging(async function PATCH(request: Request, context: RouteContext) {
  try {
    const master = await requireMasterAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return failure("Usuário não encontrado.", 404);
    }

    // Se estiver alterando e-mail, checa duplicidade
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (emailInUse) {
        return failure("E-mail já está em uso por outro usuário.", 409);
      }
    }

    // Se estiver alterando username, checa duplicidade
    if (parsed.data.username && parsed.data.username !== existing.username) {
      const usernameInUse = await prisma.user.findUnique({
        where: { username: parsed.data.username },
      });
      if (usernameInUse) {
        return failure("Nome de usuário já está em uso.", 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        nome: parsed.data.nome ?? undefined,
        username: parsed.data.username !== undefined ? parsed.data.username : undefined,
        email: parsed.data.email ? parsed.data.email.toLowerCase() : undefined,
        permissions: parsed.data.permissions ?? undefined,
      },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATED",
        entity: "User",
        entityId: updated.id,
        userId: master.id,
        targetUserId: updated.id,
        status: "SUCCESS",
        metadata: { changes: parsed.data },
      },
    });

    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
});
