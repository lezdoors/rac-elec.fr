import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ElectricLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showText?: boolean;
  textPosition?: "bottom" | "right";
  color?: string;
  intensity?: number;
}

export function ElectricLoader({
  size = "md",
  text = "Initialisation en cours...",
  showText = true,
  textPosition = "bottom",
  color = "#33b060", // Vert Enedis
  intensity = 0.8,
  className,
  ...props
}: ElectricLoaderProps) {
  const [dots, setDots] = useState<string>(text);
  
  // Animation des points de suspension pour le texte
  useEffect(() => {
    if (!showText) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        const baseText = text.replace(/\.+$/, '');
        const count = (prev.match(/\./g) || []).length;
        const newCount = (count + 1) % 4;
        return baseText + '.'.repeat(newCount);
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, [text, showText]);

  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40"
  };
  
  // Léger ajustement de taille pour rendre l'icône plus visible
  const iconSizeMap = {
    sm: "w-1/2 h-1/2",
    md: "w-1/2 h-1/2",
    lg: "w-3/5 h-3/5",
    xl: "w-3/5 h-3/5"
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };
  
  const greenEnedis = "#33b060"; 
  const blueEnedis = "#2e3d96";
  
  // Ajout d'un effet drapeau français stylisé avec les couleurs officielles
  const flagColors = [
    { color: "#002395", delay: 0 },    // Bleu officiel du drapeau français
    { color: "#ffffff", delay: 0.15 }, // Blanc
    { color: "#ED2939", delay: 0.3 }   // Rouge officiel du drapeau français
  ];

  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        textPosition === "bottom" ? "flex-col space-y-4" : "flex-row space-x-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Barre tricolore française épurée et élégante */}
        <div className="flex mb-6 overflow-hidden rounded-full shadow-md w-auto mx-auto">
          {flagColors.map((flag, index) => (
            <motion.div
              key={index}
              className="h-2 w-10"
              style={{ backgroundColor: flag.color }}
              initial={{ opacity: 0.7 }}
              animate={{ 
                opacity: [0.8, 1, 0.8],
                width: index === 1 ? ["40px", "40px"] : ["30px", "35px", "30px"] 
              }}
              transition={{
                duration: 3,
                delay: flag.delay,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Cercle principal - design moderne inspiré de la page 404 */}
        <motion.div 
          className={cn(
            "relative rounded-full flex items-center justify-center",
            sizeMap[size],
            "bg-white/95 backdrop-blur-sm shadow-xl border border-white"
          )}
          animate={{
            boxShadow: ["0 4px 16px rgba(46, 61, 150, 0.1)", "0 8px 32px rgba(51, 176, 96, 0.15)", "0 4px 16px rgba(46, 61, 150, 0.1)"]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Container de l'icône avec animation */}
          <motion.div
            className="relative w-3/4 h-3/4 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Effet de halo autour de l'icône */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-blue-50 opacity-50"
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Cercle de pulsation */}
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-[#33b060] opacity-30"
              animate={{ 
                scale: [0.9, 1.1, 0.9] 
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Icône Power stylisée */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={cn(iconSizeMap[size], "drop-shadow-md z-10 relative")}
            >
              <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={blueEnedis} />
                  <stop offset="100%" stopColor={greenEnedis} />
                </linearGradient>
                
                <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Dessin de l'icône Power */}
              <motion.path 
                d="M18.36 6.64a9 9 0 1 1-12.73 0" 
                stroke="url(#iconGradient)"
                filter="url(#iconGlow)"
                animate={{
                  strokeWidth: [2, 2.5, 2],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.line 
                x1="12" y1="2" x2="12" y2="12" 
                stroke="url(#iconGradient)"
                filter="url(#iconGlow)"
                animate={{
                  strokeWidth: [2, 2.5, 2],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
      
      {showText && (
        <div 
          className={cn(
            "text-center text-[#33b060] font-medium",
            textSizeMap[size]
          )}
        >
          {dots}
        </div>
      )}
      
      {/* Logo Enedis avec design amélioré */}
      <motion.div 
        className="text-center font-bold mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[#33b060] text-base tracking-wide font-semibold">Raccordement</span>
          <span className="text-[#2e3d96] text-base tracking-wide font-semibold">Enedis</span>
        </div>
        <motion.div 
          className="text-xs text-gray-600 mt-1.5 font-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Service officiel de raccordement électrique
        </motion.div>
      </motion.div>
    </div>
  );
}