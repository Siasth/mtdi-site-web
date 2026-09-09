"use client";

import { useState } from "react";
import Link from "next/link";
import type { DocumentItem } from "@/lib/documents";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#162233";
const ROUGE = "#EB0000";
const DOCS_PAGE_SIZE = 8;

type Dict = { tous: string; strategies: string; rapports: string; guides: string; textesJuridiques: string; documentsEssentiels: string; tousDocuments: string; telechargement: string };

export default function DocumentListClient({ documents, dict, locale }: { documents: DocumentItem[]; dict: Dict; locale: string }) {
  const categories = [
    { label: dict.tous, value: "all" },
    { label: dict.strategies, value: "stratégie" },
    { label: dict.rapports, value: "rapport" },
    { label: dict.guides, value: "guide" },
    { label: dict.textesJuridiques, value: "juridique" },
  ];

  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const byCategory = activeCategory === "all" ? documents : documents.filter((d) => d.category === activeCategory);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery ? byCategory.filter((d) => d.title.toLowerCase().includes(normalizedQuery)) : byCategory;
  const featured = filtered.filter((d) => d.featured);
  const others = filtered.filter((d) => !d.featured);
  const { pageItems: visibleOthers, totalPages, safePage } = paginate(others, page, DOCS_PAGE_SIZE);

  return (
    <>
      {/* Filter + recherche */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
                style={{ background: activeCategory === cat.value ? VERT : "rgba(0,0,0,0.04)", color: activeCategory === cat.value ? "white" : "rgba(26,26,26,0.50)" }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" fill="none" stroke="rgba(26,26,26,0.4)" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={locale === "en" ? "Search a document..." : "Rechercher un document..."}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gris-perle rounded-lg focus:outline-none focus:ring-1"
              style={{ border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>
        </div>
      </section>

      {filtered.length === 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <p className="max-w-7xl mx-auto text-center text-anthracite/50 text-sm font-medium">
            {locale === "en" ? "No documents match your search." : "Aucun document ne correspond à votre recherche."}
          </p>
        </section>
      )}

      {/* Featured documents */}
      {featured.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>{dict.documentsEssentiels}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {featured.map((doc) => (
                <div key={doc.id} className="group p-8 sm:p-10 bg-white hover:bg-gris-perle transition-colors flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: ROUGE }}>{doc.type}</span>
                    <span className="text-xs font-bold text-anthracite/65">{doc.date}</span>
                  </div>
                  <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-4">{doc.title}</h3>
                  <p className="text-anthracite/75 text-sm font-medium leading-relaxed group-hover:text-anthracite/70 transition-colors flex-1">{doc.description}</p>
                  <Link href={doc.href} target={doc.href.startsWith("http") ? "_blank" : undefined} className="mt-6 inline-flex items-center gap-3 px-6 py-3 text-sm font-black uppercase tracking-wider transition-all hover:gap-5 self-start" style={{ background: VERT, color: "white" }}>
                    {dict.telechargement}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All documents */}
      {others.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>{dict.tousDocuments}</h2>
            <div className="flex flex-col gap-0">
              {visibleOthers.map((doc, i) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 py-7" style={{ borderBottom: i < visibleOthers.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
                  <div className="flex-shrink-0 flex items-center gap-3 sm:w-40">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: ROUGE }}>{doc.type}</span>
                    <span className="text-xs font-bold text-anthracite/65 tabular-nums">{doc.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-2">{doc.title}</h3>
                    <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-3">{doc.description}</p>
                    <Link href={doc.href} target={doc.href.startsWith("http") ? "_blank" : undefined} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:gap-3" style={{ color: VERT }}>
                      {dict.telechargement}
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>
      )}
    </>
  );
}
