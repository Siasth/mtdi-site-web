"use client";

import { useState, useEffect } from "react";
import { Pagination, paginate } from "../components/Pagination";
import { ModalCloseButton } from "../components/ModalHeader";
import { useHasPermission } from "../AdminLayoutClient";
import { DeleteIcon } from "../components/ActionIcons";
import { PERMISSIONS, PERMISSION_CATEGORIES, PERMISSION_MODULES, getRequiredViewPermission, getDependentPermissions, type PermissionCode } from "@/lib/permissions";

const VERT = "#006828";

type Permission = { id: number; code: string; module: string; description: string };
type Role = { id: number; name: string; description: string | null; is_system: boolean; permissions: string[] };

export default function AdminRoles() {
  const canView = useHasPermission("roles.voir");
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
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
    const data = await fetch("/api/admin/roles", { cache: "no-store" }).then((r) => r.json());
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
    if (next.has(code)) {
      next.delete(code);
      // ANO-153 : décocher "voir" retire aussi toutes les permissions
      // d'action qui en dépendent (impossible de garder "modifier" sans
      // "voir").
      for (const dependent of getDependentPermissions(code as PermissionCode)) {
        next.delete(dependent);
      }
    } else {
      next.add(code);
      // Cocher une permission d'action implique automatiquement la
      // permission de visualisation correspondante.
      const requiredView = getRequiredViewPermission(code as PermissionCode);
      if (requiredView) next.add(requiredView);
    }
    setCheckedCodes(next);
  }

  // Coche/décoche tout un groupe de codes d'un coup (case à cocher parente
  // d'un module ou d'une catégorie entière).
  function toggleMany(codes: string[], checked: boolean) {
    const next = new Set(checkedCodes);
    for (const code of codes) {
      if (checked) next.add(code); else next.delete(code);
    }
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

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(roles, page, 9);

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
        {pageItems.map((role) => (
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
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {/* Modale édition permissions (rôle existant) */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">{editingRole.name}</h2>
              <ModalCloseButton onClick={() => setEditingRole(null)} />
            </div>
            <PermissionChecklist allPermissions={allPermissions} checkedCodes={checkedCodes} onToggle={toggleCode} onToggleMany={toggleMany} disabled={editingRole.is_system} />
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
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Nouveau rôle</h2>
              <ModalCloseButton onClick={() => setShowCreate(false)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="nom-du-role">Nom du rôle *</label>
              <input id="nom-du-role" required value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="description">Description</label>
              <input id="description" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <PermissionChecklist allPermissions={allPermissions} checkedCodes={checkedCodes} onToggle={toggleCode} onToggleMany={toggleMany} disabled={false} />
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

// Retrouve la catégorie (éditorial/technique) d'un module à partir du
// catalogue statique — jamais stockée en base, c'est une donnée fixe liée
// au code de la permission, pas à une configuration modifiable.
const MODULE_TO_CATEGORY: Record<string, "editorial" | "technique"> = {};
for (const p of PERMISSIONS) {
  MODULE_TO_CATEGORY[p.module] = p.category;
}

function ParentCheckbox({ checked, indeterminate, onChange, disabled }: { checked: boolean; indeterminate: boolean; onChange: (checked: boolean) => void; disabled: boolean }) {
  const ref = (el: HTMLInputElement | null) => { if (el) el.indeterminate = indeterminate; };
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="mt-0.5"
    />
  );
}

function PermissionChecklist({
  allPermissions,
  checkedCodes,
  onToggle,
  onToggleMany,
  disabled,
}: {
  allPermissions: Permission[];
  checkedCodes: Set<string>;
  onToggle: (code: string) => void;
  onToggleMany: (codes: string[], checked: boolean) => void;
  disabled: boolean;
}) {
  const permsByModule = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {PERMISSION_CATEGORIES.map((cat) => {
        const modulesInCategory = PERMISSION_MODULES.filter((m) => MODULE_TO_CATEGORY[m.key] === cat.key && permsByModule[m.key]?.length);
        if (modulesInCategory.length === 0) return null;
        const allCodesInCategory = modulesInCategory.flatMap((m) => permsByModule[m.key].map((p) => p.code));
        const checkedInCategory = allCodesInCategory.filter((c) => checkedCodes.has(c)).length;

        return (
          <div key={cat.key}>
            <div className="flex items-start gap-2 mb-3 pb-2 border-b border-gray-200">
              <ParentCheckbox
                checked={checkedInCategory === allCodesInCategory.length}
                indeterminate={checkedInCategory > 0 && checkedInCategory < allCodesInCategory.length}
                onChange={(checked) => onToggleMany(allCodesInCategory, checked)}
                disabled={disabled}
              />
              <div>
                <p className="text-sm font-black text-gray-900">{cat.label}</p>
                <p className="text-[11px] text-gray-400">{cat.description}</p>
              </div>
            </div>

            <div className="space-y-4 pl-1">
              {modulesInCategory.map((mod) => {
                const perms = permsByModule[mod.key];
                const codes = perms.map((p) => p.code);
                const checkedInModule = codes.filter((c) => checkedCodes.has(c)).length;

                return (
                  <div key={mod.key}>
                    <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                      <ParentCheckbox
                        checked={checkedInModule === codes.length}
                        indeterminate={checkedInModule > 0 && checkedInModule < codes.length}
                        onChange={(checked) => onToggleMany(codes, checked)}
                        disabled={disabled}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{mod.label}</span>
                    </label>
                    <div className="space-y-1.5 pl-6">
                      {perms.map((p) => {
                        const requiredView = getRequiredViewPermission(p.code as PermissionCode);
                        return (
                          <label key={p.code} className="flex items-start gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={checkedCodes.has(p.code)}
                              onChange={() => onToggle(p.code)}
                              disabled={disabled}
                              className="mt-0.5"
                            />
                            <span>
                              {p.description}
                              {/* ANO-153 : rend la dépendance visible en permanence
                                  plutôt que de cocher "voir" en silence sans que
                                  l'admin comprenne pourquoi (cocher cette case coche
                                  aussi "Voir" automatiquement, décocher "Voir"
                                  décoche celle-ci). */}
                              {requiredView && (
                                <span className="block text-[11px] text-gray-400">Nécessite « Voir »</span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
