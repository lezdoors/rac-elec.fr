import { migrate } from './create-performance-metrics-table';

/**
 * Exécute la migration pour créer la table des métriques de performance
 */
async function runMigration() {
  try {
    await migrate();
    console.log('Migration des métriques de performance terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration des métriques de performance:', error);
    process.exit(1);
  }
}

runMigration();
