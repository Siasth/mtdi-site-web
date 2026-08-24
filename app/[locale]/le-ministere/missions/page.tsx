import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getMissions } from "@/lib/missions";

const VERT = "#162233";
const JAUNE = "#FFBE00";


type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MissionsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.missions;
  const missions = await getMissions(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.breadcrumb}
            </p>

            <h1 aria-label="Missions et Attribution" className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              Missions &amp; <span style={{ color: JAUNE }}>{t.titreHighlight}</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Missions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
              {t.attributions}
            </h2>
            <p className="text-anthracite/60 text-sm font-medium mb-10">
              {t.intro}
            </p>

            <ol role="list" className="flex flex-col gap-0 list-none">
              {missions.map((mission, i) => (
                <li
                  key={i}
                  className="flex items-start gap-5 py-6"
                  style={{ borderBottom: i < missions.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <span className="text-2xl font-black leading-none tabular-nums flex-shrink-0 w-8 text-right" style={{ color: "#595959" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-anthracite/70 text-sm font-medium leading-relaxed">{mission}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
