/**
 * Script pour réinitialiser les animations et configurer l'animation simple comme animation par défaut
 */

import { db } from '../server/db.js';
import { uiAnimations } from '../shared/schema.js';

async function resetToSimpleAnimation() {
  try {
    console.log('Suppression des animations existantes...');
    // Supprimer les animations existantes
    await db.delete(uiAnimations);
    
    console.log('Initialisation des animations par défaut...');
    
    // Créer les animations par défaut
    const defaultAnimations = [
      {
        name: 'Animation Électrique Simple',
        type: 'spinner',
        category: 'loading',
        component: 'SimpleElectricLoader',
        enabled: true,
        default: true,
        config: {
          size: "md",
          showInfo: true,
          showBadges: true
        },
        pages: ['all'],
        lastModifiedBy: 1, // Administrateur (ID 1)
        lastModifiedAt: new Date(),
        createdAt: new Date()
      },
      {
        name: 'Animation Électrique Professionnelle',
        type: 'pulse',
        category: 'loading',
        component: 'ElectricLoader',
        enabled: true,
        default: false,
        config: {
          duration: 3000,
          size: "xl",
          text: "Chargement en cours, veuillez patienter...",
          showText: true,
          textPosition: "bottom",
          color: "#1d70b8",
          pulseEffect: true,
        },
        pages: ['admin', 'dashboard'],
        lastModifiedBy: 1, // Administrateur (ID 1)
        lastModifiedAt: new Date(),
        createdAt: new Date()
      }
    ];
    
    // Insérer les animations
    for (const anim of defaultAnimations) {
      await db.insert(uiAnimations).values(anim);
    }
    
    console.log('Configuration terminée avec succès.');
    console.log('Animation simple Enedis configurée comme animation par défaut.');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des animations:', error);
  } finally {
    process.exit();
  }
}

// Exécuter la fonction
resetToSimpleAnimation();