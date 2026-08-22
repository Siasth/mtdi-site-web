// Catalogue central des permissions. Toute nouvelle fonctionnalité back-office
// doit ajouter ses permissions ici, puis elles apparaissent automatiquement
// dans l'écran de gestion des rôles (case à cocher par permission).

export const PERMISSIONS = [
  // Actualités
  { code: "actualites.voir", module: "actualites", description: "Voir les actualités" },
  { code: "actualites.creer", module: "actualites", description: "Créer une actualité" },
  { code: "actualites.modifier", module: "actualites", description: "Modifier une actualité" },
  { code: "actualites.supprimer", module: "actualites", description: "Supprimer (logiquement) une actualité" },
  { code: "actualites.restaurer", module: "actualites", description: "Restaurer une actualité supprimée" },

  // Catégories d'actualités
  { code: "categories.voir", module: "categories", description: "Voir les catégories" },
  { code: "categories.gerer", module: "categories", description: "Créer, modifier, supprimer des catégories" },

  // Chiffres clés (page d'accueil)
  { code: "stats.voir", module: "stats", description: "Voir les chiffres clés" },
  { code: "stats.gerer", module: "stats", description: "Créer, modifier, supprimer des chiffres clés" },

  // Galerie (collections + éléments photo/vidéo)
  { code: "galerie.voir", module: "galerie", description: "Voir la galerie" },
  { code: "galerie.gerer", module: "galerie", description: "Créer, modifier, supprimer des éléments et collections de la galerie" },

  // Contenu général (hero, chantiers, galerie, direct, ministre, stats)
  { code: "contenu.modifier", module: "contenu", description: "Modifier le contenu des pages (hero, chantiers, galerie, direct, ministre, stats)" },

  // Utilisateurs
  { code: "utilisateurs.voir", module: "utilisateurs", description: "Voir la liste des utilisateurs" },
  { code: "utilisateurs.creer", module: "utilisateurs", description: "Créer un utilisateur" },
  { code: "utilisateurs.modifier", module: "utilisateurs", description: "Modifier un utilisateur" },
  { code: "utilisateurs.supprimer", module: "utilisateurs", description: "Supprimer (logiquement) un utilisateur" },

  // Rôles & permissions
  { code: "roles.voir", module: "roles", description: "Voir les rôles" },
  { code: "roles.gerer", module: "roles", description: "Créer, modifier, supprimer des rôles et leurs permissions" },

  // Journal d'audit
  { code: "logs.voir", module: "logs", description: "Consulter le journal d'audit" },

  // Sécurité
  { code: "securite.modifier", module: "securite", description: "Modifier les paramètres de sécurité globaux" },

  // Paramètres généraux du site (nom, logos, réseaux sociaux)
  { code: "parametres.modifier", module: "parametres", description: "Modifier les paramètres généraux du site (nom, logos, réseaux sociaux)" },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]["code"];

export const SUPER_ADMIN_ROLE_NAME = "Super Admin";

// Petit utilitaire pour les routes API : renvoie true/false selon si la
// session a la permission demandée (à utiliser avec requireSession() de
// lib/auth.ts, ex: if (!hasPerm(session, "utilisateurs.gerer")) return 403).
export function hasPerm(session: { permissions: string[] }, code: PermissionCode): boolean {
  return session.permissions.includes(code);
}
