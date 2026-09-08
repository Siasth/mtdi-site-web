"use client";
import { useState, useEffect, useMemo } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { DeleteIcon, RestoreIcon, ToggleOnIcon, ToggleOffIcon } from "../components/ActionIcons";
import { Pagination, paginate } from "../components/Pagination";

const VERT = "#006828";
const PAGE_SIZE = 20;

type Subscriber = {
  id: number;
  name: string;
  email: string;
  interests: string[];
  active: boolean;
  deleted_at: string | null;
  created_at: string;
};

function toCsv(rows: Subscriber[]): string {
  const header = "Nom,Email,Statut,Date d'inscription\n";
  const body = rows
    .map((r) =>
      [r.name, r.email, r.deleted_at ? "Supprimé" : r.active ? "Actif" : "Désinscrit", new Date(r.created_at).toLocaleDateString("fr-FR")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return header + body;
}

export default function AdminNewsletter() {
  const canView = useHasPermission("newsletter.voir");
  const canManage = useHasPermission("newsletter.gerer");
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  const activeCount = useMemo(() => items.filter((s) => s.active && !s.deleted_at).length, [items]);
  const { pageItems, totalPages, safePage } = paginate(filtered, page, PAGE_SIZE);

  // ANO-152 (révision) : la "désinscription" est une désactivation
  // réversible (active = false), distincte de la suppression logique.
  async function handleToggleActive(s: Subscriber) {
    await fetch(`/api/admin/newsletter/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  }

  // Suppression logique (comme partout ailleurs dans le back-office) :
  // restaurable, jamais une perte définitive de la ligne.
  async function handleDelete(s: Subscriber) {
    if (!confirm(`Supprimer "${s.email}" de la liste ? (réversible, via Restaurer)`)) return;
    await fetch(`/api/admin/newsletter/${s.id}`, { method: "DELETE" });
    load();
  }
  async function handleRestore(s: Subscriber) {
    await fetch(`/api/admin/newsletter/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
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
          <p className="text-sm text-gray-500 mt-1">{activeCount} abonné{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""} · {items.length} au total (désinscrits et supprimés inclus)</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un nom ou un email…"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64"
          />
          <button onClick={handleExport} disabled={filtered.length === 0} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-40" style={{ background: VERT }}>
            Exporter (CSV)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((s) => (
          <div key={s.id} className={`flex items-center justify-between p-4 ${s.deleted_at ? "opacity-50" : ""}`}>
            <div>
              <p className="font-medium text-gray-900 text-sm flex items-center gap-2">
                {s.name}
                {s.deleted_at && <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Supprimé</span>}
                {!s.deleted_at && !s.active && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Désinscrit</span>}
              </p>
              <p className="text-xs text-gray-400">{s.email} · inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            {canManage && (
              <div className="flex items-center gap-1">
                {s.deleted_at ? (
                  <RestoreIcon label="Restaurer" onClick={() => handleRestore(s)} />
                ) : (
                  <>
                    {s.active ? (
                      <ToggleOnIcon label="Désinscrire" onClick={() => handleToggleActive(s)} />
                    ) : (
                      <ToggleOffIcon label="Réinscrire" onClick={() => handleToggleActive(s)} />
                    )}
                    <DeleteIcon label="Supprimer" onClick={() => handleDelete(s)} />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {pageItems.length === 0 && <p className="p-8 text-center text-gray-400">{items.length === 0 ? "Aucun abonné pour le moment." : "Aucun résultat pour cette recherche."}</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
