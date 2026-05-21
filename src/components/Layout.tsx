"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { authService } from "@/lib/services/authService";
import { showSuccess, showError, showWarning } from "@/utils/toast";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const LAST_ACTIVITY_KEY = "register_last_activity_at";

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
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLockingRef = useRef(false);
  const lastActivityWriteRef = useRef(0);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      showSuccess("Sessão encerrada com sucesso.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erro ao sair.");
    }
  };

  const lockSession = useCallback(async () => {
    if (isLockingRef.current) return;

    isLockingRef.current = true;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    try {
      await authService.logout();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      showWarning("Sistema bloqueado por inatividade.");
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  const scheduleInactivityLock = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
    const remainingTime = INACTIVITY_LIMIT_MS - (Date.now() - lastActivity);

    if (remainingTime <= 0) {
      void lockSession();
      return;
    }

    inactivityTimerRef.current = setTimeout(() => {
      const latestActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();

      if (Date.now() - latestActivity >= INACTIVITY_LIMIT_MS) {
        void lockSession();
        return;
      }

      scheduleInactivityLock();
    }, remainingTime);
  }, [lockSession]);

  useEffect(() => {
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    scheduleInactivityLock();

    const registerActivity = () => {
      if (isLockingRef.current) return;

      const now = Date.now();

      if (now - lastActivityWriteRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastActivityWriteRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      scheduleInactivityLock();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleInactivityLock();
      }
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, registerActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleInactivityLock]);

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
