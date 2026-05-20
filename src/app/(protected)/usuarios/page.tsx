"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/LoadingState";
import { authService } from "@/lib/services/authService";
import { userService } from "@/lib/services/userService";
import { User } from "@/types";
import { showError } from "@/utils/toast";

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsersAndCheckRole = async () => {
      try {
        const currentUser = await authService.getCurrentUser();

        if (!currentUser || currentUser.role !== "ADMIN") {
          showError("Acesso negado. Apenas administradores podem gerenciar usuarios.");
          router.replace("/dashboard");
          return;
        }

        setUsers(await userService.list());
      } catch {
        showError("Erro ao validar permissoes de acesso.");
        router.replace("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsersAndCheckRole();
  }, [router]);

  if (isLoading) {
    return (
      <LoadingState
        message="Validando credenciais e buscando usuarios..."
        variant="table"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Usuarios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestao de perfis e permissoes de acesso ao sistema de registros.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total de Usuarios
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2 text-slate-500">
            <Users size={18} />
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Administradores
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {users.filter((user) => user.role === "ADMIN").length}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-2 text-blue-500">
            <ShieldAlert size={18} />
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Perfis Ativos
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {users.filter((user) => user.status === "ATIVO").length}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-2 text-emerald-500">
            <CheckCircle size={18} />
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
              <tr>
                <th scope="col" className="py-4 px-6 font-bold">Nome</th>
                <th scope="col" className="py-4 px-6 font-bold">E-mail</th>
                <th scope="col" className="py-4 px-6 font-bold">Perfil</th>
                <th scope="col" className="py-4 px-6 font-bold">Status</th>
                <th scope="col" className="py-4 px-6 font-bold text-right">Criacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                    {user.nome}
                  </td>
                  <td className="py-4 px-6 font-medium">{user.email}</td>
                  <td className="py-4 px-6">
                    <Badge
                      variant="outline"
                      className={`rounded-xl px-3 py-1 font-bold ${
                        user.role === "ADMIN"
                          ? "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                          : "bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-855"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      {user.status === "ATIVO" ? (
                        <>
                          <CheckCircle size={15} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Ativo
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={15} className="text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">
                            Pendente
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
