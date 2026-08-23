"use client";

import { useState, useEffect } from "react";
import { uploadFile } from "@/lib/client-upload";

type GalerieItem = {
  id: number;
  type: "photo" | "video";
  title: string;
  description: string;
  date: string;
  credit: string;
  collection: string;
  image: string;
};

const collections = ["Événements officiels", "Infrastructures", "Formation & Jeunesse", "Cybersécurité", "Coopération internationale"];

const emptyItem: Omit<GalerieItem, "id"> = {
  type: "photo",
  title: "",
  description: "",
  date: "",
  credit: "",
  collection: collections[0],
  image: "",
};

export default function AdminGalerie() {
  const [items, setItems] = useState<GalerieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalerieItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("Toutes");

  const load = () => {
    fetch("/api/admin/galerie").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); });
  };
  useEffect(load, []);

  const filtered = filter === "Toutes" ? items : items.filter((i) => i.collection === filter);

  const openNew = () => { setEditing({ ...emptyItem, id: 0 }); setIsNew(true); };
  const openEdit = (item: GalerieItem) => { setEditing({ ...item }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const [uploadError, setUploadError] = useState("");
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file);
      setEditing({ ...editing, image: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
    }
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    if (isNew) {
      const { id, ...data } = editing;
      void id;
      await fetch("/api/admin/galerie", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      const updated = items.map((i) => (i.id === editing.id ? editing : i));
      await fetch("/api/admin/galerie", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    }
    close();
    setSaving(false);
    load();
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/admin/galerie?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} élément(s)</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
          Ajouter un média
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["Toutes", ...collections].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              filter === c ? "bg-green-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
            <div className="relative aspect-[16/10] bg-gray-100">
              {item.image ? (
                /* eslint-disable-next-line @next/next/no-img-élément */
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <svg width="32" height="32" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24" className="opacity-30">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              {item.type === "video" && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">VIDÉO</span>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-1">{item.collection} · {item.date}</p>
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">{item.title}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-green-700 rounded transition-colors" title="Modifier">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors" title="Supprimer">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={close}>
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Ajouter un média" : "Modifier"}</h2>
              <button onClick={close} className="p-1 text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
                  <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as "photo" | "video" })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600">
                    <option value="photo">Photo</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Collection</label>
                  <select value={editing.collection} onChange={(e) => setEditing({ ...editing, collection: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600">
                    {collections.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date</label>
                  <input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Crédit</label>
                  <input value={editing.credit} onChange={(e) => setEditing({ ...editing, credit: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
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
                  {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={close} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
              <button onClick={saveItem} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50">
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
