import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Wrapper pour tout le formulaire
export const FormContainer = ({ 
  children, 
  className,
  onSubmit
}: { 
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}) => {
  return (
    <div className={cn("form-container", className)}>
      {onSubmit ? (
        <form onSubmit={onSubmit} className="space-y-8">
          {children}
        </form>
      ) : (
        children
      )}
    </div>
  );
};

// Wrapper pour le conteneur d'options (comme les types de client)
export const OptionsContainer = ({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("form-grid form-grid-md-3 gap-6", className)}>
      {children}
    </div>
  );
};

// Animation de page étape par étape
export const StepAnimation = ({ 
  children, 
  isActive, 
  direction = "right" 
}: { 
  children: ReactNode;
  isActive: boolean;
  direction?: "right" | "left";
}) => {
  return (
    <div 
      className={`
        transform transition-all duration-500 ease-in-out
        ${isActive ? "opacity-100" : "opacity-0"} 
        ${isActive ? "translate-y-0" : direction === "right" ? "translate-x-10" : "translate-x-[-10px]"}
      `}
    >
      {children}
    </div>
  );
};

// Indicateur de progression amélioré
export const EnhancedProgressIndicator = ({
  currentStep,
  totalSteps,
  stepsInfo
}: {
  currentStep: number;
  totalSteps: number;
  stepsInfo: { name: string; icon: ReactNode }[];
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-1 mb-4">
        {stepsInfo.map((step, index) => (
          <div key={index} className="flex-1">
            <div 
              className={`h-14 flex items-center justify-center ${
                index < currentStep 
                  ? "bg-primary" 
                  : index === currentStep 
                    ? "bg-blue-100"
                    : "bg-gray-100"
              } rounded-lg transition-all duration-300 relative overflow-hidden px-4`}
            >
              {/* Animation de remplissage */}
              {index === currentStep && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-primary/30 animate-pulse-slow"></div>
              )}
              
              {/* Contenu de l'étape */}
              <div className="flex items-center justify-center gap-2 z-10 w-full">
                <div 
                  className={`flex-shrink-0 w-8 h-8 ${
                    index < currentStep
                      ? "bg-white text-primary"
                      : index === currentStep
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                  } rounded-full flex items-center justify-center text-sm transition-all`}
                >
                  {index < currentStep ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                
                <span 
                  className={`hidden md:inline text-sm font-medium ${
                    index <= currentStep
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicateur de progression en pourcentage */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-blue-50">
              Progression
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary">
              {Math.round((currentStep / (totalSteps - 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Boutons de navigation améliorés
export const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting = false,
  isAnimating = false
}: {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  isAnimating?: boolean;
}) => {
  return (
    <div className="flex justify-between pt-5">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
          isAnimating ? "opacity-0" : "opacity-100 transition-opacity duration-300",
          currentStep === 0 ? "invisible" : "visible"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Précédent
      </button>
      
      {currentStep === totalSteps - 1 ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed",
            isAnimating ? "opacity-0" : "opacity-100 transition-opacity duration-300"
          )}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              Finaliser la demande
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90",
            isAnimating ? "opacity-0" : "opacity-100 transition-opacity duration-300"
          )}
        >
          Suivant
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};