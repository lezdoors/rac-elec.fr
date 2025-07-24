/**
 * Script pour appliquer un style uniforme aux options de raccordement
 * Ce script s'exécute après le chargement de la page et applique les styles
 * sans modifier le code source du formulaire
 */

document.addEventListener('DOMContentLoaded', function() {
  // Fonction qui applique les styles aux options
  function enhanceConnectionOptions() {
    // Style compact pour les conteneurs d'options sur mobile
    const optionsContainers = document.querySelectorAll('.type-options-container');
    
    if (optionsContainers.length > 0) {
      optionsContainers.forEach(container => {
        // Appliquer le style aux options de raccordement
        const optionItems = container.querySelectorAll('[class*="cursor-pointer"]');
        
        if (optionItems.length > 0) {
          // Conteneur parent pour le style de liste sur mobile
          if (window.innerWidth < 640) {
            const mobileContainer = container.querySelector('.block.sm\\:hidden');
            if (mobileContainer) {
              mobileContainer.querySelectorAll('.flex.flex-col > div').forEach(item => {
                item.classList.add('connection-option-mobile');
              });
            }
          }
          
          // Appliquer le style à chaque option
          optionItems.forEach(item => {
            // Ajouter une classe pour le style
            item.classList.add('connection-option-item');
            
            // Vérifier si l'option est sélectionnée
            if (item.classList.contains('border-blue-500') || 
                item.classList.contains('bg-blue-50')) {
              item.classList.add('selected');
            }
            
            // Ajouter un checkmark à droite si ce n'est pas déjà fait
            if (!item.querySelector('.option-checkmark')) {
              const checkmark = document.createElement('div');
              checkmark.className = 'option-checkmark';
              checkmark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
              item.appendChild(checkmark);
            }
          });
        }
      });
    }
  }

  // Appliquer les styles immédiatement
  enhanceConnectionOptions();
  
  // Réappliquer les styles après un court délai pour s'assurer que tout est chargé
  setTimeout(enhanceConnectionOptions, 500);
  
  // Réappliquer les styles lors d'une modification du DOM (pour les éléments chargés dynamiquement)
  const observer = new MutationObserver(enhanceConnectionOptions);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Ajouter les styles CSS nécessaires
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Style pour les options */
    .connection-option-item {
      display: flex !important;
      align-items: center !important;
      position: relative !important;
    }
    
    /* Style pour l'option sélectionnée */
    .connection-option-item.selected {
      background-color: #ebf5ff !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    }
    
    /* Style pour le checkmark */
    .option-checkmark {
      position: absolute;
      right: 12px;
      color: #3b82f6;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .connection-option-item.selected .option-checkmark {
      opacity: 1;
    }
    
    /* Style mobile */
    @media (max-width: 640px) {
      .connection-option-mobile {
        border-bottom: 1px solid #e5e7eb !important;
        border-radius: 0 !important;
        margin-bottom: 0 !important;
      }
      
      .connection-option-mobile:last-child {
        border-bottom: none !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
});