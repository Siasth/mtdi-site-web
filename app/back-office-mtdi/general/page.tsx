"use client";

import { useState, useEffect } from "react";
import { uploadFile } from "@/lib/client-upload";
import { useHasPermission } from "../AdminLayoutClient";
import { URL_PATTERN } from "@/lib/validators";

const VERT = "#006828";

type FormState = {
  siteName: string; siteNameShort: string; taglineFr: string; taglineEn: string;
  logoHeader: string; logoFooter: string; favicon: string;
  facebook: string; twitter: string; linkedin: string; instagram: string; youtube: string;
  contactEmail: string; ministreEmail: string; contactPhone: string; contactAddress: string; contactAddressEn: string;
  openingHoursFr: string; openingHoursEn: string; locationMapUrl: string;
  strategieIaDocUrl: string;
  appelsOffresExternalUrl: string;
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
    fetch("/api/admin/general-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setForm({
          siteName: d.siteName || "", siteNameShort: d.siteNameShort || "",
          taglineFr: d.taglineFr || "", taglineEn: d.taglineEn || "",
          logoHeader: d.logoHeader || "", logoFooter: d.logoFooter || "", favicon: d.favicon || "",
          facebook: d.facebook || "", twitter: d.twitter || "", linkedin: d.linkedin || "",
          instagram: d.instagram || "", youtube: d.youtube || "",
          contactEmail: d.contactEmail || "", ministreEmail: d.ministreEmail || "", contactPhone: d.contactPhone || "", contactAddress: d.contactAddress || "",
          contactAddressEn: d.contactAddressEn || "",
          openingHoursFr: d.openingHoursFr || "", openingHoursEn: d.openingHoursEn || "",
          locationMapUrl: d.locationMapUrl || "",
          strategieIaDocUrl: d.strategieIaDocUrl || "",
          appelsOffresExternalUrl: d.appelsOffresExternalUrl || "",
        });
        setLoading(false);
      });
  }, [canManage]);

  const [uploadError, setUploadError] = useState("");
  async function handleUpload(field: "logoHeader" | "logoFooter" | "favicon", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploadingField(field);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, form[field] as string);
      setForm({ ...form, [field]: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nom-ministere">
              Nom complet du ministère <span className="text-red-500">*</span>
            </label>
            <input id="nom-ministere" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="sigle">Sigle</label>
            <input id="sigle" value={form.siteNameShort} onChange={(e) => setForm({ ...form, siteNameShort: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm max-w-[160px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="slogan-francais">Slogan (Français)</label>
              <input id="slogan-francais" value={form.taglineFr} onChange={(e) => setForm({ ...form, taglineFr: e.target.value })} placeholder="Optionnel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="slogan-english">Slogan (English)</label>
              <input id="slogan-english" value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} placeholder="Optionnel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
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
                  {uploadingField === field ? "Import en cours…" : "Changer"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingField !== null} onChange={(e) => handleUpload(field, e)} />
                </label>
              </div>
            </div>
          ))}
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor={`reseau-social-${field}`}>{label}</label>
              <input id={`reseau-social-${field}`} type="url" pattern={URL_PATTERN} title="URL valide commençant par http:// ou https://" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Coordonnées (pied de page)</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="email-contact-general">
              Email de contact général <span className="text-red-500">*</span>
            </label>
            <input id="email-contact-general" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="email-destinataire-formulaire-ecrire-au-">
              Email destinataire — formulaire "Écrire au Ministre"
            </label>
            <input id="email-destinataire-formulaire-ecrire-au-" value={form.ministreEmail} onChange={(e) => setForm({ ...form, ministreEmail: e.target.value })} placeholder="mtdi.contact@gouv.bj" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="telephone">Téléphone</label>
            <input id="telephone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="Optionnel — ex : +229 01 21 30 00 00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="adresse-francais">Adresse (Français)</label>
            <textarea id="adresse-francais"
              value={form.contactAddress}
              onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
              placeholder={"Optionnel — ex :\nBoulevard de la Marina\n01 BP 412 Cotonou\nRépublique du Bénin"}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="adresse-english">Adresse (English)</label>
            <textarea id="adresse-english"
              value={form.contactAddressEn}
              onChange={(e) => setForm({ ...form, contactAddressEn: e.target.value })}
              placeholder={"Laisser vide pour reprendre l'adresse française telle quelle"}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="horaires-d-ouverture-francais">Horaires d'ouverture (Français)</label>
              <input id="horaires-d-ouverture-francais" value={form.openingHoursFr} onChange={(e) => setForm({ ...form, openingHoursFr: e.target.value })} placeholder="ex : Lundi – Vendredi : 8h00 – 17h00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="opening-hours-english">Opening hours (English)</label>
              <input id="opening-hours-english" value={form.openingHoursEn} onChange={(e) => setForm({ ...form, openingHoursEn: e.target.value })} placeholder="Laisser vide = reprend le français" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="localisation-lien-carte">Localisation (lien carte)</label>
            <input id="localisation-lien-carte"
              value={form.locationMapUrl}
              onChange={(e) => setForm({ ...form, locationMapUrl: e.target.value })}
              placeholder="Optionnel — lien Google Maps par exemple"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Affiche un lien "Voir sur la carte" sur la page Contact si renseigné.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="document-de-la-strategie-nationale-d-ia-">Document de la Stratégie Nationale d'IA (lien de téléchargement)</label>
            <input id="document-de-la-strategie-nationale-d-ia-"
              type="url"
              pattern={URL_PATTERN}
              title="URL valide commençant par http:// ou https://"
              value={form.strategieIaDocUrl}
              onChange={(e) => setForm({ ...form, strategieIaDocUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Utilisé par le bouton "Télécharger la stratégie" sur la page Stratégie Nationale d'IA.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="plateforme-externe-des-appels-d-offres">Plateforme externe des appels d'offres</label>
            <input id="plateforme-externe-des-appels-d-offres"
              type="url"
              pattern={URL_PATTERN}
              title="URL valide commençant par http:// ou https://"
              value={form.appelsOffresExternalUrl}
              onChange={(e) => setForm({ ...form, appelsOffresExternalUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Utilisé sur la page "Participer" quand aucun appel d'offre n'est publié individuellement.</p>
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
