"use client";
import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon } from "../components/ActionIcons";

const VERT = "#006828";
type Section = { id: number; title_fr: string; title_en: string | null; display_order: number; active: boolean };
type Link = { id: number; section_id: number; label_fr: string; label_en: string | null; href: string; display_order: number; active: boolean };

export default function AdminSitemap() {
  const canManage = useHasPermission("ressources.gerer");
  const [sections, setSections] = useState<Section[]>([]);
  const [linkPagesBySection, setLinkPagesBySection] = useState<Record<number, number>>({});
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/sitemap", { cache: "no-store" }).then((r) => r.json()).then((d) => { setSections(d.sections); setLinks(d.links); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  async function handleRegenerate() {
    if (!confirm("Ceci remplace TOUT le plan du site actuel par la suggestion basée sur les pages connues du site. Les modifications manuelles seront perdues. Continuer ?")) return;
    setRegenerating(true);
    await fetch("/api/admin/sitemap", { method: "POST" });
    setRegenerating(false);
    load();
  }

  // Sections
  const [editSec, setEditSec] = useState<number | "new" | null>(null);
  const [secForm, setSecForm] = useState({ titleFr: "", titleEn: "" });
  function openNewSec() { setSecForm({ titleFr: "", titleEn: "" }); setEditSec("new"); }
  function openEditSec(s: Section) { setSecForm({ titleFr: s.title_fr, titleEn: s.title_en || "" }); setEditSec(s.id); }
  async function saveSec(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editSec === "new";
    await fetch(isNew ? "/api/admin/sitemap-sections" : `/api/admin/sitemap-sections/${editSec}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...secForm, displayOrder: isNew ? sections.length : undefined }) });
    setEditSec(null); load();
  }
  async function deleteSec(s: Section) { if (confirm(`Supprimer la section "${s.title_fr}" et tous ses liens ?`)) { await fetch(`/api/admin/sitemap-sections/${s.id}`, { method: "DELETE" }); load(); } }

  // Liens
  const [editLink, setEditLink] = useState<number | "new" | null>(null);
  const [linkSectionId, setLinkSectionId] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState({ labelFr: "", labelEn: "", href: "" });
  function openNewLink(sectionId: number) { setLinkForm({ labelFr: "", labelEn: "", href: "" }); setLinkSectionId(sectionId); setEditLink("new"); }
  function openEditLink(l: Link) { setLinkForm({ labelFr: l.label_fr, labelEn: l.label_en || "", href: l.href }); setLinkSectionId(l.section_id); setEditLink(l.id); }
  async function saveLink(e: React.FormEvent) {
    e.preventDefault();
    const isNew = editLink === "new";
    const sectionLinks = links.filter((l) => l.section_id === linkSectionId);
    await fetch(isNew ? "/api/admin/sitemap-links" : `/api/admin/sitemap-links/${editLink}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...linkForm, sectionId: linkSectionId, displayOrder: isNew ? sectionLinks.length : undefined }) });
    setEditLink(null); load();
  }
  async function deleteLink(l: Link) { if (confirm(`Supprimer le lien "${l.label_fr}" ?`)) { await fetch(`/api/admin/sitemap-links/${l.id}`, { method: "DELETE" }); load(); } }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan du site</h1>
          <p className="text-sm text-gray-500 mt-1">Sections et liens affichés sur /plan-du-site</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRegenerate} disabled={regenerating} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
            {regenerating ? "Régénération..." : "↻ Régénérer la suggestion"}
          </button>
          <button onClick={openNewSec} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>+ Nouvelle section</button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-6">"Régénérer la suggestion" reconstruit tout le plan du site à partir des pages connues du site actuel — pratique pour repartir d'une base à jour, mais écrase vos modifications manuelles. Pensez à vérifier le résultat avant de le laisser en ligne.</p>

      <div className="space-y-6">
        {sections.map((sec) => {
          const sectionLinks = links.filter((l) => l.section_id === sec.id);
          const { pageItems, totalPages, safePage } = paginate(sectionLinks, linkPagesBySection[sec.id] || 1, 10);
          return (
          <div key={sec.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900">{sec.title_fr}</p>
              <div className="flex gap-1">
                <button onClick={() => openNewLink(sec.id)} className="text-xs font-bold hover:underline" style={{ color: VERT }}>+ Lien</button>
                <EditIcon label="Modifier la section" onClick={() => openEditSec(sec)} />
                <DeleteIcon label="Supprimer la section" onClick={() => deleteSec(sec)} />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pageItems.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2">
                  <div><p className="text-sm text-gray-800">{l.label_fr}</p><p className="text-xs text-gray-400">{l.href}</p></div>
                  <div className="flex gap-1"><EditIcon label="Modifier" onClick={() => openEditLink(l)} /><DeleteIcon label="Supprimer" onClick={() => deleteLink(l)} /></div>
                </div>
              ))}
              {sectionLinks.length === 0 && <p className="py-2 text-xs text-gray-400">Aucun lien</p>}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={(p) => setLinkPagesBySection((prev) => ({ ...prev, [sec.id]: p }))} />
          </div>
          );
        })}
      </div>

      {editSec !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveSec} className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editSec === "new" ? "Nouvelle section" : "Modifier la section"}</h2>
              <ModalCloseButton onClick={() => setEditSec(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-fr">Titre (FR) *</label><input id="titre-fr" required value={secForm.titleFr} onChange={(e) => setSecForm({ ...secForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="titre-en">Titre (EN)</label><input id="titre-en" value={secForm.titleEn} onChange={(e) => setSecForm({ ...secForm, titleEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditSec(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}

      {editLink !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={saveLink} className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editLink === "new" ? "Nouveau lien" : "Modifier le lien"}</h2>
              <ModalCloseButton onClick={() => setEditLink(null)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="libelle-fr">Libellé (FR) *</label><input id="libelle-fr" required value={linkForm.labelFr} onChange={(e) => setLinkForm({ ...linkForm, labelFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="libelle-en">Libellé (EN)</label><input id="libelle-en" value={linkForm.labelEn} onChange={(e) => setLinkForm({ ...linkForm, labelEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1" htmlFor="lien-chemin-interne-ex-contact">Lien (chemin interne, ex: /contact) *</label><input id="lien-chemin-interne-ex-contact" required value={linkForm.href} onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditLink(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button><button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
