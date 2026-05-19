"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/api-client";
import type { SafeUser } from "@/lib/auth";
import { showError } from "@/utils/toast";

type LayoutProps = {
  children: React.ReactNode;
  user?: Pick<SafeUser, "id" | "nome" | "email" | "role">;
};

export default function Layout({ children, user }: LayoutProps) {
  const router = useRouter();
  const initials =
    user?.nome
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  const handleLogout = async () => {
    try {
      await apiRequest<{ ok: boolean }>("/api/auth/logout", {
        method: "POST",
      });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erro ao sair.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 size={22} />
            </div>
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-slate-900">
              Registros.io
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.nome}</p>
                <p className="text-xs text-slate-500">
                  {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                </p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
