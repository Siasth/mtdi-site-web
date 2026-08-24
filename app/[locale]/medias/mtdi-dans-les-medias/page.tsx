import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import MediaListClient from "./MediaListClient";
import { getMediaMentions } from "@/lib/media-mentions";
import fr from "../../../../dictionaries/fr.json";
import en from "../../../../dictionaries/en.json";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MTDIDansLesMediasPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === "en";
  const t = isEn ? en.medias : fr.medias;
  const items = await getMediaMentions(isEn ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">{t.titre}</h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">{t.sousTitre}</p>
          </div>
        </section>

        <MediaListClient items={items} dict={{ tous: t.filtres.tous, medias: t.filtres.medias, voir: t.voir }} />
      </main>

      <Footer locale={locale} />
    </>
  );
}
