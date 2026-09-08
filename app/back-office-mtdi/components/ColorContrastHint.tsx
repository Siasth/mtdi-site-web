"use client";
import { contrastBetween } from "@/lib/color-contrast";

const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";

function Badge({ ratio, label }: { ratio: number; label: string }) {
  const ok = ratio >= 4.5;
  const borderline = !ok && ratio >= 3;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
        ok ? "bg-green-50 text-green-700" : borderline ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
      }`}
      title={ok ? "Contraste conforme (≥ 4.5:1)" : "Contraste insuffisant pour un texte (norme WCAG : 4.5:1 minimum)"}
    >
      {ok ? "✓" : "⚠"} {label} {ratio.toFixed(1)}:1
    </span>
  );
}

/**
 * À placer sous tout sélecteur de couleur personnalisable dans le
 * back-office. Comme cette couleur peut ensuite servir aussi bien de texte
 * sur fond blanc que de fond avec du texte clair ou foncé selon l'endroit du
 * site où elle est utilisée, on affiche les trois cas plutôt que de deviner :
 * l'administrateur voit immédiatement si son choix restera lisible, quel que
 * soit l'usage qui en sera fait.
 */
export function ColorContrastHint({ color }: { color: string }) {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return null;
  const onWhite = contrastBetween(color, WHITE);
  const whiteOn = onWhite; // même paire, "texte sur blanc" et "blanc sur ce fond" sont identiques
  const darkOn = contrastBetween(color, DARK);

  const allFail = onWhite < 4.5 && darkOn < 4.5;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <Badge ratio={onWhite} label="texte sur blanc" />
      <Badge ratio={darkOn} label="fond + texte foncé" />
      <Badge ratio={whiteOn} label="fond + texte blanc" />
      {allFail && (
        <span className="w-full text-[11px] text-red-600 font-medium mt-0.5">
          Cette couleur ne permettra un texte suffisamment lisible dans aucun des cas ci-dessus. Choisissez une teinte plus contrastée (plus foncée ou plus claire).
        </span>
      )}
    </div>
  );
}
