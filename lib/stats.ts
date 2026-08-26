import { sql } from "@/lib/db";

export type StatsMeta = { dateLabel: string; frequencyLabel: string };

const STATS_META_DEFAULTS = {
  dateLabelFr: "Données au 1ᵉʳ juillet 2026",
  dateLabelEn: "Data as of July 1, 2026",
  frequencyFr: "Mise à jour trimestrielle",
  frequencyEn: "Quarterly update",
};

export async function getStatsMeta(locale: "fr" | "en"): Promise<StatsMeta> {
  const result = await sql`SELECT value FROM settings WHERE key = 'stats_meta'`;
  const stored = (result.rows[0]?.value as Record<string, string>) || {};
  const merged = { ...STATS_META_DEFAULTS, ...stored };
  return {
    dateLabel: locale === "en" && merged.dateLabelEn ? merged.dateLabelEn : merged.dateLabelFr,
    frequencyLabel: locale === "en" && merged.frequencyEn ? merged.frequencyEn : merged.frequencyFr,
  };
}

export type StatItem = {
  id: number;
  label: string;
  value: number;
  max: number;
  unit: string;     // déjà résolu : bonne langue + bon singulier/pluriel
  noSpace: boolean; // ex: "%" -> true (pas d'espace), "communes" -> false
  color: string | null; // null = l'alternance vert/jaune par défaut s'applique
};

function pickUnit(
  value: number,
  pluralForm: string,
  singularForm: string | null
): string {
  const useSingular = Math.abs(value) <= 1 && !!singularForm;
  return useSingular ? (singularForm as string) : pluralForm;
}

// Seuls les chiffres actifs (et non supprimés) apparaissent sur le site public.
export async function getPublicStats(locale: "fr" | "en"): Promise<StatItem[]> {
  const result = await sql`
    SELECT id, label_fr, label_en, value, max_value,
           unit, unit_fr_singular, unit_en, unit_en_singular, no_space, color
    FROM stats
    WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY display_order ASC
  `;
  return result.rows.map((r) => {
    const value = Number(r.value);
    const pluralForm = locale === "en" && r.unit_en ? (r.unit_en as string) : ((r.unit as string) || "");
    const singularForm = locale === "en" ? (r.unit_en_singular as string | null) : (r.unit_fr_singular as string | null);
    return {
      id: r.id as number,
      label: (locale === "en" && r.label_en ? r.label_en : r.label_fr) as string,
      value,
      max: Number(r.max_value),
      unit: pickUnit(value, pluralForm, singularForm),
      noSpace: !!r.no_space,
      color: (r.color as string) || null,
    };
  });
}
