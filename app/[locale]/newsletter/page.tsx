import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import NewsletterForm from "../../components/NewsletterForm";

const VERT  = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.newsletter;

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

        {/* Subscription form */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Left: Benefits */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
                {t.restezInforme}
              </h2>

              <p className="text-anthracite/60 text-base leading-relaxed mb-10">
                {t.desc}
              </p>

              <div className="flex flex-col gap-0">
                {[
                  {
                    label: t.unEmailParMois,
                    description: t.unEmailDesc,
                    icon: (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                  },
                  {
                    label: t.contenuPersonnalise,
                    description: t.contenuDesc,
                    icon: (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ),
                  },
                  {
                    label: t.accesPrioritaire,
                    description: t.accesDesc,
                    icon: (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    ),
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-5 py-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${VERT}14`, color: VERT }}>
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="text-anthracite font-black text-sm uppercase mb-1">{benefit.label}</p>
                      <p className="text-anthracite/75 text-sm font-medium leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <NewsletterForm dict={t} />
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
