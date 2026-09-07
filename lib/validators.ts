// Validateurs partagés pour les formulaires du back-office.
//
// ANO-119 : le type="email" natif HTML n'exige pas de point dans la partie
// domaine (ex. "a@a" est accepté par la validation native du navigateur).
// isValidEmail() applique une règle plus stricte : "quelque-chose@quelque-chose.tld".
//
// ANO-118 : les champs de lien n'appliquaient pas de validation systématique du
// format d'URL. isValidUrl() vérifie qu'il s'agit bien d'une URL http(s) valide.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidUrl(value: string, opts: { allowEmpty?: boolean } = {}): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return opts.allowEmpty ?? false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Pattern HTML utilisable directement sur un <input pattern="...">, pour un
// retour visuel immédiat (bulle de validation native) en plus du contrôle JS.
export const EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
export const URL_PATTERN = "^https?://.+";
