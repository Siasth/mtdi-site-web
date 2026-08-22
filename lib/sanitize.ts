import DOMPurify from "isomorphic-dompurify";

// Assainissement STRICT du HTML produit par l'éditeur riche du back-office,
// avant tout enregistrement en base. Liste blanche volontairement limitée
// aux besoins de l'éditeur (lib/back-office/components/MarkdownEditor.tsx) —
// aucun <script>, aucun attribut on*, aucune iframe.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code", "a",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "style", "colspan", "rowspan"];

export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  }).replace(/style="([^"]*)"/g, (_match, styleContent: string) => {
    const safeDeclarations = styleContent
      .split(";")
      .map((d) => d.trim())
      .filter((d) => /^(color|font-family)\s*:/i.test(d));
    return safeDeclarations.length > 0 ? `style="${safeDeclarations.join("; ")}"` : "";
  });
}
