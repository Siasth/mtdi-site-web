import "server-only";
import { sql } from "@/lib/db";

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
  contactAddressEn: string;
  openingHoursFr: string;
  openingHoursEn: string;
  locationMapUrl: string; // optionnel : lien vers une carte (Google Maps...)
};

export const GENERAL_SETTINGS_DEFAULTS: GeneralSettings = {
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
  contactPhone: "+229 01 21 30 00 00",
  contactAddress: "Boulevard de la Marina\n01 BP 412 Cotonou\nRépublique du Bénin",
  contactAddressEn: "Boulevard de la Marina\n01 BP 412 Cotonou\nRepublic of Benin",
  openingHoursFr: "Lundi – Vendredi : 8h00 – 17h00",
  openingHoursEn: "Monday – Friday: 8:00 AM – 5:00 PM",
  locationMapUrl: "",
};

// Utilisable côté serveur (Server Components, routes API) : lecture directe
// en base, sans aller-retour HTTP — plus rapide que d'appeler /api/general-settings
// depuis une page qui est elle-même déjà côté serveur.
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const result = await sql`SELECT value FROM settings WHERE key = 'site_general'`;
  const stored = (result.rows[0]?.value as Partial<GeneralSettings>) || {};
  return { ...GENERAL_SETTINGS_DEFAULTS, ...stored };
}
