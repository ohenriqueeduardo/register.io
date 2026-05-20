"use client";

import React from "react";
import { Menu, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AppHeaderProps {
  user?: {
    nome: string;
    email: string;
    role: string;
  };
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export function AppHeader({ user, onOpenSidebar, onLogout }: AppHeaderProps) {
  const pathname = usePathname();

  // Generates page title based on path
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Handle ID dynamic segment
      if (segment.startsWith("emp-") || (i > 0 && segments[i - 1] === "empresas" && segment !== "nova")) {
        breadcrumbs.push({ label: "Detalhes", href: currentPath });
        continue;
      }

      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === "empresas") label = "Empresas";
      if (segment === "nova") label = "Nova Empresa";
      if (segment === "editar") label = "Editar";
      if (segment === "categorias") label = "Categorias";
      if (segment === "usuarios") label = "Usuários";
      if (segment === "configuracoes") label = "Configurações";
      if (segment === "dashboard") label = "Dashboard";

      breadcrumbs.push({ label, href: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const initials =
    user?.nome
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6">
      {/* Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 lg:hidden hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Display */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-slate-200">
            Painel
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
              <Link
                href={crumb.href}
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-slate-900 dark:text-slate-100 font-semibold pointer-events-none"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user.nome}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {user.role === "ADMIN" ? "Administrador" : "Usuário"}
              </p>
            </div>
            
            <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800 shadow-sm">
              <AvatarFallback className="bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Sair do sistema"
              className="h-10 w-10 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              onClick={onLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
export default AppHeader;
