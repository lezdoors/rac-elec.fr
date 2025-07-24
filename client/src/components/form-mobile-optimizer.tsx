import { useEffect } from 'react';
import { useIsMobile } from '@/lib/mobile-optimizations';

/**
 * Composant qui optimise le formulaire pour l'affichage mobile
 * Ce composant n'affiche rien, il modifie seulement le DOM pour améliorer l'expérience mobile
 */
export function FormMobileOptimizer() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Fonction pour appliquer les classes aux boutons radio du type de client
    const optimizeClientTypeRadios = () => {
      // Sélectionner le conteneur des boutons radio du type de client
      const clientTypeContainer = document.querySelector('[data-name="clientType"]');
      if (!clientTypeContainer) return;

      // Trouver le conteneur de la grille des options
      const gridContainer = clientTypeContainer.querySelector('.grid');
      if (gridContainer) {
        gridContainer.classList.add('radio-client-type-container');
        
        // Sélectionner toutes les options (les divs contenant les boutons radio)
        const options = gridContainer.querySelectorAll('div[class*="border"]');
        options.forEach(option => {
          option.classList.add('radio-client-type-option');
          
          // Optimiser les icônes et textes à l'intérieur
          const icon = option.querySelector('svg');
          if (icon) icon.classList.add('radio-client-type-icon');
          
          const title = option.querySelector('h4');
          if (title) title.classList.add('radio-client-type-label');
          
          const description = option.querySelector('p');
          if (description) description.classList.add('radio-client-type-description');
        });
      }
    };

    // Fonction pour optimiser la barre de progression
    const optimizeProgressBar = () => {
      // Sélectionner le conteneur de la barre de progression
      const progressContainer = document.querySelector('.progress-bar-container') || 
                               document.querySelector('div[class*="relative pt-1"]');
      
      if (progressContainer) {
        progressContainer.classList.add('progress-container');
        
        // Optimiser les cercles d'étape
        const stepCircles = document.querySelectorAll('[class*="rounded-full"]');
        stepCircles.forEach(circle => {
          circle.classList.add('progress-step-circle');
        });
        
        // Optimiser les labels d'étape
        const stepLabels = document.querySelectorAll('[class*="whitespace-nowrap"]');
        stepLabels.forEach(label => {
          label.classList.add('progress-step-label');
        });
        
        // Optimiser les connecteurs entre étapes
        const connectors = document.querySelectorAll('[class*="h-0.5 bg-gray-200"]');
        connectors.forEach(connector => {
          connector.classList.add('progress-connector');
        });
      }
      
      // Optimiser la barre de progression en pourcentage
      const percentageLabel = document.querySelector('span[class*="text-xs font-semibold inline-block"]');
      if (percentageLabel) {
        percentageLabel.classList.add('progress-percentage');
      }
    };

    // Fonction pour optimiser les boutons de navigation
    const optimizeNavigationButtons = () => {
      // Sélectionner le conteneur des boutons
      const buttonContainer = document.querySelector('div[class*="flex justify-between"]');
      if (buttonContainer) {
        buttonContainer.classList.add('step-buttons-container');
        
        // Optimiser tous les boutons
        const buttons = buttonContainer.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.add('step-button');
        });
      }
    };
    
    // Fonction pour optimiser les radios techniques (phase, type de projet, etc.)
    const optimizeTechnicalRadios = () => {
      // Optimiser les radios pour monophasé/triphasé
      const phaseTypeContainer = document.querySelector('[data-name="phaseType"]');
      if (phaseTypeContainer) {
        const radioContainer = phaseTypeContainer.querySelector('div[class*="flex"]');
        if (radioContainer) {
          radioContainer.classList.add('phase-type-container');
          
          const options = radioContainer.querySelectorAll('div[class*="flex items-center"]');
          options.forEach(option => {
            option.classList.add('phase-type-option');
          });
        }
      }
      
      // Optimiser les radios pour le type de projet
      const projectTypeContainer = document.querySelector('[data-name="buildingType"]');
      if (projectTypeContainer) {
        const radioContainer = projectTypeContainer.querySelector('div[class*="grid"]');
        if (radioContainer) {
          radioContainer.classList.add('project-type-container');
          
          const options = radioContainer.querySelectorAll('div[class*="border"]');
          options.forEach(option => {
            option.classList.add('project-type-option');
          });
        }
      }
    };
    
    // Fonction pour optimiser les titres
    const optimizeTitles = () => {
      const stepTitles = document.querySelectorAll('h2[class*="text-lg"]');
      stepTitles.forEach(title => {
        title.classList.add('form-step-title');
      });
    };

    // Fonction principale qui exécute toutes les optimisations
    const applyAllOptimizations = () => {
      optimizeClientTypeRadios();
      optimizeProgressBar();
      optimizeNavigationButtons();
      optimizeTechnicalRadios();
      optimizeTitles();
    };

    // Appliquer les optimisations immédiatement
    applyAllOptimizations();

    // Observer les changements DOM pour appliquer les optimisations sur les nouveaux éléments
    const observer = new MutationObserver(mutations => {
      // Vérifier si des modifications pertinentes ont été faites
      const shouldOptimize = mutations.some(mutation => {
        // Vérifier les ajouts de noeuds
        if (mutation.addedNodes.length > 0) {
          return true;
        }
        // Vérifier les modifications d'attributs
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          return true;
        }
        return false;
      });
      
      if (shouldOptimize) {
        applyAllOptimizations();
      }
    });

    // Observer tout le document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Nettoyer l'observer quand le composant est démonté
    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  // Ce composant ne rend rien visuellement
  return null;
}

export default FormMobileOptimizer;