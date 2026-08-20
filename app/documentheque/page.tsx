"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const categories = [
  { label: "Tous", value: "all" },
  { label: "Stratégies", value: "stratégie" },
  { label: "Rapports", value: "rapport" },
  { label: "Guides", value: "guide" },
  { label: "Textes juridiques", value: "juridique" },
];

const documents = [
  // Octobre 2025
  {
    title: "Plan d'Engagement Environnemental et Social (PEES) : WARDIP",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "Octobre 2025",
    size: "PDF",
    description:
      "Plan d'Engagement Environnemental et Social dans le cadre du projet WARDIP (West Africa Regional Digital Intégration Program).",
    href: "https://innovation.gouv.bj/assets/documents/pees-version-d'octobre-2025-publie_bm.pdf",
    featured: false,
  },
  {
    title: "Plan de Gestion de la Main-d'œuvre (PGMO) : WARDIP",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "Octobre 2025",
    size: "PDF",
    description:
      "Plan de Gestion de la Main-d'œuvre dans le cadre du projet WARDIP.",
    href: "https://innovation.gouv.bj/assets/documents/pgmo-version-d'octobre-2025-publie_bm.pdf",
    featured: false,
  },
  {
    title: "Plan de Mobilisation des Parties Prenantes (PMPP) incluant le MGP : WARDIP",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "Octobre 2025",
    size: "PDF",
    description:
      "Plan de Mobilisation des Parties Prenantes incluant le Mécanisme de Gestion des Plaintes dans le cadre du projet WARDIP.",
    href: "https://innovation.gouv.bj/assets/documents/pmpp-version-d'octobre-2025-publie_bm.pdf",
    featured: false,
  },
  // 2025
  {
    title: "Résultats de la sélection dans le cadre de la participation du Bénin aux OIIA 2025",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "2025",
    size: "PDF",
    description:
      "Résultats de la sélection des candidats béninois pour la participation aux Olympiades Internationales d'Intelligence Artificielle 2025.",
    href: "https://innovation.gouv.bj/assets/documents/resultats-de-la-selection-dans-le-cadre-de-la-participation-du-benin-aux-oiia-2025.pdf",
    featured: false,
  },
  // 2024
  {
    title: "Magazine Bénin Numérique N°3",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "2024",
    size: "PDF",
    description:
      "Troisième édition du magazine Bénin Numérique.",
    href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique---n0003.pdf",
    featured: false,
  },
  {
    title: "Liste des Fournisseurs de Services de Sécurité Numérique qualifiés en République du Bénin",
    type: "PDF",
    typeColor: ROUGE,
    category: "juridique",
    date: "2024",
    size: "PDF",
    description:
      "Liste officielle des fournisseurs de services de sécurité numérique qualifiés en République du Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/liste-des-fournisseurs-de-services-de-securite-numerique-qualifies-en-republique-du-benin.pdf",
    featured: false,
  },
  {
    title: "Rapport de vulnérabilités et d'incidents du cyberespace béninois",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "2024",
    size: "PDF",
    description:
      "Rapport sur les vulnérabilités et incidents de sécurité relevés dans le cyberespace béninois.",
    href: "https://innovation.gouv.bj/assets/documents/rapport-de-vulnerabilites-et-d'incidents-du-cyberespace-beninois.pdf",
    featured: false,
  },
  // Octobre 2023
  {
    title: "Magazine Bénin Numérique N°2",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "Octobre 2023",
    size: "PDF",
    description:
      "Deuxième édition du magazine Bénin Numérique : actualités, innovations et avancées du secteur numérique.",
    href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique---n0002---octobre-2023-1698406338.pdf",
    featured: false,
  },
  {
    title: "Référentiel des exigences relatives à la qualification des fournisseurs de services de sécurité numérique en République du Bénin",
    type: "PDF",
    typeColor: ROUGE,
    category: "juridique",
    date: "Octobre 2023",
    size: "PDF",
    description:
      "Référentiel définissant les exigences pour la qualification des fournisseurs de services de sécurité numérique au Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/referentiel-des-exigences-relatives-a-la-qualification-des-fournisseurs-de-services-de-securite-numerique-en-republique-du-benin-1698397466.pdf",
    featured: false,
  },
  // 2023
  {
    title: "Stratégie Nationale d'Intelligence Artificielle et des Mégadonnées 2023-2027",
    type: "PDF",
    typeColor: ROUGE,
    category: "stratégie",
    date: "2023",
    size: "PDF",
    description:
      "Feuille de route officielle pour le développement de l'intelligence artificielle et des mégadonnées au Bénin sur la période 2023-2027.",
    href: "https://innovation.gouv.bj/assets/documents/strategie-nationale-d'intelligence-artificielle-et-des-megadonnees-2023-2027.pdf",
    featured: true,
  },
  {
    title: "National Artificial Intelligence and Big Data Strategy",
    type: "PDF",
    typeColor: ROUGE,
    category: "stratégie",
    date: "2023",
    size: "PDF",
    description:
      "English version of Bénin's National Artificial Intelligence and Big Data Strategy.",
    href: "https://innovation.gouv.bj/assets/documents/national-artificial-intelligence-and-big-data-strategy-1682673348.pdf",
    featured: true,
  },
  {
    title: "Magazine Bénin Numérique N°1",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "2023",
    size: "PDF",
    description:
      "Première édition du magazine Bénin Numérique : bilan, projets et perspectives du numérique au Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique_.pdf",
    featured: false,
  },
  {
    title: "Règles de politique de protection des infrastructures d'information critiques en République du Bénin",
    type: "PDF",
    typeColor: ROUGE,
    category: "juridique",
    date: "2023",
    size: "PDF",
    description:
      "Document définissant les règles de protection des infrastructures d'information critiques de la République du Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/regles-de-politique-de-protection-des-infrastructures-dinformation-critiques-en-republique-du-benin.pdf",
    featured: false,
  },
  {
    title: "État des lieux de l'écosystème digital et de l'entrepreneuriat numérique au Bénin",
    type: "PDF",
    typeColor: ROUGE,
    category: "rapport",
    date: "2023",
    size: "PDF",
    description:
      "Rapport sur l'état de l'écosystème digital et de l'entrepreneuriat numérique en République du Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/rapport_etat-de-l'ecosysteme-et-de-l'entrepreneuriat-numerique-au-benin.pdf",
    featured: false,
  },
  {
    title: "Guide de l'Entrepreneur Digital : Bénin",
    type: "PDF",
    typeColor: ROUGE,
    category: "guide",
    date: "2023",
    size: "PDF",
    description:
      "Guide pratique à destination des entrepreneurs du numérique au Bénin.",
    href: "https://innovation.gouv.bj/assets/documents/guide-entrepreneur-digital-ctd-2023.pdf",
    featured: false,
  },
];

export default function DocumenthequePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? documents
    : documents.filter((d) => d.category === activeCategory);

  const featured = filtered.filter((d) => d.featured);
  const others = filtered.filter((d) => !d.featured);

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section
          className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 overflow-hidden"
          style={{ background: VERT }}
        >
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-6">
              Ressources · Publications officielles
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              <span style={{ color: JAUNE }}>Documenthèque</span>
            </h1>
            <p className="mt-8 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              Accédez aux documents officiels du Ministère de la Transformation Digitale et de
              l'Innovation : stratégies nationales, rapports annuels, guides techniques et textes juridiques.
            </p>
          </div>
        </section>

        {/* Filter */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
                style={{
                  background: activeCategory === cat.value ? VERT : "rgba(0,0,0,0.04)",
                  color: activeCategory === cat.value ? "white" : "rgba(26,26,26,0.50)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured documents */}
        {featured.length > 0 && <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Documents essentiels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {featured.map((doc) => (
                <div
                  key={doc.title}
                  className="group p-8 sm:p-10 bg-white hover:bg-gris-perle transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white"
                      style={{ background: doc.typeColor }}
                    >
                      {doc.type}
                    </span>
                    <span className="text-xs font-bold text-anthracite/40">
                      {doc.date}
                    </span>
                    <span className="text-xs font-medium text-anthracite/30">
                      {doc.size}
                    </span>
                  </div>
                  <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-4">
                    {doc.title}
                  </h3>
                  <p className="text-anthracite/50 text-sm font-medium leading-relaxed group-hover:text-anthracite/70 transition-colors flex-1">
                    {doc.description}
                  </p>
                  <Link
                    href={doc.href}
                    target={doc.href.startsWith("http") ? "_blank" : undefined}
                    className="mt-6 inline-flex items-center gap-3 px-6 py-3 text-sm font-black uppercase tracking-wider transition-all hover:gap-5 self-start"
                    style={{ background: VERT, color: "white" }}
                  >
                    Télécharger
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* All documents */}
        {others.length > 0 && <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Tous les documents
            </h2>
            <div className="flex flex-col gap-0">
              {others.map((doc, i) => {
                return (
                  <div
                    key={doc.title}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 py-7"
                    style={{ borderBottom: i < others.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                  >
                    <div className="flex-shrink-0 flex items-center gap-3 sm:w-40">
                      <span
                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white"
                        style={{ background: doc.typeColor }}
                      >
                        {doc.type}
                      </span>
                      <span className="text-xs font-bold text-anthracite/40 tabular-nums">
                        {doc.date}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-2">
                        {doc.title}
                      </h3>
                      <p className="text-anthracite/50 text-sm font-medium leading-relaxed mb-3">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-anthracite/30">
                          {doc.size}
                        </span>
                        <Link
                          href={doc.href}
                          target={doc.href.startsWith("http") ? "_blank" : undefined}
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:gap-3"
                          style={{ color: VERT }}
                        >
                          Télécharger
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>}

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                Consultez le cadre<br />juridique
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                Lois · Décrets · Arrêtés · Textes réglementaires
              </p>
            </div>
            <Link
              href="/textes-juridiques"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              Textes juridiques
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
