import { sql } from "@/lib/db";

export type ParcoursItem = { period: string; title: string; description: string };
export type PrioriteItem = { title: string; description: string };

export type MinistreBio = {
  name: string;
  photo: string;
  breadcrumbFr: string; breadcrumbEn: string;
  sousTitreFr: string; sousTitreEn: string;
  badgeFr: string; badgeEn: string;
  badgeSousTitreFr: string; badgeSousTitreEn: string;
  signatureTitreFr: string; signatureTitreEn: string;
  imageAltFr: string; imageAltEn: string;
  bioParagraphsFr: string[]; bioParagraphsEn: string[];
  wikipediaUrl: string;
  parcoursFr: ParcoursItem[]; parcoursEn: ParcoursItem[];
  prioritesFr: PrioriteItem[]; prioritesEn: PrioriteItem[];
};

// Valeurs par défaut = exactement le texte déjà utilisé (dictionnaire FR/EN),
// pour qu'aucun changement ne soit visible tant que personne ne modifie rien.
export const MINISTRE_BIO_DEFAULTS: MinistreBio = {
  name: "Mahuna Akplogan",
  photo: "/ministre.png",
  breadcrumbFr: "Le Ministère · Le Ministre",
  breadcrumbEn: "The Ministry · The Minister",
  sousTitreFr: "Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'Intelligence Artificielle.",
  sousTitreEn: "Minister of Digital Transformation and Innovation, in charge of the National Artificial Intelligence Strategy.",
  badgeFr: "Ministre", badgeEn: "Minister",
  badgeSousTitreFr: "Transformation Digitale & IA", badgeSousTitreEn: "Digital Transformation & AI",
  signatureTitreFr: "Ministre de la Transformation Digitale et de l'Innovation",
  signatureTitreEn: "Minister of Digital Transformation and Innovation",
  imageAltFr: "Portrait officiel de Mahuna Akplogan, Ministre de la Transformation Digitale et de l'Innovation",
  imageAltEn: "Official portrait of Mahuna Akplogan, Minister of Digital Transformation and Innovation",
  wikipediaUrl: "https://fr.wikipedia.org/wiki/Mahuna_Akplogan",
  bioParagraphsFr: [
    "Mahuna Akplogan compte parmi les figures de l'intelligence artificielle au Bénin. Ingénieur-docteur et entrepreneur, il appartient à cette catégorie de praticiens chez qui la rigueur scientifique, la réflexion stratégique et l'attention portée aux équipes procèdent d'une même exigence : comprendre pour mieux servir.",
    "Nommé en mai 2026 Ministre de la Transformation digitale et de l'Innovation, en charge de la stratégie nationale de l'intelligence artificielle par le Président Romuald Wadagni, il a pour mission de conduire la feuille de route technologique au service des politiques publiques et privées, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif, un Bénin appelé à devenir exportateur de technologie. Derrière ces objectifs se tient une conviction simple : la technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.",
    "Son parcours s'est construit à la croisée de la recherche et de l'action. Doublement diplômé, ingénieur et titulaire d'un master de l'Université de Technologie de Compiègne, il est docteur en intelligence artificielle de l'Université Toulouse III – Paul Sabatier (École Doctorale Mathématiques, Informatique et Télécommunications), et titulaire d'un mineur en philosophie des technologies cognitives, discipline qui l'a tôt amené à interroger le sens de ce qu'il construit. Son expertise couvre le management de l'innovation et de la recherche et développement, au service de la résolution de problématiques complexes à fort impact.",
    "Fort de plus de quinze années d'expérience, il a dirigé des programmes d'innovation d'envergure dans des environnements exigeants, en conjuguant la vision stratégique et l'exécution opérationnelle de projets à grande échelle. De cette expérience, il a retenu une certitude mesurée : la recherche ne prend son sens qu'en redescendant vers le concret, là où se jouent la compétitivité des organisations et l'autonomie stratégique des nations.",
    "Entrepreneur engagé, il est cofondateur de l'association iSheero, initiative panafricaine dédiée à la formation de compétences d'excellence en data science, data engineering et infrastructures cloud. Cet engagement procède d'une conviction plus personnelle : le souci de transmettre ce qu'il a mis des années à apprendre, et de contribuer à l'émergence d'une génération capable de répondre aux enjeux du continent.",
    "Attaché au développement des talents, Mahuna Akplogan consacre son action à la transmission des savoirs et à l'édification d'écosystèmes durables, où se rejoignent l'excellence technologique, l'impact sociétal et la croissance des organisations. Au fond, ce qui guide sa démarche tient moins à l'ambition qu'à une forme de fidélité : au savoir, à ceux qui viennent, et à l'idée que la valeur d'une œuvre se mesure à l'empreinte qu'elle laisse.",
  ],
  bioParagraphsEn: [
    "Mahuna Akplogan is one of the leading figures in artificial intelligence in Benin. An engineer-researcher and entrepreneur, he belongs to that category of practitioners in whom scientific rigour, strategic thinking and care for teams stem from the same demand: to understand in order to better serve.",
    "Appointed in May 2026 as Minister of Digital Transformation and Innovation, in charge of the national artificial intelligence strategy by President Romuald Wadagni, his mission is to lead the technological roadmap in service of public and private policies, and to build a dynamic, inclusive and competitive innovation ecosystem — a Benin poised to become a technology exporter. Behind these objectives lies a simple conviction: technology is only worth what it concretely changes in people's lives, and above all through its contribution to eradicating extreme poverty.",
    "His career was built at the crossroads of research and action. Doubly qualified, an engineer and master's degree holder from the University of Technology of Compiègne, he holds a doctorate in artificial intelligence from the University of Toulouse III – Paul Sabatier (Doctoral School of Mathematics, Computer Science and Telecommunications), and a minor in the philosophy of cognitive technologies — a discipline that led him early on to question the meaning of what he builds. His expertise covers innovation management and research and development, in service of solving complex, high-impact problems.",
    "With more than fifteen years of experience, he has led large-scale innovation programmes in demanding environments, combining strategic vision with the operational execution of major projects. From this experience, he has drawn a measured certainty: research only makes sense when it returns to the concrete, where the competitiveness of organisations and the strategic autonomy of nations are at stake.",
    "As a committed entrepreneur, he is co-founder of the iSheero association, a pan-African initiative dedicated to developing excellence in data science, data engineering and cloud infrastructure. This commitment stems from a more personal conviction: the desire to pass on what he spent years learning, and to contribute to the emergence of a generation capable of meeting the continent's challenges.",
    "Committed to developing talent, Mahuna Akplogan devotes his work to knowledge transfer and the building of sustainable ecosystems, where technological excellence, societal impact and organisational growth converge. Ultimately, what guides his approach is less ambition than a form of fidelity: to knowledge, to those who come after, and to the idea that the value of a work is measured by the mark it leaves.",
  ],
  parcoursFr: [
    { period: "", title: "Formation académique", description: "Ingénieur et titulaire d'un master de l'Université de Technologie de Compiègne. Docteur en intelligence artificielle de l'Université Toulouse III – Paul Sabatier (École Doctorale Mathématiques, Informatique et Télécommunications). Mineur en philosophie des technologies cognitives." },
    { period: "", title: "Innovation et R&D", description: "Plus de quinze années d'expérience à diriger des programmes d'innovation d'envergure dans des environnements exigeants, conjuguant vision stratégique et exécution opérationnelle de projets à grande échelle." },
    { period: "", title: "Cofondateur d'iSheero", description: "Initiative panafricaine dédiée à la formation de compétences d'excellence en data science, data engineering et infrastructures cloud." },
    { period: "Mai 2026", title: "Ministre de la Transformation Digitale et de l'Innovation", description: "Nommé par le Président Romuald Wadagni, en charge de la stratégie nationale de l'intelligence artificielle. Mission : conduire la feuille de route technologique et bâtir un écosystème d'innovation dynamique, inclusif et compétitif." },
  ],
  parcoursEn: [
    { period: "", title: "Academic background", description: "Engineer and master's degree holder from the University of Technology of Compiègne. Doctor of artificial intelligence from the University of Toulouse III – Paul Sabatier (Doctoral School of Mathematics, Computer Science and Telecommunications). Minor in the philosophy of cognitive technologies." },
    { period: "", title: "Innovation and R&D", description: "Over fifteen years of experience leading large-scale innovation programmes in demanding environments, combining strategic vision with the operational execution of major projects." },
    { period: "", title: "Co-founder of iSheero", description: "Pan-African initiative dedicated to developing excellence in data science, data engineering and cloud infrastructure." },
    { period: "May 2026", title: "Minister of Digital Transformation and Innovation", description: "Appointed by President Romuald Wadagni, in charge of the national artificial intelligence strategy. Mission: lead the technological roadmap and build a dynamic, inclusive and competitive innovation ecosystem." },
  ],
  prioritesFr: [
    { title: "Transformation digitale de l'administration", description: "Accélérer la dématérialisation des services publics pour offrir aux citoyens un accès simple, rapide et transparent aux démarches administratives, 24 heures sur 24." },
    { title: "Stratégie nationale d'intelligence artificielle", description: "Positionner le Bénin comme référence africaine de l'IA en déployant des solutions concrètes dans l'agriculture, la santé, l'éducation et la gouvernance." },
    { title: "Souveraineté numérique et cybersécurité", description: "Renforcer la confiance numérique par un cadre de cybersécurité robuste, la protection des données personnelles et le développement d'infrastructures nationales souveraines." },
    { title: "Innovation et écosystème startup", description: "Stimuler l'écosystème d'innovation béninois en soutenant les startups deeptech, en développant les talents numériques et en attirant les investissements internationaux." },
  ],
  prioritesEn: [
    { title: "Digital transformation of public administration", description: "Accelerate the digitisation of public services to give citizens simple, fast and transparent access to administrative procedures, 24 hours a day." },
    { title: "National artificial intelligence strategy", description: "Position Benin as Africa's AI reference by deploying concrete solutions in agriculture, health, education and governance." },
    { title: "Digital sovereignty and cybersecurity", description: "Strengthen digital trust through a robust cybersecurity framework, personal data protection and the development of sovereign national infrastructure." },
    { title: "Innovation and startup ecosystem", description: "Stimulate Benin's innovation ecosystem by supporting deeptech startups, developing digital talent and attracting international investment." },
  ],
};

export async function getMinistreBio(): Promise<MinistreBio> {
  const result = await sql`SELECT value FROM settings WHERE key = 'ministre_bio'`;
  const stored = (result.rows[0]?.value as Partial<MinistreBio>) || {};
  const merged = { ...MINISTRE_BIO_DEFAULTS, ...stored };
  // Garde-fous : jamais planter le rendu si la forme stockée est inattendue.
  return {
    ...merged,
    bioParagraphsFr: Array.isArray(merged.bioParagraphsFr) ? merged.bioParagraphsFr : [],
    bioParagraphsEn: Array.isArray(merged.bioParagraphsEn) ? merged.bioParagraphsEn : [],
    parcoursFr: Array.isArray(merged.parcoursFr) ? merged.parcoursFr : [],
    parcoursEn: Array.isArray(merged.parcoursEn) ? merged.parcoursEn : [],
    prioritesFr: Array.isArray(merged.prioritesFr) ? merged.prioritesFr : [],
    prioritesEn: Array.isArray(merged.prioritesEn) ? merged.prioritesEn : [],
  };
}
