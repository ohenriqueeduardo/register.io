"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onSuccess }: ChangePasswordModalProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("As senhas digitadas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao atualizar senha.");
        return;
      }

      showSuccess("Senha atualizada com sucesso!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch {
      showError("Falha na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900 p-8 shadow-2xl relative">
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Primeiro Acesso Seguro</h2>
            <p className="text-xs text-slate-400">Definição obrigatória de senha</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Esta é uma conta com privilégios administrativos. Por diretriz de conformidade, é necessário definir uma nova senha pessoal antes de prosseguir.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Nova Senha</Label>
            <div className="relative">
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 rounded-xl bg-slate-800 border-slate-700 text-white"
                required
                disabled={isSubmitting}
              />
              <KeyRound size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl bg-slate-800 border-slate-700 text-white"
                required
                disabled={isSubmitting}
              />
              <CheckCircle2 size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || newPassword.length < 8}
            className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold mt-2 shadow-lg shadow-cyan-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando nova senha...
              </>
            ) : (
              "Definir Senha e Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
