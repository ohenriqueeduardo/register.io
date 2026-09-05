"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Building2,
  FolderLock,
  History,
  TrendingUp,
  UserPlus,
  Loader2,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { showError } from "@/utils/toast";

export default function MasterDashboardPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (selectedPeriod: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/master/stats?period=${selectedPeriod}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao carregar métricas.");
        return;
      }
      setData(json.data);
    } catch {
      showError("Falha na comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const metrics = data?.metrics;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Painel Geral do Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Métricas estratégicas, crescimento e controle operacional da plataforma.
          </p>
        </div>

        {/* Filtros de Período */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(["today", "7d", "30d", "90d"] as const).map((p) => {
            const labels: Record<string, string> = {
              today: "Hoje",
              "7d": "7 dias",
              "30d": "30 dias",
              "90d": "90 dias",
            };
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  period === p
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && !data ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Grid de Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Usuários */}
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Usuários
                </p>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-3">
                {metrics?.totalUsers ?? 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                +{metrics?.newUsersInPeriod ?? 0} no período selecionado
              </p>
            </Card>

            {/* Usuários Ativos */}
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ativos
                </p>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-400 mt-3">
                {metrics?.activeUsers ?? 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Acesso liberado e sem restrições
              </p>
            </Card>

            {/* Bloqueados / Suspensos */}
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bloqueados / Suspensos
                </p>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertOctagon size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-400 mt-3">
                {(metrics?.blockedUsers ?? 0) + (metrics?.suspendedUsers ?? 0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {metrics?.suspendedUsers ?? 0} suspensos / {metrics?.blockedUsers ?? 0} bloqueados
              </p>
            </Card>

            {/* Administradores */}
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Administradores
                </p>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-400 mt-3">
                {metrics?.totalAdmins ?? 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Inclui Master Admin
              </p>
            </Card>
          </div>

          {/* Segunda linha de KPIs de ativos da plataforma */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Empresas Cadastradas</p>
                <p className="text-xl font-bold text-white mt-1">{metrics?.totalEmpresas ?? 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-cyan-400 opacity-80" />
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Categorias Ativas</p>
                <p className="text-xl font-bold text-white mt-1">{metrics?.totalCategorias ?? 0}</p>
              </div>
              <FolderLock className="w-8 h-8 text-sky-400 opacity-80" />
            </Card>

            <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Ações em Auditoria</p>
                <p className="text-xl font-bold text-white mt-1">{metrics?.totalAuditLogs ?? 0}</p>
              </div>
              <History className="w-8 h-8 text-amber-400 opacity-80" />
            </Card>
          </div>

          {/* Gráfico de Crescimento */}
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-400" />
                  <span>Novos Cadastros no Tempo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evolução diária de novos usuários cadastrados na plataforma
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              {data?.growthChart && data.growthChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.growthChart}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="novosUsuarios"
                      name="Novos Usuários"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Nenhum cadastro registrado no período selecionado.
                </div>
              )}
            </div>
          </Card>

          {/* Tabelas de Visão Geral Recente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos Usuários Cadastrados */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus size={16} className="text-cyan-400" />
                  <span>Últimos Usuários Registrados</span>
                </h3>
                <Link
                  href="/master/usuarios"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Ver todos
                </Link>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {data?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{u.nome}</p>
                      <p className="text-slate-400">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg ${
                          u.role === "MASTER_ADMIN"
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : u.role === "ADMIN"
                            ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                            : "border-slate-700 text-slate-400"
                        }`}
                      >
                        {u.role}
                      </Badge>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Últimas Ações Administrativas */}
            <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History size={16} className="text-amber-400" />
                  <span>Últimas Ações Administrativas</span>
                </h3>
                <Link
                  href="/master/logs"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Ver histórico completo
                </Link>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {data?.recentAuditLogs?.map((log: any) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-amber-400">
                        {log.action}
                      </span>
                      <p className="text-slate-300 mt-0.5">
                        Por: {log.user?.nome ?? "Sistema"}
                        {log.targetUser && ` → Alvo: ${log.targetUser.nome}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.createdAt).toLocaleDateString("pt-BR")}{" "}
                      {new Date(log.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
