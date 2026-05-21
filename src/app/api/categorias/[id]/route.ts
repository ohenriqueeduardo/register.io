import { Prisma } from "@prisma/client";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validators/categoria";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAuth();

    const { id } = await context.params;
    const prisma = getPrisma();
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { empresas: true },
        },
      },
    });

    if (!categoria) {
      return failure("Categoria não encontrada.", 404);
    }

    return success(serializeCategoria(categoria));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const parsed = categoriaSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const categoria = await prisma.categoria.update({
      where: { id },
      data: { nome: parsed.data.nome },
      include: {
        _count: {
          select: { empresas: true },
        },
      },
    });

    return success(serializeCategoria(categoria));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON inválido.", 400);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return failure("Categoria não encontrada.", 404);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("Já existe uma categoria com este nome.", 409);
    }

    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const prisma = getPrisma();
    const empresasCount = await prisma.empresa.count({
      where: { categoriaId: id },
    });

    if (empresasCount > 0) {
      return failure(
        "Esta categoria não pode ser excluída pois possui empresas associadas.",
        409,
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return success({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return failure("Categoria não encontrada.", 404);
    }

    return handleApiError(error);
  }
}
