import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Composant pour les transitions de page
 * Crée une animation douce lors des changements de route
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const [location] = useLocation();

  // Variantes d'animation pour les transitions de page
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 5,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    out: {
      opacity: 0,
      y: 5,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      key={location}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Transition avec effet de glissement de page
 */
export function SlidePageTransition({ children, className = "", direction = "right" }: PageTransitionProps & { direction?: "left" | "right" }) {
  const [location] = useLocation();

  // Direction de l'animation basée sur la prop direction
  const xOffset = direction === "right" ? 15 : -15;

  const slideVariants = {
    initial: {
      opacity: 0,
      x: xOffset,
    },
    in: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    out: {
      opacity: 0,
      x: -xOffset,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      key={location}
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Transition avec effet de zoom pour les pages importantes
 */
export function ZoomPageTransition({ children, className = "" }: PageTransitionProps) {
  const [location] = useLocation();

  const zoomVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    out: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: [0.55, 0.085, 0.68, 0.53], // ease-in-cubic
      },
    },
  };

  return (
    <motion.div
      key={location}
      initial="initial"
      animate="in"
      exit="out"
      variants={zoomVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}