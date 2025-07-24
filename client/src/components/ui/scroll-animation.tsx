import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useAnimation, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "opacity" | "scale";
  className?: string;
  distance?: number;
}

/**
 * Composant qui révèle son contenu avec animation lors du défilement
 * Idéal pour les sections de page qui doivent apparaître progressivement
 */
export function ScrollReveal({
  children,
  threshold = 0.1,
  delay = 0,
  direction = "up",
  className = "",
  distance = 50
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  
  const getInitialState = () => {
    switch (direction) {
      case "up":
        return { y: distance, opacity: 0 };
      case "down":
        return { y: -distance, opacity: 0 };
      case "left":
        return { x: distance, opacity: 0 };
      case "right":
        return { x: -distance, opacity: 0 };
      case "scale":
        return { scale: 0.8, opacity: 0 };
      case "opacity":
      default:
        return { opacity: 0 };
    }
  };

  const getAnimatedState = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1 };
      case "left":
      case "right":
        return { x: 0, opacity: 1 };
      case "scale":
        return { scale: 1, opacity: 1 };
      case "opacity":
      default:
        return { opacity: 1 };
    }
  };

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={getInitialState()}
        animate={isInView ? getAnimatedState() : getInitialState()}
        transition={{
          duration: 0.6,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1], // easeOutQuart
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Effet de parallaxe au défilement
 * Crée une sensation de profondeur pendant que l'utilisateur fait défiler la page
 */
export function Parallax({
  children,
  speed = 0.5,
  className = "",
  direction = "up"
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Calcule la transformation en fonction de la direction
  const getTransform = () => {
    const value = 200 * speed;
    
    switch (direction) {
      case "down":
        return useTransform(scrollYProgress, [0, 1], [0, value]);
      case "left":
        return useTransform(scrollYProgress, [0, 1], [0, -value]);
      case "right":
        return useTransform(scrollYProgress, [0, 1], [0, value]);
      case "up":
      default:
        return useTransform(scrollYProgress, [0, 1], [0, -value]);
    }
  };
  
  const y = direction === "up" || direction === "down" 
    ? getTransform() 
    : 0;
    
  const x = direction === "left" || direction === "right" 
    ? getTransform() 
    : 0;
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, x }}>
        {children}
      </motion.div>
    </div>
  );
}

interface StaggerScrollProps {
  children: ReactNode[];
  className?: string;
  containerClassName?: string;
  staggerDelay?: number;
  distanceOffset?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Animation de défilement échelonnée pour les listes d'éléments
 * Chaque élément enfant apparaît avec un délai progressif
 */
export function StaggerScroll({
  children,
  className = "",
  containerClassName = "",
  staggerDelay = 0.1,
  distanceOffset = 50,
  direction = "up"
}: StaggerScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };
  
  const getChildVariants = () => {
    switch (direction) {
      case "down":
        return {
          hidden: { y: -distanceOffset, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
          }
        };
      case "left":
        return {
          hidden: { x: distanceOffset, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
          }
        };
      case "right":
        return {
          hidden: { x: -distanceOffset, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
          }
        };
      case "up":
      default:
        return {
          hidden: { y: distanceOffset, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
          }
        };
    }
  };
  
  return (
    <div ref={ref} className={containerClassName}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={className}
      >
        {children.map((child, index) => (
          <motion.div key={index} variants={getChildVariants()}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

interface FadeOnScrollProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  fadeDirection?: "in" | "out";
}

/**
 * Fondu progressif basé sur la position de défilement
 * Utile pour les transitions douces entre les sections
 */
export function FadeOnScroll({
  children,
  className = "",
  threshold = 0,
  fadeDirection = "in"
}: FadeOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Pour le fondu entrant, nous voulons que l'opacité augmente à mesure que l'élément entre dans la vue
  // Pour le fondu sortant, nous voulons que l'opacité diminue à mesure que l'élément sort de la vue
  const opacity = fadeDirection === "in"
    ? useTransform(scrollYProgress, [0, threshold], [0, 1])
    : useTransform(scrollYProgress, [threshold, 1], [1, 0]);
  
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ opacity }}>
        {children}
      </motion.div>
    </div>
  );
}