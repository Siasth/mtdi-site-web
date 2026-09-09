"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { ColorContrastHint } from "../components/ColorContrastHint";

const VERT = "#006828";
type Item = { id: number; role_fr: string; role_en: string | null; name_fr: string; name_en: string | null; email: string; phone: string | null; note_fr: string | null; note_en: string | null; accent: string | null; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { role: "", name: "", email: "", phone: "", note: "", accent: "#006828", displayOrder: 0, active: true };

export default function AdminContactsSpecifiques() {
  const canManage = useHasPermission("ressources.gerer");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() { setLoading(true); fetch("/api/admin/contacts-specifiques", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setEditing("new"); }
  function openEdit(it: Item) { setForm({ role: it.role_fr, name: it.name_fr, email: it.email, phone: it.phone || "", note: it.note_fr || "", accent: it.accent || "#006828", displayOrder: it.display_order, active: it.active }); setEditing(it.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/contacts-specifiques" : `/api/admin/contacts-specifiques/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(it: Item) { if (confirm(`Supprimer "${it.role_fr}" ?`)) { await fetch(`/api/admin/contacts-specifiques/${it.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(it: Item) { await fetch(`/api/admin/contacts-specifiques/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(items, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Contacts spécifiques</h1><p className="text-sm text-gray-500 mt-1">Presse, partenariats, réclamations — affichés sur la page Contact</p></div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau contact</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((it) => (
          <div key={it.id} className={`flex items-center justify-between p-4 ${it.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3"><span className="w-2 h-8 rounded-full" style={{ background: it.accent || VERT }} /><div><p className="font-medium text-gray-900 text-sm">{it.role_fr}</p><p className="text-xs text-gray-400">{it.email} · {it.phone}</p></div></div>
            <div className="flex gap-1">{it.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(it)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(it)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(it)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucun contact</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau contact" : "Modifier"}</h2>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rôle *</label><input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="ex: Presse & Accréditations" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom du service</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Note</label><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Couleur</label><input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-20 h-9 rounded border border-gray-200" /><ColorContrastHint color={form.accent} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
