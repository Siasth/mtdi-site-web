import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Newsletter from "../../../components/Newsletter";
import { getActualiteById, getRelatedActualites } from "@/lib/actualites";

function textColorFor(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  if (hex.length !== 6) return "white";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1A1A1A" : "white";
}

const VERT = "#006828";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ActualiteDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.actualites;
  const prefix = locale === "en" ? "/en" : "";
  const isEn = locale === "en";

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const article = await getActualiteById(numericId, isEn ? "en" : "fr");
  if (!article) notFound();

  const related = await getRelatedActualites(article.id, article.categoryId, isEn ? "en" : "fr", 4);

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>

        {/* ── Bandeau titre : image de fond + titre superposé ── */}
        <section className="relative">
          <div className="relative h-[280px] sm:h-[360px] w-full overflow-hidden">
            {article.image ? (
              <Image src={article.image} alt="" fill className="object-cover" sizes="100vw" priority />
            ) : (
              <div className="absolute inset-0" style={{ background: "#162233" }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)" }} />

            <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8">
              <div className="max-w-5xl mx-auto w-full">
                <Link
                  href={`${prefix}/actualites`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white mb-5"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                  {isEn ? "Back to news" : "Retour aux actualités"}
                </Link>

                <span
                  className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-4"
                  style={{ background: article.categoryColor, color: textColorFor(article.categoryColor) }}
                >
                  {article.category}
                </span>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight text-white max-w-4xl">
                  {article.title}
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* ── Corps : contenu + colonne articles similaires ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

            <div>
              <div className="flex items-center gap-3 text-anthracite/50 text-xs font-semibold uppercase tracking-wider mb-8 pb-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <span>
                  {new Date(article.publishedAt).toLocaleDateString(isEn ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                {article.readTime && (
                  <>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </>
                )}
              </div>

              <div
                className="text-anthracite/80 text-base leading-relaxed prose-actualite"
                // Contenu HTML déjà assaini côté serveur à l'enregistrement
                // (voir sanitizeRichText dans /api/admin/actualites).
                dangerouslySetInnerHTML={{ __html: article.excerpt || "" }}
              />
              <style>{`
                .prose-actualite h1 { font-size: 1.5em; font-weight: 900; margin: 1em 0 0.4em; color: #1A1A1A; }
                .prose-actualite h2 { font-size: 1.25em; font-weight: 900; margin: 1em 0 0.4em; color: #1A1A1A; }
                .prose-actualite h3 { font-size: 1.1em; font-weight: 900; margin: 0.8em 0 0.3em; color: #1A1A1A; }
                .prose-actualite p { margin: 0.7em 0; }
                .prose-actualite ul { list-style: disc; padding-left: 1.4em; margin: 0.7em 0; }
                .prose-actualite ol { list-style: decimal; padding-left: 1.4em; margin: 0.7em 0; }
                .prose-actualite blockquote { border-left: 3px solid ${VERT}; padding-left: 1em; color: rgba(26,26,26,0.6); font-style: italic; margin: 0.8em 0; }
                .prose-actualite code { background: #f1f1ef; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.9em; }
                .prose-actualite a { color: ${VERT}; text-decoration: underline; }
                .prose-actualite table { border-collapse: collapse; margin: 1em 0; width: 100%; }
                .prose-actualite td, .prose-actualite th { border: 1px solid rgba(0,0,0,0.12); padding: 8px 12px; text-align: left; }
                .prose-actualite th { background: #f5f5f3; font-weight: 700; }
              `}</style>

              {/* Pièces jointes */}
              {article.attachments.length > 0 && (
                <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
                    {isEn ? "Attachment" : "Pièce jointe"}
                  </h2>
                  <div className="space-y-2">
                    {article.attachments.map((a, i) => (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gris-perle transition-colors"
                        style={{ borderColor: `${VERT}40` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                          </svg>
                          <span className="text-sm font-semibold text-anthracite truncate">{a.name}</span>
                        </div>
                        <span
                          className="flex-shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white rounded"
                          style={{ background: "#162233" }}
                        >
                          {isEn ? "Download" : "Télécharger"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Articles similaires */}
            {related.length > 0 && (
              <aside>
                <h2 className="text-lg font-black uppercase text-anthracite mb-5">
                  {isEn ? "Related articles" : "Articles similaires"}
                </h2>
                <div className="space-y-5">
                  {related.map((r) => (
                    <Link key={r.id} href={r.hrefExternal || `${prefix}/actualites/${r.id}`} target={r.hrefExternal ? "_blank" : undefined} className="flex gap-3 group">
                      <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                        {r.image ? (
                          <Image src={r.image} alt="" fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: "#162233" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-anthracite leading-snug line-clamp-2 group-hover:text-vert-benin transition-colors">
                          {r.title}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-widest" style={{ color: VERT }}>
                          {t.lire}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>

      </main>

      <Newsletter dict={dict.home} />
      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
