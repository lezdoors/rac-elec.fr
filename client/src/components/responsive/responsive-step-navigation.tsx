import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { cn } from "@/lib/utils";
import { GoogleSnippetButton } from "@/components/google-snippet-button";

interface ResponsiveStepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  className?: string;
  currentStep?: number;
}

/**
 * Navigation entre étapes responsives pour formulaires multi-étapes
 * Adapté pour les appareils mobiles
 */
export function ResponsiveStepNavigation({
  onNext,
  onPrevious,
  canGoNext,
  canGoBack,
  isLastStep,
  isSubmitting = false,
  className,
  currentStep = 0
}: ResponsiveStepNavigationProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "flex justify-between items-center mt-6",
        isMobile ? "gap-2" : "gap-4",
        className
      )}
    >
      {/* Bouton précédent */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoBack}
        className={cn(
          "flex items-center",
          isMobile ? "text-sm px-3 py-1.5 h-9" : "px-4 py-2"
        )}
      >
        <ChevronLeft className={cn("mr-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />
        {isMobile ? "Retour" : "Étape précédente"}
      </Button>
      
      {/* Bouton suivant ou valider */}
      <Button
        variant="default"
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className={cn(
          "flex items-center",
          isMobile ? "text-sm px-3 py-1.5 h-9" : "px-4 py-2"
        )}
      >
        {isSubmitting && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        
        {isLastStep ? (
          <>
            {isMobile ? "Valider" : "Valider ma demande"}
            <Check className={cn("ml-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          </>
        ) : (
          <>
            {isMobile ? "Suivant" : "Étape suivante"}
            <ChevronRight className={cn("ml-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Barre fixe de navigation entre étapes pour mobile
 * S'attache au bas de l'écran pour faciliter la navigation
 */
export function MobileFixedStepNavigation({
  onNext,
  onPrevious,
  canGoNext,
  canGoBack,
  isLastStep,
  isSubmitting = false
}: Omit<ResponsiveStepNavigationProps, 'className'>) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-md z-50">
      <ResponsiveStepNavigation
        onNext={onNext}
        onPrevious={onPrevious}
        canGoNext={canGoNext}
        canGoBack={canGoBack}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        className="m-0 w-full"
      />
    </div>
  );
}