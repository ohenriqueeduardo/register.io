"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link to={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}>
      <Icon size={20} className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="font-medium">{label}</span>
      {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </div>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Building2, label: 'Empresas', href: '/empresas' },
    { icon: Users, label: 'Usuários', href: '/usuarios' },
    { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Building2 className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Registros.io</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              {...item} 
              active={location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))} 
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-6">
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </Button>
            <span className="font-bold text-lg">Registros.io</span>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 group focus-within:ring-2 ring-primary/20 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar registros..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">Admin User</p>
                <p className="text-xs text-slate-500 mt-1">Administrador</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={18} />
                </div>
                <span className="font-bold">Registros.io</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  {...item} 
                  active={location.pathname === item.href} 
                />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;