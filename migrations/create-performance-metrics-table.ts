import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configuration pour Neon Database
neonConfig.webSocketConstructor = ws;
import { sql } from 'drizzle-orm';

/**
 * Migration pour créer la table des métriques de performance
 */
async function createPerformanceMetricsTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Vérifier si la table existe déjà
  const tableExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'performance_metrics'
    ) as exists;
  `);

  console.log('Vérification de la table:', tableExists);
  
  // Si la table n'existe pas, la créer
  const exists = tableExists[0]?.exists === true;
  if (!exists) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        route TEXT NOT NULL,
        load_time INTEGER NOT NULL,
        memory_usage INTEGER,
        cpu_usage DECIMAL(5,2),
        user_agent TEXT,
        user_id INTEGER,
        status_code INTEGER,
        request_size INTEGER,
        response_size INTEGER,
        server_info JSONB
      );
    `);
    console.log('Table performance_metrics créée avec succès');
  } else {
    console.log('La table performance_metrics existe déjà');
  }

  await pool.end();
}

/**
 * Fonction principale de migration
 */
export async function migrate() {
  console.log('Démarrage de la migration pour les métriques de performance...');
  await createPerformanceMetricsTable();
  console.log('Migration des métriques de performance terminée');
}

/**
 * Fonction de rollback (suppression de la table)
 */
export async function rollback() {
  console.log('Démarrage du rollback pour les métriques de performance...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  await db.execute(sql`DROP TABLE IF EXISTS performance_metrics`);
  console.log('Table performance_metrics supprimée');
  
  await pool.end();
  console.log('Rollback des métriques de performance terminé');
}
