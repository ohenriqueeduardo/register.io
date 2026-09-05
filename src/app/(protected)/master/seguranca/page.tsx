"use client";

import React from "react";
import {
  Lock,
  ShieldCheck,
  Key,
  ShieldAlert,
  Server,
  Fingerprint,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MasterSegurancaPage() {
  const securityItems = [
    {
      title: "Algoritmo de Hash de Senhas",
      description: "Bcrypt com fator de custo 12 (Salt Rounds) resistente a ataques de força bruta.",
      status: "ATIVO",
      badgeColor: "emerald",
      icon: Key,
    },
    {
      title: "Controle & Revogação de Sessão",
      description: "Controle por tokenVersion: revoga instantaneamente todos os tokens ativos em caso de suspeita ou moderação.",
      status: "ATIVO",
      badgeColor: "emerald",
      icon: RefreshCw,
    },
    {
      title: "Proteção contra Rate Limiting",
      description: "Mitigação por IP no Middleware com priorização de x-real-ip e limitação em 60 req/min.",
      status: "ATIVO",
      badgeColor: "emerald",
      icon: Server,
    },
    {
      title: "Cabeçalhos de Segurança (CSP & HSTS)",
      description: "Content Security Policy estrito, HSTS preload, X-Frame-Options DENY e nosniff ativos.",
      status: "ATIVO",
      badgeColor: "emerald",
      icon: ShieldCheck,
    },
    {
      title: "Proteção contra Timing Attacks",
      description: "Validação de segredos em tempo constante via crypto.timingSafeEqual.",
      status: "ATIVO",
      badgeColor: "emerald",
      icon: Lock,
    },
    {
      title: "Autenticação em Duas Etapas (MFA / 2FA)",
      description: "Estrutura pronta para acoplamento de TOTP / Authenticator para contas com privilégio Master.",
      status: "PREPARADO",
      badgeColor: "amber",
      icon: Fingerprint,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Lock className="text-amber-400" />
          <span>Painel de Conformidade & Segurança</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Visão holística das defesas ativas, sanitização, revogação de tokens e integridade criptográfica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
                  <Icon size={18} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    item.badgeColor === "emerald"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {item.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
