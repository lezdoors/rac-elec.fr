import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function addReferenceNumberColumn() {
  console.log('Ajout de la colonne reference_number à la table leads...');
  try {
    await db.execute(sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reference_number TEXT;`);
    console.log('Colonne reference_number ajoutée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la colonne:', error);
    throw error;
  }
}

addReferenceNumberColumn().then(() => {
  console.log('Migration terminée.');
  process.exit(0);
}).catch(error => {
  console.error('Erreur lors de la migration:', error);
  process.exit(1);
});
