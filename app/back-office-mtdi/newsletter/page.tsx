"use client";
import { useState, useEffect, useMemo } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { DeleteIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Subscriber = {
  id: number;
  name: string;
  email: string;
  interests: string[];
  active: boolean;
  created_at: string;
};

function toCsv(rows: Subscriber[]): string {
  const header = "Nom,Email,Date d'inscription\n";
  const body = rows
    .map((r) => [r.name, r.email, new Date(r.created_at).toLocaleDateString("fr-FR")].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return header + body;
}

export default function AdminNewsletter() {
  const canView = useHasPermission("newsletter.voir");
  const canManage = useHasPermission("newsletter.gerer");
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/newsletter", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  }
  useEffect(() => { if (canView) load(); }, [canView]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [items, search]);

  async function handleDelete(s: Subscriber) {
    if (!confirm(`Désinscrire "${s.email}" ? Cette action est définitive.`)) return;
    await fetch(`/api/admin/newsletter/${s.id}`, { method: "DELETE" });
    load();
  }

  function handleExport() {
    const csv = toCsv(filtered);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-abonnes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!canView) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} abonné{items.length > 1 ? "s" : ""} inscrit{items.length > 1 ? "s" : ""} depuis le site</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom ou un email…"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64"
          />
          <button onClick={handleExport} disabled={filtered.length === 0} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-40" style={{ background: VERT }}>
            Exporter (CSV)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900 text-sm">{s.name}</p>
              <p className="text-xs text-gray-400">{s.email} · inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            {canManage && <DeleteIcon label="Désinscrire" onClick={() => handleDelete(s)} />}
          </div>
        ))}
        {filtered.length === 0 && <p className="p-8 text-center text-gray-400">{items.length === 0 ? "Aucun abonné pour le moment." : "Aucun résultat pour cette recherche."}</p>}
      </div>
    </div>
  );
}
