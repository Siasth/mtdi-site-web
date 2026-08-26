import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mtdi-site-beige.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/back-office-mtdi", "/api", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
