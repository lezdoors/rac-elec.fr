import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Migration pour créer la table des notifications
 */
async function createNotificationsTable() {
  console.log('Création de la table des notifications...');
  
  try {
    // Vérifier si la table existe déjà
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);
    
    const exists = tableExists.rows[0]?.exists === true;
    
    if (!exists) {
      // Créer la table si elle n'existe pas
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          data JSONB
        );
      `);
      
      console.log('Table des notifications créée avec succès.');
    } else {
      console.log('La table des notifications existe déjà.');
    }
    
    return { success: true, message: 'Table des notifications prête.' };
  } catch (error) {
    console.error('Erreur lors de la création de la table des notifications:', error);
    return { success: false, message: `Erreur: ${error.message}` };
  }
}

export async function migrate() {
  return await createNotificationsTable();
}

export async function rollback() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS notifications;`);
    console.log('Table des notifications supprimée avec succès.');
    return { success: true, message: 'Table des notifications supprimée.' };
  } catch (error) {
    console.error('Erreur lors de la suppression de la table des notifications:', error);
    return { success: false, message: `Erreur: ${error.message}` };
  }
}
