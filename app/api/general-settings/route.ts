import { NextResponse } from "next/server";
import { getSetting } from "@/lib/auth";

// Route PUBLIQUE (pas d'authentification) : Navbar/Footer en ont besoin sur
// le site public pour afficher le nom/logo/réseaux sociaux à jour. Lecture
// seule — l'écriture se fait via /api/admin/general-settings (protégée).
export type GeneralSettings = {
  siteName: string;
  siteNameShort: string;
  taglineFr: string;
  taglineEn: string;
  logoHeader: string;
  logoFooter: string;
  favicon: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

const DEFAULTS: GeneralSettings = {
  siteName: "Ministère de la Transformation Digitale et de l'Innovation",
  siteNameShort: "MTDI",
  taglineFr: "",
  taglineEn: "",
  logoHeader: "/mtdi-banner.png",
  logoFooter: "/mtdi-banner.png",
  favicon: "/favicon.ico",
  facebook: "https://www.facebook.com/innovationbenin",
  twitter: "",
  linkedin: "https://www.linkedin.com/company/innovationbenin",
  instagram: "https://www.instagram.com/benin.innov/",
  youtube: "",
  contactEmail: "contact@gouv.bj",
  contactPhone: "",
  contactAddress: "",
};

export async function GET() {
  const stored = await getSetting<Partial<GeneralSettings>>("site_general");
  return NextResponse.json({ ...DEFAULTS, ...(stored || {}) });
}
