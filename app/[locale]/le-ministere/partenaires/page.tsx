import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getPartners } from "@/lib/partners";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";


type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PartenairesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.partenaires;
  const allPartners = await getPartners(locale === "en" ? "en" : "fr");
  const partenairesInstitutionnels = allPartners.filter((p) => p.category === "institutionnel");
  const partenairesTechnologiques = allPartners.filter((p) => p.category === "technologique");
  const partenairesAcademiques = allPartners.filter((p) => p.category === "academique");
  const prefix = locale === "en" ? "/en" : "";

  const categories = [
    { label: "Partenaires institutionnels", id: "institutionnels", accent: "#006828", partners: partenairesInstitutionnels },
    { label: "Partenaires technologiques & internationaux", id: "technologiques", accent: "#7A5800", partners: partenairesTechnologiques },
    { label: "Partenaires académiques", id: "academiques", accent: ROUGE, partners: partenairesAcademiques },
  ];

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

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {categories.map((cat) => (
                <a key={cat.id} href={`#${cat.id}`} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                  {cat.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Partner categories */}
        {categories.map((category, catIndex) => (
          <section
            key={category.id}
            id={category.id}
            className={`px-4 sm:px-6 lg:px-8 py-16 ${catIndex % 2 === 0 ? "bg-white" : "bg-gris-perle"}`}
            style={catIndex > 0 ? { borderTop: "1px solid rgba(0,0,0,0.08)" } : undefined}
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
                {category.label}
              </h2>

              {category.partners.length === 0 ? (
                <p role="status" aria-live="polite" className="text-anthracite/60 text-sm font-medium py-4">
                  {t.aucunPartenaire}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
                  {category.partners.map((partner) => (
                    <div key={partner.name} className="group p-8 bg-white hover:bg-gris-perle transition-colors">
                      <div className="relative h-10 w-full mb-4 flex items-center justify-center">
                        {partner.logoSrc && (
                          <Image src={partner.logoSrc} alt={`Logo ${partner.name}`} fill className="object-contain" sizes="128px" />
                        )}
                      </div>
                      <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-1">{partner.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: partner.accent }}>{partner.full}</p>
                      <p className="text-anthracite/70 text-sm font-medium leading-relaxed group-hover:text-anthracite/80 transition-colors">{partner.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* CTA Devenir partenaire */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {t.devenirPartenaire}<br />
                <span style={{ color: JAUNE }}>partenaire</span>
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium max-w-lg">
                {t.devenirPartenaireSousTitre}
              </p>
            </div>
            <Link
              href={`${prefix}/contact`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              Nous contacter
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
