import { Prisma } from "@prisma/client";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { cleanCNPJ } from "@/lib/validators/cnpj";
import { empresaCreateSchema, empresaListQuerySchema } from "@/lib/validators/empresa";

export const runtime = "nodejs";

const empresaInclude = {
  categoria: true,
} satisfies Prisma.EmpresaInclude;

function cleanPhone(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.replace(/\D/g, "");
}

function buildOrderBy(
  sortBy: string,
  sortOrder: "asc" | "desc",
): Prisma.EmpresaOrderByWithRelationInput {
  if (sortBy === "categoria") {
    return { categoria: { nome: sortOrder } };
  }

  return { [sortBy]: sortOrder };
}

function buildWhere(query: ReturnType<typeof empresaListQuerySchema.parse>) {
  const search = query.search?.trim();
  const searchDigits = search ? cleanCNPJ(search) : "";
  const and: Prisma.EmpresaWhereInput[] = [];

  if (search) {
    and.push({
      OR: [
        { nomeEmpresa: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: searchDigits || search } },
        { nomeRepresentante: { contains: search, mode: "insensitive" } },
        { email1: { contains: search, mode: "insensitive" } },
        { email2: { contains: search, mode: "insensitive" } },
        { categoria: { nome: { contains: search, mode: "insensitive" } } },
        { especialidades: { has: search } },
      ],
    });
  }

  if (query.categoriaId) {
    and.push({ categoriaId: query.categoriaId });
  }

  if (typeof query.trabalhaComApoioCotacoes === "boolean") {
    and.push({ trabalhaComApoioCotacoes: query.trabalhaComApoioCotacoes });
  }

  if (query.especialidade) {
    and.push({ especialidades: { has: query.especialidade } });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function GET(request: Request) {
  try {
    await requireAuth();

    const url = new URL(request.url);
    const parsed = empresaListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const { page, limit, sortBy, sortOrder } = parsed.data;
    const where = buildWhere(parsed.data);
    const skip = (page - 1) * limit;
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const [items, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        include: empresaInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ]);

    return success({
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = empresaCreateSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const cnpj = cleanCNPJ(parsed.data.cnpj);
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { cnpj },
      select: { id: true },
    });

    if (existingEmpresa) {
      return failure("Ja existe uma empresa cadastrada com este CNPJ.", 409);
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: parsed.data.categoriaId },
      select: { id: true },
    });

    if (!categoria) {
      return failure("Categoria nao encontrada.", 404);
    }

    const empresa = await prisma.$transaction(async (tx) => {
      const created = await tx.empresa.create({
        data: {
          nomeEmpresa: parsed.data.nomeEmpresa,
          cnpj,
          nomeRepresentante: parsed.data.nomeRepresentante,
          telefoneRepresentante: cleanPhone(parsed.data.telefoneRepresentante) ?? "",
          telefoneEmpresa: cleanPhone(parsed.data.telefoneEmpresa),
          email1: parsed.data.email1,
          email2: parsed.data.email2 ?? null,
          trabalhaComApoioCotacoes: parsed.data.trabalhaComApoioCotacoes,
          categoriaId: parsed.data.categoriaId,
          especialidades: parsed.data.especialidades,
          catalogoUrl: parsed.data.catalogoUrl ?? null,
          catalogoNome: parsed.data.catalogoNome ?? null,
          catalogoMimeType: parsed.data.catalogoMimeType ?? null,
          catalogoTamanho: parsed.data.catalogoTamanho ?? null,
          createdById: user.id,
          updatedById: user.id,
        },
        include: empresaInclude,
      });

      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Empresa",
          entityId: created.id,
          userId: user.id,
          metadata: { cnpj: created.cnpj, nomeEmpresa: created.nomeEmpresa },
        },
      });

      return created;
    });

    return success(empresa, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON invalido.", 400);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("Ja existe uma empresa cadastrada com este CNPJ.", 409);
    }

    return handleApiError(error);
  }
}
