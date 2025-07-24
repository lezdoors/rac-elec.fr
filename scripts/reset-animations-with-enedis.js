/**
 * Script pour réinitialiser les animations et configurer les animations Enedis améliorées
 * Ce script applique les nouvelles propriétés showLogo et showCertifications
 * à l'animation SimpleElectricLoader
 */

import { db } from '../server/database.js';
import { storage } from '../server/storage.js';
import { initializeAnimations } from '../server/init-animations.js';

async function resetAnimationsWithEnedisUpdates() {
  try {
    console.log('🔄 Démarrage de la réinitialisation des animations avec les mises à jour Enedis...');
    
    // 1. Supprimer toutes les animations existantes
    console.log('🗑️ Suppression des animations existantes...');
    await storage.deleteAllUiAnimations();
    
    // 2. Initialiser les animations avec les nouvelles configurations
    console.log('✨ Initialisation des animations avec les nouvelles configurations Enedis...');
    await initializeAnimations();
    
    console.log('✅ Réinitialisation des animations terminée avec succès !');
    console.log('');
    console.log('Nouvelles propriétés ajoutées aux animations SimpleElectricLoader :');
    console.log('  - showLogo: Affiche le logo officiel Enedis');
    console.log('  - showCertifications: Affiche les certifications ISO 9001, 24/7 et RGPD');
    console.log('');
    console.log('Les animations sont maintenant disponibles dans le panneau d\'administration.');
    console.log('Allez sur la page /admin/animations pour les gérer et les prévisualiser.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation des animations:', error);
  }
}

// Exécuter la fonction principale
resetAnimationsWithEnedisUpdates();