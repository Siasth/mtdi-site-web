"use client";

import { useState, useEffect } from "react";

type Stat = { value: string; label: string };
type Chantier = {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  stats: Stat[];
};

export default function AdminChantiers() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Chantier | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/chantiers").then((r) => r.json()).then((d) => { setChantiers(d); setLoading(false); });
  }, []);

  const save = async (data: Chantier[]) => {
    setSaving(true);
    await fetch("/api/admin/chantiers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
  };

  const openEdit = (c: Chantier) => setEditing({ ...c, stats: c.stats.map((s) => ({ ...s })) });
  const close = () => setEditing(null);

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

  const updateStat = (idx: number, field: keyof Stat, val: string) => {
    if (!editing) return;
    const stats = [...editing.stats];
    stats[idx] = { ...stats[idx], [field]: val };
    setEditing({ ...editing, stats });
  };

  const saveChantier = async () => {
    if (!editing) return;
    const updated = chantiers.map((c) => (c.id === editing.id ? editing : c));
    setChantiers(updated);
    await save(updated);
    close();
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Grands Chantiers</h1>
        <p className="text-sm text-gray-500 mt-1">Modifiez le contenu et les statistiques des 5 chantiers numériques</p>
      </div>

      <div className="space-y-3">
        {chantiers.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5">
            <span className="text-3xl font-black text-gray-200">{c.number}</span>
            {c.image && (
              /* eslint-disable-next-line @next/next/no-img-élément */
              <img src={c.image} alt="" className="w-24 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{c.subtitle}</p>
              <div className="flex gap-4 mt-2">
                {c.stats.map((s, i) => (
                  <span key={i} className="text-xs text-gray-500">
                    <strong className="text-gray-700">{s.value}</strong> {s.label}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-green-700 rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={close}>
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Chantier {editing.number}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Sous-titre</label>
                <input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Image de fond</label>
                <div className="flex items-center gap-3">
                  {editing.image && (
                    /* eslint-disable-next-line @next/next/no-img-élément */
                    <img src={editing.image} alt="" className="w-24 h-16 object-cover rounded bg-gray-100" />
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    {uploading ? "Envoi..." : "Changer l'image"}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Statistiques</label>
                <div className="space-y-2">
                  {editing.stats.map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Valeur" className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                      <input value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={close} className="px-5 py-2.5 text-sm font-medium text-gray-600">Annuler</button>
              <button onClick={saveChantier} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50">
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
