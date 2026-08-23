// Server Component :stacking sticky cards
import Image from "next/image";
import type { Chantier } from "@/lib/chantiers";

type HomeDict = Record<string, string>;

const VERT  = "#162233";

const NAV_H  = 80;  // navbar h-20 80px
const PEEK   = 18;  // px visibles du bord supérieur de chaque carte empilée

// Couleurs officielles du drapeau du Bénin (Pantone 347 / 116 / 032)
const FLAG_VERT  = "#008751";
const FLAG_JAUNE = "#FCD116";
const FLAG_ROUGE = "#E8112D";

export default function GrandsChantiers({ dict, chantiers = [] }: { dict?: HomeDict; chantiers?: Chantier[] }) {
  const d = dict ?? {};

  if (chantiers.length === 0) return null;

  return (
    <section id="chantiers">

      {/* ── En-tête ── */}
      <div className="py-12 sm:py-20 sticky top-0 z-0" style={{ background: VERT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75 mb-4">
            {d.nosPriorites ?? "Nos priorités"}
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white uppercase leading-none">
            {d.grandsChantiers ?? "Grands chantiers"}
          </h2>
        </div>
      </div>

      {/* ── Cartes empilées ── */}
      <div className="relative">
        {chantiers.map((c, i) => {
          const ink    = "#ffffff";
          const inkLow = "rgba(255,255,255,0.65)";

          return (
            <div
              key={c.number}
              className="sticky flex flex-col overflow-hidden"
              style={{
                top: `${NAV_H + i * PEEK}px`,
                zIndex: i + 1,
                minHeight: "100vh",
              }}
            >
              {/* Fond : vidéo si disponible, sinon image */}
              <div className="absolute inset-0">
                {c.video ? (
                  <video
                    src={c.video}
                    poster={c.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: c.objectPosition }}
                    aria-label={c.title}
                  />
                ) : (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: c.objectPosition }}
                    sizes="100vw"
                    priority={i === 0}
                  />
                )}
              </div>

              {/* Bande drapeau */}
              <div className="flex-none relative z-10 flex" style={{ height: `${PEEK}px` }}>
                <div style={{ width: "33.33%", background: FLAG_VERT }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {c.bandType === "TOP" && <div style={{ flex: 1, background: FLAG_JAUNE }} />}
                  {c.bandType === "MID" && (
                    <>
                      <div style={{ flex: 1, background: FLAG_JAUNE }} />
                      <div style={{ flex: 1, background: FLAG_ROUGE }} />
                    </>
                  )}
                  {c.bandType === "BOT" && <div style={{ flex: 1, background: FLAG_ROUGE }} />}
                </div>
              </div>

              {/* Overlay sombre uniforme */}
              <div className="absolute inset-0 z-[1]" style={{ background: "rgba(0,0,0,0.62)" }} />

              {/* Contenu centré verticalement */}
              <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12" style={{ paddingTop: `${PEEK + 32}px`, paddingBottom: `${PEEK + 32}px` }}>

                {/* Chantier label + dots */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-3xl sm:text-4xl font-black leading-none tabular-nums"
                      style={{ color: ink, opacity: 0.25 }}
                    >
                      {c.number}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: inkLow }}>
                      {c.subtitle}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {chantiers.map((_, j) => (
                      <div
                        key={j}
                        className="rounded-full"
                        style={{
                          width: j === i ? "20px" : "6px",
                          height: "6px",
                          background: j === i ? ink : inkLow,
                          transition: "all 0.3s",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <h3
                  className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-tight max-w-4xl mb-4"
                  style={{ color: ink }}
                >
                  {c.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl mb-6"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {c.description}
                </p>

                {/* Stats */}
                {c.stats.length > 0 && (
                  <div className="flex flex-wrap gap-4 sm:gap-8 lg:gap-12 pt-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {c.stats.map((s) => (
                      <div key={s.label}>
                        <p className="text-xl sm:text-2xl font-black leading-none mb-1" style={{ color: ink }}>
                          {s.value}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
