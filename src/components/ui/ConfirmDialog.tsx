"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "warning":
        return "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
        <AlertDialogHeader className="flex flex-col items-center sm:items-start gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            variant === "danger" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
            variant === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
            "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
          }`}>
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1 text-center sm:text-left w-full">
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2">
          <AlertDialogCancel 
            disabled={isLoading} 
            className="rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`rounded-xl px-5 transition-all duration-200 font-medium ${getButtonClass()}`}
          >
            {isLoading ? "Processando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default ConfirmDialog;
