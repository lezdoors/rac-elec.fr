import { ReactNode, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAnimationPreset } from "@/components/providers/animation-provider";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  withHeader?: boolean;
  withFooter?: boolean;
  animation?: "fade" | "slide" | "zoom" | "scale" | "none";
}

/**
 * Page component with animations disabled for performance optimization
 * Returns children without any animations for faster loading
 */
export function AnimatedPage({
  children,
  className = "",
  withHeader = false,
  withFooter = false,
  animation = "none"
}: AnimatedPageProps) {
  // Performance optimization: disable all page animations
  return <div className={className}>{children}</div>;

  useEffect(() => {
    controls.start("visible");
    
    return () => {
      controls.start("exit");
    };
  }, [controls]);

  // Variantes d'animation selon le type
  const getAnimationVariants = () => {
    switch (animation) {
      case "slide":
        return {
          hidden: { x: 20, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              ...transition,
              duration: duration,
              when: "beforeChildren",
              staggerChildren: 0.1
            }
          },
          exit: {
            x: -20,
            opacity: 0,
            transition: { duration: duration * 0.7, ease: "easeIn" }
          }
        };
      case "zoom":
        return {
          hidden: { scale: 0.95, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              ...transition,
              duration: duration,
              when: "beforeChildren",
              staggerChildren: 0.1
            }
          },
          exit: {
            scale: 0.95,
            opacity: 0,
            transition: { duration: duration * 0.7, ease: "easeIn" }
          }
        };
      case "scale":
        return {
          hidden: { scale: 0.9, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              ...transition,
              duration: duration,
              when: "beforeChildren",
              staggerChildren: 0.1
            }
          },
          exit: {
            scale: 1.05,
            opacity: 0,
            transition: { duration: duration * 0.7, ease: "easeIn" }
          }
        };
      case "none":
        return {};
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: duration,
              when: "beforeChildren",
              staggerChildren: 0.1
            }
          },
          exit: {
            opacity: 0,
            transition: { duration: duration * 0.7, ease: "easeIn" }
          }
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="hidden"
        animate={controls}
        exit="exit"
        variants={getAnimationVariants()}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoom" | "none";
}

/**
 * Composant pour les sections de page avec animation
 * Permet d'animer différentes parties d'une page avec des délais
 */
export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  animation = "fade"
}: AnimatedSectionProps) {
  const controls = useAnimation();
  const { duration } = useAnimationPreset();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // Variantes d'animation selon le type
  const getAnimationVariants = () => {
    switch (animation) {
      case "slideUp":
        return {
          hidden: { y: 30, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
      case "slideDown":
        return {
          hidden: { y: -30, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
      case "slideLeft":
        return {
          hidden: { x: 30, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
      case "slideRight":
        return {
          hidden: { x: -30, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
      case "zoom":
        return {
          hidden: { scale: 0.95, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
      case "none":
        return {};
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }
          }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={getAnimationVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedGroupProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoom";
  initialDelay?: number;
}

/**
 * Composant pour grouper des éléments avec animation échelonnée
 * Parfait pour les listes, grilles ou menus
 */
export function AnimatedGroup({
  children,
  className = "",
  staggerDelay = 0.1,
  animation = "fade",
  initialDelay = 0
}: AnimatedGroupProps) {
  const controls = useAnimation();
  const { duration } = useAnimationPreset();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // Animation du conteneur
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay
      }
    }
  };

  // Variantes d'animation pour les enfants selon le type
  const getChildVariants = () => {
    switch (animation) {
      case "slideUp":
        return {
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
      case "slideDown":
        return {
          hidden: { y: -20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
      case "slideLeft":
        return {
          hidden: { x: 20, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
      case "slideRight":
        return {
          hidden: { x: -20, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
      case "zoom":
        return {
          hidden: { scale: 0.9, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: duration * 0.8, ease: "easeOut" }
          }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={getChildVariants()}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}