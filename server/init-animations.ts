/**
 * Script d'initialisation des animations par défaut
 * Ce script ajoute des animations prédéfinies à la base de données
 * s'il n'y a pas déjà d'animations configurées
 */

import { storage } from './storage';
import { InsertUiAnimation } from '@shared/schema';

const defaultAnimations: Omit<InsertUiAnimation, 'lastModifiedBy'>[] = [
  {
    name: 'Animation Électrique Simple',
    type: 'simple',
    category: 'loading',
    component: 'SimpleElectricLoader',
    enabled: true,
    default: true,
    config: {
      size: "md",
      showInfo: true,
      showBadges: true,
      showLogo: true,
      showCertifications: true
    },
    pages: ['all'],
  },
  {
    name: 'Animation Électrique Complète Enedis',
    type: 'enhanced',
    category: 'loading',
    component: 'SimpleElectricLoader',
    enabled: true,
    default: false,
    config: {
      size: "lg",
      showInfo: true,
      showBadges: true,
      showLogo: true,
      showCertifications: true
    },
    pages: ['home', 'raccordement-enedis', 'formulaire'],
  },
  {
    name: 'Animation Électrique Professionnelle',
    type: 'electric',
    category: 'startup',
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
  }
];

export async function initializeAnimations() {
  try {
    // Supprimer les animations existantes pour forcer la réinitialisation
    console.log('Suppression des animations existantes...');
    await storage.deleteAllUiAnimations();
    
    console.log('Initialisation des animations par défaut...');
    
    // Créer les animations par défaut
    for (const animation of defaultAnimations) {
      await storage.createUiAnimation({
        ...animation,
        lastModifiedBy: 1, // Administrateur (ID 1)
      });
    }
    
    console.log(`${defaultAnimations.length} animations par défaut ont été créées.`);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des animations:', error);
  }
}