import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  ShieldCheck,
  History,
  Lock,
  Sliders,
  ArrowLeft,
  LogOut,
  Sparkles,
} from "lucide-react";
import { SystemLogo } from "@/components/brand/SystemLogo";
import { ChangePasswordModal } from "@/components/master/ChangePasswordModal";

export const dynamic = "force-dynamic";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "MASTER_ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    { label: "Dashboard", href: "/master/dashboard", icon: LayoutDashboard },
    { label: "Usuários", href: "/master/usuarios", icon: Users },
    { label: "Administradores", href: "/master/administradores", icon: ShieldCheck },
    { label: "Auditoria & Logs", href: "/master/logs", icon: History },
    { label: "Segurança", href: "/master/seguranca", icon: Lock },
    { label: "Configurações", href: "/master/configuracoes", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Modal de troca forçada no primeiro acesso */}
      <ChangePasswordModal isOpen={Boolean(user.mustChangePassword)} />

      {/* Topbar Master */}
      <header className="h-16 border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <SystemLogo className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Register.io
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldAlert size={12} />
                Master Admin
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Sistema Padrão</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Status: Operacional</span>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-white leading-tight">{user.nome}</p>
              <p className="text-[11px] text-amber-400 font-mono">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-xs">
              M
            </div>
          </div>
        </div>
      </header>

      {/* Subnav com guias de navegação administrativa */}
      <nav className="border-b border-slate-850 bg-slate-900/60 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition whitespace-nowrap"
              >
                <Icon size={15} className="text-amber-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
