"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import fr from "../../../dictionaries/fr.json";
import en from "../../../dictionaries/en.json";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const VERT_BENIN = "#006828";

type SearchEntry = {
  title: string;
  description: string;
  category: "Actualités" | "Pages" | "Rubriques";
  href: string;
};
type ScoredEntry = SearchEntry;

const CATEGORIES = ["Actualités", "Pages", "Rubriques"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_COLORS: Record<Category, string> = {
  "Actualités": VERT,
  "Pages": VERT_BENIN,
  "Rubriques": "#374151",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const prefix = locale === "en" ? "/en" : "";
  const t = locale === "en" ? en.recherche : fr.recherche;

  const initialQ = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<ScoredEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setInputValue(q);
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) { setResults([]); return; }
    setSearching(true);
    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setResults(d); setSearching(false); })
      .catch(() => setSearching(false));
    return () => controller.abort();
  }, [query, locale]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    setQuery(trimmed);
    if (trimmed) {
      router.replace(`${prefix}/recherche?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.replace(`${prefix}/recherche`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  const grouped = CATEGORIES.reduce<Record<Category, ScoredEntry[]>>(
    (acc, cat) => { acc[cat] = results.filter((r) => r.category === cat); return acc; },
    { "Actualités": [], "Pages": [], "Rubriques": [] }
  );
  const hasResults = results.length > 0;
  const hasQuery = query.trim().length > 0;

  const labelRechercher = t.rechercher;
  const labelPlaceholder = t.placeholder;

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white mb-8">
              {t.titre}
            </h1>
            <form onSubmit={handleSubmit} className="flex items-stretch max-w-2xl">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/75 pointer-events-none"
                  width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={labelPlaceholder}
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 text-base bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-colors"
                  aria-label={labelPlaceholder}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 text-sm font-black uppercase tracking-wider transition-colors"
                style={{ background: JAUNE, color: "#1A1A1A" }}
              >
                {labelRechercher}
              </button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-64">
          <div className="max-w-7xl mx-auto">

            {hasQuery && !searching && (
              <p className="text-sm text-gray-500 mb-8">
                {hasResults
                  ? `${results.length} ${results.length > 1 ? t.resultatsPluriel : t.resultats} ${t.pour} ${query} »`
                  : `${t.aucunResultatPour} ${query} »`}
              </p>
            )}

            {hasQuery && searching && (
              <p className="text-sm text-gray-400 mb-8">{locale === "en" ? "Searching…" : "Recherche en cours…"}</p>
            )}

            {hasQuery && !searching && !hasResults && (
              <div className="text-center py-20">
                <svg className="mx-auto mb-6 text-gray-300" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p className="text-xl font-semibold text-gray-400 mb-2">
                  {t.aucunResultat}
                </p>
                <p className="text-sm text-gray-400">
                  {t.essayezAutres}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {[
                    { label: t.lienActualites, href: `${prefix}/actualites` },
                    { label: t.lienMinistere, href: `${prefix}/le-ministere/le-ministre` },
                    { label: t.lienContact, href: `${prefix}/contact` },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!hasQuery && (
              <div className="text-center py-20">
                <p className="text-base text-gray-400">
                  {t.saisissezMotCle}
                </p>
              </div>
            )}

            {hasResults && (
              <div className="space-y-12">
                {CATEGORIES.map((cat) => {
                  const categoryItems = grouped[cat];
                  if (categoryItems.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: CATEGORY_COLORS[cat] }}>
                          {cat}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {categoryItems.length} {categoryItems.length > 1 ? t.resultatsPluriel : t.resultats}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200 border-y border-gray-200">
                        {categoryItems.map((item) => {
                          const isExternal = item.href.startsWith("http");
                          const href = isExternal ? item.href : `${prefix}${item.href}`;
                          return (
                            <article key={item.href + item.title} className="py-5 group">
                              <Link
                                href={href}
                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="block"
                              >
                                <h2 className="text-base font-semibold mb-1 group-hover:underline transition-all" style={{ color: VERT }}>
                                  {item.title}
                                  {isExternal && (
                                    <svg className="inline-block ml-1.5 -mt-0.5 text-gray-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                                    </svg>
                                  )}
                                </h2>
                                {item.description && (
                                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                )}
                              </Link>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

export default function RecherchePage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
