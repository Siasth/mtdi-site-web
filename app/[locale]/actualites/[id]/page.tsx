import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Newsletter from "../../../components/Newsletter";
import { getActualiteById, getRelatedActualites } from "@/lib/actualites";

const BANNER = "#162233"; // même bleu nuit que le bandeau standard du site
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

      <main style={{ paddingTop: "80px" }}>

        {/* ── Bandeau titre : fond uni, comme le reste du site ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8" style={{ background: BANNER }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase leading-snug text-white max-w-3xl mb-5">
              {article.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4 max-w-3xl">
              <div className="flex items-center gap-3 text-white/50 text-xs font-semibold uppercase tracking-wider">
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

              <Link
                href={`${prefix}/actualites`}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                {isEn ? "Back to news" : "Retour aux actualités"}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Image + contenu (colonne gauche) / Articles similaires (colonne droite, plus courte) ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

            {/* Colonne gauche : image puis contenu de l'article */}
            <div>
              {article.image && (
                <div className="relative h-64 sm:h-96 overflow-hidden rounded-sm mb-8">
                  <Image src={article.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" priority />
                </div>
              )}

              <div
                className="max-w-3xl text-anthracite/80 text-base leading-relaxed prose-actualite"
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

              {/* Ressources associées : fichiers uploadés ou simples liens
                  (galerie, vidéothèque, document externe...) */}
              {article.attachments.length > 0 && (
                <div className="max-w-3xl mt-12 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
                    {isEn ? "Related resources" : "Ressources associées"}
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
                          {a.kind === "link" ? (
                            <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
                              <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.5-1.5" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                            </svg>
                          )}
                          <span className="text-sm font-semibold text-anthracite truncate">{a.name}</span>
                        </div>
                        <span
                          className="flex-shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white rounded"
                          style={{ background: BANNER }}
                        >
                          {a.kind === "link" ? (isEn ? "Open" : "Ouvrir") : (isEn ? "Download" : "Télécharger")}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite : Articles similaires (plus courte que la colonne gauche) */}
            {related.length > 0 && (
              <aside className="bg-gris-perle rounded-lg p-6 sm:p-7 self-start">
                <h2 className="font-black text-xl text-anthracite mb-5">
                  {isEn ? "Related articles" : "Articles similaires"}
                </h2>
                <div className="flex flex-col">
                  {related.map((r, i) => (
                    <Link
                      key={r.id}
                      href={r.hrefExternal || `${prefix}/actualites/${r.id}`}
                      target={r.hrefExternal ? "_blank" : undefined}
                      className="flex gap-3 group py-4 first:pt-0 last:pb-0"
                      style={{ borderBottom: i < related.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                    >
                      <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                        {r.image ? (
                          <Image src={r.image} alt="" fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: BANNER }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-anthracite leading-snug line-clamp-2 group-hover:line-clamp-none group-hover:text-vert-benin transition-colors">
                          {r.title}
                        </p>
                        <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: VERT }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: VERT }} />
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
