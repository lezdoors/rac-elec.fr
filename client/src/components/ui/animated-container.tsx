import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideInFromBottom, slideInFromLeft, slideInFromRight, slideInFromTop, scaleUp, popIn } from "@/lib/animations";

type AnimationVariant = 
  | "fade" 
  | "slideFromRight" 
  | "slideFromLeft" 
  | "slideFromBottom" 
  | "slideFromTop" 
  | "scaleUp" 
  | "popIn";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationVariant;
  delay?: number;
  duration?: number;
  isVisible?: boolean;
}

/**
 * Composant conteneur avec animations pour envelopper n'importe quel élément
 * Utilise framer-motion pour des animations fluides et professionnelles
 */
export function AnimatedContainer({
  children,
  className = "",
  animation = "fade",
  delay = 0,
  duration,
  isVisible = true
}: AnimatedContainerProps) {
  // Sélection de l'animation basée sur la variante
  const getAnimation = () => {
    switch (animation) {
      case "slideFromRight":
        return slideInFromRight;
      case "slideFromLeft":
        return slideInFromLeft;
      case "slideFromBottom":
        return slideInFromBottom;
      case "slideFromTop":
        return slideInFromTop;
      case "scaleUp":
        return scaleUp;
      case "popIn":
        return popIn;
      case "fade":
      default:
        return fadeIn;
    }
  };

  // Personnaliser la transition si une durée est spécifiée
  const customizeTransition = (variant: any) => {
    if (!duration) return variant;
    
    return {
      ...variant,
      visible: {
        ...variant.visible,
        transition: {
          ...variant.visible?.transition,
          duration: duration,
          delay: delay
        }
      }
    };
  };

  const animationVariant = customizeTransition(getAnimation());

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={animationVariant}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Composant pour animer une liste d'éléments avec effet d'échelonnement (stagger)
 */
export function AnimatedList({
  children,
  className = "",
  animation = "fade",
  staggerDelay = 0.05,
  isVisible = true
}: AnimatedContainerProps & { staggerDelay?: number }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  const getItemAnimation = () => {
    switch (animation) {
      case "slideFromRight":
        return { 
          hidden: { x: 20, opacity: 0 },
          visible: { 
            x: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 30 }
          },
          exit: { x: 20, opacity: 0 }
        };
      case "slideFromLeft":
        return { 
          hidden: { x: -20, opacity: 0 },
          visible: { 
            x: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 30 }
          },
          exit: { x: -20, opacity: 0 }
        };
      case "slideFromBottom":
        return { 
          hidden: { y: 20, opacity: 0 },
          visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 35 }
          },
          exit: { y: 20, opacity: 0 }
        };
      case "slideFromTop":
        return { 
          hidden: { y: -20, opacity: 0 },
          visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 35 }
          },
          exit: { y: -20, opacity: 0 }
        };
      case "scaleUp":
        return { 
          hidden: { scale: 0.95, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          },
          exit: { scale: 0.95, opacity: 0 }
        };
      case "popIn":
        return { 
          hidden: { scale: 0.8, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { type: "spring", stiffness: 500, damping: 25 }
          },
          exit: { scale: 0.8, opacity: 0 }
        };
      case "fade":
      default:
        return { 
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.3 }
          },
          exit: { opacity: 0 }
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {Array.isArray(children)
            ? children.map((child, index) => (
                <motion.div key={index} variants={getItemAnimation()}>
                  {child}
                </motion.div>
              ))
            : children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}