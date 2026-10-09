import { handleApiError, success } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

export const GET = withLogging(async function GET(request: Request) {
  try {
    await requireMasterAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const action = searchParams.get("action")?.trim();
    const entity = searchParams.get("entity")?.trim();
    const status = searchParams.get("status")?.trim();
    const q = searchParams.get("q")?.trim();

    const prisma = getPrisma();

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (status) {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { entity: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        { ipAddress: { contains: q } },
        { user: { nome: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { targetUser: { nome: { contains: q, mode: "insensitive" } } },
        { targetUser: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              role: true,
            },
          },
          targetUser: {
            select: {
              id: true,
              nome: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return success({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
