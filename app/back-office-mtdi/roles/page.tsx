"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { DeleteIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Permission = { id: number; code: string; module: string; description: string };
type Role = { id: number; name: string; description: string | null; is_system: boolean; permissions: string[] };

export default function AdminRoles() {
  const canView = useHasPermission("roles.voir");
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [checkedCodes, setCheckedCodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/admin/roles").then((r) => r.json());
    setRoles(data.roles || []);
    setAllPermissions(data.allPermissions || []);
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

  function openEdit(role: Role) {
    setEditingRole(role);
    setCheckedCodes(new Set(role.permissions));
  }

  function toggleCode(code: string) {
    const next = new Set(checkedCodes);
    if (next.has(code)) next.delete(code); else next.add(code);
    setCheckedCodes(next);
  }

  async function saveEdit() {
    if (!editingRole) return;
    setSaving(true);
    await fetch(`/api/admin/roles/${editingRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionCodes: Array.from(checkedCodes) }),
    });
    setSaving(false);
    setEditingRole(null);
    await load();
  }

  async function createRole(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName, description: newRoleDesc, permissionCodes: Array.from(checkedCodes) }),
    });
    setSaving(false);
    setShowCreate(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setCheckedCodes(new Set());
    await load();
  }

  async function deleteRole(role: Role) {
    if (!confirm(`Supprimer le rôle "${role.name}" ?`)) return;
    const res = await fetch(`/api/admin/roles/${role.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    await load();
  }

  const permsByModule = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ||= []).push(p);
    return acc;
  }, {});

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rôles &amp; permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Créez des rôles et définissez précisément ce qu'ils peuvent faire</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCheckedCodes(new Set()); }}
          className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg"
          style={{ background: VERT }}
        >
          + Nouveau rôle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">{role.name}</p>
                {role.is_system && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Rôle système</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">{role.description}</p>
            <p className="text-xs text-gray-500 mb-4">{role.permissions.length} permission(s)</p>
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => openEdit(role)} className="text-xs font-bold hover:underline" style={{ color: VERT }}>
                Modifier les permissions
              </button>
              {!role.is_system && (
                <DeleteIcon label="Supprimer le rôle" onClick={() => deleteRole(role)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modale édition permissions (rôle existant) */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="font-bold text-gray-900 text-lg mb-4">{editingRole.name}</h2>
            <PermissionChecklist permsByModule={permsByModule} checkedCodes={checkedCodes} onToggle={toggleCode} disabled={editingRole.is_system} />
            {editingRole.is_system && (
              <p className="text-xs text-amber-600 mt-3">Le rôle Super Admin conserve toujours toutes les permissions.</p>
            )}
            <div className="flex gap-2 pt-5">
              <button onClick={() => setEditingRole(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              {!editingRole.is_system && (
                <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale création de rôle */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={createRole} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Nouveau rôle</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom du rôle</label>
              <input required value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <input value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <PermissionChecklist permsByModule={permsByModule} checkedCodes={checkedCodes} onToggle={toggleCode} disabled={false} />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PermissionChecklist({
  permsByModule,
  checkedCodes,
  onToggle,
  disabled,
}: {
  permsByModule: Record<string, Permission[]>;
  checkedCodes: Set<string>;
  onToggle: (code: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(permsByModule).map(([module, perms]) => (
        <div key={module}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{module}</p>
          <div className="space-y-1.5">
            {perms.map((p) => (
              <label key={p.code} className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checkedCodes.has(p.code)}
                  onChange={() => onToggle(p.code)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span>{p.description}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
