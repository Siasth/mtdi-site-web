"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const VERT = "#006828";
const VERT_DARK = "#162233";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"password" | "code">("password");
  const [maskedEmail, setMaskedEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/back-office-mtdi";
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        router.push(redirect);
      } else if (res.ok && data.requireCode) {
        setStep("code");
        setMaskedEmail(data.email);
        setLoading(false);
        setTimeout(() => codeRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || "Erreur de connexion");
        setLoading(false);
      }
    } catch {
      setError("Erreur serveur inattendue. Réessayez.");
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length === 6) {
      submitCode(pasted);
    } else {
      codeRefs.current[pasted.length]?.focus();
    }
  };

  const submitCode = async (fullCode: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        router.push(redirect);
      } else {
        setError(data.error || "Code invalide");
        setCode(["", "", "", "", "", ""]);
        setLoading(false);
        setTimeout(() => codeRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Erreur serveur inattendue. Réessayez.");
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.requireCode) {
      setError("");
      setCode(["", "", "", "", "", ""]);
      setLoading(false);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } else {
      setError(data.error || "Erreur lors du renvoi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: VERT_DARK }}>
      {/* Left : branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, rgba(0,104,40,0.4) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative">
          <div className="relative h-12 w-64">
            <Image
              src="/mtdi-banner.png"
              alt="MTDI"
              fill
              sizes="256px"
              className="object-contain object-left"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-black text-white uppercase leading-tight mb-4">
            Back-office
            <br />
            <span style={{ color: "#FFBE00" }}>MTDI</span>
          </h1>
          <p className="text-white/80 text-sm font-medium max-w-sm leading-relaxed">
            Espace d'administration et de gestion du site du Ministère de la
            Transformation Digitale et de l'Innovation de la République du Bénin.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
              Accès réservé
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>

      {/* Right : login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <div className="relative h-10 w-56 mx-auto mb-4">
              <Image
                src="/mtdi-banner.png"
                alt="MTDI"
                fill
                sizes="224px"
                className="object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Back-office
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {step === "password" ? (
              <>
                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="22" height="22" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Connexion</h2>
                  <p className="text-sm text-gray-400 mt-1">Connectez-vous pour accéder au back-office</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="prenom.nom@gouv.bj"
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/10 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="Entrez le mot de passe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/10 transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                      <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                      </svg>
                      <p className="text-sm font-medium text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white rounded-lg transition-all disabled:opacity-40"
                    style={{ background: VERT }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                        </svg>
                        Vérification...
                      </span>
                    ) : (
                      "Continuer"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${VERT}14` }}
                  >
                    <svg width="22" height="22" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Vérification</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Un code à 6 chiffres a été envoyé à <strong className="text-gray-600">{maskedEmail}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Code de vérification
                    </label>
                    <div className="flex gap-2 justify-between" onPaste={handleCodePaste}>
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { codeRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/10 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                      <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                      </svg>
                      <p className="text-sm font-medium text-red-600">{error}</p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-2">
                      <svg className="animate-spin h-5 w-5 text-green-700" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => { setStep("password"); setError(""); setCode(["", "", "", "", "", ""]); }}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={resendCode}
                      disabled={loading}
                      className="text-xs font-semibold text-green-700 hover:text-green-900 transition-colors disabled:opacity-40"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-center mt-6 text-white/60 text-[10px] font-medium uppercase tracking-widest">
            République du Bénin
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
