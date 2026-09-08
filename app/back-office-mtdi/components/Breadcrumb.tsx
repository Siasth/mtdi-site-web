"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Traduction des segments d'URL en libellés lisibles. À compléter au fil de
// l'ajout de nouveaux modules (Directions, Structures, etc.).
const LABELS: Record<string, string> = {
  "back-office-mtdi": "Tableau de bord",
  hero: "Carousels",
  actualites: "Actualités",
  galerie: "Galerie",
  chantiers: "Chantiers",
  stats: "Chiffres clés",
  direct: "Direct",
  newsletter: "Newsletter",
  ministre: "Mot du Ministre",
  securite: "Mon profil",
  autres: "Autres",
  general: "Général",
  utilisateurs: "Utilisateurs",
  roles: "Rôles & permissions",
  categories: "Catégories",
  logs: "Journal d'audit",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ex: ["back-office-mtdi", "actualites"]

  if (segments.length <= 1) return null; // rien à afficher sur le tableau de bord lui-même

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] || seg;
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 px-8 pt-5 text-xs font-semibold text-gray-400">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300">/</span>}
          {crumb.isLast ? (
            <span className="text-gray-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
