"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const JAUNE = "#FFBE00";

export default function StrategieIASubNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const prefix = locale === "en" ? "/en" : "";

  const items = [
    { label: locale === "en" ? "National Strategy" : "Stratégie nationale", href: `${prefix}/strategie-ia` },
    { label: locale === "en" ? "Initiatives" : "Initiatives", href: `${prefix}/strategie-ia/initiatives` },
    { label: locale === "en" ? "AI Olympiad" : "Olympiades IA", href: `${prefix}/strategie-ia/olympiades-ia` },
  ];

  return (
    <div className="sticky top-[84px] z-30 px-4 sm:px-6 lg:px-8 py-3" style={{ background: "#0d1826", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors"
              style={active ? { color: JAUNE } : { color: "rgba(255,255,255,0.55)" }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
