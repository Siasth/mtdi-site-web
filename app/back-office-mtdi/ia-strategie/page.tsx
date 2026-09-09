"use client";
import { useState, useEffect } from "react";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { IconPreset, ICON_PRESET_KEYS } from "../../components/IconPreset";

const VERT = "#006828";

type Pilier = { id: number; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; icon_key: string; display_order: number; active: boolean; deleted_at: string | null };
type Jalon = { id: number; year: string; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; done: boolean; display_order: number; active: boolean; deleted_at: string | null };

export default function AdminIAStrategie() {
  const canManage = useHasPermission("strategie_ia.gerer");
  const [tab, setTab] = useState<"piliers" | "jalons">("piliers");
  const [piliers, setPiliers] = useState<Pilier[]>([]);
  const [jalons, setJalons] = useState<Jalon[]>([]);
  const [jalonsPage, setJalonsPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/ia-piliers", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/ia-jalons", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([p, j]) => { setPiliers(p); setJalons(j); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  // Piliers
  const [editP, setEditP] = useState<number | "new" | null>(null);
  const [pForm, setPForm] = useState({ titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", icon: "shield-check" });
  function openNewP() { if (piliers.length >= 4) { alert("Maximum 4 piliers (grille fixe)."); return; } setPForm({ titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", icon: "shield-check" }); setEditP("new"); }
  function openEditP(p: Pilier) { setPForm({ titleFr: p.title_fr, titleEn: p.title_en || "", descriptionFr: p.description_fr || "", descriptionEn: p.description_en || "", icon: p.icon_key }); setEditP(p.id); }
  async function saveP(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editP === "new";
    await fetch(isNew ? "/api/admin/ia-piliers" : `/api/admin/ia-piliers/${editP}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pForm, displayOrder: isNew ? piliers.length : undefined }) });
    setEditP(null); load();
  }
  async function deleteP(p: Pilier) { if (confirm(`Supprimer "${p.title_fr}" ?`)) { await fetch(`/api/admin/ia-piliers/${p.id}`, { method: "DELETE" }); load(); } }
  async function restoreP(p: Pilier) { await fetch(`/api/admin/ia-piliers/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  // Jalons
  const [editJ, setEditJ] = useState<number | "new" | null>(null);
  const [jForm, setJForm] = useState({ year: "", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", done: false });
  function openNewJ() { setJForm({ year: "", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", done: false }); setEditJ("new"); }
  function openEditJ(j: Jalon) { setJForm({ year: j.year, titleFr: j.title_fr, titleEn: j.title_en || "", descriptionFr: j.description_fr || "", descriptionEn: j.description_en || "", done: j.done }); setEditJ(j.id); }
  async function saveJ(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editJ === "new";
    await fetch(isNew ? "/api/admin/ia-jalons" : `/api/admin/ia-jalons/${editJ}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...jForm, displayOrder: isNew ? jalons.length : undefined }) });
    setEditJ(null); load();
  }
  async function deleteJ(j: Jalon) { if (confirm(`Supprimer "${j.title_fr}" ?`)) { await fetch(`/api/admin/ia-jalons/${j.id}`, { method: "DELETE" }); load(); } }
  async function restoreJ(j: Jalon) { await fetch(`/api/admin/ia-jalons/${j.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems: pageOfJalons, totalPages: jalonsTotalPages, safePage: jalonsSafePage } = paginate(jalons, jalonsPage, 10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Stratégie IA — Vision & Initiatives</h1>
      <p className="text-sm text-gray-500 mb-6">Piliers (page racine) et jalons (page Initiatives) du mini-site Stratégie IA</p>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button onClick={() => setTab("piliers")} className="px-4 py-2 text-sm font-bold" style={tab === "piliers" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>Piliers ({piliers.filter((p) => !p.deleted_at).length}/4)</button>
        <button onClick={() => setTab("jalons")} className="px-4 py-2 text-sm font-bold" style={tab === "jalons" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>Jalons ({jalons.filter((j) => !j.deleted_at).length})</button>
      </div>

      {tab === "piliers" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewP} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau pilier</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {piliers.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-4 ${p.deleted_at ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3"><IconPreset name={p.icon_key} color={VERT} size={20} /><p className="font-medium text-gray-900 text-sm">{p.title_fr}</p></div>
                <div className="flex gap-1">{p.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreP(p)} /> : <><EditIcon label="Modifier" onClick={() => openEditP(p)} /><DeleteIcon label="Supprimer" onClick={() => deleteP(p)} /></>}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "jalons" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewJ} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau jalon</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pageOfJalons.map((j) => (
              <div key={j.id} className={`flex items-center justify-between p-4 ${j.deleted_at ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-black" style={{ background: j.done ? "#dcfce7" : "#fef9c3", color: j.done ? "#166534" : "#854d0e" }}>{j.year}</span>
                  <p className="font-medium text-gray-900 text-sm">{j.title_fr}</p>
                </div>
                <div className="flex gap-1">{j.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreJ(j)} /> : <><EditIcon label="Modifier" onClick={() => openEditJ(j)} /><DeleteIcon label="Supprimer" onClick={() => deleteJ(j)} /></>}</div>
              </div>
            ))}
          </div>
          <Pagination page={jalonsSafePage} totalPages={jalonsTotalPages} onChange={setJalonsPage} />
        </>
      )}

      {editP !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={saveP} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <h2 className="font-bold text-gray-900 text-lg">{editP === "new" ? "Nouveau pilier" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={pForm.titleFr} onChange={(e) => setPForm({ ...pForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={pForm.titleEn} onChange={(e) => setPForm({ ...pForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={pForm.descriptionFr} onChange={(e) => setPForm({ ...pForm, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={pForm.descriptionEn} onChange={(e) => setPForm({ ...pForm, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESET_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setPForm({ ...pForm, icon: key })} className="w-10 h-10 rounded-lg border flex items-center justify-center" style={pForm.icon === key ? { borderColor: VERT, background: `${VERT}10` } : { borderColor: "#e5e7eb" }}>
                    <IconPreset name={key} color={pForm.icon === key ? VERT : "#999"} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditP(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}

      {editJ !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveJ} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editJ === "new" ? "Nouveau jalon" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Année *</label><input required type="number" inputMode="numeric" min={2000} max={2100} step={1} value={jForm.year} onChange={(e) => setJForm({ ...jForm, year: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={jForm.titleFr} onChange={(e) => setJForm({ ...jForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={jForm.titleEn} onChange={(e) => setJForm({ ...jForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={jForm.descriptionFr} onChange={(e) => setJForm({ ...jForm, descriptionFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={jForm.descriptionEn} onChange={(e) => setJForm({ ...jForm, descriptionEn: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={jForm.done} onChange={(e) => setJForm({ ...jForm, done: e.target.checked })} /> Accompli</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditJ(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
