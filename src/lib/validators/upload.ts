export const MAX_CATALOG_SIZE = 10 * 1024 * 1024;

export const ALLOWED_CATALOG_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export function validateCatalogFile(file: File) {
  if (!ALLOWED_CATALOG_MIME_TYPES.includes(file.type as never)) {
    return "Tipo de arquivo não permitido.";
  }

  if (file.size > MAX_CATALOG_SIZE) {
    return "O catálogo deve ter no máximo 10MB.";
  }

  return null;
}
