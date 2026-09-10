"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { uploadFile, fileNameFromUrl } from "@/lib/client-upload";
import MarkdownEditor from "../components/MarkdownEditor";
import { ColorContrastHint } from "../components/ColorContrastHint";

const VERT = "#006828";

type StatItem = { value: string; labelFr: string; labelEn?: string };

type Chantier = {
  id: number;
  number: string;
  title_fr: string; title_en: string | null;
  subtitle_fr: string | null; subtitle_en: string | null;
  description_fr: string | null; description_en: string | null;
  image: string | null; video: string | null; color: string | null;
  stats: StatItem[];
  display_order: number; active: boolean; deleted_at: string | null;
};

type FormState = {
  number: string; titleFr: string; titleEn: string;
  subtitleFr: string; subtitleEn: string;
  descriptionFr: string; descriptionEn: string;
  image: string; video: string; color: string;
  stats: StatItem[];
  displayOrder: number; active: boolean;
};

const emptyForm: FormState = {
  number: "", titleFr: "", titleEn: "", subtitleFr: "", subtitleEn: "",
  descriptionFr: "", descriptionEn: "", image: "", video: "", color: "#006828",
  stats: [], displayOrder: 0, active: true,
};

// ANO-137 : le descriptif est tronqué en front-office (line-clamp-2, sans
// lien "lire la suite" — voir GrandsChantiers.tsx), sans qu'aucune limite ne
// soit indiquée ni contrôlée à la saisie. On fixe une limite cohérente avec
// cet affichage (2 lignes) et on la fait respecter côté formulaire.
const DESCRIPTION_MAX_CHARS = 220;
function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function AdminChantiers() {
  const canManage = useHasPermission("accueil.gerer");
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/chantiers", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d) => { setChantiers(d); setLoading(false); })
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
    setForm({ ...emptyForm, number: String(chantiers.length + 1).padStart(2, "0"), displayOrder: chantiers.length });
    setActiveLang("fr");
    setSaveError("");
    setEditingId("new");
  }

  function openEdit(c: Chantier) {
    setForm({
      number: c.number, titleFr: c.title_fr, titleEn: c.title_en || "",
      subtitleFr: c.subtitle_fr || "", subtitleEn: c.subtitle_en || "",
      descriptionFr: c.description_fr || "", descriptionEn: c.description_en || "",
      image: c.image || "", video: c.video || "", color: c.color || "#006828",
      stats: c.stats || [], displayOrder: c.display_order, active: c.active,
    });
    setActiveLang("fr");
    setSaveError("");
    setEditingId(c.id);
  }

  const [uploadError, setUploadError] = useState("");
  async function handleUpload(field: "image" | "video", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form[field] as string);
      setForm((f) => ({ ...f, [field]: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  function updateStat(i: number, field: "value" | "labelFr" | "labelEn", val: string) {
    const next = [...form.stats];
    next[i] = { ...next[i], [field]: val };
    setForm({ ...form, stats: next });
  }
  function addStat() {
    if (form.stats.length >= 3) return;
    setForm({ ...form, stats: [...form.stats, { value: "", labelFr: "", labelEn: "" }] });
  }
  function removeStat(i: number) {
    setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setSaveError("Veuillez importer une image avant d'enregistrer.");
      return;
    }
    if (plainText(form.descriptionFr).length > DESCRIPTION_MAX_CHARS) {
      setSaveError(`Le descriptif (Français) dépasse la limite de ${DESCRIPTION_MAX_CHARS} caractères. Raccourcissez-le avant d'enregistrer.`);
      return;
    }
    if (plainText(form.descriptionEn).length > DESCRIPTION_MAX_CHARS) {
      setSaveError(`Le descriptif (English) dépasse la limite de ${DESCRIPTION_MAX_CHARS} caractères. Raccourcissez-le avant d'enregistrer.`);
      return;
    }
    setSaving(true);
    setSaveError("");
    const isNew = editingId === "new";
    const res = await fetch(isNew ? "/api/admin/chantiers" : `/api/admin/chantiers/${editingId}`, {
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

  async function handleDelete(c: Chantier) {
    if (!confirm(`Supprimer "${c.title_fr}" ? (réversible)`)) return;
    await fetch(`/api/admin/chantiers/${c.id}`, { method: "DELETE" });
    load();
  }

  async function handleRestore(c: Chantier) {
    await fetch(`/api/admin/chantiers/${c.id}`, {
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

  const { pageItems, totalPages, safePage } = paginate(chantiers, page, 10);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grands Chantiers</h1>
          <p className="text-sm text-gray-500 mt-1">Priorités nationales affichées sur la page d'accueil</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
          + Nouveau chantier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Titre (FR)</th>
              <th className="px-5 py-3">Traduction EN</th>
              <th className="px-5 py-3">Chiffres</th>
              <th className="px-5 py-3">Visible</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.map((c) => (
              <tr key={c.id} className={c.deleted_at ? "opacity-40" : ""}>
                <td className="px-5 py-3 font-black" style={{ color: c.color || VERT }}>{c.number}</td>
                <td className="px-5 py-3 font-medium text-gray-900 max-w-sm">{c.title_fr}</td>
                <td className="px-5 py-3">
                  {c.title_en ? <span className="text-xs text-green-700">✓ traduit</span> : <span className="text-xs text-amber-600">⚠ non traduit</span>}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{(c.stats || []).length}/3</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.active ? "Actif" : "Masqué"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {c.deleted_at ? (
                      <RestoreIcon label="Restaurer" onClick={() => handleRestore(c)} />
                    ) : (
                      <>
                        <EditIcon label="Modifier" onClick={() => openEdit(c)} />
                        <DeleteIcon label="Supprimer" onClick={() => handleDelete(c)} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {chantiers.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Aucun chantier</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-3xl shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouveau chantier" : "Modifier le chantier"}</h2>
              <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  Français
                </button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2 flex items-center gap-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  Version anglaise
                  {!form.titleEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
                </button>
              </div>
              <ModalCloseButton onClick={() => setEditingId(null)} />
            </div>

            {activeLang === "fr" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Numéro</label>
                    <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="01" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (Français) *</label>
                    <input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sous-titre</label>
                  <input value={form.subtitleFr} onChange={(e) => setForm({ ...form, subtitleFr: e.target.value })} placeholder="ex : SNIAM 2023-2027" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Français)</label>
                  <MarkdownEditor value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} rows={4} />
                  <p className={`text-[11px] mt-1 ${plainText(form.descriptionFr).length > DESCRIPTION_MAX_CHARS ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                    {plainText(form.descriptionFr).length} / {DESCRIPTION_MAX_CHARS} caractères
                    {plainText(form.descriptionFr).length > DESCRIPTION_MAX_CHARS && " — limite dépassée, le texte sera coupé sur le site"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!form.titleFr && <p className="text-xs text-amber-600">Renseignez d'abord le contenu en français.</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title (English)</label>
                  <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subtitle (English)</label>
                  <input value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (English)</label>
                  <MarkdownEditor value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} placeholder="Laisser vide si pas encore traduit" rows={4} />
                  <p className={`text-[11px] mt-1 ${plainText(form.descriptionEn).length > DESCRIPTION_MAX_CHARS ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                    {plainText(form.descriptionEn).length} / {DESCRIPTION_MAX_CHARS} caractères
                    {plainText(form.descriptionEn).length > DESCRIPTION_MAX_CHARS && " — limite dépassée, le texte sera coupé sur le site"}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image de fond *</label>
              {form.image && <img src={form.image} alt="" className="h-24 rounded-lg mb-2 object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploading === "image" ? "Envoi..." : "Choisir une image"}
                <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => handleUpload("image", e)} />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vidéo de fond (optionnel — remplace l'image si présente)</label>
              {/* Aligné sur le même correctif que Hero (ANO-132) : n'afficher
                  que le nom de fichier, pas l'URL complète de stockage. */}
              {form.video && <p className="text-xs text-gray-500 mb-2 truncate">{fileNameFromUrl(form.video)}</p>}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploading === "video" ? "Import en cours…" : "Choisir une vidéo"}
                <input type="file" accept="video/*" className="hidden" disabled={!!uploading} onChange={(e) => handleUpload("video", e)} />
              </label>
              {form.video && (
                <button type="button" onClick={() => setForm({ ...form, video: "" })} className="ml-2 text-xs text-red-500 hover:underline">Retirer</button>
              )}
              {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Couleur d'accent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-9 rounded border border-gray-200 cursor-pointer" />
                <span className="text-xs text-gray-400 font-mono">{form.color}</span>
              </div>
              <ColorContrastHint color={form.color} />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chiffres clés (max 3)</label>
                {form.stats.length < 3 && (
                  <button type="button" onClick={addStat} className="text-xs font-bold hover:underline" style={{ color: VERT }}>+ Ajouter</button>
                )}
              </div>
              {form.stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Valeur (ex: 12)" className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                  <input
                    value={activeLang === "fr" ? s.labelFr : (s.labelEn || "")}
                    onChange={(e) => updateStat(i, activeLang === "fr" ? "labelFr" : "labelEn", e.target.value)}
                    placeholder={activeLang === "fr" ? "Libellé FR" : "Label EN"}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                  <button type="button" onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
                </div>
              ))}
              {form.stats.length === 0 && <p className="text-xs text-gray-400">Aucun chiffre — optionnel.</p>}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Visible sur le site
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
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
