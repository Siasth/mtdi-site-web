"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { VideoItem } from "@/lib/videos";
import { Pagination, paginate } from "@/app/components/Pagination";
import { getYoutubeThumbnail } from "@/lib/youtube-thumbnail";

const VERT  = "#162233";
const ROUGE = "#EB0000";
const PAGE_SIZE = 12;

type Dict = { video: string; regarder: string; regarderLien: string };

export default function VideothequeListClient({ videos, dict }: { videos: VideoItem[]; dict: Dict }) {
  const [page, setPage] = useState(1);
  const { pageItems, totalPages, safePage } = paginate(videos, page, PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
        {pageItems.map((video) => {
          const thumbnail = getYoutubeThumbnail(video.url);
          return (
          <article key={video.id} className="group bg-white hover:bg-gris-perle transition-colors">
            {/* Thumbnail */}
            <Link
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${dict.regarder} : ${video.title}`}
              className="block relative w-full"
              style={{ aspectRatio: "16 / 9" }}
            >
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: video.color }}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 0%, transparent 65%)" }}
                  />
                </div>
              )}

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
                  style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "3px" }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* VIDÉO badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: ROUGE, color: "white" }}>
                {dict.video}
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-3 right-3 px-2 py-0.5 text-[9px] font-bold tracking-wide" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>
                {video.duration}
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </Link>

            {/* Card content */}
            <div className="p-5 sm:p-6">
              <h3 className="text-anthracite font-black text-sm sm:text-base uppercase leading-snug mb-3 group-hover:text-anthracite/80 transition-colors">
                {video.title}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-anthracite/60 text-[10px] font-medium">{video.date}</span>
                <span className="text-anthracite/25 text-[10px]">·</span>
                <span className="text-anthracite/60 text-[10px] font-medium">{video.source}</span>
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <Link
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-widest transition-all"
                  style={{ color: VERT }}
                >
                  {dict.regarderLien}
                </Link>
              </div>
            </div>
          </article>
          );
        })}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
