// Server Component
const articles = [
  {
    category: "Intelligence Artificielle",
    date: "6 juillet 2026",
    title: "Olympiades Nationales d'Intelligence Artificielle : les lauréats distingués",
    excerpt:
      "Les meilleurs jeunes talents béninois en IA ont été sélectionnés lors de la cérémonie du 4 juillet à Sèmè One. Huit d'entre eux constitueront l'équipe nationale aux IOAI 2026 à Astana.",
    readTime: "3 min",
    color: "#008751",
    href: "https://www.gouv.bj/article/3579/",
  },
  {
    category: "Cybersécurité",
    date: "26 juin 2026",
    title: "2ème Conférence RSSI : le Ministre Akplogan pose la sécurité numérique au cœur de l'État augmenté",
    excerpt:
      "Sous le thème « IA pour la cybersécurité et cybersécurité pour l'IA », la conférence a réuni les responsables de la sécurité des systèmes d'information du secteur public et privé.",
    readTime: "4 min",
    color: "#0D132D",
    href: "https://www.gouv.bj/article/3560/",
  },
  {
    category: "Formation",
    date: "27 juin 2026",
    title: "Le Bénin lance les Olympiades Nationales d'Intelligence Artificielle pour sélectionner les talents qui représenteront le pays au Kazakhstan",
    excerpt:
      "Première édition des NOAI pour sélectionner les talents qui représenteront le pays aux Olympiades Internationales d'IA au Kazakhstan du 2 au 8 août 2026.",
    readTime: "3 min",
    color: "#1a2a1a",
    href: "https://www.gouv.bj/article/3565/",
  },
];

export default function Actualites() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-vert-benin">
                Actualités
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-anthracite uppercase">
              Dernières nouvelles
            </h2>
          </div>
          <a
            href="/actualites"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-anthracite text-sm font-bold uppercase tracking-wider hover:bg-anthracite hover:text-white transition-all"
          >
            Toutes les actualités
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.href}
              className="card-hover group flex flex-col overflow-hidden rounded-sm border border-black/5"
            >
              {/* Image placeholder */}
              <div
                className="h-52 relative flex-none"
                style={{ background: article.color }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                  }}
                />
                <span
                  className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-2 py-1"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                >
                  {article.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 bg-white">
                <p className="text-xs text-anthracite/60 font-semibold uppercase tracking-wider mb-3">
                  {article.date} · {article.readTime} de lecture
                </p>
                <h3 className="font-black text-anthracite text-base leading-snug mb-3 group-hover:text-vert-benin transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-anthracite/60 leading-relaxed font-medium flex-1">
                  {article.excerpt}
                </p>
                <div
                  className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-vert-benin"
                >
                  Lire la suite
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <a
            href="/actualites"
            className="inline-flex items-center gap-2 px-6 py-3 border border-anthracite text-sm font-bold uppercase tracking-wider hover:bg-anthracite hover:text-white transition-all"
          >
            Toutes les actualités
          </a>
        </div>
      </div>
    </section>
  );
}
