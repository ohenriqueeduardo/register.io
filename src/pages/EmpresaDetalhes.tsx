"use client";

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  CheckCircle2, 
  XCircle,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const EmpresaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock de dados para visualização
  const empresa = {
    id: id,
    nome: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    representante: 'João Silva',
    telefoneRepresentante: '(11) 98888-7777',
    telefoneEmpresa: '(11) 3333-4444',
    email1: 'contato@techsolutions.com',
    email2: 'financeiro@techsolutions.com',
    categoria: 'Tecnologia',
    apoio: true,
    especialidades: 'Desenvolvimento Web, Cloud Computing, Segurança da Informação',
    criadoEm: '15/10/2023',
    atualizadoEm: '20/11/2023',
    catalogo: {
      nome: 'catalogo_tech_2024.pdf',
      tamanho: '2.4 MB',
      url: '#'
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/empresas')}
            className="rounded-full hover:bg-slate-200"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{empresa.nome}</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-lg">Ativo</Badge>
            </div>
            <p className="text-slate-500 mt-1">CNPJ: {empresa.cnpj}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/empresas/${id}/editar`}>
            <Button variant="outline" className="rounded-xl gap-2 h-11 px-6">
              <Edit2 size={18} />
              Editar Registro
            </Button>
          </Link>
          <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 h-11 px-6">
            <Download size={18} />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Empresa</p>
                  <p className="text-slate-900 font-semibold text-lg">{empresa.nome}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CNPJ</p>
                  <p className="text-slate-900 font-semibold text-lg">{empresa.cnpj}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</p>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-lg px-3 py-1 text-sm">
                    {empresa.categoria}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Apoio Cotações</p>
                  {empresa.apoio ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <CheckCircle2 size={18} />
                      Sim, utiliza a plataforma
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                      <XCircle size={18} />
                      Não utiliza
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Especialidades</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {empresa.especialidades.split(',').map((esp, i) => (
                      <Badge key={i} variant="outline" className="rounded-full px-4 py-1 border-slate-200 text-slate-600 bg-white">
                        {esp.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User size={20} className="text-primary" />
                Representante e Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Representante</p>
                  <p className="text-slate-900 font-semibold text-lg">{empresa.representante}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone Celular</p>
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <Phone size={18} className="text-slate-400" />
                    {empresa.telefoneRepresentante}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Principal</p>
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <Mail size={18} className="text-slate-400" />
                    {empresa.email1}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Secundário</p>
                  <p className="text-slate-900 font-semibold text-lg">{empresa.email2 || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Catálogo Anexo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-slate-100">
                  <FileText size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 truncate max-w-[200px]">{empresa.catalogo.nome}</p>
                  <p className="text-sm text-slate-500">{empresa.catalogo.tamanho}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Eye size={16} />
                    Ver
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2">
                    <Download size={16} />
                    Baixar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Metadados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar size={14} />
                  Criado em
                </span>
                <span className="font-semibold text-slate-900">{empresa.criadoEm}</span>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar size={14} />
                  Última atualização
                </span>
                <span className="font-semibold text-slate-900">{empresa.atualizadoEm}</span>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <User size={14} />
                  Registrado por
                </span>
                <span className="font-semibold text-slate-900">Admin User</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmpresaDetalhes;