import { useEffect } from 'react';

/**
 * Composant qui améliore l'accessibilité du site
 * Sans perturber les fonctionnalités existantes
 */
const AccessibilityChecker = () => {
  useEffect(() => {
    // Application de correctifs d'accessibilité sans perturber l'existant
    const applyAccessibilityFixes = () => {
      try {
        // 1. Amélioration des contrastes pour les éléments visuels
        document.querySelectorAll('.text-green-500, .text-green-400').forEach(el => {
          el.classList.add('text-green-700');
        });

        // 2. S'assurer que tous les boutons ont un texte accessible
        document.querySelectorAll('button:not([aria-label]):not([title])').forEach(button => {
          if (!button.textContent?.trim()) {
            // Ajouter un aria-label basé sur les icônes ou la position
            const icon = button.querySelector('svg, img');
            if (icon && icon.getAttribute('data-icon')) {
              button.setAttribute('aria-label', `Bouton ${icon.getAttribute('data-icon')}`);
            }
          }
        });

        // 3. Vérifier les alt des images
        document.querySelectorAll('img:not([alt])').forEach(img => {
          const parent = img.parentElement;
          const nearText = parent?.textContent?.trim();
          img.setAttribute('alt', nearText || 'Image');
        });

        console.log('✅ Améliorations d\'accessibilité appliquées');
      } catch (error) {
        // Éviter les erreurs bloquantes
        console.error('Erreur non critique lors des améliorations d\'accessibilité:', error);
      }
    };

    // Appliquer après le chargement de la page
    if (document.readyState === 'complete') {
      applyAccessibilityFixes();
    } else {
      window.addEventListener('load', applyAccessibilityFixes);
    }

    // Nettoyage
    return () => {
      window.removeEventListener('load', applyAccessibilityFixes);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
};

export default AccessibilityChecker;