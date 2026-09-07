"use client";
import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";
type Edition = { id: number; year: string; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; highlight_fr: string | null; highlight_en: string | null; display_order: number; active: boolean; deleted_at: string | null };
type Critere = { id: number; text_fr: string; text_en: string | null; display_order: number; active: boolean; deleted_at: string | null };

export default function AdminIAOlympiades() {
  const canManage = useHasPermission("strategie_ia.gerer");
  const [tab, setTab] = useState<"editions" | "criteres">("editions");
  const [editions, setEditions] = useState<Edition[]>([]);
  const [criteres, setCriteres] = useState<Critere[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/ia-olympiades-editions", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/ia-criteres", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([e, c]) => { setEditions(e); setCriteres(c); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  const [editE, setEditE] = useState<number | "new" | null>(null);
  const [eForm, setEForm] = useState({ year: "", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", highlightFr: "", highlightEn: "" });
  function openNewE() { setEForm({ year: "", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", highlightFr: "", highlightEn: "" }); setEditE("new"); }
  function openEditE(ed: Edition) { setEForm({ year: ed.year, titleFr: ed.title_fr, titleEn: ed.title_en || "", descriptionFr: ed.description_fr || "", descriptionEn: ed.description_en || "", highlightFr: ed.highlight_fr || "", highlightEn: ed.highlight_en || "" }); setEditE(ed.id); }
  async function saveE(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editE === "new";
    await fetch(isNew ? "/api/admin/ia-olympiades-editions" : `/api/admin/ia-olympiades-editions/${editE}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...eForm, displayOrder: isNew ? editions.length : undefined }) });
    setEditE(null); load();
  }
  async function deleteE(ed: Edition) { if (confirm(`Supprimer "${ed.title_fr}" ?`)) { await fetch(`/api/admin/ia-olympiades-editions/${ed.id}`, { method: "DELETE" }); load(); } }
  async function restoreE(ed: Edition) { await fetch(`/api/admin/ia-olympiades-editions/${ed.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  const [editC, setEditC] = useState<number | "new" | null>(null);
  const [cForm, setCForm] = useState({ textFr: "", textEn: "" });
  function openNewC() { setCForm({ textFr: "", textEn: "" }); setEditC("new"); }
  function openEditC(c: Critere) { setCForm({ textFr: c.text_fr, textEn: c.text_en || "" }); setEditC(c.id); }
  async function saveC(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editC === "new";
    await fetch(isNew ? "/api/admin/ia-criteres" : `/api/admin/ia-criteres/${editC}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cForm, displayOrder: isNew ? criteres.length : undefined }) });
    setEditC(null); load();
  }
  async function deleteC(c: Critere) { if (confirm("Supprimer ce critère ?")) { await fetch(`/api/admin/ia-criteres/${c.id}`, { method: "DELETE" }); load(); } }
  async function restoreC(c: Critere) { await fetch(`/api/admin/ia-criteres/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Olympiades IA</h1>
      <p className="text-sm text-gray-500 mb-6">Éditions de la compétition et critères d'éligibilité</p>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button onClick={() => setTab("editions")} className="px-4 py-2 text-sm font-bold" style={tab === "editions" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>Éditions ({editions.filter((e) => !e.deleted_at).length})</button>
        <button onClick={() => setTab("criteres")} className="px-4 py-2 text-sm font-bold" style={tab === "criteres" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>Critères ({criteres.filter((c) => !c.deleted_at).length})</button>
      </div>

      {tab === "editions" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewE} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle édition</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {editions.map((ed) => (
              <div key={ed.id} className={`flex items-center justify-between p-4 ${ed.deleted_at ? "opacity-40" : ""}`}>
                <div><p className="font-medium text-gray-900 text-sm">{ed.year} — {ed.title_fr}</p><p className="text-xs text-gray-400">{ed.highlight_fr}</p></div>
                <div className="flex gap-1">{ed.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreE(ed)} /> : <><EditIcon label="Modifier" onClick={() => openEditE(ed)} /><DeleteIcon label="Supprimer" onClick={() => deleteE(ed)} /></>}</div>
              </div>
            ))}
            {editions.length === 0 && <p className="p-8 text-center text-gray-400">Aucune édition</p>}
          </div>
        </>
      )}

      {tab === "criteres" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewC} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau critère</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {criteres.map((c) => (
              <div key={c.id} className={`flex items-center justify-between p-4 gap-4 ${c.deleted_at ? "opacity-40" : ""}`}>
                <p className="text-sm text-gray-900 flex-1">{c.text_fr}</p>
                <div className="flex gap-1 flex-shrink-0">{c.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreC(c)} /> : <><EditIcon label="Modifier" onClick={() => openEditC(c)} /><DeleteIcon label="Supprimer" onClick={() => deleteC(c)} /></>}</div>
              </div>
            ))}
            {criteres.length === 0 && <p className="p-8 text-center text-gray-400">Aucun critère</p>}
          </div>
        </>
      )}

      {editE !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={saveE} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <h2 className="font-bold text-gray-900 text-lg">{editE === "new" ? "Nouvelle édition" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Année *</label><input required type="number" inputMode="numeric" min={2000} max={2100} step={1} value={eForm.year} onChange={(e) => setEForm({ ...eForm, year: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={eForm.titleFr} onChange={(e) => setEForm({ ...eForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={eForm.titleEn} onChange={(e) => setEForm({ ...eForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={eForm.descriptionFr} onChange={(e) => setEForm({ ...eForm, descriptionFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={eForm.descriptionEn} onChange={(e) => setEForm({ ...eForm, descriptionEn: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Point marquant (FR)</label><input value={eForm.highlightFr} onChange={(e) => setEForm({ ...eForm, highlightFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Point marquant (EN)</label><input value={eForm.highlightEn} onChange={(e) => setEForm({ ...eForm, highlightEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditE(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}

      {editC !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveC} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editC === "new" ? "Nouveau critère" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Texte (FR) *</label><textarea required value={cForm.textFr} onChange={(e) => setCForm({ ...cForm, textFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Texte (EN)</label><textarea value={cForm.textEn} onChange={(e) => setCForm({ ...cForm, textEn: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditC(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
