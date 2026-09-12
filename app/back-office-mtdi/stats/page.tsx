"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { ColorContrastHint } from "../components/ColorContrastHint";

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
  color: string | null;
  display_order: number;
  active: boolean;
  deleted_at: string | null;
};

type FormState = {
  labelFr: string; labelEn: string; value: number; maxValue: number;
  unit: string; unitFrSingular: string; unitEn: string; unitEnSingular: string; noSpace: boolean; color: string;
  displayOrder: number; active: boolean;
};

const emptyForm: FormState = {
  labelFr: "", labelEn: "", value: 0, maxValue: 100,
  unit: "", unitFrSingular: "", unitEn: "", unitEnSingular: "", noSpace: false, color: "#006828",
  displayOrder: 0, active: true,
};

export default function AdminStats() {
  const canView = useHasPermission("accueil.voir");
  const canManage = useHasPermission("accueil.gerer");

  const [stats, setStats] = useState<Stat[]>([]);
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  const [meta, setMeta] = useState({ dateLabelFr: "", dateLabelEn: "", frequencyFr: "", frequencyEn: "" });
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function loadMeta() {
    fetch("/api/admin/stats-meta", { cache: "no-store" }).then((r) => r.json()).then(setMeta);
  }
  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    setMetaSaving(true);
    setMetaMsg(null);
    const res = await fetch("/api/admin/stats-meta", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(meta) });
    setMetaMsg(res.ok ? { type: "success", text: "Enregistré." } : { type: "error", text: "Erreur lors de l'enregistrement." });
    setMetaSaving(false);
  }

  function load() {
    setLoading(true);
    setLoadError("");
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status} : ${await r.text()}`);
        return r.json();
      })
      .then((d) => { setStats(d); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }
  useEffect(() => { if (canView) { load(); loadMeta(); } }, [canView]);

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
      noSpace: s.no_space, color: s.color || "#006828",
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

  const visibleStats = showDeleted ? stats.filter((x) => x.deleted_at) : stats.filter((x) => !x.deleted_at);
  const { pageItems, totalPages, safePage } = paginate(visibleStats, page, 10);

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

      {canManage && (
        <form onSubmit={handleSaveMeta} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Texte affiché sous les chiffres</h2>
              <p className="text-xs text-gray-500 mt-0.5">"Données au..." et "Mise à jour trimestrielle" sur la page d'accueil</p>
            </div>
            <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
              <button type="button" onClick={() => setActiveLang("fr")} className="px-3 py-1.5" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>FR</button>
              <button type="button" onClick={() => setActiveLang("en")} className="px-3 py-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>EN</button>
            </div>
          </div>
          {activeLang === "fr" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="date-des-donnees-fr">Date des données (FR)</label><input id="date-des-donnees-fr" value={meta.dateLabelFr} onChange={(e) => setMeta({ ...meta, dateLabelFr: e.target.value })} placeholder="ex: Données au 1ᵉʳ juillet 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="frequence-de-mise-a-jour-fr">Fréquence de mise à jour (FR)</label><input id="frequence-de-mise-a-jour-fr" value={meta.frequencyFr} onChange={(e) => setMeta({ ...meta, frequencyFr: e.target.value })} placeholder="ex: Mise à jour trimestrielle" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="date-des-donnees-en">Date des données (EN)</label><input id="date-des-donnees-en" value={meta.dateLabelEn} onChange={(e) => setMeta({ ...meta, dateLabelEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="frequence-de-mise-a-jour-en">Fréquence de mise à jour (EN)</label><input id="frequence-de-mise-a-jour-en" value={meta.frequencyEn} onChange={(e) => setMeta({ ...meta, frequencyEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={metaSaving} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
              {metaSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {metaMsg && <p className={`text-xs ${metaMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{metaMsg.text}</p>}
          </div>
        </form>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <input type="checkbox" checked={showDeleted} onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }} />
        Afficher les éléments supprimés ({stats.filter((x) => x.deleted_at).length})
      </label>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
            {pageItems.map((s) => (
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
            {visibleStats.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">{showDeleted ? "Aucun élément supprimé." : "Aucun chiffre clé — ajoutez-en un pour l'afficher sur la page d'accueil"}</td></tr>
            )}
          </tbody>
        </table>
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
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
                  Version anglaise
                  {!form.labelEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pas encore traduit" />}
                </button>
              </div>
              <ModalCloseButton onClick={() => setEditingId(null)} />
            </div>

            {activeLang === "fr" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="libelle-francais">Libellé (Français) *</label>
                  <input id="libelle-francais" required value={form.labelFr} onChange={(e) => setForm({ ...form, labelFr: e.target.value })} placeholder="ex : Communes connectées à la fibre" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="unite-pluriel">Unité (pluriel)</label>
                    <input id="unite-pluriel" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="ex : communes, %, km" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="unite-singulier">Unité (singulier)</label>
                    <input id="unite-singulier" value={form.unitFrSingular} onChange={(e) => setForm({ ...form, unitFrSingular: e.target.value })} placeholder="ex : commune (si 1)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Le singulier n'est utilisé que si la valeur affichée est 1 ou -1. Laissez vide si l'unité ne varie pas (%, km...).</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!form.labelFr && <p className="text-xs text-amber-600">Renseignez d'abord le contenu en français (onglet précédent).</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="libelle-english">Libellé (English)</label>
                  <input id="libelle-english" value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="unit-plural">Unit (plural)</label>
                    <input id="unit-plural" value={form.unitEn} onChange={(e) => setForm({ ...form, unitEn: e.target.value })} placeholder="ex : municipalities, %, km — laisser vide = même qu'en FR" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1" htmlFor="unit-singular">Unit (singular)</label>
                    <input id="unit-singular" value={form.unitEnSingular} onChange={(e) => setForm({ ...form, unitEnSingular: e.target.value })} placeholder="ex : municipality (if 1)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div>
                {/* ANO-133 : la validation numérique existait déjà (type="number"
                    empêche la saisie de lettres), seul le libellé restait à
                    préciser. */}
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4" htmlFor="valeur-numerique-actuelle">Valeur actuelle *</label>
                <input id="valeur-numerique-actuelle" required type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4" htmlFor="objectif-max">Objectif (max) *</label>
                <input id="objectif-max" required type="number" value={form.maxValue} onChange={(e) => setForm({ ...form, maxValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4" htmlFor="stat-couleur">Couleur</label>
                <div className="flex items-center gap-2">
                  <input id="stat-couleur" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-9 rounded border border-gray-200 cursor-pointer" />
                  <span className="text-xs text-gray-400 font-mono">{form.color}</span>
                </div>
                <ColorContrastHint color={form.color} />
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
                <label className="text-sm text-gray-700" htmlFor="ordre-d-affichage">Ordre d'affichage</label>
                <input id="ordre-d-affichage" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
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
