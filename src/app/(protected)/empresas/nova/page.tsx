"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Building, User, Mail, FolderOpen, Tag, FileText } from "lucide-react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { empresaFormSchema, EmpresaFormValues } from "@/lib/validators/empresa";
import { formatCNPJ, formatPhone, cleanCNPJ, cleanPhone } from "@/utils/masks";
import { empresaService } from "@/lib/services/empresaService";
import {
  catalogoUploadService,
  CatalogoFileInfo,
} from "@/lib/services/catalogoUploadService";
import { categoriaService } from "@/lib/services/categoriaService";
import { Categoria } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import Link from "next/link";

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  useEffect(() => {
    async function loadCats() {
      try {
        const list = await categoriaService.list();
        setCategorias(list);
      } catch (err) {
        showError("Erro ao carregar categorias.");
      }
    }
    loadCats();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nomeEmpresa: "",
      cnpj: "",
      nomeRepresentante: "",
      telefoneRepresentante: "",
      telefoneEmpresa: "",
      email1: "",
      email2: "",
      trabalhaComApoioCotacoes: true,
      categoriaId: "",
      especialidades: "",
    },
  });

  const onSubmit = async (values: EmpresaFormValues) => {
    setIsSaving(true);
    try {
      const especialidadesArray = values.especialidades
        ? values.especialidades.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      await empresaService.create({
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

      showSuccess("Empresa cadastrada com sucesso!");
      didSaveRef.current = true;
      router.push("/empresas");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao cadastrar empresa.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/empresas">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Nova Empresa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preencha os dados abaixo para cadastrar um novo registro parceiro.
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
                placeholder="Ex: TechNova Solutions Ltda"
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
                placeholder="Ex: Clarissa Andrade"
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
                placeholder="exemplo1@dominio.com"
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
                placeholder="exemplo2@dominio.com"
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
                    defaultValue={field.value}
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

            {/* Apoio Cotações Switch/Radio */}
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
              <Label htmlFor="especialidades" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag size={14} className="text-slate-400" />
                Especialidades <span className="text-slate-400 font-normal">(Separadas por vírgula)</span>
              </Label>
              <Input
                id="especialidades"
                placeholder="Ex: Desenvolvimento Web, Cloud Consulting, DevOps..."
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                {...register("especialidades")}
                disabled={isSaving}
              />
              <p className="text-xs text-slate-400">
                Digite os principais segmentos ou focos da empresa separados por vírgula para listá-las em tags.
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
            Adicione o portfólio de produtos ou catálogo visual da empresa parceira para visualização e download rápidos na página de detalhes.
          </p>
          <FileUpload
            onFileSelect={(file) => setCatalogoFile(file)}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/empresas">
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
            {isSaving ? "Cadastrando..." : "Cadastrar Empresa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
