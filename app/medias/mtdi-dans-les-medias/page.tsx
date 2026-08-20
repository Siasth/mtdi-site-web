"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const filters = ["Tous", "Médias"];

const items = [
  {
    type: "Médias",
    typeColor: ROUGE,
    typeText: "white",
    title: "MTDI sur Instagram : Reel 1",
    date: "2026",
    source: "Instagram",
    excerpt: "Découvrez les activités du Ministère de la Transformation Digitale et de l'Innovation en vidéo sur Instagram.",
    url: "https://www.instagram.com/reel/DankF6VCOFa/",
  },
  {
    type: "Médias",
    typeColor: ROUGE,
    typeText: "white",
    title: "MTDI sur Instagram : Reel 2",
    date: "2026",
    source: "Instagram",
    excerpt: "Suivez les dernières actualités du MTDI sur les réseaux sociaux.",
    url: "https://www.instagram.com/reel/DY4oIfrNjKh/",
  },
  {
    type: "Médias",
    typeColor: JAUNE,
    typeText: "#1A1A1A",
    title: "MTDI sur YouTube : Interview et reportage",
    date: "2026",
    source: "YouTube",
    excerpt: "Retrouvez les interviews et reportages du Ministère de la Transformation Digitale et de l'Innovation.",
    url: "https://www.youtube.com/watch?v=MXxdVtomLJM",
  },
];

export default function MTDIDansLesMediasPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered = activeFilter === "Tous"
    ? items
    : items.filter((item) => item.type === activeFilter);

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
              MTDI dans les médias
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Réseaux sociaux · Couverture presse
            </p>
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

        {/* Média items list */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gris-perle">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {filtered.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white hover:bg-gris-perle transition-colors p-6 sm:p-8 block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                    {/* Left: badge + date */}
                    <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 sm:w-44">
                      <span
                        className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                        style={{
                          background: item.typeColor,
                          color: item.typeText,
                        }}
                      >
                        {item.type}
                      </span>
                      <span className="text-anthracite/40 text-xs font-medium">
                        {item.date}
                      </span>
                    </div>

                    {/* Right: content */}
                    <div className="flex-1">
                      <h2 className="text-anthracite font-black text-base sm:text-lg leading-snug uppercase group-hover:text-anthracite/80 transition-colors mb-3">
                        {item.title}
                      </h2>
                      <p className="text-anthracite/55 text-sm leading-relaxed mb-4">
                        {item.excerpt}
                      </p>
                      <div
                        className="flex items-center justify-between pt-4"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <span className="text-anthracite/30 text-[10px] font-semibold uppercase tracking-wider">
                          {item.source}
                        </span>
                        <span
                          className="text-xs font-black uppercase tracking-widest transition-all"
                          style={{ color: VERT }}
                        >
                          Voir →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
