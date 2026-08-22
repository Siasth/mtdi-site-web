"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";

const VERT = "#006828";

type FormState = {
  siteName: string; siteNameShort: string; taglineFr: string; taglineEn: string;
  logoHeader: string; logoFooter: string; favicon: string;
  facebook: string; twitter: string; linkedin: string; instagram: string; youtube: string;
  contactEmail: string; contactPhone: string; contactAddress: string; locationMapUrl: string;
};

// Format assez permissif : chiffres, espaces, +, -, parenthèses (ex: +229 21 30 00 00)
const PHONE_RE = /^[+\d][\d\s().-]{5,19}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export default function AdminGeneral() {
  const canManage = useHasPermission("parametres.modifier");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (!canManage) return;
    fetch("/api/admin/general-settings")
      .then((r) => r.json())
      .then((d) => {
        setForm({
          siteName: d.siteName || "", siteNameShort: d.siteNameShort || "",
          taglineFr: d.taglineFr || "", taglineEn: d.taglineEn || "",
          logoHeader: d.logoHeader || "", logoFooter: d.logoFooter || "", favicon: d.favicon || "",
          facebook: d.facebook || "", twitter: d.twitter || "", linkedin: d.linkedin || "",
          instagram: d.instagram || "", youtube: d.youtube || "",
          contactEmail: d.contactEmail || "", contactPhone: d.contactPhone || "", contactAddress: d.contactAddress || "",
          locationMapUrl: d.locationMapUrl || "",
        });
        setLoading(false);
      });
  }, [canManage]);

  async function handleUpload(field: "logoHeader" | "logoFooter" | "favicon", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploadingField(field);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setForm({ ...form, [field]: url });
    setUploadingField(null);
    e.target.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    if (!form.siteName.trim()) {
      setMsg({ type: "error", text: "Le nom du ministère est obligatoire." });
      return;
    }
    if (!form.contactEmail.trim()) {
      setMsg({ type: "error", text: "L'email de contact général est obligatoire." });
      return;
    }
    if (!EMAIL_RE.test(form.contactEmail.trim())) {
      setMsg({ type: "error", text: "Adresse email invalide." });
      return;
    }
    if (form.contactPhone && !PHONE_RE.test(form.contactPhone.trim())) {
      setMsg({ type: "error", text: "Numéro de téléphone invalide (ex : +229 01 21 30 00 00)." });
      return;
    }

    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/general-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? { type: "success", text: "Enregistré et pris en compte immédiatement sur le site." } : { type: "error", text: "Erreur lors de l'enregistrement" });
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

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Général</h1>
        <p className="text-sm text-gray-500 mt-1">Nom du site, logos, réseaux sociaux, coordonnées — tout en un seul endroit</p>
        <p className="text-xs text-gray-400 mt-2"><span className="text-red-500">*</span> Champ obligatoire</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Identité</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Nom complet du ministère <span className="text-red-500">*</span>
            </label>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sigle</label>
            <input value={form.siteNameShort} onChange={(e) => setForm({ ...form, siteNameShort: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm max-w-[160px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Slogan (Français)</label>
              <input value={form.taglineFr} onChange={(e) => setForm({ ...form, taglineFr: e.target.value })} placeholder="Optionnel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Slogan (English)</label>
              <input value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} placeholder="Optionnel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Logos</h2>
          {([
            { field: "logoHeader" as const, label: "Logo (en-tête du site)" },
            { field: "logoFooter" as const, label: "Logo (pied de page)" },
            { field: "favicon" as const, label: "Favicon" },
          ]).map(({ field, label }) => (
            <div key={field} className="flex items-center gap-4">
              <div className="w-20 h-14 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
                {form[field] && <img src={form[field]} alt="" className="max-w-full max-h-full object-contain" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                  {uploadingField === field ? "Envoi..." : "Changer"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null} onChange={(e) => handleUpload(field, e)} />
                </label>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Réseaux sociaux</h2>
          <p className="text-xs text-gray-400 -mt-2">Laissez vide pour masquer l'icône correspondante.</p>
          {([
            { field: "facebook" as const, label: "Facebook" },
            { field: "twitter" as const, label: "X (Twitter)" },
            { field: "linkedin" as const, label: "LinkedIn" },
            { field: "instagram" as const, label: "Instagram" },
            { field: "youtube" as const, label: "YouTube" },
          ]).map(({ field, label }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
              <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Coordonnées (pied de page)</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Email de contact général <span className="text-red-500">*</span>
            </label>
            <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="Optionnel — ex : +229 01 21 30 00 00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Adresse</label>
            <textarea
              value={form.contactAddress}
              onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
              placeholder={"Optionnel — ex :\nBoulevard de la Marina\n01 BP 412 Cotonou\nRépublique du Bénin"}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Localisation (lien carte)</label>
            <input
              value={form.locationMapUrl}
              onChange={(e) => setForm({ ...form, locationMapUrl: e.target.value })}
              placeholder="Optionnel — lien Google Maps par exemple"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Affiche un lien "Voir sur la carte" sur la page Contact si renseigné.</p>
          </div>
        </section>

        {msg && <p className={`text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}

        <button type="submit" disabled={saving} className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
