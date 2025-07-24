import React, { useEffect } from 'react';
import { useIsMobile } from '@/lib/mobile-optimizations';

/**
 * Composant qui applique directement des styles de réduction sur les boutons en mobile
 */
export function ReducedButtons() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Appliquer des styles inline à tous les boutons du formulaire
    const applyButtonStyles = () => {
      const buttons = document.querySelectorAll('button');
      
      buttons.forEach(button => {
        // Style de base réduit pour tous les boutons
        button.style.fontSize = '14px';
        button.style.padding = '8px 12px';
        button.style.height = 'auto';
        button.style.minHeight = '36px';
        button.style.lineHeight = '1.4';
        button.style.borderRadius = '6px';
        
        // Réduire les icônes dans les boutons
        const icons = button.querySelectorAll('svg');
        icons.forEach(icon => {
          icon.style.width = '16px';
          icon.style.height = '16px';
          icon.style.minWidth = '16px';
        });
        
        // Style spécifique pour les boutons de navigation (précédent/suivant)
        if (button.closest('.flex.justify-between')) {
          button.style.minWidth = '90px';
          button.style.height = '36px';
          button.style.padding = '0 10px';
        }
        
        // Style spécifique pour les boutons d'action (soumettre)
        if (button.type === 'submit' || 
            button.classList.contains('bg-primary') || 
            button.classList.contains('bg-blue-600')) {
          button.style.fontWeight = '500';
          button.style.marginTop = '8px';
          button.style.marginBottom = '8px';
        }
      });
    };
    
    // Appliquer immédiatement et à chaque changement de DOM
    applyButtonStyles();
    
    // Observer les changements dans le DOM pour réappliquer les styles
    const observer = new MutationObserver(applyButtonStyles);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, [isMobile]);

  return null; // Ce composant ne rend rien visuellement
}