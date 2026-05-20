"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services/authService";
import { showError, showSuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/auth";
import { z } from "zod";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type LoginFormData = z.infer<typeof loginSchema>;

type LoginProps = {
  allowRegistration?: boolean;
};

export default function Login({ allowRegistration = false }: LoginProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await authService.login(data.email, data.password);
      showSuccess("Acesso concedido com sucesso!");
      router.replace(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-2 transition-colors duration-200">
      {/* Decorative Branding Panel */}
      <section className="hidden bg-slate-900 dark:bg-slate-950 p-12 text-slate-100 lg:flex lg:flex-col lg:justify-between border-r border-slate-800 relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white border border-sky-300/30 shadow-lg shadow-sky-950/30 dark:bg-sky-400 dark:text-slate-950">
            <Building2 size={28} className="text-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Registros<span className="text-sky-400 dark:text-sky-300">.io</span>
          </span>
        </div>

        <div className="max-w-lg relative z-10">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white mb-6">
            Simplifique a gestão de empresas parceiras.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Plataforma moderna para catalogar, organizar e classificar registros empresariais com total transparência e alta performance.
          </p>
        </div>

        <div className="flex items-center justify-between text-sm font-medium text-slate-400 relative z-10">
          <span>v1.0.0</span>
          <span>&copy; 2026 Sistema de Registros</span>
        </div>
      </section>

      {/* Form Login Panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 p-8 shadow-xl border border-slate-100 dark:border-slate-700/80 transition-colors duration-200">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Entrar
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Preencha suas credenciais para gerenciar os registros.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">
                E-mail
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  className={`h-12 rounded-xl pl-10 bg-slate-50 text-slate-900 placeholder:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 border ${
                    errors.email
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                  }`}
                  placeholder="seu@email.com"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                  <AlertCircle size={12} />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  size={18}
                />
                <Input
                  id="password"
                  type="password"
                  className={`h-12 rounded-xl pl-10 bg-slate-50 text-slate-900 placeholder:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 border ${
                    errors.password
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                  }`}
                  placeholder="********"
                  {...register("password")}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                  <AlertCircle size={12} />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : "Entrar"}
              {!isLoading && <ArrowRight size={18} />}
            </Button>
          </form>

          {allowRegistration && (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="font-semibold text-slate-900 dark:text-slate-50 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
