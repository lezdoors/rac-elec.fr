/**
 * Ce script réinitialise toutes les animations de l'interface utilisateur
 * Il supprime les animations existantes et les remplace par les animations par défaut
 */

import { db } from '../server/db.js';
import { uiAnimations } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Suppression des animations existantes...');
    await db.delete(uiAnimations);
    console.log('Animations supprimées avec succès.');
    
    console.log('Pour réinitialiser, redémarrez l\'application.');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des animations:', error);
  } finally {
    process.exit(0);
  }
}

main();