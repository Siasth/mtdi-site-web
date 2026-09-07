// Utilitaire de contraste WCAG 2.1.
//
// Corrige ANO-098 : la page « Directions centrales » choisissait la couleur du
// texte (blanc ou noir) sur le badge de sigle via une liste de 3 couleurs
// codées en dur (`dir.accent === "#EB0000" || ...`). Toute couleur d'accent
// personnalisée créée depuis le back-office (ex. un bleu/teal moyen pour
// « DINELT », « DVITE ») tombait alors dans le cas par défaut « texte noir »,
// même quand le fond était trop sombre pour que ce soit lisible.
//
// Cette fonction calcule le ratio de contraste réel (formule WCAG, luminance
// relative sRGB) entre le fond et chacune des deux options de texte, et
// retourne celle qui offre le meilleur contraste.

function srgbChannelToLinear(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 1; // couleur invalide → on suppose un fond clair
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return 1;
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

const DARK_TEXT = "#1a1a1a";
const LIGHT_TEXT = "#ffffff";

/**
 * Retourne "#ffffff" ou "#1a1a1a", selon la couleur qui offre le meilleur
 * ratio de contraste WCAG avec `bgHex`. À utiliser partout où un texte est
 * posé sur une couleur d'accent dynamique (badges, pastilles, organigramme…).
 */
export function getReadableTextColor(bgHex: string): string {
  const bgLuminance = relativeLuminance(bgHex);
  const contrastWithWhite = contrastRatio(bgLuminance, relativeLuminance(LIGHT_TEXT));
  const contrastWithDark = contrastRatio(bgLuminance, relativeLuminance(DARK_TEXT));
  return contrastWithWhite >= contrastWithDark ? LIGHT_TEXT : DARK_TEXT;
}
