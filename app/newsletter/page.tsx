import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";

const interests = [
  { id: "ia", label: "Intelligence Artificielle" },
  { id: "eservices", label: "E-services publics" },
  { id: "cybersecurite", label: "Cybersécurité" },
  { id: "innovation", label: "Innovation & Startups" },
];

const pastEditions: { month: string; topics: string[] }[] = [];

export default function NewsletterPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-12"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Newsletter du MTDI
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              L'essentiel de l'actualité du Ministère chaque mois
            </p>
          </div>
        </section>

        {/* Subscription form */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Left: Benefits */}
            <div>
              <h2
                className="text-xs font-black uppercase tracking-widest mb-8"
                style={{ color: VERT }}
              >
                Restez informé
              </h2>

              <p className="text-anthracite/60 text-base leading-relaxed mb-10">
                Recevez chaque mois l'essentiel de l'actualité du Ministère de la
                Transformation Digitale et de l'Innovation : communiqués officiels,
                avancées des chantiers numériques, événements à venir et opportunités.
              </p>

              <div className="flex flex-col gap-0">
                {[
                  {
                    icon: (
                      <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    title: "1 email par mois",
                    desc: "Pas de spam. Un résumé clair et concis de l'actualité du Ministère.",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    ),
                    title: "Contenu personnalisé",
                    desc: "Choisissez les thématiques qui vous intéressent : IA, cybersécurité, e-services.",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                    ),
                    title: "Accès prioritaire",
                    desc: "Soyez les premiers informés des événements, consultations publiques et appels à projets.",
                  },
                ].map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex gap-5 py-6"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${VERT}14` }}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="text-anthracite font-black text-sm uppercase mb-1">
                        {benefit.title}
                      </p>
                      <p className="text-anthracite/50 text-xs font-medium leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <h2
                className="text-xs font-black uppercase tracking-widest mb-8"
                style={{ color: VERT }}
              >
                S'inscrire
              </h2>

              <form className="flex flex-col gap-5" action="#" method="POST">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="newsletter-name"
                    className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                  >
                    Nom complet *
                  </label>
                  <input
                    id="newsletter-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Prénom Nom"
                    className="px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
                    style={{
                      background: "#F5F5F3",
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="newsletter-email"
                    className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                  >
                    Adresse email *
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    className="px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
                    style={{
                      background: "#F5F5F3",
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* Interests */}
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/50">
                    Centres d'intérêt
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {interests.map((interest) => (
                      <label
                        key={interest.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gris-perle"
                        style={{
                          background: "#F5F5F3",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="interests"
                          value={interest.id}
                          className="w-4 h-4 accent-current"
                          style={{ accentColor: VERT }}
                        />
                        <span className="text-sm font-medium text-anthracite">
                          {interest.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy note */}
                <div
                  className="flex items-start gap-3 p-4"
                  style={{ background: `${VERT}08`, border: `1px solid ${VERT}18` }}
                >
                  <svg
                    className="flex-shrink-0 mt-0.5"
                    width="14"
                    height="14"
                    fill="none"
                    stroke={VERT}
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-[10px] font-medium text-anthracite/50 leading-relaxed">
                    Vos données sont traitées conformément à la loi n°2017-20 du 20 avril 2018
                    portant code du numérique en République du Bénin. Vous pouvez vous désinscrire
                    à tout moment via le lien présent dans chaque newsletter.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start"
                  style={{ background: VERT }}
                >
                  S'inscrire à la newsletter
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Past editions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Dernières éditions
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-px"
              style={{ background: "rgba(0,0,0,0.08)" }}
            >
              {pastEditions.map((edition) => (
                <article
                  key={edition.month}
                  className="group flex flex-col justify-between p-8 bg-white hover:bg-gris-perle transition-colors"
                  style={{ minHeight: "280px" }}
                >
                  <div>
                    <div
                      className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-5"
                      style={{ background: JAUNE, color: "#1A1A1A" }}
                    >
                      {edition.month}
                    </div>

                    <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-4">
                      Newsletter : {edition.month}
                    </h3>

                    <ul className="flex flex-col gap-2">
                      {edition.topics.map((topic) => (
                        <li
                          key={topic}
                          className="flex items-start gap-2 text-anthracite/55 text-sm leading-relaxed"
                        >
                          <span
                            className="flex-shrink-0 w-1 h-1 rounded-full mt-2"
                            style={{ background: VERT }}
                          />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="mt-8 pt-5"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <Link
                      href="https://innovation.gouv.bj/publications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black uppercase tracking-widest transition-all"
                      style={{ color: VERT }}
                    >
                      Consulter →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
