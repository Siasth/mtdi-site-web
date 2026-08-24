// Petit jeu d'icônes prédéfinies, sélectionnables depuis le back-office par
// une simple clé (icon_key) plutôt que du SVG sur-mesure à stocker en base.
export const ICON_PRESET_KEYS = [
  "document", "card", "id-card", "check-doc", "graduation", "heart",
  "briefcase", "home", "shield-check", "server-stack", "lightbulb",
] as const;

export type IconPresetKey = (typeof ICON_PRESET_KEYS)[number];

export function IconPreset({ name, color = "currentColor", size = 28 }: { name: string; color?: string; size?: number }) {
  const props = { width: size, height: size, fill: "none", stroke: color, strokeWidth: 1.6, viewBox: "0 0 24 24" };
  switch (name) {
    case "card":
      return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /><line x1="6" y1="15" x2="10" y2="15" /><line x1="14" y1="15" x2="18" y2="15" /></svg>;
    case "id-card":
      return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="9" cy="11" r="2.5" /><path d="M5 17c0-1.5 1.8-3 4-3s4 1.5 4 3" /><line x1="16" y1="10" x2="20" y2="10" /><line x1="16" y1="13" x2="20" y2="13" /></svg>;
    case "check-doc":
      return <svg {...props}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case "graduation":
      return <svg {...props}><path d="M22 10L12 4 2 10l10 6 10-6z" /><path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" /><line x1="22" y1="10" x2="22" y2="16" /></svg>;
    case "heart":
      return <svg {...props}><path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 5.006a5 5 0 1 1 7.5 7.566z" /><line x1="12" y1="9" x2="12" y2="15" /></svg>;
    case "briefcase":
      return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    case "home":
      return <svg {...props}><path d="M3 12l9-9 9 9" /><path d="M9 21V12h6v9" /><path d="M5 10v11h14V10" /></svg>;
    case "shield-check":
      return <svg {...props}><path d="M12 2 3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "server-stack":
      return <svg {...props}><rect x="2" y="3" width="20" height="4" rx="1" /><rect x="2" y="10" width="20" height="4" rx="1" /><rect x="2" y="17" width="20" height="4" rx="1" /><circle cx="6" cy="5" r="0.8" fill={color} /><circle cx="6" cy="12" r="0.8" fill={color} /><circle cx="6" cy="19" r="0.8" fill={color} /></svg>;
    case "lightbulb":
      return <svg {...props}><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.3-6C6.8 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" /><path d="M9 21h6" /></svg>;
    case "document":
    default:
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>;
  }
}
