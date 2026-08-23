"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import fr from "../../../dictionaries/fr.json";
import en from "../../../dictionaries/en.json";

const VERT = "#006828";
const ROUGE = "#EB0000";

type GalerieItem = {
  id: number;
  type: "photo" | "video";
  title: string;
  description: string;
  date: string;
  credit?: string;
  collection: string;
};

const COLLECTION_KEYS = [
  "all",
  "evenements",
  "infrastructures",
  "formation",
  "cybersecurite",
  "cooperation",
] as const;

type CollectionKey = typeof COLLECTION_KEYS[number];

const collectionLabels: Record<CollectionKey, { fr: string; en: string }> = {
  all: { fr: "Toutes", en: "All" },
  evenements: { fr: "Événements officiels", en: "Official events" },
  infrastructures: { fr: "Infrastructures", en: "Infrastructure" },
  formation: { fr: "Formation & Jeunesse", en: "Training & Youth" },
  cybersecurite: { fr: "Cybersécurité", en: "Cybersecurity" },
  cooperation: { fr: "Coopération internationale", en: "International cooperation" },
};

const items: GalerieItem[] = [
  {
    id: 1,
    type: "photo",
    title: "Ouverture du Sommet Afrique Digitale 2026",
    description: "Le Ministre de la Transformation Digitale prononce le discours d'ouverture devant les délégations de 32 pays africains réunis à Cotonou.",
    date: "9 juillet 2026",
    credit: "MTDI / Direction de la Communication",
    collection: "evenements",
  },
  {
    id: 2,
    type: "photo",
    title: "Signature du décret portant création de l'ANAI",
    description: "Cérémonie officielle de signature du décret instituant l'Agence Nationale de l'Intelligence Artificielle, en présence du Chef de l'État.",
    date: "11 juillet 2026",
    credit: "Présidence de la République",
    collection: "evenements",
  },
  {
    id: 3,
    type: "video",
    title: "Discours du Ministre — Sommet Afrique Digitale",
    description: "Intervention intégrale du Ministre lors de la session plénière du Sommet, abordant la souveraineté numérique et la stratégie IA du Bénin.",
    date: "9 juillet 2026",
    credit: "MTDI",
    collection: "evenements",
  },
  {
    id: 4,
    type: "photo",
    title: "Cérémonie des vœux au corps diplomatique",
    description: "Le Ministre reçoit les ambassadeurs et représentants d'organisations internationales accrédités au Bénin pour la traditionnelle cérémonie des vœux.",
    date: "15 mai 2026",
    credit: "MTDI / Direction de la Communication",
    collection: "evenements",
  },
  {
    id: 5,
    type: "photo",
    title: "Visite du chantier fibre optique — Parakou",
    description: "Inspection des travaux de déploiement de la dorsale fibre optique nationale reliant Cotonou à Parakou.",
    date: "30 juin 2026",
    credit: "MTDI / Cellule Infrastructures",
    collection: "infrastructures",
  },
  {
    id: 6,
    type: "photo",
    title: "Inauguration du Data Center souverain — Phase 1",
    description: "Première phase du centre de données souverain du Bénin, conçu pour héberger les services publics numériques et les données de l'État.",
    date: "22 juin 2026",
    credit: "MTDI",
    collection: "infrastructures",
  },
  {
    id: 7,
    type: "photo",
    title: "Lancement de MonIdentité.bj — Saison 2",
    description: "Lancement officiel de la deuxième phase du programme d'identité numérique.",
    date: "10 juin 2026",
    credit: "MTDI / Direction de la Communication",
    collection: "infrastructures",
  },
  {
    id: 8,
    type: "photo",
    title: "Remise des diplômes — Digital Academy, Promotion 2026",
    description: "200 jeunes développeurs et data scientists reçoivent leurs certificats de la Digital Academy.",
    date: "5 juillet 2026",
    credit: "MTDI / Digital Academy",
    collection: "formation",
  },
  {
    id: 9,
    type: "photo",
    title: "Hackathon IA étudiants — Université d'Abomey-Calavi",
    description: "48 heures de compétition entre équipes étudiantes pour concevoir des solutions IA appliquées à l'agriculture et à la santé.",
    date: "2 juin 2026",
    credit: "MTDI / Digital Academy",
    collection: "formation",
  },
  {
    id: 10,
    type: "video",
    title: "Présentation de la Stratégie IA 2030 — Assemblée nationale",
    description: "Le Ministre présente aux députés les grandes lignes de la Stratégie Nationale d'Intelligence Artificielle.",
    date: "28 mai 2026",
    credit: "Assemblée nationale du Bénin",
    collection: "formation",
  },
  {
    id: 11,
    type: "photo",
    title: "Déploiement des stations CERT.bj",
    description: "Installation des équipements de surveillance et de réponse aux incidents cybernétiques dans les locaux du CERT national du Bénin.",
    date: "18 juin 2026",
    credit: "MTDI / CERT.bj",
    collection: "cybersecurite",
  },
  {
    id: 12,
    type: "video",
    title: "Forum IA & Éthique — Session plénière UNESCO × Bénin",
    description: "Co-organisé avec l'UNESCO, ce forum réunit chercheurs, responsables politiques et société civile autour des enjeux éthiques de l'IA en Afrique.",
    date: "15 juin 2026",
    credit: "UNESCO / MTDI",
    collection: "cooperation",
  },
  {
    id: 13,
    type: "photo",
    title: "Rencontre avec les startups — Bénin IA Challenge",
    description: "Le Ministre échange avec les 50 startups sélectionnées pour le programme d'accélération national dédié à l'intelligence artificielle.",
    date: "2 juin 2026",
    credit: "MTDI / Direction de l'Innovation",
    collection: "cooperation",
  },
  {
    id: 14,
    type: "video",
    title: "Interview du Ministre — RFI",
    description: "Entretien exclusif avec RFI sur les ambitions numériques du Bénin, la stratégie IA et le positionnement du pays sur la scène continentale.",
    date: "3 juillet 2026",
    credit: "RFI / MTDI",
    collection: "cooperation",
  },
];

const placeholderColors = [
  "#0a2218", "#0D132D", "#1a3020", "#1a1a2a", "#2a1a0a",
  "#0a1a2a", "#1a2a10", "#2a0a1a", "#0f1a2a", "#1a0f1a",
  "#0a2a1a", "#1c0f00", "#0D132D", "#1a0812",
];

export default function GaleriePage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const t = locale === "en" ? en.galerie : fr.galerie;

  const [activeFilter, setActiveFilter] = useState<CollectionKey>("all");
  const [search, setSearch] = useState("");

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const matchesSearch = (item: GalerieItem) => {
    if (!search.trim()) return true;
    const q = normalize(search);
    return (
      normalize(item.title).includes(q) ||
      normalize(item.description).includes(q) ||
      normalize(item.date).includes(q) ||
      (item.credit !== undefined && normalize(item.credit).includes(q))
    );
  };

  const filtered = items
    .filter((item) => activeFilter === "all" || item.collection === activeFilter)
    .filter(matchesSearch);

  // Pagination automatique : n'apparaît que si le seuil est dépassé.
  const PAGE_SIZE = 12;
  const [showAll, setShowAll] = useState(false);
  const visibleFiltered = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  const sections =
    activeFilter === "all"
      ? COLLECTION_KEYS
          .filter((k) => k !== "all")
          .map((k) => ({
            key: k,
            name: collectionLabels[k][locale as "fr" | "en"] ?? collectionLabels[k].fr,
            items: visibleFiltered.filter((item) => item.collection === k),
          }))
          .filter((s) => s.items.length > 0)
      : [{
          key: activeFilter,
          name: collectionLabels[activeFilter][locale as "fr" | "en"] ?? collectionLabels[activeFilter].fr,
          items: visibleFiltered,
        }];

  const resultLabel = filtered.length > 1 ? t.resultatsPluriel : t.resultats;

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "84px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: "#162233" }}>
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

        {/* Search bar */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative" style={{ border: "1.5px solid rgba(0,0,0,0.12)" }}>
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-anthracite/30" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.rechercherPlaceholder}
                aria-label={t.rechercherPlaceholder}
                className="w-full pl-12 pr-4 py-4 text-sm font-medium text-anthracite placeholder-anthracite/30 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-anthracite/80 hover:text-anthracite transition-colors"
                  aria-label={t.effacer}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 sm:px-6 lg:px-8 py-5 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-px overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {COLLECTION_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
                  style={{
                    background: activeFilter === key ? VERT : "rgba(0,0,0,0.04)",
                    color: activeFilter === key ? "white" : "rgba(26,26,26,0.45)",
                  }}
                >
                  {collectionLabels[key][locale as "fr" | "en"] ?? collectionLabels[key].fr}
                </button>
              ))}
            </div>
            <span className="text-anthracite/65 text-xs font-semibold uppercase tracking-widest flex-shrink-0">
              {filtered.length} {resultLabel}
            </span>
          </div>
        </section>

        {/* No results */}
        {filtered.length === 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gris-perle">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-anthracite/65 text-sm font-semibold uppercase tracking-widest mb-2">{t.aucunResultat}</p>
              <p className="text-anthracite/80 text-xs font-medium">{t.essayezAutres}</p>
            </div>
          </section>
        )}

        {/* Gallery sections */}
        <div className="bg-gris-perle">
          {sections.map((section) => (
            <section key={section.key} className="px-4 sm:px-6 lg:px-8 py-12" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-1 rounded-full" style={{ background: VERT }} />
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-anthracite">{section.name}</h2>
                    <span className="text-anthracite/65 text-xs font-bold">{section.items.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
                  {section.items.map((item) => (
                    <div key={item.id} className="group bg-white hover:bg-gris-perle transition-colors">
                      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                        <div className="absolute inset-0" style={{ background: placeholderColors[(item.id - 1) % placeholderColors.length] }}>
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 0%, transparent 65%)" }} />
                        </div>

                        {item.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.4)" }}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "3px" }}>
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}

                        {item.type === "video" && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: ROUGE, color: "white" }}>
                            {t.video}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: VERT }}>
                            {item.type === "video" ? t.video : t.photo}
                          </span>
                          <span className="text-anthracite/25 text-[10px]">·</span>
                          <span className="text-anthracite/65 text-[10px] font-medium">{item.date}</span>
                        </div>
                        <h3 className="text-anthracite font-black text-sm sm:text-base uppercase leading-snug mb-2 group-hover:text-vert-benin transition-colors">{item.title}</h3>
                        <p className="text-anthracite/75 text-sm font-medium leading-relaxed mb-3">{item.description}</p>
                        {item.credit && (
                          <p className="text-anthracite/80 text-[10px] font-semibold uppercase tracking-wider">{item.credit}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {!showAll && filtered.length > PAGE_SIZE && (
          <div className="px-4 sm:px-6 lg:px-8 pb-16 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(26,26,26,0.75)" }}
            >
              {locale === "en" ? "Load more" : "Charger plus"}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </main>

      <Footer locale={locale} />
    </>
  );
}
