"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";

const VERT = "#006828";

type SmtpForm = { host: string; port: string; user: string; pass: string; from: string };

export default function AdminAdministration() {
  const canManage = useHasPermission("securite.modifier");

  const [loading, setLoading] = useState(true);

  const [forceTwoFactorAll, setForceTwoFactorAll] = useState(false);
  const [tfaMsg, setTfaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tfaLoading, setTfaLoading] = useState(false);

  const [smtp, setSmtp] = useState<SmtpForm>({ host: "", port: "587", user: "", pass: "", from: "" });
  const [smtpMsg, setSmtpMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);

  useEffect(() => {
    if (!canManage) return;
    fetch("/api/admin/security", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setForceTwoFactorAll(!!d.forceTwoFactorAll);
        if (d.smtp) {
          setSmtp({
            host: d.smtp.host || "",
            port: String(d.smtp.port || "587"),
            user: d.smtp.user || "",
            pass: d.smtp.pass || "", // déjà masqué (••••••••) par l'API si déjà configuré
            from: d.smtp.from || "",
          });
        }
        setLoading(false);
      });
  }, [canManage]);

  async function handleGlobalToggle() {
    setTfaMsg(null);
    setTfaLoading(true);
    const next = !forceTwoFactorAll;
    const res = await fetch("/api/admin/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceTwoFactorAll: next }),
    });
    if (res.ok) {
      setForceTwoFactorAll(next);
      setTfaMsg({ type: "success", text: next ? "La vérification en deux étapes s'impose désormais à tous les utilisateurs." : "Vérification en deux étapes désactivée pour tous." });
    } else {
      setTfaMsg({ type: "error", text: "Erreur lors de la mise à jour." });
    }
    setTfaLoading(false);
  }

  async function handleSmtpSave(e: React.FormEvent) {
    e.preventDefault();
    setSmtpMsg(null);
    setSmtpSaving(true);
    const res = await fetch("/api/admin/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smtp }),
    });
    const data = await res.json();
    setSmtpMsg(res.ok ? { type: "success", text: "Configuration SMTP enregistrée et active immédiatement." } : { type: "error", text: data.error });
    setSmtpSaving(false);
  }

  async function handleSmtpTest() {
    setSmtpMsg(null);
    setSmtpTesting(true);
    const res = await fetch("/api/admin/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(smtp),
    });
    const data = await res.json();
    setSmtpMsg(res.ok ? { type: "success", text: data.message } : { type: "error", text: data.error });
    setSmtpTesting(false);
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

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Autres</h1>
        <p className="text-sm text-gray-500 mt-1">Réglages globaux — pris en compte immédiatement, sans redéploiement</p>
      </div>

      {/* 2FA globale */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Vérification en deux étapes (2FA)</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Une fois activée, tous les utilisateurs devront saisir un code reçu par email à chaque connexion.
            </p>
          </div>
          <button
            onClick={handleGlobalToggle}
            disabled={tfaLoading}
            className={`w-12 h-7 rounded-full relative transition-colors flex-shrink-0 ${forceTwoFactorAll ? "" : "bg-gray-200"}`}
            style={forceTwoFactorAll ? { background: VERT } : undefined}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${forceTwoFactorAll ? "left-6" : "left-1"}`} />
          </button>
        </div>
        {tfaMsg && <p className={`text-sm mt-3 ${tfaMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{tfaMsg.text}</p>}
        {forceTwoFactorAll && !smtp.host && (
          <p className="text-xs text-amber-600 mt-3">⚠️ Configurez le SMTP ci-dessous pour que les codes puissent réellement être envoyés.</p>
        )}
      </section>

      {/* Configuration SMTP */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-1">Configuration SMTP</h2>
        <p className="text-xs text-gray-400 mb-4">Utilisé pour l'envoi des codes 2FA et des notifications par email.</p>
        <form onSubmit={handleSmtpSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hôte SMTP *</label>
              <input required value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Port *</label>
              <input required value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} placeholder="587" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Utilisateur *</label>
            <input required value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} placeholder="contact@gouv.bj" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mot de passe</label>
            <input
              type="password"
              value={smtp.pass}
              onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
              placeholder="Laisser tel quel pour ne pas modifier"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Adresse d'expédition *</label>
            <input required value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} placeholder="contact@gouv.bj" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          {smtpMsg && <p className={`text-sm ${smtpMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{smtpMsg.text}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleSmtpTest} disabled={smtpTesting} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-600 rounded-lg border border-gray-200 disabled:opacity-50">
              {smtpTesting ? "Test en cours..." : "Tester la connexion"}
            </button>
            <button type="submit" disabled={smtpSaving} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
              {smtpSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
