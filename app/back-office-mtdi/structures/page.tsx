"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import MarkdownEditor from "../components/MarkdownEditor";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";

type Structure = {
  id: number; acronym: string; name_fr: string; name_en: string | null;
  description_fr: string; description_en: string | null;
  missions_fr: string[]; missions_en: string[]; url: string | null; accent: string | null;
  logo_src: string | null; label_fr: string | null; label_en: string | null;
  display_order: number; active: boolean; deleted_at: string | null;
};

const emptyForm = { acronym: "", nameFr: "", nameEn: "", descriptionFr: "", descriptionEn: "", missionsFr: [] as string[], missionsEn: [] as string[], url: "", accent: "#162233", logoSrc: "", labelFr: "", labelEn: "", displayOrder: 0, active: true };

export default function AdminStructures() {
  const canManage = useHasPermission("contenu.modifier");
  const [items, setItems] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function load() { setLoading(true); fetch("/api/admin/structures", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(s: Structure) {
    setForm({ acronym: s.acronym, nameFr: s.name_fr, nameEn: s.name_en || "", descriptionFr: s.description_fr, descriptionEn: s.description_en || "", missionsFr: s.missions_fr || [], missionsEn: s.missions_en || [], url: s.url || "", accent: s.accent || "#162233", logoSrc: s.logo_src || "", labelFr: s.label_fr || "", labelEn: s.label_en || "", displayOrder: s.display_order, active: s.active });
    setActiveLang("fr"); setEditing(s.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/structures" : `/api/admin/structures/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(s: Structure) { if (confirm(`Supprimer "${s.name_fr}" ?`)) { await fetch(`/api/admin/structures/${s.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(s: Structure) { await fetch(`/api/admin/structures/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file);
      setForm({ ...form, logoSrc: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const missionsList = activeLang === "fr" ? form.missionsFr : form.missionsEn;
  function updateMission(i: number, val: string) {
    const key = activeLang === "fr" ? "missionsFr" : "missionsEn";
    const list = [...(form[key] as string[])]; list[i] = val;
    setForm({ ...form, [key]: list });
  }
  function addMission() { const key = activeLang === "fr" ? "missionsFr" : "missionsEn"; setForm({ ...form, [key]: [...(form[key] as string[]), ""] }); }
  function removeMission(i: number) { const key = activeLang === "fr" ? "missionsFr" : "missionsEn"; setForm({ ...form, [key]: (form[key] as string[]).filter((_, idx) => idx !== i) }); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Structures sous tutelle</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle structure</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((s) => (
          <div key={s.id} className={`flex items-center justify-between p-4 ${s.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3">
              {s.logo_src && <img src={s.logo_src} alt="" className="h-8 w-16 object-contain" />}
              <div><p className="font-medium text-gray-900 text-sm">{s.acronym} — {s.name_fr}</p><p className="text-xs text-gray-400">{s.label_fr}</p></div>
            </div>
            <div className="flex gap-1">{s.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(s)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(s)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(s)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucune structure</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle structure" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>English</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sigle *</label><input required value={form.acronym} onChange={(e) => setForm({ ...form, acronym: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Couleur / Site web</label><div className="flex gap-2"><input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="h-9 w-12 rounded border border-gray-200" /><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Logo</label>
              {form.logoSrc && <img src={form.logoSrc} alt="" className="h-10 mb-2 object-contain" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">{uploading ? "Envoi..." : "Choisir un logo"}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleLogoUpload} /></label>
              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            </div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom (FR) *</label><input required value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Étiquette courte (FR)</label><input value={form.labelFr} onChange={(e) => setForm({ ...form, labelFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><MarkdownEditor value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} rows={4} /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Short label (EN)</label><input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><MarkdownEditor value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} placeholder="Laisser vide si pas encore traduit" rows={4} /></div>
              </>
            )}
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold text-gray-500 uppercase">Missions ({activeLang === "fr" ? "Français" : "English"})</label><button type="button" onClick={addMission} className="text-xs font-bold hover:underline" style={{ color: VERT }}>+ Ajouter</button></div>
              {missionsList.map((m, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input value={m} onChange={(e) => updateMission(i, e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                  <button type="button" onClick={() => removeMission(i)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible sur le site</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
