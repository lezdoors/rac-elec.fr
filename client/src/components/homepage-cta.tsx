import React from 'react';
import { AccessibleCTAButton } from '@/components/ui/accessible-cta-button';

/**
 * Composant de Call-to-Action de la page d'accueil avec accessibilité améliorée
 * Remplace les boutons verts standard par des boutons avec un contraste suffisant
 */
export const HomepageCTA = () => {
  const handleClick = () => {
    // Navigate to form without conversion tracking (tracking happens on "Suivant" button)
    window.location.href = '/raccordement-enedis#formulaire-raccordement';
    return false;
  };

  return (
    <AccessibleCTAButton 
      onClick={handleClick}
      variant="default"
      size="lg"
      className="font-semibold shadow-md"
    >
      Démarrer ma demande de raccordement
    </AccessibleCTAButton>
  );
};

export default HomepageCTA;