"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";
const TYPES = [
  { value: "appels-offres", label: "Appels d'offres" },
  { value: "emplois", label: "Emplois" },
  { value: "stages", label: "Stages" },
];
type Item = { id: number; type: string; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; href: string | null; deadline_label: string | null; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { type: "appels-offres", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", href: "", deadline: "", displayOrder: 0, active: true };

export default function AdminOpportunites() {
  const canManage = useHasPermission("ressources.gerer");
  const [items, setItems] = useState<Item[]>([]);
  const [pagesByType, setPagesByType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() { setLoading(true); fetch("/api/admin/opportunites", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(it: Item) { setForm({ type: it.type, titleFr: it.title_fr, titleEn: it.title_en || "", descriptionFr: it.description_fr || "", descriptionEn: it.description_en || "", href: it.href || "", deadline: it.deadline_label || "", displayOrder: it.display_order, active: it.active }); setActiveLang("fr"); setEditing(it.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/opportunites" : `/api/admin/opportunites/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(it: Item) { if (confirm(`Supprimer "${it.title_fr}" ?`)) { await fetch(`/api/admin/opportunites/${it.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(it: Item) { await fetch(`/api/admin/opportunites/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Opportunités</h1><p className="text-sm text-gray-500 mt-1">Appels d'offres, emplois, stages — page Participer. Sans aucune offre publiée, le message d'attente par défaut s'affiche automatiquement.</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle opportunité</button>
      </div>
      {TYPES.map((ty) => {
        const itemsOfType = items.filter((it) => it.type === ty.value);
        const { pageItems, totalPages, safePage } = paginate(itemsOfType, pagesByType[ty.value] || 1, 10);
        return (
        <div key={ty.value} className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{ty.label}</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pageItems.map((it) => (
              <div key={it.id} className={`flex items-center justify-between p-4 ${it.deleted_at ? "opacity-40" : ""}`}>
                <div><p className="font-medium text-gray-900 text-sm">{it.title_fr}</p><p className="text-xs text-gray-400">{it.deadline_label}</p></div>
                <div className="flex gap-1">{it.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(it)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(it)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(it)} /></>}</div>
              </div>
            ))}
            {itemsOfType.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">Aucune — message d'attente affiché sur le site</p>}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={(p) => setPagesByType((prev) => ({ ...prev, [ty.value]: p }))} />
        </div>
        );
      })}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle opportunité" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>Version anglaise</button>
              </div>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{TYPES.map((ty) => <option key={ty.value} value={ty.value}>{ty.label}</option>)}</select></div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </>
            )}
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date limite (libellé libre)</label><input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="ex: Avant le 15 septembre 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lien (candidature / détails)</label><input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
