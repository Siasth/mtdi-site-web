"use client";

import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";

type Upcoming = { id: number; event_date: string; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; display_order: number; active: boolean; deleted_at: string | null };
type Replay = { id: number; title_fr: string; title_en: string | null; source: string | null; replay_date: string | null; url: string; display_order: number; active: boolean; deleted_at: string | null };

export default function AdminDirect() {
  const canManage = useHasPermission("contenu.modifier");
  const [tab, setTab] = useState<"upcoming" | "replays">("upcoming");
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/direct-upcoming", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/direct-replays", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([u, r]) => { setUpcoming(u); setReplays(r); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  // Événement à venir
  const [editU, setEditU] = useState<number | "new" | null>(null);
  const [uForm, setUForm] = useState({ eventDate: "", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "" });
  function openNewU() { setUForm({ eventDate: new Date().toISOString().slice(0, 16), titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "" }); setEditU("new"); }
  function openEditU(u: Upcoming) { setUForm({ eventDate: u.event_date.slice(0, 16), titleFr: u.title_fr, titleEn: u.title_en || "", descriptionFr: u.description_fr || "", descriptionEn: u.description_en || "" }); setEditU(u.id); }
  async function saveU(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editU === "new";
    await fetch(isNew ? "/api/admin/direct-upcoming" : `/api/admin/direct-upcoming/${editU}`, {
      method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(uForm),
    });
    setEditU(null); load();
  }
  async function deleteU(u: Upcoming) { if (confirm(`Supprimer "${u.title_fr}" ?`)) { await fetch(`/api/admin/direct-upcoming/${u.id}`, { method: "DELETE" }); load(); } }
  async function restoreU(u: Upcoming) { await fetch(`/api/admin/direct-upcoming/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  // Rediffusion
  const [editR, setEditR] = useState<number | "new" | null>(null);
  const [rForm, setRForm] = useState({ titleFr: "", titleEn: "", source: "", replayDate: "", url: "" });
  function openNewR() { setRForm({ titleFr: "", titleEn: "", source: "", replayDate: new Date().toISOString().slice(0, 10), url: "" }); setEditR("new"); }
  function openEditR(r: Replay) { setRForm({ titleFr: r.title_fr, titleEn: r.title_en || "", source: r.source || "", replayDate: (r.replay_date || "").slice(0, 10), url: r.url }); setEditR(r.id); }
  async function saveR(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editR === "new";
    await fetch(isNew ? "/api/admin/direct-replays" : `/api/admin/direct-replays/${editR}`, {
      method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rForm),
    });
    setEditR(null); load();
  }
  async function deleteR(r: Replay) { if (confirm(`Supprimer "${r.title_fr}" ?`)) { await fetch(`/api/admin/direct-replays/${r.id}`, { method: "DELETE" }); load(); } }
  async function restoreR(r: Replay) { await fetch(`/api/admin/direct-replays/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Direct</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button onClick={() => setTab("upcoming")} className="px-4 py-2 text-sm font-bold" style={tab === "upcoming" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>À venir ({upcoming.filter((u) => !u.deleted_at).length})</button>
        <button onClick={() => setTab("replays")} className="px-4 py-2 text-sm font-bold" style={tab === "replays" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>Rediffusions ({replays.filter((r) => !r.deleted_at).length})</button>
      </div>

      {tab === "upcoming" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewU} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvel événement</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {upcoming.map((u) => (
              <div key={u.id} className={`flex items-center justify-between p-4 ${u.deleted_at ? "opacity-40" : ""}`}>
                <div><p className="font-medium text-gray-900 text-sm">{u.title_fr}</p><p className="text-xs text-gray-400">{new Date(u.event_date).toLocaleString("fr-FR")}</p></div>
                <div className="flex gap-1">{u.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreU(u)} /> : <><EditIcon label="Modifier" onClick={() => openEditU(u)} /><DeleteIcon label="Supprimer" onClick={() => deleteU(u)} /></>}</div>
              </div>
            ))}
            {upcoming.length === 0 && <p className="p-8 text-center text-gray-400">Aucun événement</p>}
          </div>
        </>
      )}

      {tab === "replays" && (
        <>
          <div className="mb-4 flex justify-end"><button onClick={openNewR} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle rediffusion</button></div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {replays.map((r) => (
              <div key={r.id} className={`flex items-center justify-between p-4 ${r.deleted_at ? "opacity-40" : ""}`}>
                <div><p className="font-medium text-gray-900 text-sm">{r.title_fr}</p><p className="text-xs text-gray-400">{r.source}</p></div>
                <div className="flex gap-1">{r.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => restoreR(r)} /> : <><EditIcon label="Modifier" onClick={() => openEditR(r)} /><DeleteIcon label="Supprimer" onClick={() => deleteR(r)} /></>}</div>
              </div>
            ))}
            {replays.length === 0 && <p className="p-8 text-center text-gray-400">Aucune rediffusion</p>}
          </div>
        </>
      )}

      {editU !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveU} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editU === "new" ? "Nouvel événement" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date et heure *</label><input required type="datetime-local" value={uForm.eventDate} onChange={(e) => setUForm({ ...uForm, eventDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={uForm.titleFr} onChange={(e) => setUForm({ ...uForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={uForm.titleEn} onChange={(e) => setUForm({ ...uForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={uForm.descriptionFr} onChange={(e) => setUForm({ ...uForm, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={uForm.descriptionEn} onChange={(e) => setUForm({ ...uForm, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditU(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}

      {editR !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveR} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">{editR === "new" ? "Nouvelle rediffusion" : "Modifier"}</h2>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={rForm.titleFr} onChange={(e) => setRForm({ ...rForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (EN)</label><input value={rForm.titleEn} onChange={(e) => setRForm({ ...rForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Source</label><input value={rForm.source} onChange={(e) => setRForm({ ...rForm, source: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label><input type="date" value={rForm.replayDate} onChange={(e) => setRForm({ ...rForm, replayDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lien *</label><input required value={rForm.url} onChange={(e) => setRForm({ ...rForm, url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditR(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
