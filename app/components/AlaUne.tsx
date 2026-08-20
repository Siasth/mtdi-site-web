// Server Component
import Image from "next/image";

const articles = [
  {
    gridColumn: "1 / 8",
    gridRow: "1 / 9",
    category: "Intelligence Artificielle",
    tag: "EXCLUSIF",
    title: "Olympiades Nationales d'Intelligence Artificielle : les lauréats distingués",
    excerpt: "Le Ministère de la Transformation Digitale et de l'Innovation a procédé à la remise des prix aux lauréats des premières Olympiades Nationales d'Intelligence Artificielle.",
    date: "6 juillet 2026",
    image: "/olympiades.jpg",
    textSize: "text-xl sm:text-3xl lg:text-5xl",
    href: "https://innovation.gouv.bj/publications/actualites/olympiades-nationales-d-intelligence-artificielle-les-laureats-distingues",
  },
  {
    gridColumn: "8 / 13",
    gridRow: "1 / 7",
    category: "Cybersécurité",
    title: "Deuxième conférence des RSSI : Le Ministre Mahuna AKPLOGAN pose la sécurité numérique au cœur de l'ambition de l'État augmenté",
    date: "26 juin 2026",
    image: "/alaune-cyber.jpg",
    textSize: "text-base sm:text-xl",
    href: "https://innovation.gouv.bj/publications/actualites/deuxieme-conference-des-rssi-le-ministre-mahuna-akplogan-pose-la-securite-numerique-au-coeur-de-l-ambition-de-l-etat-augmente",
  },
  {
    gridColumn: "8 / 13",
    gridRow: "7 / 13",
    category: "Formation",
    title: "Le Bénin lance les Olympiades Nationales d'Intelligence Artificielle pour sélectionner les talents qui représenteront le pays au Kazakhstan",
    date: "27 juin 2026",
    image: "/alaune-formation.jpg",
    textSize: "text-base sm:text-xl",
    href: "https://innovation.gouv.bj/publications/actualites/le-benin-lance-les-olympiades-nationales-d-intelligence-arti-cielle-pour-selectionner-les-talents-qui-representeront-le-pays-au-kazakhstan",
  },
];

export default function AlaUne() {
  return (
    <section className="alaune-grid gap-px bg-black">
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.href}
          className="relative overflow-hidden group cursor-pointer"
          style={{
            gridColumn: article.gridColumn,
            gridRow: article.gridRow,
          }}
        >
          {/* Image */}
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={i === 0 ? "60vw" : "40vw"}
            priority={i === 0}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Hover tint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />

          {/* Contenu texte */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              {article.tag && (
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0"
                  style={{
                    background: article.tag === "EXCLUSIF" ? "#008751" : "#FCD116",
                    color: article.tag === "EXCLUSIF" ? "white" : "#0E0E0E",
                  }}
                >
                  {article.tag}
                </span>
              )}
              <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider truncate">
                {article.category}
              </span>
            </div>

            <h2
              className={`text-white font-black uppercase leading-tight ${article.textSize}`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
            >
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="text-white/60 text-sm leading-relaxed mt-2 mb-3 max-w-xl">
                {article.excerpt}
              </p>
            )}

            <span className="text-white/75 text-xs font-medium mt-1 block">
              {article.date}
            </span>
          </div>
        </a>
      ))}

    </section>
  );
}
