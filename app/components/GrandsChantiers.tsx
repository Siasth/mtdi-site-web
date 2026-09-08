// Server Component :stacking sticky cards
import Image from "next/image";
import type { Chantier } from "@/lib/chantiers";

type HomeDict = Record<string, string>;

const VERT  = "#162233";

const NAV_H  = 80;  // navbar h-20 80px
const PEEK   = 10;  // px visibles du bord supérieur de chaque carte empilée

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
      <div className="relative" style={{ background: "#0d1826" }}>
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
                // Chevauchement volontaire : la carte suivante (z-index plus
                // élevé) recouvre tout artefact de rendu entre calques de
                // composition sticky empilés (arrondi de sous-pixel du
                // navigateur, pas un problème de mise en page — 1px ne
                // suffisait pas, on force une marge plus large).
                marginTop: i === 0 ? 0 : "-3px",
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
                    alt={c.title}
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
                <div
                  style={{
                    flex: 1,
                    background:
                      c.bandType === "TOP"
                        ? FLAG_JAUNE
                        : c.bandType === "BOT"
                        ? FLAG_ROUGE
                        // Un seul élément avec dégradé à coupure nette (50/50, sans
                        // transition) au lieu de deux <div> empilées : évite tout
                        // interstice dû à un arrondi de sous-pixel du navigateur
                        // sur une hauteur aussi petite (10px).
                        : `linear-gradient(to bottom, ${FLAG_JAUNE} 0%, ${FLAG_JAUNE} 50%, ${FLAG_ROUGE} 50%, ${FLAG_ROUGE} 100%)`,
                  }}
                />
              </div>

              {/* Overlay teinté par la couleur d'accent du chantier (ANO-138) */}
              <div className="absolute inset-0 z-[1]" style={{ background: c.overlay }} />

              {/* Contenu centré verticalement, défilable en interne si le
                  contenu déborde de la hauteur disponible (résolutions
                  basses/zoom élevé) plutôt que d'être coupé et inaccessible */}
              <div
                className="relative z-10 flex-1 flex flex-col justify-start max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12 overflow-y-auto"
                style={{ paddingTop: `${PEEK + 10}px`, paddingBottom: `${PEEK + 16}px` }}
              >

                {/* Chantier label + dots */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-3xl sm:text-4xl font-black leading-none tabular-nums"
                      style={{ color: ink, opacity: 0.85 }}
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
                  className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-tight max-w-4xl mb-3"
                  style={{ color: ink }}
                >
                  {c.title}
                </h3>

                {/* Description */}
                <div
                  className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl mb-4 line-clamp-2 prose-institutionnel"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                  dangerouslySetInnerHTML={{ __html: c.description }}
                />

                {/* Stats */}
                {c.stats.length > 0 && (
                  <div className="flex flex-wrap gap-4 sm:gap-8 lg:gap-12 pt-4"
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

      <style>{`
        .prose-institutionnel p { margin: 0.3em 0; }
        .prose-institutionnel strong { font-weight: 900; }
        .prose-institutionnel a { color: #FFBE00; text-decoration: underline; }
      `}</style>

    </section>
  );
}
