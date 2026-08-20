import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";

const services = [
  {
    title: "État civil",
    description: "Demandez vos actes de naissance, de mariage et de décès en ligne. Retirez vos documents dans le centre d'état civil de votre choix.",
    href: "https://service-public.bj/public/services/service-ede",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    title: "Fiscalité",
    description: "Déclarez et payez vos impôts en ligne via la plateforme e-Impôts. Accédez à votre espace contribuable et suivez vos obligations fiscales.",
    href: "https://service-public.bj/public/services/service-impots",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
        <line x1="14" y1="15" x2="18" y2="15" />
      </svg>
    ),
  },
  {
    title: "Identité",
    description: "Obtenez votre carte nationale d'identité biométrique ou votre passeport via MonIdentite.bj. Suivez l'avancement de votre demande en temps réel.",
    href: "https://service-public.bj/public/services/service-identite",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="9" cy="11" r="2.5" />
        <path d="M5 17c0-1.5 1.8-3 4-3s4 1.5 4 3" />
        <line x1="16" y1="10" x2="20" y2="10" />
        <line x1="16" y1="13" x2="20" y2="13" />
      </svg>
    ),
  },
  {
    title: "Permis & autorisations",
    description: "Demandez vos permis de construire, licences commerciales et autorisations administratives. Toutes vos démarches regroupées en un seul portail.",
    href: "https://service-public.bj/public/services/service-permis",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Éducation",
    description: "Inscriptions scolaires et universitaires, demandes de bourses d'études, équivalences de diplômes et orientation professionnelle en ligne.",
    href: "https://service-public.bj/public/services/service-education",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M22 10l-10-6L2 10l10 6 10-6z" />
        <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
        <line x1="22" y1="10" x2="22" y2="16" />
      </svg>
    ),
  },
  {
    title: "Santé",
    description: "Gérez votre assurance maladie universelle (ARCH), consultez votre carnet de vaccination numérique et accédez aux services de santé en ligne.",
    href: "https://service-public.bj/public/services/service-sante",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 5.006a5 5 0 1 1 7.5 7.566z" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    ),
  },
  {
    title: "Foncier & cadastre",
    description: "Consultez le plan foncier rural, demandez vos titres de propriété et effectuez vos transactions foncières en toute sécurité via le guichet unique.",
    href: "https://service-public.bj/public/services/service-foncier",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <line x1="9" y1="9" x2="9" y2="9.01" />
        <line x1="9" y1="13" x2="9" y2="13.01" />
        <line x1="9" y1="17" x2="9" y2="17.01" />
      </svg>
    ),
  },
  {
    title: "Justice & vie citoyenne",
    description: "Casier judiciaire, certificat de nationalité, légalisation de documents et autres démarches juridiques et administratives courantes.",
    href: "https://service-public.bj/public/services/service-justice",
    icon: (
      <svg width="28" height="28" fill="none" stroke={VERT} strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <path d="M8 12l2-4 2 4" />
        <path d="M12 12l2-4 2 4" />
        <line x1="8" y1="12" x2="12" y2="12" />
        <line x1="12" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EServicesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.eservices;
  const prefix = locale === "en" ? "/en" : "";

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="pt-14 pb-12 px-4 sm:px-6 lg:px-8" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.categoriesServices}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {services.map((service) => (
                <a
                  key={service.title}
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-8 bg-white flex flex-col gap-5 transition-colors hover:bg-gris-perle"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${VERT}0a` }}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-anthracite font-black text-sm uppercase mb-2">{service.title}</h3>
                    <p className="text-anthracite/75 text-xs font-medium leading-relaxed">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all group-hover:gap-4" style={{ color: VERT }}>
                    {t.acceder}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Stats banner */}
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-8">
              <div className="text-center px-8">
                <p className="text-4xl sm:text-5xl font-black" style={{ color: JAUNE }}>24/7</p>
                <p className="mt-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
                  {t.disponibilitePermanente}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
              {t.portailNational}
            </h2>
            <p className="text-anthracite font-black text-2xl sm:text-3xl uppercase leading-tight mb-4">
              {t.toutesDemanches}
            </p>
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed max-w-xl mx-auto mb-10">
              {t.servicePublicDesc}
            </p>
            <a
              href="https://service-public.bj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5"
              style={{ background: VERT }}
            >
              {t.accederServicePublic}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>
          </div>
        </section>

        {/* Help */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div>
                <h3 className="text-anthracite font-black text-sm uppercase mb-1">{t.besoinAide}</h3>
                <p className="text-anthracite/70 text-xs font-medium">
                  {t.equipeAssistanceDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+2290121307939"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-anthracite transition-colors hover:bg-gris-perle"
                  style={{ border: "1px solid rgba(0,0,0,0.12)" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
                  </svg>
                  {t.appeler}
                </a>
                <Link
                  href={`${prefix}/contact`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:opacity-90"
                  style={{ background: VERT }}
                >
                  {t.nousContacter}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
