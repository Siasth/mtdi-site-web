"use client";

import { useState } from "react";

const VERT  = "#162233";
const ROUGE = "#EB0000";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type Dict = {
  sinscrire: string;
  nomComplet: string;
  adresseEmail: string;
  centresInteret: string;
  privacyNote: string;
  sinscrireBtn: string;
  nomPlaceholder: string;
  emailPlaceholder: string;
  inscriptionReussie: string;
  merciInscription: string;
  nouvelleInscription: string;
  erreurInscription: string;
};

const interests = [
  { id: "ia",             label: "Intelligence Artificielle" },
  { id: "eservices",      label: "E-services publics" },
  { id: "cybersecurite",  label: "Cybersécurité" },
  { id: "innovation",     label: "Innovation & Startups" },
];

export default function NewsletterForm({ dict }: { dict: Dict }) {
  const t = dict;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [checkedInterests, setCheckedInterests] = useState<string[]>([]);

  function toggleInterest(id: string) {
    setCheckedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name  = (form.elements.namedItem("name")  as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const website = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    if (!name || !email) {
      setErrMsg(t.erreurInscription);
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setErrMsg(t.erreurInscription);
      return;
    }

    setErrMsg("");
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interests: checkedInterests, website }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const json = await res.json().catch(() => ({}));
        setErrMsg((json as { error?: string }).error ?? t.erreurInscription);
        setStatus("error");
      }
    } catch {
      setErrMsg(t.erreurInscription);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
          {t.sinscrire}
        </h2>
        <div
          className="p-8 flex flex-col gap-3"
          style={{ background: `${VERT}0f`, border: `1px solid ${VERT}40` }}
          role="status"
          aria-live="polite"
        >
          <svg width="24" height="24" fill="none" stroke={VERT} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="text-anthracite font-black text-sm uppercase">{t.inscriptionReussie}</p>
          <p className="text-anthracite/75 text-sm font-medium">{t.merciInscription}</p>
          <button
            onClick={() => { setStatus("idle"); setCheckedInterests([]); }}
            className="mt-2 text-xs font-black uppercase tracking-widest self-start"
            style={{ color: VERT }}
          >
            {t.nouvelleInscription}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
        {t.sinscrire}
      </h2>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
          <label htmlFor="newsletter-website">Site web</label>
          <input type="text" id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="nl-name" className="text-[10px] font-black uppercase tracking-widest text-anthracite/70">
              {t.nomComplet}
            </label>
            <input
              id="nl-name" name="name" type="text" required
              placeholder={t.nomPlaceholder}
              className="px-4 py-3.5 text-sm font-medium outline-none text-anthracite"
              style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="nl-email" className="text-[10px] font-black uppercase tracking-widest text-anthracite/70">
              {t.adresseEmail}
            </label>
            <input
              id="nl-email" name="email" type="email" required
              placeholder={t.emailPlaceholder}
              className="px-4 py-3.5 text-sm font-medium outline-none text-anthracite"
              style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
            />
          </div>
        </div>

        {/* Interests */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-[10px] font-black uppercase tracking-widest text-anthracite/70">
            {t.centresInteret}
          </legend>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {interests.map((interest) => (
              <label key={interest.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="interests"
                  value={interest.id}
                  checked={checkedInterests.includes(interest.id)}
                  onChange={() => toggleInterest(interest.id)}
                  className="sr-only"
                />
                <span
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{
                    border: `1.5px solid ${checkedInterests.includes(interest.id) ? VERT : "rgba(0,0,0,0.20)"}`,
                    background: checkedInterests.includes(interest.id) ? VERT : "transparent",
                  }}
                  aria-hidden="true"
                >
                  {checkedInterests.includes(interest.id) && (
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-medium text-anthracite/70">{interest.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-[10px] font-medium text-anthracite/65">{t.privacyNote}</p>

        {(status === "error" || errMsg) && (
          <p
            className="text-xs font-semibold px-4 py-3"
            style={{ background: `${ROUGE}10`, color: ROUGE, border: `1px solid ${ROUGE}30` }}
            role="alert"
          >
            {errMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start disabled:opacity-60"
          style={{ background: VERT }}
        >
          {status === "loading" ? "…" : t.sinscrireBtn}
          {status !== "loading" && (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
