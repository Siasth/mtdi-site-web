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
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      td: ["colspan", "rowspan", "style"],
      th: ["colspan", "rowspan", "style"],
    },
    // Propriétés CSS conservées, strictement limitées par élément :
    // - color/font-family sur le texte en ligne
    // - text-align sur les paragraphes/titres (alignement de texte)
    // - background-color sur les cellules de tableau (couleur de fond)
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
        "font-family": [/^[a-zA-Z0-9\s,'"-]+$/],
      },
      p: { "text-align": [/^(left|center|right|justify)$/], "line-height": [/^[0-9](\.[0-9]{1,2})?$/], "margin-bottom": [/^[0-9](\.[0-9]{1,2})?em$/] },
      h1: { "text-align": [/^(left|center|right|justify)$/] },
      h2: { "text-align": [/^(left|center|right|justify)$/] },
      h3: { "text-align": [/^(left|center|right|justify)$/] },
      td: { "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/] },
      th: { "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/] },
    },
    // Force tout lien externe à s'ouvrir de façon sûre
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  });
}
