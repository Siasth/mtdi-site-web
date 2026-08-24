import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactForm from "../../components/ContactForm";
import { getGeneralSettings } from "@/lib/general-settings";
import { getContactsSpecifiques } from "@/lib/contacts-specifiques";

const VERT  = "#006828";
const BANNER = "#162233"; // bandeau titre, harmonisé avec le reste du site

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.contact;
  const general = await getGeneralSettings();
  const specificContacts = await getContactsSpecifiques(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px", background: "#F5F5F3" }}>

        {/* Hero */}
        <section
          className="pt-14 pb-12 px-4 sm:px-6 lg:px-8"
          style={{ background: BANNER }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 w-16 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.30)" }} />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
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
                {t.nosCoordonnees}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/60 mb-1">
                      {t.adresse}
                    </p>
                    <p className="text-anthracite font-semibold text-sm leading-relaxed whitespace-pre-line">
                      {(locale === "en" && general.contactAddressEn) || general.contactAddress || (locale === "en" ? "Address to be provided" : "Adresse à renseigner")}
                    </p>
                    {general.locationMapUrl && (
                      <a
                        href={general.locationMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold uppercase tracking-wider hover:underline"
                        style={{ color: VERT }}
                      >
                        {locale === "en" ? "View on map" : "Voir sur la carte"}
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </a>
                    )}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/60 mb-1">
                      {t.telephone}
                    </p>
                    {general.contactPhone ? (
                      <a
                        href={`tel:${general.contactPhone.replace(/[^\d+]/g, "")}`}
                        className="text-anthracite font-semibold text-sm hover:text-vert-benin transition-colors"
                      >
                        {general.contactPhone}
                      </a>
                    ) : (
                      <p className="text-anthracite/40 font-semibold text-sm italic">
                        {locale === "en" ? "To be provided" : "À renseigner"}
                      </p>
                    )}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/60 mb-1">
                      {t.emailGeneral}
                    </p>
                    <a
                      href={`mailto:${general.contactEmail}`}
                      className="text-anthracite font-semibold text-sm hover:text-vert-benin transition-colors"
                    >
                      {general.contactEmail}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-anthracite/60 mb-1">
                      {t.horaires}
                    </p>
                    <p className="text-anthracite font-semibold text-sm leading-relaxed">
                      {(locale === "en" && general.openingHoursEn) || general.openingHoursFr || t.horairesValeur}<br />
                      <span className="text-anthracite/65 font-medium">
                        {t.ferme}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact form */}
            <div>
              <ContactForm dict={{
                nousEcrire:         t.nousEcrire,
                nomComplet:         t.nomComplet,
                adresseEmail:       t.adresseEmail,
                objet:              t.objet,
                message:            t.message,
                prenomNom:          t.prenomNom,
                emailPlaceholder:   t.emailPlaceholder,
                objetPlaceholder:   t.objetPlaceholder,
                messagePlaceholder: t.messagePlaceholder,
                mentionRgpd:        t.mentionRgpd,
                envoyer:            t.envoyer,
                messageEnvoye:      t.messageEnvoye,
                envoyerAutre:       t.envoyerAutre,
                envoiEnCours:       t.envoiEnCours,
                errChamps:          t.errChamps,
                errEmail:           t.errEmail,
                errGeneral:         t.errGeneral,
                errConnexion:       t.errConnexion,
              }} />
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
              {t.contactsSpecialises}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {specificContacts.map((contact) => (
                <div
                  key={contact.role}
                  className="p-8 flex flex-col gap-4 bg-white"
                >
                  <div
                    className="h-0.5 w-10 rounded-full"
                    style={{ background: contact.accent }}
                  />
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                      style={{ color: contact.accent }}
                    >
                      {contact.role}
                    </p>
                    <p className="text-anthracite font-black text-base uppercase leading-snug">
                      {contact.name}
                    </p>
                  </div>

                  <p className="text-anthracite/75 text-xs font-medium leading-relaxed">
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
                <strong style={{ color: VERT, fontWeight: 800 }}>{t.delaiReponse}</strong> — {t.delaiReponseTexte}
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
