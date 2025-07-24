import { db } from "../server/db";
import { sql } from "drizzle-orm";

export async function migrate() {
  console.log("--- Exécution de la migration: add-contacts-table ---");

  try {
    // Vérifier si la table contacts existe déjà
    const tableExists = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      )`
    );
    
    if (tableExists.rows[0].exists) {
      console.log("La table contacts existe déjà, migration ignorée.");
      return;
    }

    console.log("Création de la table contacts...");
    
    // Créer la table contacts
    await db.execute(sql`
      CREATE TABLE contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        message TEXT NOT NULL,
        source VARCHAR(100) NOT NULL DEFAULT 'contact_form',
        ip_address VARCHAR(50),
        user_agent TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        read_at TIMESTAMP WITH TIME ZONE,
        read_by INTEGER REFERENCES users(id),
        replied_at TIMESTAMP WITH TIME ZONE,
        replied_by INTEGER REFERENCES users(id)
      )
    `);
    
    // Créer un index sur le status pour faciliter les recherches
    await db.execute(sql`
      CREATE INDEX contacts_status_idx ON contacts (status)
    `);
    
    // Créer un index sur la date de création pour le tri
    await db.execute(sql`
      CREATE INDEX contacts_created_at_idx ON contacts (created_at DESC)
    `);

    console.log("La table contacts a été créée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la création de la table contacts:", error);
    throw error;
  }
}

export async function rollback() {
  console.log("--- Exécution du rollback: add-contacts-table ---");

  try {
    // Vérifier si la table contacts existe
    const tableExists = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      )`
    );
    
    if (!tableExists.rows[0].exists) {
      console.log("La table contacts n'existe pas, rollback ignoré.");
      return;
    }

    console.log("Suppression de la table contacts...");
    
    // Supprimer la table contacts
    await db.execute(sql`DROP TABLE IF EXISTS contacts CASCADE`);

    console.log("La table contacts a été supprimée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la suppression de la table contacts:", error);
    throw error;
  }
}