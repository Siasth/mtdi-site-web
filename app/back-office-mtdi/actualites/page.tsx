"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import MarkdownEditor from "../components/MarkdownEditor";

const VERT = "#006828";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  publie: { label: "Publié", className: "bg-green-100 text-green-700" },
  depublie: { label: "Dépublié", className: "bg-amber-100 text-amber-700" },
  archive: { label: "Archivé", className: "bg-slate-200 text-slate-600" },
};

const KNOWN_CATEGORIES = ["Communiqué", "Discours", "Dossier", "Revue de presse", "Nomination", "Innovation"];

type Article = {
  id: number;
  title_fr: string;
  title_en: string | null;
  excerpt_fr: string;
  excerpt_en: string | null;
  category: string;
  image: string | null;
  href_external: string | null;
  published_at: string;
  read_time: string;
  featured: boolean;
  display_order: number;
  status: string;
  deleted_at: string | null;
};

type FormState = {
  titleFr: string; titleEn: string; excerptFr: string; excerptEn: string;
  category: string; image: string; hrefExternal: string; publishedAt: string;
  readTime: string; featured: boolean; displayOrder: number; status: string;
};

const emptyForm: FormState = {
  titleFr: "", titleEn: "", excerptFr: "", excerptEn: "",
  category: "Communiqué", image: "", hrefExternal: "", publishedAt: new Date().toISOString().slice(0, 10),
  readTime: "3 min", featured: false, displayOrder: 0, status: "publie",
};

export default function AdminActualites() {
  const canView = useHasPermission("actualites.voir");
  const canCreate = useHasPermission("actualites.creer");
  const canEdit = useHasPermission("actualites.modifier");
  const canDelete = useHasPermission("actualites.supprimer");
  const canRestore = useHasPermission("actualites.restaurer");

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/actualites").then((r) => r.json()).then((d) => { setArticles(d); setLoading(false); });
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
    setForm(emptyForm);
    setEditingId("new");
  }

  function openEdit(a: Article) {
    setForm({
      titleFr: a.title_fr, titleEn: a.title_en || "",
      excerptFr: a.excerpt_fr, excerptEn: a.excerpt_en || "",
      category: a.category, image: a.image || "", hrefExternal: a.href_external || "",
      publishedAt: a.published_at.slice(0, 10), readTime: a.read_time,
      featured: a.featured, displayOrder: a.display_order, status: a.status,
    });
    setEditingId(a.id);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setForm((f) => ({ ...f, image: url }));
    setUploading(false);
    e.target.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const isNew = editingId === "new";
    const url = isNew ? "/api/admin/actualites" : `/api/admin/actualites/${editingId}`;
    await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditingId(null);
    load();
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les articles affichés sur le site (FR / EN)</p>
        </div>
        {canCreate && (
          <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
            + Nouvel article
          </button>
        )}
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
                <td className="px-5 py-3 text-gray-500">{a.category}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_LABELS[a.status]?.className || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[a.status]?.label || a.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(a.published_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-5 py-3">{a.featured ? "✓" : ""}</td>
                <td className="px-5 py-3 text-right space-x-2">
                  {a.deleted_at ? (
                    canRestore && <button onClick={() => handleRestore(a)} className="text-xs font-bold text-green-700 hover:underline">Restaurer</button>
                  ) : (
                    <>
                      {canEdit && <button onClick={() => openEdit(a)} className="text-xs font-bold hover:underline" style={{ color: VERT }}>Modifier</button>}
                      {canDelete && <button onClick={() => handleDelete(a)} className="text-xs font-bold text-red-500 hover:underline">Supprimer</button>}
                    </>
                  )}
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
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-auto">
            <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouvel article" : "Modifier l'article"}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (Français) *</label>
                <input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (English)</label>
                <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Extrait (Français)</label>
                <MarkdownEditor value={form.excerptFr} onChange={(v) => setForm({ ...form, excerptFr: v })} rows={4} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Extrait (English)</label>
                <MarkdownEditor value={form.excerptEn} onChange={(v) => setForm({ ...form, excerptEn: v })} placeholder="Laisser vide si pas encore traduit" rows={4} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catégorie</label>
                <input
                  required
                  list="categories-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <datalist id="categories-suggestions">
                  {KNOWN_CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Statut</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                  <option value="depublie">Dépublié</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de publication</label>
                <input required type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Temps de lecture</label>
              <input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm max-w-[160px]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lien externe (optionnel)</label>
              <input value={form.hrefExternal} onChange={(e) => setForm({ ...form, hrefExternal: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image</label>
              {form.image && <img src={form.image} alt="" className="h-24 rounded-lg mb-2 object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploading ? "Envoi..." : "Choisir une image"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Afficher dans "À la une"
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

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
