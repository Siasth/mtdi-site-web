"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const VERT = "#006828";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Navbar({ locale: _locale, dict }: { locale?: string; dict?: any } = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const prefix = isEn ? "/en" : "";
  const isHome = pathname === "/" || pathname === "/en";

  // Language switcher: swap locale prefix while staying on the same page
  const pathWithoutLocale = isEn ? pathname.slice(3) || "/" : pathname;
  const frHref = pathWithoutLocale;
  const enHref = pathWithoutLocale === "/" ? "/en" : `/en${pathWithoutLocale}`;
  const nav = dict ?? {};

  // Transparent navbar only on homepage hero; always solid on other pages
  const solid = !isHome || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen, closeMenu]);

  const navLinks: { label: string; href: string; live?: boolean }[] = [
    { label: nav.actualites ?? "Actualités", href: `${prefix}/actualites` },
    { label: nav.galerie ?? "Galerie", href: `${prefix}/galerie` },
    { label: nav.videotheque ?? "Vidéothèque", href: `${prefix}/videotheque` },
    { label: nav.direct ?? "Direct", href: `${prefix}/direct`, live: true },
  ];

  const s = nav.sections ?? {};
  const l = nav.liens ?? {};

  const megaMenu = [
    {
      title: s.actualites ?? "ACTUALITÉS",
      links: [
        { label: l.toutesActualites ?? "Toutes les actualités", href: `${prefix}/actualites` },
        { label: l.alaUne ?? "À la une", href: `${prefix}/actualites` },
      ],
    },
    {
      title: s.leMinistere ?? "LE MINISTÈRE",
      links: [
        { label: l.leMinistre ?? "Le Ministre", href: `${prefix}/le-ministere/le-ministre` },
        { label: l.organigramme ?? "Organigramme", href: `${prefix}/le-ministere/organigramme` },
        { label: l.directionsCentrales ?? "Directions centrales", href: `${prefix}/le-ministere/directions` },
        { label: l.cabinet ?? "Cabinet", href: `${prefix}/le-ministere/cabinet` },
        { label: l.missionsAttributions ?? "Missions & attributions", href: `${prefix}/le-ministere/missions` },
        { label: l.structuresSousTutelle ?? "Structures sous tutelle", href: `${prefix}/le-ministere/structures` },
        { label: l.partenaires ?? "Partenaires", href: `${prefix}/le-ministere/partenaires` },
      ],
    },
    {
      title: s.strategieIa ?? "STRATÉGIE IA",
      links: [
        { label: l.strategieNationale ?? "Stratégie nationale", href: `${prefix}/strategie-ia` },
        { label: l.initiatives ?? "Initiatives", href: `${prefix}/strategie-ia` },
        { label: l.olympiadesIA ?? "Olympiades IA", href: `${prefix}/strategie-ia` },
      ],
    },
    {
      title: s.medias ?? "MÉDIAS",
      links: [
        { label: l.galeriePhotos ?? "Galerie photos", href: `${prefix}/galerie` },
        { label: l.videotheque ?? "Vidéothèque", href: `${prefix}/videotheque` },
        { label: l.mtdiMedias ?? "MTDI dans les médias", href: `${prefix}/medias/mtdi-dans-les-medias` },
        { label: l.kitPresse ?? "Kit presse", href: `${prefix}/kit-presse` },
        { label: l.enDirect ?? "En direct", href: `${prefix}/direct` },
      ],
    },
    {
      title: s.ressources ?? "RESSOURCES",
      links: [
        { label: l.documentheque ?? "Documenthèque", href: `${prefix}/documentheque` },
        { label: l.textesJuridiques ?? "Textes juridiques", href: `${prefix}/textes-juridiques` },
        { label: l.kitPresse ?? "Kit presse", href: `${prefix}/kit-presse` },
      ],
    },
    {
      title: s.participer ?? "PARTICIPER",
      links: [
        { label: l.emploisRecrutement ?? "Emplois & recrutement", href: `${prefix}/participer` },
        { label: l.stages ?? "Stages", href: `${prefix}/participer` },
        { label: l.appelsOffres ?? "Appels d'offres", href: `${prefix}/participer` },
        { label: l.ecrireAuMinistre ?? "Écrire au Ministre", href: `${prefix}/ecrire-au-ministre` },
      ],
    },
    {
      title: s.liensUtiles ?? "LIENS UTILES",
      links: [
        { label: "Sèmè City", href: "https://semecity.bj/" },
        { label: "ASIN", href: "https://asin.bj/" },
        { label: "ANIP", href: "https://eservices.anip.bj/" },
        { label: "e-services", href: "https://service-public.bj/" },
        { label: "e-pme", href: "https://epme.adpme.bj/" },
        { label: "e-visa", href: "https://evisa.bj/" },
        { label: "Centre de services", href: "https://cds.asin.bj/" },
        { label: "APDP", href: "https://service.apdp.bj/" },
        { label: "CSIRT Bénin", href: "https://csirt.bj/" },
        { label: l.presidence ?? "Présidence de la République", href: "https://presidence.bj/" },
      ],
    },
  ];

  return (
    <>
      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        style={{ background: VERT }}
      >
        {nav.allerAuContenu ?? "Aller au contenu principal"}
      </a>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          solid
            ? "bg-white shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href={`${prefix}/`} className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-élément */}
              <img
                src="/mtdi-banner.png"
                alt="Ministère de la Transformation Digitale et de l'Innovation — République du Bénin"
                className="h-16 w-auto"
                style={{ filter: solid ? "none" : "brightness(0) invert(1)" }}
              />
            </Link>

            {/* Nav links :desktop */}
            <nav aria-label={isEn ? "Main navigation" : "Navigation principale"} className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isCurrent = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`relative flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-vert-benin ${
                      solid ? "text-anthracite" : "text-white"
                    }`}
                  >
                    {link.live && (
                      <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#EB0000" }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#EB0000" }} />
                      </span>
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">

              {/* Bouton recherche */}
              <Link
                href={`${prefix}/recherche`}
                aria-label={nav.rechercher ?? "Rechercher sur le site"}
                className={`hidden md:flex items-center justify-center w-9 h-9 transition-colors hover:text-vert-benin ${
                  solid ? "text-anthracite" : "text-white/80"
                }`}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Link>

              {/* EN DIRECT badge — mobile/tablet (hidden on lg where it's in navLinks) */}
              <Link
                href={`${prefix}/direct`}
                aria-label={nav.direct ?? "Direct"}
                className={`flex lg:hidden items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                  solid ? "text-anthracite hover:text-vert-benin" : "text-white/90 hover:text-white"
                }`}
              >
                <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#EB0000" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#EB0000" }} />
                </span>
                <span className="hidden sm:block">{nav.live ?? "LIVE"}</span>
              </Link>

              {/* Écrire au Ministre */}
              <Link
                href={`${prefix}/ecrire-au-ministre`}
                className={`hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:text-vert-benin ${
                  solid ? "text-anthracite" : "text-white/80"
                }`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {nav.ecrireAuMinistre ?? "Écrire au Ministre"}
              </Link>

              {/* Language selector FR / EN */}
              <div className={`hidden sm:flex items-center text-xs font-bold uppercase tracking-wider divide-x ${solid ? "divide-anthracite/30" : "divide-white/30"}`}>
                <Link
                  href={frHref}
                  aria-label="Passer en français"
                  aria-current={!isEn ? "true" : undefined}
                  className={`pr-2 transition-colors ${
                    !isEn
                      ? solid ? "text-vert-benin underline underline-offset-2" : "text-white underline underline-offset-2"
                      : solid ? "text-anthracite/70 hover:text-anthracite" : "text-white/70 hover:text-white"
                  }`}
                >
                  FR
                </Link>
                <Link
                  href={enHref}
                  aria-label="Switch to English"
                  aria-current={isEn ? "true" : undefined}
                  className={`pl-2 transition-colors ${
                    isEn
                      ? solid ? "text-vert-benin underline underline-offset-2" : "text-white underline underline-offset-2"
                      : solid ? "text-anthracite/70 hover:text-anthracite" : "text-white/70 hover:text-white"
                  }`}
                >
                  EN
                </Link>
              </div>

              {/* Menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="mega-menu"
                aria-label={menuOpen
                  ? (nav.fermerMenu ?? "Fermer le menu")
                  : (nav.ouvrirMenu ?? "Ouvrir le menu principal")}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors border ${
                  menuOpen
                    ? "bg-anthracite text-white border-anthracite"
                    : solid
                    ? "border-anthracite text-anthracite hover:bg-anthracite hover:text-white"
                    : "border-white text-white hover:bg-white hover:text-anthracite"
                }`}
              >
                {menuOpen ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
                <span className="hidden sm:block">{nav.menu ?? "Menu"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu :full screen overlay */}
      {menuOpen && (
        <div
          id="mega-menu"
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? "Main navigation menu" : "Menu de navigation principal"}
          className="fixed inset-0 z-30 mega-menu"
          style={{ background: "#1A1A1A", paddingTop: "80px" }}
        >
          <div className="h-full overflow-y-auto">
            <nav aria-label={isEn ? "Full site navigation" : "Navigation complète du site"}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 lg:gap-8">
                  {megaMenu.map((section) => (
                    <div key={section.title}>
                      <h3
                        className="text-xs font-extrabold uppercase tracking-widest mb-4"
                        style={{ color: VERT }}
                      >
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.links.map((link) => {
                          const isExternal = link.href.startsWith("http");
                          return (
                            <li key={link.label}>
                              <Link
                                href={isExternal ? link.href : link.href}
                                onClick={closeMenu}
                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="text-sm font-medium text-white/70 hover:text-white transition-colors hover:pl-1 block"
                              >
                                {link.label}
                                {isExternal && (
                                  <svg className="inline-block ml-1 -mt-0.5" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                                  </svg>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Bottom social row */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {[
                      { label: "Facebook", href: "https://www.facebook.com/innovationbenin", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                      { label: "X", href: "https://x.com/innovationbenin", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                      { label: "LinkedIn", href: "https://www.linkedin.com/company/innovationbenin", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                      { label: "Instagram", href: "https://www.instagram.com/benin.innov/", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                    ].map((soc) => (
                      <Link
                        key={soc.label}
                        href={soc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={soc.label}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {soc.icon}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
