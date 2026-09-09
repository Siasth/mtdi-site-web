import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getUpcomingEvents, getReplays } from "@/lib/direct";
import { getLiveStreamSettings, buildEmbedUrl } from "@/lib/live-stream";
import { UpcomingEventsList, ReplaysList } from "./DirectListsClient";

const VERT  = "#006828";
const BANNER = "#162233"; // bandeau titre, harmonisé avec le reste du site
const ROUGE = "#EB0000";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DirectPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === "en";
  const [dict, upcomingEvents, replays, live] = await Promise.all([
    getDictionary(locale as Locale),
    getUpcomingEvents(isEn ? "en" : "fr"),
    getReplays(isEn ? "en" : "fr"),
    getLiveStreamSettings(),
  ]);
  const t = dict.direct;
  const embedUrl = live.isLive ? buildEmbedUrl(live.url, live.provider) : null;
  const liveTitle = (isEn ? live.titleEn : live.titleFr) || t.titre;

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: BANNER }}>
          <div className="max-w-7xl mx-auto flex items-center gap-5">
            {live.isLive && (
              <span className="relative flex h-5 w-5 flex-shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROUGE }} />
                <span className="relative inline-flex rounded-full h-5 w-5" style={{ background: ROUGE }} />
              </span>
            )}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
          </div>
        </section>

        {/* Lecteur du direct en cours (ANO-089 / ANO-142), ou message d'attente */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 bg-white">
          <div className="max-w-7xl mx-auto">
            {embedUrl ? (
              <div className="relative w-full" style={{ aspectRatio: "16 / 9", background: "#000" }}>
                {live.provider === "custom" ? (
                  <video
                    src={embedUrl}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full"
                    aria-label={liveTitle}
                  />
                ) : (
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allow="autoplay; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    title={liveTitle}
                  />
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ROUGE }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: ROUGE }} />
                  </span>
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">{liveTitle}</span>
                </div>
              </div>
            ) : (
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

                <div className="absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.85)" }}>
                  MTDI · République du Bénin
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <UpcomingEventsList events={upcomingEvents} dict={{ prochainsDirecs: t.prochainsDirecs, replays: t.replays, revoir: t.revoir }} />
        )}

        {/* Replays */}
        {replays.length > 0 && (
          <ReplaysList replays={replays} dict={{ prochainsDirecs: t.prochainsDirecs, replays: t.replays, revoir: t.revoir }} />
        )}
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
