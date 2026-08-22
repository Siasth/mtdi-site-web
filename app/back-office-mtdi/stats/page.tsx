"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Stat = {
  id: number;
  label_fr: string;
  label_en: string | null;
  value: string; // NUMERIC renvoyé en string par Postgres
  max_value: string;
  unit: string;
  unit_fr_singular: string | null;
  unit_en: string | null;
  unit_en_singular: string | null;
  no_space: boolean;
  display_order: number;
  active: boolean;
  deleted_at: string | null;
};

type FormState = {
  labelFr: string; labelEn: string; value: number; maxValue: number;
  unit: string; unitFrSingular: string; unitEn: string; unitEnSingular: string; noSpace: boolean;
  displayOrder: number; active: boolean;
};

const emptyForm: FormState = {
  labelFr: "", labelEn: "", value: 0, maxValue: 100,
  unit: "", unitFrSingular: "", unitEn: "", unitEnSingular: "", noSpace: false,
  displayOrder: 0, active: true,
};

export default function AdminStats() {
  const canView = useHasPermission("stats.voir");
  const canManage = useHasPermission("stats.gerer");

  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/stats")
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d) => { setStats(d); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
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

  function openNew() {
    setForm({ ...emptyForm, displayOrder: stats.length });
    setActiveLang("fr");
    setSaveError("");
    setEditingId("new");
  }

  function openEdit(s: Stat) {
    setForm({
      labelFr: s.label_fr, labelEn: s.label_en || "",
      value: Number(s.value), maxValue: Number(s.max_value), unit: s.unit,
      unitFrSingular: s.unit_fr_singular || "", unitEn: s.unit_en || "", unitEnSingular: s.unit_en_singular || "",
      noSpace: s.no_space,
      displayOrder: s.display_order, active: s.active,
    });
    setActiveLang("fr");
    setSaveError("");
    setEditingId(s.id);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const isNew = editingId === "new";
    const res = await fetch(isNew ? "/api/admin/stats" : `/api/admin/stats/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaving(false);
      setEditingId(null);
      load();
    } else {
      const data = await res.json();
      setSaveError(data.error || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  async function handleDelete(s: Stat) {
    if (!confirm(`Supprimer "${s.label_fr}" ? (réversible)`)) return;
    await fetch(`/api/admin/stats/${s.id}`, { method: "DELETE" });
    load();
  }

  async function handleRestore(s: Stat) {
    await fetch(`/api/admin/stats/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chiffres clés</h1>
          <p className="text-sm text-gray-500 mt-1">Indicateurs affichés sur la page d'accueil</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
            + Nouveau chiffre
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Libellé (FR)</th>
              <th className="px-5 py-3">Traduction EN</th>
              <th className="px-5 py-3">Valeur / Objectif</th>
              <th className="px-5 py-3">Unité</th>
              <th className="px-5 py-3">Visible</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map((s) => (
              <tr key={s.id} className={s.deleted_at ? "opacity-40" : ""}>
                <td className="px-5 py-3 font-medium text-gray-900">{s.label_fr}</td>
                <td className="px-5 py-3">
                  {s.label_en ? <span className="text-xs text-green-700">✓ traduit</span> : <span className="text-xs text-amber-600">⚠ non traduit</span>}
                </td>
                <td className="px-5 py-3 text-gray-500">{Number(s.value).toLocaleString("fr-FR")} / {Number(s.max_value).toLocaleString("fr-FR")}</td>
                <td className="px-5 py-3 text-gray-500">{s.unit}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.active ? "Actif" : "Masqué"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {s.deleted_at ? (
                      canManage && <RestoreIcon label="Restaurer" onClick={() => handleRestore(s)} />
                    ) : (
                      canManage && (
                        <>
                          <EditIcon label="Modifier" onClick={() => openEdit(s)} />
                          <DeleteIcon label="Supprimer" onClick={() => handleDelete(s)} />
                        </>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Aucun chiffre clé — ajoutez-en un pour l'afficher sur la page d'accueil</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingId === "new" ? "Nouveau chiffre clé" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  Français
                </button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2 flex items-center gap-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  English
                  {!form.labelEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
                </button>
              </div>
            </div>

            {activeLang === "fr" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Libellé (Français) *</label>
                  <input required value={form.labelFr} onChange={(e) => setForm({ ...form, labelFr: e.target.value })} placeholder="ex : Communes connectées à la fibre" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unité (pluriel)</label>
                    <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ex : communes, %, km" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unité (singulier)</label>
                    <input value={form.unitFrSingular} onChange={(e) => setForm({ ...form, unitFrSingular: e.target.value })} placeholder="ex : commune (si 1)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Le singulier n'est utilisé que si la valeur affichée est 1 ou -1. Laissez vide si l'unité ne varie pas (%, km...).</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!form.labelFr && <p className="text-xs text-amber-600">Renseignez d'abord le contenu en français (onglet précédent).</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Libellé (English)</label>
                  <input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unit (plural)</label>
                    <input value={form.unitEn} onChange={(e) => setForm({ ...form, unitEn: e.target.value })} placeholder="ex : municipalities, %, km — laisser vide = même qu'en FR" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unit (singular)</label>
                    <input value={form.unitEnSingular} onChange={(e) => setForm({ ...form, unitEnSingular: e.target.value })} placeholder="ex : municipality (if 1)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Valeur actuelle *</label>
                <input required type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Objectif (max) *</label>
                <input required type="number" value={form.maxValue} onChange={(e) => setForm({ ...form, maxValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.noSpace} onChange={(e) => setForm({ ...form, noSpace: e.target.checked })} />
              Coller le nombre et l'unité (ex : 40% au lieu de 40 %)
            </label>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />

                Visible sur le site
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordre d'affichage</label>
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            {saveError && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-600">{saveError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
