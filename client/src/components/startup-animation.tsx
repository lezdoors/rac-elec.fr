import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleElectricLoader } from "@/components/ui/simple-electric-loader";

interface StartupAnimationProps {
  duration?: number;
  onComplete?: () => void;
  text?: string;
  className?: string;
}

export function StartupAnimation({
  duration = 2500, // Légèrement plus court pour une meilleure expérience
  onComplete,
  text = "Chargement de votre espace",
  className
}: StartupAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"initial" | "loading" | "exit">("initial");

  useEffect(() => {
    // Vérifie si l'animation a déjà été vue aujourd'hui
    const lastShown = localStorage.getItem('startupAnimationShown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      // L'animation a déjà été vue aujourd'hui, on l'affiche plus rapidement
      setPhase("loading");
      const fastPhase1Timeout = setTimeout(() => {
        setPhase("exit");
        const fastPhase2Timeout = setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 500);
        
        // Nettoyage si le composant est démonté
        return () => clearTimeout(fastPhase2Timeout);
      }, 800);
      
      // Nettoyage si le composant est démonté
      return () => clearTimeout(fastPhase1Timeout);
    }

    // Animation en plusieurs phases pour une expérience plus fluide
    setPhase("initial");
    
    // Phase 1: Entrée
    const phase1Timeout = setTimeout(() => {
      setPhase("loading");
    }, 200);
    
    // Phase 2: Chargement
    const phase2Timeout = setTimeout(() => {
      setPhase("exit");
    }, duration);
    
    // Phase 3: Sortie et nettoyage
    const phase3Timeout = setTimeout(() => {
      setVisible(false);
      localStorage.setItem('startupAnimationShown', today);
      if (onComplete) onComplete();
    }, duration + 500); // 500ms pour la transition de sortie

    return () => {
      // Nettoyage des timeouts si le composant est démonté
      clearTimeout(phase1Timeout);
      clearTimeout(phase2Timeout);
      clearTimeout(phase3Timeout);
    };
  }, [duration, onComplete]);

  if (!visible) return null;
  
  // Variantes pour les animations
  const containerVariants = {
    initial: { 
      opacity: 0,
      scale: 1.05
    },
    loading: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      filter: "brightness(1.5)",
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96] // Courbe d'animation fluide et élégante
      }
    }
  };
  
  const logoVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0,
      y: 15
    },
    loading: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.8,
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    },
    exit: { 
      scale: 1.1,
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  
  const textVariants = {
    initial: { 
      y: 25,
      opacity: 0,
      scale: 0.95
    },
    loading: { 
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.6, // Légèrement plus grand délai pour un effet de cascade
        duration: 0.7,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: { 
      y: -15,
      opacity: 0,
      scale: 0.95,
      filter: "brightness(1.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden",
          className
        )}
        initial="initial"
        animate={phase}
        variants={containerVariants}
      >
        {/* Fond avec dégradé professionnel et subtil - encore perfectionné */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/90 to-blue-100/95 opacity-95">
          {/* Léger motif de fond pour une texture sophistiquée */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNjAgMTAgTSAxMCAwIEwgMTAgNjAgTSAwIDIwIEwgNjAgMjAgTSAyMCAwIEwgMjAgNjAgTSAwIDMwIEwgNjAgMzAgTSAzMCAwIEwgMzAgNjAgTSAwIDQwIEwgNjAgNDAgTSA0MCAwIEwgNDAgNjAgTSAwIDUwIEwgNjAgNTAgTSA1MCAwIEwgNTAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJlM2Q5NiIgc3Ryb2tlLXdpZHRoPSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
        </div>
        
        {/* Effet radar subtil */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
          <motion.div 
            className="w-full h-full absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-blue-500/30 w-full h-full left-1/2 top-1/2"
                style={{ transform: 'translate(-50%, -50%)' }}
                animate={{
                  width: ['0%', '150%'],
                  height: ['0%', '150%'],
                  opacity: [0.7, 0],
                  borderWidth: [2, 0.5],
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity,
                  delay: i * 0.7,
                }}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Motif de fond abstrait - lignes électriques subtiles */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5 }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2e3d96" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </motion.div>
        
        {/* Éléments lumineux décoratifs */}
        <motion.div 
          className="absolute left-1/4 top-1/4 w-20 h-20 rounded-full bg-blue-200 filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute right-1/3 bottom-1/3 w-32 h-32 rounded-full bg-green-200 filter blur-3xl opacity-20"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Effet de particules flottantes en arrière-plan */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gradient-to-r from-primary/30 to-green-500/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0.5],
                y: [0, Math.random() * -30],
                x: [0, Math.random() * 20 - 10],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
        
        {/* Contenu principal avec un effet visuel ultra-perfectionné */}
        <div className="relative mx-auto text-center z-10 flex justify-center items-center h-full">
          {/* Nouvelle animation de chargement ultra-moderne centrée */}
          <motion.div 
            variants={logoVariants}
            className="flex items-center justify-center"
          >
            <SimpleElectricLoader 
              size="lg"
              showInfo={true}
              showBadges={true}
              showLogo={true}
              showCertifications={true}
              className="mx-auto"
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}