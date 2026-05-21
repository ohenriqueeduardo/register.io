"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit2,
  Trash2,
  Building,
  User,
  Mail,
  FolderOpen,
  Tag,
  FileText,
  Download,
  Eye,
  Link2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { empresaService } from "@/lib/services/empresaService";
import { Empresa, Categoria } from "@/types";
import { formatCNPJ, formatPhone } from "@/utils/masks";
import { isValidCNPJ } from "@/lib/validators/cnpj";
import { showSuccess, showError } from "@/utils/toast";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmpresaDetalhesPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States de exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const emp = await empresaService.getById(id);
        if (!emp) {
          showError("Empresa não encontrada.");
          router.push("/empresas");
          return;
        }
        setEmpresa(emp);
        setCategoria(emp.categoria ?? null);
      } catch (err) {
        showError("Erro ao carregar informações da empresa.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  const handleDelete = async () => {
    if (!empresa) return;
    setIsDeleting(true);
    try {
      const success = await empresaService.delete(empresa.id);
      if (success) {
        showSuccess("Empresa excluída com sucesso.");
        router.push("/empresas");
      } else {
        showError("Erro ao tentar excluir a empresa.");
      }
    } catch (err) {
      showError("Ocorreu um erro ao excluir a empresa.");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleDownloadCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!empresa || !empresa.catalogoNome) return;
    if (!empresa.catalogoUrl || empresa.catalogoUrl === "#") {
      showError("Catálogo sem URL válida para download.");
      return;
    }

    const link = document.createElement("a");
    link.href = empresa.catalogoUrl;
    link.download = empresa.catalogoNome;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!empresa || !empresa.catalogoNome) return;
    if (!empresa.catalogoUrl || empresa.catalogoUrl === "#") {
      showError("Catálogo sem URL válida para visualização.");
      return;
    }

    window.open(empresa.catalogoUrl, "_blank", "noopener,noreferrer");
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isExternalCatalogLink =
    Boolean(empresa?.catalogoUrl?.startsWith("http")) && !empresa?.catalogoTamanho;

  const getCatalogSourceLabel = (url?: string) => {
    if (!url) return "Link externo";

    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Link externo";
    }
  };

  if (isLoading || !empresa) {
    return <LoadingState message="Buscando ficha de registro..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/empresas">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Ficha Cadastral
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
              Visualização de todos os dados do registro parceiro.
            </p>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="flex gap-2">
          <Link href={`/empresas/${empresa.id}/editar`}>
            <Button className="rounded-xl h-11 px-5 gap-2 border-slate-200 font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform">
              <Edit2 size={16} />
              Editar Cadastro
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl h-11 px-5 gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold"
          >
            <Trash2 size={16} />
            Excluir Registro
          </Button>
        </div>
      </div>

      {/* Alert banner if CNPJ is mathematically invalid */}
      {!isValidCNPJ(empresa.cnpj) && (
        <Card className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 p-5 shadow-md flex items-start gap-3.5 animate-pulse">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200/40">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300">
              Alerta de Integridade de Documento
            </h3>
            <p className="text-xs font-semibold text-amber-700/90 dark:text-amber-400/90 mt-1 leading-relaxed">
              O CNPJ cadastrado (<strong className="font-extrabold">{formatCNPJ(empresa.cnpj)}</strong>) não passou nos critérios de validação matemática (dígitos verificadores incorretos).
              O cadastro foi mantido ativo por conveniência, mas é fortemente recomendado revisar o documento com o parceiro comercial para evitar inconsistências em emissões futuras.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main block: Info Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Informações da Empresa */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Building size={20} className="text-primary" />
              <span>Dados Corporativos</span>
            </div>
            
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Razão Social / Nome Fantasia
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">
                  {empresa.nomeEmpresa}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  CNPJ
                </p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">
                  {formatCNPJ(empresa.cnpj)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Telefone Corporativo
                </p>
                <p className="text-slate-700 dark:text-slate-100 mt-1">
                  {empresa.telefoneEmpresa ? formatPhone(empresa.telefoneEmpresa) : "Não cadastrado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  E-mails da Empresa
                </p>
                <p className="text-slate-800 dark:text-slate-100 mt-1 font-medium select-all">
                  {empresa.email1}
                </p>
                {empresa.email2 && (
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 select-all">
                    {empresa.email2}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Card 2: Informações do Representante */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-3">
              <User size={20} className="text-primary" />
              <span>Representante Comercial</span>
            </div>

            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Nome do Representante
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">
                  {empresa.nomeRepresentante}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Telefone de Contato
                </p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">
                  {formatPhone(empresa.telefoneRepresentante)}
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Especialidades */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Tag size={20} className="text-primary" />
              <span>Especialidades e Atuação</span>
            </div>
            
            {empresa.especialidades && empresa.especialidades.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {empresa.especialidades.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-xl px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Nenhuma especialidade listada para esta empresa.</p>
            )}
          </Card>
        </div>

        {/* Right smaller blocks: Classification and Catalog */}
        <div className="space-y-6">
          {/* Card 4: Classificação */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-3">
              <FolderOpen size={20} className="text-primary" />
              <span>Classificação</span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Categoria Setorial
                </p>
                <Badge className="rounded-xl px-3 py-1 bg-slate-100 text-slate-900 border border-slate-200 mt-2 font-semibold dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700">
                  {categoria?.nome || "Sem Categoria"}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Apoio Cotações
                </p>
                {empresa.trabalhaComApoioCotacoes ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle size={18} />
                    <span>Trabalha com plataforma</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold">
                    <XCircle size={18} />
                    <span>Não trabalha com plataforma</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Calendar size={14} />
                <span>Registrado em: {new Date(empresa.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </Card>

          {/* Card 5: Anexo / Catálogo */}
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-3">
              <FileText size={20} className="text-primary" />
              <span>Portfólio / Catálogo</span>
            </div>

            {empresa.catalogoNome ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    isExternalCatalogLink
                      ? "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 border-sky-100 dark:border-sky-900/20"
                      : "bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/20"
                  }`}>
                    {isExternalCatalogLink ? (
                      <Link2 className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate" title={empresa.catalogoNome}>
                      {empresa.catalogoNome}
                    </p>
                    {isExternalCatalogLink ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-900/30 dark:bg-sky-950/20 dark:text-sky-300">
                          Link importado da planilha
                        </Badge>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {getCatalogSourceLabel(empresa.catalogoUrl)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                        {formatSize(empresa.catalogoTamanho)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleViewCatalog}
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-10 gap-1 border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    <Eye size={14} />
                    Visualizar
                  </Button>
                  <Button
                    onClick={handleDownloadCatalog}
                    size="sm"
                    className="rounded-xl h-10 gap-1 font-semibold"
                  >
                    <Download size={14} />
                    Baixar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 dark:text-slate-300 text-sm space-y-2">
                <FileText size={32} className="mx-auto stroke-[1.2] text-slate-400 dark:text-slate-500" />
                <p>Nenhum catálogo foi anexado a este cadastro corporativo.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Exclusão modal */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Tem certeza que deseja excluir esta empresa?"
        description="Esta ação removerá permanentemente todos os registros, telefones, representantes e anexo de catálogo da empresa parceira de nossa base de dados administrativa."
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmText="Sim, Excluir Registro"
        cancelText="Voltar"
      />
    </div>
  );
}
