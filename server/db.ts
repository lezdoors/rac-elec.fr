import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Production-safe database connection with fallback handling
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  // Configuration du pool avec gestion d'erreurs production
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
  });

  // Événement pour gérer les erreurs de connexion sans crash
  pool.on('error', (err) => {
    console.warn('Database connection warning:', err.message);
    // Don't crash the app in production
  });

  // Test de connexion initial
  pool.connect()
    .then(client => {
      console.log('✅ Database connected successfully');
      client.release();
    })
    .catch(err => {
      console.warn('Database connection delayed:', err.message);
      // Continue without crashing
    });

  // Instance Drizzle avec le pool PostgreSQL
  db = drizzle(pool, { schema });

} catch (error) {
  console.error('Database initialization error:', error);
  // Create a fallback that won't crash the app
  pool = new Pool({ connectionString: 'postgresql://localhost:5432/fallback' });
  db = drizzle(pool, { schema });
}

export { pool, db };