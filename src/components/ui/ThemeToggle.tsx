"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800" disabled>
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-200"
      title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      {isDark ? (
        <Sun className="h-[1.25rem] w-[1.25rem] text-yellow-500 fill-yellow-500/10 transition-all rotate-0 scale-100 animate-fade-in" />
      ) : (
        <Moon className="h-[1.25rem] w-[1.25rem] text-slate-700 fill-slate-700/10 dark:text-slate-400 transition-all rotate-0 scale-100 animate-fade-in" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
export default ThemeToggle;
