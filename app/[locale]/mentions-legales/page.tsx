import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getStaticPage } from "@/lib/static-pages";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isEn = locale === "en";
  const t = dict.mentions;
  const page = await getStaticPage("mentions-legales", isEn ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="pt-14 pb-12 px-4 sm:px-6 lg:px-8" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
          </div>
        </section>

        {/* Contenu */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            {page && page.published ? (
              <div className="prose-legal text-anthracite/70 text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <p className="text-anthracite/60 text-sm font-medium">
                {isEn ? "This page is not currently available." : "Cette page n'est pas disponible pour le moment."}
              </p>
            )}
          </div>
        </section>

      </main>

      <style>{`
        .prose-legal h2 { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: ${VERT}; margin: 2em 0 0.9em; }
        .prose-legal h2:first-child { margin-top: 0; }
        .prose-legal p { margin: 0 0 0.9em; }
        .prose-legal p:last-child { margin-bottom: 0; }
        .prose-legal ul { list-style: disc; padding-left: 1.4em; margin: 0.7em 0; }
        .prose-legal a { color: ${VERT}; text-decoration: underline; }
        .prose-legal strong { font-weight: 900; }
      `}</style>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
