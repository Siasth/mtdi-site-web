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
};

export default nextConfig;
