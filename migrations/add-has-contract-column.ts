/**
 * Migration pour ajouter la colonne hasContract (has_contract) à la table des leads
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { boolean } from "drizzle-orm/pg-core";
import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

// Fonction principale pour exécuter la migration
async function addHasContractColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL doit être défini dans les variables d'environnement");
  }

  // Connexion à la base de données
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log("Ajout de la colonne 'has_contract' à la table 'leads'...");

    // Vérifier si la colonne existe déjà
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'has_contract';
    `;
    const columnExists = await client.unsafe(checkColumnQuery);

    if (columnExists.length === 0) {
      // La colonne n'existe pas, on l'ajoute
      await client.unsafe(`
        ALTER TABLE leads
        ADD COLUMN has_contract BOOLEAN DEFAULT FALSE;
      `);
      console.log("Colonne 'has_contract' ajoutée avec succès.");
    } else {
      console.log("La colonne 'has_contract' existe déjà.");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne 'has_contract':", error);
    throw error;
  } finally {
    // Fermer la connexion à la base de données
    await client.end();
  }
}

// Exécution de la migration
addHasContractColumn()
  .then(() => {
    console.log("Migration terminée avec succès.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  });

export { addHasContractColumn };
