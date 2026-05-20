export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  status?: "ATIVO" | "PENDENTE";
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Categoria {
  id: string;
  nome: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  empresaCount?: number;
}

export interface Empresa {
  id: string;
  nomeEmpresa: string;
  cnpj: string;
  nomeRepresentante: string;
  telefoneRepresentante: string;
  telefoneEmpresa?: string;
  email1: string;
  email2?: string;
  trabalhaComApoioCotacoes: boolean;
  categoriaId: string;
  categoria?: Categoria;
  especialidades: string[];
  catalogoNome?: string;
  catalogoUrl?: string;
  catalogoMimeType?: string;
  catalogoTamanho?: number;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface DashboardStats {
  totalEmpresas: number;
  totalComApoioCotacoes: number;
  totalSemApoioCotacoes: number;
  trabalhaComApoio: number;
  naoTrabalhaComApoio: number;
  totalCatalogos: number;
  empresasPorCategoria: { nome: string; quantidade: number }[];
  ultimasEmpresas: Empresa[];
  ultimasEmpresasCadastradas: Empresa[];
}
