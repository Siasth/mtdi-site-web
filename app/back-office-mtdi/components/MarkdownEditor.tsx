"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

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
          <div className="absolute z-10 top-9 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-wrap gap-1.5 w-40">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                className="w-6 h-6 rounded-full border border-black/10"
                style={{ background: c }}
                title={c}
              />
            ))}
            <label className="w-6 h-6 rounded-full border border-black/10 cursor-pointer overflow-hidden relative" title="Couleur personnalisée">
              <input
                type="color"
                className="absolute -top-1 -left-1 w-8 h-8 cursor-pointer"
                onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); setShowColors(false); }}
              />
            </label>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { editor.chain().focus().unsetColor().run(); setShowColors(false); }}
              className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[10px] text-gray-400"
              title="Réinitialiser"
            >
              ×
            </button>
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
      <ToolbarButton title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <span className="text-sm">"</span>
      </ToolbarButton>
      <ToolbarButton title="Lien" active={editor.isActive("link")} onClick={setLink}>
        <span className="text-sm">🔗</span>
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton
        title="Insérer un tableau"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton title="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <span className="text-xs font-bold">+Col</span>
          </ToolbarButton>
          <ToolbarButton title="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <span className="text-xs font-bold">+Lig</span>
          </ToolbarButton>
          <ToolbarButton title="Supprimer le tableau" onClick={() => editor.chain().focus().deleteTable().run()}>
            <span className="text-xs font-bold text-red-500">✕Tab</span>
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
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "Écrivez ici…" }),
      TextStyle,
      Color,
      FontFamily,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
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
        .prose-editor blockquote { border-left: 2px solid ${VERT}; padding-left: 0.8em; color: #666; font-style: italic; margin: 0.5em 0; }
        .prose-editor code { background: #f1f1ef; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
        .prose-editor a { color: ${VERT}; text-decoration: underline; }
        .prose-editor table { border-collapse: collapse; margin: 0.6em 0; width: 100%; }
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
