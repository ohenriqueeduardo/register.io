"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  RotateCcw,
  UserMinus,
  Loader2,
  X,
  Lock,
  History,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

export default function MasterAdministradoresPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Novo Admin
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/master/admins");
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao carregar administradores.");
        return;
      }
      setAdmins(json.data);
    } catch {
      showError("Falha na conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      showError("A senha de administrador deve ter no mínimo 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/master/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao cadastrar administrador.");
        return;
      }
      showSuccess("Administrador cadastrado com sucesso!");
      setIsOpen(false);
      setFormData({ nome: "", username: "", email: "", password: "" });
      fetchAdmins();
    } catch {
      showError("Erro na criação do administrador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeAction = async (adminId: string, action: string, extraData: any = {}) => {
    if (!window.confirm("Confirma a execução desta ação administrativa?")) {
      return;
    }

    try {
      const res = await fetch(`/api/master/users/${adminId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Falha ao executar ação.");
        return;
      }
      showSuccess("Ação concluída com sucesso!");
      fetchAdmins();
    } catch {
      showError("Erro na comunicação com o servidor.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="text-amber-400" />
            <span>Gestão de Administradores</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle exclusivo de permissões elevadas, membros do corpo administrativo e auditoria de ações.
          </p>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-11 px-5 shadow-lg shadow-amber-500/20"
        >
          <UserPlus size={16} className="mr-2" />
          Novo Administrador
        </Button>
      </div>

      <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-400">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">Administrador</th>
                <th className="py-4 px-6 font-bold">E-mail</th>
                <th className="py-4 px-6 font-bold">Nível</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Ações Auditadas</th>
                <th className="py-4 px-6 font-bold">Último Acesso</th>
                <th className="py-4 px-6 font-bold text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Carregando corpo administrativo...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Nenhum administrador encontrado.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200 text-sm">{admin.nome}</div>
                      {admin.username && (
                        <div className="text-[11px] text-slate-500 font-mono">@{admin.username}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono">{admin.email}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                          admin.role === "MASTER_ADMIN"
                            ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                            : "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                        }`}
                      >
                        {admin.role === "MASTER_ADMIN" ? "MASTER ADMIN" : "ADMINISTRADOR"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          admin.status === "ACTIVE"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : "border-rose-500/30 text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {admin.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <span className="font-bold text-amber-400">{admin._count?.auditLogs || 0}</span> ações
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {admin.role !== "MASTER_ADMIN" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeAction(admin.id, "REVOKE_SESSIONS")}
                            className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-white text-xs"
                            title="Desconectar todas as sessões"
                          >
                            <RotateCcw size={13} className="mr-1" />
                            Revogar Sessão
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              executeAction(admin.id, "CHANGE_ROLE", { role: "USER" })
                            }
                            className="h-8 px-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs"
                            title="Remover acesso administrativo"
                          >
                            <UserMinus size={13} className="mr-1" />
                            Remover Privilégios
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-500/70 font-semibold italic">
                          Conta Principal (Fixa)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Criar Novo Administrador */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                <span>Cadastrar Novo Administrador</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <Label className="text-slate-300">Nome do Administrador</Label>
                <Input
                  required
                  placeholder="Ex: Roberto Dias"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Nome de Usuário (opcional)</Label>
                <Input
                  placeholder="Ex: robertodias"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">E-mail Corporativo</Label>
                <Input
                  required
                  type="email"
                  placeholder="admin@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Senha Inicial Segura (mínimo 8 caracteres)</Label>
                <Input
                  required
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  O administrador terá que redefinir a senha no primeiro acesso obrigatório.
                </p>
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl h-10 border-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Criar Administrador"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
