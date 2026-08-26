"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import MarkdownEditor from "../components/MarkdownEditor";
import { uploadFile } from "@/lib/client-upload";

const VERT = "#006828";

type FormState = {
  name: string; photo: string;
  titleFr: string; titleEn: string;
  badgeFr: string; badgeEn: string;
  badgeSubFr: string; badgeSubEn: string;
  headingFr: string; headingEn: string;
  contentFr: string; contentEn: string;
};

export default function AdminMinistre() {
  const canManage = useHasPermission("contenu.modifier");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [form, setForm] = useState<FormState | null>(null);

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/ministre-settings", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d: FormState) => { setForm(d); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  const [uploadError, setUploadError] = useState("");
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file);
      setForm({ ...form, photo: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/ministre-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? { type: "success", text: "Enregistré et visible immédiatement sur le site." } : { type: "error", text: "Erreur lors de l'enregistrement" });
    setSaving(false);
  }

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

  if (loading || !form) return <div className="p-8 text-gray-400">Chargement...</div>;

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
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mot du Ministre</h1>
          <p className="text-sm text-gray-500 mt-1">Section affichée sur la page d'accueil</p>
        </div>
        <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
          <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
            Français
          </button>
          <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2 flex items-center gap-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
            English
            {!form.titleEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Identité (commun aux deux langues)</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
              {form.photo && <img src={form.photo} alt="" className="w-full h-full object-cover" />}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
              {uploading ? "Envoi..." : "Changer la photo"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
            </label>
            {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom complet</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </section>

        {activeLang === "fr" ? (
          <>
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Contenu (Français)</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre / fonction complète</label>
                <input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Badge (ligne 1)</label>
                  <input value={form.badgeFr} onChange={(e) => setForm({ ...form, badgeFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Badge (ligne 2)</label>
                  <input value={form.badgeSubFr} onChange={(e) => setForm({ ...form, badgeSubFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre accrocheur (une phrase par ligne)</label>
                <textarea value={form.headingFr} onChange={(e) => setForm({ ...form, headingFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Contenu détaillé (Français)</h2>
              <p className="text-xs text-gray-400 -mt-2">Plusieurs paragraphes : appuyez sur Entrée pour passer au suivant, comme dans un traitement de texte.</p>
              <MarkdownEditor value={form.contentFr} onChange={(v) => setForm({ ...form, contentFr: v })} rows={6} />
            </section>
          </>
        ) : (
          <>
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              {!form.titleFr && <p className="text-xs text-amber-600">Renseignez d'abord le contenu en français.</p>}
              <h2 className="font-bold text-gray-900">Content (English)</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title / full function</label>
                <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Badge (line 1)</label>
                  <input value={form.badgeEn} onChange={(e) => setForm({ ...form, badgeEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Badge (line 2)</label>
                  <input value={form.badgeSubEn} onChange={(e) => setForm({ ...form, badgeSubEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catchy title (one sentence per line)</label>
                <textarea value={form.headingEn} onChange={(e) => setForm({ ...form, headingEn: e.target.value })} rows={3} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Detailed content (English)</h2>
              <p className="text-xs text-gray-400 -mt-2">Leave empty to keep showing the French version.</p>
              <MarkdownEditor value={form.contentEn} onChange={(v) => setForm({ ...form, contentEn: v })} placeholder="Laisser vide si pas encore traduit" rows={6} />
            </section>
          </>
        )}

        {msg && <p className={`text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}

        <button type="submit" disabled={saving} className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
