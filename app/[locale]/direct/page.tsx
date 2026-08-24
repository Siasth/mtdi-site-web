import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getUpcomingEvents, getReplays } from "@/lib/direct";

const VERT  = "#006828";
const ROUGE = "#EB0000";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DirectPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === "en";
  const [dict, upcomingEvents, replays] = await Promise.all([
    getDictionary(locale as Locale),
    getUpcomingEvents(isEn ? "en" : "fr"),
    getReplays(isEn ? "en" : "fr"),
  ]);
  const t = dict.direct;

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex items-center gap-5">
            <span className="relative flex h-5 w-5 flex-shrink-0" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROUGE }} />
              <span className="relative inline-flex rounded-full h-5 w-5" style={{ background: ROUGE }} />
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
          </div>
        </section>

        {/* Main livestream player placeholder */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div
              className="relative w-full flex items-center justify-center"
              style={{ aspectRatio: "16 / 9", background: "#F0F0EE", border: "1px solid rgba(0,0,0,0.08)" }}
              role="region"
              aria-label={t.titre}
            >
              <div className="relative flex flex-col items-center gap-5 text-center px-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.04)", border: "1.5px solid rgba(0,0,0,0.10)" }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="15" rx="2" />
                    <path d="M17 2 7 2" />
                    <path d="M12 2v5" />
                  </svg>
                </div>
                <p className="text-anthracite/65 text-xs font-black uppercase tracking-widest">
                  {t.aucuneDiffusion}
                </p>
                <p className="text-anthracite/60 text-xs font-medium max-w-sm">
                  {t.consultezProgramme}
                </p>
              </div>

              <div className="absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.15)" }}>
                MTDI · République du Bénin
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
                {t.prochainsDirecs}
              </h2>
              <div className="flex flex-col gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 p-6 sm:p-8 bg-white">
                    <div className="flex-shrink-0 w-full sm:w-52">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed" style={{ color: "#7A5800" }}>
                        {event.date}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-anthracite font-black text-base sm:text-lg uppercase leading-snug mb-2">{event.title}</h3>
                      <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Replays */}
        {replays.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
                {t.replays}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
                {replays.map((replay) => (
                  <a
                    key={replay.id}
                    href={replay.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between p-6 bg-white hover:bg-gris-perle transition-colors"
                    style={{ minHeight: "220px" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                      style={{ background: `${VERT}12`, border: `1px solid ${VERT}30` }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={VERT} style={{ marginLeft: "2px" }} aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-anthracite font-black text-sm uppercase leading-snug mb-4">{replay.title}</h3>
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <span className="text-anthracite/60 text-[10px] font-medium">{replay.source} · {replay.date}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest transition-all group-hover:underline" style={{ color: VERT }}>
                          {t.revoir}
                        </span>
                      </div>
                    </div>
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
