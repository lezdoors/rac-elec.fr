import { migrate } from './create-notifications-table';

async function runMigration() {
  console.log('Démarrage de la migration pour la table notifications...');
  
  try {
    const result = await migrate();
    console.log(result.message);
    
    if (result.success) {
      console.log('Migration terminée avec succès.');
    } else {
      console.error('Erreur lors de la migration:', result.message);
    }
  } catch (error) {
    console.error('Erreur inattendue lors de la migration:', error);
  }
  
  process.exit(0);
}

runMigration();
