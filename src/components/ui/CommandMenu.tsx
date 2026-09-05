"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  Users,
  Settings,
  PlusCircle,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { authService } from "@/lib/services/authService";

interface CommandMenuProps {
  userRole?: string;
}

export function CommandMenu({ userRole }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <Command className="flex flex-col w-full focus:outline-none">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3.5 py-3">
            <Search className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
            <Command.Input
              placeholder="O que você deseja buscar ou fazer? (ex: empresas, nova...)"
              className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2 focus:outline-none">
            <Command.Empty className="py-6 text-center text-xs text-slate-400">
              Nenhum resultado encontrado.
            </Command.Empty>

            {/* Ações Rápidas */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 px-2 py-1 block">
                  Ações Rápidas
                </span>
              }
            >
              <Command.Item
                onSelect={() => runCommand(() => router.push("/empresas/nova"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
              >
                <PlusCircle className="w-4 h-4 text-cyan-500" />
                <span>Cadastrar Nova Empresa</span>
              </Command.Item>
            </Command.Group>

            {/* Navegação */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 px-2 py-1 block">
                  Navegação
                </span>
              }
            >
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/empresas"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Lista de Empresas</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/categorias"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
              >
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <span>Categorias de Parceiros</span>
              </Command.Item>

              {userRole === "ADMIN" && (
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/usuarios"))}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Gestão de Usuários</span>
                </Command.Item>
              )}

              <Command.Item
                onSelect={() => runCommand(() => router.push("/configuracoes"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer aria-selected:bg-cyan-500/10 aria-selected:text-cyan-500 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Configurações da Conta</span>
              </Command.Item>
            </Command.Group>

            {/* Sessão */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 px-2 py-1 block">
                  Conta
                </span>
              }
            >
              <Command.Item
                onSelect={() => runCommand(handleLogout)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-3.5 py-2 text-[11px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>Navegação Rápida com Spotlight</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Use</span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 rounded">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 rounded">
                ↓
              </kbd>
              <span>para selecionar</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
