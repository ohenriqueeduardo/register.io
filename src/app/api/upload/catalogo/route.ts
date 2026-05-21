import { z } from "zod";
import { failure, handleApiError, success, validationFailure } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import {
  deleteCatalogoFromStorage,
  resolveCatalogoPathFromUrl,
  uploadCatalogoToStorage,
} from "@/lib/storage/catalogo";
import { validateCatalogFile } from "@/lib/validators/upload";

export const runtime = "nodejs";

const deleteCatalogoSchema = z
  .object({
    path: z.string().trim().min(1).optional(),
    url: z.string().trim().url().optional(),
  })
  .refine((data) => data.path || data.url, {
    message: "Informe o caminho ou URL do catálogo.",
    path: ["url"],
  });

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return failure("Arquivo não enviado.", 400);
    }

    const validationMessage = validateCatalogFile(file);

    if (validationMessage) {
      return failure(validationMessage, 400);
    }

    const uploaded = await uploadCatalogoToStorage(file, user.id);

    return success(uploaded, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = deleteCatalogoSchema.safeParse(body);

    if (!parsed.success) {
      return validationFailure(parsed.error);
    }

    const path =
      parsed.data.path ??
      (parsed.data.url ? resolveCatalogoPathFromUrl(parsed.data.url) : null);

    if (!path) {
      return failure("Caminho do catálogo inválido.", 400);
    }

    const isOwnPendingUpload = path.startsWith(`${user.id}/`);
    const isPersistedCatalog = parsed.data.url
      ? Boolean(
          await getPrisma().empresa.findFirst({
            where: { catalogoUrl: parsed.data.url },
            select: { id: true },
          }),
        )
      : false;

    if (!isOwnPendingUpload && !isPersistedCatalog) {
      return failure("Catálogo não encontrado ou sem permissão para remoção.", 403);
    }

    const removed = await deleteCatalogoFromStorage({ path });

    return success({ ok: true, removed });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return failure("JSON inválido.", 400);
    }

    return handleApiError(error);
  }
}
