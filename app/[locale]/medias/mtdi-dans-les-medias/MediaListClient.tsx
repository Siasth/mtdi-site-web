"use client";

import { useState } from "react";
import type { MediaMention } from "@/lib/media-mentions";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";
const FILTER_ALL = "all";
const PAGE_SIZE = 10;

type Dict = { tous: string; medias: string; voir: string };

function colorFor(key: string): { bg: string; text: string } {
  return key === "JAUNE" ? { bg: JAUNE, text: "#1A1A1A" } : { bg: ROUGE, text: "white" };
}

export default function MediaListClient({ items, dict }: { items: MediaMention[]; dict: Dict }) {
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);

  const filters = [
    { value: FILTER_ALL, label: dict.tous },
    { value: "Médias", label: dict.medias },
  ];

  const filtered = activeFilter === FILTER_ALL ? items : items.filter((item) => item.type === activeFilter);
  const { pageItems, totalPages, safePage } = paginate(filtered, page, PAGE_SIZE);

  return (
    <>
      {/* Filter tabs */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-px overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => { setActiveFilter(filter.value); setPage(1); }}
                className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
                style={{ background: activeFilter === filter.value ? VERT : "rgba(0,0,0,0.04)", color: activeFilter === filter.value ? "white" : "rgba(26,26,26,0.45)" }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Média items list */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
            {pageItems.map((item) => {
              const c = colorFor(item.typeColor);
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group bg-white hover:bg-gris-perle transition-colors p-6 sm:p-8 block">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                    <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 sm:w-44">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: c.bg, color: c.text }}>{item.type}</span>
                      <span className="text-anthracite/60 text-xs font-medium">{item.date}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-anthracite font-black text-base sm:text-lg leading-snug uppercase group-hover:text-anthracite/80 transition-colors mb-3">{item.title}</h2>
                      <p className="text-anthracite/75 text-sm leading-relaxed mb-4">{item.excerpt}</p>
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <span className="text-anthracite/60 text-[10px] font-semibold uppercase tracking-wider">{item.source}</span>
                        <span className="text-xs font-black uppercase tracking-widest transition-all" style={{ color: VERT }}>{dict.voir}</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </>
  );
}
