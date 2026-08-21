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

interface SearchEntry {
  title: string;
  description: string;
  category: "Actualités" | "Pages" | "Rubriques";
  href: string;
  keywords?: string;
}

const searchIndex: SearchEntry[] = [
  {
    category: "Actualités",
    title: "Olympiades Nationales d'Intelligence Artificielle : les lauréats distingués",
    description: "Les meilleurs jeunes talents béninois en IA ont été sélectionnés lors de la cérémonie du 4 juillet à Sèmè One. Communiqué — 6 juillet 2026.",
    href: "https://www.gouv.bj/article/3579/",
    keywords: "olympiades IA intelligence artificielle talents béninois sèmè",
  },
  {
    category: "Actualités",
    title: "Le Bénin lance les Olympiades Nationales d'IA pour sélectionner les talents qui représenteront le pays au Kazakhstan",
    description: "Première édition des NOAI — sélection pour les Olympiades Internationales d'IA au Kazakhstan du 2 au 8 août 2026. Communiqué — 28 juin 2026.",
    href: "https://www.gouv.bj/article/3565/",
    keywords: "olympiades NOAI intelligence artificielle Kazakhstan IOAI 2026",
  },
  {
    category: "Actualités",
    title: "2ème Conférence des RSSI : le Ministre Akplogan pose la sécurité numérique au cœur de l'ambition de l'État augmenté",
    description: "Sous le thème « IA pour la cybersécurité et cybersécurité pour l'IA ». Dossier — 26 juin 2026.",
    href: "https://www.gouv.bj/article/3560/",
    keywords: "RSSI cybersécurité sécurité numérique Akplogan état augmenté conférence",
  },
  {
    category: "Actualités",
    title: "Mahuna Akplogan nommé Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA",
    description: "Nomination — 25 mai 2026.",
    href: "/actualites",
    keywords: "Akplogan ministre nomination transformation digitale innovation stratégie IA",
  },
  {
    category: "Actualités",
    title: "GPT.bj, le chatbot gouvernemental béninois, remporte le prix Innovation au Gitex Africa",
    description: "Innovation — 2025.",
    href: "/actualites",
    keywords: "GPT.bj chatbot gouvernemental béninois Gitex Africa innovation prix",
  },
  {
    category: "Actualités",
    title: "« J'aime ma langue » : une initiative citoyenne pour intégrer le Fon, le Yoruba et le Bariba dans les modèles d'IA",
    description: "IA & Culture — 2025.",
    href: "/actualites",
    keywords: "langue fon yoruba bariba modèles IA initiative citoyenne culture",
  },
  {
    category: "Pages",
    title: "Le Ministre — Mahuna Akplogan",
    description: "Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA.",
    href: "/le-ministere/le-ministre",
    keywords: "ministre Akplogan biographie profil transformation digitale",
  },
  {
    category: "Pages",
    title: "Missions & Attributions",
    description: "Missions et attributions du Ministère de la Transformation Digitale et de l'Innovation.",
    href: "/le-ministere/missions",
    keywords: "missions attributions ministère rôle objectifs",
  },
  {
    category: "Pages",
    title: "Organigramme du Ministère",
    description: "Organisation interne et hiérarchie du ministère.",
    href: "/le-ministere/organigramme",
    keywords: "organigramme organisation hiérarchie structure interne",
  },
  {
    category: "Pages",
    title: "Directions centrales — DPAF, DSI, DN, DD, DM",
    description: "Présentation des directions centrales : DPAF, DSI, DN, DD, DM.",
    href: "/le-ministere/directions",
    keywords: "directions DPAF DSI DN DD DM centrales administration",
  },
  {
    category: "Pages",
    title: "Cabinet ministériel",
    description: "Composition et rôle du cabinet du Ministre.",
    href: "/le-ministere/cabinet",
    keywords: "cabinet ministériel conseillers directeur cabinet",
  },
  {
    category: "Pages",
    title: "Structures sous tutelle — ASIN, SBIN",
    description: "Agences et structures placées sous la tutelle du ministère : ASIN et SBIN.",
    href: "/le-ministere/structures",
    keywords: "structures tutelle ASIN SBIN agences",
  },
  {
    category: "Pages",
    title: "Partenaires",
    description: "Partenaires institutionnels et techniques du Ministère.",
    href: "/le-ministere/partenaires",
    keywords: "partenaires coopération internationale institutionnel",
  },
  {
    category: "Pages",
    title: "Contact — Coordonnées, Formulaire",
    description: "Nous contacter : coordonnées postales, email, téléphone, et formulaire de contact.",
    href: "/contact",
    keywords: "contact adresse email téléphone formulaire coordonnées",
  },
  {
    category: "Pages",
    title: "Écrire au Ministre",
    description: "Envoyer un message directement au Ministre Mahuna Akplogan.",
    href: "/ecrire-au-ministre",
    keywords: "écrire ministre message courrier lettre",
  },
  {
    category: "Pages",
    title: "Kit Presse",
    description: "Ressources pour les journalistes : logos, photos officielles, fiches biographiques.",
    href: "/kit-presse",
    keywords: "kit presse journaliste logo photo biographie ressources médias",
  },
  {
    category: "Rubriques",
    title: "Actualités — Communiqués, Dossiers",
    description: "Toutes les actualités, communiqués et dossiers du Ministère.",
    href: "/actualites",
    keywords: "actualités communiqué dossier nomination innovation",
  },
  {
    category: "Rubriques",
    title: "Galerie photos",
    description: "Photothèque officielle du Ministère — événements, cérémonies, missions.",
    href: "/galerie",
    keywords: "galerie photos images événements cérémonies",
  },
  {
    category: "Rubriques",
    title: "Vidéothèque",
    description: "Vidéos officielles du Ministère — discours, reportages, événements.",
    href: "/videotheque",
    keywords: "vidéothèque vidéos discours reportages",
  },
  {
    category: "Rubriques",
    title: "Documenthèque",
    description: "Bibliothèque de documents officiels, rapports et publications.",
    href: "/documentheque",
    keywords: "documenthèque documents rapports publications téléchargement",
  },
  {
    category: "Rubriques",
    title: "Stratégie Nationale d'Intelligence Artificielle",
    description: "La vision et la feuille de route du Bénin en matière d'Intelligence Artificielle.",
    href: "/strategie-ia",
    keywords: "stratégie IA intelligence artificielle feuille de route vision Bénin",
  },
  {
    category: "Rubriques",
    title: "En Direct — Événements, Replays",
    description: "Suivez en direct les événements du Ministère et accédez aux replays.",
    href: "/direct",
    keywords: "direct live événements replays diffusion streaming",
  },
  {
    category: "Rubriques",
    title: "Participer — Emplois, Stages, Appels d'offres",
    description: "Offres d'emploi, stages et appels d'offres publiés par le Ministère.",
    href: "/participer",
    keywords: "emplois stages appels offres recrutement opportunités",
  },
];

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

interface ScoredEntry extends SearchEntry { score: number; }

function search(query: string): ScoredEntry[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const results: ScoredEntry[] = [];
  for (const entry of searchIndex) {
    const titleN = normalize(entry.title);
    const descN = normalize(entry.description);
    const kwN = normalize(entry.keywords ?? "");
    const fullText = `${titleN} ${descN} ${kwN}`;
    let score = 0;
    for (const term of terms) {
      if (titleN === q) score += 100;
      if (titleN.startsWith(q)) score += 50;
      if (titleN.includes(q)) score += 30;
      if (titleN.includes(term)) score += 10;
      if (descN.includes(term)) score += 5;
      if (kwN.includes(term)) score += 4;
      if (fullText.includes(term)) score += 2;
    }
    if (score > 0) results.push({ ...entry, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setInputValue(q);
    setQuery(q);
  }, [searchParams]);

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

  const results = search(query);
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

            {hasQuery && (
              <p className="text-sm text-gray-500 mb-8">
                {hasResults
                  ? `${results.length} ${results.length > 1 ? t.resultatsPluriel : t.resultats} ${t.pour} ${query} »`
                  : `${t.aucunResultatPour} ${query} »`}
              </p>
            )}

            {hasQuery && !hasResults && (
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
                                <p className="text-xs text-gray-400 mt-1.5 font-mono">
                                  {isExternal ? item.href : `gouv.bj${item.href}`}
                                </p>
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
