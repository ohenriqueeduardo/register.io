import { z } from "zod";
import bcrypt from "bcryptjs";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";
import { UserRole, UserStatus } from "@prisma/client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const actionSchema = z.object({
  action: z.enum([
    "BLOCK",
    "UNBLOCK",
    "SUSPEND",
    "ACTIVATE",
    "DEACTIVATE",
    "CHANGE_ROLE",
    "REVOKE_SESSIONS",
    "FORCE_PASSWORD_RESET",
    "SOFT_DELETE",
    "RESTORE",
  ]),
  role: z.nativeEnum(UserRole).optional(),
  reason: z.string().optional(),
  newTemporaryPassword: z.string().min(6).optional(),
});

export const POST = withLogging(async function POST(request: Request, context: RouteContext) {
  try {
    const master = await requireMasterAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        tokenVersion: true,
      },
    });

    if (!targetUser) {
      return failure("Usuário não encontrado.", 404);
    }

    // Proteção de integridade: Impede auto-bloqueio ou auto-rebaixamento do Master principal
    if (targetUser.id === master.id && ["BLOCK", "SUSPEND", "DEACTIVATE", "CHANGE_ROLE", "SOFT_DELETE"].includes(parsed.data.action)) {
      return failure("Operação não permitida na própria conta do Master ativo.", 400);
    }

    let updateData: any = {};
    let auditAction = `USER_${parsed.data.action}`;
    let auditMetadata: any = { reason: parsed.data.reason || null };

    switch (parsed.data.action) {
      case "BLOCK":
        updateData = {
          status: UserStatus.BLOCKED,
          tokenVersion: targetUser.tokenVersion + 1, // Invalida sessões ativas
        };
        break;

      case "UNBLOCK":
        updateData = {
          status: UserStatus.ACTIVE,
        };
        break;

      case "SUSPEND":
        updateData = {
          status: UserStatus.SUSPENDED,
          tokenVersion: targetUser.tokenVersion + 1,
        };
        break;

      case "ACTIVATE":
        updateData = {
          status: UserStatus.ACTIVE,
          deletedAt: null,
        };
        break;

      case "DEACTIVATE":
        updateData = {
          status: UserStatus.INACTIVE,
          tokenVersion: targetUser.tokenVersion + 1,
        };
        break;

      case "REVOKE_SESSIONS":
        updateData = {
          tokenVersion: targetUser.tokenVersion + 1,
        };
        break;

      case "CHANGE_ROLE":
        if (!parsed.data.role) {
          return failure("Nova função é obrigatória para esta ação.", 400);
        }
        updateData = {
          role: parsed.data.role,
        };
        auditMetadata.newRole = parsed.data.role;
        break;

      case "FORCE_PASSWORD_RESET":
        if (parsed.data.newTemporaryPassword) {
          const hash = await bcrypt.hash(parsed.data.newTemporaryPassword, 12);
          updateData = {
            passwordHash: hash,
            mustChangePassword: true,
            tokenVersion: targetUser.tokenVersion + 1,
          };
        } else {
          updateData = {
            mustChangePassword: true,
            tokenVersion: targetUser.tokenVersion + 1,
          };
        }
        break;

      case "SOFT_DELETE":
        updateData = {
          status: UserStatus.INACTIVE,
          deletedAt: new Date(),
          tokenVersion: targetUser.tokenVersion + 1,
        };
        break;

      case "RESTORE":
        updateData = {
          status: UserStatus.ACTIVE,
          deletedAt: null,
        };
        break;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
        tokenVersion: true,
        deletedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: auditAction,
        entity: "User",
        entityId: updated.id,
        userId: master.id,
        targetUserId: updated.id,
        status: "SUCCESS",
        metadata: auditMetadata,
      },
    });

    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
});
