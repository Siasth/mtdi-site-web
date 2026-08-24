import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getKitPresseItems } from "@/lib/kit-presse";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function KitPressePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.kitpresse;
  const docs = await getKitPresseItems(locale === "en" ? "en" : "fr");

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

        {/* Ressources téléchargeables */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.ressourcesDisponibles}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {docs.map((doc) => (
                <div key={doc.id} className="p-8 bg-white flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white mb-3"
                        style={{ background: VERT }}
                      >
                        {doc.type}
                      </span>
                      <h3 className="text-anthracite font-black text-base uppercase leading-snug">{doc.title}</h3>
                    </div>
                    <svg className="flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{doc.description}</p>
                  <a
                    href={doc.href}
                    download
                    className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:gap-4"
                    style={{ color: VERT }}
                  >
                    {t.telecharger}
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>

            <div
              className="mt-8 flex items-start gap-4 p-6"
              style={{ background: `${VERT}0a`, border: `1px solid ${VERT}25` }}
            >
              <svg className="flex-shrink-0 mt-0.5" width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium text-anthracite/60">
                {t.demandesSupplementaires}{" "}
                <strong style={{ color: VERT }}>{t.serviceComm}</strong>{" "}
                {t.a}{" "}
                <a href="mailto:presse@innovation.gouv.bj" className="underline font-semibold" style={{ color: VERT }}>
                  presse@innovation.gouv.bj
                </a>.
              </p>
            </div>
          </div>
        </section>

        {/* Contact presse */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
                {t.contactPresse}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <svg className="flex-shrink-0 mt-0.5" width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/60 mb-1">Email</p>
                    <a href="mailto:presse@innovation.gouv.bj" className="text-anthracite font-semibold text-sm hover:opacity-70 transition-opacity">
                      presse@innovation.gouv.bj
                    </a>
                  </div>
                </div>
                <div className="pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <p className="text-anthracite/75 text-xs font-medium leading-relaxed">
                    {t.demandesInterview}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
