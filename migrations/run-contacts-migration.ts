import { migrate } from './add-contacts-table';

async function runMigration() {
  try {
    await migrate();
    console.log('Migration des contacts terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration des contacts:', error);
    process.exit(1);
  }
}

runMigration();
