import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getEServices } from "@/lib/eservices";
import { IconPreset } from "../../components/IconPreset";

const VERT = "#162233";
const JAUNE = "#FFBE00";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EServicesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.eservices;
  const services = await getEServices(locale === "en" ? "en" : "fr");
  const prefix = locale === "en" ? "/en" : "";

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
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.categoriesServices}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {services.map((service) => (
                <a
                  key={service.id}
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-8 bg-white flex flex-col gap-5 transition-colors hover:bg-gris-perle"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${VERT}0a` }}>
                    <IconPreset name={service.icon} color={VERT} size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-anthracite font-black text-sm uppercase mb-2">{service.title}</h3>
                    <p className="text-anthracite/75 text-xs font-medium leading-relaxed">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all group-hover:gap-4" style={{ color: VERT }}>
                    {t.acceder}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Stats banner */}
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-8">
              <div className="text-center px-8">
                <p className="text-4xl sm:text-5xl font-black" style={{ color: JAUNE }}>24/7</p>
                <p className="mt-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
                  {t.disponibilitePermanente}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: VERT }}>
              {t.portailNational}
            </h2>
            <p className="text-anthracite font-black text-2xl sm:text-3xl uppercase leading-tight mb-4">
              {t.toutesDemanches}
            </p>
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed max-w-xl mx-auto mb-10">
              {t.servicePublicDesc}
            </p>
            <a
              href="https://service-public.bj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5"
              style={{ background: VERT }}
            >
              {t.accederServicePublic}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>
          </div>
        </section>

        {/* Help */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div>
                <h3 className="text-anthracite font-black text-sm uppercase mb-1">{t.besoinAide}</h3>
                <p className="text-anthracite/70 text-xs font-medium">
                  {t.equipeAssistanceDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+2290121307939"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-anthracite transition-colors hover:bg-gris-perle"
                  style={{ border: "1px solid rgba(0,0,0,0.12)" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
                  </svg>
                  {t.appeler}
                </a>
                <Link
                  href={`${prefix}/contact`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:opacity-90"
                  style={{ background: VERT }}
                >
                  {t.nousContacter}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
