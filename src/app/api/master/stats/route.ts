import { handleApiError, success } from "@/lib/api-response";
import { requireMasterAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

export const GET = withLogging(async function GET(request: Request) {
  try {
    await requireMasterAdmin();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const prisma = getPrisma();
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      blockedUsers,
      inactiveUsers,
      totalAdmins,
      newUsersInPeriod,
      totalEmpresas,
      totalCategorias,
      totalAuditLogs,
      recentUsers,
      recentAuditLogs,
      usersForGrowth,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.user.count({ where: { status: "SUSPENDED", deletedAt: null } }),
      prisma.user.count({ where: { status: "BLOCKED", deletedAt: null } }),
      prisma.user.count({ where: { status: "INACTIVE", deletedAt: null } }),
      prisma.user.count({
        where: { role: { in: ["ADMIN", "MASTER_ADMIN"] }, deletedAt: null },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate }, deletedAt: null },
      }),
      prisma.empresa.count(),
      prisma.categoria.count(),
      prisma.auditLog.count(),
      prisma.user.findMany({
        where: { deletedAt: null },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nome: true,
          email: true,
          username: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, nome: true, email: true, role: true } },
          targetUser: { select: { id: true, nome: true, email: true } },
        },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate }, deletedAt: null },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Agrupa o crescimento dia a dia para renderizar no gráfico
    const growthMap = new Map<string, number>();
    usersForGrowth.forEach((u) => {
      const day = u.createdAt.toISOString().slice(0, 10);
      growthMap.set(day, (growthMap.get(day) || 0) + 1);
    });

    const growthChart = Array.from(growthMap.entries()).map(([date, count]) => ({
      date: date.split("-").reverse().slice(0, 2).join("/"),
      novosUsuarios: count,
    }));

    return success({
      period,
      metrics: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        blockedUsers,
        inactiveUsers,
        totalAdmins,
        newUsersInPeriod,
        totalEmpresas,
        totalCategorias,
        totalAuditLogs,
      },
      growthChart,
      recentUsers,
      recentAuditLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
