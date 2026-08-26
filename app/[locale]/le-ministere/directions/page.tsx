import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getDirections } from "@/lib/directions";

const VERT = "#162233";
const JAUNE = "#FFBE00";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DirectionsCentralesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.directions;
  const directionsData = await getDirections(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.breadcrumb}
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              {t.titre.split(" ").slice(0, -1).join(" ")}<br />
              <span style={{ color: JAUNE }}>{t.titre.split(" ").slice(-1)}</span>
            </h1>
          </div>
        </section>

        {/* Directions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.directionsMinistere}
            </h2>
            <ul className="flex flex-col gap-0 list-none" role="list">
              {directionsData.map((dir, i) => (
                <li
                  key={dir.acronym}
                  className="py-8"
                  style={{ borderBottom: i < directionsData.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: dir.accent, color: dir.accent === "#EB0000" || dir.accent === VERT || dir.accent === "#7A5800" ? "white" : "#1a1a1a" }}
                    >
                      {dir.acronym}
                    </span>
                    <span className="text-xs font-medium text-anthracite/65">{dir.type}</span>
                  </div>
                  <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-2 max-w-3xl">{dir.name}</h3>
                  {"director" in dir && dir.director && (
                    <p className="text-xs font-semibold text-anthracite/65 mb-4">
                      {t.directeur} {dir.director}
                    </p>
                  )}
                  <div className="text-anthracite/75 text-sm font-medium leading-relaxed max-w-3xl prose-institutionnel" dangerouslySetInnerHTML={{ __html: dir.description }} />
                </li>
              ))}
            </ul>
            <style>{`
              .prose-institutionnel p { margin: 0.4em 0; }
              .prose-institutionnel strong { font-weight: 900; }
              .prose-institutionnel a { color: #006828; text-decoration: underline; }
              .prose-institutionnel ul { list-style: disc; padding-left: 1.2em; }
              .prose-institutionnel ol { list-style: decimal; padding-left: 1.2em; }
            `}</style>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
