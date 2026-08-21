"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const VERT = "#006828";

type Tool = {
  label: string;
  icon: React.ReactNode;
  apply: (selected: string) => { text: string; cursorOffset: number };
};

const B = ({ children }: { children: React.ReactNode }) => <span className="font-black text-sm">{children}</span>;

const TOOLS: Tool[] = [
  { label: "Gras", icon: <B>G</B>, apply: (s) => ({ text: `**${s || "texte en gras"}**`, cursorOffset: 2 }) },
  { label: "Italique", icon: <span className="italic text-sm font-bold">I</span>, apply: (s) => ({ text: `_${s || "texte en italique"}_`, cursorOffset: 1 }) },
  { label: "Titre", icon: <span className="text-xs font-black">H2</span>, apply: (s) => ({ text: `\n## ${s || "Titre"}\n`, cursorOffset: 4 }) },
  { label: "Liste à puces", icon: <span className="text-sm">•</span>, apply: (s) => ({ text: `\n- ${s || "élément"}\n`, cursorOffset: 3 }) },
  { label: "Liste numérotée", icon: <span className="text-xs font-bold">1.</span>, apply: (s) => ({ text: `\n1. ${s || "élément"}\n`, cursorOffset: 4 }) },
  { label: "Lien", icon: <span className="text-sm">🔗</span>, apply: (s) => ({ text: `[${s || "texte du lien"}](https://)`, cursorOffset: 1 }) },
  { label: "Citation", icon: <span className="text-sm">"</span>, apply: (s) => ({ text: `\n> ${s || "citation"}\n`, cursorOffset: 3 }) },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyTool(tool: Tool) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const { text: inserted, cursorOffset } = tool.apply(selected);

    const newValue = value.slice(0, start) + inserted + value.slice(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + cursorOffset;
      textarea.setSelectionRange(pos, pos + (selected.length || 0));
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              onClick={() => applyTool(tool)}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              {tool.icon}
            </button>
          ))}
        </div>
        <div className="flex text-xs font-bold uppercase tracking-wider rounded overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="px-2.5 py-1"
            style={mode === "edit" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}
          >
            Éditer
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className="px-2.5 py-1"
            style={mode === "preview" ? { background: VERT, color: "white" } : { background: "white", color: "#666" }}
          >
            Aperçu
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm font-mono outline-none resize-y"
        />
      ) : (
        <div className="px-3 py-2 text-sm text-gray-700 leading-relaxed" style={{ minHeight: `${rows * 1.6}em` }}>
          {value ? (
            <ReactMarkdown
              components={{
                h2: (props) => <h2 className="text-base font-black text-gray-900 mt-2 mb-1" {...props} />,
                h3: (props) => <h3 className="text-sm font-black text-gray-900 mt-2 mb-1" {...props} />,
                ul: (props) => <ul className="list-disc pl-5 space-y-0.5 my-1" {...props} />,
                ol: (props) => <ol className="list-decimal pl-5 space-y-0.5 my-1" {...props} />,
                blockquote: (props) => <blockquote className="border-l-2 pl-3 italic text-gray-500 my-1" style={{ borderColor: VERT }} {...props} />,
                a: (props) => <a className="underline" style={{ color: VERT }} {...props} />,
                strong: (props) => <strong className="font-black" {...props} />,
                p: (props) => <p className="my-1" {...props} />,
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-300 italic">Rien à prévisualiser</p>
          )}
        </div>
      )}
    </div>
  );
}
