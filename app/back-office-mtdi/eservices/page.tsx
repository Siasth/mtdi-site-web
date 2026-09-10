"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import { IconPreset, ICON_PRESET_KEYS } from "../../components/IconPreset";

const VERT = "#006828";
type Item = { id: number; title_fr: string; title_en: string | null; description_fr: string | null; description_en: string | null; href: string; icon_key: string; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "", href: "", icon: "document", displayOrder: 0, active: true };

export default function AdminEServices() {
  const canManage = useHasPermission("ressources.gerer");
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);

  function load() { setLoading(true); fetch("/api/admin/eservices", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setEditing("new"); }
  function openEdit(it: Item) { setForm({ titleFr: it.title_fr, titleEn: it.title_en || "", descriptionFr: it.description_fr || "", descriptionEn: it.description_en || "", href: it.href, icon: it.icon_key, displayOrder: it.display_order, active: it.active }); setEditing(it.id); }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/eservices" : `/api/admin/eservices/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(it: Item) { if (confirm(`Supprimer "${it.title_fr}" ?`)) { await fetch(`/api/admin/eservices/${it.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(it: Item) { await fetch(`/api/admin/eservices/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(items, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">e-Services</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau service</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((it) => (
          <div key={it.id} className={`flex items-center justify-between p-4 ${it.deleted_at ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3"><IconPreset name={it.icon_key} color={VERT} size={20} /><p className="font-medium text-gray-900 text-sm">{it.title_fr}</p></div>
            <div className="flex gap-1">{it.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(it)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(it)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(it)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucun service</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau service" : "Modifier"}</h2>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-fr">Titre (FR) *</label><input id="titre-fr" required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-en">Titre (EN)</label><input id="titre-en" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="description-fr">Description (FR)</label><textarea id="description-fr" value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="description-en">Description (EN)</label><textarea id="description-en" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="lien">Lien *</label><input id="lien" required value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESET_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setForm({ ...form, icon: key })} className="w-10 h-10 rounded-lg border flex items-center justify-center" style={form.icon === key ? { borderColor: VERT, background: `${VERT}10` } : { borderColor: "#e5e7eb" }}>
                    <IconPreset name={key} color={form.icon === key ? VERT : "#999"} size={18} />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
