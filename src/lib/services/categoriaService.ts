import { apiRequest, ApiError } from "@/lib/api-client";
import { Categoria } from "@/types";

export const categoriaService = {
  async list(): Promise<Categoria[]> {
    return apiRequest<Categoria[]>("/api/categorias");
  },

  async getById(id: string): Promise<Categoria | null> {
    try {
      return await apiRequest<Categoria>(`/api/categorias/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async listWithCompanyCount(): Promise<(Categoria & { empresaCount: number })[]> {
    const categorias = await this.list();

    return categorias.map((categoria) => ({
      ...categoria,
      empresaCount: categoria.empresaCount ?? 0,
    }));
  },

  async create(nome: string): Promise<Categoria> {
    return apiRequest<Categoria>("/api/categorias", {
      method: "POST",
      body: JSON.stringify({ nome }),
    });
  },

  async update(id: string, nome: string): Promise<Categoria> {
    return apiRequest<Categoria>(`/api/categorias/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiRequest<{ ok: boolean }>(`/api/categorias/${id}`, {
      method: "DELETE",
    });

    return true;
  },
};
