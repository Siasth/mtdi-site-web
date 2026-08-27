// Politique de mot de passe alignée sur les recommandations actuelles
// (NIST SP 800-63B, OWASP) : priorité à la LONGUEUR plutôt qu'à des règles
// de complexité artificielles (majuscule+chiffre+symbole obligatoires, qui
// mènent souvent à des mots de passe prévisibles comme "Password1!"). Pas
// de rotation forcée non plus — c'est une pratique désormais déconseillée.

export const PASSWORD_MIN_LENGTH = 12;
// bcrypt ignore silencieusement tout au-delà de 72 octets : un mot de passe
// plus long donnerait une fausse impression de sécurité sans réel bénéfice.
export const PASSWORD_MAX_LENGTH = 72;

// Les mots de passe les plus utilisés au monde (палette очень réduite,
// volontairement) : les rejeter capte l'essentiel du risque sans construire
// une vraie liste de fuites de données, hors de portée ici.
const COMMON_PASSWORDS = new Set([
  "123456789012", "password1234", "qwertyuiopas", "azertyuiopqs",
  "administrateur", "administrator", "changeme1234", "motdepasse123",
  "welcome123456", "letmein123456",
]);

export type PasswordCheckResult = { valid: true } | { valid: false; error: string };

// context (optionnel) : email/nom de l'utilisateur, pour refuser un mot de
// passe qui les contiendrait tel quel (trivialement devinable).
export function checkPasswordStrength(password: string, context?: { email?: string; name?: string }): PasswordCheckResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, error: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères.` };
  }
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    return { valid: false, error: "Ce mot de passe est trop courant. Choisissez-en un plus difficile à deviner." };
  }
  // Rejette un mot de passe constitué d'un seul caractère répété, ou d'une
  // séquence purement numérique croissante/décroissante (ex: 123456789012).
  if (/^(.)\1+$/.test(password)) {
    return { valid: false, error: "Le mot de passe ne peut pas être un caractère répété." };
  }
  if (/^(?:0123456789|1234567890|9876543210)+/.test(password.replace(/\s/g, ""))) {
    return { valid: false, error: "Le mot de passe ne peut pas être une suite de chiffres évidente." };
  }
  const localPart = context?.email?.split("@")[0]?.toLowerCase();
  if (localPart && localPart.length >= 4 && lower.includes(localPart)) {
    return { valid: false, error: "Le mot de passe ne doit pas contenir votre adresse email." };
  }
  if (context?.name) {
    const nameParts = context.name.toLowerCase().split(/\s+/).filter((p) => p.length >= 4);
    if (nameParts.some((p) => lower.includes(p))) {
      return { valid: false, error: "Le mot de passe ne doit pas contenir votre nom." };
    }
  }
  return { valid: true };
}
