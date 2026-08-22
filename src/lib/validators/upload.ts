export const MAX_CATALOG_SIZE = 10 * 1024 * 1024;

export const ALLOWED_CATALOG_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".doc",
  ".docx",
];

export function validateCatalogFile(file: File) {
  // 1. Validação de tipo MIME
  if (!ALLOWED_CATALOG_MIME_TYPES.includes(file.type as never)) {
    return "Tipo de arquivo não permitido.";
  }

  // 2. Validação da extensão (evita MIME spoofing)
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );
  if (!hasAllowedExtension) {
    return "Extensão de arquivo não permitida.";
  }

  // 3. Validação do tamanho
  if (file.size > MAX_CATALOG_SIZE) {
    return "O catálogo deve ter no máximo 10MB.";
  }

  return null;
}
