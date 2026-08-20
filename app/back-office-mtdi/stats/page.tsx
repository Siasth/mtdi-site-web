"use client";

import { useState, useEffect } from "react";

type KPI = { id: number; label: string; value: number; max: number; unit: string };

export default function AdminStats() {
  const [stats, setStats] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => { setStats(d); setLoading(false); });
  }, []);

  const update = (id: number, field: keyof KPI, val: string) => {
    setStats(stats.map((s) => {
      if (s.id !== id) return s;
      if (field === "value" || field === "max") return { ...s, [field]: Number(val) || 0 };
      return { ...s, [field]: val };
    }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/stats", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stats) });
    setSaving(false);
  };

  const addStat = () => {
    const id = stats.length ? Math.max(...stats.map((s) => s.id)) + 1 : 1;
    setStats([...stats, { id, label: "", value: 0, max: 100, unit: "" }]);
  };

  const removeStat = (id: number) => setStats(stats.filter((s) => s.id !== id));

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chiffres clés</h1>
          <p className="text-sm text-gray-500 mt-1">KPIs affichés dans la section statistiques</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addStat} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-gray-300 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
            Ajouter
          </button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50">
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Indicateur</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-28">Valeur</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-28">Objectif</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-20">Unité</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-20">%</th>
              <th className="px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="px-5 py-3">
                  <input value={s.label} onChange={(e) => update(s.id, "label", e.target.value)} className="w-full text-sm font-medium text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-green-600 focus:outline-none py-1" />
                </td>
                <td className="px-5 py-3">
                  <input type="number" value={s.value} onChange={(e) => update(s.id, "value", e.target.value)} className="w-full text-sm font-bold text-green-700 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-green-600 focus:outline-none py-1" />
                </td>
                <td className="px-5 py-3">
                  <input type="number" value={s.max} onChange={(e) => update(s.id, "max", e.target.value)} className="w-full text-sm text-gray-500 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-green-600 focus:outline-none py-1" />
                </td>
                <td className="px-5 py-3">
                  <input value={s.unit} onChange={(e) => update(s.id, "unit", e.target.value)} className="w-full text-sm text-gray-500 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-green-600 focus:outline-none py-1" />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: `${Math.round((s.value / s.max) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-400">{Math.round((s.value / s.max) * 100)}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => removeStat(s.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
