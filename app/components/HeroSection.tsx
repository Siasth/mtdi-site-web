"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Slide = { id: number; src: string; alt: string; video?: string };
type Dict = Record<string, string>;

export default function HeroSection({ slides: initialSlides, dict }: { slides?: Slide[]; dict?: Dict }) {
  const d = dict ?? {};
  const slides = initialSlides ?? [
    { id: 1, src: "/hero-conference.jpg", alt: "Conférence sur le numérique en Afrique" },
    { id: 2, src: "/hero-graduation.jpg", alt: "Cérémonie de remise des diplômes" },
    { id: 3, src: "/hero-city.jpg", alt: "Boulevard de la Marina, Cotonou" },
    { id: 4, src: "/hero-auditorium.jpg", alt: "Diplômés célébrant leur réussite" },
    { id: 5, src: "/chantier-01-ia.jpg", alt: "Intelligence artificielle" },
  ];
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  // Auto-advance every 3s, reset on manual navigation
  useEffect(() => {
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [current, next]);

  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      {/* Carousel slides (image ou vidéo) */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {slide.video ? (
            <video
              src={slide.video}
              poster={slide.src}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              aria-label={slide.alt}
            />
          ) : (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              quality={85}
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(13,19,45,0.68)" }} />
      <div className="hero-overlay absolute inset-0" />

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full transition-colors bg-white/10 hover:bg-white/25"
        aria-label={d.slidePrecedent ?? "Slide précédent"}
      >
        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full transition-colors bg-white/10 hover:bg-white/25"
        aria-label={d.slideSuivant ?? "Slide suivant"}
      >
        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/80 text-[10px] font-semibold uppercase tracking-widest">
                {d.republique ?? "République du Bénin"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase leading-tight tracking-tight">
              {d.tagline ?? "Transformer."}{" "}<span style={{ color: "#FCD116" }}>{d.taglineHighlight ?? "Innover."}</span>{" "}{d.taglineSuffix ?? "Servir."}
            </h1>
            <p className="mt-2 text-white/80 text-sm sm:text-base italic leading-relaxed max-w-md">
              {d.heroDesc ?? "Le Bénin bâtit sa souveraineté numérique au service de chaque citoyen."}
            </p>
          </div>

          <a
            href="#chantiers"
            className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white hover:gap-3 transition-all"
          >
            {d.decouvrir ?? "Découvrir"}
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "24px" : "6px",
                height: "6px",
                background: i === current ? "white" : "rgba(255,255,255,0.30)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <div className="w-px h-12 bg-white/40 animate-pulse" />
      </div>
    </section>
  );
}
