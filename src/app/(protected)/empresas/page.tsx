"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  Building,
  Upload,
  Download,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api-client";
import { empresaService, EmpresaMutationData } from "@/lib/services/empresaService";
import { categoriaService } from "@/lib/services/categoriaService";
import { isValidCNPJ } from "@/lib/validators/cnpj";
import { Empresa, Categoria, PaginatedMeta } from "@/types";
import { formatCNPJ } from "@/utils/masks";
import { showSuccess, showError, showWarning } from "@/utils/toast";

type ImportedRow = Record<string, unknown>;

const normalizeImportKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const splitImportList = (value: string) =>
  value
    .split(/[|,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const extractFirstUrl = (value: string) =>
  value.match(/https?:\/\/[^\s,;]+/i)?.[0] ?? "";

const extractFirstEmail = (value: string) =>
  value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";

const extractFirstPhone = (value: string) => {
  const match = value.match(/(\d{2})\D*(\d{4,5})\D*(\d{4})/);
  return match ? `${match[1]}${match[2]}${match[3]}` : "";
};

const stripImportedUrlFromText = (value: string, url: string) =>
  value
    .replace(url, "")
    .replace(/^[\s\-:|]+|[\s\-:|]+$/g, "")
    .trim();

const getCatalogDisplayNameFromUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const lastSegment = decodeURIComponent(
      parsedUrl.pathname.split("/").filter(Boolean).pop() ?? "",
    )
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();

    if (
      lastSegment &&
      !["view", "file", "open", "download", "preview"].includes(
        normalizeImportKey(lastSegment),
      )
    ) {
      return lastSegment;
    }

    return `Catálogo externo - ${parsedUrl.hostname.replace(/^www\./, "")}`;
  } catch {
    return "Catálogo externo";
  }
};

const getImportedValue = (row: ImportedRow, keys: string[]) => {
  const normalizedKeys = keys.map(normalizeImportKey);
  const match = Object.keys(row).find((rowKey) =>
    normalizedKeys.includes(normalizeImportKey(rowKey)),
  );

  return match ? String(row[match] ?? "").trim() : "";
};

const resolveImportedCatalogName = (row: ImportedRow, catalogoRaw: string, catalogoUrl: string) => {
  if (!catalogoUrl) {
    return null;
  }

  const inlineLabel = stripImportedUrlFromText(catalogoRaw, catalogoUrl);
  if (inlineLabel) {
    return inlineLabel;
  }

  const metadataLabel = getImportedValue(row, [
    "assunto",
    "assuntodolink",
    "assuntodocatalogo",
    "tema",
    "titulo",
    "titulodolink",
    "titulodocatalogo",
    "descricao",
    "descricaodolink",
    "descricaodocatalogo",
    "nomecatalogo",
    "catalogonome",
    "nomedolink",
    "sobreoque",
  ]);

  if (metadataLabel) {
    return metadataLabel;
  }

  return getCatalogDisplayNameFromUrl(catalogoUrl);
};

const findCategoria = (catList: Categoria[], value: string) => {
  const normalizedValue = normalizeImportKey(value);

  return catList.find(
    (categoria) =>
      categoria.id === value || normalizeImportKey(categoria.nome) === normalizedValue,
  );
};

const isPositiveImportValue = (value: string) =>
  ["sim", "yes", "true", "1"].includes(normalizeImportKey(value));

const getImportedCategories = (row: ImportedRow) =>
  splitImportList(
    getImportedValue(row, ["categoriaid", "categoria", "segmento", "category"]),
  );

const formatImportApiError = (error: ApiError) => {
  const details = error.errors
    ? Object.entries(error.errors)
        .slice(0, 3)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join(" | ")
    : "";

  return details ? `${error.message} ${details}` : error.message;
};

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;
  const [pagination, setPagination] = useState<PaginatedMeta>({
    total: 0,
    page: 1,
    limit: itemsPerPage,
    totalPages: 1,
  });

  // States de filtros
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedApoio, setSelectedApoio] = useState("all"); // all, sim, nao

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // States de exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  // Ref para upload de planilha (CSV/Excel)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEmpresas = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await empresaService.listPaginated({
        search,
        categoriaId: selectedCat === "all" ? undefined : selectedCat,
        trabalhaComApoioCotacoes:
          selectedApoio === "all" ? undefined : selectedApoio === "sim",
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setEmpresas(response.items);
      setPagination(response.meta);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao carregar empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedApoio, selectedCat]);

  useEffect(() => {
    async function loadCategorias() {
      try {
        const catList = await categoriaService.list();
        setCategorias(catList);
      } catch (err) {
        showError("Erro ao carregar categorias.");
      }
    }

    loadCategorias();
  }, []);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  // Handler de Exclusão
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const success = await empresaService.delete(deleteId);
      if (success) {
        setSelectedEmpresaIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteId);
          return next;
        });
        await loadEmpresas();
        showSuccess("Empresa excluída com sucesso.");
      } else {
        showError("Erro ao tentar excluir a empresa.");
      }
    } catch (err) {
      showError("Ocorreu um erro ao excluir a empresa.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const idsToDelete = Array.from(selectedEmpresaIds);
    if (idsToDelete.length === 0) return;

    setIsBulkDeleting(true);
    let deletedCount = 0;
    const failedIds: string[] = [];

    try {
      for (const id of idsToDelete) {
        try {
          await empresaService.delete(id);
          deletedCount++;
        } catch {
          failedIds.push(id);
        }
      }

      setSelectedEmpresaIds(new Set(failedIds));
      await loadEmpresas();

      if (deletedCount > 0) {
        showSuccess(`${deletedCount} empresa(s) excluída(s) com sucesso.`);
      }

      if (failedIds.length > 0) {
        showWarning(`${failedIds.length} empresa(s) não puderam ser excluída(s).`);
      }
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteOpen(false);
    }
  };

  // Helper para parser robusto de CSV
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const separator = headerLine.includes(";") ? ";" : ",";
    const headers = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ""));

    const rows: ImportedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(separator);
      const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: ImportedRow = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || "";
      });
      rows.push(rowObj);
    }
    return rows;
  };

  // Mapeamento dinâmico de cabeçalhos portugueses e ingleses
  const mapRowToEmpresa = (row: ImportedRow, catList: Categoria[]): EmpresaMutationData => {
    const getVal = (keys: string[]) => getImportedValue(row, keys);

    const nomeEmpresa = getVal(["cat", "nomeempresa", "nome", "empresa", "nomedaempresa", "companyname"]);
    const cnpj = getVal(["cnpjdaempresa", "cnpj", "documento"]);
    const nomeRepresentante = getVal(["nomerepresentante", "representante", "nomedorepresentante", "representative"]);
    const telefoneRepresentante = extractFirstPhone(
      getVal(["telefonerepresentante", "telefone", "telefonedorepresentante", "representativephone"]),
    );
    const telefoneEmpresa = extractFirstPhone(
      getVal(["telefonedaempresalicitacoescotacoes", "telefoneempresa", "telefonedaempresa", "companyphone"]),
    );
    const email1 = extractFirstEmail(
      getVal(["email1", "email", "emailprincipal", "emailrepresentative"]),
    );
    const email2 = extractFirstEmail(getVal(["email2", "emailsecundario"]));
    
    const trabalhaApoioRaw = getVal(["trabalhacomaplataformaapoiocotacoes", "trabalhacomapoiocotacoes", "apoiocotacoes", "trabalhaapoiocotacoes", "apoio", "supportquotes"]);
    const trabalhaComApoioCotacoes = isPositiveImportValue(trabalhaApoioRaw);

    const categoryNames = getImportedCategories(row);
    const categoriaRaw = categoryNames[0] ?? getVal(["categoriaid", "categoria", "segmento", "category"]);
    let categoriaId = "";
    
    const matchCat = findCategoria(catList, categoriaRaw);
    if (matchCat) {
      categoriaId = matchCat.id;
    } else if (catList.length > 0) {
      categoriaId = catList[0].id;
    }

    const espRaw = getVal(["nosinformesuasespecialidades", "especialidades", "especialidade", "tags", "specialties"]);
    const especialidades = Array.from(
      new Set([...categoryNames.slice(1), ...splitImportList(espRaw)]),
    );
    const catalogoRaw = getVal([
      "anexarcatalogodeprodutosfornecidos",
      "catalogo",
      "catalogourl",
      "urlcatalogo",
    ]);
    const catalogoUrl = extractFirstUrl(catalogoRaw);
    const catalogoNome = resolveImportedCatalogName(row, catalogoRaw, catalogoUrl);

    return {
      nomeEmpresa: nomeEmpresa || "Empresa Importada",
      cnpj: cnpj.replace(/\D/g, ""),
      nomeRepresentante: nomeRepresentante || "Representante",
      telefoneRepresentante: telefoneRepresentante || "(11) 99999-9999",
      telefoneEmpresa: telefoneEmpresa || undefined,
      email1: email1 || "importado@empresa.com",
      email2: email2 || undefined,
      trabalhaComApoioCotacoes,
      categoriaId,
      especialidades,
      catalogoUrl: catalogoUrl || null,
      catalogoNome: catalogoNome || null,
    };
  };

  // Ação de Importar Planilha (Excel ou CSV)
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerFileName = file.name.toLowerCase();
    const isExcel = lowerFileName.endsWith(".xlsx");
    const isCsv = lowerFileName.endsWith(".csv");

    if (!isExcel && !isCsv) {
      showError("Formato não suportado. Envie um arquivo .xlsx ou .csv.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let parsedRows: ImportedRow[] = [];

        if (isExcel) {
          const { readSheet } = await import("read-excel-file/browser");
          const rows = await readSheet(event.target?.result as ArrayBuffer);
          const [headers = [], ...dataRows] = rows;

          parsedRows = dataRows.map((row) => {
            const rowObj: ImportedRow = {};

            headers.forEach((header, index) => {
              const key = String(header ?? "").trim();

              if (key) {
                rowObj[key] = row[index] ?? "";
              }
            });

            return rowObj;
          });
        } else {
          const text = event.target?.result as string;
          if (!text) {
            showError("Erro ao ler o arquivo CSV.");
            return;
          }
          parsedRows = parseCSV(text);
        }

        if (!parsedRows || parsedRows.length === 0) {
          showError("O arquivo selecionado está vazio ou em formato inválido.");
          return;
        }

        let importedCount = 0;
        let duplicateCount = 0;
        let newCatsCount = 0;
        let invalidCnpjCount = 0;
        let invalidCnpjImportedCount = 0;
        let failedCatsCount = 0;

        const existingEmpresas: Empresa[] = [];
        let existingPage = 1;
        let totalExistingPages = 1;

        do {
          const response = await empresaService.listPaginated({
            page: existingPage,
            limit: 100,
          });
          existingEmpresas.push(...response.items);
          totalExistingPages = response.meta.totalPages;
          existingPage++;
        } while (existingPage <= totalExistingPages);

        const existingCnpjs = new Set(
          existingEmpresas.map((empresa) => empresa.cnpj.replace(/\D/g, "")),
        );
        const batchCnpjs = new Set<string>();
        const activeCats = [...categorias];
        const batchItemsToCreate: EmpresaMutationData[] = [];

        // Processa as linhas da planilha de forma otimizada
        for (const row of parsedRows) {
          // 1. Identificar e criar categoria dinamicamente se não existir
          const categoryNames = getImportedCategories(row);
          const categoriaRaw = categoryNames[0] ?? "";
          const importedCnpj = getImportedValue(row, ["cnpjdaempresa", "cnpj", "documento"]).replace(/\D/g, "");

          if (!importedCnpj || importedCnpj.length !== 14) {
            invalidCnpjCount++;
            continue;
          }

          const isMathValid = isValidCNPJ(importedCnpj);
          if (!isMathValid) {
            invalidCnpjImportedCount++;
          }

          if (existingCnpjs.has(importedCnpj) || batchCnpjs.has(importedCnpj)) {
            duplicateCount++;
            continue;
          }

          if (categoriaRaw) {
            const catExists = findCategoria(activeCats, categoriaRaw);
            if (!catExists) {
              try {
                const newCat = await categoriaService.create(categoriaRaw);
                activeCats.push(newCat);
                newCatsCount++;
              } catch {
                failedCatsCount++;
                continue;
              }
            }
          }

          // 2. Mapeamento da linha para o modelo de empresa com a lista de categorias atualizada
          const empData = mapRowToEmpresa(row, activeCats);
          
          if (!empData.nomeEmpresa || !empData.cnpj) {
            continue;
          }

          // 3. Checagem contra duplicados já carregados e na lista temporária de lote
          batchItemsToCreate.push(empData);
          batchCnpjs.add(empData.cnpj);
        }

        // 4. Executa a inserção agregada em lote (Batch Insert)
        if (batchItemsToCreate.length > 0) {
          const created = await empresaService.createBatch(batchItemsToCreate);
          importedCount = created.length;

          // Atualizar os estados locais na tela
          await loadEmpresas();

          if (newCatsCount > 0) {
            const updatedCats = await categoriaService.list();
            setCategorias(updatedCats);
          }
        }

        // 5. Feedback detalhado com estatísticas da operação
        if (importedCount > 0) {
          showSuccess(
            `${importedCount} empresa(s) importada(s) com sucesso!${
              invalidCnpjImportedCount > 0 ? ` (${invalidCnpjImportedCount} com CNPJ sob análise de integridade)` : ""
            }${
              newCatsCount > 0 ? ` (${newCatsCount} nova(s) categoria(s) criada(s))` : ""
            }`
          );
        }

        if (duplicateCount > 0) {
          showWarning(`${duplicateCount} empresa(s) ignorada(s) por CNPJ já cadastrado.`);
        }

        if (invalidCnpjCount > 0) {
          showWarning(`${invalidCnpjCount} linha(s) ignorada(s) por CNPJ inválido.`);
        }

        if (failedCatsCount > 0) {
          showWarning(`${failedCatsCount} linha(s) ignorada(s) por categoria sem permissão de criação.`);
        }

        if (
          importedCount === 0 &&
          duplicateCount === 0 &&
          invalidCnpjCount === 0 &&
          failedCatsCount === 0
        ) {
          showError("Nenhuma empresa pôde ser importada. Verifique as colunas do arquivo.");
        }
      } catch (err) {
        if (err instanceof ApiError) {
          showError(formatImportApiError(err));
        } else {
          showError("Erro de processamento do arquivo de planilha.");
          console.error(err);
        }
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Ação de Exportar CSV
  const handleExportCSV = () => {
    if (empresas.length === 0) {
      showError("Não há empresas na lista para exportar.");
      return;
    }

    const headers = [
      "Nome da Empresa",
      "CNPJ",
      "Nome do Representante",
      "Telefone do Representante",
      "E-mail Principal",
      "Apoio Cotacoes",
      "Categoria",
      "Especialidades"
    ];

    const rows = empresas.map(emp => {
      const categoryName =
        emp.categoria?.nome ||
        categorias.find(c => c.id === emp.categoriaId)?.nome ||
        "Não definido";
      return [
        `"${emp.nomeEmpresa.replace(/"/g, '""')}"`,
        `"${emp.cnpj}"`,
        `"${emp.nomeRepresentante.replace(/"/g, '""')}"`,
        `"${emp.telefoneRepresentante}"`,
        `"${emp.email1}"`,
        emp.trabalhaComApoioCotacoes ? "Sim" : "Não",
        `"${categoryName}"`,
        `"${emp.especialidades.join(" | ")}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `empresas_exportadas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Exportação concluída com sucesso!");
  };

  // Refino local da pagina carregada; a busca principal vem da API.
  const filteredEmpresas = empresas.filter((emp) => {
    const term = search.toLowerCase().trim();
    const matchSearch =
      emp.nomeEmpresa.toLowerCase().includes(term) ||
      emp.cnpj.includes(term) ||
      emp.nomeRepresentante.toLowerCase().includes(term) ||
      emp.email1.toLowerCase().includes(term) ||
      (emp.email2 ?? "").toLowerCase().includes(term) ||
      (emp.categoria?.nome ?? categorias.find((cat) => cat.id === emp.categoriaId)?.nome ?? "")
        .toLowerCase()
        .includes(term) ||
      emp.especialidades.some((especialidade) =>
        especialidade.toLowerCase().includes(term),
      );

    const matchCategory = selectedCat === "all" || emp.categoriaId === selectedCat;

    const matchApoio =
      selectedApoio === "all" ||
      (selectedApoio === "sim" && emp.trabalhaComApoioCotacoes) ||
      (selectedApoio === "nao" && !emp.trabalhaComApoioCotacoes);

    return matchSearch && matchCategory && matchApoio;
  });

  // Paginação
  const totalPages = pagination.totalPages;
  const paginatedEmpresas = filteredEmpresas;
  const paginationItems = React.useMemo<(number | string)[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: (number | string)[] = [1];
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push("start-ellipsis");
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    if (endPage < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const visibleEmpresaIds = React.useMemo(
    () => paginatedEmpresas.map((emp) => emp.id),
    [paginatedEmpresas],
  );
  const selectedCount = selectedEmpresaIds.size;
  const selectedVisibleCount = visibleEmpresaIds.filter((id) =>
    selectedEmpresaIds.has(id),
  ).length;
  const areAllVisibleSelected =
    visibleEmpresaIds.length > 0 && selectedVisibleCount === visibleEmpresaIds.length;
  const hasVisibleSelection = selectedVisibleCount > 0;

  const handleToggleEmpresaSelection = (
    empresaId: string,
    checked: boolean | "indeterminate",
  ) => {
    setSelectedEmpresaIds((prev) => {
      const next = new Set(prev);

      if (checked === true) {
        next.add(empresaId);
      } else {
        next.delete(empresaId);
      }

      return next;
    });
  };

  const handleToggleAllVisible = (checked: boolean | "indeterminate") => {
    setSelectedEmpresaIds((prev) => {
      const next = new Set(prev);

      visibleEmpresaIds.forEach((id) => {
        if (checked === true) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });

      return next;
    });
  };

  const handleSelectAllEmpresas = async () => {
    setIsSelectingAll(true);

    try {
      const allEmpresaIds: string[] = [];
      let page = 1;
      let totalPagesToLoad = 1;

      do {
        const response = await empresaService.listPaginated({
          page,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        allEmpresaIds.push(...response.items.map((emp) => emp.id));
        totalPagesToLoad = response.meta.totalPages;
        page++;
      } while (page <= totalPagesToLoad);

      setSelectedEmpresaIds(new Set(allEmpresaIds));
      showSuccess(`${allEmpresaIds.length} empresa(s) selecionada(s).`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao selecionar todas as empresas.");
    } finally {
      setIsSelectingAll(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedEmpresaIds(new Set());
  };

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCat, selectedApoio]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hidden File Input para Planilha (CSV/Excel) */}
      <input
        type="file"
        accept=".csv,.xlsx"
        ref={fileInputRef}
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Empresas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerenciamento e controle de empresas e catálogos parceiros.
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Planilha Import (Excel/CSV) */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="rounded-xl h-11 gap-2 border-slate-200 dark:border-slate-800 font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform duration-100"
          >
            <Upload size={16} className="text-primary" />
            Importar Planilha
          </Button>

          {/* CSV Export */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl h-11 gap-2 border-slate-200 dark:border-slate-800 font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform duration-100"
          >
            <Download size={16} className="text-slate-500" />
            Exportar CSV
          </Button>

          {/* New register */}
          <Link href="/empresas/nova">
            <Button className="rounded-xl h-11 gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
              <Plus size={18} />
              Cadastrar Empresa
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <Filter size={16} className="text-primary" />
          <span>Filtros Avançados</span>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Busca Textual */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <Input
              type="text"
              placeholder="Buscar por Empresa, CNPJ, Representante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Categoria Select */}
          <Select value={selectedCat} onValueChange={setSelectedCat}>
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Apoio Cotações Select */}
          <Select value={selectedApoio} onValueChange={setSelectedApoio}>
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary">
              <SelectValue placeholder="Apoio Cotações: Todos" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Apoio Cotações: Todos</SelectItem>
              <SelectItem value="sim">Trabalha (Sim)</SelectItem>
              <SelectItem value="nao">Não Trabalha (Não)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List / Table Area */}
      {isLoading ? (
        <LoadingState variant="table" message="Buscando lista de empresas..." />
      ) : filteredEmpresas.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa encontrada"
          description="Tente redefinir seus filtros de busca ou cadastre uma nova empresa parceira."
          actionText="Cadastrar Empresa"
          onAction={() => (window.location.href = "/empresas/nova")}
          icon={<Building className="h-8 w-8 stroke-[1.5]" />}
        />
      ) : (
        <div className="space-y-4">
          <div
            className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
              selectedCount > 0
                ? "grid-rows-[1fr] opacity-100 translate-y-0"
                : "grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                    Seleção de empresas
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCount} selecionada(s). Selecione linhas para excluir em lote.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllEmpresas}
                    disabled={isSelectingAll}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    <CheckSquare size={16} />
                    {isSelectingAll ? "Selecionando..." : "Selecionar todas"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                    className="rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteOpen(true)}
                    className="rounded-xl"
                  >
                    <Trash2 size={16} />
                    Excluir selecionadas
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-2 font-bold w-[4%] min-w-[56px]">
                      <Checkbox
                        checked={areAllVisibleSelected || (hasVisibleSelection ? "indeterminate" : false)}
                        onCheckedChange={handleToggleAllVisible}
                        aria-label="Selecionar todas as empresas visíveis"
                        className="h-5 w-5 rounded-md"
                      />
                    </th>
                    <th scope="col" className="py-4 px-6 font-bold w-[22%] min-w-[150px]">Empresa</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[15%] min-w-[140px]">CNPJ</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[15%] min-w-[120px]">Representante</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[20%] min-w-[160px]">E-mail Principal</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[13%] min-w-[110px]">Categoria</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[7%] min-w-[70px]">Apoio</th>
                    <th scope="col" className="py-4 px-6 font-bold w-[8%] min-w-[100px] text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedEmpresas.map((emp) => {
                    const categoryName =
                      emp.categoria?.nome ||
                      categorias.find((c) => c.id === emp.categoriaId)?.nome ||
                      "Não definido";

                    return (
                      <tr
                        key={emp.id}
                        className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20 ${
                          selectedEmpresaIds.has(emp.id)
                            ? "bg-primary/5 dark:bg-primary/10"
                            : ""
                        }`}
                      >
                        <td className="py-4 pl-6 pr-2">
                          <Checkbox
                            checked={selectedEmpresaIds.has(emp.id)}
                            onCheckedChange={(checked) =>
                              handleToggleEmpresaSelection(emp.id, checked)
                            }
                            aria-label={`Selecionar ${emp.nomeEmpresa}`}
                            className="h-5 w-5 rounded-md"
                          />
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] break-words">
                          {emp.nomeEmpresa}
                        </td>
                        <td className="py-4 px-6 font-medium whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCNPJ(emp.cnpj)}</span>
                            {!isValidCNPJ(emp.cnpj) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 px-1.5 py-0.5 rounded-md w-max shadow-sm animate-pulse">
                                <span>⚠️</span>
                                <span>Sob análise administrativa</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-[150px] truncate" title={emp.nomeRepresentante}>
                          {emp.nomeRepresentante}
                        </td>
                        <td className="py-4 px-6 max-w-[180px] truncate" title={emp.email1}>
                          {emp.email1}
                        </td>
                        <td className="py-4 px-6 max-w-[130px] truncate" title={categoryName}>
                          <Badge variant="secondary" className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400">
                            {categoryName}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {emp.trabalhaComApoioCotacoes ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              <CheckCircle size={16} />
                              <span>Sim</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-xs">
                              <XCircle size={16} />
                              <span>Não</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Visualizar */}
                            <Link href={`/empresas/${emp.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Visualizar detalhes"
                              >
                                <Eye size={16} />
                              </Button>
                            </Link>

                            {/* Editar */}
                            <Link href={`/empresas/${emp.id}/editar`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Editar dados"
                              >
                                <Edit2 size={16} />
                              </Button>
                            </Link>

                            {/* Excluir */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(emp.id)}
                              className="h-9 w-9 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              title="Excluir empresa"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 px-4 py-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {paginatedEmpresas.length} de {pagination.total} empresas
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="rounded-xl px-3 border-slate-200 dark:border-slate-800 text-xs"
                >
                  Anterior
                </Button>
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <Button
                      key={item}
                      size="sm"
                      variant={currentPage === item ? "default" : "outline"}
                      onClick={() => setCurrentPage(item)}
                      className="h-9 w-9 rounded-xl p-0 text-xs border-slate-200 dark:border-slate-800"
                    >
                      {item}
                    </Button>
                  ) : (
                    <span
                      key={item}
                      className="flex h-9 w-7 items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500"
                    >
                      ...
                    </span>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="rounded-xl px-3 border-slate-200 dark:border-slate-800 text-xs"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Bulk Deletion Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onOpenChange={(open) => !open && setIsBulkDeleteOpen(false)}
        title="Excluir empresas selecionadas?"
        description={`Esta ação removerá permanentemente ${selectedCount} empresa(s) selecionada(s) e todos os dados vinculados.`}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={isBulkDeleting}
        confirmText="Excluir selecionadas"
        cancelText="Voltar"
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deseja mesmo excluir esta empresa?"
        description="Esta ação removerá permanentemente o cadastro da empresa parceira e todos os dados vinculados a ela do sistema administrativo."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        confirmText="Sim, Excluir"
        cancelText="Voltar"
      />
    </div>
  );
}
