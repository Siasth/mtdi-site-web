"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import type { GalerieItem } from "@/lib/galerie";

const VERT = "#006828";

export default function GalerieLightbox({
  items,
  index,
  onClose,
  onNavigate,
  formatDate,
}: {
  items: GalerieItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  formatDate: (iso: string | null) => string;
}) {
  const item = items[index];
  const count = items.length;

  const goPrev = useCallback(() => onNavigate((index - 1 + count) % count), [index, count, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % count), [index, count, onNavigate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    // Empêche le défilement de la page en arrière-plan pendant que la
    // visionneuse est ouverte.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(10,10,10,0.96)" }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      {/* Barre du haut : compteur + fermeture */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0">
        <span className="text-white/60 text-xs font-black uppercase tracking-widest">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Image + navigation */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
        {count > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Image précédente"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}

        <div className="relative w-full h-full max-w-5xl">
          {item.image && (
            <Image
              key={item.id}
              src={item.image}
              alt={item.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>

        {count > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Image suivante"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>

      {/* Légende */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-5 max-w-3xl mx-auto text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: VERT }}>
          {formatDate(item.eventDate)}
        </p>
        <h3 className="text-white font-black text-sm sm:text-base uppercase leading-snug mb-1.5">{item.title}</h3>
        {item.credit && <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">{item.credit}</p>}
      </div>
    </div>
  );
}
