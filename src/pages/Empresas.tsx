"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const mockEmpresas = [
  {
    id: '1',
    nome: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    representante: 'João Silva',
    categoria: 'Tecnologia',
    apoio: true,
    email: 'contato@techsolutions.com',
    criadoEm: '2023-10-15'
  },
  {
    id: '2',
    nome: 'Logística Express',
    cnpj: '98.765.432/0001-10',
    representante: 'Maria Oliveira',
    categoria: 'Serviços',
    apoio: false,
    email: 'maria@logexpress.com',
    criadoEm: '2023-11-02'
  },
  {
    id: '3',
    nome: 'Indústria Metalúrgica ABC',
    cnpj: '45.678.901/0001-22',
    representante: 'Carlos Santos',
    categoria: 'Indústria',
    apoio: true,
    email: 'carlos@metalabc.com',
    criadoEm: '2023-11-20'
  },
  {
    id: '4',
    nome: 'Varejo Total S.A.',
    cnpj: '11.222.333/0001-44',
    representante: 'Ana Costa',
    categoria: 'Varejo',
    apoio: true,
    email: 'ana@varejototal.com',
    criadoEm: '2023-12-05'
  },
  {
    id: '5',
    nome: 'Consultoria Estratégica',
    cnpj: '55.666.777/0001-88',
    representante: 'Roberto Lima',
    categoria: 'Serviços',
    apoio: false,
    email: 'roberto@consultoria.com',
    criadoEm: '2023-12-12'
  }
];

const Empresas = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Empresas</h1>
          <p className="text-slate-500 mt-1">Gerencie todos os registros de empresas do sistema.</p>
        </div>
        <Link to="/empresas/nova">
          <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 h-11 px-6">
            <Plus size={18} />
            Nova Empresa
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por nome, CNPJ ou representante..." 
              className="pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20 h-11"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="rounded-xl gap-2 h-11 flex-1 md:flex-none">
              <Filter size={18} />
              Filtros
            </Button>
            <Button variant="outline" className="rounded-xl gap-2 h-11 flex-1 md:flex-none">
              <Download size={18} />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700 py-4">Empresa</TableHead>
                <TableHead className="font-bold text-slate-700">CNPJ</TableHead>
                <TableHead className="font-bold text-slate-700">Representante</TableHead>
                <TableHead className="font-bold text-slate-700">Categoria</TableHead>
                <TableHead className="font-bold text-slate-700">Apoio Cotações</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEmpresas.map((empresa) => (
                <TableRow key={empresa.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{empresa.nome}</span>
                      <span className="text-xs text-slate-500">{empresa.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{empresa.cnpj}</TableCell>
                  <TableCell className="text-slate-600">{empresa.representante}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-lg px-3 py-1">
                      {empresa.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {empresa.apoio ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                        <CheckCircle2 size={16} />
                        Sim
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-sm">
                        <XCircle size={16} />
                        Não
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-slate-200">
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 py-2.5 cursor-pointer"
                          onClick={() => navigate(`/empresas/${empresa.id}`)}
                        >
                          <Eye size={16} className="text-slate-500" />
                          Visualizar Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 py-2.5 cursor-pointer"
                          onClick={() => navigate(`/empresas/${empresa.id}/editar`)}
                        >
                          <Edit2 size={16} className="text-slate-500" />
                          Editar Registro
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg gap-2 py-2.5 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                          <Trash2 size={16} />
                          Excluir Empresa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-bold text-slate-900">5</span> de <span className="font-bold text-slate-900">1,284</span> registros
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-lg h-9 w-9" disabled>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 bg-primary text-white border-primary hover:bg-primary/90">1</Button>
            <Button variant="outline" size="sm" className="rounded-lg h-9 px-4">2</Button>
            <Button variant="outline" size="sm" className="rounded-lg h-9 px-4">3</Button>
            <Button variant="outline" size="icon" className="rounded-lg h-9 w-9">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empresas;