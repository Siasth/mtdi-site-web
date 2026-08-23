"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalerieItem, GalerieCollection } from "@/lib/galerie";

const VERT = "#006828";
const ROUGE = "#EB0000";
const PAGE_SIZE = 12;

type Dict = {
  video: string; photo: string; resultats: string; resultatsPluriel: string;
  aucunResultat: string; essayezAutres: string; rechercherPlaceholder: string; effacer: string;
};

export default function GalerieListClient({
  items,
  collections,
  locale,
  dict,
}: {
  items: GalerieItem[];
  collections: GalerieCollection[];
  locale: string;
  dict: Dict;
}) {
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const prefix = locale === "en" ? "/en" : "";

  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const matchesSearch = (item: GalerieItem) => {
    if (!search.trim()) return true;
    const q = normalize(search);
    return (
      normalize(item.title).includes(q) ||
      normalize(item.description).includes(q) ||
      (item.credit ? normalize(item.credit).includes(q) : false)
    );
  };

  const filtered = items
    .filter((item) => activeFilter === "all" || item.collectionId === activeFilter)
    .filter(matchesSearch);

  const visibleFiltered = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  const sections =
    activeFilter === "all"
      ? collections
          .map((c) => ({
            key: c.id,
            name: c.name,
            items: visibleFiltered.filter((item) => item.collectionId === c.id),
          }))
          .filter((s) => s.items.length > 0)
      : [{
          key: activeFilter,
          name: collections.find((c) => c.id === activeFilter)?.name ?? "",
          items: visibleFiltered,
        }];

  const resultLabel = filtered.length > 1 ? dict.resultatsPluriel : dict.resultats;

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <>
      {/* Search bar */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative" style={{ border: "1.5px solid rgba(0,0,0,0.12)" }}>
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-anthracite/30" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
              placeholder={dict.rechercherPlaceholder}
              aria-label={dict.rechercherPlaceholder}
              className="w-full pl-12 pr-4 py-4 text-sm font-medium text-anthracite placeholder-anthracite/30 outline-none bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-anthracite/80 hover:text-anthracite transition-colors"
                aria-label={dict.effacer}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-px overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => { setActiveFilter("all"); setShowAll(false); }}
              className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
              style={{ background: activeFilter === "all" ? VERT : "rgba(0,0,0,0.04)", color: activeFilter === "all" ? "white" : "rgba(26,26,26,0.45)" }}
            >
              {locale === "en" ? "All" : "Toutes"}
            </button>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveFilter(c.id); setShowAll(false); }}
                className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
                style={{ background: activeFilter === c.id ? VERT : "rgba(0,0,0,0.04)", color: activeFilter === c.id ? "white" : "rgba(26,26,26,0.45)" }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <span className="text-anthracite/65 text-xs font-semibold uppercase tracking-widest flex-shrink-0">
            {filtered.length} {resultLabel}
          </span>
        </div>
      </section>

      {/* No results */}
      {filtered.length === 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gris-perle">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-anthracite/65 text-sm font-semibold uppercase tracking-widest mb-2">{dict.aucunResultat}</p>
            <p className="text-anthracite/80 text-xs font-medium">{dict.essayezAutres}</p>
          </div>
        </section>
      )}

      {/* Gallery sections */}
      <div className="bg-gris-perle">
        {sections.map((section) => (
          <section key={section.key} className="px-4 sm:px-6 lg:px-8 py-12" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-1 rounded-full" style={{ background: VERT }} />
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-anthracite">{section.name}</h2>
                  <span className="text-anthracite/65 text-xs font-bold">{section.items.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
                {section.items.map((item) => {
                  const href = item.hrefExternal || item.videoUrl || (item.image ? item.image : "#");
                  const isExternal = !!(item.hrefExternal || item.videoUrl);
                  return (
                    <a
                      key={item.id}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="group bg-white hover:bg-gris-perle transition-colors block"
                    >
                      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                        {item.image ? (
                          <Image src={item.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: "#162233" }} />
                        )}

                        {item.type === "video" && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "3px" }}>
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: ROUGE, color: "white" }}>
                              {dict.video}
                            </div>
                          </>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: VERT }}>
                            {item.type === "video" ? dict.video : dict.photo}
                          </span>
                          <span className="text-anthracite/25 text-[10px]">·</span>
                          <span className="text-anthracite/65 text-[10px] font-medium">{formatDate(item.eventDate)}</span>
                        </div>
                        <h3 className="text-anthracite font-black text-sm sm:text-base uppercase leading-snug mb-2 group-hover:text-vert-benin transition-colors">{item.title}</h3>
                        <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-3">{item.description}</p>
                        {item.credit && (
                          <p className="text-anthracite/80 text-[10px] font-semibold uppercase tracking-wider">{item.credit}</p>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {!showAll && filtered.length > PAGE_SIZE && (
        <div className="px-4 sm:px-6 lg:px-8 pb-16 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest bg-white"
            style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(26,26,26,0.75)" }}
          >
            {locale === "en" ? "Load more" : "Charger plus"}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
