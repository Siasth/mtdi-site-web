// Échappe le HTML pour toute valeur saisie par un visiteur avant de
// l'injecter dans un corps d'email HTML ou tout autre contexte HTML brut.
// Sans ça, un nom ou un message contenant des balises (ex: "<img
// src=x onerror=...>") s'exécuterait dans le client mail du destinataire —
// injection HTML/XSS via email.
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Retire les retours à la ligne d'une valeur destinée à un en-tête d'email
// (sujet, from...) — évite toute tentative d'injection d'en-têtes SMTP.
export function sanitizeHeaderValue(str: string): string {
  return str.replace(/[\r\n]+/g, " ").trim();
}
