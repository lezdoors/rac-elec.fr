import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Power, Zap, LightbulbIcon, BatteryFull, Info } from "lucide-react";

interface FrenchElectricLoaderProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  /** Vitesse de l'animation (ms) */
  speed?: number;
  /** Montrer les faits électriques */
  showFacts?: boolean;
  /** Montrer les étapes de chargement */
  showSteps?: boolean;
}

/**
 * Animation de chargement avancée avec thème électrique français
 * Affiche des informations éducatives sur Enedis et l'électricité
 */
export function FrenchElectricLoader({
  size = "lg",
  className,
  speed = 2200,
  showFacts = true,
  showSteps = true,
}: FrenchElectricLoaderProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1);
  
  // Infos techniques et éducatives sur l'électricité
  const electricFacts = [
    "La tension électrique standard est de 230 volts (50 Hz)",
    "La puissance standard pour un logement est de 9 kVA",
    "Un raccordement standard prend de 6 à 8 semaines",
    "Le disjoncteur différentiel protège contre les courts-circuits",
    "Les installations électriques ont une puissance en monophasé ou triphasé",
    "Un foyer moyen consomme 4 770 kWh par an",
    "L'électricité voyage à près de 300 000 km par seconde",
    "Les compteurs communicants envoient les données automatiquement",
    "La mise à la terre est essentielle pour la sécurité électrique",
    "Une installation électrique doit être certifiée conforme",
    "Les câbles ont différentes sections selon l'intensité requise",
    "Le courant alternatif change de sens 50 fois par seconde"
  ];
  
  // Étapes techniques du processus de chargement
  const loadingSteps = [
    {
      icon: <Zap className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Initialisation",
      description: "Préparation environnement de connexion"
    },
    {
      icon: <LightbulbIcon className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Vérification",
      description: "Analyse des paramètres techniques"
    },
    {
      icon: <Power className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Chargement",
      description: "Transfert des données principales"
    },
    {
      icon: <BatteryFull className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Finalisation",
      description: "Optimisation et préparation interface"
    }
  ];
  
  // Configuration des tailles
  const sizes = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
    xl: "max-w-lg",
    "2xl": "max-w-2xl"
  };
  
  // Animation des faits électriques
  useEffect(() => {
    if (!showFacts) return;
    
    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % electricFacts.length);
    }, speed * 1.5);
    
    return () => clearInterval(factInterval);
  }, [electricFacts.length, showFacts, speed]);
  
  // Simulation de progression
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Progression par étapes avec paliers
        if (prev >= 95) return 100;
        
        // Changement de phase
        if (prev >= 75 && phase < 4) setPhase(4);
        else if (prev >= 50 && phase < 3) setPhase(3);
        else if (prev >= 25 && phase < 2) setPhase(2);
        
        return prev + Math.random() * 3 + 0.5;
      });
    }, speed / 20);
    
    return () => clearInterval(progressInterval);
  }, [phase, speed]);
  
  return (
    <div className={cn(
      "w-full flex justify-center items-center", 
      sizes[size],
      className
    )}>
      <div className="relative max-w-md mx-auto bg-transparent">
        
        <div className="relative z-10">
          {/* Section animation électrique */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-5">
              {/* Cercles rotatifs - effet d'énergie */}
              <div className="absolute inset-0">
                <motion.div 
                  className="absolute inset-0 border-2 border-dashed rounded-full border-blue-700/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div 
                  className="absolute inset-2 border-2 border-dashed rounded-full border-red-600/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div 
                  className="absolute inset-4 border border-blue-700/20 rounded-full"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              
              {/* Éclairs dynamiques */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Éclairs animés */}
                {[1, 2, 3, 4].map((i) => {
                  const angle = (i - 1) * 90;
                  const delay = i * 0.4;
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{ 
                        transformOrigin: 'center',
                        rotate: `${angle}deg`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{ 
                        duration: 1.4, 
                        repeat: Infinity, 
                        delay: delay,
                        repeatDelay: 2.3
                      }}
                    >
                      <svg width="50" height="14" viewBox="0 0 50 14" fill="none">
                        <path 
                          d="M0,7 L10,2 L15,9 L25,0 L35,9 L40,4 L50,7" 
                          stroke={i % 2 === 0 ? "#0039A9" : "#33b060"} 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  );
                })}
                
                {/* Icône centrale */}
                <div className="relative z-10 rounded-full bg-gradient-to-b from-blue-600 to-blue-700 p-5 shadow-inner shadow-blue-900/30">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }}
                  >
                    <Power className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  {/* Effet lumineux sur l'icône */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/30 to-white/30" />
                  </div>
                </div>
              </div>
              
              {/* Câbles électriques */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 overflow-visible">
                {/* Câbles animés avec électricité */}
                <motion.div
                  className="relative h-16 border-l-2 border-blue-700"
                  initial={{ height: 0 }}
                  animate={{ height: 64 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  {/* Pulses d'électricité qui descendent - remplacé par des effets bleus */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 w-6 h-3 -translate-x-1/2 bg-gradient-to-b from-blue-400 to-transparent rounded-full opacity-60"
                      animate={{ 
                        top: ["-10%", "110%"],
                        opacity: [0.7, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "easeIn"
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
            
            {/* Titre */}
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-gray-800">Raccordement</span>
              <span className="text-2xl font-bold text-blue-600 ml-2">Enedis</span>
            </div>
            
            {/* Étape de chargement actuelle - changement dynamique */}
            {showSteps && (
              <div className="mb-2 border border-gray-100 rounded-lg p-3 bg-white/70 shadow-sm w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-gray-600"
                    >
                      {loadingSteps[phase - 1].icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {loadingSteps[phase - 1].title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {loadingSteps[phase - 1].description}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            
            {/* Info électrique éducative */}
            {showFacts && (
              <div className="mb-4 min-h-[60px] flex items-center w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={factIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-start bg-white/60 rounded-lg p-3 w-full shadow-sm border border-gray-100"
                  >
                    <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {electricFacts[factIndex]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            
            {/* Barre de progression modernisée */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
              {/* Fond de la barre avec effet léger */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-50 opacity-50" />
              </div>
              
              {/* Progression réelle */}
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
              />
              
              {/* Effet de brillance */}
              <motion.div
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  repeatDelay: 1.5, 
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Pourcentage de progression */}
            <div className="mt-2 text-xs font-medium text-gray-600">
              {Math.round(progress)}% 
              <span className="text-gray-500 ml-1">
                {progress >= 100 ? "Terminé" : "Chargement en cours"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Espacement en bas pour l'esthétique */}
        <div className="h-8 w-full mt-8"></div>
      </div>
      
      {/* Suppression du badge "Connexion sécurisée" qui n'était pas à sa place */}
    </div>
  );
}