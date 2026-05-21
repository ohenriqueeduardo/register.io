"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  UserCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      if (
        segment.startsWith("emp-") ||
        (i > 0 && segments[i - 1] === "empresas" && segment !== "nova")
      ) {
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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 sm:flex">
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
                    ? "pointer-events-none font-semibold text-slate-900 dark:text-slate-100"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-w-[72px] items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-left shadow-sm shadow-slate-900/5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950 dark:shadow-black/20 dark:hover:border-slate-700 dark:hover:bg-slate-900 sm:min-w-[260px]"
              >
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-base font-extrabold text-slate-950 dark:text-white">
                    {user.nome}
                  </p>
                </div>

                <Avatar className="h-11 w-11 border border-slate-200 shadow-sm ring-2 ring-slate-100 dark:border-slate-700 dark:ring-slate-800">
                  <AvatarFallback className="bg-primary font-extrabold text-primary-foreground dark:bg-primary dark:text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl border-slate-200/80 p-2 shadow-lg shadow-slate-900/10 dark:border-slate-800/80 dark:shadow-black/30"
            >
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
                <Link href="/configuracoes#perfil" className="gap-2 font-medium">
                  <UserCircle2 size={16} />
                  <span>Meu perfil</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onLogout}
                className="rounded-xl px-3 py-2.5 text-rose-600 focus:text-rose-700 dark:text-rose-400 dark:focus:text-rose-300"
              >
                <LogOut size={16} />
                <span className="font-medium">Sair do sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
