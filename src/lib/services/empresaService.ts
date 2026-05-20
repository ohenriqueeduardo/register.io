import { apiRequest, ApiError } from "@/lib/api-client";
import { Empresa, PaginatedResponse } from "@/types";

export type EmpresaMutationData = {
  nomeEmpresa: string;
  cnpj: string;
  nomeRepresentante: string;
  telefoneRepresentante: string;
  telefoneEmpresa?: string | null;
  email1: string;
  email2?: string | null;
  trabalhaComApoioCotacoes: boolean;
  categoriaId: string;
  especialidades: string[];
  catalogoUrl?: string | null;
  catalogoNome?: string | null;
  catalogoMimeType?: string | null;
  catalogoTamanho?: number | null;
};

export type EmpresaListParams = {
  search?: string;
  categoriaId?: string;
  trabalhaComApoioCotacoes?: boolean;
  especialidade?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | "nomeEmpresa"
    | "cnpj"
    | "nomeRepresentante"
    | "email1"
    | "categoria"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
};

function buildQueryString(params: EmpresaListParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const empresaService = {
  async listPaginated(
    params: EmpresaListParams = {},
  ): Promise<PaginatedResponse<Empresa>> {
    return apiRequest<PaginatedResponse<Empresa>>(
      `/api/empresas${buildQueryString(params)}`,
    );
  },

  async list(params: EmpresaListParams = {}): Promise<Empresa[]> {
    const response = await this.listPaginated(params);
    return response.items;
  },

  async getById(id: string): Promise<Empresa | null> {
    try {
      return await apiRequest<Empresa>(`/api/empresas/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async create(data: EmpresaMutationData): Promise<Empresa> {
    return apiRequest<Empresa>("/api/empresas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createBatch(dataList: EmpresaMutationData[]): Promise<Empresa[]> {
    const created: Empresa[] = [];

    for (const data of dataList) {
      try {
        created.push(await this.create(data));
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          continue;
        }

        throw error;
      }
    }

    return created;
  },

  async update(id: string, data: Partial<EmpresaMutationData>): Promise<Empresa> {
    return apiRequest<Empresa>(`/api/empresas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiRequest<{ ok: boolean }>(`/api/empresas/${id}`, {
      method: "DELETE",
    });

    return true;
  },
};
