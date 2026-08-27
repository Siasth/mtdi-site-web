// Catalogue central des permissions. Toute nouvelle fonctionnalité back-office
// doit ajouter ses permissions ici, puis elles apparaissent automatiquement
// dans l'écran de gestion des rôles (case à cocher par permission).

// Catalogue central des permissions. Toute nouvelle fonctionnalité back-office
// doit ajouter ses permissions ici, puis elles apparaissent automatiquement
// dans l'écran de gestion des rôles (case à cocher par permission).
//
// Structure à deux niveaux :
// - category : "editorial" (contenu du site) vs "technique" (comptes, sécurité,
//   paramètres système) — jamais mélangés dans l'écran Rôles.
// - module   : sous-groupe au sein d'une catégorie, avec une case à cocher
//   "tout sélectionner" dans l'écran Rôles. Les libellés correspondent aux
//   sections déjà visibles dans le menu du back-office.

export const PERMISSIONS = [
  // ══════════════════════ CONTENU ÉDITORIAL ══════════════════════

  // Accueil : Hero, Chantiers, Chiffres clés (+ leur texte), Mot du Ministre
  { code: "accueil.voir", module: "accueil", category: "editorial", description: "Voir le contenu de l'accueil (Hero, Chantiers, Chiffres clés, Mot du Ministre)" },
  { code: "accueil.gerer", module: "accueil", category: "editorial", description: "Modifier le contenu de l'accueil (Hero, Chantiers, Chiffres clés, Mot du Ministre)" },

  // Actualités & Médias — Actualités
  { code: "actualites.voir", module: "actualites", category: "editorial", description: "Voir les actualités" },
  { code: "actualites.creer", module: "actualites", category: "editorial", description: "Créer une actualité" },
  { code: "actualites.modifier", module: "actualites", category: "editorial", description: "Modifier une actualité" },
  { code: "actualites.supprimer", module: "actualites", category: "editorial", description: "Supprimer (logiquement) une actualité" },
  { code: "actualites.restaurer", module: "actualites", category: "editorial", description: "Restaurer une actualité supprimée" },

  // Actualités & Médias — Catégories d'actualités
  { code: "categories.voir", module: "actualites", category: "editorial", description: "Voir les catégories d'actualités" },
  { code: "categories.gerer", module: "actualites", category: "editorial", description: "Créer, modifier, supprimer des catégories d'actualités" },

  // Actualités & Médias — Médiathèque (Galerie, Direct, Documenthèque, Vidéothèque, Médias, Kit presse)
  { code: "mediatheque.voir", module: "actualites", category: "editorial", description: "Voir la galerie, le direct, la documenthèque, la vidéothèque, les médias et le kit presse" },
  { code: "mediatheque.gerer", module: "actualites", category: "editorial", description: "Modifier la galerie, le direct, la documenthèque, la vidéothèque, les médias et le kit presse" },

  // Le Ministère : biographie, Directions, Structures, Cabinet, Missions, Partenaires
  { code: "ministere.voir", module: "ministere", category: "editorial", description: "Voir les pages du Ministère (Le Ministre, Directions, Structures, Cabinet, Missions, Partenaires)" },
  { code: "ministere.gerer", module: "ministere", category: "editorial", description: "Modifier les pages du Ministère (Le Ministre, Directions, Structures, Cabinet, Missions, Partenaires)" },

  // Pages & Ressources : Textes juridiques, e-Services, Opportunités, Liens utiles, Contacts spécifiques, Pages légales, Plan du site
  { code: "ressources.voir", module: "ressources", category: "editorial", description: "Voir les pages secondaires (textes juridiques, e-Services, opportunités, liens utiles, contacts, pages légales, plan du site)" },
  { code: "ressources.gerer", module: "ressources", category: "editorial", description: "Modifier les pages secondaires (textes juridiques, e-Services, opportunités, liens utiles, contacts, pages légales, plan du site)" },

  // Stratégie IA : Piliers, Jalons, Olympiades, Critères
  { code: "strategie_ia.voir", module: "strategie_ia", category: "editorial", description: "Voir le contenu de la Stratégie IA (piliers, jalons, olympiades, critères)" },
  { code: "strategie_ia.gerer", module: "strategie_ia", category: "editorial", description: "Modifier le contenu de la Stratégie IA (piliers, jalons, olympiades, critères)" },

  // ══════════════════════ ADMINISTRATION TECHNIQUE ══════════════════════

  // Utilisateurs
  { code: "utilisateurs.voir", module: "utilisateurs", category: "technique", description: "Voir la liste des utilisateurs" },
  { code: "utilisateurs.creer", module: "utilisateurs", category: "technique", description: "Créer un utilisateur" },
  { code: "utilisateurs.modifier", module: "utilisateurs", category: "technique", description: "Modifier un utilisateur" },
  { code: "utilisateurs.supprimer", module: "utilisateurs", category: "technique", description: "Supprimer (logiquement) un utilisateur" },

  // Rôles & permissions
  { code: "roles.voir", module: "roles", category: "technique", description: "Voir les rôles" },
  { code: "roles.gerer", module: "roles", category: "technique", description: "Créer, modifier, supprimer des rôles et leurs permissions" },

  // Journal d'audit
  { code: "logs.voir", module: "logs", category: "technique", description: "Consulter le journal d'audit" },

  // Sécurité
  { code: "securite.modifier", module: "securite", category: "technique", description: "Modifier les paramètres de sécurité globaux (2FA, SMTP)" },

  // Paramètres généraux du site (nom, logos, réseaux sociaux)
  { code: "parametres.modifier", module: "parametres", category: "technique", description: "Modifier les paramètres généraux du site (nom, logos, réseaux sociaux)" },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]["code"];

// Libellés et ordre d'affichage des groupes dans l'écran Rôles.
export const PERMISSION_CATEGORIES: { key: "editorial" | "technique"; label: string; description: string }[] = [
  { key: "editorial", label: "Contenu éditorial", description: "Ce qui est visible sur le site public" },
  { key: "technique", label: "Administration technique", description: "Comptes, sécurité, système — sans rapport avec le contenu" },
];

export const PERMISSION_MODULES: { key: string; label: string }[] = [
  { key: "accueil", label: "Accueil" },
  { key: "actualites", label: "Actualités & Médias" },
  { key: "ministere", label: "Le Ministère" },
  { key: "ressources", label: "Pages & Ressources" },
  { key: "strategie_ia", label: "Stratégie IA" },
  { key: "utilisateurs", label: "Utilisateurs" },
  { key: "roles", label: "Rôles & permissions" },
  { key: "logs", label: "Journal d'audit" },
  { key: "securite", label: "Sécurité" },
  { key: "parametres", label: "Paramètres généraux" },
];

export const SUPER_ADMIN_ROLE_NAME = "Super Admin";

// Petit utilitaire pour les routes API : renvoie true/false selon si la
// session a la permission demandée (à utiliser avec requireSession() de
// lib/auth.ts, ex: if (!hasPerm(session, "utilisateurs.modifier")) return 403).
export function hasPerm(session: { permissions: string[] }, code: PermissionCode): boolean {
  return session.permissions.includes(code);
}
