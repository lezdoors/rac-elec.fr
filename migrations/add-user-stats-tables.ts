import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Migration pour créer les tables de statistiques utilisateurs
 */
async function createUserStatsTables() {
  // Créer la table user_stats
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      leads_received INTEGER NOT NULL DEFAULT 0,
      leads_converted INTEGER DEFAULT 0,
      payments_processed INTEGER DEFAULT 0,
      payments_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      commissions_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
      period_start TIMESTAMP NOT NULL,
      period_end TIMESTAMP NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Créer la table user_stats_history
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_stats_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      period_start TIMESTAMP NOT NULL,
      period_end TIMESTAMP NOT NULL,
      leads_received INTEGER NOT NULL DEFAULT 0,
      leads_converted INTEGER DEFAULT 0,
      payments_processed INTEGER DEFAULT 0,
      payments_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      commissions_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
      daily_data JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  console.log('Tables de statistiques utilisateurs créées avec succès');
}

/**
 * Fonction principale de migration
 */
export async function migrate() {
  try {
    await createUserStatsTables();
  } catch (error) {
    console.error('Erreur lors de la création des tables de statistiques utilisateurs:', error);
    throw error;
  }
}

/**
 * Fonction de rollback (suppression des tables)
 */
export async function rollback() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS user_stats_history`);
    await db.execute(sql`DROP TABLE IF EXISTS user_stats`);
    console.log('Tables de statistiques utilisateurs supprimées avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression des tables de statistiques utilisateurs:', error);
    throw error;
  }
}