"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { Actualite } from "@/lib/actualites";

function textColorFor(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  if (hex.length !== 6) return "white";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1A1A1A" : "white";
}

export default function AlaUneCarousel({ items, locale }: { items: Actualite[]; locale: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const prefix = locale === "en" ? "/en" : "";

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function scrollBy(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.clientWidth ?? 340;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section id="a-la-une" className="bg-white py-10 relative">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#006828" }}>
            {locale === "en" ? "Highlights" : "À la une"}
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              aria-label={locale === "en" ? "Previous" : "Précédent"}
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center disabled:opacity-30 hover:bg-gris-perle transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              aria-label={locale === "en" ? "Next" : "Suivant"}
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center disabled:opacity-30 hover:bg-gris-perle transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={item.hrefExternal || `${prefix}/actualites/${item.id}`}
            target={item.hrefExternal ? "_blank" : undefined}
            rel={item.hrefExternal ? "noopener noreferrer" : undefined}
            className="group relative flex-shrink-0 w-[280px] sm:w-[320px] h-[380px] overflow-hidden"
            style={{ scrollSnapAlign: "start" }}
          >
            {item.image ? (
              <Image src={item.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="320px" />
            ) : (
              <div className="absolute inset-0" style={{ background: "#162233" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span
                className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ background: item.categoryColor, color: textColorFor(item.categoryColor) }}
              >
                {item.category}
              </span>
              <h3 className="text-lg font-black text-white leading-snug uppercase line-clamp-3">
                {item.title}
              </h3>
              <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wider mt-2">
                {new Date(item.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
