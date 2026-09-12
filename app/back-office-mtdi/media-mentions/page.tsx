"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";
type Item = { id: number; type_fr: string; type_color: string; title_fr: string; title_en: string | null; date_label: string | null; source: string | null; excerpt_fr: string | null; excerpt_en: string | null; url: string; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { type: "Médias", color: "ROUGE", titleFr: "", titleEn: "", date: "", source: "", excerptFr: "", excerptEn: "", url: "", displayOrder: 0, active: true };

export default function AdminMediaMentions() {
  const canManage = useHasPermission("mediatheque.gerer");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() { setLoading(true); fetch("/api/admin/media-mentions", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setEditing("new"); }
  function openEdit(it: Item) { setForm({ type: it.type_fr, color: it.type_color, titleFr: it.title_fr, titleEn: it.title_en || "", date: it.date_label || "", source: it.source || "", excerptFr: it.excerpt_fr || "", excerptEn: it.excerpt_en || "", url: it.url, displayOrder: it.display_order, active: it.active }); setEditing(it.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/media-mentions" : `/api/admin/media-mentions/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(it: Item) { if (confirm(`Supprimer "${it.title_fr}" ?`)) { await fetch(`/api/admin/media-mentions/${it.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(it: Item) { await fetch(`/api/admin/media-mentions/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const visibleItems = showDeleted ? items.filter((x) => x.deleted_at) : items.filter((x) => !x.deleted_at);
  const { pageItems, totalPages, safePage } = paginate(visibleItems, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">MTDI dans les médias</h1><p className="text-sm text-gray-500 mt-1">Mentions presse, réseaux sociaux, reportages</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle mention</button>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <input type="checkbox" checked={showDeleted} onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }} />
        Afficher les éléments supprimés ({items.filter((x) => x.deleted_at).length})
      </label>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((it) => (
          <div key={it.id} className={`flex items-center justify-between p-4 ${it.deleted_at ? "opacity-40" : ""}`}>
            <div><p className="font-medium text-gray-900 text-sm">{it.title_fr}</p><p className="text-xs text-gray-400">{it.source} · {it.date_label}</p></div>
            <div className="flex gap-1">{it.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(it)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(it)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(it)} /></>}</div>
          </div>
        ))}
        {visibleItems.length === 0 && <p className="p-8 text-center text-gray-400">{showDeleted ? "Aucun élément supprimé." : "Aucune mention"}</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle mention" : "Modifier"}</h2>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-fr">Titre (FR) *</label><input id="titre-fr" required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-en">Titre (EN)</label><input id="titre-en" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source (ex: Instagram)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="extrait-fr">Extrait (FR)</label><textarea id="extrait-fr" value={form.excerptFr} onChange={(e) => setForm({ ...form, excerptFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="extrait-en">Extrait (EN)</label><textarea id="extrait-en" value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="lien">Lien *</label><input id="lien" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
