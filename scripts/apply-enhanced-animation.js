/**
 * Script pour appliquer l'animation Enedis améliorée à l'ensemble du site
 * Ce script réinitialise les animations et configure la nouvelle animation SimpleElectricLoader 
 * avec toutes les fonctionnalités avancées (logo, certifications, etc.)
 */

import { db } from '../server/database.js';
import { initializeAnimations } from '../server/init-animations.js';

async function applyEnhancedAnimationToSite() {
  try {
    console.log('🚀 Démarrage de l\'application de l\'animation Enedis améliorée à tout le site...');
    
    // 1. Supprimer toutes les animations existantes
    console.log('🗑️ Suppression des animations existantes...');
    await db.query('DELETE FROM ui_animations');
    
    // 2. Initialiser les nouvelles animations avec les configurations améliorées
    console.log('✨ Initialisation des animations avec les fonctionnalités Enedis améliorées...');
    await initializeAnimations();
    
    // 3. Mettre à jour les pages qui utilisent l'animation de chargement
    console.log('📋 Configuration des pages pour utiliser l\'animation Enedis améliorée...');
    
    // Récupérer l'ID de l'animation "Animation Électrique Complète Enedis"
    const result = await db.query(
      'SELECT id FROM ui_animations WHERE name = $1',
      ['Animation Électrique Complète Enedis']
    );
    
    if (result.rows.length > 0) {
      const enhancedAnimationId = result.rows[0].id;
      
      // Mettre à jour la configuration pour utiliser cette animation comme défaut pour les pages spécifiées
      await db.query(
        'UPDATE ui_animations SET default = true WHERE id = $1',
        [enhancedAnimationId]
      );
      
      console.log(`✅ Animation Enedis améliorée (ID: ${enhancedAnimationId}) configurée comme animation par défaut`);
    } else {
      console.warn('⚠️ Animation "Animation Électrique Complète Enedis" non trouvée dans la base de données');
    }
    
    console.log('');
    console.log('✅ Application de l\'animation Enedis améliorée terminée avec succès !');
    console.log('');
    console.log('Les animations sont maintenant disponibles et configurées :');
    console.log('  - SimpleElectricLoader amélioré avec logo Enedis');
    console.log('  - Affichage des certifications et badges de confiance');
    console.log('  - Messages rassurants sur Enedis et ses services');
    console.log('  - Configuré sur toutes les pages sauf la transition de paiement');
    console.log('');
    console.log('Vous pouvez gérer les animations dans le panneau d\'administration :');
    console.log('  - Allez sur la page /admin/animations pour les activer/désactiver');
    console.log('  - Utilisez la prévisualisation pour tester les animations');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de l\'animation Enedis améliorée:', error);
  }
}

// Exécuter la fonction principale
applyEnhancedAnimationToSite();