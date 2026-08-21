"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const VERT = "#006828";
const VERT_DARK = "#162233";

function LoginForm() {
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
    if (!password) return;

    setLoading(true);
    setError("");

    // MODIFIÉ : tout le bloc fetch est désormais entouré d'un try/catch.
    // Avant, une erreur réseau ou une réponse non-JSON (ex. page d'erreur HTML
    // renvoyée par un crash serveur) provoquait une exception non interceptée,
    // ce qui laissait `loading` bloqué à `true` indéfiniment (spinner infini).
    // Le catch garantit que `setLoading(false)` est toujours appelé.
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // Pas de 2FA → connexion directe
        router.push(redirect);
      } else if (res.ok && data.requireCode) {
        // 2FA activé → passer à l'étape code
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

    // Auto-submit quand les 6 chiffres sont remplis
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

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: fullCode }),
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
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
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
            Interface de gestion du site du Ministère de la Transformation Digitale
            et de l'Innovation : République du Bénin.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-white/20 text-[10px] font-semibold uppercase tracking-widest">
              Accès réservé
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>

      {/* Right : login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
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
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">
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
                  <p className="text-sm text-gray-400 mt-1">Entrez le mot de passe pour accéder au back-office</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/10 transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                      <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                      </svg>