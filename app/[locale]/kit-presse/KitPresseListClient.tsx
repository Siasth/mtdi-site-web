"use client";

import { useState } from "react";
import type { KitPresseItem } from "@/lib/kit-presse";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#162233";
const PAGE_SIZE = 8;

export default function KitPresseListClient({ docs, telecharger }: { docs: KitPresseItem[]; telecharger: string }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(docs, page, PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
        {pageItems.map((doc) => (
          <div key={doc.id} className="p-8 bg-white flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white mb-3"
                  style={{ background: VERT }}
                >
                  {doc.type}
                </span>
                <h3 className="text-anthracite font-black text-base uppercase leading-snug">{doc.title}</h3>
              </div>
              <svg className="flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{doc.description}</p>
            <a
              href={doc.href}
              download
              className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:gap-4"
              style={{ color: VERT }}
            >
              {telecharger}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </a>
          </div>
        ))}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
