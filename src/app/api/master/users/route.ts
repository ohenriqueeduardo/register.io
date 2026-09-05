import { z } from "zod";
import bcrypt from "bcryptjs";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";
import { UserRole, UserStatus } from "@prisma/client";

export const runtime = "nodejs";

const createUserSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  username: z.string().trim().min(3).optional(),
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  mustChangePassword: z.boolean().default(true),
});

export const GET = withLogging(async function GET(request: Request) {
  try {
    await requireMasterAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") as UserStatus | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const prisma = getPrisma();

    const whereClause: any = {
      deletedAt: null,
    };

    if (role && Object.values(UserRole).includes(role)) {
      whereClause.role = role;
    }

    if (status && Object.values(UserStatus).includes(status)) {
      whereClause.status = status;
    }

    if (q) {
      whereClause.OR = [
        { nome: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { id: { equals: q } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
          role: true,
          status: true,
          mustChangePassword: true,
          tokenVersion: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              empresasCriadas: true,
              auditLogs: true,
            },
          },
        },
      }),
    ]);

    return success({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withLogging(async function POST(request: Request) {
  try {
    const master = await requireMasterAdmin();
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();

    const existingEmail = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingEmail) {
      return failure("Já existe um usuário cadastrado com este e-mail.", 409);
    }

    if (parsed.data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: parsed.data.username },
        select: { id: true },
      });

      if (existingUsername) {
        return failure("Este nome de usuário já está em uso.", 409);
      }
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const newUser = await prisma.user.create({
      data: {
        nome: parsed.data.nome,
        username: parsed.data.username || null,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: parsed.data.role,
        status: parsed.data.status,
        mustChangePassword: parsed.data.mustChangePassword,
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
        action: "USER_CREATED",
        entity: "User",
        entityId: newUser.id,
        userId: master.id,
        targetUserId: newUser.id,
        status: "SUCCESS",
        metadata: { role: newUser.role, email: newUser.email },
      },
    });

    return success(newUser, 201);
  } catch (error) {
    return handleApiError(error);
  }
});
