"use client";
import { useState, useEffect } from "react";
import { useHasPermission } from "../AdminLayoutClient";
import MarkdownEditor from "../components/MarkdownEditor";
import VersionHistory from "../components/VersionHistory";

const VERT = "#006828";
const PAGES = [
  { slug: "mentions-legales", label: "Mentions légales" },
  { slug: "confidentialite", label: "Confidentialité" },
  { slug: "accessibilite", label: "Accessibilité" },
];

type Row = { slug: string; content_fr: string; content_en: string; published: boolean };

export default function AdminPagesStatiques() {
  const canManage = useHasPermission("ressources.gerer");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState(PAGES[0].slug);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/static-pages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setRows(d); setLoading(false); });
  }
  useEffect(() => { if (canManage) load(); }, [canManage]);

  const current = rows.find((r) => r.slug === activeSlug);

  function updateCurrent(field: "content_fr" | "content_en" | "published", value: string | boolean) {
    setRows((prev) => prev.map((r) => (r.slug === activeSlug ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    if (!current) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/static-pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: current.slug, contentFr: current.content_fr, contentEn: current.content_en, published: current.published }),
    });
    setMsg(res.ok ? { type: "success", text: "Enregistré." } : { type: "error", text: "Erreur lors de l'enregistrement." });
    setSaving(false);
  }

  if (!canManage) return <div className="p-8"><p className="text-gray-500">Accès refusé.</p></div>;
  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pages légales</h1>
      <p className="text-sm text-gray-500 mb-6">Mentions légales, Confidentialité, Accessibilité — publiables/dépubliables indépendamment</p>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {PAGES.map((p) => (
          <button key={p.slug} onClick={() => { setActiveSlug(p.slug); setMsg(null); }} className="px-4 py-2 text-sm font-bold" style={activeSlug === p.slug ? { color: VERT, borderBottom: `2px solid ${VERT}` } : { color: "#999" }}>
            {p.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5">
            <div>
              <p className="font-bold text-gray-900">{PAGES.find((p) => p.slug === activeSlug)?.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">/{activeSlug}</p>
              <button type="button" onClick={() => setShowHistory(true)} className="text-xs font-bold hover:underline mt-1" style={{ color: VERT }}>
                Historique
              </button>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">{current.published ? "Publiée" : "Dépubliée"}</span>
              <button
                type="button"
                onClick={() => updateCurrent("published", !current.published)}
                className="w-11 h-6 rounded-full relative transition-colors"
                style={{ background: current.published ? VERT : "#d1d5db" }}
              >
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: current.published ? "22px" : "2px" }} />
              </button>
            </label>
          </div>
          {!current.published && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Cette page est dépubliée : les visiteurs verront un message "page non disponible" au lieu du contenu.
            </p>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Contenu</h2>
              <div className="flex text-xs font-bold uppercase rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setActiveLang("fr")} className="px-4 py-2" style={activeLang === "fr" ? { background: VERT, color: "white" } : { color: "#666" }}>Français</button>
                <button type="button" onClick={() => setActiveLang("en")} className="px-4 py-2" style={activeLang === "en" ? { background: VERT, color: "white" } : { color: "#666" }}>English</button>
              </div>
            </div>
            {activeLang === "fr" ? (
              <MarkdownEditor value={current.content_fr} onChange={(v) => updateCurrent("content_fr", v)} rows={16} />
            ) : (
              <MarkdownEditor value={current.content_en} onChange={(v) => updateCurrent("content_en", v)} placeholder="Laisser vide si pas encore traduit" rows={16} />
            )}
          </div>

          {msg && <p className={`text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
          <button onClick={handleSave} disabled={saving} className="px-6 py-3 text-sm font-bold uppercase tracking-wider text-white rounded-lg disabled:opacity-50" style={{ background: VERT }}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}

      {showHistory && current && (
        <VersionHistory
          table="static_pages"
          recordId={current.slug}
          current={current}
          fieldLabels={{ content_fr: "Contenu (FR)", content_en: "Contenu (EN)", published: "Publiée" }}
          canRestore={canManage}
          onRestored={load}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
