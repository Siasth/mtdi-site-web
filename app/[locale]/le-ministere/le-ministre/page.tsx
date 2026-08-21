import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import Image from "next/image";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const priorityAccents = [VERT, "#7A5800", ROUGE, VERT];

const priorityIcons = [
  <svg key="01" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>,
  <svg key="02" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.3-6C6.8 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" />
    <path d="M9 21h6" />
  </svg>,
  <svg key="03" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 2 3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  <svg key="04" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>,
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LeMinisterPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.ministre;
  const prefix = locale === "en" ? "/en" : "";

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 overflow-hidden" style={{ background: VERT }}>
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.breadcrumb}
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              Mahuna<br />
              <span style={{ color: JAUNE }}>Akplogan</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Portrait + Bio intro */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Portrait */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-sm" style={{ paddingBottom: "125%" }}>
                <Image
                  src="/ministre.png"
                  alt={t.imageAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#006828" }} />
              </div>

              {/* Floating badge */}
              <div className="absolute -right-4 top-8 px-4 py-2 rounded-sm shadow-lg hidden lg:block" style={{ background: "#006828" }}>
                <p className="text-white text-xs font-bold uppercase tracking-wider">{t.badge}</p>
                <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">{t.badgeSousTitre}</p>
              </div>
            </div>

            {/* Bio intro */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
                {t.biographie}
              </h2>

              <div className="space-y-5 text-base text-anthracite/80 leading-relaxed">
                <p>{t.bio.p1}</p>
                <p>{t.bio.p2}</p>
                <p>{t.bio.p3}</p>
                <p>{t.bio.p4}</p>
                <p>{t.bio.p5}</p>
                <p>{t.bio.p6}</p>
              </div>

              <div className="mt-6">
                <Link
                  href="https://fr.wikipedia.org/wiki/Mahuna_Akplogan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all hover:gap-4"
                  style={{ color: VERT }}
                >
                  {t.voirPlus}
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </Link>
              </div>

              {/* Signature */}
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <p className="font-black text-anthracite text-base uppercase tracking-wide">Mahuna Akplogan</p>
                <p className="text-xs text-anthracite/75 font-semibold uppercase tracking-wider mt-0.5">
                  {t.signatureTitre}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Parcours Timeline */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-14" style={{ color: VERT }}>
              {t.parcours}
            </h2>

            <div className="relative">
              <div className="absolute left-[4.5rem] sm:left-[7rem] top-0 bottom-0 w-px" style={{ background: "rgba(0,0,0,0.10)" }} />

              <div className="flex flex-col gap-0">
                {t.parcoursItems.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-6 sm:gap-12 pb-10 sm:pb-12 last:pb-0">
                    <div className="flex-shrink-0 w-12 sm:w-24 text-right pt-1">
                      <span className="text-sm font-black tabular-nums" style={{ color: VERT }}>{item.period}</span>
                    </div>

                    <div className="absolute left-[calc(4.5rem-6px)] sm:left-[calc(7rem-6px)] top-[6px] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full" style={{ background: VERT, border: `2px solid ${VERT}` }} />
                    </div>

                    <div className="flex-1 min-w-0 pl-6">
                      <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-2">{item.title}</h3>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(26,26,26,0.75)" }}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Priorités */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.priorites}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {t.prioritesItems.map((p, i) => (
                <div key={p.number} className="group p-8 sm:p-10 bg-white hover:bg-gris-perle transition-colors">
                  <div className="flex items-start gap-5 mb-6">
                    <span className="text-5xl font-black leading-none tabular-nums flex-shrink-0" style={{ color: priorityAccents[i], opacity: 0.3 }}>{p.number}</span>
                    <div className="mt-1 flex-shrink-0" style={{ color: priorityAccents[i] }}>{priorityIcons[i]}</div>
                  </div>
                  <h3 className="text-anthracite font-black text-xl uppercase leading-snug mb-4">{p.title}</h3>
                  <p className="text-anthracite/65 text-sm font-medium leading-relaxed group-hover:text-anthracite/80 transition-colors">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {t.ecrireAuMinistre}<br />
                <span style={{ color: JAUNE }}>Ministre</span>
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">{t.adressezMessage}</p>
            </div>
            <Link
              href={`${prefix}/ecrire-au-ministre`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {t.ecrireAuMinistre}
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
