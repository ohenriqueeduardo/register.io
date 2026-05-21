"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/LoadingState";
import { authService } from "@/lib/services/authService";
import { User as UserType } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { useTheme } from "next-themes";

const getFieldError = (error: unknown, field: string) => {
  if (error instanceof ApiError && error.errors?.[field]?.[0]) {
    return error.errors[field][0];
  }

  return error instanceof Error ? error.message : "Não foi possível concluir a ação.";
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        setProfileName(user?.nome ?? "");
        setNewEmail(user?.email ?? "");
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
      showSuccess("Sessão encerrada com sucesso.");
      router.replace("/login");
      router.refresh();
    } catch {
      showError("Erro ao tentar fazer logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const user = await authService.updateProfile(profileName);
      setCurrentUser(user);
      setProfileName(user.nome);
      showSuccess("Perfil atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      showError(getFieldError(error, "nome"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);

    try {
      const user = await authService.updateEmail(newEmail, emailPassword);
      setCurrentUser(user);
      setNewEmail(user.email);
      setEmailPassword("");
      showSuccess("E-mail atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      showError(getFieldError(error, "email"));
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError("A confirmação da nova senha não confere.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await authService.updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Senha atualizada com sucesso.");
    } catch (error) {
      showError(getFieldError(error, "newPassword"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      await authService.deleteAccount(deletePassword);
      showSuccess("Conta apagada com sucesso.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      showError(getFieldError(error, "currentPassword"));
    } finally {
      setIsDeletingAccount(false);
      setDeleteOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Buscando suas configurações..." />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Configurações da Conta
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie seus dados de acesso, preferências e segurança da conta.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="space-y-6">
          <Card
            id="perfil"
            className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-900">
              <User size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Perfil do usuário
              </h2>
            </div>

            {currentUser ? (
              <div className="mb-5 grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    E-mail atual
                  </Label>
                  <p className="mt-1 break-all font-semibold text-slate-700 dark:text-slate-300">
                    {currentUser.email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Nível de acesso
                  </Label>
                  <div className="mt-1 flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck size={16} />
                    <span>{currentUser.role === "ADMIN" ? "Administrador" : "Usuário"}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                  </Label>
                  <div className="mt-1 flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={16} />
                    <span>Conta ativa</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mb-5 text-sm text-slate-400">Dados do perfil indisponíveis.</p>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Nome de exibição</Label>
                <Input
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={isSavingProfile}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="h-11 rounded-xl px-5 font-semibold"
              >
                {isSavingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </form>
          </Card>

          <Card
            id="email"
            className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-900">
              <Mail size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Alterar e-mail
              </h2>
            </div>

            <form onSubmit={handleEmailSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newEmail">Novo e-mail de acesso</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isSavingEmail}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailPassword">Confirme com sua senha atual</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  disabled={isSavingEmail}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSavingEmail}
                  className="h-11 rounded-xl px-5 font-semibold"
                >
                  {isSavingEmail ? "Atualizando..." : "Atualizar e-mail"}
                </Button>
              </div>
            </form>
          </Card>

          <Card
            id="senha"
            className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-900">
              <KeyRound size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Alterar senha
              </h2>
            </div>

            <form onSubmit={handlePasswordSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  Use pelo menos 8 caracteres, com letra maiúscula, minúscula e número.
                </p>
                <Button
                  type="submit"
                  disabled={isSavingPassword}
                  className="h-11 rounded-xl px-5 font-semibold"
                >
                  {isSavingPassword ? "Atualizando..." : "Atualizar senha"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            id="preferencias"
            className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-900">
              <Settings size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Preferências
              </h2>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Escolha o tema visual usado no painel administrativo.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
                  !isDark
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:hover:bg-slate-900/30 dark:hover:text-slate-200"
                }`}
              >
                <Sun size={24} />
                <span className="text-xs font-semibold">Modo claro</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
                  isDark
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:hover:bg-slate-900/30 dark:hover:text-slate-200"
                }`}
              >
                <Moon size={24} />
                <span className="text-xs font-semibold">Modo escuro</span>
              </button>
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Sessão
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Encerre sua sessão atual neste dispositivo.
            </p>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="h-11 w-full rounded-xl gap-2 border-slate-200 font-semibold dark:border-slate-800"
            >
              <LogOut size={16} />
              {isLoggingOut ? "Encerrando..." : "Sair do sistema"}
            </Button>
          </Card>

          <Card
            id="excluir"
            className="scroll-mt-24 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/40 dark:bg-slate-950"
          >
            <div className="mb-4 flex items-center gap-2 border-b border-rose-100 pb-3 dark:border-rose-900/30">
              <Trash2 size={18} className="text-rose-500" />
              <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                Zona de risco
              </h2>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ao apagar sua conta, seu acesso será removido imediatamente. Essa ação é irreversível.
            </p>

            <div className="space-y-2">
              <Label htmlFor="deletePassword">Confirme com sua senha atual</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isDeletingAccount}
                className="h-11 rounded-xl border-rose-200 bg-rose-50/40 dark:border-rose-900/30 dark:bg-rose-950/10"
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              disabled={!deletePassword || isDeletingAccount}
              onClick={() => setDeleteOpen(true)}
              className="mt-4 h-11 w-full rounded-xl gap-2 font-semibold"
            >
              <Trash2 size={16} />
              Apagar minha conta
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Tem certeza que deseja apagar sua conta?"
        description="Seu acesso será encerrado imediatamente. Se esta for a última conta administradora, a exclusão será bloqueada."
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        confirmText="Sim, apagar conta"
        cancelText="Cancelar"
      />
    </div>
  );
}
