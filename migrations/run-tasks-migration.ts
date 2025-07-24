import { migrate } from './create-tasks-table';

/**
 * Exécute la migration pour créer la table des tâches des agents
 */
async function runMigration() {
  try {
    const success = await migrate();
    
    if (success) {
      console.log('Migration de la table des tâches terminée avec succès!');
      process.exit(0);
    } else {
      console.error('Échec de la migration de la table des tâches.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();