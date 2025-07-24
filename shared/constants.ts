// Rôles d'utilisateurs
/**
 * Constantes pour les rôles utilisateurs
 * Correspond exactement aux valeurs dans le schéma et la base de données
 */
export const USER_ROLES = {
  ADMIN: 'admin',    // Administrateur système - tous les droits
  MANAGER: 'manager', // Responsable - peut assigner des demandes aux agents et gérer les paiements
  AGENT: 'agent',    // Agent - traite les demandes qui lui sont assignées
};