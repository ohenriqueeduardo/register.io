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

export async function validateCatalogFileContent(file: File): Promise<string | null> {
  const syncValidation = validateCatalogFile(file);
  if (syncValidation) {
    return syncValidation;
  }

  try {
    const buffer = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (buffer.length < 4) {
      return "Arquivo corrompido ou vazio.";
    }

    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47; // .PNG
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff; // JPEG
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50; // RIFF....WEBP
    const isDoc = buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0; // DOC
    const isDocxOrZip = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04; // PK (DOCX)

    if (!isPdf && !isPng && !isJpeg && !isWebp && !isDoc && !isDocxOrZip) {
      return "O conteúdo do arquivo não corresponde a um formato válido permitido.";
    }

    return null;
  } catch {
    return "Falha ao validar integridade do arquivo.";
  }
}
