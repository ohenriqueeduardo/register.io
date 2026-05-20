import { handleApiError, success } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth();

    const prisma = getPrisma();
    const [
      totalEmpresas,
      totalComApoioCotacoes,
      totalSemApoioCotacoes,
      totalCatalogos,
      categorias,
      ultimasEmpresas,
    ] = await Promise.all([
      prisma.empresa.count(),
      prisma.empresa.count({ where: { trabalhaComApoioCotacoes: true } }),
      prisma.empresa.count({ where: { trabalhaComApoioCotacoes: false } }),
      prisma.empresa.count({ where: { catalogoUrl: { not: null } } }),
      prisma.categoria.findMany({
        orderBy: { nome: "asc" },
        include: {
          _count: {
            select: { empresas: true },
          },
        },
      }),
      prisma.empresa.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { categoria: true },
      }),
    ]);

    const empresasPorCategoria = categorias
      .map((categoria) => ({
        nome: categoria.nome,
        quantidade: categoria._count.empresas,
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    return success({
      totalEmpresas,
      totalComApoioCotacoes,
      totalSemApoioCotacoes,
      totalCatalogos,
      empresasPorCategoria,
      ultimasEmpresasCadastradas: ultimasEmpresas,
      trabalhaComApoio: totalComApoioCotacoes,
      naoTrabalhaComApoio: totalSemApoioCotacoes,
      ultimasEmpresas,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
