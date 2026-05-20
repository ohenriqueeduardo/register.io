import { Prisma } from "@prisma/client";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { deleteCatalogoFromStorage } from "@/lib/storage/catalogo";
import { cleanCNPJ } from "@/lib/validators/cnpj";
import { empresaUpdateSchema } from "@/lib/validators/empresa";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const empresaInclude = {
  categoria: true,
} satisfies Prisma.EmpresaInclude;

function cleanPhone(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.replace(/\D/g, "");
}

function hasOwn<T extends object>(object: T, key: keyof T) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function buildUpdateData(
  data: ReturnType<typeof empresaUpdateSchema.parse>,
  userId: string,
): Prisma.EmpresaUpdateInput {
  const updateData: Prisma.EmpresaUpdateInput = {
    updatedBy: { connect: { id: userId } },
  };

  if (hasOwn(data, "nomeEmpresa")) updateData.nomeEmpresa = data.nomeEmpresa;
  if (hasOwn(data, "cnpj") && data.cnpj) updateData.cnpj = cleanCNPJ(data.cnpj);
  if (hasOwn(data, "nomeRepresentante")) {
    updateData.nomeRepresentante = data.nomeRepresentante;
  }
  if (hasOwn(data, "telefoneRepresentante") && data.telefoneRepresentante) {
    updateData.telefoneRepresentante = cleanPhone(data.telefoneRepresentante) ?? "";
  }
  if (hasOwn(data, "telefoneEmpresa")) {
    updateData.telefoneEmpresa = cleanPhone(data.telefoneEmpresa);
  }
  if (hasOwn(data, "email1")) updateData.email1 = data.email1;
  if (hasOwn(data, "email2")) updateData.email2 = data.email2 ?? null;
  if (hasOwn(data, "trabalhaComApoioCotacoes")) {
    updateData.trabalhaComApoioCotacoes = data.trabalhaComApoioCotacoes;
  }
  if (hasOwn(data, "categoriaId") && data.categoriaId) {
    updateData.categoria = { connect: { id: data.categoriaId } };
  }
  if (hasOwn(data, "especialidades")) {
    updateData.especialidades = data.especialidades ?? [];
  }
  if (hasOwn(data, "catalogoUrl")) updateData.catalogoUrl = data.catalogoUrl ?? null;
  if (hasOwn(data, "catalogoNome")) updateData.catalogoNome = data.catalogoNome ?? null;
  if (hasOwn(data, "catalogoMimeType")) {
    updateData.catalogoMimeType = data.catalogoMimeType ?? null;
  }
  if (hasOwn(data, "catalogoTamanho")) {
    updateData.catalogoTamanho = data.catalogoTamanho ?? null;
  }

  return updateData;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAuth();

    const { id } = await context.params;
    const prisma = getPrisma();
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: empresaInclude,
    });

    if (!empresa) {
      return failure("Empresa nao encontrada.", 404);
    }

    return success(empresa);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = empresaUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const prisma = getPrisma();
    const currentEmpresa = await prisma.empresa.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!currentEmpresa) {
      return failure("Empresa nao encontrada.", 404);
    }

    if (parsed.data.cnpj) {
      const cnpj = cleanCNPJ(parsed.data.cnpj);
      const duplicateEmpresa = await prisma.empresa.findFirst({
        where: {
          cnpj,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateEmpresa) {
        return failure("Ja existe outra empresa cadastrada com este CNPJ.", 409);
      }
    }

    if (parsed.data.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parsed.data.categoriaId },
        select: { id: true },
      });

      if (!categoria) {
        return failure("Categoria nao encontrada.", 404);
      }
    }

    const empresa = await prisma.$transaction(async (tx) => {
      const updated = await tx.empresa.update({
        where: { id },
        data: buildUpdateData(parsed.data, user.id),
        include: empresaInclude,
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Empresa",
          entityId: updated.id,
          userId: user.id,
          metadata: { cnpj: updated.cnpj, nomeEmpresa: updated.nomeEmpresa },
        },
      });

      return updated;
    });

    return success(empresa);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON invalido.", 400);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("Ja existe outra empresa cadastrada com este CNPJ.", 409);
    }

    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAdmin();
    const { id } = await context.params;
    const prisma = getPrisma();
    const currentEmpresa = await prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        cnpj: true,
        nomeEmpresa: true,
        catalogoUrl: true,
      },
    });

    if (!currentEmpresa) {
      return failure("Empresa nao encontrada.", 404);
    }

    if (currentEmpresa.catalogoUrl) {
      await deleteCatalogoFromStorage({ url: currentEmpresa.catalogoUrl });
    }

    await prisma.$transaction(async (tx) => {
      await tx.empresa.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "Empresa",
          entityId: currentEmpresa.id,
          userId: user.id,
          metadata: {
            cnpj: currentEmpresa.cnpj,
            nomeEmpresa: currentEmpresa.nomeEmpresa,
          },
        },
      });
    });

    return success({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
