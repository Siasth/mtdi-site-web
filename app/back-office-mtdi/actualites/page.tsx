"use client";

import { useState, useEffect } from "react";

type Article = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  link: string;
  readTime: string;
};

const emptyArticle: Omit<Article, "id"> = {
  category: "",
  title: "",
  excerpt: "",
  date: "",
  image: "",
  link: "",
  readTime: "3 min",
};

export default function AdminActualités() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    fetch("/api/admin/actualites").then((r) => r.json()).then((d) => { setArticles(d); setLoading(false); });
  };
  useEffect(load, []);

  const openNew = () => {
    setEditing({ ...emptyArticle, id: 0 });
    setIsNew(true);
  };

  const openEdit = (a: Article) => {
    setEditing({ ...a });
    setIsNew(false);
  };

  const close = () => { setEditing(null); setIsNew(false); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setEditing({ ...editing, image: url });
    setUploading(false);
  };

  const saveArticle = async () => {
    if (!editing) return;
    setSaving(true);
    if (isNew) {
      const { id, ...data } = editing;
      void id;
      await fetch("/api/admin/actualites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      const updated = articles.map((a) => (a.id === editing.id ? editing : a));
      await fetch("/api/admin/actualites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    }
    close();
    setSaving(false);
    load();
  };

  const deleteArticle = async (id: number) => {
    await fetch(`/api/admin/actualites?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
          <p className="text-sm text-gray-500 mt-1">{articles.length} article(s)</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" />
          </svg>
          Nouvel article
        </button>
      </div>

      {/* Articles list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégorie</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {a.image && (
                      /* eslint-disable-next-line @next/next/no-img-élément */
                      <img src={a.image} alt="" className="w-12 h-8 object-cover rounded bg-gray-100 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900 line-clamp-2">{a.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                    {a.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{a.date}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-green-700 rounded transition-colors" title="Modifier">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button onClick={() => deleteArticle(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors" title="Supprimer">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={close}>
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Nouvel article" : "Modifier l'article"}</h2>
              <button onClick={close} className="p-1 text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Catégorie</label>
                  <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date</label>
                  <input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Extrait</label>
                <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Lien externe</label>
                <input value={editing.link} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Temps de lecture</label>
                <input value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Image</label>
                <div className="flex items-center gap-3">
                  {editing.image && (
                    /* eslint-disable-next-line @next/next/no-img-élément */
                    <img src={editing.image} alt="" className="w-20 h-14 object-cover rounded bg-gray-100" />
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    {uploading ? "Envoi..." : "Choisir une image"}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={close} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
              <button onClick={saveArticle} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50">
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
