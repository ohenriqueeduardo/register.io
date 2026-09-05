import { z } from "zod";
import bcrypt from "bcryptjs";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";
import { UserRole, UserStatus } from "@prisma/client";

export const runtime = "nodejs";

const createAdminSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  username: z.string().trim().min(3).optional(),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(8, "A senha de administrador deve ter no mínimo 8 caracteres."),
  permissions: z.array(z.string()).default([]),
});

export const GET = withLogging(async function GET() {
  try {
    await requireMasterAdmin();
    const prisma = getPrisma();

    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.MASTER_ADMIN] },
        deletedAt: null,
      },
      orderBy: { role: "asc" },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            auditLogs: true,
            empresasCriadas: true,
          },
        },
      },
    });

    return success(admins);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withLogging(async function POST(request: Request) {
  try {
    const master = await requireMasterAdmin();
    const body = await request.json();
    const parsed = createAdminSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (existing) {
      return failure("Já existe um usuário cadastrado com este e-mail.", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        nome: parsed.data.nome,
        username: parsed.data.username || null,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
        permissions: parsed.data.permissions,
      },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "ADMIN_CREATED",
        entity: "User",
        entityId: newAdmin.id,
        userId: master.id,
        targetUserId: newAdmin.id,
        status: "SUCCESS",
        metadata: { role: newAdmin.role },
      },
    });

    return success(newAdmin, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
