"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  Loader2,
  X,
  Code2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showError } from "@/utils/toast";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  userId?: string | null;
  targetUserId?: string | null;
  ipAddress?: string | null;
  status: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
  targetUser?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  } | null;
}

export default function MasterLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal de Detalhes dos Metadados (JSON)
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (search) params.set("q", search);
      if (entityFilter) params.set("entity", entityFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/master/logs?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao carregar registros de auditoria.");
        return;
      }
      setLogs(json.data.data);
      setTotal(json.data.pagination.total);
      setTotalPages(json.data.pagination.totalPages);
    } catch {
      showError("Falha na comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, entityFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) {
      return (
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes("DELETE") || action.includes("BLOCK")) {
      return (
        <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10 font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes("UPDATE") || action.includes("PASSWORD")) {
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono text-[10px]">
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 font-mono text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <History className="text-amber-400" />
            <span>Auditoria & Logs do Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Trilha cronológica imutável de alterações, criações, moderações e acessos na plataforma.
          </p>
        </div>

        <Button
          onClick={() => fetchLogs()}
          variant="outline"
          className="rounded-xl border-slate-800 text-slate-300 hover:text-white h-11 px-4 gap-2"
        >
          <RefreshCw size={15} />
          Atualizar
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por ação, executor, alvo, ID ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todas as Entidades</option>
              <option value="User">Usuários</option>
              <option value="Empresa">Empresas</option>
              <option value="Categoria">Categorias</option>
              <option value="SystemSetting">Configurações</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todos os Status</option>
              <option value="SUCCESS">Sucesso</option>
              <option value="FAILURE">Falha</option>
            </select>

            <Button type="submit" variant="outline" className="h-11 rounded-xl border-slate-800 text-slate-200">
              Filtrar
            </Button>
          </div>
        </form>
      </Card>

      {/* Tabela de Logs */}
      <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-400">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">Data & Hora</th>
                <th className="py-4 px-6 font-bold">Ação</th>
                <th className="py-4 px-6 font-bold">Entidade</th>
                <th className="py-4 px-6 font-bold">Executor</th>
                <th className="py-4 px-6 font-bold">Alvo</th>
                <th className="py-4 px-6 font-bold text-center">Status</th>
                <th className="py-4 px-6 font-bold text-right">Metadados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Carregando trilha de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-4 px-6">{getActionBadge(log.action)}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-300">
                      {log.entity}
                      {log.entityId && (
                        <span className="block text-[10px] text-slate-500 truncate max-w-[120px]">
                          #{log.entityId}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {log.user ? (
                        <div>
                          <p className="font-semibold text-slate-200">{log.user.nome}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Sistema / Público</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {log.targetUser ? (
                        <div>
                          <p className="font-semibold text-slate-200">{log.targetUser.nome}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{log.targetUser.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 size={13} />
                          Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                          <XCircle size={13} />
                          Falha
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {log.metadata ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 text-xs font-mono"
                        >
                          <Code2 size={13} className="mr-1" />
                          JSON
                        </Button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Total: {total} eventos auditados</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg h-8 border-slate-800"
              >
                Anterior
              </Button>
              <span>
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg h-8 border-slate-800"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Visualizador de Metadados JSON */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 size={16} className="text-amber-400" />
                  <span>Metadados da Auditoria</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Evento: {selectedLog.action} ({selectedLog.entity})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl h-10 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
