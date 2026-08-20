// Server Component
import Image from "next/image";

type HomeDict = Record<string, string>;

const items = [
  { image: "/chantier-01-ia.jpg", label: "Sommet IA Bénin 2026", type: "photo" },
  { image: "/alaune-infra.jpg", label: "Cérémonie déploiement fibre", type: "photo" },
  { image: "/alaune-formation.jpg", label: "Digital Academy Cotonou", type: "video" },
  { image: "/alaune-service.jpg", label: "Lancement MonIdentité.bj", type: "photo" },
  { image: "/alaune-startups.jpg", label: "Forum Startups Bénin", type: "photo" },
  { image: "/alaune-partenariat.jpg", label: "Réunion partenaires internationaux", type: "photo" },
  { image: "/alaune-cyber.jpg", label: "Inauguration CERT.bj", type: "video", externalHref: "https://www.flickr.com/photos/numeriquebenin/albums/72177720334380465/" },
  { image: "/olympiades.jpg", label: "Olympiades Nationales d'IA 2026", type: "photo" },
];

export default function Galerie({ dict, locale = "fr" }: { dict?: HomeDict; locale?: string }) {
  const d = dict ?? {};
  const prefix = locale === "en" ? "/en" : "";

  function getHref(item: typeof items[number]) {
    if ("externalHref" in item && item.externalHref) return item.externalHref;
    if (item.type === "video") return `${prefix}/videotheque`;
    return `${prefix}/galerie`;
  }

  return (
    <section className="py-20 bg-gris-perle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-anthracite uppercase">
              {d.beninEnImages ?? "Le Bénin en images"}
            </h2>
          </div>
          <a
            href={`${prefix}/galerie`}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-vert-benin hover:gap-4 transition-all"
          >
            {d.voirGalerie ?? "Voir la galerie"}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const href = getHref(item);
            const isExternal = href.startsWith("http");
            return (
              <a
                key={i}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={item.label}
                className={`card-hover group relative overflow-hidden rounded-sm cursor-pointer ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
                style={{ minHeight: i === 0 ? "320px" : "150px" }}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? "50vw" : "25vw"}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.type === "video" ? (
                      <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                        <svg width="14" height="14" fill="white" viewBox="0 0 24 24" className="ml-0.5" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                        {/* ANO-002 : icône flèche cohérente avec l'action "voir la galerie" */}
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs font-semibold leading-tight">{item.label}</p>
                  {item.type === "video" && (
                    <span
                      className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                      style={{ background: "#E8112D", color: "white" }}
                    >
                      Vidéo
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <a
            href={`${prefix}/galerie`}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-vert-benin"
          >
            {d.voirGalerie ?? "Voir la galerie"}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
