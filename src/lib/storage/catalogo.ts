import { randomUUID } from "crypto";
import { getSupabaseAdmin, getSupabaseBucket } from "./supabase";

export type UploadedCatalogo = {
  url: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
};

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return sanitized || "catalogo";
}

export function resolveCatalogoPathFromUrl(url: string) {
  const bucket = getSupabaseBucket();

  try {
    const parsedUrl = new URL(url);
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const authenticatedMarker = `/storage/v1/object/authenticated/${bucket}/`;
    const signedMarker = `/storage/v1/object/sign/${bucket}/`;
    const marker =
      [publicMarker, authenticatedMarker, signedMarker].find((item) =>
        parsedUrl.pathname.includes(item),
      ) ?? "";

    if (!marker) {
      return null;
    }

    const encodedPath = parsedUrl.pathname.split(marker)[1];
    return encodedPath ? decodeURIComponent(encodedPath) : null;
  } catch {
    return null;
  }
}

export async function uploadCatalogoToStorage(file: File, userId: string) {
  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucket();
  const safeName = sanitizeFileName(file.name);
  const datePrefix = new Date().toISOString().slice(0, 10);
  const filePath = `${userId}/${datePrefix}/${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Falha ao enviar catalogo: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  } satisfies UploadedCatalogo;
}

export async function deleteCatalogoFromStorage(input: {
  path?: string | null;
  url?: string | null;
}) {
  const path = input.path ?? (input.url ? resolveCatalogoPathFromUrl(input.url) : null);

  if (!path) {
    return false;
  }

  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucket();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Falha ao remover catalogo: ${error.message}`);
  }

  return true;
}
