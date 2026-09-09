"use client";

import { useState, useEffect } from "react";
import { ModalCloseButton } from "../components/ModalHeader";
import { Pagination, paginate } from "../components/Pagination";
import { useHasPermission } from "../AdminLayoutClient";
import { EditIcon, DeleteIcon, RestoreIcon } from "../components/ActionIcons";
import MarkdownEditor from "../components/MarkdownEditor";
import { uploadFile } from "@/lib/client-upload";
import { URL_PATTERN } from "@/lib/validators";

const VERT = "#006828";

type Collection = { id: number; name_fr: string; name_en: string | null; display_order: number; usage_count: string };

type GalerieItem = {
  id: number;
  type: string;
  title_fr: string; title_en: string | null;
  description_fr: string; description_en: string | null;
  event_date: string | null; credit: string | null;
  collection_id: number | null; coll_name_fr: string | null;
  image: string | null; video_url: string | null; href_external: string | null;
  featured_home: boolean; status: string; display_order: number;
  deleted_at: string | null;
};

type ItemForm = {
  type: string; titleFr: string; titleEn: string; descriptionFr: string; descriptionEn: string;
  eventDate: string; credit: string; collectionId: number | ""; image: string; videoUrl: string;
  hrefExternal: string; featuredHome: boolean; status: string; displayOrder: number;
};

const emptyItemForm: ItemForm = {
  type: "photo", titleFr: "", titleEn: "", descriptionFr: "", descriptionEn: "",
  eventDate: new Date().toISOString().slice(0, 10), credit: "", collectionId: "", image: "", videoUrl: "",
  hrefExternal: "", featuredHome: false, status: "publie", displayOrder: 0,
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  publie: { label: "Publié", className: "bg-green-100 text-green-700" },
  depublie: { label: "Dépublié", className: "bg-amber-100 text-amber-700" },
  archive: { label: "Archivé", className: "bg-slate-200 text-slate-600" },
};

export default function AdminGalerie() {
  const canView = useHasPermission("mediatheque.voir");
  const canManage = useHasPermission("mediatheque.gerer");

  const [tab, setTab] = useState<"items" | "collections">("items");
  const [items, setItems] = useState<GalerieItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [itemsPage, setItemsPage] = useState(1);
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  function load() {
    setLoading(true);
    setLoadError("");
    Promise.all([
      fetch("/api/admin/galerie-items", { cache: "no-store" }).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); }),
      fetch("/api/admin/galerie-collections", { cache: "no-store" }).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json(); }),
    ])
      .then(([i, c]) => { setItems(i); setCollections(c); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }
  useEffect(() => { if (canView) load(); }, [canView]);

  // ── Formulaire élément ──
  const [editingItem, setEditingItem] = useState<number | "new" | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function openNewItem() {
    setItemForm({ ...emptyItemForm, collectionId: collections[0]?.id ?? "", displayOrder: items.length });
    setActiveLang("fr");
    setSaveError("");
    setEditingItem("new");
  }
  function openEditItem(it: GalerieItem) {
    setItemForm({
      type: it.type, titleFr: it.title_fr, titleEn: it.title_en || "",
      descriptionFr: it.description_fr || "", descriptionEn: it.description_en || "",
      eventDate: (it.event_date || "").slice(0, 10), credit: it.credit || "",
      collectionId: it.collection_id ?? "", image: it.image || "", videoUrl: it.video_url || "",
      hrefExternal: it.href_external || "", featuredHome: it.featured_home, status: it.status,
      displayOrder: it.display_order,
    });
    setActiveLang("fr");
    setSaveError("");
    setEditingItem(it.id);
  }

  async function handleUpload(field: "image" | "videoUrl", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadFile(file, itemForm[field] as string);
      setItemForm((f) => ({ ...f, [field]: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const isNew = editingItem === "new";
    const res = await fetch(isNew ? "/api/admin/galerie-items" : `/api/admin/galerie-items/${editingItem}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    if (res.ok) {
      setSaving(false);
      setEditingItem(null);
      load();
    } else {
      const data = await res.json();
      setSaveError(data.error || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  async function handleDeleteItem(it: GalerieItem) {
    if (!confirm(`Supprimer "${it.title_fr}" ? (réversible)`)) return;
    await fetch(`/api/admin/galerie-items/${it.id}`, { method: "DELETE" });
    load();
  }
  async function handleRestoreItem(it: GalerieItem) {
    await fetch(`/api/admin/galerie-items/${it.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }),
    });
    load();
  }

  // ── Formulaire collection ──
  const [editingColl, setEditingColl] = useState<number | "new" | null>(null);
  const [collForm, setCollForm] = useState({ nameFr: "", nameEn: "", displayOrder: 0 });
  const [collError, setCollError] = useState("");

  function openNewColl() {
    setCollForm({ nameFr: "", nameEn: "", displayOrder: collections.length });
    setCollError("");
    setEditingColl("new");
  }
  function openEditColl(c: Collection) {
    setCollForm({ nameFr: c.name_fr, nameEn: c.name_en || "", displayOrder: c.display_order });
    setCollError("");
    setEditingColl(c.id);
  }
  async function handleSaveColl(e: React.FormEvent) {
    e.preventDefault();
    setCollError("");
    const isNew = editingColl === "new";
    const res = await fetch(isNew ? "/api/admin/galerie-collections" : `/api/admin/galerie-collections/${editingColl}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collForm),
    });
    if (res.ok) { setEditingColl(null); load(); }
    else { const d = await res.json(); setCollError(d.error); }
  }
  async function handleDeleteColl(c: Collection) {
    if (!confirm(`Supprimer la collection "${c.name_fr}" ?`)) return;
    const res = await fetch(`/api/admin/galerie-collections/${c.id}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) alert(d.error);
    load();
  }

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

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 max-w-xl">
          <p className="font-bold text-red-700 mb-1">Erreur de chargement</p>
          <p className="text-sm text-red-600 whitespace-pre-wrap">{loadError}</p>
          <button onClick={load} className="mt-4 px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { pageItems: pageOfItems, totalPages: itemsTotalPages, safePage: itemsSafePage } = paginate(items, itemsPage, 10);
  const { pageItems: pageOfCollections, totalPages: collectionsTotalPages, safePage: collectionsSafePage } = paginate(collections, collectionsPage, 10);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie</h1>
          <p className="text-sm text-gray-500 mt-1">Photos et vidéos affichées sur l'accueil et la page Galerie</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button onClick={() => setTab("items")} className="px-4 py-2 text-sm font-bold" style={tab === "items" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>
          Éléments ({items.filter((i) => !i.deleted_at).length})
        </button>
        <button onClick={() => setTab("collections")} className="px-4 py-2 text-sm font-bold" style={tab === "collections" ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>
          Collections ({collections.length})
        </button>
      </div>

      {tab === "items" && (
        <>
          {canManage && (
            <div className="mb-4 flex justify-end">
              <button onClick={openNewItem} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
                + Nouvel élément
              </button>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Titre (FR)</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Collection</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Accueil</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageOfItems.map((it) => (
                  <tr key={it.id} className={it.deleted_at ? "opacity-40" : ""}>
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{it.title_fr}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{it.type}</td>
                    <td className="px-5 py-3 text-gray-500">{it.coll_name_fr || "—"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{it.event_date ? new Date(it.event_date).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_LABELS[it.status]?.className || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[it.status]?.label || it.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">{it.featured_home ? "✓" : ""}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {it.deleted_at ? (
                          canManage && <RestoreIcon label="Restaurer" onClick={() => handleRestoreItem(it)} />
                        ) : (
                          canManage && (
                            <>
                              <EditIcon label="Modifier" onClick={() => openEditItem(it)} />
                              <DeleteIcon label="Supprimer" onClick={() => handleDeleteItem(it)} />
                            </>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Aucun élément</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={itemsSafePage} totalPages={itemsTotalPages} onChange={setItemsPage} />
          </div>
        </>
      )}

      {tab === "collections" && (
        <>
          {canManage && (
            <div className="mb-4 flex justify-end">
              <button onClick={openNewColl} className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>
                + Nouvelle collection
              </button>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nom (FR)</th>
                  <th className="px-5 py-3">Nom (EN)</th>
                  <th className="px-5 py-3">Éléments</th>
                  {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageOfCollections.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">{c.name_fr}</td>
                    <td className="px-5 py-3 text-gray-500">{c.name_en || <span className="text-amber-600 text-xs">⚠ non traduit</span>}</td>
                    <td className="px-5 py-3 text-gray-500">{c.usage_count}</td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <EditIcon label="Modifier" onClick={() => openEditColl(c)} />
                          <DeleteIcon label="Supprimer" onClick={() => handleDeleteColl(c)} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {collections.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Aucune collection</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={collectionsSafePage} totalPages={collectionsTotalPages} onChange={setCollectionsPage} />
          </div>
        </>
      )}

      {/* Modale élément */}
      {editingItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={handleSaveItem} className="bg-white rounded-xl p-6 w-[90%] max-w-3xl shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingItem === "new" ? "Nouvel élément" : "Modifier"}</h2>
              <div className="flex text-xs font-bold uppercase tracking-wider rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2 flex items-center gap-1.5" style={activeLang === "en" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}>
                  English
                  {!itemForm.titleEn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              </div>
              <ModalCloseButton onClick={() => setEditingItem(null)} />
            </div>

            {activeLang === "fr" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre (Français) *</label>
                  <input required value={itemForm.titleFr} onChange={(e) => setItemForm({ ...itemForm, titleFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Français)</label>
                  <MarkdownEditor value={itemForm.descriptionFr} onChange={(v) => setItemForm({ ...itemForm, descriptionFr: v })} rows={3} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!itemForm.titleFr && <p className="text-xs text-amber-600">Renseignez d'abord le français.</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title (English)</label>
                  <input value={itemForm.titleEn} onChange={(e) => setItemForm({ ...itemForm, titleEn: e.target.value })} placeholder="Laisser vide si pas encore traduit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (English)</label>
                  <MarkdownEditor value={itemForm.descriptionEn} onChange={(v) => setItemForm({ ...itemForm, descriptionEn: v })} placeholder="Laisser vide si pas encore traduit" rows={3} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Type</label>
                <select value={itemForm.type} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="photo">Photo</option>
                  <option value="video">Vidéo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Collection</label>
                <select value={itemForm.collectionId} onChange={(e) => setItemForm({ ...itemForm, collectionId: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Aucune</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-4">Date *</label>
                <input required type="date" value={itemForm.eventDate} onChange={(e) => setItemForm({ ...itemForm, eventDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Crédit photo/vidéo</label>
                <input value={itemForm.credit} onChange={(e) => setItemForm({ ...itemForm, credit: e.target.value })} placeholder="ex : MTDI / Direction de la Communication" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Statut</label>
                <select value={itemForm.status} onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                  <option value="depublie">Dépublié</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image</label>
              {itemForm.image && <img src={itemForm.image} alt="" className="h-24 rounded-lg mb-2 object-cover" />}
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                {uploading ? "Envoi..." : "Choisir une image"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload("image", e)} />
              </label>
            </div>

            {itemForm.type === "video" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vidéo (fichier ou lien YouTube)</label>
                <input type="url" pattern={URL_PATTERN} title="URL valide commençant par http:// ou https://" value={itemForm.videoUrl} onChange={(e) => setItemForm({ ...itemForm, videoUrl: e.target.value })} placeholder="https://youtube.com/... ou uploadez un fichier" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                  {uploading ? "Envoi..." : "Ou uploader un fichier vidéo"}
                  <input type="file" accept="video/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload("videoUrl", e)} />
                </label>
              </div>
            )}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lien externe (optionnel — remplace le lien interne par défaut)</label>
              <input type="url" pattern={URL_PATTERN} title="URL valide commençant par http:// ou https://" value={itemForm.hrefExternal} onChange={(e) => setItemForm({ ...itemForm, hrefExternal: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={itemForm.featuredHome} onChange={(e) => setItemForm({ ...itemForm, featuredHome: e.target.checked })} />
                Afficher dans le widget "L'innovation en images" (accueil)
              </label>
            </div>

            {saveError && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100"><p className="text-sm font-medium text-red-600">{saveError}</p></div>}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modale collection */}
      {editingColl !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSaveColl} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editingColl === "new" ? "Nouvelle collection" : "Modifier"}</h2>
              <ModalCloseButton onClick={() => setEditingColl(null)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom (Français) *</label>
              <input required value={collForm.nameFr} onChange={(e) => setCollForm({ ...collForm, nameFr: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom (English)</label>
              <input value={collForm.nameEn} onChange={(e) => setCollForm({ ...collForm, nameEn: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ordre</label>
              <input type="number" value={collForm.displayOrder} onChange={(e) => setCollForm({ ...collForm, displayOrder: Number(e.target.value) })} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
            </div>
            {collError && <p className="text-sm text-red-600">{collError}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingColl(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-500 rounded-lg border border-gray-200">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg" style={{ background: VERT }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
