"use client";

import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const data = [
  { name: 'Jan', total: 45 },
  { name: 'Fev', total: 52 },
  { name: 'Mar', total: 48 },
  { name: 'Abr', total: 61 },
  { name: 'Mai', total: 55 },
  { name: 'Jun', total: 67 },
];

const categoryData = [
  { name: 'Tecnologia', value: 400, color: '#6366f1' },
  { name: 'Serviços', value: 300, color: '#10b981' },
  { name: 'Varejo', value: 300, color: '#f59e0b' },
  { name: 'Indústria', value: 200, color: '#ef4444' },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Bem-vindo de volta! Aqui está o resumo do seu sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">Exportar Relatório</Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">Novo Registro</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Empresas" 
          value="1,284" 
          icon={Building2} 
          trend="up" 
          trendValue="+12.5%" 
          color="bg-indigo-500"
        />
        <StatCard 
          title="Apoio Cotações" 
          value="856" 
          icon={CheckCircle2} 
          trend="up" 
          trendValue="+5.2%" 
          color="bg-emerald-500"
        />
        <StatCard 
          title="Sem Apoio" 
          value="428" 
          icon={XCircle} 
          trend="down" 
          trendValue="-2.1%" 
          color="bg-rose-500"
        />
        <StatCard 
          title="Catálogos Anexados" 
          value="942" 
          icon={FileText} 
          trend="up" 
          trendValue="+8.4%" 
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-lg font-bold">Crescimento de Registros</CardTitle>
            <TrendingUp className="text-slate-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;