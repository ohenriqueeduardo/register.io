import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SystemLogo } from "@/components/brand/SystemLogo";
import {
  Building2,
  FileSpreadsheet,
  Handshake,
  Search,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  FolderLock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/20 via-sky-600/10 to-transparent blur-3xl opacity-60 rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-cyan-600/10 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SystemLogo className="w-9 h-9" />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-sky-200 bg-clip-text text-transparent">
              Register.io
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
              >
                Acessar Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-2"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
                >
                  Criar Conta
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Zap className="w-3.5 h-3.5" />
            Plataforma Corporativa de Registro e Fornecedores
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight sm:leading-none">
            Centralize empresas, cotações e catálogos em{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              uma só plataforma.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Elimine planilhas fragmentadas. Gerencie fornecedores credenciados, automatize consultas de CNPJ, organize catálogos técnicos em nuvem e acelere apoio a cotações.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition shadow-xl shadow-cyan-500/25 text-base"
              >
                Abrir Painel Administrativo
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition shadow-xl shadow-cyan-500/25 text-base"
                >
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold transition text-base backdrop-blur-sm"
                >
                  Fazer Login
                </Link>
              </>
            )}
          </div>

          {/* Social Proof / Stats Pill */}
          <div className="mt-16 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Nuvem & Serverless</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">10MB</div>
              <div className="text-xs text-slate-400 mt-1">Por Catálogo em Nuvem</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">0s</div>
              <div className="text-xs text-slate-400 mt-1">Busca Instantânea</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">Seguro</div>
              <div className="text-xs text-slate-400 mt-1">Auditoria & Logs JSON</div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Tudo o que sua equipe de suprimentos precisa
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Construído para agilidade, conformidade cadastral e integração corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Consulta e Cadastro de Empresas
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Preenchimento inteligente com validação de CNPJ, higienização de dados, categorias segmentadas e tags de especialidades.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Apoio a Cotações
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Identifique instantaneamente parceiros comerciais aptos a prestar suporte em cotações e processos licitatórios.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Catálogos Técnicos em Nuvem
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Armazenamento de PDFs e apresentações de até 10MB integrados com Supabase Storage e validação rigorosa de assinatura binária.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Importação e Exportação Excel
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Migre sua base existente em lote diretamente via planilhas XLSX e exporte dados consolidados com filtros aplicados.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Busca Rápida e Filtros Multicritério
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Encontre fornecedores por razão social, CNPJ, responsável, e-mail, segmento de atuação ou especialidades cadastradas.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/40 transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Segurança e Auditoria
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Logs estruturados JSON com contexto por requisição, trilha de auditoria completa, rate limiting por IP e CSP ativo.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-slate-900/60 p-8 sm:p-14 text-center relative overflow-hidden backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl mx-auto">
              Pronto para transformar a gestão de fornecedores da sua empresa?
            </h2>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto text-base">
              Acesse agora e experimente a velocidade e organização que seu time merece.
            </p>
            <div className="mt-8">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition shadow-xl shadow-cyan-500/30 text-base"
              >
                Criar Minha Conta
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <SystemLogo className="w-6 h-6" />
            <span className="font-semibold text-slate-300">Register.io</span>
            <span>&copy; {new Date().getFullYear()} - Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-slate-300 transition">
              Criar Conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
