"use client";

import { useState, useEffect } from "react";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, HideIcon, RestoreIcon } from "../components/ActionIcons";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";

type Slide = {
  id: number;
  image: string;
  video: string | null;
  alt_fr: string;
  alt_en: string | null;
  display_order: number;
  active: boolean;
  deleted_at: string | null;
};

type FormState = { image: string; video: string; altFr: string; altEn: string; displayOrder: number; active: boolean };
const emptyForm: FormState = { image: "", video: "", altFr: "", altEn: "", displayOrder: 0, active: true };

export default function AdminHero() {
  const canManage = useHasPermission("accueil.gerer");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/hero-slides", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d) => { setSlides(d); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  if (!canManage) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto mt-12">
          <p className="font-bold text-gray-900 mb-1">Accès refusé</p>
          <p className="text-sm text-gray-500">Vous n'avez pas la permission de consulter cette page.</p>
        </div>
      </div>
    );
  }

  function openNew() {
    setForm({ ...emptyForm, displayOrder: slides.length });
    setActiveLang("fr");
    setSaveError("");
    setEditingId("new");
  }

  function openEdit(s: Slide) {
    setForm({ image: s.image, video: s.video || "", altFr: s.alt_fr, altEn: s.alt_en || "", displayOrder: s.display_order, active: s.active });
    setActiveLang("fr");
    setSaveError("");
    setEditingId(s.id);
  }

  const [uploadError, setUploadError] = useState("");
  async function handleUpload(field: "image" | "video", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUploading = field === "image" ? setUploadingImage : setUploadingVideo;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form[field] as string);
      setForm((f) => ({ ...f, [field]: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ANO-132 : n'afficher que le nom du fichier importé, pas l'URL complète de stockage.
  function fileNameFromUrl(url: string): string {
    try {
      const parts = new URL(url).pathname.split("/");
      return decodeURIComponent(parts[parts.length - 1] || url);
    } catch {
      return url;
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const isNew = editingId === "new";
    const res = await fetch(isNew ? "/api/admin/hero-slides" : `/api/admin/hero-slides/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaving(false);
      setEditingId(null);
      load();
    } else {
      const data = await res.json();
      setSaveError(data.error || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  async function handleHide(s: Slide) {
    if (!confirm("Masquer ce slide ? (réversible, il n'apparaîtra plus sur le site tant qu'il n'est pas restauré)")) return;
    await fetch(`/api/admin/hero-slides/${s.id}`, { method: "DELETE" });
    load();
  }

  async function handleRestore(s: Slide) {
    await fetch(`/api/admin/hero-slides/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 max-w-xl">
          <p className="font-bold text-red-700 mb-1">Erreur de chargement</p>
          <p className="text-sm text-red-600 whitespace-pre-wrap">{loadError}</p>
          <button onClick={load} className="mt-4 px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { pageItems, totalPages, safePage } = paginate(slides, page, 9);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carousels</h1>
          <p className="text-sm text-gray-500 mt-1">Images/vidéos en carrousel sur la bannière d'accueil</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
          + Nouveau slide
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${s.deleted_at ? "opacity-40" : ""}`}>
            <div className="relative h-32 bg-gray-100">
              <img src={s.image} alt="" className="w-full h-full object-cover" />
              {s.video && <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-black/60 text-white rounded">Vidéo</span>}
              {!s.active && <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-700/80 text-white rounded">Masqué</span>}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate">{s.alt_fr}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-anthracite/70">Ordre : {s.display_order}</span>
                <div className="flex items-center gap-1">
                  {s.deleted_at ? (
                    <RestoreIcon label="Restaurer" onClick={() => handleRestore(s)} />
                  ) : (
                    <>
                      <EditIcon label="Modifier" onClick={() => openEdit(s)} />
                      <HideIcon label="Masquer" onClick={() => handleHide(s)} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-8">Aucun slide — ajoutez-en un pour l'afficher sur la page d'accueil</p>
        )}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouveau slide" : "Modifier le slide"}</h2>
              <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  Français
                </button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2 flex items-center gap-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  English
                  {!form.altEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image *</label>
              {form.image && <img src={form.image} alt="" className="h-28 rounded-lg mb-2 object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploadingImage ? "Import en cours…" : "Choisir une image"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={(e) => handleUpload("image", e)} />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vidéo (optionnel — remplace l'image si présente)</label>
              {form.video && <p className="text-xs text-gray-500 mb-2 truncate">{fileNameFromUrl(form.video)}</p>}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploadingVideo ? "Import en cours…" : "Choisir une vidéo"}
                <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo} onChange={(e) => handleUpload("video", e)} />
              </label>
              {form.video && (
                <button type="button" onClick={() => setForm({ ...form, video: "" })} className="ml-2 text-xs text-red-500 hover:underline">
                  Retirer la vidéo
                </button>
              )}
              {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
            </div>

            {activeLang === "fr" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Texte alternatif (Français) *</label>
                <input required value={form.altFr} onChange={(e) => setForm({ ...form, altFr: e.target.value })} placeholder="Décrit l'image pour l'accessibilité" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            ) : (
              <div>
                {!form.altFr && <p className="text-xs text-amber-600 mb-2">Renseignez d'abord le texte français.</p>}
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Alt text (English)</label>
                <input value={form.altEn} onChange={(e) => setForm({ ...form, altEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Visible sur le site
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordre d'affichage</label>
                <input type="number" value={form.displayOrder || ""} placeholder="0" onChange={(e) => setForm({ ...form, displayOrder: e.target.value === "" ? 0 : Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            {saveError && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-600">{saveError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
