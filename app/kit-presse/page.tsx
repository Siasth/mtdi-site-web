import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";

export default function KitPressePage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-12"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Kit Presse
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Ressources · Identité visuelle · Contacts
            </p>
          </div>
        </section>

        {/* Redirect notice */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-8"
              style={{ background: `${JAUNE}20` }}
            >
              <svg width="28" height="28" fill="none" stroke={JAUNE} strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2
              className="text-xs font-black uppercase tracking-widest mb-6"
              style={{ color: VERT }}
            >
              Ressources presse consolidées
            </h2>

            <p className="text-anthracite/60 text-base sm:text-lg leading-relaxed mb-8">
              Les ressources presse du Ministère de la Transformation Digitale et de l'Innovation
              sont désormais regroupées dans la rubrique
              <strong className="text-anthracite"> MTDI dans les médias</strong>.
              Vous y trouverez les communiqués officiels, les discours et interviews du Ministre,
              ainsi que la couverture presse nationale et internationale.
            </p>

            <Link
              href="/medias/mtdi-dans-les-medias"
              className="inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5"
              style={{ background: VERT }}
            >
              Accéder à MTDI dans les médias
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Contact presse */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-3xl mx-auto">
            <div
              className="p-8 bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <h3
                className="text-xs font-black uppercase tracking-widest mb-6"
                style={{ color: VERT }}
              >
                Contact presse
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <svg
                    className="flex-shrink-0 mt-0.5"
                    width="18"
                    height="18"
                    fill="none"
                    stroke={VERT}
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/40 mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:presse@innovation.gouv.bj"
                      className="text-anthracite font-semibold text-sm hover:text-vert-benin transition-colors"
                    >
                      presse@innovation.gouv.bj
                    </a>
                  </div>
                </div>

                <div
                  className="pt-4"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <p className="text-anthracite/50 text-xs font-medium leading-relaxed">
                    Pour les demandes d'interview, accréditations presse, demandes de visuels
                    ou tout autre besoin média, contactez le Service Communication du MTDI.
                    Délai de réponse : 48 heures ouvrables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
