import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getOpportunites } from "@/lib/opportunites";

const VERT       = "#162233";
const JAUNE      = "#FFBE00";
const VERT_BENIN = "#006828";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ParticiperPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.participer;
  const prefix = locale === "en" ? "/en" : "";
  const isEn = locale === "en";

  const [offresEmplois, offresStages, offresAppelsOffres] = await Promise.all([
    getOpportunites(isEn ? "en" : "fr", "emplois"),
    getOpportunites(isEn ? "en" : "fr", "stages"),
    getOpportunites(isEn ? "en" : "fr", "appels-offres"),
  ]);

  const sections = [
    {
      id: "appels-offres",
      label: t.appelsOffres,
      icon: (
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      status: null as string | null,
      message: t.appelsOffresMessage,
      cta: { label: t.consulterAppelsOffres, href: "https://appels-offres.gouv.bj/", external: true },
      bg: "bg-white",
      offers: offresAppelsOffres,
    },
    {
      id: "emplois",
      label: t.emplois,
      icon: (
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
      status: t.aucunPoste,
      message: t.emploisMessage,
      cta: { label: t.abonnerNewsletter, href: `${prefix}/newsletter`, external: false },
      bg: "bg-gris-perle",
      offers: offresEmplois,
    },
    {
      id: "stages",
      label: t.stages,
      icon: (
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M22 10l-10-6L2 10l10 6 10-6z" />
          <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
          <line x1="22" y1="10" x2="22" y2="16" />
        </svg>
      ),
      status: t.aucunStage,
      message: t.stagesMessage,
      cta: { label: t.abonnerNewsletter, href: `${prefix}/newsletter`, external: false },
      bg: "bg-white",
      offers: offresStages,
    },
  ];

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
        <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{t.intro}</p>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={`px-4 sm:px-6 lg:px-8 py-20 ${section.bg}`}
            style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${VERT}0f`, color: VERT }}>
                  {section.icon}
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: VERT }}>{section.label}</h2>
              </div>

              {section.offers.length > 0 ? (
                <div className="flex flex-col gap-4 max-w-3xl">
                  {section.offers.map((offer) => (
                    <div key={offer.id} className="p-6 sm:p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-anthracite font-black text-base uppercase leading-snug">{offer.title}</h3>
                        {offer.deadline && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ background: `${JAUNE}30`, color: "#7A5800" }}>{offer.deadline}</span>
                        )}
                      </div>
                      {offer.description && <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-4">{offer.description}</p>}
                      {offer.href && (
                        <a
                          href={offer.href}
                          target={offer.href.startsWith("http") ? "_blank" : undefined}
                          rel={offer.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:gap-4"
                          style={{ color: VERT }}
                        >
                          {section.cta.external ? t.consulterAppelsOffres : t.voirOffre}
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-8 flex flex-col gap-5 max-w-3xl"
                  style={{ background: section.bg === "bg-white" ? "#F5F5F3" : "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {section.status && (
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: JAUNE }} />
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: VERT }}>{section.status}</p>
                    </div>
                  )}

                  <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{section.message}</p>

                  {section.cta.external ? (
                    <a
                      href={section.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start"
                      style={{ background: VERT_BENIN }}
                    >
                      {section.cta.label}
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={section.cta.href}
                      className="inline-flex items-center gap-3 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start"
                      style={{ background: VERT }}
                    >
                      {section.cta.label}
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* CTA contact */}
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: JAUNE }}>{t.uneQuestion}</p>
              <p className="text-white font-black text-xl sm:text-2xl uppercase leading-tight">{t.contactezRH}</p>
            </div>
            <Link
              href={`${prefix}/contact`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider bg-white transition-all hover:gap-5"
              style={{ color: VERT }}
            >
              {t.nousContacter}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
