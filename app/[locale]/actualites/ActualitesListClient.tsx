"use client";

import { useState } from "react";
import Link from "next/link";
import type { Actualite } from "@/lib/actualites";

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
  const [showAll, setShowAll] = useState(false);
  const prefix = locale === "en" ? "/en" : "";

  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const filtered = activeCategory ? articles.filter((a) => a.category === activeCategory) : articles;
  const visible = showAll ? filtered : filtered.slice(0, 6);

  return (
    <>
      {/* Filter tabs */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-px overflow-x-auto" role="list" aria-label="Filtrer par catégorie" style={{ scrollbarWidth: "none" }}>
            <button
              role="listitem"
              onClick={() => { setActiveCategory(null); setShowAll(false); }}
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
                onClick={() => { setActiveCategory(cat); setShowAll(false); }}
                className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest"
                aria-current={activeCategory === cat ? "true" : undefined}
                style={{ background: activeCategory === cat ? VERT : "rgba(0,0,0,0.04)", color: activeCategory === cat ? "white" : "rgba(26,26,26,0.65)" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
            {visible.map((article) => {
              const href = article.hrefExternal || `${prefix}/actualites`;
              const isExternal = !!article.hrefExternal;
              return (
                <article key={article.id} className="group flex flex-col justify-between p-8 bg-white hover:bg-gris-perle transition-colors" style={{ minHeight: "260px" }}>
                  <div>
                    <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-5" style={{ background: article.categoryColor, color: textColorFor(article.categoryColor) }}>
                      {article.category}
                    </span>
                    <h2 className="text-anthracite font-black text-base sm:text-lg leading-snug uppercase group-hover:text-anthracite/80 transition-colors">
                      {article.title}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                    <span className="text-anthracite/80 text-xs font-medium">
                      {new Date(article.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="text-xs font-black uppercase tracking-widest transition-all"
                      style={{ color: VERT }}
                    >
                      {dict.lire}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {!showAll && filtered.length > 6 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(26,26,26,0.75)" }}
              >
                {dict.chargerPlus}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
