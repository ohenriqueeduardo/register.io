"use client";

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Building2,
  User,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { showSuccess } from '@/utils/toast';

const empresaSchema = z.object({
  nomeEmpresa: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  nomeRepresentante: z.string().min(3, "Nome do representante obrigatório"),
  telefoneRepresentante: z.string().min(10, "Telefone inválido"),
  telefoneEmpresa: z.string().optional(),
  email1: z.string().email("E-mail inválido"),
  email2: z.string().email("E-mail inválido").optional().or(z.literal('')),
  trabalhaComApoio: z.boolean().default(false),
  categoria: z.string().min(1, "Selecione uma categoria"),
  especialidades: z.string().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

const EditarEmpresa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = React.useState<File | null>(null);
  
  // Simulando carregamento de dados existentes
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nomeEmpresa: 'Tech Solutions Ltda',
      cnpj: '12.345.678/0001-90',
      nomeRepresentante: 'João Silva',
      telefoneRepresentante: '(11) 98888-7777',
      email1: 'contato@techsolutions.com',
      trabalhaComApoio: true,
      categoria: 'tecnologia',
      especialidades: 'Desenvolvimento Web, Cloud Computing'
    }
  });

  const onSubmit = (data: EmpresaFormValues) => {
    console.log("Editando:", data, file);
    showSuccess("Registro atualizado com sucesso!");
    navigate(`/empresas/${id}`);
  };

  const maskCNPJ = (value: string) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
  };

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/empresas/${id}`)}
            className="rounded-full hover:bg-slate-200"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editar Empresa</h1>
            <p className="text-slate-500">Atualize as informações do registro #{id}.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <h2 className="font-bold text-slate-800">Informações da Empresa</h2>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa" className="text-slate-700 font-semibold">Nome da Empresa *</Label>
              <Input 
                id="nomeEmpresa" 
                className={cn("rounded-xl h-11 focus-visible:ring-primary/20", errors.nomeEmpresa && "border-rose-500")}
                {...register('nomeEmpresa')}
              />
              {errors.nomeEmpresa && <p className="text-xs text-rose-500 font-medium">{errors.nomeEmpresa.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-slate-700 font-semibold">CNPJ *</Label>
              <Input 
                id="cnpj" 
                className={cn("rounded-xl h-11 focus-visible:ring-primary/20", errors.cnpj && "border-rose-500")}
                onChange={(e) => {
                  e.target.value = maskCNPJ(e.target.value);
                  register('cnpj').onChange(e);
                }}
                defaultValue="12.345.678/0001-90"
              />
              {errors.cnpj && <p className="text-xs text-rose-500 font-medium">{errors.cnpj.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-slate-700 font-semibold">Categoria *</Label>
              <Select defaultValue="tecnologia" onValueChange={(val) => setValue('categoria', val)}>
                <SelectTrigger className={cn("rounded-xl h-11 focus:ring-primary/20", errors.categoria && "border-rose-500")}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="font-bold text-slate-800">Representante e Contato</h2>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeRepresentante" className="text-slate-700 font-semibold">Nome do Representante *</Label>
              <Input 
                id="nomeRepresentante" 
                className={cn("rounded-xl h-11 focus-visible:ring-primary/20", errors.nomeRepresentante && "border-rose-500")}
                {...register('nomeRepresentante')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoneRepresentante" className="text-slate-700 font-semibold">Telefone do Representante *</Label>
              <Input 
                id="telefoneRepresentante" 
                className={cn("rounded-xl h-11 focus-visible:ring-primary/20", errors.telefoneRepresentante && "border-rose-500")}
                onChange={(e) => {
                  e.target.value = maskPhone(e.target.value);
                  register('telefoneRepresentante').onChange(e);
                }}
                defaultValue="(11) 98888-7777"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email1" className="text-slate-700 font-semibold">E-mail Principal *</Label>
              <Input 
                id="email1" 
                className={cn("rounded-xl h-11 focus-visible:ring-primary/20", errors.email1 && "border-rose-500")}
                {...register('email1')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <h2 className="font-bold text-slate-800">Detalhes Adicionais</h2>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-slate-900">Trabalha com plataforma Apoio Cotações?</Label>
                <p className="text-sm text-slate-500">Indique se a empresa já utiliza nossa plataforma parceira.</p>
              </div>
              <Switch 
                checked={watch('trabalhaComApoio')}
                onCheckedChange={(val) => setValue('trabalhaComApoio', val)}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidades" className="text-slate-700 font-semibold">Especialidades</Label>
              <Input 
                id="especialidades" 
                className="rounded-xl h-11 focus-visible:ring-primary/20"
                {...register('especialidades')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Substituir Catálogo (PDF ou Imagem)</Label>
              <div className={cn(
                "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer",
                file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
              )} onClick={() => document.getElementById('file-upload')?.click()}>
                <input type="file" id="file-upload" className="hidden" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="font-bold text-slate-900">{file.name}</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-slate-900">Clique para substituir o arquivo atual</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="button" variant="outline" className="rounded-xl h-12 px-8" onClick={() => navigate(`/empresas/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20 gap-2">
            <Save size={18} />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditarEmpresa;