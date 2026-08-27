"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import MarkdownEditor from "../components/MarkdownEditor";
import { uploadFile } from "@/lib/client-upload";
import VersionHistory from "../components/VersionHistory";

const VERT = "#006828";

type ParcoursItem = { period: string; title: string; description: string };
type PrioriteItem = { title: string; description: string };

type FormState = {
  name: string; photo: string;
  breadcrumbFr: string; breadcrumbEn: string;
  sousTitreFr: string; sousTitreEn: string;
  badgeFr: string; badgeEn: string;
  badgeSousTitreFr: string; badgeSousTitreEn: string;
  signatureTitreFr: string; signatureTitreEn: string;
  imageAltFr: string; imageAltEn: string;
  bioContentFr: string; bioContentEn: string;
  wikipediaUrl: string;
  parcoursFr: ParcoursItem[]; parcoursEn: ParcoursItem[];
  prioritesFr: PrioriteItem[]; prioritesEn: PrioriteItem[];
};

export default function AdminMinistreBio() {
  const canManage = useHasPermission("ministere.gerer");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [form, setForm] = useState<FormState | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/ministre-bio", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d: FormState) => { setForm(d); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form.photo);
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
    const res = await fetch("/api/admin/ministre-bio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? { type: "success", text: "Enregistré et visible immédiatement sur le site." } : { type: "error", text: "Erreur lors de l'enregistrement" });
    setSaving(false);
  }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading || !form) return <div className="p-8 text-gray-400">Chargement...</div>;
  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 max-w-xl">
          <p className="font-bold text-red-700 mb-1">Erreur de chargement</p>
          <p className="text-sm text-red-600 whitespace-pre-wrap">{loadError}</p>
          <button onClick={load} className="mt-4 px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Réessayer</button>
        </div>
      </div>
    );
  }

  const suffix = activeLang === "fr" ? "Fr" : "En";
  const parcours = form[`parcours${suffix}` as "parcoursFr" | "parcoursEn"] || [];
  const priorites = form[`priorites${suffix}` as "prioritesFr" | "prioritesEn"] || [];

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: val } : f));
  }

  function updateParcours(i: number, field: keyof ParcoursItem, val: string) {
    const key = `parcours${suffix}` as "parcoursFr" | "parcoursEn";
    const list = [...parcours]; list[i] = { ...list[i], [field]: val };
    setField(key, list);
  }
  function addParcours() {
    const key = `parcours${suffix}` as "parcoursFr" | "parcoursEn";
    setField(key, [...parcours, { period: "", title: "", description: "" }]);
  }
  function removeParcours(i: number) {
    const key = `parcours${suffix}` as "parcoursFr" | "parcoursEn";
    setField(key, parcours.filter((_, idx) => idx !== i));
  }

  function updatePriorite(i: number, field: keyof PrioriteItem, val: string) {
    const key = `priorites${suffix}` as "prioritesFr" | "prioritesEn";
    const list = [...priorites]; list[i] = { ...list[i], [field]: val };
    setField(key, list);
  }
  function addPriorite() {
    const key = `priorites${suffix}` as "prioritesFr" | "prioritesEn";
    setField(key, [...priorites, { title: "", description: "" }]);
  }
  function removePriorite(i: number) {
    const key = `priorites${suffix}` as "prioritesFr" | "prioritesEn";
    setField(key, priorites.filter((_, idx) => idx !== i));
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Le Ministre — Page biographie</h1>
          <p className="text-sm text-gray-500 mt-1">Page complète /le-ministere/le-ministre (distincte du widget accueil)</p>
          <button type="button" onClick={() => setShowHistory(true)} className="text-xs font-bold hover:underline mt-1" style={{ color: VERT }}>
            Historique
          </button>
        </div>
        <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
          <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>Français</button>
          <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>English</button>
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
          </div>
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom complet</label>
            <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lien Wikipédia (bouton "Voir plus")</label>
            <input value={form.wikipediaUrl} onChange={(e) => setField("wikipediaUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Textes courts ({activeLang === "fr" ? "Français" : "English"})</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fil d'Ariane</label><input value={form[`breadcrumb${suffix}`]} onChange={(e) => setField(`breadcrumb${suffix}` as "breadcrumbFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Badge</label><input value={form[`badge${suffix}`]} onChange={(e) => setField(`badge${suffix}` as "badgeFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Badge (sous-titre)</label><input value={form[`badgeSousTitre${suffix}`]} onChange={(e) => setField(`badgeSousTitre${suffix}` as "badgeSousTitreFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre signature</label><input value={form[`signatureTitre${suffix}`]} onChange={(e) => setField(`signatureTitre${suffix}` as "signatureTitreFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sous-titre (fonction complète)</label>
            <input value={form[`sousTitre${suffix}`]} onChange={(e) => setField(`sousTitre${suffix}` as "sousTitreFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Texte alternatif photo (accessibilité)</label>
            <input value={form[`imageAlt${suffix}`]} onChange={(e) => setField(`imageAlt${suffix}` as "imageAltFr", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Biographie ({activeLang === "fr" ? "Français" : "English"})</h2>
          <MarkdownEditor
            value={activeLang === "fr" ? form.bioContentFr : form.bioContentEn}
            onChange={(v) => setField(activeLang === "fr" ? "bioContentFr" : "bioContentEn", v)}
            placeholder={activeLang === "en" ? "Laisser vide si pas encore traduit" : undefined}
            rows={8}
          />
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Parcours ({activeLang === "fr" ? "Français" : "English"})</h2>
            <button type="button" onClick={addParcours} className="text-xs font-bold hover:underline" style={{ color: VERT }}>+ Ajouter une étape</button>
          </div>
          {parcours.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-2 relative">
              <button type="button" onClick={() => removeParcours(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs">✕ Retirer</button>
              <div className="grid grid-cols-2 gap-3">
                <input value={item.period} onChange={(e) => updateParcours(i, "period", e.target.value)} placeholder="Période (optionnel, ex: Mai 2026)" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                <input value={item.title} onChange={(e) => updateParcours(i, "title", e.target.value)} placeholder="Titre" className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <textarea value={item.description} onChange={(e) => updateParcours(i, "description", e.target.value)} placeholder="Description" rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Priorités ministérielles ({activeLang === "fr" ? "Français" : "English"})</h2>
            <button type="button" onClick={addPriorite} className="text-xs font-bold hover:underline" style={{ color: VERT }}>+ Ajouter une priorité</button>
          </div>
          {priorites.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-2 relative">
              <span className="absolute top-2 left-2 text-xs font-black text-gray-300">{String(i + 1).padStart(2, "0")}</span>
              <button type="button" onClick={() => removePriorite(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs">✕ Retirer</button>
              <input value={item.title} onChange={(e) => updatePriorite(i, "title", e.target.value)} placeholder="Titre de la priorité" className="w-full px-2 py-1.5 mt-4 border border-gray-200 rounded-lg text-sm font-semibold" />
              <textarea value={item.description} onChange={(e) => updatePriorite(i, "description", e.target.value)} placeholder="Description" rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </section>

        {msg && <p className={`text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}

        <button type="submit" disabled={saving} className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      {showHistory && form && (
        <VersionHistory
          table="settings"
          recordId="ministre_bio"
          current={form as unknown as Record<string, unknown>}
          fieldLabels={{ name: "Nom", photo: "Photo", bioContentFr: "Biographie (FR)", bioContentEn: "Biographie (EN)", prioritesFr: "Priorités (FR)", prioritesEn: "Priorités (EN)", parcoursFr: "Parcours (FR)", parcoursEn: "Parcours (EN)" }}
          canRestore={canManage}
          onRestored={load}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
