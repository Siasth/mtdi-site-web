"use client";

import { useState, useEffect } from "react";

const VERT = "#006828";

export default function AdminSecurite() {
  // État général
  const [loading, setLoading] = useState(true);
  const [has2FA, setHas2FA] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  // Changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Configuration 2FA
  const [tfaEmail, setTfaEmail] = useState("");
  const [tfaMsg, setTfaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tfaLoading, setTfaLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/security")
      .then((r) => r.json())
      .then((d) => {
        setHas2FA(d.has2FA);
        setCurrentEmail(d.twoFactorEmail || "");
        setTfaEmail(d.twoFactorEmail || "");
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    setPwdLoading(true);
    const res = await fetch("/api/admin/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "password", currentPassword, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      setPwdMsg({ type: "success", text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Déconnecter après 2s
      setTimeout(() => {
        fetch("/api/auth", { method: "DELETE" }).then(() => {
          window.location.href = "/login";
        });
      }, 2000);
    } else {
      setPwdMsg({ type: "error", text: data.error });
    }
    setPwdLoading(false);
  };

  const handleTfaChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setTfaMsg(null);
    setTfaLoading(true);

    const res = await fetch("/api/admin/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "2fa", email: tfaEmail }),
    });
    const data = await res.json();

    if (res.ok) {
      setTfaMsg({ type: "success", text: data.message });
      setHas2FA(!!tfaEmail);
      setCurrentEmail(tfaEmail);
    } else {
      setTfaMsg({ type: "error", text: data.error });
    }
    setTfaLoading(false);
  };

  const disable2FA = async () => {
    setTfaLoading(true);
    setTfaMsg(null);
    const res = await fetch("/api/admin/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "2fa", email: "" }),
    });
    const data = await res.json();
    if (res.ok) {
      setTfaMsg({ type: "success", text: data.message });
      setHas2FA(false);
      setCurrentEmail("");
      setTfaEmail("");
    }
    setTfaLoading(false);
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez le mot de passe et l'authentification à deux facteurs
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Changement de mot de passe */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${VERT}14` }}
            >
              <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Mot de passe</h2>
              <p className="text-xs text-gray-400">Modifier le mot de passe d'accès au back-office</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPwdMsg(null); }}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwdMsg(null); }}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPwdMsg(null); }}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            {pwdMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                pwdMsg.type === "success" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              }`}>
                <svg width="16" height="16" fill="none" stroke={pwdMsg.type === "success" ? "#16a34a" : "#DC2626"} strokeWidth="2" viewBox="0 0 24 24">
                  {pwdMsg.type === "success" ? (
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                    </>
                  )}
                </svg>
                <p className={`text-sm font-medium ${pwdMsg.type === "success" ? "text-green-700" : "text-red-600"}`}>
                  {pwdMsg.text}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwdLoading}
              className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        </div>

        {/* Configuration 2FA */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${VERT}14` }}
            >
              <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2L3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Authentification à deux facteurs (2FA)</h2>
              <p className="text-xs text-gray-400">
                Un code de vérification sera envoyé par email à chaque connexion
              </p>
            </div>
          </div>

          {/* Statut actuel */}
          <div className="mt-4 mb-6 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${has2FA ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${has2FA ? "text-green-700" : "text-gray-400"}`}>
              {has2FA ? "Activé" : "Désactivé"}
            </span>
            {has2FA && currentEmail && (
              <span className="text-xs text-gray-400 ml-2">— {currentEmail}</span>
            )}
          </div>

          <form onSubmit={handleTfaChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse email pour le 2FA
              </label>
              <input
                type="email"
                value={tfaEmail}
                onChange={(e) => { setTfaEmail(e.target.value); setTfaMsg(null); }}
                placeholder="admin@numérique.gouv.bj"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                Laissez vide pour désactiver le 2FA. Assurez-vous que les variables SMTP sont configurées dans .env.local
              </p>
            </div>

            {tfaMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                tfaMsg.type === "success" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              }`}>
                <svg width="16" height="16" fill="none" stroke={tfaMsg.type === "success" ? "#16a34a" : "#DC2626"} strokeWidth="2" viewBox="0 0 24 24">
                  {tfaMsg.type === "success" ? (
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                    </>
                  )}
                </svg>
                <p className={`text-sm font-medium ${tfaMsg.type === "success" ? "text-green-700" : "text-red-600"}`}>
                  {tfaMsg.text}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={tfaLoading}
                className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {tfaLoading ? "Enregistrement..." : tfaEmail ? "Activer le 2FA" : "Enregistrer"}
              </button>
              {has2FA && (
                <button
                  type="button"
                  onClick={disable2FA}
                  disabled={tfaLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Désactiver
                </button>
              )}
            </div>
          </form>

          {/* Info SMTP */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Configuration SMTP requise
            </p>
            <div className="text-xs text-gray-400 font-mono space-y-0.5">
              <p>SMTP_HOST=smtp.gmail.com</p>
              <p>SMTP_PORT=587</p>
              <p>SMTP_USER=votre@email.com</p>
              <p>SMTP_PASS=votre-mot-de-passe-app</p>
              <p>SMTP_FROM=noreply@numérique.gouv.bj</p>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Ajoutez ces variables dans le fichier <strong>.env.local</strong> à la racine du projet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
