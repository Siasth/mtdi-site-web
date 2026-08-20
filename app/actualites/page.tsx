"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const articles = [
  {
    category: "Communiqué",
    categoryColor: VERT,
    categoryText: "white",
    title: "Olympiades Nationales d'Intelligence Artificielle : les lauréats distingués",
    date: "6 juillet 2026",
    slug: "https://innovation.gouv.bj/publications/actualites/olympiades-nationales-d-intelligence-artificielle-les-laureats-distingues",
  },
  {
    category: "Communiqué",
    categoryColor: JAUNE,
    categoryText: "#1A1A1A",
    title: "Le Bénin lance les Olympiades Nationales d'Intelligence Artificielle pour sélectionner les talents qui représenteront le pays au Kazakhstan",
    date: "27 juin 2026",
    slug: "https://innovation.gouv.bj/publications/actualites/le-benin-lance-les-olympiades-nationales-d-intelligence-arti-cielle-pour-selectionner-les-talents-qui-representeront-le-pays-au-kazakhstan",
  },
  {
    category: "Dossier",
    categoryColor: ROUGE,
    categoryText: "white",
    title: "Deuxième conférence des RSSI : Le Ministre Mahuna AKPLOGAN pose la sécurité numérique au cœur de l'ambition de l'État augmenté",
    date: "26 juin 2026",
    slug: "https://innovation.gouv.bj/publications/actualites/deuxieme-conference-des-rssi-le-ministre-mahuna-akplogan-pose-la-securite-numerique-au-coeur-de-l-ambition-de-l-etat-augmente",
  },
];

const filters = ["Tous", "Communiqué", "Dossier"];

export default function ActualitesPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered = activeFilter === "Tous"
    ? articles
    : articles.filter((a) => a.category === activeFilter);

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>
        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-12"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Actualités
            </h1>
          </div>
        </section>

        {/* Filter tabs */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-6 bg-white"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-px overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
                  style={{
                    background: activeFilter === filter ? VERT : "rgba(0,0,0,0.04)",
                    color: activeFilter === filter ? "white" : "rgba(26,26,26,0.45)",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {filtered.map((article) => (
                <article
                  key={article.title}
                  className="group flex flex-col justify-between p-8 bg-white hover:bg-gris-perle transition-colors"
                  style={{ minHeight: "260px" }}
                >
                  <div>
                    <span
                      className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-5"
                      style={{
                        background: article.categoryColor,
                        color: article.categoryText,
                      }}
                    >
                      {article.category}
                    </span>
                    <h2 className="text-anthracite font-medium text-base sm:text-lg leading-snug group-hover:text-anthracite/80 transition-colors">
                      {article.title}
                    </h2>
                  </div>

                  <div
                    className="flex items-center justify-between mt-8 pt-5"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <span className="text-anthracite/40 text-xs font-medium">
                      {article.date}
                    </span>
                    <Link
                      href={article.slug}
                      className="text-xs font-black uppercase tracking-widest transition-all"
                      style={{ color: VERT }}
                    >
                      Lire →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load more */}
            <div className="mt-10 flex justify-center">
              <Link
                href="https://innovation.gouv.bj/publications/actualites"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all hover:gap-5 bg-white"
                style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(26,26,26,0.5)" }}
              >
                Charger plus d'articles
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
