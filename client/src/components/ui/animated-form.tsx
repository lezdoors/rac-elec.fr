import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface AnimatedFormSuccessProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  className?: string;
  onClose?: () => void;
}

/**
 * Composant pour afficher un message de succès animé après soumission du formulaire
 */
export function AnimatedFormSuccess({
  title,
  message,
  icon,
  className,
  onClose
}: AnimatedFormSuccessProps) {
  const successVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={successVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-green-200 dark:border-green-900",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div variants={iconVariants} className="mb-4">
          {icon || (
            <CheckCircle2 
              className="h-12 w-12 text-green-500" 
              strokeWidth={1.5} 
            />
          )}
        </motion.div>

        <motion.h3 
          variants={childVariants} 
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          {title}
        </motion.h3>

        {message && (
          <motion.p 
            variants={childVariants} 
            className="text-gray-600 dark:text-gray-300"
          >
            {message}
          </motion.p>
        )}

        {onClose && (
          <motion.button
            variants={childVariants}
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors"
          >
            Fermer
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

interface AnimatedFormErrorProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  className?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * Composant pour afficher un message d'erreur animé après échec de soumission
 */
export function AnimatedFormError({
  title,
  message,
  icon,
  className,
  onRetry,
  onClose
}: AnimatedFormErrorProps) {
  const errorVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: 0.2
      }
    }
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { 
      duration: 0.6, 
      ease: "easeInOut" 
    }
  };

  return (
    <motion.div
      variants={errorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-red-200 dark:border-red-900",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div 
          variants={iconVariants} 
          animate={shakeAnimation}
          className="mb-4"
        >
          {icon || (
            <XCircle 
              className="h-12 w-12 text-red-500" 
              strokeWidth={1.5} 
            />
          )}
        </motion.div>

        <motion.h3 
          variants={childVariants} 
          className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          {title}
        </motion.h3>

        {message && (
          <motion.p 
            variants={childVariants} 
            className="text-gray-600 dark:text-gray-300"
          >
            {message}
          </motion.p>
        )}

        <div className="flex gap-4 mt-6">
          {onRetry && (
            <motion.button
              variants={childVariants}
              onClick={onRetry}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
            >
              Réessayer
            </motion.button>
          )}

          {onClose && (
            <motion.button
              variants={childVariants}
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              Fermer
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AnimatedFormStateProps {
  children: ReactNode;
  state: "idle" | "loading" | "success" | "error";
  loadingMessage?: string;
  successProps?: Omit<AnimatedFormSuccessProps, "className">;
  errorProps?: Omit<AnimatedFormErrorProps, "className">;
  className?: string;
  hideFormOnSuccess?: boolean;
  hideFormOnError?: boolean;
}

/**
 * Composant pour gérer les états de formulaire avec animations
 * Permet de basculer entre le formulaire, le chargement, le succès et l'erreur
 */
export function AnimatedFormState({
  children,
  state,
  loadingMessage = "Traitement en cours...",
  successProps,
  errorProps,
  className = "",
  hideFormOnSuccess = true,
  hideFormOnError = false
}: AnimatedFormStateProps) {
  const formVariants = {
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const loaderVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div
            key="loader"
            variants={loaderVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-700 dark:text-gray-300 text-center">
              {loadingMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === "success" && successProps && (
          <motion.div
            key="success"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatedFormSuccess {...successProps} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === "error" && errorProps && (
          <motion.div
            key="error"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatedFormError {...errorProps} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(state === "idle" || 
          (state === "loading") || 
          (state === "success" && !hideFormOnSuccess) || 
          (state === "error" && !hideFormOnError)) && (
          <motion.div
            key="form"
            variants={formVariants}
            initial="visible" 
            animate="visible"
            exit="hidden"
            className={cn(
              state === "loading" && "pointer-events-none opacity-60"
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AnimatedInputProps {
  isValid?: boolean;
  isInvalid?: boolean;
  isTyping?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper pour les champs de formulaire avec animation de validation
 */
export function AnimatedInput({
  isValid,
  isInvalid,
  isTyping,
  children,
  className
}: AnimatedInputProps) {
  // État local pour suivre si la souris survole l'élément
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        y: [0, isInvalid && !isTyping && isHovered ? -2 : 0],
        x: [0, isInvalid && !isTyping && isHovered ? 2 : 0, 0, isInvalid && !isTyping && isHovered ? -2 : 0, 0],
      }}
      transition={{
        duration: isInvalid && !isTyping && isHovered ? 0.4 : 0,
        repeat: isInvalid && !isTyping && isHovered ? 1 : 0,
      }}
    >
      {children}

      <AnimatePresence>
        {isValid && !isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInvalid && !isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          >
            <AlertCircle className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface AnimatedMultiStepFormProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  className?: string;
  progressClassName?: string;
}

/**
 * Composant pour animer les transitions entre étapes dans un formulaire multi-étapes
 */
export function AnimatedMultiStepForm({
  currentStep,
  totalSteps,
  children,
  className,
  progressClassName
}: AnimatedMultiStepFormProps) {
  // Variantes d'animation pour les entrées/sorties des étapes
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // Détermine la direction de l'animation
  const direction = currentStep;

  // Calcule le pourcentage de progression
  const progressPercentage = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Barre de progression */}
      <div className={cn("w-full bg-gray-200 rounded-full h-2.5 mb-6", progressClassName)}>
        <motion.div
          className="h-2.5 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Contenu de l'étape actuelle avec animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}