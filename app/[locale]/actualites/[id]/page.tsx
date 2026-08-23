import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getActualiteById } from "@/lib/actualites";

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

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const article = await getActualiteById(numericId, locale === "en" ? "en" : "fr");
  if (!article) notFound();

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`${prefix}/actualites`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline mb-6"
              style={{ color: VERT }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              {locale === "en" ? "Back to news" : "Retour aux actualités"}
            </Link>

            <span
              className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ background: article.categoryColor, color: textColorFor(article.categoryColor) }}
            >
              {article.category}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black uppercase leading-tight text-anthracite mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 text-anthracite/60 text-xs font-semibold uppercase tracking-wider mb-8">
              <span>
                {new Date(article.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {article.readTime && (
                <>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {article.image && (
          <section className="px-4 sm:px-6 lg:px-8 mb-10">
            <div className="max-w-4xl mx-auto relative h-64 sm:h-96 overflow-hidden">
              <Image src={article.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
            </div>
          </section>
        )}

        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className="max-w-3xl mx-auto text-anthracite/80 text-base leading-relaxed prose-actualite"
            // Contenu HTML déjà assaini côté serveur à l'enregistrement
            // (voir sanitizeRichText dans /api/admin/actualites).
            dangerouslySetInnerHTML={{ __html: article.excerpt || "" }}
          />
        </section>
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
