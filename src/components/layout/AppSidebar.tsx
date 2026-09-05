"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  FolderOpen,
  Users,
  ShieldAlert,
  X,
} from "lucide-react";
import { SystemLogo } from "@/components/brand/SystemLogo";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export function AppSidebar({
  isOpen,
  onClose,
  userRole,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: Array<{
    label: string;
    href: string;
    icon: any;
    roleRestriction?: string[];
  }> = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Empresas", href: "/empresas", icon: Building },
    { label: "Nova Empresa", href: "/empresas/nova", icon: PlusCircle },
    { label: "Categorias", href: "/categorias", icon: FolderOpen },
    {
      label: "Usuários",
      href: "/usuarios",
      icon: Users,
      roleRestriction: ["ADMIN", "MASTER_ADMIN"],
    },
    {
      label: "Painel Master",
      href: "/master/dashboard",
      icon: ShieldAlert,
      roleRestriction: ["MASTER_ADMIN"],
    },
  ];

  // Filtra itens baseando-se no papel do usuário
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roleRestriction || item.roleRestriction.includes(userRole || "")
  );

  // O menu desktop retrátil é permanentemente colapsado por padrão e expande sob hover
  const collapsed = !isHovered;

  const sidebarContent = (isMobile: boolean) => {
    // No mobile, o menu sempre renderiza totalmente expandido dentro do Drawer
    const isCollapsedState = isMobile ? false : collapsed;

    return (
      <div
        className={cn(
          "flex flex-col justify-between bg-slate-900 text-slate-100 dark:bg-slate-950 transition-all duration-300",
          !isMobile ? "absolute left-0 top-0 h-screen z-50" : "h-full",
          isCollapsedState ? "w-20" : "w-64",
          !isMobile && isHovered ? "shadow-2xl shadow-slate-950/80 border-r border-slate-800" : ""
        )}
      >
        <div>
          {/* Header/Logo */}
          <div
            className={cn(
              "flex h-16 items-center border-b border-slate-800 transition-all duration-300",
              isCollapsedState ? "justify-center px-2" : "justify-between px-6"
            )}
          >
            <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
              <SystemLogo className="h-10 w-10 transition-transform duration-200 hover:scale-105" />
              {!isCollapsedState && (
                <span className="text-lg font-bold tracking-tight text-white animate-fade-in">
                  Registros<span className="text-sky-400 dark:text-sky-300 font-semibold">.io</span>
                </span>
              )}
            </Link>

            {/* Mobile close button only */}
            {isMobile && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className={cn("space-y-1.5 py-6 transition-all duration-300", isCollapsedState ? "px-2" : "px-4")}>
            {filteredMenuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={isCollapsedState ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group hover:scale-[1.01]",
                    isCollapsedState ? "justify-center p-3" : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-colors duration-200 shrink-0",
                      isActive ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-100"
                    )}
                  />
                  {!isCollapsedState && <span className="animate-fade-in truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className={cn("border-t border-slate-800 py-4 transition-all duration-300", isCollapsedState ? "px-1" : "px-6")}>
          <p className="text-[10px] text-slate-500 text-center truncate">
            {isCollapsedState ? "v1.0" : "© 2026 Sistema de Registros"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden lg:block shrink-0 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 bg-slate-900 text-slate-100 dark:bg-slate-950 transition-all duration-300 z-50 w-20 relative"
      >
        {sidebarContent(false)}
      </aside>

      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative flex w-64 max-w-xs flex-1 flex-col bg-slate-900 animate-slide-in h-full">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
export default AppSidebar;
