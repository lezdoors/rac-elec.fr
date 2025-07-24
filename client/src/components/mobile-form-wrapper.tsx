import { useEffect } from 'react';
import { useIsMobile } from '@/lib/mobile-optimizations';
import FormMobileOptimizer from './form-mobile-optimizer';
import { ResponsiveProgressBar } from './responsive';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  currentStep: number;
  steps: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
  }>;
  onStepClick?: (index: number) => void;
}

/**
 * Composant enveloppe qui applique les optimisations mobiles au formulaire
 * Il n'altère rien sur desktop mais optimise l'affichage sur mobile
 */
export function MobileFormWrapper({ 
  children, 
  currentStep,
  steps,
  onStepClick 
}: MobileFormWrapperProps) {
  const isMobile = useIsMobile();
  
  // Ajuster les styles du body pour mobile
  useEffect(() => {
    if (isMobile) {
      // Ajouter une classe au body pour les styles spécifiques au formulaire mobile
      document.body.classList.add('mobile-form-view');
      
      // Nettoyer lors du démontage du composant
      return () => {
        document.body.classList.remove('mobile-form-view');
      };
    }
  }, [isMobile]);
  
  return (
    <div className={`form-wrapper ${isMobile ? 'mobile-optimized' : ''}`}>
      {/* Optimiseur invisible qui s'active uniquement sur mobile */}
      <FormMobileOptimizer />
      
      {/* En-tête avec style vert uniquement en haut (mobile) */}
      {isMobile && (
        <div className="bg-[#33b060]/10 pt-3 pb-3 px-2 mb-4 rounded-t-lg">
          <ResponsiveProgressBar 
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
          />
        </div>
      )}
      
      {/* Contenu du formulaire avec fond blanc pour le corps principal */}
      <div className={isMobile ? "bg-white rounded-lg px-2" : ""}>
        {children}
      </div>
      
      {/* Pied avec style vert en bas (mobile) */}
      {isMobile && (
        <div className="bg-[#33b060]/10 pt-3 pb-20 px-2 mt-4 rounded-b-lg"></div>
      )}
    </div>
  );
}