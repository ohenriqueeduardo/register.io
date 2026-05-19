import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-500">
        Usuario autenticado: <span className="font-medium">{user.nome}</span>
      </p>
    </div>
  );
}
