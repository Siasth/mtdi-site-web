import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getKitPresseItems } from "@/lib/kit-presse";
import { getGeneralSettings } from "@/lib/general-settings";
import KitPresseListClient from "./KitPresseListClient";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function KitPressePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.kitpresse;
  const docs = await getKitPresseItems(locale === "en" ? "en" : "fr");
  const { pressEmail } = await getGeneralSettings();

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

            <KitPresseListClient docs={docs} telecharger={t.telecharger} />

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
                <a href={`mailto:${pressEmail}`} className="underline font-semibold" style={{ color: VERT }}>
                  {pressEmail}
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
                    <a href={`mailto:${pressEmail}`} className="text-anthracite font-semibold text-sm hover:opacity-70 transition-opacity">
                      {pressEmail}
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
