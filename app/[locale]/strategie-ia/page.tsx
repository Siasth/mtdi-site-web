import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StrategieIASubNav from "../../components/StrategieIASubNav";
import Link from "next/link";
import { getPiliers } from "@/lib/strategie-ia-content";
import { getGeneralSettings } from "@/lib/general-settings";
import { IconPreset } from "../../components/IconPreset";

const VERT  = "#006828";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const PILIER_ACCENTS = [VERT, "#7A5800", ROUGE, VERT];
// Variante éclaircie utilisée uniquement sur fond sombre (#0d1826) : les teintes
// foncées ci-dessus, même à pleine opacité, n'atteignent pas 4.5:1 sur un fond
// aussi sombre (ANO-099).
const PILIER_ACCENTS_ON_DARK = ["#4CAF50", JAUNE, "#FF5C5C", "#4CAF50"];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StrategieIAPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.strategie;
  const piliers = await getPiliers(locale === "en" ? "en" : "fr");
  const { strategieIaDocUrl } = await getGeneralSettings();

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />
      <StrategieIASubNav locale={locale} />

      <main>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 overflow-hidden" style={{ background: VERT }}>
          <div className="relative max-w-7xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2">
              <span className="px-4 py-1.5 text-xs font-black uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                Bénin 2030
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              {t.titreL1}<br />
              {t.titreL2}<br />
              <span style={{ color: JAUNE }}>{t.titreL3}</span>
            </h1>

            <p className="mt-8 text-white/60 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              {t.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={strategieIaDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
                style={{ background: "white", color: VERT }}
              >
                {t.telecharger}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <Link href="#piliers" className="text-sm font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors">
                {t.explorerPiliers}
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 pt-8 grid grid-cols-2 sm:grid-cols-4 gap-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {[
                { value: "4", label: t.piliers },
                { value: "2030", label: t.horizon },
                { value: "10 000", label: t.professionnels },
                { value: "6", label: locale === "en" ? "Milestones" : "Jalons" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-black text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Pillars */}
        <section id="piliers" className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: "#0d1826" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: JAUNE }}>
              {t.les4Piliers}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.08)" }}>
              {piliers.map((pilier, i) => (
                <div key={pilier.id} className="group p-8 sm:p-10 transition-colors" style={{ background: "#0d1826" }}>
                  <div className="flex items-start gap-5 mb-6">
                    <span className="text-5xl font-black leading-none tabular-nums flex-shrink-0" style={{ color: PILIER_ACCENTS_ON_DARK[i % 4] }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-1 flex-shrink-0" style={{ color: PILIER_ACCENTS_ON_DARK[i % 4] }}>
                      <IconPreset name={pilier.icon} color={PILIER_ACCENTS_ON_DARK[i % 4]} size={28} />
                    </div>
                  </div>
                  <h3 className="text-white font-black text-xl uppercase leading-snug mb-4">{pilier.title}</h3>
                  <p className="text-white/60 text-sm font-medium leading-relaxed">{pilier.description}</p>
                  <div className="mt-6 h-0.5 w-12 rounded-full" style={{ background: PILIER_ACCENTS[i % 4] }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {t.accederDocument}
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                {t.documentInfo}
              </p>
            </div>
            <a
              href={strategieIaDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {t.telecharger}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
