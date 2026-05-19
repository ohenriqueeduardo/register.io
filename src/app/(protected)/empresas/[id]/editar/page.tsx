export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900">Editar Empresa {id}</h1>
      <p className="text-slate-500">Rota protegida.</p>
    </div>
  );
}
