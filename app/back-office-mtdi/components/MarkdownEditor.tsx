"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { contrastBetween } from "@/lib/color-contrast";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader as BaseTableHeader } from "@tiptap/extension-table-header";
import { TableCell as BaseTableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import Paragraph from "@tiptap/extension-paragraph";
import { ListItem as BaseListItem } from "@tiptap/extension-list-item";

// Étend les paragraphes pour supporter interligne et espacement entre
// paragraphes (attributs appliqués comme style CSS inline, conservés par
// l'assainissement côté serveur — voir lib/sanitize.ts).
export const LINE_HEIGHTS = [
  { label: "Normal", value: "" },
  { label: "Compact", value: "1.3" },
  { label: "Confortable", value: "1.6" },
  { label: "Large", value: "1.9" },
  { label: "Très large", value: "2.2" },
];
export const PARAGRAPH_SPACINGS = [
  { label: "Normal", value: "" },
  { label: "Resserré", value: "0.3em" },
  { label: "Confortable", value: "1em" },
  { label: "Large", value: "1.75em" },
];

const ParagraphWithSpacing = Paragraph.extend({
  addAttributes() {
    return {
      lineHeight: {
        default: null,
        parseHTML: (el) => el.style.lineHeight || null,
        // Le style combiné est construit dans renderHTML() ci-dessous, pas
        // ici, pour éviter que deux attributs "style" distincts s'écrasent
        // l'un l'autre au lieu de se combiner.
        renderHTML: () => ({}),
      },
      spacing: {
        default: null,
        parseHTML: (el) => el.style.marginBottom || null,
        renderHTML: () => ({}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const styleParts: string[] = [];
    if (node.attrs.lineHeight) styleParts.push(`line-height: ${node.attrs.lineHeight}`);
    if (node.attrs.spacing) styleParts.push(`margin-bottom: ${node.attrs.spacing}`);
    const attrs = { ...HTMLAttributes };
    if (styleParts.length > 0) attrs.style = styleParts.join("; ");
    return ["p", attrs, 0];
  },
});

// Un item de liste (<li>) n'accepte par défaut qu'un paragraphe comme
// premier bloc ("paragraph block*"). Résultat : appliquer un style de titre
// à la première ligne d'un item numéroté est impossible pour l'éditeur, qui
// éjecte alors la ligne de la liste (perte du numéro) pour respecter le
// schéma. On autorise ici un titre OU un paragraphe en tête de l'item, afin
// de pouvoir composer « 1. Titre + paragraphe » sans quitter la liste ni
// casser la numérotation.
const ListItem = BaseListItem.extend({
  content: "(paragraph | heading) block*",
});

// Étend les cellules pour supporter une couleur de fond personnalisée
// (setCellAttribute("backgroundColor", ...) n'a aucun effet sans ça).
const TableCell = BaseTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
        renderHTML: (attributes: { backgroundColor?: string | null }) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});
const TableHeader = BaseTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
        renderHTML: (attributes: { backgroundColor?: string | null }) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

const CELL_COLORS = ["#e8f5e9", "#fff8e1", "#ffebee", "#e3f2fd", "#f3e5f5", "#eceff1"];

const VERT = "#006828";

// Éditeur riche (TipTap) : stocke du HTML (nécessaire pour représenter
// couleurs, polices, tableaux — impossibles en Markdown pur). Le HTML est
// assaini côté serveur (liste blanche stricte, voir lib/sanitize.ts) avant
// tout enregistrement en base, donc aucun risque d'injection malgré le
// stockage HTML.

const HEADING_OPTIONS = [
  { label: "Paragraphe", level: 0 as const },
  { label: "Titre 1", level: 1 as const },
  { label: "Titre 2", level: 2 as const },
  { label: "Titre 3", level: 3 as const },
];

const TEXT_COLORS = ["#1A1A1A", "#006828", "#EB0000", "#7A5800", "#0369a1", "#7c3aed", "#0891b2"];

const FONT_OPTIONS = [
  { label: "Police par défaut", value: "" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Baskervville", value: "Baskervville, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded transition-colors disabled:opacity-30"
      style={active ? { background: VERT, color: "white" } : { color: "#555" }}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const [showColors, setShowColors] = useState(false);
  const [colorWarning, setColorWarning] = useState(false);
  const [showCellColors, setShowCellColors] = useState(false);

  if (!editor) return null;

  function setHeading(level: 0 | 1 | 2 | 3) {
    if (level === 0) editor!.chain().focus().setParagraph().run();
    else editor!.chain().focus().toggleHeading({ level }).run();
  }

  function currentHeadingLabel() {
    for (const opt of HEADING_OPTIONS) {
      if (opt.level === 0) continue;
      if (editor!.isActive("heading", { level: opt.level })) return opt.label;
    }
    return "Paragraphe";
  }

  function setLink() {
    const previousUrl = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien :", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const inTable = editor.isActive("table");

  return (
    <div className="flex flex-wrap items-center gap-0.5 bg-gray-50 border-b border-gray-200 px-2 py-1.5">
      <select
        value={currentHeadingLabel()}
        onChange={(e) => {
          const opt = HEADING_OPTIONS.find((o) => o.label === e.target.value);
          if (opt) setHeading(opt.level);
        }}
        className="text-xs font-semibold border border-gray-200 rounded px-2 py-1 bg-white mr-1"
      >
        {HEADING_OPTIONS.map((o) => (
          <option key={o.label} value={o.label}>{o.label}</option>
        ))}
      </select>

      <select
        value={(editor.getAttributes("textStyle").fontFamily as string) || ""}
        onChange={(e) => {
          if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
        className="text-xs font-semibold border border-gray-200 rounded px-2 py-1 bg-white mr-1 max-w-[130px]"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>{f.label}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-black text-sm">G</span>
      </ToolbarButton>
      <ToolbarButton title="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic font-bold text-sm">I</span>
      </ToolbarButton>
      <ToolbarButton title="Barré" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through text-sm">S</span>
      </ToolbarButton>
      <ToolbarButton title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <span className="font-mono text-xs">{"</>"}</span>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <div className="relative">
        <ToolbarButton title="Couleur du texte" onClick={() => setShowColors((s) => !s)}>
          <span className="text-sm font-black" style={{ color: (editor.getAttributes("textStyle").color as string) || "#1A1A1A" }}>A</span>
        </ToolbarButton>
        {showColors && (
          <div className="absolute z-10 top-9 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48">
            <div className="flex flex-wrap gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { editor.chain().focus().setColor(c).run(); setColorWarning(false); setShowColors(false); }}
                  className="w-6 h-6 rounded-full border border-black/10"
                  style={{ background: c }}
                  title={c}
                />
              ))}
              <label className="w-6 h-6 rounded-full border border-black/10 cursor-pointer overflow-hidden relative" title="Couleur personnalisée">
                <input
                  type="color"
                  className="absolute -top-1 -left-1 w-8 h-8 cursor-pointer"
                  onChange={(e) => {
                    const c = e.target.value;
                    editor.chain().focus().setColor(c).run();
                    // Le texte sera très probablement lu sur fond blanc sur le
                    // site public : on avertit si ce n'est pas assez lisible,
                    // sans empêcher le choix (usage parfois volontairement
                    // décoratif, ex. sur un fond coloré ailleurs).
                    if (contrastBetween(c, "#FFFFFF") < 4.5) {
                      setColorWarning(true);
                    } else {
                      setColorWarning(false);
                      setShowColors(false);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { editor.chain().focus().unsetColor().run(); setColorWarning(false); setShowColors(false); }}
                className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[10px] text-gray-400"
                title="Réinitialiser"
              >
                ×
              </button>
            </div>
            {colorWarning && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] text-red-600 font-medium leading-snug">
                  Contraste insuffisant sur fond blanc (moins de 4.5:1) : ce texte risque d'être difficile à lire.
                </p>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setColorWarning(false); setShowColors(false); }}
                  className="mt-1 text-[10px] font-semibold text-gray-500 hover:text-gray-700 underline"
                >
                  Conserver quand même
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <span className="text-sm">•</span>
      </ToolbarButton>
      <ToolbarButton title="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <span className="text-xs font-bold">1.</span>
      </ToolbarButton>
      {editor.isActive("orderedList") && (
        <input
          type="number"
          min={1}
          title="Reprendre la numérotation à…"
          // Filet de sécurité : si une liste numérotée doit être interrompue
          // par un élément qui ne peut pas vivre dans un item (image,
          // tableau…), la liste suivante recommence à 1 par défaut (comme en
          // HTML standard). Ce champ permet de corriger manuellement le
          // numéro de reprise sans tout retaper.
          value={(editor.getAttributes("orderedList").start as number | undefined) ?? 1}
          onChange={(e) => {
            const n = Math.max(1, Number(e.target.value) || 1);
            editor.chain().focus().updateAttributes("orderedList", { start: n }).run();
          }}
          className="w-12 text-xs border border-gray-200 rounded px-1 py-1 bg-white text-gray-600"
        />
      )}
      <ToolbarButton title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <span className="text-sm">"</span>
      </ToolbarButton>
      <ToolbarButton title="Lien" active={editor.isActive("link")} onClick={setLink}>
        <span className="text-sm">🔗</span>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Aligner à gauche" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13" strokeLinecap="round" /></svg>
      </ToolbarButton>
      <ToolbarButton title="Centrer" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M5.5 18h13" strokeLinecap="round" /></svg>
      </ToolbarButton>
      <ToolbarButton title="Aligner à droite" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M7 18h13" strokeLinecap="round" /></svg>
      </ToolbarButton>
      <ToolbarButton title="Justifier" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <select
        title="Interligne"
        value={(editor.getAttributes("paragraph").lineHeight as string) || ""}
        onChange={(e) => editor.chain().focus().updateAttributes("paragraph", { lineHeight: e.target.value || null }).run()}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 cursor-pointer"
      >
        {LINE_HEIGHTS.map((o) => <option key={o.label} value={o.value}>Interligne : {o.label}</option>)}
      </select>

      <select
        title="Espacement après le paragraphe"
        value={(editor.getAttributes("paragraph").spacing as string) || ""}
        onChange={(e) => editor.chain().focus().updateAttributes("paragraph", { spacing: e.target.value || null }).run()}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 cursor-pointer"
      >
        {PARAGRAPH_SPACINGS.map((o) => <option key={o.label} value={o.value}>Espacement : {o.label}</option>)}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton
        title="Insérer un tableau"
        onClick={() => {
          const rows = Math.max(1, Math.min(20, Number(window.prompt("Nombre de lignes :", "3")) || 3));
          const cols = Math.max(1, Math.min(10, Number(window.prompt("Nombre de colonnes :", "3")) || 3));
          editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        }}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton title="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <span className="text-[10px] font-bold">+Col</span>
          </ToolbarButton>
          <ToolbarButton title="Supprimer la colonne" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <span className="text-[10px] font-bold text-red-500">−Col</span>
          </ToolbarButton>
          <ToolbarButton title="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <span className="text-[10px] font-bold">+Lig</span>
          </ToolbarButton>
          <ToolbarButton title="Supprimer la ligne" onClick={() => editor.chain().focus().deleteRow().run()}>
            <span className="text-[10px] font-bold text-red-500">−Lig</span>
          </ToolbarButton>
          <ToolbarButton title="Fusionner/scinder les cellules" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 12h18" /></svg>
          </ToolbarButton>
          <div className="relative">
            <ToolbarButton title="Couleur de fond de la cellule" onClick={() => setShowCellColors((s) => !s)}>
              <span className="text-[10px] font-black" style={{ color: VERT }}>▦</span>
            </ToolbarButton>
            {showCellColors && (
              <div className="absolute z-10 top-9 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-wrap gap-1.5 w-40">
                {CELL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { editor.chain().focus().setCellAttribute("backgroundColor", c).run(); setShowCellColors(false); }}
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { editor.chain().focus().setCellAttribute("backgroundColor", null).run(); setShowCellColors(false); }}
                  className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[10px] text-gray-400"
                  title="Réinitialiser"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <ToolbarButton title="Supprimer le tableau" onClick={() => editor.chain().focus().deleteTable().run()}>
            <span className="text-[10px] font-bold text-red-500">✕Tab</span>
          </ToolbarButton>
        </>
      )}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10a8 8 0 1114.5 4.7M3 10V4m0 6h6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ToolbarButton>
      <ToolbarButton title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10a8 8 0 10-14.5 4.7M21 10V4m0 6h-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </ToolbarButton>
    </div>
  );
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string; // HTML assaini (voir lib/sanitize.ts côté serveur)
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    // Sans ça (option officielle TipTap, désactivée par défaut), le
    // composant ne se re-rend pas lors d'un simple déplacement du curseur
    // (ex: cliquer dans un tableau déjà existant) — seul un changement de
    // CONTENU déclenchait un re-rendu, donc les boutons de la barre
    // d'outils (isActive("table"), isActive("bold")...) restaient figés
    // sur leur dernier état jusqu'à la prochaine frappe.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ link: false, paragraph: false, listItem: false }),
      ParagraphWithSpacing,
      ListItem,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "Écrivez ici…" }),
      TextStyle,
      Color,
      FontFamily,
      Table.configure({ resizable: true, lastColumnResizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-editor px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none",
        style: `min-height: ${rows * 1.7}em;`,
      },
    },
  });

  // Synchronise le contenu si `value` change depuis une source VRAIMENT
  // externe (changement d'onglet de langue, ouverture d'un autre article) —
  // en comparant au contenu ACTUEL de l'éditeur, pas à un état mémorisé.
  // L'ancienne version comparait à "la dernière valeur externe connue", ce
  // qui déclenchait une réinitialisation à CHAQUE frappe (onChange → nouvelle
  // prop value → différente de l'ancienne → reset en plein milieu de la
  // frappe) : c'est ce qui cassait la barre d'espace, faisait sortir le
  // curseur des tableaux, et perturbait les listes.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .prose-editor h1 { font-size: 1.4em; font-weight: 900; margin: 0.6em 0 0.3em; }
        .prose-editor h2 { font-size: 1.2em; font-weight: 900; margin: 0.6em 0 0.3em; }
        .prose-editor h3 { font-size: 1.05em; font-weight: 900; margin: 0.5em 0 0.25em; }
        .prose-editor p { margin: 0.4em 0; }
        .prose-editor ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        .prose-editor ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        .prose-editor li h1, .prose-editor li h2, .prose-editor li h3 { margin-top: 0; }
        .prose-editor li p { margin: 0.2em 0; }
        .prose-editor blockquote { border-left: 2px solid ${VERT}; padding-left: 0.8em; color: #666; font-style: italic; margin: 0.5em 0; }
        .prose-editor code { background: #f1f1ef; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
        .prose-editor a { color: ${VERT}; text-decoration: underline; }
        .prose-editor table { border-collapse: collapse; margin: 0.6em 0; width: 100%; table-layout: fixed; }
        .prose-editor .tableWrapper { overflow-x: auto; }
        .prose-editor .resize-cursor { cursor: col-resize; }
        .prose-editor .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: ${VERT};
          pointer-events: none;
        }
        .prose-editor .selectedCell {
          position: relative;
        }
        .prose-editor .selectedCell:after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 104, 40, 0.12);
          pointer-events: none;
        }
        .prose-editor td, .prose-editor th { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        .prose-editor th { background: #f5f5f3; font-weight: 700; }
        .prose-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #bbb;
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
