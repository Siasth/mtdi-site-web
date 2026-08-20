"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const VERT  = "#006828";
const JAUNE = "#FFBE00";

type StatItem = { id: number; label: string; value: number; max: number; unit: string };
type Dict = Record<string, string>;

// Données à renseigner par le MTDI — ne pas inventer de chiffres
const defaultBarData: { label: string; value: number; max: number; unit: string; color: string }[] = [];

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export default function StatsSection({ stats: externalStats, dict }: { stats?: StatItem[]; dict?: Dict }) {
  const d = dict ?? {};
  const barData = externalStats
    ? externalStats.map((s, i) => ({ ...s, color: i % 2 === 0 ? VERT : JAUNE }))
    : defaultBarData;
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const el = barsRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // progress 0 → le haut des barres touche le bas du viewport
    // progress 1 → le haut des barres atteint 40 % du viewport
    const start = vh;
    const end = vh * 0.4;
    setProgress(clamp((start - rect.top) / (start - end), 0, 1));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateProgress]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-white overflow-hidden"
      style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col"
        style={{ minHeight: "100vh" }}
      >

        {/* Header */}
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 flex-shrink-0">
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-anthracite uppercase leading-none">
            {d.desResultats ?? "Des résultats."}
            <br />
            <span style={{ color: VERT }}>{d.pasDIntentions ?? "Pas des intentions."}</span>
          </h2>
          <p className="text-anthracite/65 text-xs font-semibold uppercase tracking-widest sm:text-right leading-relaxed">
            {d.donneesMaj ?? "Données au 1ᵉʳ juillet 2026"}
            <br />
            {d.miseMajTrimestrielle ?? "Mise à jour trimestrielle"}
          </p>
        </div>

        {/* Zone graphe */}
        <div className="flex-1 flex flex-col min-h-0">

          <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/65 mb-8 flex-shrink-0">
            {d.avancementChantiers ?? "Avancement des chantiers — objectifs nationaux"}
          </p>

          {barData.length === 0 && (
            <p className="text-anthracite/70 text-sm font-semibold py-8">
              {d.donneesManquantes ?? "Les données seront renseignées par le MTDI."}
            </p>
          )}

          <div ref={barsRef} className="flex-1 min-h-0 grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6 lg:gap-8">
            {barData.map((bar, i) => {
              const pct = Math.round((bar.value / bar.max) * 100);
              const isHovered = hovered === i;
              // 100 % → pct % au fur et à mesure du scroll
              const currentHeight = 100 - (100 - pct) * progress;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-default"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Valeur + pourcentage */}
                  <div className="flex-shrink-0 mb-3 text-center">
                    <span
                      className="text-xs font-black tabular-nums block"
                      style={{
                        color: bar.color,
                        opacity: progress,
                      }}
                    >
                      {bar.value.toLocaleString("fr-FR")}{bar.unit}
                    </span>
                    <span
                      className="text-[10px] font-bold block"
                      style={{
                        color: isHovered ? "rgba(26,26,26,0.50)" : "rgba(26,26,26,0.25)",
                        opacity: progress,
                        transition: "color 0.2s",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Track */}
                  <div
                    className="flex-1 w-full relative rounded-sm overflow-hidden"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  >
                    {/* Remplissage piloté par le scroll */}
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-sm"
                      style={{
                        height: `${currentHeight}%`,
                        background: isHovered ? bar.color : `${bar.color}bb`,
                        transition: "background 0.2s",
                      }}
                    />

                    {/* Tooltip objectif */}
                    {isHovered && progress > 0.5 && (
                      <div
                        className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap z-10"
                        style={{
                          background: "rgba(26,26,26,0.85)",
                          color: bar.color === JAUNE ? "#FFBE00" : "white",
                        }}
                      >
                        {d.surObjectif ?? "sur"} {bar.max.toLocaleString("fr-FR")}{bar.unit}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-shrink-0 mt-4 text-center px-1">
                    <span
                      className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide leading-tight block"
                      style={{
                        color: isHovered ? "rgba(26,26,26,0.60)" : "rgba(26,26,26,0.35)",
                        transition: "color 0.2s",
                      }}
                    >
                      {bar.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
