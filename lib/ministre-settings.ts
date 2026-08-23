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
  paragraphsFr: string[];
  paragraphsEn: string[];
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
  paragraphsFr: [
    "La technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.",
    "Le Ministère de la Transformation Digitale et de l'Innovation a pour mission de conduire la feuille de route technologique au service des politiques publiques, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif.",
  ],
  paragraphsEn: [],
};

export async function getMinistreSettings(): Promise<MinistreSettings> {
  const result = await sql`SELECT value FROM settings WHERE key = 'ministre_message'`;
  const stored = (result.rows[0]?.value as Partial<MinistreSettings>) || {};
  return { ...MINISTRE_DEFAULTS, ...stored };
}
