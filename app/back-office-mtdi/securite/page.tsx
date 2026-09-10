"use client";

import { useState, useEffect } from "react";

const VERT = "#006828";

export default function AdminSecurite() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setName(d.name);
        setEmail(d.email);
        setLoading(false);
      });
  }, []);

  async function handleNameChange(e: React.FormEvent) {
    e.preventDefault();
    setNameMsg(null);
    setNameLoading(true);
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setNameMsg(res.ok ? { type: "success", text: "Nom mis à jour." } : { type: "error", text: data.error });
    setNameLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (!newPassword || !confirmPassword) {
      setPwdMsg({ type: "error", text: "Veuillez renseigner le nouveau mot de passe et sa confirmation." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    setPwdLoading(true);
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      setPwdMsg({ type: "success", text: "Mot de passe modifié avec succès." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPwdMsg({ type: "error", text: data.error });
    }
    setPwdLoading(false);
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre nom et votre mot de passe</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-1">Informations</h2>
        <p className="text-xs text-gray-400 mb-4">{email}</p>
        <form onSubmit={handleNameChange} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nom-complet">Nom complet</label>
            <input id="nom-complet" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          {nameMsg && <p className={`text-sm ${nameMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{nameMsg.text}</p>}
          <button type="submit" disabled={nameLoading} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
            {nameLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Changer mon mot de passe</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="mot-de-passe-actuel">Mot de passe actuel</label>
            <input id="mot-de-passe-actuel" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nouveau-mot-de-passe">Nouveau mot de passe</label>
            <input id="nouveau-mot-de-passe" type="password" minLength={12} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <p className="text-xs text-gray-400 mt-1">12 caractères minimum. Une phrase facile à retenir mais longue est préférable à un mot court avec des symboles.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="confirmer-le-nouveau-mot-de-passe">Confirmer le nouveau mot de passe</label>
            <input id="confirmer-le-nouveau-mot-de-passe" type="password" minLength={12} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          {pwdMsg && <p className={`text-sm ${pwdMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{pwdMsg.text}</p>}
          <button type="submit" disabled={pwdLoading} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
            {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
