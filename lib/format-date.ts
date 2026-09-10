// ANO-088 : les dates du module Direct étaient affichées au format technique
// ISO brut ("2026-08-31T14:32:00.000Z") au lieu d'un format lisible.

export function formatDateTime(isoString: string, locale: "fr" | "en"): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  if (locale === "en") {
    const datePart = date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${datePart} at ${timePart}`;
  }

  const datePart = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  // "14 h 32" plutôt que "14:32" : format d'heure usuel en français.
  const timePart = date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", " h ");
  return `${datePart} à ${timePart}`;
}
