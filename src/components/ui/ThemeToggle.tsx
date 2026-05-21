"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
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
  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-transparent transition-[background-color,border-color,transform,box-shadow] duration-300 ease-out hover:scale-105 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
      title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
    >
      <Sun
        className={`absolute h-[1.25rem] w-[1.25rem] fill-yellow-500/10 text-yellow-500 transition-[opacity,transform] duration-300 ease-out ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-75 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-[1.25rem] w-[1.25rem] fill-slate-700/10 text-slate-700 transition-[opacity,transform] duration-300 ease-out dark:text-slate-400 ${
          isDark ? "-rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
export default ThemeToggle;
