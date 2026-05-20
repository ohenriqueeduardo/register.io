"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { authService } from "@/lib/services/authService";
import { showSuccess, showError } from "@/utils/toast";

type LayoutProps = {
  children: React.ReactNode;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
};

export default function Layout({ children, user }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSuccess("Sessão encerrada com sucesso.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erro ao sair.");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
      />

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* Header Panel */}
        <AppHeader
          user={user}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
