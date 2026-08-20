import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const VERT_BENIN = "#006828";

export default function EcrireAuMinistrePage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Écrire au
              <br />
              <span style={{ color: "#FFBE00" }}>Ministre</span>
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Adressez directement votre message au Ministre
            </p>
          </div>
        </section>

        {/* Form section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 sm:p-12" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-anthracite/60 text-sm font-medium leading-relaxed mb-8">
                Ce formulaire vous permet d'adresser un message directement au cabinet du Ministre
                de la Transformation Digitale et de l'Innovation. Votre message sera traité dans un
                délai de 10 jours ouvrables.
              </p>

              <form className="space-y-6">
                {/* Identité */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                      Nom & Prénoms *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                      style={{ focusRingColor: VERT_BENIN } as React.CSSProperties}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                      placeholder="votre@email.bj"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                    Objet *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                    placeholder="L'objet de votre message"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                    Votre message *
                  </label>
                  <textarea
                    required
                    rows={8}
                    className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow resize-none"
                    placeholder="Rédigez votre message au Ministre..."
                  />
                </div>

                {/* Pièce jointe */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                    Pièce jointe (optionnel)
                  </label>
                  <div className="px-4 py-6 bg-gris-perle text-center">
                    <p className="text-anthracite/40 text-xs font-medium">
                      PDF, DOC ou image : 5 Mo maximum
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:gap-5"
                    style={{ background: VERT_BENIN }}
                  >
                    Envoyer le message
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <p className="text-anthracite/30 text-[10px] font-medium leading-relaxed max-w-xs">
                    Vos données sont traitées conformément à la loi n°2017-20 portant
                    code du numérique en République du Bénin.
                  </p>
                </div>
              </form>
            </div>

            {/* Info card */}
            <div className="mt-8 p-6 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${VERT_BENIN}12`, border: `1.5px solid ${VERT_BENIN}30` }}
                >
                  <svg width="18" height="18" fill="none" stroke={VERT_BENIN} strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-anthracite mb-1">
                    Autres moyens de contact
                  </p>
                  <p className="text-anthracite/50 text-sm font-medium leading-relaxed">
                    Pour les demandes presse, partenariats ou réclamations, veuillez utiliser
                    la page{" "}
                    <Link href="/contact" className="underline hover:text-anthracite transition-colors">
                      Contact
                    </Link>.
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
