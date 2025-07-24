import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type PowerButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface PowerButtonLoaderProps {
  size?: PowerButtonSize;
  color?: "blue" | "green" | "tricolor";
  showText?: boolean;
  text?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Composant de bouton Power/On-Off élégant pour le logo
 * Design professionnel optimisé pour les interfaces modernes
 */
export function PowerButtonLoader({
  size = "md",
  color = "tricolor",
  showText = false,
  text = "Chargement en cours",
  showLabel = false,
  className,
}: PowerButtonLoaderProps) {
  // Mappage des tailles
  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
    xl: "w-28 h-28 text-lg",
  };

  // Palette de couleurs améliorée
  const colorPalette = {
    blue: {
      primary: "#0039A9",
      secondary: "#FFFFFF",
      accent: "#2C65E8",
      glow: "rgba(44, 101, 232, 0.45)"
    },
    green: {
      primary: "#00813C",
      secondary: "#FFFFFF", 
      accent: "#00A650",
      glow: "rgba(0, 166, 80, 0.45)"
    },
    tricolor: {
      primary: "#002395", // Bleu français
      secondary: "#FFFFFF", // Blanc
      accent: "#ED2939",   // Rouge français
      glow: "rgba(0, 35, 149, 0.4)"
    }
  };

  const selectedColor = colorPalette[color];
  const selectedSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center">
        <motion.div 
          className={cn(
            "relative rounded-full overflow-hidden flex items-center justify-center",
            selectedSize,
            "bg-gradient-to-b from-white to-gray-50 shadow-lg"
          )}
          initial={{ boxShadow: `0 2px 10px ${selectedColor.glow}` }}
          animate={{
            boxShadow: [
              `0 2px 10px ${selectedColor.glow}`,
              `0 4px 16px ${selectedColor.glow}`,
              `0 2px 10px ${selectedColor.glow}`
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Effet de lueur interne */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${selectedColor.glow} 0%, rgba(255,255,255,0) 70%)` 
            }}
            animate={{ 
              opacity: [0.15, 0.25, 0.15] 
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Effet 3D */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{ 
              background: "linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
              opacity: 0.9
            }}
          />
          
          {/* SVG du bouton power */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full z-10 relative"
          >
            {/* Définition des dégradés et effets */}
            <defs>
              <linearGradient id="power-button-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={selectedColor.primary} />
                <stop offset="100%" stopColor={selectedColor.accent} />
              </linearGradient>
              
              <filter id="power-glow-header" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              <filter id="power-shadow-header" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={selectedColor.primary} floodOpacity="0.25" />
              </filter>
              
              <filter id="inner-shadow-header" x="-10%" y="-10%" width="120%" height="120%">
                <feOffset dx="0" dy="1" />
                <feGaussianBlur stdDeviation="0.5" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.15" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>
            
            {/* Points lumineux discrets */}
            <g>
              {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index * 30) * Math.PI / 180;
                const x = 50 + 42 * Math.cos(angle);
                const y = 50 + 42 * Math.sin(angle);
                return (
                  <motion.circle 
                    key={index}
                    cx={x} 
                    cy={y} 
                    r={index % 3 === 0 ? 0.8 : 0.5}
                    fill={index % 4 === 0 ? selectedColor.accent : selectedColor.primary}
                    initial={{ opacity: index % 2 === 0 ? 0.3 : 0.6 }}
                    animate={{ 
                      opacity: index % 2 === 0 ? [0.3, 0.7, 0.3] : [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: index * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </g>
            
            {/* Cercle principal premium */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="35" 
              stroke="url(#power-button-gradient-header)"
              strokeWidth="2"
              fill="rgba(255, 255, 255, 0.05)"
              filter="url(#power-shadow-header)"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.92, 1, 0.92]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Anneau discret rotatif */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="38" 
              stroke={selectedColor.primary}
              strokeOpacity="0.1"
              strokeWidth="0.5"
              strokeDasharray="2,6"
              fill="none"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Icône Power élégante - Améliorée avec l'icône de la page 404 */}
            <motion.g 
              filter="url(#power-glow-header)"
              animate={{
                scale: [1, 1.03, 1],
                opacity: [0.95, 1, 0.95]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Trait central - Style identique à celui de la page 404 */}
              <motion.path
                d="M50 30L50 53"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#inner-shadow-header)"
                animate={{
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Cercle du power button - Style identique à celui de la page 404 */}
              <motion.path
                d={`
                  M 50 53
                  m -18, 0
                  a 18,18 0 1,0 36,0
                  a 18,18 0 1,0 -36,0
                `}
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                filter="url(#inner-shadow-header)"
                strokeDasharray={color === "tricolor" ? "60 40" : ""}
                animate={{
                  strokeDashoffset: color === "tricolor" ? [0, 100, 0] : 0,
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: color === "tricolor" ? 8 : 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
          </svg>
        </motion.div>
        
        {showText && (
          <motion.div 
            className={cn(
              "text-center font-medium mt-2",
              size === "xs" || size === "sm" ? "text-xs" : 
              size === "md" ? "text-sm" : 
              "text-base"
            )}
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.div>
        )}
      </div>
      
      {/* Label Services Enedis - Optionnel, avec l'icône power adaptative */}
      {showLabel && (
        <div className="flex flex-col ml-2.5">
          <div className="flex items-center">
            <div className="relative w-4 h-4 flex items-center justify-center mr-1.5">
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-[#33b060] opacity-30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#33b060]">
                  <path 
                    d="M12 5v7M12 12a5 5 0 1 0 0 -0.01" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </motion.div>
            </div>
            <span className="text-[#33b060] font-semibold text-sm lg:text-base">Services</span>
            <span className="text-[#002395] font-semibold text-sm lg:text-base ml-0.5">Enedis</span>
          </div>
          <span className="text-xs text-gray-600 tracking-tight">
            Raccordement électrique
          </span>
        </div>
      )}
    </div>
  );
}