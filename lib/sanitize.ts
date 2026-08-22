import sanitizeHtml from "sanitize-html";

// Assainissement STRICT du HTML produit par l'éditeur riche du back-office,
// avant tout enregistrement en base. Liste blanche volontairement limitée
// aux besoins de l'éditeur (app/back-office-mtdi/components/MarkdownEditor.tsx)
// — aucun <script>, aucun attribut on*, aucune iframe.
//
// Utilise "sanitize-html" (pur Node, sans émulation de navigateur) plutôt
// que "isomorphic-dompurify" (qui s'appuie sur jsdom) : ce dernier a des
// soucis de compatibilité connus dans les fonctions serverless de Vercel.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code", "a",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "span",
];

export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    // Seules les propriétés color/font-family sont conservées dans un style=""
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
        "font-family": [/^[a-zA-Z0-9\s,'"-]+$/],
      },
    },
    // Force tout lien externe à s'ouvrir de façon sûre
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  });
}
