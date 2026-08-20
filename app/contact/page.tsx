import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const specificContacts = [
  {
    rôle: "Presse & Accréditations",
    name: "Service Communication",
    email: "presse@innovation.gouv.bj",
    phone: "+229 01 21 30 79 39",
    note: "Pour les demandes d'interview, accréditations et dossiers de presse.",
    accent: VERT,
  },
  {
    rôle: "Partenariats & Coopération",
    name: "Direction des Partenariats",
    email: "partenariats@innovation.gouv.bj",
    phone: "+229 01 21 30 79 39",
    note: "Organisations internationales, bailleurs de fonds, partenaires techniques.",
    accent: "#A07800",
  },
  {
    rôle: "Réclamations & Signalements",
    name: "Cellule Citoyenne",
    email: "reclamations@innovation.bj",
    phone: "+229 01 21 30 79 39",
    note: "Traitement des signalements et réclamations relatives aux services numériques publics.",
    accent: ROUGE,
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px", background: "#F5F5F3" }}>

        {/* Hero */}
        <section
          className="pt-14 pb-12 px-4 sm:px-6 lg:px-8"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Contact
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Nous écrire · Nous appeler · Nous rendre visite
            </p>
          </div>
        </section>

        {/* Main two-column section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* Left: Contact info */}
            <div>
              <h2
                className="text-xs font-black uppercase tracking-widest mb-8"
                style={{ color: VERT }}
              >
                Nos coordonnées
              </h2>

              <div className="flex flex-col gap-0">
                {/* Address */}
                <div
                  className="flex gap-5 py-7"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/40 mb-1">
                      Adresse
                    </p>
                    <p className="text-anthracite font-semibold text-sm leading-relaxed">
                      Boulevard de la Marina<br />
                      01 BP 412 Cotonou<br />
                      République du Bénin
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div
                  className="flex gap-5 py-7"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/40 mb-1">
                      Téléphone
                    </p>
                    <a
                      href="tel:+2290121307939"
                      className="text-anthracite font-semibold text-sm hover:text-vert-benin transition-colors"
                    >
                      +229 01 21 30 79 39
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div
                  className="flex gap-5 py-7"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/40 mb-1">
                      Email général
                    </p>
                    <a
                      href="mailto:mtdi.contact@gouv.bj"
                      className="text-anthracite font-semibold text-sm hover:text-vert-benin transition-colors"
                    >
                      mtdi.contact@gouv.bj
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-5 pt-7">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/40 mb-1">
                      Horaires d'ouverture
                    </p>
                    <p className="text-anthracite font-semibold text-sm leading-relaxed">
                      Lundi – Vendredi : 8h00 – 12h30 et 14h00 – 17h30<br />
                      <span className="text-anthracite/40 font-medium">
                        Fermé les samedis, dimanches et jours fériés
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <h2
                className="text-xs font-black uppercase tracking-widest mb-8"
                style={{ color: VERT }}
              >
                Nous écrire
              </h2>

              <form className="flex flex-col gap-5" action="#" method="POST">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                    >
                      Nom complet *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Prénom Nom"
                      className="px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
                      style={{
                        background: "#F5F5F3",
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                    >
                      Adresse email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="vous@exemple.com"
                      className="px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
                      style={{
                        background: "#F5F5F3",
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="subject"
                    className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                  >
                    Objet *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Objet de votre message"
                    className="px-4 py-3.5 text-sm font-medium outline-none text-anthracite"
                    style={{
                      background: "#F5F5F3",
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className="text-[10px] font-black uppercase tracking-widest text-anthracite/50"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Détaillez votre demande..."
                    className="px-4 py-3.5 text-sm font-medium outline-none resize-none text-anthracite"
                    style={{
                      background: "#F5F5F3",
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* Privacy note */}
                <p className="text-[10px] font-medium text-anthracite/35">
                  En soumettant ce formulaire, vous acceptez que les informations saisies soient utilisées
                  dans le cadre de votre demande, conformément à la politique de protection des données du Ministère.
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start"
                  style={{ background: VERT }}
                >
                  Envoyer le message
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Specific contacts */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-20 bg-gris-perle"
          style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Contacts spécialisés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {specificContacts.map((contact) => (
                <div
                  key={contact.rôle}
                  className="p-8 flex flex-col gap-4 bg-white"
                >
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: contact.accent }}
                    >
                      {contact.rôle}
                    </p>
                    <p className="text-anthracite font-black text-base uppercase leading-snug">
                      {contact.name}
                    </p>
                  </div>

                  <p className="text-anthracite/50 text-xs font-medium leading-relaxed">
                    {contact.note}
                  </p>

                  <div
                    className="mt-auto pt-5 flex flex-col gap-2"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-xs font-semibold transition-colors hover:opacity-70"
                      style={{ color: contact.accent }}
                    >
                      {contact.email}
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="text-xs font-medium text-anthracite/50 hover:text-anthracite transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Response time note */}
            <div
              className="mt-8 flex items-start gap-4 p-6"
              style={{ background: `${VERT}0a`, border: `1px solid ${VERT}25` }}
            >
              <svg
                className="flex-shrink-0 mt-0.5"
                width="18"
                height="18"
                fill="none"
                stroke={VERT}
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium text-anthracite/60">
                <strong style={{ color: VERT, fontWeight: 800 }}>Délai de réponse</strong> :Le Ministère
                s'engage à traiter les demandes générales sous <strong className="text-anthracite">5 jours ouvrables</strong>.
                Les demandes de presse et les urgences sont traitées sous 48 heures. Pour les signalements urgents
                relatifs à la cybersécurité, contactez directement le CERT.bj.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
