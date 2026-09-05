"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Ban,
  PauseCircle,
  PlayCircle,
  KeyRound,
  RotateCcw,
  Trash2,
  MoreVertical,
  Loader2,
  X,
  Building2,
  History,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess, showError } from "@/utils/toast";

export default function MasterUsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal de Detalhes
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modal de Novo Usuário
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nome: "",
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.set("q", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/master/users?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao carregar usuários.");
        return;
      }
      setUsers(json.data.data);
      setTotal(json.data.pagination.total);
      setTotalPages(json.data.pagination.totalPages);
    } catch {
      showError("Falha na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openUserDetails = async (id: string) => {
    setSelectedUserId(id);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/master/users/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedUser(json.data);
      } else {
        showError("Não foi possível carregar os detalhes do usuário.");
      }
    } catch {
      showError("Erro de comunicação.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const executeAction = async (userId: string, action: string, extraData: any = {}) => {
    const actionLabels: Record<string, string> = {
      BLOCK: "bloquear este usuário",
      UNBLOCK: "desbloquear este usuário",
      SUSPEND: "suspender temporariamente este usuário",
      ACTIVATE: "reativar este usuário",
      DEACTIVATE: "desativar este usuário",
      REVOKE_SESSIONS: "revogar todas as sessões ativas deste usuário",
      FORCE_PASSWORD_RESET: "forçar troca de senha no próximo login",
      SOFT_DELETE: "desativar e remover logicamente este usuário",
    };

    if (
      ["BLOCK", "SUSPEND", "DEACTIVATE", "SOFT_DELETE", "REVOKE_SESSIONS"].includes(action) &&
      !window.confirm(`Tem certeza que deseja ${actionLabels[action] || action}?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/master/users/${userId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao executar ação.");
        return;
      }

      showSuccess("Ação executada e registrada em auditoria!");
      fetchUsers();
      if (selectedUserId === userId) {
        openUserDetails(userId);
      }
    } catch {
      showError("Falha na requisição.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/master/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao criar usuário.");
        return;
      }
      showSuccess("Usuário criado com sucesso!");
      setIsCreateOpen(false);
      setNewUserData({ nome: "", username: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch {
      showError("Falha ao registrar novo usuário.");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            Ativo
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
            Suspenso
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10">
            Bloqueado
          </Badge>
        );
      case "INACTIVE":
      default:
        return (
          <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800">
            Inativo
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "MASTER_ADMIN":
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 font-bold">
            MASTER
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-bold">
            ADMIN
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-800 text-slate-400">
            USER
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Users className="text-amber-400" />
            <span>Gerenciamento de Usuários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualização, permissões e ações de moderação de todas as contas da plataforma.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-11 px-5 shadow-lg shadow-amber-500/20"
        >
          <UserPlus size={16} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome, e-mail, usuário ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todas as Funções</option>
              <option value="USER">Usuário Comum</option>
              <option value="ADMIN">Administrador</option>
              <option value="MASTER_ADMIN">Master Admin</option>
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
              <option value="ACTIVE">Ativo</option>
              <option value="SUSPENDED">Suspenso</option>
              <option value="BLOCKED">Bloqueado</option>
              <option value="INACTIVE">Inativo</option>
            </select>

            <Button type="submit" variant="outline" className="h-11 rounded-xl border-slate-800 text-slate-200">
              Filtrar
            </Button>
          </div>
        </form>
      </Card>

      {/* Tabela de Usuários */}
      <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-400">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">Usuário / Nome</th>
                <th className="py-4 px-6 font-bold">E-mail</th>
                <th className="py-4 px-6 font-bold">Função</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Último Acesso</th>
                <th className="py-4 px-6 font-bold">Cadastro</th>
                <th className="py-4 px-6 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Carregando usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200 text-sm">{u.nome}</div>
                      {u.username && (
                        <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300">{u.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>
                    <td className="py-4 px-6">{getStatusBadge(u.status)}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString("pt-BR")
                        : "Nunca acessou"}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDetails(u.id)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                        >
                          Ver Perfil
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl bg-slate-900 border-slate-800 text-xs">
                            {u.status === "ACTIVE" ? (
                              <>
                                <DropdownMenuItem onClick={() => executeAction(u.id, "SUSPEND")} className="text-amber-400">
                                  <PauseCircle size={14} className="mr-2" />
                                  Suspender Conta
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => executeAction(u.id, "BLOCK")} className="text-rose-400">
                                  <Ban size={14} className="mr-2" />
                                  Bloquear Conta
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => executeAction(u.id, "UNBLOCK")} className="text-emerald-400">
                                <CheckCircle2 size={14} className="mr-2" />
                                Reativar / Desbloquear
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-slate-800" />

                            <DropdownMenuItem onClick={() => executeAction(u.id, "REVOKE_SESSIONS")}>
                              <RotateCcw size={14} className="mr-2" />
                              Revogar Sessões Ativas
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => executeAction(u.id, "FORCE_PASSWORD_RESET")}>
                              <KeyRound size={14} className="mr-2" />
                              Forçar Redefinição de Senha
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-800" />

                            {u.role === "USER" ? (
                              <DropdownMenuItem onClick={() => executeAction(u.id, "CHANGE_ROLE", { role: "ADMIN" })} className="text-cyan-400">
                                <Shield size={14} className="mr-2" />
                                Promover a Administrador
                              </DropdownMenuItem>
                            ) : u.role === "ADMIN" ? (
                              <DropdownMenuItem onClick={() => executeAction(u.id, "CHANGE_ROLE", { role: "USER" })} className="text-slate-400">
                                <Users size={14} className="mr-2" />
                                Rebaixar para Usuário
                              </DropdownMenuItem>
                            ) : null}

                            {u.role !== "MASTER_ADMIN" && (
                              <>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={() => executeAction(u.id, "SOFT_DELETE")} className="text-rose-500">
                                  <Trash2 size={14} className="mr-2" />
                                  Desativar Usuário
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
            <span>Total: {total} usuários</span>
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

      {/* Modal / Drawer de Detalhes do Usuário */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Perfil Administrativo do Usuário</h3>
                <p className="text-xs text-slate-400">Auditoria, histórico e moderação</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUser(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingDetail || !selectedUser ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Dados Cadastrais */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-500">Nome:</span>
                    <p className="font-bold text-white text-sm mt-0.5">{selectedUser.nome}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">E-mail:</span>
                    <p className="font-semibold text-slate-300 mt-0.5">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <div className="mt-0.5">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Função:</span>
                    <div className="mt-0.5">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Versão de Sessão:</span>
                    <p className="font-mono text-slate-300 mt-0.5">{selectedUser.tokenVersion}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Troca de Senha Obrigatória:</span>
                    <p className="font-semibold text-slate-300 mt-0.5">
                      {selectedUser.mustChangePassword ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>

                {/* Empresas Vinculadas Criadas pelo Usuário */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Building2 size={14} className="text-cyan-400" />
                    <span>Empresas Cadastradas ({selectedUser.empresasCriadas?.length || 0})</span>
                  </h4>
                  {selectedUser.empresasCriadas?.length > 0 ? (
                    <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                      {selectedUser.empresasCriadas.map((emp: any) => (
                        <div key={emp.id} className="p-3 flex items-center justify-between bg-slate-950/40">
                          <div>
                            <p className="font-bold text-slate-200">{emp.nomeEmpresa}</p>
                            <p className="text-[11px] text-slate-500 font-mono">CNPJ: {emp.cnpj}</p>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(emp.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic">Nenhuma empresa cadastrada por este usuário.</p>
                  )}
                </div>

                {/* Histórico de Auditoria do Usuário */}
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <History size={14} className="text-amber-400" />
                    <span>Histórico de Moderações Realizadas neste Usuário</span>
                  </h4>
                  {selectedUser.targetAuditLogs?.length > 0 ? (
                    <div className="rounded-xl border border-slate-800 divide-y divide-slate-800 max-h-48 overflow-y-auto">
                      {selectedUser.targetAuditLogs.map((log: any) => (
                        <div key={log.id} className="p-3 flex items-start justify-between bg-slate-950/40">
                          <div>
                            <span className="font-mono font-bold text-amber-400">{log.action}</span>
                            <p className="text-slate-400 mt-0.5">Executado por: {log.user?.nome || "Sistema"}</p>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic">Nenhuma ação administrativa registrada para este usuário.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar Novo Usuário */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Criar Novo Usuário</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <Label className="text-slate-300">Nome Completo</Label>
                <Input
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={newUserData.nome}
                  onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Nome de Usuário (opcional)</Label>
                <Input
                  placeholder="Ex: carloseduardo"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">E-mail</Label>
                <Input
                  required
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Senha Inicial</Label>
                <Input
                  required
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Função</Label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mt-1 focus:outline-none"
                >
                  <option value="USER">Usuário Comum</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl h-10 border-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-xl h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
