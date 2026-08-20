"use client";

import { useState, useEffect } from "react";

type Slide = { id: number; src: string; alt: string };

export default function AdminHero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/hero").then((r) => r.json()).then((d) => { setSlides(d); setLoading(false); });
  }, []);

  const save = async (updated: Slide[]) => {
    setSaving(true);
    await fetch("/api/admin/hero", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setSaving(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    const newSlide: Slide = { id: Date.now(), src: url, alt: newAlt || file.name };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setNewAlt("");
    await save(updated);
    setUploading(false);
    e.target.value = "";
  };

  const remove = async (id: number) => {
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    await save(updated);
  };

  const updateAlt = async (id: number, alt: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, alt } : s));
    setSlides(updated);
    await save(updated);
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hero : Carrousel</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les slides du carrousel de la page d'accueil</p>
      </div>

      {/* Add slide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Ajouter un slide</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            placeholder="Description de l'image (alt)"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
          />
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-green-800 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" />
            </svg>
            {uploading ? "Envoi..." : "Uploader une image"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Slides list */}
      <div className="space-y-3">
        {slides.map((slide, i) => (
          <div key={slide.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <span className="text-xs font-bold text-gray-300 w-6">{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-élément */}
            <img src={slide.src} alt={slide.alt} className="w-32 h-20 object-cover rounded-lg bg-gray-100" />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={slide.alt}
                onChange={(e) => updateAlt(slide.id, e.target.value)}
                className="w-full text-sm font-medium text-gray-900 border-0 border-b border-transparent hover:border-gray-200 focus:border-green-600 focus:outline-none bg-transparent py-1"
              />
              <p className="text-xs text-gray-400 mt-1 truncate">{slide.src}</p>
            </div>
            <button
              onClick={() => remove(slide.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {saving && <p className="mt-4 text-xs text-green-600 font-medium">Sauvegarde...</p>}
    </div>
  );
}
