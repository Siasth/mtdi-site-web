"use client";

import { useState, useRef, useCallback } from "react";

const VERT  = "#006828";
const ROUGE = "#EB0000";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type Dict = {
  nousEcrire: string;
  nomComplet: string;
  adresseEmail: string;
  objet: string;
  message: string;
  prenomNom: string;
  emailPlaceholder: string;
  objetPlaceholder: string;
  messagePlaceholder: string;
  mentionRgpd: string;
  envoyer: string;
  messageEnvoye: string;
  envoyerAutre: string;
  envoiEnCours?: string;
  errChamps?: string;
  errEmail?: string;
  errGeneral?: string;
  errConnexion?: string;
};

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(26, 26, 26, 0.88)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        pointerEvents: "none",
      }}
    >
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={ROUGE} strokeWidth="2.5" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ color: "rgba(255,255,255,0.92)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {msg}
      </span>
    </div>
  );
}

export default function ContactForm({ dict }: { dict: Dict }) {
  const t = dict;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [toast, setToast] = useState({ msg: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2000);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value.trim(),
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value.trim(),
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "",
    };

    if (!data.name || !data.email || !data.subject || !data.message) {
      showToast(t.errChamps ?? "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!EMAIL_RE.test(data.email)) {
      showToast(t.errEmail ?? "Adresse email invalide.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const json = await res.json().catch(() => ({}));
        showToast((json as { error?: string }).error ?? (t.errGeneral ?? "Une erreur est survenue."));
        setStatus("error");
      }
    } catch {
      showToast(t.errConnexion ?? "Impossible d'envoyer le message. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
          {t.nousEcrire}
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
          <p className="text-sm font-medium text-anthracite/60">{t.messageEnvoye}</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 text-xs font-black uppercase tracking-widest self-start"
            style={{ color: VERT }}
          >
            {t.envoyerAutre}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: VERT }}>
        {t.nousEcrire}
      </h2>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {/* Pot de miel anti-spam : invisible pour un humain, souvent
            rempli par un bot. Ne jamais retirer aria-hidden/tabIndex=-1. */}
        <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
          <label htmlFor="contact-website">Site web</label>
          <input type="text" id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-anthracite">
              {t.nomComplet}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              placeholder={t.prenomNom}
              className="px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
              style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-anthracite">
              {t.adresseEmail}
            </label>
            <div className="relative">
              <Toast msg={toast.msg} visible={toast.visible} />
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3.5 text-sm font-medium outline-none transition-all text-anthracite"
                style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-subject" className="text-[10px] font-black uppercase tracking-widest text-anthracite">
            {t.objet}
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            placeholder={t.objetPlaceholder}
            className="px-4 py-3.5 text-sm font-medium outline-none text-anthracite"
            style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-anthracite">
            {t.message}
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            placeholder={t.messagePlaceholder}
            className="px-4 py-3.5 text-sm font-medium outline-none resize-none text-anthracite"
            style={{ background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.12)" }}
          />
        </div>

        <p className="text-[10px] font-medium text-anthracite/65">{t.mentionRgpd}</p>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:gap-5 self-start disabled:opacity-60"
          style={{ background: VERT }}
        >
          {status === "loading" ? (t.envoiEnCours ?? "Envoi en cours…") : t.envoyer}
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
