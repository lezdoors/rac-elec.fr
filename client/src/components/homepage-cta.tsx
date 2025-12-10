import { useLocation } from 'wouter';
import { AccessibleCTAButton } from '@/components/ui/accessible-cta-button';

/**
 * Composant de Call-to-Action de la page d'accueil avec accessibilité améliorée
 * Utilise le router wouter pour une navigation SPA instantanée
 */
export const HomepageCTA = () => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    // Navigation SPA instantanée vers le formulaire
    setLocation('/raccordement-enedis#formulaire-raccordement');
    return false;
  };

  return (
    <AccessibleCTAButton 
      onClick={handleClick}
      variant="default"
      size="lg"
      className="font-semibold shadow-md"
      data-testid="button-start-request"
    >
      Démarrer ma demande de raccordement
    </AccessibleCTAButton>
  );
};

export default HomepageCTA;