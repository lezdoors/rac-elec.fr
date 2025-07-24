// Script de test pour les notifications
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createTestNotification() {
  try {
    console.log('Création d\'une notification de test...');
    
    // Insérer une notification de test
    await db.execute(sql`
      INSERT INTO notifications (type, title, message, read, data)
      VALUES ('system', 'Notification de test', 'Ceci est une notification de test pour vérifier le système', false, '{"test": true}'::jsonb);
    `);
    
    console.log('Notification de test créée avec succès.');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la création de la notification de test:', error);
    return { success: false, error: error.message };
  }
}

createTestNotification()
  .then(result => {
    if (result.success) {
      console.log('Test terminé avec succès.');
    } else {
      console.error('Test échoué:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur inattendue:', error);
    process.exit(1);
  });
