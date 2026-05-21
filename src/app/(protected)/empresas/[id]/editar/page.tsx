"use client";

import React, { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Building, User, Mail, FolderOpen, Tag, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/FileUpload";
import { LoadingState } from "@/components/ui/LoadingState";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { empresaFormSchema, EmpresaFormValues } from "@/lib/validators/empresa";
import { formatCNPJ, formatPhone, cleanCNPJ, cleanPhone } from "@/utils/masks";
import { isValidCNPJ } from "@/lib/validators/cnpj";
import { empresaService } from "@/lib/services/empresaService";
import {
  catalogoUploadService,
  CatalogoFileInfo,
} from "@/lib/services/catalogoUploadService";
import { categoriaService } from "@/lib/services/categoriaService";
import { Categoria, Empresa } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarEmpresaPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogoFile, setCatalogoFile] = useState<CatalogoFileInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const catalogoFileRef = useRef<CatalogoFileInfo | null>(null);
  const didSaveRef = useRef(false);

  useEffect(() => {
    catalogoFileRef.current = catalogoFile;
  }, [catalogoFile]);

  useEffect(() => {
    return () => {
      const pendingFile = catalogoFileRef.current;

      if (!didSaveRef.current && pendingFile?.path) {
        catalogoUploadService
          .remove({ path: pendingFile.path, url: pendingFile.url })
          .catch(console.error);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaFormSchema),
  });

  const cnpjValue = watch("cnpj") ?? "";
  const cnpjDigits = cnpjValue.replace(/\D/g, "");
  const showCnpjAlert = cnpjDigits.length === 14 && !isValidCNPJ(cnpjDigits);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const catList = await categoriaService.list();
        setCategorias(catList);

        const emp = await empresaService.getById(id);
        if (!emp) {
          showError("Empresa não encontrada.");
          router.push("/empresas");
          return;
        }

        setEmpresa(emp);
        setCatalogoFile(
          emp.catalogoNome
            ? {
                nome: emp.catalogoNome,
                mimeType: emp.catalogoMimeType || "application/pdf",
                tamanho: emp.catalogoTamanho || 0,
                url: emp.catalogoUrl || "#",
              }
            : null
        );

        // Prefills form values
        reset({
          nomeEmpresa: emp.nomeEmpresa,
          cnpj: formatCNPJ(emp.cnpj),
          nomeRepresentante: emp.nomeRepresentante,
          telefoneRepresentante: formatPhone(emp.telefoneRepresentante),
          telefoneEmpresa: emp.telefoneEmpresa ? formatPhone(emp.telefoneEmpresa) : "",
          email1: emp.email1,
          email2: emp.email2 || "",
          trabalhaComApoioCotacoes: emp.trabalhaComApoioCotacoes,
          categoriaId: emp.categoriaId,
          especialidades: emp.especialidades ? emp.especialidades.join(", ") : "",
        });
      } catch (err) {
        showError("Erro ao carregar dados da empresa.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, router, reset]);

  const onSubmit = async (values: EmpresaFormValues) => {
    if (!empresa) {
      return;
    }

    setIsSaving(true);
    try {
      const especialidadesArray = values.especialidades
        ? values.especialidades.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      await empresaService.update(id, {
        nomeEmpresa: values.nomeEmpresa,
        cnpj: cleanCNPJ(values.cnpj),
        nomeRepresentante: values.nomeRepresentante,
        telefoneRepresentante: cleanPhone(values.telefoneRepresentante),
        telefoneEmpresa: values.telefoneEmpresa ? cleanPhone(values.telefoneEmpresa) : null,
        email1: values.email1,
        email2: values.email2 || null,
        trabalhaComApoioCotacoes: values.trabalhaComApoioCotacoes,
        categoriaId: values.categoriaId,
        especialidades: especialidadesArray,
        catalogoNome: catalogoFile?.nome ?? null,
        catalogoMimeType: catalogoFile?.mimeType ?? null,
        catalogoTamanho: catalogoFile?.tamanho ?? null,
        catalogoUrl: catalogoFile?.url ?? null,
      });

      if (
        empresa.catalogoUrl?.startsWith("http") &&
        empresa.catalogoUrl !== catalogoFile?.url
      ) {
        try {
          await catalogoUploadService.remove({ url: empresa.catalogoUrl });
        } catch (removeError) {
          console.error(removeError);
        }
      }

      showSuccess("Cadastro de empresa atualizado com sucesso!");
      didSaveRef.current = true;
      router.push(`/empresas/${id}`);
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao atualizar empresa.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !empresa) {
    return <LoadingState message="Buscando informações para edição..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/empresas/${empresa.id}`}>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Editar Empresa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modifique as informações abaixo para atualizar o registro da empresa parceira.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
        {/* Seção 1: Dados da Empresa */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building size={20} className="text-primary" />
            <span>Dados da Empresa</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa" className="font-semibold text-slate-700 dark:text-slate-300">
                Nome da Empresa <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="nomeEmpresa"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("nomeEmpresa")}
                disabled={isSaving}
              />
              {errors.nomeEmpresa && (
                <p className="text-xs text-rose-500">{errors.nomeEmpresa.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="font-semibold text-slate-700 dark:text-slate-300">
                CNPJ <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="cnpj"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    onChange={(e) => {
                      const masked = formatCNPJ(e.target.value);
                      setValue("cnpj", masked, { shouldValidate: true });
                    }}
                    disabled={isSaving}
                  />
                )}
              />
              {errors.cnpj && (
                <p className="text-xs text-rose-500">{errors.cnpj.message}</p>
              )}
              {showCnpjAlert && (
                <div className="mt-1 flex items-start gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50/60 px-3 py-2.5 dark:border-amber-800/60 dark:from-amber-950/25 dark:to-yellow-950/10 animate-pulse">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-[11px] font-semibold leading-relaxed text-amber-700 dark:text-amber-400">
                    <span className="font-extrabold">CNPJ sob análise:</span> os dígitos verificadores não conferem.
                    A alteração será salva normalmente, mas o cadastro ficará sinalizado para revisão administrativa.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Seção 2: Dados do Representante */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User size={20} className="text-primary" />
            <span>Dados do Representante</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeRepresentante" className="font-semibold text-slate-700 dark:text-slate-300">
                Nome do Representante <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="nomeRepresentante"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("nomeRepresentante")}
                disabled={isSaving}
              />
              {errors.nomeRepresentante && (
                <p className="text-xs text-rose-500">{errors.nomeRepresentante.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneRepresentante" className="font-semibold text-slate-700 dark:text-slate-300">
                Telefone do Representante <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="telefoneRepresentante"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="telefoneRepresentante"
                    placeholder="(00) 00000-0000"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    onChange={(e) => {
                      const masked = formatPhone(e.target.value);
                      setValue("telefoneRepresentante", masked, { shouldValidate: true });
                    }}
                    disabled={isSaving}
                  />
                )}
              />
              {errors.telefoneRepresentante && (
                <p className="text-xs text-rose-500">{errors.telefoneRepresentante.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Seção 3: Contatos */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Mail size={20} className="text-primary" />
            <span>Informações de Contato</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email1" className="font-semibold text-slate-700 dark:text-slate-300">
                E-mail Principal <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="email1"
                type="email"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("email1")}
                disabled={isSaving}
              />
              {errors.email1 && (
                <p className="text-xs text-rose-500">{errors.email1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email2" className="font-semibold text-slate-700 dark:text-slate-300">
                E-mail Secundário <span className="text-slate-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="email2"
                type="email"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("email2")}
                disabled={isSaving}
              />
              {errors.email2 && (
                <p className="text-xs text-rose-500">{errors.email2.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneEmpresa" className="font-semibold text-slate-700 dark:text-slate-300">
                Telefone da Empresa <span className="text-slate-400 font-normal">(Opcional)</span>
              </Label>
              <Controller
                name="telefoneEmpresa"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="telefoneEmpresa"
                    placeholder="(00) 0000-0000"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    onChange={(e) => {
                      const masked = formatPhone(e.target.value);
                      setValue("telefoneEmpresa", masked, { shouldValidate: true });
                    }}
                    disabled={isSaving}
                  />
                )}
              />
              {errors.telefoneEmpresa && (
                <p className="text-xs text-rose-500">{errors.telefoneEmpresa.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Seção 4: Classificação */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FolderOpen size={20} className="text-primary" />
            <span>Classificação & Segmento</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Categoria Select */}
            <div className="space-y-2">
              <Label htmlFor="categoriaId" className="font-semibold text-slate-700 dark:text-slate-300">
                Categoria <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="categoriaId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary">
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoriaId && (
                <p className="text-xs text-rose-500">{errors.categoriaId.message}</p>
              )}
            </div>

            {/* Apoio Cotações switch/radio */}
            <div className="space-y-3">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">
                Trabalha com plataforma Apoio Cotações? <span className="text-rose-500">*</span>
              </Label>
              <Controller
                name="trabalhaComApoioCotacoes"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val === "sim")}
                    value={field.value ? "sim" : "nao"}
                    className="flex gap-6 mt-1"
                    disabled={isSaving}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="apoio-sim" className="border-slate-300 text-primary focus:ring-primary" />
                      <Label htmlFor="apoio-sim" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                        Sim, trabalha
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="apoio-nao" className="border-slate-300 text-primary focus:ring-primary" />
                      <Label htmlFor="apoio-nao" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                        Não trabalha
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.trabalhaComApoioCotacoes && (
                <p className="text-xs text-rose-500">{errors.trabalhaComApoioCotacoes.message}</p>
              )}
            </div>

            {/* Especialidades Input */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="especialidades" className="font-semibold text-slate-700 dark:text-slate-300">
                Especialidades <span className="text-slate-400 font-normal">(Separadas por vírgula)</span>
              </Label>
              <Input
                id="especialidades"
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("especialidades")}
                disabled={isSaving}
              />
              <p className="text-xs text-slate-400">
                Digite os segmentos corporativos separados por vírgula.
              </p>
            </div>
          </div>
        </Card>

        {/* Seção 5: Anexo do Catálogo */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText size={20} className="text-primary" />
            <span>Catálogo Corporativo (Anexo)</span>
          </div>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            Gerencie o portfólio de produtos anexado ao registro parceiro.
          </p>
          <FileUpload
            initialFileName={empresa.catalogoNome || undefined}
            initialFileSize={empresa.catalogoTamanho || undefined}
            initialFileUrl={empresa.catalogoUrl || undefined}
            onFileSelect={(file) => setCatalogoFile(file)}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/empresas/${empresa.id}`}>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              className="rounded-xl h-12 px-6 border-slate-200 dark:border-slate-800 text-sm font-semibold"
            >
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl h-12 px-8 font-semibold gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform duration-100 shadow-lg shadow-primary/10"
          >
            <Save size={18} />
            {isSaving ? "Atualizando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
