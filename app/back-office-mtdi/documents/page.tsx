"use client";
import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";
const CATEGORIES = ["rapport", "guide", "juridique", "stratégie"];

type Doc = { id: number; title_fr: string; title_en: string | null; category: string; type: string; date_label: string | null; description_fr: string | null; description_en: string | null; href: string; featured: boolean; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { titleFr: "", titleEn: "", category: "rapport", type: "PDF", date: "", descriptionFr: "", descriptionEn: "", href: "", featured: false, displayOrder: 0, active: true };

export default function AdminDocuments() {
  const canManage = useHasPermission("contenu.modifier");
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function load() { setLoading(true); fetch("/api/admin/documents").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(d: Doc) {
    setForm({ titleFr: d.title_fr, titleEn: d.title_en || "", category: d.category, type: d.type || "PDF", date: d.date_label || "", descriptionFr: d.description_fr || "", descriptionEn: d.description_en || "", href: d.href, featured: d.featured, displayOrder: d.display_order, active: d.active });
    setActiveLang("fr"); setEditing(d.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/documents" : `/api/admin/documents/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(d: Doc) { if (confirm(`Supprimer "${d.title_fr}" ?`)) { await fetch(`/api/admin/documents/${d.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(d: Doc) { await fetch(`/api/admin/documents/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file);
      const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setForm((f) => ({ ...f, href: url, type: ext }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Documenthèque</h1><p className="text-sm text-gray-500 mt-1">Rapports, guides, textes et stratégies téléchargeables</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau document</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((d) => (
          <div key={d.id} className={`flex items-center justify-between p-4 ${d.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 flex-shrink-0">{d.category}</span>
              <div className="min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{d.title_fr}</p><p className="text-xs text-gray-400">{d.date_label} {d.featured && "· Mis en avant"}</p></div>
            </div>
            <div className="flex gap-1 flex-shrink-0">{d.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(d)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(d)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(d)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucun document</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau document" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>English</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Catégorie</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date (libellé libre)</label><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="ex: Octobre 2025" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
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
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fichier / lien *</label>
              <input required value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="https://... ou uploadez un fichier" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">{uploading ? "Envoi..." : "Ou uploader un fichier"}<input type="file" className="hidden" disabled={uploading} onChange={handleUpload} /></label>
              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Mis en avant</label>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            </div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
