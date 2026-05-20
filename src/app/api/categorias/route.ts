import { Prisma } from "@prisma/client";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validators/categoria";

export const runtime = "nodejs";

function serializeCategoria<
  T extends {
    _count?: { empresas: number };
  },
>(categoria: T) {
  const { _count, ...data } = categoria;

  return {
    ...data,
    empresaCount: _count?.empresas ?? 0,
  };
}

export async function GET() {
  try {
    await requireAuth();

    const prisma = getPrisma();
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { empresas: true },
        },
      },
    });

    return success(categorias.map(serializeCategoria));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = categoriaSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const categoria = await prisma.categoria.create({
      data: { nome: parsed.data.nome },
      include: {
        _count: {
          select: { empresas: true },
        },
      },
    });

    return success(serializeCategoria(categoria), 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON invalido.", 400);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("Ja existe uma categoria com este nome.", 409);
    }

    return handleApiError(error);
  }
}
