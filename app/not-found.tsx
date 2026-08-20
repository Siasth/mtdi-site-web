"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const VERT  = "#162233";
const JAUNE = "#FFBE00";

const content = {
  fr: {
    titre1:   "Section en",
    titre2:   "construction",
    badge:    "Bientôt disponible",
    heading:  "Cette section n'est pas encore disponible",
    body:     "Nos équipes travaillent activement à la mise en ligne de ce contenu. Revenez bientôt ou retournez à l'accueil pour découvrir les dernières actualités du Ministère.",
    retour:   "Retour à l'accueil",
    contact:  "Nous contacter",
    home:     "/",
    contactHref: "/contact",
  },
  en: {
    titre1:   "Section under",
    titre2:   "construction",
    badge:    "Coming soon",
    heading:  "This section is not yet available",
    body:     "Our teams are actively working to bring this content online. Come back soon or return to the home page to discover the latest Ministry news.",
    retour:   "Back to home",
    contact:  "Contact us",
    home:     "/en",
    contactHref: "/en/contact",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en") ?? false;
  const t = isEn ? content.en : content.fr;

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-8" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre1}
              <br />
              <span style={{ color: JAUNE }}>{t.titre2}</span>
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gris-perle">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ background: `${VERT}12`, border: `1.5px solid ${VERT}30` }}
            >
              <svg width="32" height="32" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>

            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
              {t.badge}
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-anthracite uppercase leading-tight mb-4">
              {t.heading}
            </h2>

            <p className="text-anthracite/75 text-base font-medium leading-relaxed mb-10">
              {t.body}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={t.home}
                className="inline-flex items-center gap-3 px-7 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5 text-white"
                style={{ background: VERT }}
              >
                {t.retour}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={t.contactHref}
                className="text-sm font-bold uppercase tracking-wider text-anthracite/60 hover:text-anthracite transition-colors"
              >
                {t.contact}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
