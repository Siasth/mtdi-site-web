"use client";

import { useState } from "react";
import type { Opportunite } from "@/lib/opportunites";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const PAGE_SIZE = 6;

export default function OffersListClient({
  offers,
  ctaExternal,
  consulterAppelsOffres,
  voirOffre,
}: {
  offers: Opportunite[];
  ctaExternal: boolean;
  consulterAppelsOffres: string;
  voirOffre: string;
}) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(offers, page, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {pageItems.map((offer) => (
        <div key={offer.id} className="p-6 sm:p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-anthracite font-black text-base uppercase leading-snug">{offer.title}</h3>
            {offer.deadline && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ background: `${JAUNE}30`, color: "#7A5800" }}>{offer.deadline}</span>
            )}
          </div>
          {offer.description && <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-4">{offer.description}</p>}
          {offer.href && (
            <a
              href={offer.href}
              target={offer.href.startsWith("http") ? "_blank" : undefined}
              rel={offer.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:gap-4"
              style={{ color: VERT }}
            >
              {ctaExternal ? consulterAppelsOffres : voirOffre}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
            </a>
          )}
        </div>
      ))}
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
