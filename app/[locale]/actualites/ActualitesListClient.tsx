"use client";

import { useState } from "react";
import Link from "next/link";
import type { Actualite } from "@/lib/actualites";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#006828";

function textColorFor(bgColor: string): string {
  // Contraste simple : fond clair -> texte foncé, fond foncé -> texte blanc
  const hex = bgColor.replace("#", "");
  if (hex.length !== 6) return "white";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1A1A1A" : "white";
}

export default function ActualitesListClient({
  articles,
  locale,
  dict,
}: {
  articles: Actualite[];
  locale: string;
  dict: { tous: string; lire: string; chargerPlus: string };
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const prefix = locale === "en" ? "/en" : "";

  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const byCategory = activeCategory ? articles.filter((a) => a.category === activeCategory) : articles;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? byCategory.filter((a) => a.title.toLowerCase().includes(normalizedQuery))
    : byCategory;
  const { pageItems: visible, totalPages, safePage } = paginate(filtered, page, 12);

  return (
    <>
      {/* Filter tabs + recherche */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex gap-px overflow-x-auto" role="list" aria-label="Filtrer par catégorie" style={{ scrollbarWidth: "none" }}>
              <button
                role="listitem"
                onClick={() => { setActiveCategory(null); setPage(1); }}
                className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest"
                aria-current={activeCategory === null ? "true" : undefined}
                style={{ background: activeCategory === null ? VERT : "rgba(0,0,0,0.04)", color: activeCategory === null ? "white" : "rgba(26,26,26,0.65)" }}
              >
                {dict.tous}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="listitem"
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest"
                  aria-current={activeCategory === cat ? "true" : undefined}
                  style={{ background: activeCategory === cat ? VERT : "rgba(0,0,0,0.04)", color: activeCategory === cat ? "white" : "rgba(26,26,26,0.65)" }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0 w-full sm:w-64">
              <label htmlFor="actualites-search" className="sr-only">
                {locale === "en" ? "Search an article" : "Rechercher un article"}
              </label>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" fill="none" stroke="rgba(26,26,26,0.4)" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                id="actualites-search"
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder={locale === "en" ? "Search an article..." : "Rechercher un article..."}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gris-perle rounded-lg focus:outline-none focus:ring-1"
                style={{ border: "1px solid rgba(0,0,0,0.08)" }}
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-anthracite/50" aria-live="polite">
            {filtered.length} {locale === "en" ? (filtered.length > 1 ? "results" : "result") : (filtered.length > 1 ? "résultats" : "résultat")}
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-anthracite/50 text-sm font-medium py-12">
              {locale === "en" ? "No articles match your search." : "Aucun article ne correspond à votre recherche."}
            </p>
          ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((article) => {
              const href = article.hrefExternal || `${prefix}/actualites/${article.id}`;
              const isExternal = !!article.hrefExternal;
              return (
                <article key={article.id} className="group flex flex-col bg-white overflow-hidden transition-shadow hover:shadow-lg" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div className="relative w-full" style={{ aspectRatio: "16 / 9", background: article.image ? "#000" : "rgba(0,104,40,0.06)" }}>
                    {article.image ? (
                      <img
                        src={article.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <img
                        src="/mtdi-banner.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain p-8"
                      />
                    )}
                    <span
                      className="absolute top-3 right-3 inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: article.categoryColor, color: textColorFor(article.categoryColor) }}
                    >
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <span className="text-anthracite/60 text-xs font-medium mb-3">
                      {new Date(article.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <h2 className="text-anthracite font-black text-base leading-snug uppercase group-hover:text-anthracite/80 transition-colors flex-1">
                      {article.title}
                    </h2>

                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="mt-5 inline-flex items-center justify-between gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ background: VERT }}
                    >
                      {dict.lire}
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
          )}
        </div>
      </section>
    </>
  );
}
