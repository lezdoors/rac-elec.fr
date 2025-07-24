import { Check } from "lucide-react";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Step {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface ResponsiveProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Barre de progression adaptative pour les formulaires multi-étapes
 * S'adapte automatiquement aux appareils mobiles
 */
export function ResponsiveProgressBar({
  steps,
  currentStep,
  onStepClick,
  className
}: ResponsiveProgressBarProps) {
  const isMobile = useIsMobile();
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  
  // Détermine quelles étapes afficher en mode mobile
  useEffect(() => {
    if (isMobile) {
      // Sur mobile, n'afficher que 3 étapes maximum: l'étape actuelle et les adjacentes
      const visible = steps.map((_, index) => {
        const distance = Math.abs(index - currentStep);
        return distance <= 1 || index === 0 || index === steps.length - 1;
      });
      setVisibleSteps(visible);
    } else {
      // Sur desktop, afficher toutes les étapes
      setVisibleSteps(steps.map(() => true));
    }
  }, [currentStep, isMobile, steps.length]);

  // Pourcentage de progression pour la barre
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className={cn("mb-8", className)}>
      {/* Cercles des étapes avec design moderne et interactif */}
      <div className={cn("flex items-center justify-between gap-1 mb-4", isMobile ? "pb-1" : "")}>
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "relative flex flex-col items-center", 
              { "hidden": isMobile && !visibleSteps[index] },
              isMobile ? "px-0.5" : "flex-1"
            )}
          >
            {/* Ligne de connexion */}
            {index > 0 && (
              <div className="absolute top-1/2 -left-1/2 w-full h-0.5 transform -translate-y-1/2 z-0">
                <div className={cn(
                  "h-full transition-colors duration-500",
                  index <= currentStep ? "bg-gradient-to-r from-blue-400 to-blue-600" : "bg-gray-200"
                )} />
              </div>
            )}
            
            {/* Cercle de l'étape avec conteneur d'animation */}
            <div className="relative z-10">
              <div 
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden shadow-md",
                  isMobile ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm",
                  index < currentStep 
                    ? "bg-blue-600 text-white" 
                    : index === currentStep 
                      ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white ring-2 ring-blue-200 ring-offset-2" 
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                )}
                onClick={() => {
                  if (onStepClick && index <= currentStep) {
                    onStepClick(index);
                  }
                }}
              >
                {/* Animation de pulse pour l'étape courante */}
                {index === currentStep && (
                  <div className="absolute inset-0 bg-blue-500 opacity-30 animate-pulse-progress rounded-full" />
                )}
                
                {/* Animation de particules pour les étapes complétées */}
                {index < currentStep && isMobile && (
                  <>
                    <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-blue-200 opacity-40 animate-float"></div>
                    <div className="absolute bottom-2 right-1 w-0.5 h-0.5 rounded-full bg-blue-100 opacity-60 animate-float-slow"></div>
                  </>
                )}
                
                {/* Chiffre ou icône */}
                {index < currentStep ? (
                  <Check className={cn("h-5 w-5", { "h-4 w-4": isMobile })} />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
                
                {/* Indicateur de l'étape actuelle */}
                {index === currentStep && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-30 rounded-t-lg" />
                )}
              </div>
              
              {/* Indicateur pulsant pour l'étape actuelle (mobile uniquement) */}
              {index === currentStep && isMobile && (
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                  <div className="relative rounded-full h-full w-full bg-blue-500"></div>
                </div>
              )}
            </div>
            
            {/* Label de l'étape avec style amélioré */}
            <div 
              className={cn(
                "text-center mt-2 font-medium whitespace-nowrap transition-all duration-300",
                index < currentStep ? "text-blue-700" : index === currentStep ? "text-blue-600" : "text-gray-500",
                isMobile ? "text-[9px] max-w-[60px] mx-auto leading-tight" : "text-xs"
              )}
            >
              <span className={cn(
                "block transition-all",
                index === currentStep && "scale-105 transform"
              )}>
                {isMobile ? step.name.split(' ')[0] : step.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression moderne avec pourcentage et effets visuels */}
      <div className="relative pt-2">
        <div className="flex mb-2 items-center justify-between">
          <div className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-5 h-5 mr-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white",
              isMobile ? "w-4 h-4" : ""
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                   strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                   className={cn("w-3 h-3", isMobile ? "w-2.5 h-2.5" : "")}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span className={cn(
              "text-xs font-medium text-gray-700 flex items-center",
              isMobile ? "text-[10px]" : ""
            )}>
              <span className="hidden sm:inline-block mr-1">Votre</span> 
              <span className="inline-block">progression</span>
            </span>
          </div>
          <div className="text-right flex items-center">
            <div className={cn(
              "text-xs font-bold bg-blue-500 text-white rounded-full flex items-center justify-center",
              isMobile ? "text-[10px] h-5 min-w-[32px] px-1.5" : "h-6 min-w-[36px] px-2"
            )}>
              {Math.round(progressPercentage)}%
            </div>
            <span className={cn(
              "ml-1 text-blue-500",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              {currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>
        
        {/* Container pour la barre de progression avancée */}
        <div className="progress-container relative">
          {/* Fond de la barre de progression avec effet subtil */}
          <div className={cn(
            "w-full overflow-hidden rounded-full shadow-inner bg-gradient-to-r from-blue-50 to-blue-100",
            isMobile ? "h-2.5" : "h-3"
          )}>
            {/* Barre animée avec effet de dégradé et de brillance */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                "h-full relative flex items-center justify-end",
                progressPercentage > 0 ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 bg-progress-gradient" : ""
              )}
            >
              {/* Effet de brillance qui se déplace */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-40 h-full bg-white/20 absolute -skew-x-30 animate-shimmer" />
              </div>
              
              {/* Indicateur mobile (point lumineux) */}
              {isMobile && progressPercentage > 0 && (
                <div className="absolute right-0 transform translate-x-1/2 -translate-y-1/2 top-1/2">
                  <div className="h-4 w-4 rounded-full bg-white shadow-md flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Étapes sur la barre (marqueurs pour les étapes principales) */}
          <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-between items-center px-1 pointer-events-none">
            {steps.map((_, idx) => (
              <div 
                key={`step-marker-${idx}`} 
                className={cn(
                  "w-1 h-1 rounded-full",
                  idx <= currentStep ? "bg-white" : "bg-blue-200 hidden"
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Texte informatif en dessous de la barre */}
        <div className="flex justify-between mt-1 text-[10px] text-gray-500">
          <div className="flex-1 text-left">Étape {currentStep + 1}: {steps[currentStep].name}</div>
          {currentStep < steps.length - 1 && (
            <div className="flex-1 text-right">Suivant: {steps[currentStep + 1].name}</div>
          )}
        </div>
      </div>
    </div>
  );
}