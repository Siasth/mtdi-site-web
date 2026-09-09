"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  // ANO-116 : les utilisateurs doivent pouvoir arrêter le défilement automatique.
  const [playing, setPlaying] = useState(true);
  // ANO-076 : évite d'annoncer le tout premier slide au montage (seuls les
  // changements ultérieurs doivent déclencher l'annonce aria-live).
  const didMount = useRef(false);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance every 3s tant que la lecture n'est pas mise en pause
  // (ANO-116), reset on manual navigation. Respecte aussi la préférence
  // système « mouvement réduit ».
  useEffect(() => {
    if (!playing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current, next, playing]);

  // ANO-076 : zone live annonçant le changement de slide aux technologies
  // d'assistance, sans déplacer le focus.
  const [announce, setAnnounce] = useState("");
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setAnnounce(slides[current]?.alt || "");
  }, [current, slides]);

  return (
    <section
      className="relative h-screen min-h-[600px] flex items-end overflow-hidden"
      role="region"
      aria-roledescription="carrousel"
      aria-label={d.heroCarouselLabel ?? "Images à la une"}
    >
      {/* Annonce du changement de slide pour les lecteurs d'écran, sans
          déplacer le focus (ANO-076) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </div>

      {/* Carousel slides (image ou vidéo) */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {slide.video ? (
            <>
              <video
                src={slide.video}
                poster={slide.src}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                tabIndex={-1}
              />
              {/* ANO-081 : les balises <video> n'ont pas d'équivalent à alt=,
                  on fournit donc un texte de remplacement dédié. */}
              <span className="sr-only">{slide.alt}</span>
            </>
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
      <div className="absolute inset-0" style={{ background: "rgba(13,19,45,0.72)" }} />
      <div className="hero-overlay absolute inset-0" />
      {/* ANO-102 : dégradé supplémentaire dédié à la zone de texte, pour
          garantir un contraste suffisant quelle que soit la photo affichée
          en fond (l'overlay global seul ne suffit pas sur les zones claires
          de certaines images). */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(6,10,26,0.88) 0%, rgba(6,10,26,0.55) 45%, transparent 100%)" }}
      />

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
              <span className="text-white text-[10px] font-semibold uppercase tracking-widest">
                {d.republique ?? "République du Bénin"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase leading-tight tracking-tight">
              {d.tagline ?? "Transformer."}{" "}<span style={{ color: "#FCD116" }}>{d.taglineHighlight ?? "Innover."}</span>{" "}{d.taglineSuffix ?? "Servir."}
            </h1>
            <p className="mt-2 text-white text-sm sm:text-base italic leading-relaxed max-w-md">
              {d.heroDesc ?? "Le Bénin bâtit sa souveraineté numérique au service de chaque citoyen."}
            </p>
          </div>

          <a
            href="#chantiers"
            className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:gap-3 transition-all"
          >
            {d.decouvrir ?? "Découvrir"}
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-1 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              // ANO-080 / ANO-094 : la zone cliquable visuelle des points
              // (6px) était trop petite ; on l'agrandit ici sans changer
              // leur apparence, via un padding invisible autour du point.
              className="relative flex items-center justify-center rounded-full transition-all"
              style={{ width: "24px", height: "24px" }}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === current}
            >
              <span
                aria-hidden="true"
                className="block rounded-full transition-all"
                style={{
                  width: i === current ? "24px" : "6px",
                  height: "6px",
                  background: i === current ? "white" : "rgba(255,255,255,0.30)",
                }}
              />
            </button>
          ))}
          {/* ANO-116 : contrôle accessible pour mettre en pause / reprendre
              le défilement automatique du carrousel. */}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-8 h-8 ml-2 flex items-center justify-center rounded-full transition-colors bg-white/10 hover:bg-white/25"
            aria-label={playing ? (d.pauseCarousel ?? "Mettre en pause le défilement") : (d.playCarousel ?? "Reprendre le défilement")}
            aria-pressed={!playing}
          >
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M6 4l14 8-14 8V4z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <div className="w-px h-12 bg-white/40 animate-pulse" />
      </div>
    </section>
  );
}
