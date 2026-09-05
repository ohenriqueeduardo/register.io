"use client";

import React, { useEffect, useState } from "react";
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Save,
  Loader2,
  Lock,
  UserPlus,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

export default function MasterConfiguracoesPage() {
  const [settings, setSettings] = useState({
    allowPublicRegistration: true,
    maintenanceMode: false,
    sessionTimeoutMinutes: 10080,
    passwordMinLength: 8,
    requireSpecialChars: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/master/settings");
        const json = await res.json();
        if (res.ok && json.success) {
          setSettings(json.data);
        }
      } catch {
        showError("Falha ao carregar configurações.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      settings.maintenanceMode &&
      !window.confirm(
        "ATENÇÃO: Ativar o modo de manutenção pode restringir o acesso de usuários regulares. Deseja continuar?"
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/master/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showError(json.message || "Erro ao salvar configurações.");
        return;
      }
      showSuccess("Configurações atualizadas e registradas em auditoria!");
    } catch {
      showError("Erro na comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="text-amber-400" />
          <span>Configurações Globais da Plataforma</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Controle centralizado de políticas de segurança, novos cadastros e modo operacional.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 pb-12">
          {/* Sessão 1: Acesso e Cadastros */}
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus size={16} className="text-cyan-400" />
              <span>Controle de Ingressos & Cadastros</span>
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-slate-200 text-xs sm:text-sm">Permitir Cadastro Público</p>
                <p className="text-xs text-slate-400">
                  Quando ativo, novos usuários podem se registrar diretamente na tela pública (/cadastro).
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowPublicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, allowPublicRegistration: e.target.checked })
                }
                className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-800/60">
              <div>
                <p className="font-semibold text-rose-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>Modo de Manutenção</span>
                </p>
                <p className="text-xs text-slate-400">
                  Suspende o acesso de usuários regulares para manutenções programadas de banco de dados.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="w-5 h-5 accent-rose-500 cursor-pointer rounded"
              />
            </div>
          </Card>

          {/* Sessão 2: Diretrizes de Segurança */}
          <Card className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Diretrizes de Senhas & Sessões</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-slate-300">Tamanho Mínimo de Senha</Label>
                <Input
                  type="number"
                  min={6}
                  max={32}
                  value={settings.passwordMinLength}
                  onChange={(e) =>
                    setSettings({ ...settings, passwordMinLength: parseInt(e.target.value, 10) || 8 })
                  }
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Expiração Máxima de Sessão (minutos)</Label>
                <Input
                  type="number"
                  min={60}
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeoutMinutes: parseInt(e.target.value, 10) || 10080,
                    })
                  }
                  className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-800/60">
              <div>
                <p className="font-semibold text-slate-200 text-xs">Exigir Caracteres Especiais nas Senhas</p>
                <p className="text-[11px] text-slate-400">
                  Obriga símbolos (!@#$%) para novas senhas criadas no sistema.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireSpecialChars}
                onChange={(e) =>
                  setSettings({ ...settings, requireSpecialChars: e.target.checked })
                }
                className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl h-12 px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2 shadow-lg shadow-amber-500/20"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Salvar Configurações</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
