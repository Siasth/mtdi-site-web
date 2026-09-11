"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import MarkdownEditor from "../components/MarkdownEditor";
import { uploadFile } from "@/lib/client-upload";
import { ColorContrastHint } from "../components/ColorContrastHint";

const VERT = "#006828";

type Partner = {
  id: number; category: string; name: string; full_fr: string; full_en: string | null;
  description_fr: string; description_en: string | null; accent: string | null; logo_src: string | null;
  display_order: number; active: boolean; deleted_at: string | null;
};

const CATEGORIES = [
  { value: "institutionnel", label: "Institutionnel" },
  { value: "technologique", label: "Technologique & international" },
  { value: "academique", label: "Académique" },
];

const emptyForm = { category: "institutionnel", name: "", fullFr: "", fullEn: "", descriptionFr: "", descriptionEn: "", accent: "#162233", logoSrc: "", displayOrder: 0, active: true };

export default function AdminPartenaires() {
  const canManage = useHasPermission("ministere.gerer");
  const [items, setItems] = useState<Partner[]>([]);
  const [pagesByCategory, setPagesByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function load() { setLoading(true); fetch("/api/admin/partners", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(p: Partner) {
    setForm({ category: p.category, name: p.name, fullFr: p.full_fr, fullEn: p.full_en || "", descriptionFr: p.description_fr, descriptionEn: p.description_en || "", accent: p.accent || "#162233", logoSrc: p.logo_src || "", displayOrder: p.display_order, active: p.active });
    setActiveLang("fr"); setEditing(p.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/partners" : `/api/admin/partners/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(p: Partner) { if (confirm(`Supprimer "${p.name}" ?`)) { await fetch(`/api/admin/partners/${p.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(p: Partner) { await fetch(`/api/admin/partners/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form.logoSrc);
      setForm({ ...form, logoSrc: url });
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
        <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau partenaire</button>
      </div>
      {CATEGORIES.map((cat) => {
        const itemsOfCat = items.filter((p) => p.category === cat.value);
        const { pageItems, totalPages, safePage } = paginate(itemsOfCat, pagesByCategory[cat.value] || 1, 10);
        return (
        <div key={cat.value} className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{cat.label}</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pageItems.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-4 ${p.deleted_at ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3">{p.logo_src && <img src={p.logo_src} alt="" className="h-6 w-14 object-contain" />}<div><p className="font-medium text-gray-900 text-sm">{p.name}</p><p className="text-xs text-gray-400">{p.full_fr} · Ordre : {p.display_order}</p></div></div>
                <div className="flex gap-1">{p.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(p)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(p)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(p)} /></>}</div>
              </div>
            ))}
            {itemsOfCat.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">Aucun</p>}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={(pg) => setPagesByCategory((prev) => ({ ...prev, [cat.value]: pg }))} />
        </div>
        );
      })}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau partenaire" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>Version anglaise</button>
              </div>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="categorie">Catégorie</label><select id="categorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="couleur">Couleur</label><input id="couleur" type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-full h-9 rounded border border-gray-200" /><ColorContrastHint color={form.accent} /></div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="ordre-affichage">Ordre d'affichage</label>
                <input id="ordre-affichage" type="number" value={form.displayOrder || ""} placeholder="0" onChange={(e) => setForm({ ...form, displayOrder: e.target.value === "" ? 0 : Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <p className="text-xs text-gray-400 mt-1">Plus petit = affiché en premier, au sein de sa catégorie.</p>
              </div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="nom-sigle">Nom / sigle *</label><input id="nom-sigle" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: ANIP" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="partenaire-logo-upload">Logo (optionnel)</label>
              {form.logoSrc && <img src={form.logoSrc} alt="" className="h-8 mb-2 object-contain" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">{uploading ? "Import en cours…" : "Choisir un logo"}<input id="partenaire-logo-upload" type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleLogoUpload} /></label>
              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            </div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="intitule-complet-fr">Intitulé complet (FR) *</label><input id="intitule-complet-fr" required value={form.fullFr} onChange={(e) => setForm({ ...form, fullFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="description-fr">Description (FR)</label><MarkdownEditor id="description-fr" value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} rows={3} /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="full-name-en">Full name (EN)</label><input id="full-name-en" value={form.fullEn} onChange={(e) => setForm({ ...form, fullEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="description-en">Description (EN)</label><MarkdownEditor id="description-en" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} placeholder="Laisser vide si pas encore traduit" rows={3} /></div>
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
