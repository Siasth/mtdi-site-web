"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import fr from "../../../dictionaries/fr.json";
import en from "../../../dictionaries/en.json";

const VERT       = "#162233";
const VERT_BENIN = "#006828";
const ROUGE      = "#EB0000";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type Status = "idle" | "loading" | "success" | "error";

export default function EcrireAuMinistrePage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const prefix = locale === "en" ? "/en" : "";
  const t = locale === "en" ? en.ecrire : fr.ecrire;

  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name    = (data.get("name")    as string).trim();
    const email   = (data.get("email")   as string).trim();
    const subject = (data.get("subject") as string).trim();
    const message = (data.get("message") as string).trim();

    if (!name || !email || !subject || !message) {
      setErrMsg(t.errChamps);
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setErrMsg(t.errEmail);
      return;
    }

    setErrMsg("");
    setStatus("loading");

    try {
      const res = await fetch("/api/ecrire-au-ministre", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrMsg((json as { error?: string }).error ?? t.errGeneral);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrMsg(t.errConnexion);
      setStatus("error");
    }
  }

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
              <br />
              <span style={{ color: "#FFBE00" }}>{t.titreHighlight}</span>
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Form section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 sm:p-12" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-8">
                {t.intro}
              </p>

              {status === "success" ? (
                <div
                  className="p-8 flex flex-col gap-3"
                  style={{ background: `${VERT_BENIN}0f`, border: `1px solid ${VERT_BENIN}40` }}
                >
                  <svg width="24" height="24" fill="none" stroke={VERT_BENIN} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-sm font-black uppercase tracking-widest" style={{ color: VERT_BENIN }}>
                    {t.messageSent}
                  </p>
                  <p className="text-anthracite/60 text-sm font-medium">
                    {t.messageEnvoye}
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="minister-name" className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                        {t.nomPrenoms}
                      </label>
                      <input
                        id="minister-name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                        placeholder={t.nomPlaceholder}
                      />
                    </div>
                    <div>
                      <label htmlFor="minister-email" className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                        {t.email}
                      </label>
                      <input
                        id="minister-email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                        placeholder={t.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="minister-subject" className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                      {t.objet}
                    </label>
                    <input
                      id="minister-subject"
                      name="subject"
                      type="text"
                      required
                      className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow"
                      placeholder={t.objetPlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="minister-message" className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                      {t.votreMes}
                    </label>
                    <textarea
                      id="minister-message"
                      name="message"
                      required
                      rows={8}
                      className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none focus:ring-2 transition-shadow resize-none"
                      placeholder={t.messagePlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="minister-attachment" className="block text-xs font-black uppercase tracking-widest text-anthracite mb-2">
                      {t.pieceJointe}
                    </label>
                    <input
                      id="minister-attachment"
                      name="attachment"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 text-sm font-medium bg-gris-perle border-0 outline-none text-anthracite/80 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white file:cursor-pointer"
                      style={{ "--tw-file-bg": VERT_BENIN } as React.CSSProperties}
                    />
                    <p className="mt-1.5 text-[10px] text-anthracite/60 font-medium">
                      {t.pieceJointeNote}
                    </p>
                  </div>

                  {(status === "error" || errMsg) && (
                    <p
                      className="text-xs font-semibold px-4 py-3"
                      style={{ background: `${ROUGE}10`, color: ROUGE, border: `1px solid ${ROUGE}30` }}
                      role="alert"
                    >
                      {errMsg || t.errGeneral}
                    </p>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:gap-5 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: VERT_BENIN }}
                    >
                      {status === "loading" ? t.envoi : t.envoyer}
                      {status !== "loading" && (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                    <p className="text-anthracite/60 text-[10px] font-medium leading-relaxed max-w-xs">
                      {t.dataNote}
                    </p>
                  </div>
                </form>
              )}
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
                    {t.autresMoyens}
                  </p>
                  <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
                    {t.autresMoyensDesc}
                    <Link href={`${prefix}/contact`} className="underline hover:text-anthracite transition-colors">
                      {t.contactPage}
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
