"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const footerColumns = [
  {
    title: "Le Ministère",
    links: [
      { label: "Le Ministre", href: "/le-ministere/le-ministre" },
      { label: "Organigramme", href: "/le-ministere/organigramme" },
      { label: "Directions centrales", href: "/le-ministere/directions" },
      { label: "Cabinet", href: "/le-ministere/cabinet" },
      { label: "Structures sous tutelle", href: "/le-ministere/structures" },
      { label: "Missions", href: "/le-ministere/missions" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Médias",
    links: [
      { label: "Galerie photos", href: "/galerie" },
      { label: "Vidéothèque", href: "/videotheque" },
      { label: "MTDI dans les médias", href: "/medias/mtdi-dans-les-medias" },
    ],
  },
  {
    title: "Liens utiles",
    links: [
      { label: "Sèmè City", href: "https://semecity.bj/", external: true },
      { label: "ANIP", href: "https://eservices.anip.bj/", external: true },
      { label: "e-pme", href: "https://epme.adpme.bj/", external: true },
      { label: "e-services", href: "https://service-public.bj/", external: true },
      { label: "e-visa", href: "https://evisa.bj/", external: true },
      { label: "Centre de services", href: "https://cds.asin.bj/", external: true },
      { label: "ASIN", href: "https://asin.bj/", external: true },
      { label: "APDP", href: "https://service.apdp.bj/", external: true },
      { label: "Présidence", href: "https://presidence.bj/", external: true },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/innovationbenin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    label: "X",
    href: "https://x.com/innovationbenin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/innovationbenin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/benin.innov/",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Footer({ locale: _locale, dict: _dict }: { locale?: string; dict?: any } = {}) {
  const pathname = usePathname();
  const prefix = pathname.startsWith("/en") ? "/en" : "";

  const footerColumnsLocale = [
    {
      title: prefix ? "The Ministry" : "Le Ministère",
      links: [
        { label: prefix ? "The Minister" : "Le Ministre", href: `${prefix}/le-ministere/le-ministre` },
        { label: prefix ? "Org chart" : "Organigramme", href: `${prefix}/le-ministere/organigramme` },
        { label: prefix ? "Central Directorates" : "Directions centrales", href: `${prefix}/le-ministere/directions` },
        { label: "Cabinet", href: `${prefix}/le-ministere/cabinet` },
        { label: prefix ? "Supervised Structures" : "Structures sous tutelle", href: `${prefix}/le-ministere/structures` },
        { label: prefix ? "Missions" : "Missions", href: `${prefix}/le-ministere/missions` },
        { label: "Contact", href: `${prefix}/contact` },
      ],
    },
    {
      title: prefix ? "Media" : "Médias",
      links: [
        { label: prefix ? "Photo gallery" : "Galerie photos", href: `${prefix}/galerie` },
        { label: prefix ? "Video library" : "Vidéothèque", href: `${prefix}/videotheque` },
        { label: prefix ? "MTDI in the media" : "MTDI dans les médias", href: `${prefix}/medias/mtdi-dans-les-medias` },
      ],
    },
    {
      title: prefix ? "Useful links" : "Liens utiles",
      links: footerColumns[2].links,
    },
  ];

  return (
    <footer style={{ background: "#162233" }}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: logo + social */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          {/* Logo */}
          <div className="relative h-12 w-64 flex-shrink-0">
            <Image
              src="/mtdi-banner.png"
              alt="Ministère de la Transformation Digitale et de l'Innovation :République du Bénin"
              fill
              sizes="256px"
              className="object-contain object-left"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Social */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {socialLinks.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-white/70 hover:text-white transition-colors"
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {footerColumnsLocale.map((col) => (
            <div key={col.title}>
              <h2
                className="text-xs font-extrabold uppercase tracking-widest mb-4"
                style={{ color: "#4CAF73" }}
              >
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {[
              { label: prefix ? "Legal notices" : "Mentions légales", href: `${prefix}/mentions-legales` },
              { label: prefix ? "Privacy policy" : "Politique de confidentialité", href: `${prefix}/confidentialite` },
              { label: prefix ? "Accessibility" : "Accessibilité", href: `${prefix}/accessibilite` },
              { label: prefix ? "Site map" : "Plan du site", href: `${prefix}/plan-du-site` },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-white/80 text-xs font-medium">
            {prefix
              ? "© 2026 Ministry of Digital Transformation — Republic of Benin"
              : "© 2026 Ministère de la Transformation Digitale — République du Bénin"}
          </p>
        </div>
      </div>

    </footer>
  );
}
