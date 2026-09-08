"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type HomeDict = Record<string, string>;

export default function Newsletter({ dict }: { dict?: HomeDict }) {
  const d = dict ?? {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError(d.champRequis ?? "Veuillez remplir tous les champs.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(d.emailInvalide ?? "Adresse email invalide (ex : nom@domaine.bj).");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || (d.erreurEnvoi ?? "Une erreur est survenue. Veuillez réessayer."));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(d.erreurEnvoi ?? "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20" style={{ background: "#006828" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {!submitted ? (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase leading-tight mb-4">
              {d.restezInforme ?? "Restez informé"}
            </h2>
            <p className="text-white/80 font-medium mb-8 text-lg leading-relaxed">
              {d.newsletterDesc ?? "Recevez les actualités du Ministère directement dans votre boîte mail."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <label htmlFor="newsletter-name" className="sr-only">{d.nomPrenom ?? "Nom Prénoms"}</label>
              <input
                id="newsletter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={d.nomPrenom ?? "Nom Prénoms"}
                required
                className="flex-1 px-4 py-3.5 rounded-sm text-sm font-medium bg-white text-anthracite placeholder-anthracite/60 focus:outline-none"
              />
              <label htmlFor="newsletter-email" className="sr-only">{d.adresseEmail ?? "Adresse email"}</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={d.adresseEmail ?? "Mail"}
                required
                className="flex-1 px-4 py-3.5 rounded-sm text-sm font-medium bg-white text-anthracite placeholder-anthracite/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3.5 font-bold text-sm uppercase tracking-wider rounded-sm transition-all hover:opacity-90 whitespace-nowrap disabled:opacity-60"
                style={{ background: "#0E0E0E", color: "white" }}
              >
                {submitting ? (d.envoiEnCours ?? "Envoi…") : (d.sabonner ?? "S'abonner")}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-sm font-semibold text-white bg-black/30 px-4 py-2 rounded-sm" role="alert">
                {error}
              </p>
            )}

            <p className="mt-4 text-white/80 text-xs font-medium">
              {d.donneesProtegees ?? "Vos données sont protégées conformément à la loi n°2017-20 sur la protection des données personnelles au Bénin."}
            </p>
          </>
        ) : (
          <div className="py-8" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white uppercase mb-2">
              {d.estAbonne ?? "Vous êtes abonné !"}
            </h3>
            <p className="text-white/70 font-medium">
              {d.recevrezActualites ?? "Vous recevrez bientôt les dernières actualités du Ministère."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
