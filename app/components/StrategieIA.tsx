// Server Component : Mini-site Stratégie IA teaser
export default function StrategieIA() {
  const objectifs = [
    { num: "1", title: "Cas d'usage à fort impact", desc: "Mettre en œuvre les cas d'usage et les initiatives à fort impact dans les secteurs prioritaires." },
    { num: "2", title: "Capacités humaines", desc: "Renforcer les capacités humaines sur l'IA et la gestion des mégadonnées." },
    { num: "3", title: "Recherche & innovation", desc: "Assurer un meilleur soutien au développement du capital humain, à la recherche et à la coopération." },
    { num: "4", title: "Cadre institutionnel", desc: "Mettre à jour le cadre institutionnel et réglementaire pour l'IA et la gestion de mégadonnées." },
  ];

  return (
    <section
      id="stratégie-ia"
      className="py-24"
      style={{ background: "#0D132D" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-extrabold uppercase tracking-widest"
              style={{ color: "#008751" }}
            >
              Stratégie Nationale IA
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase leading-tight">
              Le Bénin,
              <br />
              <span style={{ color: "#008751" }}>nation de l'IA.</span>
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed">
              Adoptée par le Conseil des Ministres le 18 janvier 2023, la SNIAM 2023–2027
              contient 123 actions réparties en 4 programmes, déclinées en 3 phases sur 5 ans,
              dans les domaines de l'éducation, la santé, l'agriculture, le cadre de vie et le tourisme.
            </p>
          </div>
        </div>

        {/* Piliers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {objectifs.map((pilier) => (
            <div
              key={pilier.num}
              className="p-6 rounded-sm border group hover:border-vert-benin transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="text-3xl font-black mb-3 leading-none"
                style={{ color: "#008751" }}
              >
                {pilier.num}
              </div>
              <h3 className="text-white font-black text-sm uppercase tracking-wide mb-2 leading-snug">
                {pilier.title}
              </h3>
              <p className="text-white/75 text-xs font-medium leading-relaxed group-hover:text-white/60 transition-colors">
                {pilier.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="/documentheque"
            className="inline-flex items-center gap-3 px-6 py-3.5 font-bold text-sm uppercase tracking-wider rounded-sm transition-all hover:gap-5"
            style={{ background: "#008751", color: "white" }}
          >
            Explorer la stratégie complète
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://innovation.gouv.bj/assets/documents/strategie-nationale-d'intelligence-artificielle-et-des-megadonnees-2023-2027.pdf"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Télécharger la SNIAM (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
