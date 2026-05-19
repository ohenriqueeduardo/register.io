"use client";

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      showSuccess("Login realizado com sucesso!");
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Lado Esquerdo: Branding/Visual */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Building2 className="text-white" size={28} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Registros.io</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Gerencie seus registros com elegância e precisão.
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            A plataforma definitiva para controle de empresas, representantes e catálogos em um só lugar.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/150?u=${i}`} 
                className="w-10 h-10 rounded-full border-2 border-primary shadow-lg"
                alt="User"
              />
            ))}
          </div>
          <p className="text-sm text-white/70 font-medium">
            Junte-se a mais de <span className="text-white font-bold">2,000+</span> empresas registradas.
          </p>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Building2 className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-slate-500 mt-2">Insira suas credenciais para acessar o sistema.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">E-mail</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 rounded-xl h-12 border-slate-200 focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Senha</Label>
                <a href="#" className="text-sm font-bold text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 rounded-xl h-12 border-slate-200 focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-primary" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">
                Lembrar-me por 30 dias
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Sistema"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium">Ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="rounded-xl h-11 gap-2 border-slate-200 hover:bg-slate-50">
              <Github size={18} />
              GitHub
            </Button>
            <Button variant="outline" className="rounded-xl h-11 gap-2 border-slate-200 hover:bg-slate-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Não tem uma conta? <Link to="/cadastro" className="font-bold text-primary hover:underline">Cadastre-se agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;