import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 85],
  },
  // Les routes API lisent les fichiers data/*.json avec un nom de fichier
  // dynamique (lib/data.ts). Vercel ne peut pas détecter cet usage
  // automatiquement lors du bundling des fonctions serverless : sans cette
  // config, data/*.json est absent du déploiement et toute lecture échoue
  // en production (fichier introuvable), même si tout fonctionne en local.
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/**"],
  },
};

export default nextConfig;
