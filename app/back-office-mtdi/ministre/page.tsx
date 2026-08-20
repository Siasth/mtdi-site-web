"use client";

import { useState, useEffect } from "react";

type MinistreData = {
  name: string;
  title: string;
  photo: string;
  badge: string;
  badgeSub: string;
  heading: string;
  paragraphs: string[];
};

export default function AdminMinistre() {
  const [data, setData] = useState<MinistreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ministre").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setData({ ...data, photo: url });
    setUploading(false);
  };

  const updateParagraph = (idx: number, val: string) => {
    if (!data) return;
    const paragraphs = [...data.paragraphs];
    paragraphs[idx] = val;
    setData({ ...data, paragraphs });
  };

  const addParagraph = () => {
    if (!data) return;
    setData({ ...data, paragraphs: [...data.paragraphs, ""] });
  };

  const removeParagraph = (idx: number) => {
    if (!data) return;
    setData({ ...data, paragraphs: data.paragraphs.filter((_, i) => i !== idx) });
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    await fetch("/api/admin/ministre", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
  };

  if (loading || !data) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mot du Ministre</h1>
          <p className="text-sm text-gray-500 mt-1">Section &quot;Le mot du Ministre&quot; de la page d'accueil</p>
        </div>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50">
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4">Photo officielle</h2>
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
            {data.photo && (
              /* eslint-disable-next-line @next/next/no-img-élément */
              <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-full justify-center">
            {uploading ? "Envoi..." : "Changer la photo"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Infos + message */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identité */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Identité</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nom complet</label>
              <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre / Fonction</label>
              <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Badge</label>
                <input value={data.badge} onChange={(e) => setData({ ...data, badge: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Sous-badge</label>
                <input value={data.badgeSub} onChange={(e) => setData({ ...data, badgeSub: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Message</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre / Accroche</label>
              <textarea value={data.heading} onChange={(e) => setData({ ...data, heading: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" placeholder="Utiliser \n pour les sauts de ligne" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Paragraphes</label>
                <button onClick={addParagraph} className="text-xs font-semibold text-green-700 hover:text-green-800">+ Ajouter</button>
              </div>
              <div className="space-y-3">
                {data.paragraphs.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea value={p} onChange={(e) => updateParagraph(i, e.target.value)} rows={3} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" />
                    {data.paragraphs.length > 1 && (
                      <button onClick={() => removeParagraph(i)} className="p-2 text-gray-400 hover:text-red-600 self-start transition-colors">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
