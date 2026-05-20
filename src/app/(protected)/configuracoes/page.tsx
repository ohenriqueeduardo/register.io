"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/LoadingState";
import { authService } from "@/lib/services/authService";
import { User as UserType } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { useTheme } from "next-themes";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authService.logout();
      showSuccess("Sessao encerrada com sucesso.");
      router.replace("/login");
      router.refresh();
    } catch {
      showError("Erro ao tentar fazer logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Buscando suas configuracoes..." />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Configuracoes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie o tema, sua sessao e informacoes de perfil administrativo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
              <User size={18} className="text-primary" />
              Perfil do Usuario
            </h3>

            {currentUser ? (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Nome Completo
                  </Label>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {currentUser.nome}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    E-mail
                  </Label>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    {currentUser.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Nivel de Acesso
                  </Label>
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                    <ShieldCheck size={16} />
                    <span>
                      {currentUser.role === "ADMIN"
                        ? "Administrador"
                        : "Usuario"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Status da Conta
                  </Label>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    <CheckCircle size={16} />
                    <span>Ativa</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Dados do perfil indisponiveis.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
              <Settings size={18} className="text-primary" />
              Aparencia do Tema
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Alterne entre o tema claro e escuro usando a preferencia visual do painel.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  !isDark
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Sun size={24} />
                <span className="text-xs font-semibold">Modo Claro</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  isDark
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Moon size={24} />
                <span className="text-xs font-semibold">Modo Escuro</span>
              </button>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2">
              Sessao Administrativa
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ao encerrar sua sessao, o cookie httpOnly sera invalidado e sera
              necessario entrar novamente.
            </p>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full h-11 rounded-xl font-semibold gap-2 shadow-lg shadow-destructive/10 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <LogOut size={16} />
              {isLoggingOut ? "Encerrando..." : "Sair do Sistema"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
