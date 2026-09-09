"use client";

import { useState } from "react";
import Link from "next/link";
import type { TexteJuridique } from "@/lib/textes-juridiques";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#162233";
const PAGE_SIZE = 10;

type Dict = { consulterTexte: string; documentNonDisponible: string };

export default function TextesJuridiquesListClient({ textes, dict }: { textes: TexteJuridique[]; dict: Dict }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(textes, page, PAGE_SIZE);

  return (
    <>
      <div className="flex flex-col gap-0">
        {pageItems.map((texte, i) => (
          <div
            key={texte.id}
            className="py-8"
            style={{ borderBottom: i < pageItems.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: VERT }}>
                {texte.type}
              </span>
              <span className="text-xs font-bold text-anthracite/70 tabular-nums">{texte.reference}</span>
              <span className="text-xs font-medium text-anthracite/60">{texte.date}</span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: "#16a34a20", color: "#16a34a" }}>
                {texte.status}
              </span>
            </div>
            <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-3 max-w-4xl">{texte.title}</h3>
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-4 max-w-3xl">{texte.description}</p>
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-xs font-medium text-anthracite/60">{texte.articles}</span>
              {texte.href !== "#" ? (
                <Link
                  href={texte.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-all hover:gap-4"
                  style={{ color: VERT }}
                >
                  {dict.consulterTexte}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-anthracite/50">
                  {dict.documentNonDisponible}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
