import { requireAdmin } from "@/lib/auth";

export default async function UsuariosPage() {
  await requireAdmin();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
      <p className="text-slate-500">Rota protegida para administradores.</p>
    </div>
  );
}
