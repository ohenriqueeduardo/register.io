"use client";

import React, { useEffect, useState } from "react";
import { FolderOpen, Plus, Edit2, Trash2, Save, X, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/LoadingState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { categoriaService } from "@/lib/services/categoriaService";
import { Categoria } from "@/types";
import { showSuccess, showError } from "@/utils/toast";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<(Categoria & { empresaCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States para Criar
  const [newCatName, setNewCatName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // States para Editar
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // States para Deletar
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategorias = async () => {
    try {
      const list = await categoriaService.listWithCompanyCount();
      setCategorias(list);
    } catch (err) {
      showError("Erro ao carregar categorias.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreating(true);
    try {
      await categoriaService.create(newCatName.trim());
      setNewCatName("");
      showSuccess("Categoria criada com sucesso!");
      loadCategorias();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao criar categoria.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSave = async (id: string) => {
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      await categoriaService.update(id, editName.trim());
      setEditId(null);
      setEditName("");
      showSuccess("Categoria atualizada com sucesso!");
      loadCategorias();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao atualizar categoria.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const success = await categoriaService.delete(deleteId);
      if (success) {
        showSuccess("Categoria excluída com sucesso.");
        loadCategorias();
      } else {
        showError("Erro ao tentar excluir a categoria.");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao excluir a categoria.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Categorias
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
          Gerenciamento de segmentos de mercado para vinculação de empresas.
        </p>
      </div>

      {/* Grid: Create Form on the left, List on the right */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Create panel */}
        <div className="md:col-span-1">
          <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <FolderOpen size={18} className="text-primary" />
              Nova Categoria
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName" className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                  Nome da Categoria
                </Label>
                <Input
                  id="catName"
                  placeholder="Ex: Consultoria e TI"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 border-slate-200 dark:border-slate-700 focus:ring-primary"
                  disabled={isCreating}
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating || !newCatName.trim()}
                className="w-full h-11 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/5 hover:scale-[1.01] active:scale-[0.99] transition-transform duration-100 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
              >
                <Plus size={16} />
                {isCreating ? "Criando..." : "Criar Categoria"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: List panel */}
        <div className="md:col-span-2">
          {isLoading ? (
            <LoadingState variant="table" message="Buscando categorias..." />
          ) : categorias.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-slate-600 dark:text-slate-300">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            <Card className="rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                  <thead className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                    <tr>
                      <th scope="col" className="py-4 px-6 font-bold">Segmento</th>
                      <th scope="col" className="py-4 px-6 font-bold text-center">Empresas</th>
                      <th scope="col" className="py-4 px-6 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {categorias.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-50">
                          {editId === cat.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-9 w-48 rounded-lg bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-primary py-1 px-2.5"
                                disabled={isUpdating}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateSave(cat.id)}
                                className="h-9 w-9 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                disabled={isUpdating || !editName.trim()}
                              >
                                <Save size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditId(null)}
                                className="h-9 w-9 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                disabled={isUpdating}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ) : (
                            <span>{cat.nome}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-xs font-bold ${
                            cat.empresaCount > 0
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-700"
                              : "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}>
                            {cat.empresaCount} {cat.empresaCount === 1 ? "empresa" : "empresas"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {editId !== cat.id && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditId(cat.id);
                                  setEditName(cat.nome);
                                }}
                                className="h-9 w-9 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(cat.id)}
                                className="h-9 w-9 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="flex items-start gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Atenção:</strong> Por questões de integridade dos registros parceiros, uma categoria só pode ser removida se não houver nenhuma empresa ativa vinculada a ela. Edições de nome atualizam instantaneamente a ficha de todas as empresas desse segmento.
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deseja excluir esta categoria?"
        description="Esta categoria será removida permanentemente do painel de classificação setorial de registros."
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        confirmText="Excluir Categoria"
        cancelText="Cancelar"
      />
    </div>
  );
}
