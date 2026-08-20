"use client";

import { useState, useEffect } from "react";

type UpcomingEvent = { id: number; date: string; title: string; description: string };
type Replay = { id: number; title: string; source: string; date: string; url: string };
type DirectData = { upcoming: UpcomingEvent[]; replays: Replay[] };

export default function AdminDirect() {
  const [data, setData] = useState<DirectData>({ upcoming: [], replays: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "replays">("upcoming");
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);
  const [editingReplay, setEditingReplay] = useState<Replay | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    fetch("/api/admin/direct").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  };
  useEffect(load, []);

  const save = async (updated: DirectData) => {
    setSaving(true);
    await fetch("/api/admin/direct", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setData(updated);
    setSaving(false);
  };

  // Upcoming events
  const addEvent = () => { setEditingEvent({ id: 0, date: "", title: "", description: "" }); setIsNew(true); };
  const editEvent = (e: UpcomingEvent) => { setEditingEvent({ ...e }); setIsNew(false); };
  const saveEvent = async () => {
    if (!editingEvent) return;
    let updated: DirectData;
    if (isNew) {
      const id = data.upcoming.length ? Math.max(...data.upcoming.map((e) => e.id)) + 1 : 1;
      updated = { ...data, upcoming: [...data.upcoming, { ...editingEvent, id }] };
    } else {
      updated = { ...data, upcoming: data.upcoming.map((e) => (e.id === editingEvent.id ? editingEvent : e)) };
    }
    await save(updated);
    setEditingEvent(null);
    setIsNew(false);
  };
  const deleteEvent = async (id: number) => {
    await save({ ...data, upcoming: data.upcoming.filter((e) => e.id !== id) });
  };

  // Replays
  const addReplay = () => { setEditingReplay({ id: 0, title: "", source: "", date: "", url: "" }); setIsNew(true); };
  const editReplay = (r: Replay) => { setEditingReplay({ ...r }); setIsNew(false); };
  const saveReplay = async () => {
    if (!editingReplay) return;
    let updated: DirectData;
    if (isNew) {
      const id = data.replays.length ? Math.max(...data.replays.map((r) => r.id)) + 1 : 1;
      updated = { ...data, replays: [...data.replays, { ...editingReplay, id }] };
    } else {
      updated = { ...data, replays: data.replays.map((r) => (r.id === editingReplay.id ? editingReplay : r)) };
    }
    await save(updated);
    setEditingReplay(null);
    setIsNew(false);
  };
  const deleteReplay = async (id: number) => {
    await save({ ...data, replays: data.replays.filter((r) => r.id !== id) });
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Direct</h1>
        <p className="text-sm text-gray-500 mt-1">Événements à venir et replays</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("upcoming")} className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === "upcoming" ? "bg-green-700 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
          Prochains directs ({data.upcoming.length})
        </button>
        <button onClick={() => setTab("replays")} className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === "replays" ? "bg-green-700 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
          Replays ({data.replays.length})
        </button>
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={addEvent} className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
              Ajouter un événement
            </button>
          </div>
          <div className="space-y-3">
            {data.upcoming.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-600 mb-1">{event.date}</p>
                  <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editEvent(event)} className="p-2 text-gray-400 hover:text-green-700 rounded-lg transition-colors">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Replays */}
      {tab === "replays" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={addReplay} className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
              Ajouter un replay
            </button>
          </div>
          <div className="space-y-3">
            {data.replays.map((replay) => (
              <div key={replay.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{replay.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{replay.source} · {replay.date}</p>
                  {replay.url && <p className="text-xs text-green-700 mt-1 truncate">{replay.url}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editReplay(replay)} className="p-2 text-gray-400 hover:text-green-700 rounded-lg transition-colors">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => deleteReplay(replay.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Event modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingEvent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Nouvel événement" : "Modifier"}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date & heure</label>
                <input value={editingEvent.date} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })} placeholder="Ex: Samedi 2 août 2026 · 09h00" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre</label>
                <input value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditingEvent(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600">Annuler</button>
              <button onClick={saveEvent} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Replay modal */}
      {editingReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingReplay(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{isNew ? "Nouveau replay" : "Modifier"}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre</label>
                <input value={editingReplay.title} onChange={(e) => setEditingReplay({ ...editingReplay, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Source</label>
                  <input value={editingReplay.source} onChange={(e) => setEditingReplay({ ...editingReplay, source: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date</label>
                  <input value={editingReplay.date} onChange={(e) => setEditingReplay({ ...editingReplay, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">URL</label>
                <input value={editingReplay.url} onChange={(e) => setEditingReplay({ ...editingReplay, url: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-600" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditingReplay(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600">Annuler</button>
              <button onClick={saveReplay} disabled={saving} className="px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
