import { migrate } from './add-contact-priority-migration';

/**
 * Exécute la migration pour ajouter les colonnes priority et subject à la table des contacts
 */
async function runMigration() {
  try {
    const success = await migrate();
    
    if (success) {
      console.log('Migration des colonnes priority et subject terminée avec succès!');
      process.exit(0);
    } else {
      console.error('Échec de la migration des colonnes priority et subject.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();