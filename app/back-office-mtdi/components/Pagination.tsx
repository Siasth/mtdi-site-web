"use client";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

// ANO-120 : pagination générique pour les listes du back-office. Affiche la
// page courante, permet de naviguer page par page, et d'aller directement à
// la première/dernière page quand il y a beaucoup de pages.
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (p: number) => onChange(Math.min(Math.max(p, 1), totalPages));

  // Fenêtre de pages visibles autour de la page courante (max 5), pour ne
  // pas afficher des dizaines de boutons quand il y a beaucoup de pages.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btn = "min-w-[2rem] h-8 px-2 text-sm font-semibold rounded-lg transition-colors";

  return (
    <nav className="flex items-center justify-center gap-1 py-4" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(1)}
        disabled={page === 1}
        aria-label="Première page"
        className={`${btn} text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400`}
      >
        «
      </button>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Page précédente"
        className={`${btn} text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400`}
      >
        ‹
      </button>
      {start > 1 && <span className="px-1 text-gray-300">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
          style={p === page ? { background: "#006828" } : undefined}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-1 text-gray-300">…</span>}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Page suivante"
        className={`${btn} text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400`}
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => go(totalPages)}
        disabled={page === totalPages}
        aria-label="Dernière page"
        className={`${btn} text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400`}
      >
        »
      </button>
    </nav>
  );
}

// Découpe un tableau pour la page courante, et republie automatiquement sur
// la dernière page valide si la liste rétrécit (suppression) et que la page
// courante n'existe plus plus.
export function paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), totalPages, safePage };
}
