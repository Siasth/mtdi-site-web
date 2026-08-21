"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon, ToggleOnIcon, ToggleOffIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Role = { id: number; name: string };
type UserRow = {
  id: number;
  email: string;
  name: string;
  status: string;
  role_id: number;
  role_name: string;
  last_login_at: string | null;
  created_at: string;
  deleted_at: string | null;
};

export default function AdminUtilisateurs() {
  const canView = useHasPermission("utilisateurs.voir");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", name: "", roleId: "", password: "" });

  async function load() {
    setLoading(true);
    const [usersRes, rolesRes] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ]);
    setUsers(usersRes);
    setRoles((rolesRes.roles || []).map((r: { id: number; name: string }) => ({ id: r.id, name: r.name })));
    setLoading(false);
  }

  useEffect(() => { if (canView) load(); }, [canView]);

  if (!canView) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto mt-12">
          <p className="font-bold text-gray-900 mb-1">Accès refusé</p>
          <p className="text-sm text-gray-500">Vous n'avez pas la permission de consulter cette page.</p>
        </div>
      </div>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, roleId: Number(form.roleId) }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowCreate(false);
      setForm({ email: "", name: "", roleId: "", password: "" });
      await load();
    } else {
      setError(data.error || "Erreur lors de la création");
    }
    setCreating(false);
  }

  async function toggleStatus(u: UserRow) {
    const newStatus = u.status === "actif" ? "desactive" : "actif";
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await load();
  }

  async function removeUser(u: UserRow) {
    if (!confirm(`Supprimer ${u.name} ? (suppression réversible)`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    await load();
  }

  async function restoreUser(u: UserRow) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    await load();
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes ayant accès au back-office</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg"
          style={{ background: VERT }}
        >
          + Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Rôle</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Dernière connexion</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className={u.deleted_at ? "opacity-40" : ""}>
                <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3 text-gray-500">{u.role_name}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === "actif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.status === "actif" ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString("fr-FR") : "Jamais"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {u.deleted_at ? (
                      <RestoreIcon label="Restaurer" onClick={() => restoreUser(u)} />
                    ) : (
                      <>
                        {u.status === "actif" ? (
                          <ToggleOnIcon label="Désactiver" onClick={() => toggleStatus(u)} />
                        ) : (
                          <ToggleOffIcon label="Activer" onClick={() => toggleStatus(u)} />
                        )}
                        <DeleteIcon label="Supprimer" onClick={() => removeUser(u)} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Nouvel utilisateur</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom complet</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rôle</label>
              <select required value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Sélectionner...</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mot de passe initial</label>
              <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <p className="text-xs text-gray-400 mt-1">L'utilisateur devra le changer à sa première connexion.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={creating} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
