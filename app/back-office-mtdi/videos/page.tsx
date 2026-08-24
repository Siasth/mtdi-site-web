"use client";
import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";
type Video = { id: number; title_fr: string; title_en: string | null; date_label: string | null; duration: string | null; source: string | null; url: string; color: string | null; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { titleFr: "", titleEn: "", date: "", duration: "", source: "MTDI", url: "", color: "#162233", displayOrder: 0, active: true };

export default function AdminVideos() {
  const canManage = useHasPermission("contenu.modifier");
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() { setLoading(true); fetch("/api/admin/videos").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setEditing("new"); }
  function openEdit(v: Video) { setForm({ titleFr: v.title_fr, titleEn: v.title_en || "", date: v.date_label || "", duration: v.duration || "", source: v.source || "MTDI", url: v.url, color: v.color || "#162233", displayOrder: v.display_order, active: v.active }); setEditing(v.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/videos" : `/api/admin/videos/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(v: Video) { if (confirm(`Supprimer "${v.title_fr}" ?`)) { await fetch(`/api/admin/videos/${v.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(v: Video) { await fetch(`/api/admin/videos/${v.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vidéothèque</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle vidéo</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((v) => (
          <div key={v.id} className={`flex items-center justify-between p-4 ${v.deleted_at ? "opacity-40" : ""}`}>
            <div><p className="font-medium text-gray-900 text-sm">{v.title_fr}</p><p className="text-xs text-gray-400">{v.source} · {v.date_label} · {v.duration}</p></div>
            <div className="flex gap-1">{v.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(v)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(v)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(v)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucune vidéo</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle vidéo" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="grid grid-cols-3 gap-3">
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Date" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Durée" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lien YouTube *</label><input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Couleur de vignette</label><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-20 h-9 rounded border border-gray-200" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
