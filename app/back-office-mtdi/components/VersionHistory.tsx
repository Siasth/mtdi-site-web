"use client";
import { useState, useEffect } from "react";

const VERT = "#006828";

type VersionRow = {
  id: number;
  snapshot: Record<string, unknown>;
  changed_at: string;
  changed_by_name: string | null;
};

// Champs techniques jamais affichés dans le diff (bruit, pas du contenu).
const IGNORED_FIELDS = new Set(["id", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"]);

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "(vide)";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "object") {
    const s = JSON.stringify(v);
    return s.length > 200 ? s.slice(0, 200) + "…" : s;
  }
  const s = String(v).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return s.length > 200 ? s.slice(0, 200) + "…" : s;
}

function diffObjects(older: Record<string, unknown>, newer: Record<string, unknown>, labels: Record<string, string>) {
  const keys = new Set([...Object.keys(older), ...Object.keys(newer)]);
  const changes: { field: string; before: string; after: string }[] = [];
  for (const key of keys) {
    if (IGNORED_FIELDS.has(key)) continue;
    const beforeVal = older[key];
    const afterVal = newer[key];
    if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) continue;
    changes.push({ field: labels[key] || key, before: formatValue(beforeVal), after: formatValue(afterVal) });
  }
  return changes;
}

export default function VersionHistory({
  table,
  recordId,
  current,
  fieldLabels = {},
  canRestore,
  onRestored,
  onClose,
}: {
  table: string;
  recordId: string | number;
  current: Record<string, unknown>;
  fieldLabels?: Record<string, string>;
  canRestore: boolean;
  onRestored: () => void;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/admin/content-versions?table=${table}&recordId=${recordId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setVersions(Array.isArray(d) ? d : []); setLoading(false); });
  }, [table, recordId]);

  async function handleRestore(versionId: number) {
    if (!confirm("Restaurer cette version ? L'état actuel sera lui-même conservé dans l'historique, donc rien n'est perdu.")) return;
    setRestoringId(versionId);
    const res = await fetch("/api/admin/content-versions/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    setRestoringId(null);
    if (res.ok) {
      onRestored();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erreur lors de la restauration.");
    }
  }

  // Chaîne : [actuel, version la plus récente, ..., version la plus ancienne]
  // Chaque entrée affiche le diff par rapport à l'entrée juste avant elle
  // dans la chaîne (donc "ce qui a changé pour arriver à cet état-ci").
  const chain: { label: string; data: Record<string, unknown>; versionId: number | null; changedAt: string | null; author: string | null }[] = [
    { label: "Version actuelle", data: current, versionId: null, changedAt: null, author: null },
    ...versions.map((v) => ({
      label: new Date(v.changed_at).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      data: v.snapshot,
      versionId: v.id,
      changedAt: v.changed_at,
      author: v.changed_by_name,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Historique des modifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune modification enregistrée pour cet élément pour l'instant.</p>
        ) : (
          <div className="space-y-5">
            {chain.slice(0, -1).map((entry, i) => {
              const older = chain[i + 1].data;
              const changes = diffObjects(older, entry.data, fieldLabels);
              return (
                <div key={entry.versionId ?? "current"} style={{ borderLeft: `2px solid ${i === 0 ? VERT : "#e5e7eb"}` }} className="pl-4 pb-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{entry.label}</p>
                      {entry.changedAt === null && changes.length === 0 && (
                        <p className="text-xs text-gray-400">Aucun changement non enregistré</p>
                      )}
                    </div>
                    {i > 0 && canRestore && (
                      <button
                        onClick={() => handleRestore(entry.versionId!)}
                        disabled={restoringId !== null}
                        className="text-xs font-bold uppercase tracking-wider hover:underline disabled:opacity-50 flex-shrink-0"
                        style={{ color: VERT }}
                      >
                        {restoringId === entry.versionId ? "Restauration..." : "Restaurer cette version"}
                      </button>
                    )}
                  </div>
                  {changes.length === 0 ? (
                    <p className="text-xs text-gray-400">Aucun champ suivi n'a changé à cette étape.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {changes.map((c) => (
                        <div key={c.field} className="text-xs">
                          <span className="font-bold text-gray-600">{c.field} : </span>
                          <span className="text-red-500 line-through">{c.before}</span>
                          {" → "}
                          <span className="text-green-700">{c.after}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
