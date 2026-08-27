"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import MarkdownEditor from "../components/MarkdownEditor";

const VERT = "#006828";

type Direction = {
  id: number; acronym: string; type_fr: string | null; type_en: string | null;
  name_fr: string; name_en: string | null; director: string | null;
  description_fr: string; description_en: string | null; accent: string | null;
  display_order: number; active: boolean; deleted_at: string | null;
};

const emptyForm = { acronym: "", typeFr: "Direction centrale", typeEn: "", nameFr: "", nameEn: "", director: "", descriptionFr: "", descriptionEn: "", accent: "#162233", displayOrder: 0, active: true };

export default function AdminDirections() {
  const canManage = useHasPermission("ministere.gerer");
  const [items, setItems] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() { setLoading(true); fetch("/api/admin/directions", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(d: Direction) {
    setForm({ acronym: d.acronym, typeFr: d.type_fr || "", typeEn: d.type_en || "", nameFr: d.name_fr, nameEn: d.name_en || "", director: d.director || "", descriptionFr: d.description_fr, descriptionEn: d.description_en || "", accent: d.accent || "#162233", displayOrder: d.display_order, active: d.active });
    setActiveLang("fr"); setEditing(d.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/directions" : `/api/admin/directions/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(d: Direction) { if (confirm(`Supprimer "${d.name_fr}" ?`)) { await fetch(`/api/admin/directions/${d.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(d: Direction) { await fetch(`/api/admin/directions/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Directions centrales</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle direction</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((d) => (
          <div key={d.id} className={`flex items-center justify-between p-4 ${d.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded text-xs font-black text-white" style={{ background: d.accent || VERT }}>{d.acronym}</span>
              <div><p className="font-medium text-gray-900 text-sm">{d.name_fr}</p><p className="text-xs text-gray-400">{d.type_fr} {d.director ? `· ${d.director}` : ""}</p></div>
            </div>
            <div className="flex gap-1">{d.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(d)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(d)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(d)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucune direction</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle direction" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>English</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sigle *</label><input required value={form.acronym} onChange={(e) => setForm({ ...form, acronym: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Couleur</label><input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-full h-9 rounded border border-gray-200" /></div>
            </div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label><select value={form.typeFr} onChange={(e) => setForm({ ...form, typeFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="Direction centrale">Direction centrale</option><option value="Direction technique">Direction technique</option></select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom (FR) *</label><input required value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Directeur (optionnel)</label><input value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><MarkdownEditor value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} rows={4} /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type (EN)</label><select value={form.typeEn} onChange={(e) => setForm({ ...form, typeEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="Central Directorate">Central Directorate</option><option value="Technical Directorate">Technical Directorate</option></select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
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
