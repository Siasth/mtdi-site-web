import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import StrategieIASubNav from "../../../components/StrategieIASubNav";
import { getJalons } from "@/lib/strategie-ia-content";

const VERT = "#006828";
const JAUNE = "#FFBE00";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InitiativesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.strategie;
  const milestones = await getJalons(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />
      <StrategieIASubNav locale={locale} />

      <main>
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight text-white">
              {locale === "en" ? "Initiatives" : "Initiatives"}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest max-w-2xl">
              {locale === "en"
                ? "Roadmap and ongoing programs of the National AI Strategy"
                : "Feuille de route et programmes en cours de la Stratégie Nationale d'IA"}
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: "#0d1826" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-14" style={{ color: JAUNE }}>
              {t.jalons}
            </h2>

            <div className="relative">
              <div className="absolute left-20 sm:left-28 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />

              <div className="flex flex-col gap-0">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="relative flex items-start gap-8 sm:gap-12 pb-12 last:pb-0">
                    <div className="flex-shrink-0 w-16 sm:w-24 text-right pt-1">
                      <span className="text-sm font-black tabular-nums" style={{ color: milestone.done ? JAUNE : "rgba(255,255,255,0.75)" }}>
                        {milestone.year}
                      </span>
                    </div>

                    <div className="absolute flex items-center justify-center" style={{ left: "calc(4rem + 2rem - 6px)", top: "6px" }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: milestone.done ? JAUNE : "transparent", border: `2px solid ${milestone.done ? JAUNE : "rgba(255,255,255,0.25)"}` }} />
                    </div>

                    <div className="flex-1 min-w-0 pl-6">
                      <div className="flex items-start gap-3 mb-2">
                        {milestone.done && (
                          <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: "rgba(255,190,0,0.15)", color: JAUNE }}>
                            {t.accompli}
                          </span>
                        )}
                        <h3 className="text-white font-black text-base uppercase leading-snug" style={{ opacity: milestone.done ? 1 : 0.65 }}>
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
