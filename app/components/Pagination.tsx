"use client";

const VERT = "#162233";

type PaginationDict = { precedent?: string; suivant?: string; page?: string };

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  dict?: PaginationDict;
};

// ANO-107 : pagination générique pour les listes publiques du site
// (Galerie, Vidéothèque, Kit presse, Médiathèque, Documenthèque, Textes
// réglementaires, Offres, Direct...). Scroll automatiquement en haut de la
// liste au changement de page, pour que la personne ne se retrouve pas
// "perdue" en bas d'une page qui vient de changer de contenu.
export function Pagination({ page, totalPages, onChange, dict = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    onChange(next);
  };

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center flex-wrap gap-1.5 pt-10" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="px-3 h-9 text-xs font-black uppercase tracking-widest rounded-sm border transition-colors disabled:opacity-30"
        style={{ borderColor: "rgba(0,0,0,0.12)", color: VERT }}
      >
        ‹ {dict.precedent ?? "Précédent"}
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => go(1)} className="min-w-[2.25rem] h-9 text-sm font-bold rounded-sm text-anthracite/60 hover:bg-black/5">1</button>
          <span className="px-1 text-anthracite/30">…</span>
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className="min-w-[2.25rem] h-9 text-sm font-bold rounded-sm transition-colors"
          style={p === page ? { background: VERT, color: "white" } : { color: "rgba(26,26,26,0.6)" }}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          <span className="px-1 text-anthracite/30">…</span>
          <button type="button" onClick={() => go(totalPages)} className="min-w-[2.25rem] h-9 text-sm font-bold rounded-sm text-anthracite/60 hover:bg-black/5">{totalPages}</button>
        </>
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="px-3 h-9 text-xs font-black uppercase tracking-widest rounded-sm border transition-colors disabled:opacity-30"
        style={{ borderColor: "rgba(0,0,0,0.12)", color: VERT }}
      >
        {dict.suivant ?? "Suivant"} ›
      </button>
    </nav>
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), totalPages, safePage };
}
