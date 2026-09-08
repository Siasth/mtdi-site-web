"use client";

import { useState, useEffect } from "react";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { ColorContrastHint } from "../components/ColorContrastHint";
import MarkdownEditor from "../components/MarkdownEditor";

const VERT = "#006828";

type Member = {
  id: number; role_fr: string; role_en: string | null; direction_fr: string | null; direction_en: string | null;
  description_fr: string; description_en: string | null; accent: string | null; level: number;
  display_order: number; active: boolean; deleted_at: string | null;
};

const emptyForm = { roleFr: "", roleEn: "", directionFr: "", directionEn: "", descriptionFr: "", descriptionEn: "", accent: "#162233", level: 1, displayOrder: 0, active: true };

export default function AdminCabinet() {
  const canManage = useHasPermission("ministere.gerer");
  const [items, setItems] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() { setLoading(true); fetch("/api/admin/cabinet", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(m: Member) {
    setForm({ roleFr: m.role_fr, roleEn: m.role_en || "", directionFr: m.direction_fr || "", directionEn: m.direction_en || "", descriptionFr: m.description_fr, descriptionEn: m.description_en || "", accent: m.accent || "#162233", level: m.level, displayOrder: m.display_order, active: m.active });
    setActiveLang("fr"); setEditing(m.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/cabinet" : `/api/admin/cabinet/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(m: Member) { if (confirm(`Supprimer "${m.role_fr}" ?`)) { await fetch(`/api/admin/cabinet/${m.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(m: Member) { await fetch(`/api/admin/cabinet/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(items, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cabinet</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau membre</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((m) => (
          <div key={m.id} className={`flex items-center justify-between p-4 ${m.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3"><span className="w-2 h-8 rounded-full" style={{ background: m.accent || VERT }} /><div><p className="font-medium text-gray-900 text-sm">{m.role_fr}</p><p className="text-xs text-gray-400">{m.direction_fr} · Niveau {m.level}</p></div></div>
            <div className="flex gap-1">{m.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(m)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(m)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(m)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucun membre</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau membre" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>Version anglaise</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Niveau hiérarchique</label><input type="number" min={0} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Couleur</label><input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="h-9 w-full rounded border border-gray-200" /><ColorContrastHint color={form.accent} /></div>
            </div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rôle (FR) *</label><input required value={form.roleFr} onChange={(e) => setForm({ ...form, roleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Direction/Service (FR)</label><input value={form.directionFr} onChange={(e) => setForm({ ...form, directionFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><MarkdownEditor value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} rows={4} /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role (EN)</label><input value={form.roleEn} onChange={(e) => setForm({ ...form, roleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Direction/Service (EN)</label><input value={form.directionEn} onChange={(e) => setForm({ ...form, directionEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><MarkdownEditor value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} placeholder="Laisser vide si pas encore traduit" rows={4} /></div>
              </>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible sur le site</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
