import "server-only";
import { sql } from "@/lib/db";

export type MinistreSettings = {
  name: string;
  photo: string;
  titleFr: string;
  titleEn: string;
  badgeFr: string;
  badgeEn: string;
  badgeSubFr: string;
  badgeSubEn: string;
  headingFr: string; // multi-lignes, séparées par \n
  headingEn: string;
  contentFr: string; // HTML riche continu (plusieurs paragraphes gérés par l'éditeur lui-même)
  contentEn: string;
};

// Valeurs par défaut = exactement le texte codé en dur jusqu'ici, pour
// qu'aucun changement ne soit visible tant que personne ne modifie rien.
export const MINISTRE_DEFAULTS: MinistreSettings = {
  name: "Mahuna Akplogan",
  photo: "/ministre.png",
  titleFr: "Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA",
  titleEn: "Minister of Digital Transformation and Innovation, in charge of the National AI Strategy",
  badgeFr: "Ministre en charge",
  badgeEn: "Minister in charge",
  badgeSubFr: "Transformation Digitale & IA",
  badgeSubEn: "Digital Transformation & AI",
  headingFr: "Le Bénin déploie.\nLe Bénin construit.\nLe Bénin innove.",
  headingEn: "Benin deploys.\nBenin builds.\nBenin innovates.",
  contentFr: "<p>La technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.</p><p>Le Ministère de la Transformation Digitale et de l'Innovation a pour mission de conduire la feuille de route technologique au service des politiques publiques, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif.</p>",
  contentEn: "",
};

export async function getMinistreSettings(): Promise<MinistreSettings> {
  const result = await sql`SELECT value FROM settings WHERE key = 'ministre_message'`;
  const stored = (result.rows[0]?.value as Record<string, unknown>) || {};
  const merged = { ...MINISTRE_DEFAULTS, ...stored } as MinistreSettings & { paragraphsFr?: string[]; paragraphsEn?: string[] };

  // Rétrocompatibilité : d'anciennes données stockées en tableau de
  // paragraphes (avant le passage à un éditeur continu unique) sont
  // fusionnées automatiquement en un seul bloc HTML.
  const contentFr = typeof merged.contentFr === "string"
    ? merged.contentFr
    : Array.isArray(merged.paragraphsFr) ? merged.paragraphsFr.join("") : MINISTRE_DEFAULTS.contentFr;
  const contentEn = typeof merged.contentEn === "string"
    ? merged.contentEn
    : Array.isArray(merged.paragraphsEn) ? merged.paragraphsEn.join("") : MINISTRE_DEFAULTS.contentEn;

  return { ...merged, contentFr, contentEn };
}
