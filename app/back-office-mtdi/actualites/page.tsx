"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHasPermission } from "../AdminLayoutClient";
import MarkdownEditor from "../components/MarkdownEditor";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { cleanupOldFile } from "@/lib/client-upload";
import VersionHistory from "../components/VersionHistory";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  publie: { label: "Publié", className: "bg-green-100 text-green-700" },
  depublie: { label: "Dépublié", className: "bg-amber-100 text-amber-700" },
  archive: { label: "Archivé", className: "bg-slate-200 text-slate-600" },
};

type Category = { id: number; name_fr: string; name_en: string | null; color: string };

type Attachment = { name: string; url: string; kind?: "file" | "link" };

type Article = {
  id: number;
  title_fr: string;
  title_en: string | null;
  excerpt_fr: string;
  excerpt_en: string | null;
  category_id: number | null;
  cat_name_fr: string | null;
  image: string | null;
  href_external: string | null;
  published_at: string;
  read_time: string;
  featured: boolean;
  display_order: number;
  status: string;
  attachments: Attachment[];
  scheduled_at: string | null;
  deleted_at: string | null;
};

type FormState = {
  titleFr: string; titleEn: string; excerptFr: string; excerptEn: string;
  categoryId: number | ""; image: string; hrefExternal: string; publishedAt: string;
  readTime: string; featured: boolean; displayOrder: number; status: string;
  attachments: Attachment[];
  scheduledAt: string; // datetime-local ("" = publication immédiate)
};

const emptyForm: FormState = {
  titleFr: "", titleEn: "", excerptFr: "", excerptEn: "",
  categoryId: "", image: "", hrefExternal: "", publishedAt: new Date().toISOString().slice(0, 10),
  readTime: "3 min", featured: false, displayOrder: 0, status: "publie",
  attachments: [], scheduledAt: "",
};

// datetime-local (navigateur) n'a pas de fuseau horaire — on convertit
// explicitement via l'heure locale du navigateur pour éviter tout décalage
// une fois stocké en TIMESTAMPTZ (le Bénin est UTC+1 toute l'année).
function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function datetimeLocalToIso(local: string): string {
  if (!local) return "";
  return new Date(local).toISOString();
}

export default function AdminActualites() {
  const canView = useHasPermission("actualites.voir");
  const canCreate = useHasPermission("actualites.creer");
  const canEdit = useHasPermission("actualites.modifier");
  const canDelete = useHasPermission("actualites.supprimer");
  const canRestore = useHasPermission("actualites.restaurer");

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  const [loadError, setLoadError] = useState("");

  function load() {
    setLoading(true);
    setLoadError("");
    Promise.all([
      fetch("/api/admin/actualites", { cache: "no-store" }).then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} sur /api/admin/actualites : ${await r.text()}`);
        return r.json();
      }),
      fetch("/api/admin/categories", { cache: "no-store" }).then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} sur /api/admin/categories : ${await r.text()}`);
        return r.json();
      }),
    ])
      .then(([articlesData, categoriesData]) => {
        setArticles(articlesData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message || "Erreur de chargement");
        setLoading(false);
      });
  }
  useEffect(() => { if (canView) load(); }, [canView]);

  if (!canView) {
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
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setActiveLang("fr");
    setSaveError("");
    setEditingId("new");
  }

  function articleToForm(a: Article): FormState {
    return {
      titleFr: a.title_fr, titleEn: a.title_en || "",
      excerptFr: a.excerpt_fr, excerptEn: a.excerpt_en || "",
      categoryId: a.category_id ?? "", image: a.image || "", hrefExternal: a.href_external || "",
      publishedAt: a.published_at.slice(0, 10), readTime: a.read_time,
      featured: a.featured, displayOrder: a.display_order, status: a.status,
      attachments: a.attachments || [],
      scheduledAt: isoToDatetimeLocal(a.scheduled_at),
    };
  }

  function openEdit(a: Article) {
    setForm(articleToForm(a));
    setActiveLang("fr");
    setSaveError("");
    setEditingId(a.id);
  }

  const [uploadError, setUploadError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form.image ?? undefined);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  async function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    setAttachmentError("");
    try {
      const { url, name } = await uploadFile(file);
      setForm((f) => ({ ...f, attachments: [...f.attachments, { name, url, kind: "file" }] }));
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  }

  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  function addLink() {
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    setForm((f) => ({ ...f, attachments: [...f.attachments, { name: linkLabel.trim(), url: linkUrl.trim(), kind: "link" }] }));
    setLinkLabel("");
    setLinkUrl("");
  }
  function removeAttachment(i: number) {
    setForm((f) => {
      const removed = f.attachments[i];
      if (removed?.kind === "file" && removed.url) cleanupOldFile(removed.url);
      return { ...f, attachments: f.attachments.filter((_, idx) => idx !== i) };
    });
  }

  const [saveError, setSaveError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const isNew = editingId === "new";
    const url = isNew ? "/api/admin/actualites" : `/api/admin/actualites/${editingId}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledAt: datetimeLocalToIso(form.scheduledAt) }),
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

  async function handleDelete(a: Article) {
    if (!confirm(`Supprimer "${a.title_fr}" ? (réversible)`)) return;
    await fetch(`/api/admin/actualites/${a.id}`, { method: "DELETE" });
    load();
  }

  async function handleRestore(a: Article) {
    await fetch(`/api/admin/actualites/${a.id}`, {
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les articles affichés sur le site (FR / EN)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/back-office-mtdi/categories"
            className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Gérer les catégories
          </Link>
          {canCreate && (
            <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
              + Nouvel article
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Titre (FR)</th>
              <th className="px-5 py-3">Traduction EN</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">À la une</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((a) => (
              <tr key={a.id} className={a.deleted_at ? "opacity-40" : ""}>
                <td className="px-5 py-3 font-medium text-gray-900 max-w-xs">{a.title_fr}</td>
                <td className="px-5 py-3">
                  {a.title_en ? (
                    <span className="text-xs text-green-700">✓ traduit</span>
                  ) : (
                    <span className="text-xs text-amber-600">⚠ non traduit</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{a.cat_name_fr || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_LABELS[a.status]?.className || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[a.status]?.label || a.status}
                  </span>
                  {a.status === "publie" && a.scheduled_at && new Date(a.scheduled_at) > new Date() && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700" title={`Publication le ${new Date(a.scheduled_at).toLocaleString("fr-FR")}`}>
                      Programmé
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(a.published_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-5 py-3">{a.featured ? "✓" : ""}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {a.deleted_at ? (
                      canRestore && <RestoreIcon label="Restaurer" onClick={() => handleRestore(a)} />
                    ) : (
                      <>
                        {canEdit && <EditIcon label="Modifier" onClick={() => openEdit(a)} />}
                        {canDelete && <DeleteIcon label="Supprimer" onClick={() => handleDelete(a)} />}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Aucun article</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-6xl shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouvel article" : "Modifier l'article"}</h2>
                {editingId !== "new" && (
                  <button type="button" onClick={() => setShowHistory(true)} className="text-xs font-bold hover:underline" style={{ color: VERT }}>
                    Historique
                  </button>
                )}
              </div>
              {/* Onglets de langue : on édite le FR puis l'EN l'un après l'autre, jamais côte à côte */}
              <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveLang("fr")}
                  className="px-4 py-2"
                  style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLang("en")}
                  className="px-4 py-2 flex items-center gap-1.5"
                  style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}
                >
                  English
                  {!form.titleEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
                </button>
              </div>
            </div>

            {activeLang === "fr" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (Français) *</label>
                  <input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Extrait (Français)</label>
                  <MarkdownEditor value={form.excerptFr} onChange={(v) => setForm({ ...form, excerptFr: v })} rows={6} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!form.titleFr && (
                  <p className="text-xs text-amber-600">Renseignez d'abord le contenu en français (onglet précédent).</p>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (English)</label>
                  <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Extrait (English)</label>
                  <MarkdownEditor value={form.excerptEn} onChange={(v) => setForm({ ...form, excerptEn: v })} placeholder="Laisser vide si pas encore traduit" rows={6} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Catégorie</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="" disabled>Sélectionner...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Statut</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                  <option value="depublie">Dépublié</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
              {form.status === "publie" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Publier plus tard (optionnel)</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.scheduledAt
                      ? "L'article restera invisible sur le site jusqu'à cette date et heure."
                      : "Laisser vide pour une publication immédiate."}
                  </p>
                  {form.scheduledAt && (
                    <button type="button" onClick={() => setForm({ ...form, scheduledAt: "" })} className="text-xs font-bold text-red-600 hover:underline mt-1">
                      Annuler la programmation (publier maintenant)
                    </button>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Date de publication</label>
                <input required type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Temps de lecture</label>
                <input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm max-w-[160px]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lien externe (optionnel)</label>
                <input value={form.hrefExternal} onChange={(e) => setForm({ ...form, hrefExternal: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image</label>
              {form.image && <img src={form.image} alt="" className="h-24 rounded-lg mb-2 object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploading ? "Envoi..." : "Choisir une image"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
              {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Afficher dans "À la une"
                <span className="text-xs text-gray-400">
                  ({articles.filter((a) => a.featured && a.status === "publie" && !a.deleted_at && a.id !== editingId).length}/8)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Ressources associées
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Documents, ou liens vers la Galerie, la Vidéothèque, un article externe, etc.
              </p>

              {form.attachments.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${a.kind === "link" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {a.kind === "link" ? "Lien" : "Fichier"}
                    </span>
                    <span className="truncate">{a.name}</span>
                  </div>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕ Retirer</button>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 mt-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                  {uploadingAttachment ? "Envoi..." : "📎 Uploader un fichier"}
                  <input type="file" className="hidden" disabled={uploadingAttachment} onChange={handleAttachmentUpload} />
                </label>
              </div>
              {attachmentError && <p className="text-xs text-red-600 mt-1">{attachmentError}</p>}

              <div className="flex flex-col sm:flex-row gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                <input
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Libellé (ex: Voir la galerie photos)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... (Galerie, Vidéothèque, YouTube...)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!linkLabel.trim() || !linkUrl.trim()}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-40 flex-shrink-0"
                  style={{ background: VERT }}
                >
                  + Ajouter le lien
                </button>
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

      {showHistory && editingId !== null && editingId !== "new" && (() => {
        const article = articles.find((a) => a.id === editingId);
        if (!article) return null;
        return (
          <VersionHistory
            table="actualites"
            recordId={article.id}
            current={article}
            fieldLabels={{ title_fr: "Titre (FR)", title_en: "Titre (EN)", excerpt_fr: "Extrait (FR)", excerpt_en: "Extrait (EN)", image: "Image", status: "Statut", featured: "À la une", published_at: "Date de publication", scheduled_at: "Publication différée" }}
            canRestore={canEdit}
            onRestored={load}
            onDataRestored={(snapshot) => setForm(articleToForm(snapshot as unknown as Article))}
            onClose={() => setShowHistory(false)}
          />
        );
      })()}
    </div>
  );
}
