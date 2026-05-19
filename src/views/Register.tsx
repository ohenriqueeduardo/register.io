"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";
import type { SafeUser } from "@/lib/auth";
import { showError, showSuccess } from "@/utils/toast";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      await apiRequest<SafeUser>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome: formData.get("nome"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      showSuccess("Conta criada com sucesso. Faca login para continuar.");
      router.replace("/login");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erro ao cadastrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Building2 size={28} />
          </div>
          <span className="text-2xl font-bold">Registros.io</span>
        </div>
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold leading-tight">
            Crie seu acesso ao sistema.
          </h1>
          <p className="mt-6 text-lg text-white/75">
            A senha sera armazenada apenas como hash criptografado.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Cadastro
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Preencha os dados para criar sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  id="nome"
                  name="nome"
                  className="h-12 rounded-xl pl-10"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="h-12 rounded-xl pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="h-12 rounded-xl pl-10"
                  placeholder="********"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Minimo de 8 caracteres, com maiuscula, minuscula e numero.
              </p>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar conta"}
              {!isLoading && <ArrowRight size={18} />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ja tem conta?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
