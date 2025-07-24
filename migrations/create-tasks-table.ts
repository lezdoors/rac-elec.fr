import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Migration pour créer la table des tâches des agents
 */
async function createTasksTable() {
  try {
    console.log('Vérification de l\'existence de la table tasks...');
    
    // Vérifier si la table existe déjà
    const checkTable = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agent_tasks'
      );
    `);
    
    const tableExists = checkTable.rows[0]?.exists;
    
    if (tableExists) {
      console.log('La table agent_tasks existe déjà.');
      return true;
    }
    
    console.log('Création de la table agent_tasks...');
    
    // Créer la table des tâches
    await db.execute(sql`
      CREATE TABLE agent_tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'pending',
        related_type TEXT,
        related_id INTEGER,
        remind_at TIMESTAMP,
        reminder_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    
    // Ajouter un index sur l'ID utilisateur
    await db.execute(sql`
      CREATE INDEX agent_tasks_user_id_idx ON agent_tasks (user_id)
    `);
    
    // Ajouter un index sur le statut + date d'échéance pour les requêtes fréquentes
    await db.execute(sql`
      CREATE INDEX agent_tasks_status_due_date_idx ON agent_tasks (status, due_date)
    `);
    
    console.log('Table agent_tasks créée avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de la table agent_tasks:', error);
    return false;
  }
}

/**
 * Fonction principale de migration
 */
export async function migrate() {
  return await createTasksTable();
}

/**
 * Fonction de rollback (suppression de la table)
 */
export async function rollback() {
  try {
    console.log('Suppression de la table agent_tasks...');
    
    await db.execute(sql`
      DROP TABLE IF EXISTS agent_tasks
    `);
    
    console.log('Table agent_tasks supprimée avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la table agent_tasks:', error);
    return false;
  }
}