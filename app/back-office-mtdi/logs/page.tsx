"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";

type LogRow = {
  id: number;
  action: string;
  module: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
};

const ACTION_COLORS: Record<string, string> = {
  connexion: "bg-blue-100 text-blue-700",
  deconnexion: "bg-gray-100 text-gray-500",
  echec_connexion: "bg-red-100 text-red-700",
  creer: "bg-green-100 text-green-700",
  modifier: "bg-amber-100 text-amber-700",
  supprimer: "bg-red-100 text-red-700",
  restaurer: "bg-teal-100 text-teal-700",
};

export default function AdminLogs() {
  const canView = useHasPermission("logs.voir");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 50;

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    fetch(`/api/admin/logs?page=${page}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs); setTotal(d.total); setLoading(false); });
  }, [page, canView]);

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

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
        <p className="text-sm text-gray-500 mt-1">Historique de toutes les actions effectuées dans le back-office</p>
      </div>

      {loading ? (
        <div className="text-gray-400">Chargement...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Utilisateur</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {log.user_name || log.user_email || <span className="text-gray-300">Système</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{log.module}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{log.ip_address || "—"}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Aucune entrée</td></tr>
                )}
              </tbody>
            </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{total} entrée(s) au total</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">
                Précédent
              </button>
              <span className="px-2 py-1.5">Page {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
