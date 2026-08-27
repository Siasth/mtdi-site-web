"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import Breadcrumb from "./components/Breadcrumb";
import type { PermissionCode } from "@/lib/permissions";

const VERT = "#006828";
const INACTIVITY_MINUTES = 20;
const WARNING_BEFORE_MINUTES = 2;

// Contexte de permissions : permet à n'importe quelle page enfant (Utilisateurs,
// Rôles, Logs, Mon profil...) de vérifier ce que l'utilisateur connecté a le
// droit de faire, sans re-fetch la session à chaque page.
const PermissionsContext = createContext<string[]>([]);
export function usePermissions() {
  return useContext(PermissionsContext);
}
export function useHasPermission(code: PermissionCode) {
  const perms = usePermissions();
  return perms.includes(code);
}

type NavLink = { type: "link"; label: string; href: string; icon: string; perm: PermissionCode | null };
type NavGroup = { type: "group"; label: string; icon: string; children: NavLink[] };
type NavEntry = NavLink | NavGroup;

const navItems: NavEntry[] = [
  { type: "link", label: "Dashboard", href: "/back-office-mtdi", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", perm: null },
  {
    type: "group",
    label: "Accueil",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    children: [
      { type: "link", label: "Hero", href: "/back-office-mtdi/hero", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", perm: "accueil.voir" },
      { type: "link", label: "Grands Chantiers", href: "/back-office-mtdi/chantiers", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", perm: "accueil.voir" },
      { type: "link", label: "Chiffres clés", href: "/back-office-mtdi/stats", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", perm: "accueil.voir" },
      { type: "link", label: "Mot du Ministre", href: "/back-office-mtdi/ministre", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", perm: "accueil.voir" },
    ],
  },
  {
    type: "group",
    label: "Actualités & Médias",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    children: [
      { type: "link", label: "Actualités", href: "/back-office-mtdi/actualites", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", perm: "actualites.voir" },
      { type: "link", label: "Galerie", href: "/back-office-mtdi/galerie", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z", perm: "mediatheque.voir" },
      { type: "link", label: "Direct", href: "/back-office-mtdi/direct", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", perm: "mediatheque.voir" },
      { type: "link", label: "Documenthèque", href: "/back-office-mtdi/documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", perm: "mediatheque.voir" },
      { type: "link", label: "Vidéothèque", href: "/back-office-mtdi/videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", perm: "mediatheque.voir" },
      { type: "link", label: "MTDI dans les médias", href: "/back-office-mtdi/media-mentions", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", perm: "mediatheque.voir" },
    ],
  },
  {
    type: "group",
    label: "Le Ministère",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
    children: [
      { type: "link", label: "Le Ministre (biographie)", href: "/back-office-mtdi/ministre-bio", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", perm: "ministere.voir" },
      { type: "link", label: "Directions centrales", href: "/back-office-mtdi/directions", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", perm: "ministere.voir" },
      { type: "link", label: "Structures sous tutelle", href: "/back-office-mtdi/structures", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z", perm: "ministere.voir" },
      { type: "link", label: "Cabinet", href: "/back-office-mtdi/cabinet", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 100-8 4 4 0 000 8zm-6 8v-2a4 4 0 013-3.87", perm: "ministere.voir" },
      { type: "link", label: "Missions", href: "/back-office-mtdi/missions", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", perm: "ministere.voir" },
      { type: "link", label: "Partenaires", href: "/back-office-mtdi/partenaires", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", perm: "ministere.voir" },
    ],
  },
  {
    type: "group",
    label: "Paramètres",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    children: [
      { type: "link", label: "Général", href: "/back-office-mtdi/general", icon: "M3 21h18M5 21V7l8-4v18M13 21V11l6 3v7M9 9h.01M9 12h.01M9 15h.01", perm: "parametres.modifier" },
      { type: "link", label: "Utilisateurs", href: "/back-office-mtdi/utilisateurs", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 100-8 4 4 0 000 8zm-6 8v-2a4 4 0 013-3.87m9-9.13a4 4 0 010 7.75", perm: "utilisateurs.voir" },
      { type: "link", label: "Rôles & permissions", href: "/back-office-mtdi/roles", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", perm: "roles.voir" },
      { type: "link", label: "Journal d'audit", href: "/back-office-mtdi/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", perm: "logs.voir" },
      { type: "link", label: "Plan du site", href: "/back-office-mtdi/sitemap", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", perm: "ressources.voir" },
      { type: "link", label: "Pages légales", href: "/back-office-mtdi/pages-statiques", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", perm: "ressources.voir" },
      { type: "link", label: "Autres", href: "/back-office-mtdi/autres", icon: "M4 6h16M4 12h16M4 18h7", perm: "securite.modifier" },
    ],
  },
  {
    type: "group",
    label: "Pages secondaires",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    children: [
      { type: "link", label: "Textes juridiques", href: "/back-office-mtdi/textes-juridiques", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", perm: "ressources.voir" },
      { type: "link", label: "Kit presse", href: "/back-office-mtdi/kit-presse", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", perm: "mediatheque.voir" },
      { type: "link", label: "e-Services", href: "/back-office-mtdi/eservices", icon: "M13 10V3L4 14h7v7l9-11h-7z", perm: "ressources.voir" },
      { type: "link", label: "Opportunités (Participer)", href: "/back-office-mtdi/opportunites", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z", perm: "ressources.voir" },
      { type: "link", label: "Liens utiles", href: "/back-office-mtdi/liens-utiles", icon: "M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.102-1.101m5.44-5.44l1.102-1.1a4 4 0 015.656 5.656l-4 4a4 4 0 01-5.656 0", perm: "ressources.voir" },
      { type: "link", label: "Contacts spécifiques", href: "/back-office-mtdi/contacts-specifiques", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", perm: "ressources.voir" },
    ],
  },
  {
    type: "group",
    label: "Stratégie IA",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    children: [
      { type: "link", label: "Vision & Initiatives", href: "/back-office-mtdi/ia-strategie", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", perm: "strategie_ia.voir" },
      { type: "link", label: "Olympiades IA", href: "/back-office-mtdi/ia-olympiades", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", perm: "strategie_ia.voir" },
    ],
  },
];

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

async function doLogout(router: ReturnType<typeof useRouter>) {
  await fetch("/api/auth", { method: "DELETE" });
  router.push("/login");
}

function NavLinkItem({ item, active }: { item: NavLink; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
      style={active ? { background: VERT } : undefined}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
        <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {item.label}
    </Link>
  );
}

export default function AdminLayoutClient({
  children,
  userName,
  roleName,
  permissions,
}: {
  children: React.ReactNode;
  userName: string;
  roleName: string;
  permissions: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtrer chaque entrée du menu selon les permissions ; un groupe n'est
  // affiché que s'il lui reste au moins un enfant visible.
  const visibleNavItems: NavEntry[] = navItems
    .map((item) => {
      if (item.type === "link") {
        return !item.perm || permissions.includes(item.perm) ? item : null;
      }
      const visibleChildren = item.children.filter((c) => !c.perm || permissions.includes(c.perm));
      return visibleChildren.length > 0 ? { ...item, children: visibleChildren } : null;
    })
    .filter((x): x is NavEntry => x !== null);

  // Un groupe s'ouvre automatiquement si la page active est l'un de ses enfants.
  useEffect(() => {
    for (const item of visibleNavItems) {
      if (item.type === "group" && item.children.some((c) => c.href === pathname)) {
        setOpenGroup(item.label);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function resetTimers() {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      setShowWarning(false);

      warningTimer.current = setTimeout(
        () => setShowWarning(true),
        (INACTIVITY_MINUTES - WARNING_BEFORE_MINUTES) * 60 * 1000
      );
      idleTimer.current = setTimeout(() => {
        doLogout(router);
      }, INACTIVITY_MINUTES * 60 * 1000);
    }

    resetTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimers));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimers));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
    <div className="min-h-screen flex bg-gray-50">
      {/* Avertissement d'expiration de session par inactivité */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">Session bientôt expirée</p>
            <p className="text-sm text-gray-500 mb-5">
              Vous allez être déconnecté(e) dans {WARNING_BEFORE_MINUTES} minutes par inactivité.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-lg"
              style={{ background: VERT }}
            >
              Rester connecté(e)
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-gray-200">
          <Link href="/back-office-mtdi" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: VERT }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Back-office MTDI</p>
              <p className="text-[10px] text-gray-400 font-medium">Gestion du contenu</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            if (item.type === "link") {
              return <NavLinkItem key={item.href} item={item} active={pathname === item.href} />;
            }

            // Groupe (ex: "Paramètres") avec sous-menus
            const isOpen = openGroup === item.label;
            const hasActiveChild = item.children.some((c) => c.href === pathname);
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    hasActiveChild ? "text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="flex-1 text-left">{item.label}</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="ml-4 pl-3 border-l border-gray-200 space-y-0.5 mt-0.5">
                    {item.children.map((child) => (
                      <NavLinkItem key={child.href} item={child} active={pathname === child.href} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-0.5">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 font-medium">{roleName}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour au site
          </Link>
          <button
            onClick={() => doLogout(router)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="flex justify-end px-8 pt-4">
          <Link
            href="/back-office-mtdi/securite"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/back-office-mtdi/securite" ? "text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
            style={pathname === "/back-office-mtdi/securite" ? { background: VERT } : undefined}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mon profil
          </Link>
        </div>
        <Breadcrumb />
        {children}
      </main>
    </div>
    </PermissionsContext.Provider>
  );
}
