import Link from "next/link";
import { readData } from "@/lib/data";

const VERT = "#006828";

type Article = { id: number };
type GalerieItem = { id: number };
type HeroSlide = { id: number };
type Chantier = { id: number };
type Stat = { id: number };
type DirectData = { upcoming: { id: number }[]; replays: { id: number }[] };

const sections = [
  { label: "Hero", href: "/back-office-mtdi/hero", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", desc: "Slides du carrousel" },
  { label: "Actualités", href: "/back-office-mtdi/actualites", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", desc: "Articles et communiqués" },
  { label: "Galerie", href: "/back-office-mtdi/galerie", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z", desc: "Photos et vidéos" },
  { label: "Chantiers", href: "/back-office-mtdi/chantiers", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", desc: "5 grands chantiers" },
  { label: "Chiffres clés", href: "/back-office-mtdi/stats", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", desc: "KPIs animés" },
  { label: "Direct", href: "/back-office-mtdi/direct", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", desc: "Événements et replays" },
  { label: "Mot du Ministre", href: "/back-office-mtdi/ministre", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", desc: "Message du Ministre" },
];

export default async function AdminDashboard() {
  const [articles, galerie, hero, chantiers, stats, direct] = await Promise.all([
    readData<Article[]>("actualites"),
    readData<GalerieItem[]>("galerie"),
    readData<HeroSlide[]>("hero"),
    readData<Chantier[]>("chantiers"),
    readData<Stat[]>("stats"),
    readData<DirectData>("direct"),
  ]);

  const counts: Record<string, number> = {
    Hero: hero.length,
    "Actualités": articles.length,
    Galerie: galerie.length,
    Chantiers: chantiers.length,
    "Chiffres clés": stats.length,
    Direct: direct.upcoming.length + direct.replays.length,
    "Mot du Ministre": 1,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez le contenu du site du Ministère de la Transformation Digitale
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${VERT}14` }}
              >
                <svg width="20" height="20" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">{counts[s.label] ?? 0}</span>
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-green-800 transition-colors">
              {s.label}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
