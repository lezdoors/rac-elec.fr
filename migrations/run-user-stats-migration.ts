import { migrate } from './add-user-stats-tables';

/**
 * Exécute la migration pour créer les tables de statistiques utilisateurs
 */
async function runMigration() {
  console.log('Démarrage de la migration pour créer les tables de statistiques utilisateurs...');
  
  try {
    await migrate();
    console.log('Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration();