"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon } from "../components/ActionIcons";
import { ColorContrastHint } from "../components/ColorContrastHint";

const VERT = "#006828";

type Category = {
  id: number;
  name_fr: string;
  name_en: string | null;
  color: string;
  display_order: number;
  usage_count: string;
};

type FormState = { nameFr: string; nameEn: string; color: string; displayOrder: number };
const emptyForm: FormState = { nameFr: "", nameEn: "", color: "#006828", displayOrder: 0 };

export default function AdminCategories() {
  const canView = useHasPermission("categories.voir");
  const canManage = useHasPermission("categories.gerer");

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json()).then((d) => { setCategories(d); setLoading(false); });
  }
  useEffect(() => { if (canView) load(); }, [canView]);

  if (!canView) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto mt-12">
          <p className="font-bold text-gray-900 mb-1">Accès refusé</p>
          <p className="text-sm text-gray-500">Vous n'avez pas la permission de consulter cette page.</p>
        </div>
      </div>
    );
  }

  function openNew() {
    setForm({ ...emptyForm, displayOrder: categories.length });
    setError("");
    setEditingId("new");
  }

  function openEdit(c: Category) {
    setForm({ nameFr: c.name_fr, nameEn: c.name_en || "", color: c.color, displayOrder: c.display_order });
    setError("");
    setEditingId(c.id);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isNew = editingId === "new";
    const res = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      setError(data.error);
    }
    setSaving(false);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Supprimer la catégorie "${c.name_fr}" ?`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    load();
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(categories, page, 10);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-1">Catégories utilisées pour classer les actualités</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
            + Nouvelle catégorie
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Couleur</th>
              <th className="px-5 py-3">Nom (FR)</th>
              <th className="px-5 py-3">Nom (EN)</th>
              <th className="px-5 py-3">Articles</th>
              {canManage && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <span className="inline-block w-5 h-5 rounded-full border border-black/10" style={{ background: c.color }} />
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">{c.name_fr}</td>
                <td className="px-5 py-3 text-gray-500">{c.name_en || <span className="text-amber-600 text-xs">⚠ non traduit</span>}</td>
                <td className="px-5 py-3 text-gray-500">{c.usage_count}</td>
                {canManage && (
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <EditIcon label="Modifier" onClick={() => openEdit(c)} />
                      <DeleteIcon label="Supprimer" onClick={() => handleDelete(c)} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Aucune catégorie</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouvelle catégorie" : "Modifier la catégorie"}</h2>
              <ModalCloseButton onClick={() => setEditingId(null)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nom-francais">Nom (Français) *</label>
              <input id="nom-francais" required value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nom-english">Nom (English)</label>
              <input id="nom-english" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider" htmlFor="couleur">Couleur</label>
                <input id="couleur" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-8 rounded border border-gray-200 cursor-pointer" />
                <span className="text-xs text-gray-400 font-mono">{form.color}</span>
              </div>
              <ColorContrastHint color={form.color} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="ordre-d-affichage">Ordre d'affichage</label>
              <input id="ordre-d-affichage" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
