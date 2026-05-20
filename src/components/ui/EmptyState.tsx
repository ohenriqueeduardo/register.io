"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-sm mb-6 border border-slate-100 dark:border-slate-800/80">
        {icon || <FolderOpen className="h-8 w-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="rounded-xl px-5 h-11 font-medium hover:scale-[1.02] transition-transform duration-200"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
export default EmptyState;
