// Server Component
import Image from "next/image";
import { getFeaturedGalerieItems } from "@/lib/galerie";

type HomeDict = Record<string, string>;

export default async function Galerie({ dict, locale = "fr" }: { dict?: HomeDict; locale?: string }) {
  const d = dict ?? {};
  const prefix = locale === "en" ? "/en" : "";
  const items = await getFeaturedGalerieItems(locale === "en" ? "en" : "fr", 9);

  if (items.length === 0) return null;

  function getHref(item: (typeof items)[number]) {
    if (item.hrefExternal) return item.hrefExternal;
    // ANO-003 : le clic sur une vignette vidéo renvoyait vers la liste
    // générique /videotheque au lieu d'ouvrir directement la vidéo associée.
    if (item.type === "video" && item.videoUrl) return item.videoUrl;
    if (item.type === "video") return `${prefix}/videotheque`;
    return `${prefix}/galerie`;
  }

  return (
    <section className="py-20 bg-gris-perle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-vert-benin mb-3">
              {d.mediathequeVisuelle ?? "Médiathèque"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-anthracite uppercase leading-tight">
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map((item, i) => {
            const isExternalNav = !!item.hrefExternal || (item.type === "video" && !!item.videoUrl);
            return (
            <a
              key={item.id}
              href={getHref(item)}
              target={isExternalNav ? "_blank" : undefined}
              rel={isExternalNav ? "noopener noreferrer" : undefined}
              aria-label={item.title}
              className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "1/1" : "1/1" }}
            >
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
              ) : (
                <div className="absolute inset-0" style={{ background: "#162233" }} />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                {item.type === "video" && (
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="18" height="18" fill="#006828" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                )}
              </div>
            </a>
            );
          })}
        </div>

        <a
          href={`${prefix}/galerie`}
          className="sm:hidden mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-vert-benin"
        >
          {d.voirGalerie ?? "Voir la galerie"}
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
