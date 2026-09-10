import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 85],
    // Toutes les images uploadées depuis le back-office (Hero, Chantiers,
    // Actualités, Galerie, logos, photos...) sont hébergées sur Vercel Blob,
    // un domaine externe — sans cette autorisation, next/image les bloque
    // silencieusement (aucune image ne s'affiche, aucune erreur visible).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  // Les routes API lisent les fichiers data/*.json avec un nom de fichier
  // dynamique (lib/data.ts). Vercel ne peut pas détecter cet usage
  // automatiquement lors du bundling des fonctions serverless : sans cette
  // config, data/*.json est absent du déploiement et toute lecture échoue
  // en production (fichier introuvable), même si tout fonctionne en local.
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/**", "./db/**"],
  },
  // En-têtes de sécurité HTTP appliqués à tout le site (front public et
  // back-office). Pas de Content-Security-Policy stricte pour l'instant :
  // le code utilise massivement des styles en ligne (style={{...}}), et une
  // CSP stricte casserait l'affichage sans un audit dédié préalable.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Empêche d'intégrer le site dans une <iframe> sur un site tiers
          // (protection anti-clickjacking, notamment sur la page de
          // connexion et le back-office).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Empêche le navigateur de deviner un type de contenu différent
          // de celui déclaré (protection contre certaines attaques MIME).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limite les informations transmises dans l'en-tête Referer vers
          // des sites tiers.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Désactive les fonctionnalités navigateur non utilisées par le
          // site (caméra, micro, géolocalisation...).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Force HTTPS pour toute visite ultérieure (sans risque sur
          // Vercel, qui sert déjà tout en HTTPS).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
