import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import NovaEmpresa from "./pages/NovaEmpresa";
import EmpresaDetalhes from "./pages/EmpresaDetalhes";
import EditarEmpresa from "./pages/EditarEmpresa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" closeButton richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          
          {/* Rotas Protegidas (Simuladas com Layout) */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/empresas" element={<Layout><Empresas /></Layout>} />
          <Route path="/empresas/nova" element={<Layout><NovaEmpresa /></Layout>} />
          <Route path="/empresas/:id" element={<Layout><EmpresaDetalhes /></Layout>} />
          <Route path="/empresas/:id/editar" element={<Layout><EditarEmpresa /></Layout>} />
          
          <Route path="/usuarios" element={<Layout><div className="p-8 text-center text-slate-500">Página de Usuários em desenvolvimento</div></Layout>} />
          <Route path="/configuracoes" element={<Layout><div className="p-8 text-center text-slate-500">Página de Configurações em desenvolvimento</div></Layout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;