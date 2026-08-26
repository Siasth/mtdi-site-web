import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getSitemapSections } from "@/lib/sitemap";
import { getLiensUtiles } from "@/lib/liens-utiles";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PlanDuSitePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isEn = locale === "en";
  const t = dict.plandusite;
  const prefix = isEn ? "/en" : "";

  const [sitemapSections, liensUtiles] = await Promise.all([
    getSitemapSections(isEn ? "en" : "fr"),
    getLiensUtiles(),
  ]);

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

        {/* Sitemap grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitemapSections.map((section) => (
                <div key={section.id} className="p-8 bg-gris-perle" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                  <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
                    {section.title}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={`${prefix}${link.href}`}
                          className="group flex items-center gap-2 text-sm font-medium text-anthracite/60 hover:text-anthracite transition-colors"
                        >
                          <svg
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                          <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* External links */}
        {liensUtiles.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
                {t.liensExternes}
              </h2>
              <div className="flex flex-wrap gap-4">
                {liensUtiles.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white text-sm font-semibold text-anthracite/60 hover:text-anthracite transition-colors"
                    style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    {link.label}
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
