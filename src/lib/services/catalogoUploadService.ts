import { ApiError, ApiResponse } from "@/lib/api-client";

export type CatalogoFileInfo = {
  nome: string;
  mimeType: string;
  tamanho: number;
  url: string;
  path?: string;
};

type CatalogoUploadResponse = {
  url: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
};

async function parseResponse<T>(response: Response) {
  const responseText = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.ok ? "Resposta invalida do servidor." : "Erro ao processar a requisicao.",
      response.status,
    );
  }

  if (!payload.success) {
    throw new ApiError(payload.message, response.status, payload.errors);
  }

  return payload.data;
}

export const catalogoUploadService = {
  async upload(file: File): Promise<CatalogoFileInfo> {
    const formData = new FormData();
    formData.append("file", file);

    const data = await parseResponse<CatalogoUploadResponse>(
      await fetch("/api/upload/catalogo", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      }),
    );

    return {
      nome: data.fileName,
      mimeType: data.mimeType,
      tamanho: data.size,
      url: data.url,
      path: data.path,
    };
  },

  async remove(input: { path?: string | null; url?: string | null }) {
    await parseResponse<{ ok: boolean; removed: boolean }>(
      await fetch("/api/upload/catalogo", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    );
  },
};
