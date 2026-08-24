import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCabinetMembers } from "@/lib/cabinet";

const VERT = "#162233";
const JAUNE = "#FFBE00";


type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CabinetPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.cabinet;
  const cabinetMembers = await getCabinetMembers(locale === "en" ? "en" : "fr");

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

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              <span style={{ color: JAUNE }}>{t.titre}</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Cabinet */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.cabinetMinisteriel}
            </h2>

            <ul role="list" className="flex flex-col gap-0 list-none">
              {cabinetMembers.map((member, i) => (
                <li key={i} className="flex items-start gap-6 py-8" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {/* Level indicator */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${member.accent}14` }}>
                      <svg width="20" height="20" fill="none" stroke={member.accent} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-anthracite font-black text-lg uppercase leading-snug">{member.role}</h3>
                      {member.level === 0 && (
                        <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white" style={{ background: "#006828" }}>
                          {t.autoritePolitique}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: member.accent }}>
                      {member.direction}
                    </p>
                    <div
                      className="text-anthracite/70 text-sm font-medium leading-relaxed max-w-2xl prose-institutionnel"
                      dangerouslySetInnerHTML={{ __html: member.description }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>

      <style>{`
        .prose-institutionnel p { margin: 0.4em 0; }
        .prose-institutionnel strong { font-weight: 900; }
        .prose-institutionnel a { color: #006828; text-decoration: underline; }
        .prose-institutionnel ul { list-style: disc; padding-left: 1.2em; }
        .prose-institutionnel ol { list-style: decimal; padding-left: 1.2em; }
      `}</style>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
