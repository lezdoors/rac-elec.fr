import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Migration pour ajouter les colonnes priorité et sujet à la table des contacts
 */
async function addContactPriorityFields() {
  try {
    console.log('Vérification des colonnes priority et subject dans la table contacts...');
    
    // Vérifier si la colonne priority existe déjà
    const checkPriorityColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'priority'
    `);
    
    // Vérifier si la colonne subject existe déjà
    const checkSubjectColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'subject'
    `);
    
    // Ajouter la colonne priority si elle n'existe pas
    if (checkPriorityColumn.rows.length === 0) {
      console.log('Ajout de la colonne priority à la table contacts...');
      await db.execute(sql`
        ALTER TABLE contacts
        ADD COLUMN priority TEXT DEFAULT 'normal'
      `);
      console.log('Colonne priority ajoutée avec succès.');
    } else {
      console.log('La colonne priority existe déjà.');
    }
    
    // Ajouter la colonne subject si elle n'existe pas
    if (checkSubjectColumn.rows.length === 0) {
      console.log('Ajout de la colonne subject à la table contacts...');
      await db.execute(sql`
        ALTER TABLE contacts
        ADD COLUMN subject TEXT
      `);
      console.log('Colonne subject ajoutée avec succès.');
    } else {
      console.log('La colonne subject existe déjà.');
    }
    
    console.log('Migration des colonnes de contact terminée avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la migration des colonnes de contact:', error);
    return false;
  }
}

/**
 * Fonction principale de migration
 */
export async function migrate() {
  return await addContactPriorityFields();
}

/**
 * Fonction de rollback (suppression des colonnes)
 */
export async function rollback() {
  try {
    console.log('Suppression des colonnes priority et subject de la table contacts...');
    
    await db.execute(sql`
      ALTER TABLE contacts
      DROP COLUMN IF EXISTS priority,
      DROP COLUMN IF EXISTS subject
    `);
    
    console.log('Colonnes supprimées avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors du rollback des colonnes:', error);
    return false;
  }
}