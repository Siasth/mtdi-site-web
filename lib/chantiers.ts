import { sql } from "@/lib/db";

export type BandType = "TOP" | "MID" | "BOT";
export type Chantier = {
  number: string;
  accent: string;
  bandType: BandType;
  image: string;
  video?: string;
  overlay: string;
  objectPosition: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { value: string; label: string }[];
};

const DEFAULT_ACCENT = "#162233";

// La bande "drapeau" (vert/jaune/rouge) et le dégradé de fond sont un choix
// purement visuel dérivé automatiquement de la position et de la couleur —
// pas du contenu éditorial, donc pas stocké en base : ça évite qu'une
// combinaison mal choisie casse le motif du drapeau béninois.
function computeBandType(index: number, total: number): BandType {
  const third = total / 3;
  if (index < third) return "TOP";
  if (index < third * 2) return "MID";
  return "BOT";
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(22,34,51,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export async function getChantiers(locale: "fr" | "en"): Promise<Chantier[]> {
  const result = await sql`
    SELECT * FROM chantiers
    WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY display_order ASC
  `;
  const rows = result.rows;

  return rows.map((r, i) => {
    const accent = (r.color as string) || DEFAULT_ACCENT;
    const stats = (r.stats as { value: string; labelFr: string; labelEn?: string }[]) || [];
    return {
      number: r.number as string,
      accent,
      bandType: computeBandType(i, rows.length),
      image: r.image as string,
      video: (r.video as string) || undefined,
      overlay: `linear-gradient(135deg, ${hexToRgba(accent, 0.78)} 0%, ${hexToRgba(accent, 0.68)} 100%)`,
      objectPosition: "center center",
      title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
      subtitle: (locale === "en" && r.subtitle_en ? r.subtitle_en : r.subtitle_fr) || "",
      description: (locale === "en" && r.description_en ? r.description_en : r.description_fr) || "",
      stats: stats.map((s) => ({ value: s.value, label: (locale === "en" && s.labelEn ? s.labelEn : s.labelFr) || "" })),
    };
  });
}
