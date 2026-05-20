"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "table" | "grid";
}

export function LoadingState({
  message = "Carregando dados...",
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "table") {
    return (
      <div className="w-full space-y-4 py-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="h-8 w-48 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="flex items-center gap-4 py-2">
            <div className="h-6 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-6 w-1/6 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-6 w-1/5 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-6 w-1/12 rounded bg-slate-100 dark:bg-slate-800 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-6 animate-pulse">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[2]" />
        <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full border border-primary/20 scale-150 opacity-20" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}
export default LoadingState;
