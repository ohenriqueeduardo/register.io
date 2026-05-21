"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  FileCheck,
  CheckCircle,
  XCircle,
  Building,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { dashboardService } from "@/lib/services/dashboardService";
import { DashboardStats } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import Link from "next/link";
import { formatCNPJ } from "@/utils/masks";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <LoadingState message="Buscando estatísticas administrativas..." variant="grid" />;
  }

  // Prepara dados para o gráfico de categorias
  const chartData = stats.empresasPorCategoria
    .filter(cat => cat.quantidade > 0)
    .slice(0, 5);

  const colors = [
    "hsl(var(--primary))",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  // Prepara dados para o gráfico de pizza de Apoio Cotações
  const pieData = [
    { name: "Sim", value: stats.trabalhaComApoio, color: "#10b981" },
    { name: "Não", value: stats.naoTrabalhaComApoio, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Painel Geral
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Resumo administrativo e estatísticas de registros das empresas parceiras.
          </p>
        </div>
        <Link href="/empresas/nova">
          <Button className="rounded-xl h-11 gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
            Cadastrar Nova Empresa
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Grid of Key Indicator Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Empresas */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total de Empresas
            </CardTitle>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-2 text-blue-500">
              <Building size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {stats.totalEmpresas}
            </div>
            <p className="text-xs text-slate-400 mt-1">Registros ativos no sistema</p>
          </CardContent>
        </Card>

        {/* Trabalham com Apoio */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Com Apoio Cotações
            </CardTitle>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-2 text-emerald-500">
              <CheckCircle size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {stats.trabalhaComApoio}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.totalEmpresas > 0
                ? `${Math.round((stats.trabalhaComApoio / stats.totalEmpresas) * 100)}% das empresas`
                : "Sem registros"}
            </p>
          </CardContent>
        </Card>

        {/* Não trabalham com Apoio */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Sem Apoio Cotações
            </CardTitle>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-2 text-red-500">
              <XCircle size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {stats.naoTrabalhaComApoio}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.totalEmpresas > 0
                ? `${Math.round((stats.naoTrabalhaComApoio / stats.totalEmpresas) * 100)}% das empresas`
                : "Sem registros"}
            </p>
          </CardContent>
        </Card>

        {/* Catálogos Anexados */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-2 h-full bg-violet-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Catálogos Anexados
            </CardTitle>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 p-2 text-violet-500">
              <FileCheck size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {stats.totalCatalogos}
            </div>
            <p className="text-xs text-slate-400 mt-1">PDFs de portfólios carregados</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Interactive Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart: Companies by Category */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Empresas por Categoria (Top 5)
              </CardTitle>
              <CardDescription className="text-slate-400">
                Segmentação das principais especialidades registradas
              </CardDescription>
            </CardHeader>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                    <XAxis
                      dataKey="nome"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.04)", radius: 8 }}
                      contentStyle={{
                        background: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  Nenhum dado cadastrado.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Pie Chart: Apoio Cotações */}
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Parceria Apoio Cotações
              </CardTitle>
              <CardDescription className="text-slate-400">
                Adesão à plataforma Apoio Cotações
              </CardDescription>
            </CardHeader>
            <div className="h-60 w-full flex items-center justify-center relative">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  Nenhum dado cadastrado.
                </div>
              )}
              {stats.totalEmpresas > 0 && (
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
                    {stats.totalEmpresas}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Empresas</span>
                </div>
              )}
            </div>
          </div>
          {/* Pie Chart Legends */}
          <div className="flex justify-center gap-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Sim ({stats.trabalhaComApoio})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Não ({stats.naoTrabalhaComApoio})
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Latest Companies Table Section */}
      <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-500" />
              Últimas Empresas Cadastradas
            </CardTitle>
            <CardDescription className="text-slate-400">
              Registros mais recentes adicionados à plataforma
            </CardDescription>
          </div>
          <Link href="/empresas">
            <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-slate-50 dark:hover:bg-slate-900 gap-1">
              Ver todas
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {stats.ultimasEmpresas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold">Empresa</th>
                  <th scope="col" className="py-3 px-4 font-semibold">CNPJ</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Representante</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Apoio Cotações</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.ultimasEmpresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {emp.nomeEmpresa}
                    </td>
                    <td className="py-4 px-4 font-medium">{formatCNPJ(emp.cnpj)}</td>
                    <td className="py-4 px-4">{emp.nomeRepresentante}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2.5 py-0.5 border ${
                          emp.trabalhaComApoioCotacoes
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                        }`}
                      >
                        {emp.trabalhaComApoioCotacoes ? "Sim" : "Não"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {new Date(emp.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">Nenhuma empresa cadastrada.</div>
        )}
      </Card>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
