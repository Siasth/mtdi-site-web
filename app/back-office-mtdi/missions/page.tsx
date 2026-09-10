"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Mission = { id: number; text_fr: string; text_en: string | null; display_order: number; active: boolean; deleted_at: string | null };

export default function AdminMissions() {
  const canManage = useHasPermission("ministere.gerer");
  const [items, setItems] = useState<Mission[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ textFr: "", textEn: "", displayOrder: 0, active: true });

  function load() { setLoading(true); fetch("/api/admin/missions", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ textFr: "", textEn: "", displayOrder: items.length, active: true }); setEditing("new"); }
  function openEdit(m: Mission) { setForm({ textFr: m.text_fr, textEn: m.text_en || "", displayOrder: m.display_order, active: m.active }); setEditing(m.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/missions" : `/api/admin/missions/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(m: Mission) { if (confirm("Supprimer cette mission ?")) { await fetch(`/api/admin/missions/${m.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(m: Mission) { await fetch(`/api/admin/missions/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(items, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Missions & Attributions</h1><p className="text-sm text-gray-500 mt-1">Liste des missions officielles du ministère</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle mission</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((m) => (
          <div key={m.id} className={`flex items-center justify-between p-4 gap-4 ${m.deleted_at ? "opacity-40" : ""}`}>
            <p className="text-sm text-gray-900 flex-1">{m.text_fr}</p>
            <div className="flex gap-1 flex-shrink-0">{m.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(m)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(m)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(m)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucune mission</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle mission" : "Modifier"}</h2>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="texte-fr">Texte (FR) *</label><textarea id="texte-fr" required value={form.textFr} onChange={(e) => setForm({ ...form, textFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="texte-en">Texte (EN)</label><textarea id="texte-en" value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} rows={3} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible sur le site</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
