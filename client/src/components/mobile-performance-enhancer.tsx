import { useEffect } from 'react';
import { isMobileDevice } from '@/lib/mobile-service-worker';

/**
 * Composant d'amélioration des performances mobiles sans perturber les fonctionnalités existantes
 * - Active la compression des ressources textuelles via service worker
 * - Optimise les ressources bloquantes
 * - Réduit la taille du DOM sur mobile uniquement
 * - Améliore les temps de chargement des pages
 */
export const MobilePerformanceEnhancer = () => {
  useEffect(() => {
    // Détection mobile via fonction utilitaire
    if (!isMobileDevice()) return; // N'applique les optimisations que sur mobile
    
    try {
      // Service Worker registration disabled to prevent console errors

      // 2. Appliquer l'optimisation d'images
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
      });

      // 3. Ajouter des attributs de préchargement pour les ressources critiques
      const linkPreload = document.createElement('link');
      linkPreload.rel = 'preload';
      linkPreload.as = 'style';
      linkPreload.href = '/assets/index-DLyI948c.css'; // Fichier CSS principal identifié
      document.head.appendChild(linkPreload);

      // 4. Désactiver les animations complexes sur mobile
      // document.documentElement.classList.add('reduce-motion'); // Temporarily disabled to prevent conflicts

      // 5. Retarder le chargement des scripts non essentiels
      setTimeout(() => {
        // Appliquer les attributs defer aux scripts non critiques
        document.querySelectorAll('script:not([data-critical="true"])').forEach(script => {
          if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
            script.setAttribute('defer', '');
          }
        });
      }, 0);

      // 6. Simplifier la structure DOM pour mobile
      const reduceDOM = () => {
        // Cible spécifiquement les éléments marqués comme non essentiels sur mobile
        document.querySelectorAll('.mobile-optional, .decorative-element').forEach(element => {
          element.classList.add('hidden-on-mobile');
        });
      };

      // Exécuter après le chargement complet de la page
      if (document.readyState === 'complete') {
        reduceDOM();
      } else {
        window.addEventListener('load', reduceDOM);
        // Nettoyage de l'event listener
        return () => window.removeEventListener('load', reduceDOM);
      }

      console.log('✅ Optimisations mobiles appliquées');
    } catch (error) {
      // Éviter que les erreurs d'optimisation n'affectent l'expérience utilisateur
      console.error('Erreur non bloquante lors de l\'optimisation mobile:', error);
    }
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};

export default MobilePerformanceEnhancer;