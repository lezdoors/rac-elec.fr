import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface PowerElectricLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showText?: boolean;
  textPosition?: "bottom" | "right";
  color?: "blue" | "green" | "tricolor";
  intensity?: number;
}

export function PowerElectricLoader({
  size = "md",
  text = "Initialisation en cours...",
  showText = true,
  textPosition = "bottom",
  color = "tricolor", // Options: blue, green, tricolor
  intensity = 0.8,
  className,
  ...props
}: PowerElectricLoaderProps) {
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
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
    xl: "w-56 h-56"
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };
  
  // Définition des couleurs - Palette améliorée
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
      glow: "rgba(0, 35, 149, 0.45)"
    }
  };

  const selectedColors = colorPalette[color];
  
  // Couleurs françaises pour l'effet tricolore - Amélioré
  const flagColors = [
    { color: "#002395", delay: 0 },    // Bleu officiel du drapeau français
    { color: "#FFFFFF", delay: 0.15 }, // Blanc
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
        {color === "tricolor" && (
          <div className="flex mb-5 overflow-hidden rounded-lg shadow-md w-auto mx-auto">
            {flagColors.map((flag, index) => (
              <motion.div
                key={index}
                className="h-2.5 w-10"
                style={{ backgroundColor: flag.color }}
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  width: index === 1 ? ["40px", "40px"] : ["35px", "35px"] 
                }}
                transition={{
                  duration: 2.5,
                  delay: flag.delay,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
        
        {/* Container principal avec effet de profondeur */}
        <motion.div 
          className={cn(
            "relative rounded-full flex items-center justify-center",
            sizeMap[size],
            "bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm shadow-xl"
          )}
          initial={{ boxShadow: `0 4px 20px ${selectedColors.glow}` }}
          animate={{
            boxShadow: [
              `0 4px 20px ${selectedColors.glow}`,
              `0 8px 30px ${selectedColors.glow}`,
              `0 4px 20px ${selectedColors.glow}`
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Effet de lueur externe */}
          <motion.div 
            className="absolute inset-1 rounded-full opacity-25"
            style={{ 
              background: `radial-gradient(circle, ${selectedColors.glow} 0%, rgba(255,255,255,0) 70%)` 
            }}
            animate={{ 
              scale: [0.95, 1.05, 0.95],
              opacity: [0.2, 0.35, 0.2] 
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Effet 3D et ombre */}
          <motion.div 
            className="absolute inset-3 rounded-full"
            style={{ 
              background: `linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)`,
              opacity: 0.8
            }}
          />
          
          {/* SVG du bouton power avec design professionnel */}
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full absolute"
          >
            {/* Définition des dégradés et effets */}
            <defs>
              <linearGradient id="power-button-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={selectedColors.primary} />
                <stop offset="100%" stopColor={selectedColors.accent} />
              </linearGradient>
              
              <linearGradient id="circle-gradient" x1="30%" y1="10%" x2="70%" y2="90%">
                <stop offset="0%" stopColor={selectedColors.primary} stopOpacity="0.9" />
                <stop offset="100%" stopColor={selectedColors.accent} stopOpacity="0.9" />
              </linearGradient>
              
              <filter id="power-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              <filter id="power-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={selectedColors.primary} floodOpacity="0.3" />
              </filter>
              
              <filter id="inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feOffset dx="0" dy="1" />
                <feGaussianBlur stdDeviation="1" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.15" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>
            
            {/* Points lumineux rotatifs pour effet premium */}
            <g>
              {Array.from({ length: 24 }).map((_, index) => {
                const angle = (index * 15) * Math.PI / 180;
                const x = 50 + 43 * Math.cos(angle);
                const y = 50 + 43 * Math.sin(angle);
                return (
                  <motion.circle 
                    key={index}
                    cx={x} 
                    cy={y} 
                    r={index % 3 === 0 ? 1 : 0.6}
                    fill={index % 4 === 0 ? selectedColors.accent : selectedColors.primary}
                    initial={{ opacity: index % 2 === 0 ? 0.3 : 0.7 }}
                    animate={{ 
                      opacity: index % 2 === 0 ? [0.3, 0.8, 0.3] : [0.7, 0.3, 0.7],
                      r: index % 3 === 0 ? [1, 1.3, 1] : [0.6, 0.9, 0.6]
                    }}
                    transition={{
                      duration: 3,
                      delay: index * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </g>
            
            {/* Cercle principal avec gradient premium */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="35" 
              stroke="url(#circle-gradient)"
              strokeWidth="2.5"
              fill="rgba(255, 255, 255, 0.08)"
              filter="url(#power-shadow)"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.92, 1, 0.92]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Anneau lumineux avec effet de rotation */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke={selectedColors.primary}
              strokeOpacity="0.15"
              strokeWidth="0.5"
              strokeDasharray="3,5"
              fill="none"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Second anneau rotatif (direction opposée) */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="38" 
              stroke={selectedColors.accent}
              strokeOpacity="0.15"
              strokeWidth="0.5"
              strokeDasharray="2,7"
              fill="none"
              animate={{
                rotate: -360
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Icône Power avec effet lumineux - Version identique à la page 404 */}
            <motion.g 
              filter="url(#power-glow)"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Trait central du bouton power - Style de la page 404 */}
              <motion.path
                d="M50 30L50 53"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#inner-shadow)"
                animate={{
                  strokeWidth: [5, 5.5, 5],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Cercle du bouton power avec animation spéciale tricolore - Style de la page 404 */}
              <motion.path
                d={`
                  M 50 53
                  m -18, 0
                  a 18,18 0 1,0 36,0
                  a 18,18 0 1,0 -36,0
                `}
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                filter="url(#inner-shadow)"
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
              
              {/* Reflet lumineux pour effet 3D */}
              <motion.path
                d="M50 30L50 53"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="1,15"
                animate={{
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transform: "translateX(2px) translateY(1px)" }}
              />
            </motion.g>
          </svg>
          
          {/* Effet de reflet en surface */}
          <motion.div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{ 
              background: "linear-gradient(140deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%)",
              opacity: 0.7
            }}
          />
        </motion.div>
      </div>
      
      {showText && (
        <motion.div 
          className={cn(
            "text-center font-medium mt-4",
            textSizeMap[size],
            color === "blue" ? "text-blue-700" : 
            color === "green" ? "text-green-700" : 
            "text-[#0039A9]"
          )}
          animate={{
            opacity: [0.85, 1, 0.85]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {dots}
        </motion.div>
      )}
      
      {/* Logo Enedis avec design premium */}
      <motion.div 
        className="text-center mt-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="flex items-center justify-center">
          {/* Icône Power miniature avec effet 404 */}
          <div className="relative w-6 h-6 mr-2">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-[#33b060] opacity-30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="h-full w-full flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#33b060]"
              >
                <path 
                  d="M12 5v7M12 12a5 5 0 1 0 0 -0.01" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </div>
          
          {/* Texte du logo */}
          <div className="flex items-center">
            <span className="text-[#33b060] text-lg tracking-wide font-semibold">Services</span>
            <span className="text-[#002395] text-lg tracking-wide font-semibold ml-1">Enedis</span>
          </div>
        </div>
        
        <motion.div 
          className="text-xs text-gray-600 mt-1 font-normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Raccordement et services électriques
        </motion.div>
      </motion.div>
    </div>
  );
}