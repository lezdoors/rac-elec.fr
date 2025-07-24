import { db } from "../server/db";

/**
 * Migration pour ajouter les champs de statut et de suivi aux leads
 */
async function addLeadStatusFields() {
  try {
    // Forcer l'ajout des colonnes nécessaires
    console.log("Ajout forcé des champs manquants à la table 'leads'...");
    console.log("Ajout des champs status, statusUpdatedAt, statusUpdatedBy, callbackDate et callbackNotes à la table 'leads'...");
    
    await db.execute(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
      ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS status_updated_by INTEGER,
      ADD COLUMN IF NOT EXISTS callback_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS callback_notes TEXT
    `);
    
    console.log("Champs ajoutés avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout des champs:", error);
    throw error;
  }
}

// Exécuter la migration
addLeadStatusFields()
  .then(() => {
    console.log("Migration terminée avec succès");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration échouée:", error);
    process.exit(1);
  });
