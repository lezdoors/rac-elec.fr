import { db } from "../server/db";
import { users } from "../shared/schema";
import { userStats } from "../shared/schema-user-stats";
import { eq } from "drizzle-orm";
import { userStatsService } from "../server/user-stats-service";

/**
 * Script d'initialisation des statistiques utilisateurs
 * Crée des statistiques par défaut pour chaque utilisateur
 */
async function initUserStats() {
  try {
    console.log("Démarrage de l'initialisation des statistiques utilisateurs...");
    
    // Récupérer tous les utilisateurs
    const allUsers = await db.select().from(users);
    console.log(`${allUsers.length} utilisateurs trouvés.`);
    
    // Récupérer les statistiques existantes
    const existingStats = await db.select().from(userStats);
    console.log(`${existingStats.length} statistiques utilisateurs existantes.`);
    
    const usersWithStats = new Set(existingStats.map(stat => stat.userId));
    console.log(`${usersWithStats.size} utilisateurs ont déjà des statistiques.`);
    
    // Initialiser les statistiques pour les utilisateurs qui n'en ont pas
    let createdCount = 0;
    for (const user of allUsers) {
      if (!usersWithStats.has(user.id)) {
        await userStatsService.initializeUserStats(user.id);
        createdCount++;
      }
    }
    
    console.log(`${createdCount} nouvelles statistiques utilisateurs ont été créées.`);
    console.log("Initialisation des statistiques utilisateurs terminée avec succès.");
    
    return {
      totalUsers: allUsers.length,
      existingStats: existingStats.length,
      created: createdCount
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des statistiques utilisateurs:", error);
    throw error;
  }
}

// Le script peut être importé ou exécuté directement
// Avec l'importation dynamique via ESM, ceci n'est plus nécessaire
// mais nous le gardons pour la compatibilité avec les scripts CLI
if (typeof require !== 'undefined' && require.main === module) {
  initUserStats()
    .then(result => {
      console.log("Résultat de l'initialisation:", result);
      process.exit(0);
    })
    .catch(error => {
      console.error("Erreur d'initialisation:", error);
      process.exit(1);
    });
}

export { initUserStats };