"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import fr from "../../../dictionaries/fr.json";
import en from "../../../dictionaries/en.json";

const VERT  = "#006828";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

export default function ActualitesPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const t = locale === "en" ? en.actualites : fr.actualites;
  const prefix = locale === "en" ? "/en" : "";

  const [showAll, setShowAll] = useState(false);

  const filters = [t.tous, t.communiques, t.discours, t.dossiers, t.revuePresse];

  const articles = [
    {
      category: t.communique,
      categoryColor: VERT,
      categoryText: "white",
      title: "Signature du décret portant création de l'Agence Nationale de l'Intelligence Artificielle du Bénin",
      date: "11 juillet 2026",
    },
    {
      category: t.discours,
      categoryColor: JAUNE,
      categoryText: "#1A1A1A",
      title: "Discours du Ministre à l'ouverture du Sommet Afrique Digitale 2026 — Cotonou",
      date: "9 juillet 2026",
    },
    {
      category: t.dossier,
      categoryColor: ROUGE,
      categoryText: "white",
      title: "L'identité numérique au Bénin : MonIdentité.bj, un an après le lancement",
      date: "5 juillet 2026",
    },
    {
      category: t.communique,
      categoryColor: VERT,
      categoryText: "white",
      title: "Déploiement de 2 000 km de fibre optique : 14 communes supplémentaires connectées",
      date: "30 juin 2026",
    },
    {
      category: t.revuePresse,
      categoryColor: JAUNE,
      categoryText: "#1A1A1A",
      title: "Le Bénin cité en modèle de gouvernance numérique par la Banque mondiale",
      date: "24 juin 2026",
    },
    {
      category: t.communique,
      categoryColor: VERT,
      categoryText: "white",
      title: "Lancement du CERT.bj : le Bénin se dote d'un Centre de réponse aux incidents cybernétiques",
      date: "18 juin 2026",
    },
    {
      category: t.discours,
      categoryColor: JAUNE,
      categoryText: "#1A1A1A",
      title: "Participation du Bénin au Forum de l'Internet de la Gouvernance 2026 — Addis-Abeba",
      date: "12 juin 2026",
    },
    {
      category: t.communique,
      categoryColor: VERT,
      categoryText: "white",
      title: "Adoption du projet de loi sur la protection des données personnelles par l'Assemblée nationale",
      date: "5 juin 2026",
    },
    {
      category: t.dossier,
      categoryColor: ROUGE,
      categoryText: "white",
      title: "Cybersécurité : bilan de la première année d'activités du CERT.bj",
      date: "1er juin 2026",
    },
    {
      category: t.revuePresse,
      categoryColor: JAUNE,
      categoryText: "#1A1A1A",
      title: "BBC Afrique : « Le Bénin, laboratoire de la transformation numérique publique »",
      date: "28 mai 2026",
    },
    {
      category: t.communique,
      categoryColor: VERT,
      categoryText: "white",
      title: "Signature du partenariat Bénin–Smart Africa pour l'accélération du haut débit rural",
      date: "22 mai 2026",
    },
    {
      category: t.dossier,
      categoryColor: ROUGE,
      categoryText: "white",
      title: "Transformation digitale de l'administration : 47 services dématérialisés en 18 mois",
      date: "15 mai 2026",
    },
  ];

  const visibleArticles = showAll ? articles : articles.slice(0, 6);

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "84px" }}>
        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-12"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <div
              className="mb-6 w-16 h-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.30)" }}
            />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Filter tabs */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-6 bg-white"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-px overflow-x-auto" role="list" aria-label="Filtrer par catégorie" style={{ scrollbarWidth: "none" }}>
              {filters.map((filter, i) => (
                <span
                  key={filter}
                  role="listitem"
                  className="flex-shrink-0 px-5 py-2.5 text-xs font-black uppercase tracking-widest"
                  aria-current={i === 0 ? "true" : undefined}
                  style={{
                    background: i === 0 ? VERT : "rgba(0,0,0,0.04)",
                    color: i === 0 ? "white" : "rgba(26,26,26,0.65)",
                  }}
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Articles grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {visibleArticles.map((article) => (
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
                    <h2 className="text-anthracite font-black text-base sm:text-lg leading-snug uppercase group-hover:text-anthracite/80 transition-colors">
                      {article.title}
                    </h2>
                  </div>

                  <div
                    className="flex items-center justify-between mt-8 pt-5"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <span className="text-anthracite/80 text-xs font-medium">
                      {article.date}
                    </span>
                    <Link
                      href={`${prefix}/actualites`}
                      className="text-xs font-black uppercase tracking-widest transition-all"
                      style={{ color: VERT }}
                    >
                      {t.lire}
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load more */}
            {!showAll && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest bg-white"
                  style={{ border: "1px solid rgba(0,0,0,0.15)", color: "rgba(26,26,26,0.75)" }}
                >
                  {t.chargerPlus}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
