"use client";
import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";
type Item = { id: number; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; type: string; href: string; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", type: "PNG", href: "", displayOrder: 0, active: true };

export default function AdminKitPresse() {
  const canManage = useHasPermission("mediatheque.gerer");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  function load() { setLoading(true); fetch("/api/admin/kit-presse", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setSaveError(""); setEditing("new"); }
  function openEdit(it: Item) { setForm({ titleFr: it.title_fr, titleEn: it.title_en || "", descriptionFr: it.description_fr || "", descriptionEn: it.description_en || "", type: it.type, href: it.href, displayOrder: it.display_order, active: it.active }); setSaveError(""); setEditing(it.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    if (!form.href) {
      setSaveError("Veuillez importer un fichier avant d'enregistrer.");
      return;
    }
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/admin/kit-presse" : `/api/admin/kit-presse/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(data.error || "Erreur lors de l'enregistrement.");
      return;
    }
    setEditing(null); load();
  }
  async function handleDelete(it: Item) { if (confirm(`Supprimer "${it.title_fr}" ?`)) { await fetch(`/api/admin/kit-presse/${it.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(it: Item) { await fetch(`/api/admin/kit-presse/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form.href);
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
        <div><h1 className="text-2xl font-bold text-gray-900">Kit presse</h1><p className="text-sm text-gray-500 mt-1">Logos, bannières et documents téléchargeables pour la presse</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle ressource</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((it) => (
          <div key={it.id} className={`flex items-center justify-between p-4 ${it.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">{it.type}</span><p className="font-medium text-gray-900 text-sm">{it.title_fr}</p></div>
            <div className="flex gap-1">{it.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(it)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(it)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(it)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucune ressource</p>}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouvelle ressource" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fichier *</label>
              {form.href && <p className="text-xs text-gray-500 mb-2 truncate">{form.href}</p>}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">{uploading ? "Envoi..." : "Uploader un fichier"}<input type="file" className="hidden" disabled={uploading} onChange={handleUpload} /></label>
              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
