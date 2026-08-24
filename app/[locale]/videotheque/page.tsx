import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getVideos } from "@/lib/videos";

const VERT  = "#162233";
const ROUGE = "#EB0000";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VideothequePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.videotheque;
  const videos = await getVideos(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Video grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.toutesLesVideos}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {videos.map((video) => (
                <article key={video.id} className="group bg-white hover:bg-gris-perle transition-colors">
                  {/* Thumbnail */}
                  <Link
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.regarder} : ${video.title}`}
                    className="block relative w-full"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    <div className="absolute inset-0" style={{ background: video.color }}>
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 0%, transparent 65%)" }}
                      />
                    </div>

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all"
                        style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)" }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "3px" }}>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* VIDÉO badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: ROUGE, color: "white" }}>
                      {t.video}
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 text-[9px] font-bold tracking-wide" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>
                      {video.duration}
                    </div>

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>

                  {/* Card content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-anthracite font-black text-sm sm:text-base uppercase leading-snug mb-3 group-hover:text-anthracite/80 transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-anthracite/60 text-[10px] font-medium">{video.date}</span>
                      <span className="text-anthracite/25 text-[10px]">·</span>
                      <span className="text-anthracite/60 text-[10px] font-medium">{video.source}</span>
                    </div>

                    <div className="pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                      <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase tracking-widest transition-all"
                        style={{ color: VERT }}
                      >
                        {t.regarderLien}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
