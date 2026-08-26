"use client";

import { useState } from "react";

const VERT = "#162233";

// Bouton client isolé : capture le conteneur #organigramme-capture (rendu
// côté serveur juste à côté) et génère un PDF A4 paysage à une seule page,
// quelle que soit la largeur réelle du schéma (mise à l'échelle automatique).
export default function OrganigrammeDownloadButton({ label, filename }: { label: string; filename: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    const node = document.getElementById("organigramme-capture");
    if (!node) return;
    setLoading(true);
    setError("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        backgroundColor: "#F5F5F3",
        scale: 2, // netteté correcte à l'impression
        useCORS: true,
        windowWidth: node.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 paysage (mm), avec une marge de 8mm de chaque côté.
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const ratio = Math.min(maxWidth / (canvas.width / 2), maxHeight / (canvas.height / 2));
      const imgWidth = (canvas.width / 2) * ratio;
      const imgHeight = (canvas.height / 2) * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:gap-4 disabled:opacity-50"
        style={{ background: VERT, color: "white" }}
      >
        {loading ? "Génération..." : label}
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
