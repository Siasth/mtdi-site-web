"use client";

import { useState } from "react";
import type { UpcomingEvent, Replay } from "@/lib/direct";
import { Pagination, paginate } from "@/app/components/Pagination";

const VERT = "#006828";
const UPCOMING_PAGE_SIZE = 6;
const REPLAYS_PAGE_SIZE = 8;

type Dict = { prochainsDirecs: string; replays: string; revoir: string };

export function UpcomingEventsList({ events, dict }: { events: UpcomingEvent[]; dict: Dict }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(events, page, UPCOMING_PAGE_SIZE);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
          {dict.prochainsDirecs}
        </h2>
        <div className="flex flex-col gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
          {pageItems.map((event) => (
            <div key={event.id} className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 p-6 sm:p-8 bg-white">
              <div className="flex-shrink-0 w-full sm:w-52">
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed" style={{ color: "#7A5800" }}>
                  {event.date}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-anthracite font-black text-base sm:text-lg uppercase leading-snug mb-2">{event.title}</h3>
                <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}

export function ReplaysList({ replays, dict }: { replays: Replay[]; dict: Dict }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(replays, page, REPLAYS_PAGE_SIZE);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
          {dict.replays}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
          {pageItems.map((replay) => (
            <a
              key={replay.id}
              href={replay.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-6 bg-white hover:bg-gris-perle transition-colors"
              style={{ minHeight: "220px" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: `${VERT}12`, border: `1px solid ${VERT}30` }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={VERT} style={{ marginLeft: "2px" }} aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              <div>
                <h3 className="text-anthracite font-black text-sm uppercase leading-snug mb-4">{replay.title}</h3>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="text-anthracite/60 text-[10px] font-medium">{replay.source} · {replay.date}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest transition-all group-hover:underline" style={{ color: VERT }}>
                    {dict.revoir}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}
