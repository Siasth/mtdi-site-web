"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";

const VERT = "#006828";
type Texte = { id: number; title_fr: string; title_en: string | null; type_fr: string | null; reference: string | null; date_label: string | null; status_fr: string | null; description_fr: string | null; description_en: string | null; articles_fr: string | null; href: string; display_order: number; active: boolean; deleted_at: string | null };
const emptyForm = { titleFr: "", titleEn: "", type: "Loi", reference: "", date: "", status: "En vigueur", descriptionFr: "", descriptionEn: "", articles: "", href: "", displayOrder: 0, active: true };

export default function AdminTextesJuridiques() {
  const canManage = useHasPermission("ressources.gerer");
  const [items, setItems] = useState<Texte[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");

  function load() { setLoading(true); fetch("/api/admin/textes-juridiques", { cache: "no-store" }).then((r) => r.json()).then((d) => { setItems(d); setLoading(false); }); }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  function openNew() { setForm({ ...emptyForm, displayOrder: items.length }); setActiveLang("fr"); setEditing("new"); }
  function openEdit(t: Texte) {
    setForm({ titleFr: t.title_fr, titleEn: t.title_en || "", type: t.type_fr || "Loi", reference: t.reference || "", date: t.date_label || "", status: t.status_fr || "En vigueur", descriptionFr: t.description_fr || "", descriptionEn: t.description_en || "", articles: t.articles_fr || "", href: t.href, displayOrder: t.display_order, active: t.active });
    setActiveLang("fr"); setEditing(t.id);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editing === "new";
    await fetch(isNew ? "/api/admin/textes-juridiques" : `/api/admin/textes-juridiques/${editing}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setEditing(null); load();
  }
  async function handleDelete(t: Texte) { if (confirm(`Supprimer "${t.title_fr}" ?`)) { await fetch(`/api/admin/textes-juridiques/${t.id}`, { method: "DELETE" }); load(); } }
  async function handleRestore(t: Texte) { await fetch(`/api/admin/textes-juridiques/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) }); load(); }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const { pageItems, totalPages, safePage } = paginate(items, page, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Textes juridiques</h1>
        <button onClick={openNew} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouveau texte</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {pageItems.map((t) => (
          <div key={t.id} className={`flex items-center justify-between p-4 ${t.deleted_at ? "opacity-40" : ""}`}>
            <div><p className="font-medium text-gray-900 text-sm">{t.title_fr}</p><p className="text-xs text-gray-400">{t.reference} · {t.date_label}</p></div>
            <div className="flex gap-1">{t.deleted_at ? <RestoreIcon label="Restaurer" onClick={() => handleRestore(t)} /> : <><EditIcon label="Modifier" onClick={() => openEdit(t)} /><DeleteIcon label="Supprimer" onClick={() => handleDelete(t)} /></>}</div>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-gray-400">Aucun texte</p>}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing === "new" ? "Nouveau texte" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>Version anglaise</button>
              </div>
              <ModalCloseButton onClick={() => setEditing(null)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Loi, Décret..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Référence</label><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Loi n°..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Statut</label><input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            {activeLang === "fr" ? (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre (FR) *</label><input required value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (FR)</label><textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </>
            ) : (
              <>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (EN)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </>
            )}
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Articles (libellé)</label><input value={form.articles} onChange={(e) => setForm({ ...form, articles: e.target.value })} placeholder="ex: 478 articles répartis en 8 livres" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lien du document *</label><input required value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
