// Utilitaire partagé pour les champs "durée" du back-office (temps de lecture
// des actualités, durée des vidéos...).
//
// ANO-139 / ANO-143 : ces champs étaient un simple texte libre mélangeant
// valeur et unité (ex. "3 min"), ce qui permettait des saisies incohérentes.
// On les scinde en deux contrôles distincts (nombre + unité) côté formulaire,
// tout en conservant le même format de chaîne en base de données (pas de
// migration de schéma nécessaire) : parseDuration()/formatDuration() font
// l'aller-retour entre les deux représentations.

export type DurationUnit = { value: string; label: string };

export const READ_TIME_UNITS: DurationUnit[] = [
  { value: "min", label: "min" },
  { value: "h", label: "h" },
];

export const VIDEO_DURATION_UNITS: DurationUnit[] = [
  { value: "sec", label: "secondes" },
  { value: "min", label: "minutes" },
  { value: "h", label: "heures" },
];

export function parseDuration(raw: string, units: DurationUnit[]): { amount: string; unit: string } {
  const defaultUnit = units[0].value;
  const match = (raw || "").trim().match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Zéà]*)/);
  if (!match) return { amount: "", unit: defaultUnit };
  const amount = match[1].replace(",", ".");
  const rawUnit = (match[2] || "").toLowerCase();
  const found = units.find((u) => rawUnit.startsWith(u.value) || u.label.toLowerCase().startsWith(rawUnit));
  return { amount, unit: found ? found.value : defaultUnit };
}

export function formatDuration(amount: string, unit: string): string {
  if (!amount) return "";
  return `${amount} ${unit}`;
}
