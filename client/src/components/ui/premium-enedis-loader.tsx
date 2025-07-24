import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

export type PremiumLoaderSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type PremiumLoaderVariant = "blue" | "green" | "neutral" | "white";
export type PremiumLoaderTheme = "light" | "dark" | "auto";

interface PremiumEnedisLoaderProps {
  size?: PremiumLoaderSize;
  variant?: PremiumLoaderVariant;
  theme?: PremiumLoaderTheme;
  showLogo?: boolean;
  showText?: boolean;
  showProgression?: boolean;
  customText?: string;
  className?: string;
  /** Valeur de progression entre 0 et 100 */
  progressValue?: number;
  /** Transparence de l'arrière-plan (0-1) */
  bgOpacity?: number;
  /** Animation premium (true par défaut) */
  premium?: boolean;
  /** Définit si l'animation doit inclure des particules */
  particles?: boolean;
}

/**
 * Loader premium Enedis avec effets avancés
 * Animation professionnelle et élégante avec effets d'énergie
 */
export function PremiumEnedisLoader({
  size = "md",
  variant = "blue",
  theme = "light",
  showLogo = true,
  showText = true,
  showProgression = true,
  customText,
  className,
  progressValue = 75,
  bgOpacity = 0.95,
  premium = true,
  particles = true,
}: PremiumEnedisLoaderProps) {
  const [animationReady, setAnimationReady] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  
  // Textes de chargement élégants
  const loadingTexts = [
    "Initialisation de votre espace...",
    "Configuration du service...",
    "Sécurisation de la connexion...",
    "Préparation des données...",
    "Finalisation du processus...",
  ];
  
  // Configuration des tailles
  const sizes: Record<PremiumLoaderSize, string> = {
    xs: "w-32 max-w-xs text-xs",
    sm: "w-56 max-w-sm text-sm",
    md: "w-80 max-w-md text-base",
    lg: "w-96 max-w-lg text-lg",
    xl: "w-[32rem] max-w-xl text-xl",
    "2xl": "w-[36rem] max-w-2xl text-2xl",
  };
  
  // Mappage des couleurs
  const variants = {
    blue: {
      primary: "#0039A9",  // Bleu Enedis
      secondary: "#0057FF",
      accent: "#33b060",   // Vert Enedis
      light: "#E6EFFF",
      text: "text-[#0039A9]",
      textDark: "text-white",
      gradient: "from-[#0039A9] to-[#275EDB]",
      pathGradient: "from-[#0039A9] via-[#0057FF] to-[#33b060]",
    },
    green: {
      primary: "#33b060",  // Vert Enedis
      secondary: "#4CC278",
      accent: "#0039A9",   // Bleu Enedis
      light: "#E6FFEF",
      text: "text-[#33b060]",
      textDark: "text-white",
      gradient: "from-[#33b060] to-[#4CC278]",
      pathGradient: "from-[#33b060] via-[#4CC278] to-[#0039A9]",
    },
    neutral: {
      primary: "#2B3A55",
      secondary: "#526D82",
      accent: "#0039A9",
      light: "#F5F7FA",
      text: "text-[#2B3A55]",
      textDark: "text-white",
      gradient: "from-[#2B3A55] to-[#526D82]",
      pathGradient: "from-[#2B3A55] via-[#526D82] to-[#0039A9]",
    },
    white: {
      primary: "#FFFFFF",
      secondary: "#F0F4FA",
      accent: "#0039A9",
      light: "#FFFFFF",
      text: "text-[#0039A9]",
      textDark: "text-[#0039A9]",
      gradient: "from-white to-[#F0F4FA]",
      pathGradient: "from-white via-[#F0F4FA] to-[#0039A9]/20",
    },
  };
  
  // Sélection des couleurs en fonction du thème et de la variante
  const currentVariant = variants[variant];
  const isDarkTheme = theme === "dark" || (theme === "auto" && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  
  // Animation des textes
  useEffect(() => {
    if (!showText) return;
    
    // Simuler une progression
    const textIntervalId = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3200);
    
    return () => clearInterval(textIntervalId);
  }, [showText, loadingTexts.length]);
  
  // Démarrer l'animation après le montage pour éviter les problèmes de SSR
  useEffect(() => {
    setAnimationReady(true);
  }, []);
  
  // Contrôle de la progression
  const clampedProgress = Math.min(100, Math.max(0, progressValue));
  
  if (!animationReady) {
    return <div className={cn("w-full flex justify-center", sizes[size], className)} />;
  }
  
  return (
    <div 
      className={cn(
        "w-full flex flex-col items-center justify-center py-6", 
        sizes[size], 
        className
      )}
    >
      {/* Conteneur avec effet de verre */}
      <motion.div 
        className={cn(
          "relative w-full backdrop-blur-sm rounded-2xl border overflow-hidden",
          isDarkTheme 
            ? "bg-[#0F172A]/90 border-[#1E293B]" 
            : "bg-white/90 border-slate-200"
        )}
        style={{ backgroundColor: `rgba(255,255,255,${bgOpacity})` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Fond lumineux subtil */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-b opacity-5",
            `bg-gradient-to-br ${currentVariant.gradient}`
          )} 
        />
        
        {/* Animation de pulse pour le contenu */}
        <div className="relative p-6 z-10">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo avec animation */}
            {showLogo && (
              <div className="relative inline-flex justify-center items-center mb-2">
                {premium && (
                  <CircleEffects
                    variant={currentVariant}
                    isDark={isDarkTheme}
                    showParticles={particles}
                  />
                )}
                
                {/* Icon central */}
                <motion.div
                  className={cn(
                    "relative z-10 rounded-full p-4 flex items-center justify-center",
                    isDarkTheme ? "bg-[#1E293B]" : "bg-white",
                    isDarkTheme ? "shadow-[0_0_15px_rgba(0,57,169,0.3)]" : "shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                  )}
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Power 
                    className={cn(
                      "h-6 w-6",
                      isDarkTheme ? "text-white" : "text-[#0039A9]"
                    )} 
                  />
                </motion.div>
              </div>
            )}
            
            {/* Nom du service */}
            {showText && (
              <motion.div 
                className="text-center space-y-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className={cn(
                  "text-lg font-medium flex justify-center space-x-2",
                  isDarkTheme ? "text-white" : "text-slate-800"
                )}>
                  <span className={isDarkTheme ? "text-[#33b060]" : "text-[#33b060]"}>
                    Raccordement
                  </span>
                  <span className={isDarkTheme ? "text-white" : "text-[#0039A9]"}>
                    Enedis
                  </span>
                </div>
                
                <div className="relative h-6 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={textIndex}
                      className="absolute w-full text-center"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className={cn(
                        "text-sm",
                        isDarkTheme ? "text-slate-300" : "text-slate-600"
                      )}>
                        {customText || loadingTexts[textIndex]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
            
            {/* Barre de progression */}
            {showProgression && (
              <div className="w-full pt-2">
                <ProgressBar 
                  progress={clampedProgress} 
                  variant={currentVariant}
                  isDark={isDarkTheme}
                  premium={premium}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Badge de sécurité */}
      {premium && (
        <motion.div 
          className={cn(
            "mt-4 flex items-center text-xs px-3 py-1.5 rounded-full",
            isDarkTheme 
              ? "bg-[#1E293B] text-slate-300" 
              : "bg-slate-100 text-slate-600"
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3.5 w-3.5 mr-1.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
          <span>Connexion sécurisée</span>
        </motion.div>
      )}
    </div>
  );
}

// Composant d'effets circulaires autour du logo
function CircleEffects({ 
  variant, 
  isDark, 
  showParticles = true 
}: { 
  variant: any; 
  isDark: boolean;
  showParticles: boolean;
}) {
  return (
    <div className="absolute inset-0 w-20 h-20 -m-3">
      {/* Cercle externe qui pulse */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full",
          isDark ? "border border-[#33b060]/30" : "border border-[#33b060]/30"
        )}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      {/* Cercle rotatif */}
      <motion.div
        className={cn(
          "absolute inset-2 rounded-full border border-dashed",
          isDark ? "border-[#0039A9]/40" : "border-[#0039A9]/30"
        )}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear" 
        }}
      />
      
      {/* Particules orbitant */}
      {showParticles && (
        <div className="absolute inset-0">
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ 
                left: '50%', 
                top: '50%',
                marginLeft: '-2px',
                marginTop: '-2px',
                transformOrigin: 'center',
                transform: `rotate(${angle}deg) translateX(12px)` 
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 0.9, 0.5]
              }}
              transition={{
                rotate: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }
              }}
            >
              <div 
                className="w-full h-full rounded-full" 
                style={{ 
                  backgroundColor: i % 2 === 0 ? variant.primary : variant.accent,
                  boxShadow: `0 0 5px ${i % 2 === 0 ? variant.primary : variant.accent}`
                }} 
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant de barre de progression sophistiquée
function ProgressBar({ 
  progress, 
  variant, 
  isDark,
  premium = true
}: { 
  progress: number; 
  variant: any;
  isDark: boolean;
  premium?: boolean;
}) {
  // Étapes de la barre de progression
  const steps = ["Connexion", "Vérification", "Chargement", "Finalisation"];
  
  // Calculer les étapes terminées
  const completedSteps = Math.floor((progress / 100) * steps.length);
  
  return (
    <div className="w-full space-y-2">
      {/* Barre principale */}
      <div className={cn(
        "relative h-1.5 w-full rounded-full overflow-hidden",
        isDark ? "bg-[#1E293B]" : "bg-slate-100"
      )}>
        {/* Ligne de progression */}
        <motion.div
          className={cn(
            "absolute h-full rounded-full",
            `bg-gradient-to-r ${variant.gradient}`
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut" 
          }}
        />
        
        {/* Effet de brillance */}
        {premium && (
          <motion.div
            className="absolute top-0 h-full w-10 bg-white/30"
            animate={{ 
              left: ["-10%", "110%"] 
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              repeatDelay: 1 
            }}
          />
        )}
      </div>
      
      {/* Indicateurs d'étapes si premium */}
      {premium && (
        <div className="flex justify-between px-1 pt-1">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <motion.div 
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  i < completedSteps 
                    ? `bg-${variant.primary}` 
                    : isDark ? "bg-gray-600" : "bg-gray-300"
                )}
                animate={{ 
                  scale: i === completedSteps - 1 ? [1, 1.5, 1] : 1,
                  opacity: i < completedSteps ? 1 : 0.4
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: i === completedSteps - 1 ? Infinity : 0,
                  ease: "easeInOut" 
                }}
                style={{
                  backgroundColor: i < completedSteps ? variant.primary : (isDark ? "#475569" : "#CBD5E1")
                }}
              />
              {i < completedSteps && (
                <motion.span
                  className={cn(
                    "text-[0.65rem] mt-1.5",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  {step}
                </motion.span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}