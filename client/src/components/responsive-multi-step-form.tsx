import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile, getMobileClasses } from "@/lib/mobile-optimizations";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";

interface ResponsiveMultiStepFormProps {
  children: ReactNode[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => void;
  className?: string;
  submitButtonText?: string;
  showStepIndicator?: boolean;
  stepTitles?: string[];
  isSubmitting?: boolean;
  isStepValid?: boolean;
  isFirstStepRequiredForProgress?: boolean;
}

/**
 * Formulaire multi-étapes réactif et adapté aux appareils mobiles
 */
export function ResponsiveMultiStepForm({
  children,
  currentStep,
  onStepChange,
  onSubmit,
  className = "",
  submitButtonText = "Soumettre",
  showStepIndicator = true,
  stepTitles = [],
  isSubmitting = false,
  isStepValid = true,
  isFirstStepRequiredForProgress = true
}: ResponsiveMultiStepFormProps) {
  const isMobile = useIsMobile();
  const mobileClasses = getMobileClasses(isMobile);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">("next");
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  
  // Initialiser le tableau des étapes complétées
  useEffect(() => {
    setCompletedSteps(Array(children.length).fill(false));
  }, [children.length]);

  // Mettre à jour les étapes complétées
  useEffect(() => {
    if (isStepValid) {
      setCompletedSteps(prev => {
        const newCompletedSteps = [...prev];
        newCompletedSteps[currentStep] = true;
        return newCompletedSteps;
      });
    }
  }, [currentStep, isStepValid]);

  // Navigation vers l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setAnimationDirection("prev");
      onStepChange(currentStep - 1);
    }
  };

  // Navigation vers l'étape suivante
  const goToNextStep = () => {
    // Si la première étape est requise, vérifier si elle est complétée
    if (isFirstStepRequiredForProgress && currentStep === 0 && !completedSteps[0]) {
      return;
    }
    
    if (currentStep < children.length - 1) {
      setAnimationDirection("next");
      onStepChange(currentStep + 1);
    } else {
      // Soumettre le formulaire si nous sommes à la dernière étape
      onSubmit();
    }
  };

  // Animations pour les étapes
  const variants = {
    enter: (direction: "next" | "prev") => ({
      x: direction === "next" ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: "next" | "prev") => ({
      x: direction === "next" ? -50 : 50,
      opacity: 0
    })
  };

  // Styles responsifs
  const responsiveStyles = {
    container: isMobile ? "p-4" : "p-6",
    stepIndicator: isMobile ? "mb-4" : "mb-6",
    contentContainer: isMobile ? "mb-4" : "mb-6",
    buttonContainer: isMobile 
      ? "flex flex-col gap-3" 
      : "flex flex-row justify-between items-center",
    buttonPrev: isMobile ? "w-full" : "w-auto",
    buttonNext: isMobile ? "w-full" : "w-auto",
  };

  return (
    <div className={cn("bg-white dark:bg-gray-950 rounded-lg shadow-md", responsiveStyles.container, className)}>
      {/* Indicateur d'étapes */}
      {showStepIndicator && (
        <div className={cn("relative", responsiveStyles.stepIndicator)}>
          <div className="flex items-center justify-between w-full">
            {Array.from({ length: children.length }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors relative",
                    currentStep === index
                      ? "bg-primary text-white"
                      : completedSteps[index]
                      ? "bg-green-100 border border-green-500 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {completedSteps[index] ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                  
                  {/* Étiquette d'étape */}
                  {stepTitles && stepTitles[index] && (
                    <span className={cn(
                      "absolute top-full mt-1 text-xs whitespace-nowrap font-normal",
                      isMobile ? "hidden" : "block"
                    )}>
                      {stepTitles[index]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Ligne de progression */}
          <div className="absolute top-4 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{
                width: `${(currentStep / (children.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Étiquette d'étape actuelle pour mobile */}
      {isMobile && stepTitles && stepTitles[currentStep] && (
        <h3 className="text-center font-medium text-gray-700 dark:text-gray-300 mb-4">
          {stepTitles[currentStep]}
        </h3>
      )}

      {/* Conteneur de contenu animé */}
      <div className={cn("relative", responsiveStyles.contentContainer)}>
        <AnimatePresence initial={false} mode="wait" custom={animationDirection}>
          <motion.div
            key={currentStep}
            custom={animationDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="w-full"
          >
            {children[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation du formulaire */}
      <div className={cn(responsiveStyles.buttonContainer)}>
        {/* Bouton Précédent */}
        {currentStep > 0 ? (
          <AnimatedButton
            variant="outline"
            onClick={goToPreviousStep}
            className={cn(responsiveStyles.buttonPrev)}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>{isMobile ? "Précédent" : "Étape précédente"}</span>
          </AnimatedButton>
        ) : (
          <div /> // Placeholder pour maintenir l'alignement
        )}

        {/* Bouton Suivant/Soumettre */}
        <AnimatedButton
          variant={currentStep === children.length - 1 ? "success" : "primary-gradient"}
          onClick={goToNextStep}
          className={cn(responsiveStyles.buttonNext)}
          isLoading={isSubmitting}
          disabled={isSubmitting || (isFirstStepRequiredForProgress && currentStep === 0 && !completedSteps[0])}
          type="button"
        >
          {currentStep < children.length - 1 ? (
            <>
              <span>{isMobile ? "Suivant" : "Étape suivante"}</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <span>{submitButtonText}</span>
              {!isSubmitting && <CheckCircle2 size={16} />}
            </>
          )}
        </AnimatedButton>
      </div>
    </div>
  );
}

interface MultiStepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

/**
 * Indicateur de progression pour formulaire multi-étapes avec adaptation mobile
 */
export function MultiStepProgress({
  steps,
  currentStep,
  className = ""
}: MultiStepProgressProps) {
  const isMobile = useIsMobile();
  const progressPercentage = ((currentStep) / (steps.length - 1)) * 100;

  // Déterminer quelles étapes afficher en mode mobile (étape actuelle et adjacentes)
  const visibleSteps = isMobile
    ? steps.map((step, index) => {
        // Sur mobile, n'afficher que l'étape actuelle et les étapes adjacentes
        const distance = Math.abs(index - currentStep);
        return distance <= 1 || index === 0 || index === steps.length - 1;
      })
    : steps.map(() => true);

  return (
    <div className={cn("w-full mb-6", className)}>
      {/* Barre de progression */}
      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Étiquettes d'étapes */}
      <div className="relative flex justify-between mt-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center relative transition-all",
              !visibleSteps[index] && "opacity-0 w-0 overflow-hidden",
              index === currentStep && "font-medium text-primary"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1",
                index < currentStep
                  ? "bg-primary text-white"
                  : index === currentStep
                  ? "border-2 border-primary text-primary"
                  : "border border-gray-300 text-gray-500 dark:border-gray-600"
              )}
            >
              {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-xs whitespace-nowrap transition-opacity",
                isMobile ? "max-w-[80px] text-center truncate" : ""
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}