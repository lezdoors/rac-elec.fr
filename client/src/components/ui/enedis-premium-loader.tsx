import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Power, Zap, LightbulbIcon, BatteryFull, ShieldCheck, InfoIcon } from "lucide-react";

interface EnedisPremiumLoaderProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  /** Vitesse de l'animation (ms) */
  speed?: number;
  /** Montrer les faits électriques */
  showFacts?: boolean;
  /** Montrer la progression des étapes */
  showSteps?: boolean;
  /** Montrer les badges de confiance */
  showTrustBadges?: boolean;
}

/**
 * Animation de chargement premium pour Enedis
 * Inclut des informations instructives et éléments rassurants
 */
export function EnedisPremiumLoader({
  size = "lg",
  className,
  speed = 2200,
  showFacts = true,
  showSteps = true,
  showTrustBadges = true,
}: EnedisPremiumLoaderProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(1);
  const [showReassurance, setShowReassurance] = useState(false);
  
  // Infos instructives sur Enedis et l'électricité
  const electricFacts = [
    "Enedis gère plus de 1,4 million de km de réseau électrique en France",
    "Le raccordement standard prend environ 6 semaines après acceptation",
    "Votre installation doit être certifiée conforme par un électricien agréé",
    "La puissance standard pour un logement est généralement de 9 kVA",
    "Enedis raccorde plus de 400 000 nouveaux clients chaque année",
    "La mise à la terre est essentielle pour votre sécurité électrique",
    "Le compteur Linky permet de suivre votre consommation en temps réel",
    "Une installation triphasée est idéale pour les équipements puissants",
    "Enedis intervient 24h/24 en cas d'urgence sur le réseau public",
    "Plus de 38 millions de foyers sont raccordés au réseau Enedis",
    "Un diagnostic électrique est obligatoire pour les logements de +15 ans",
    "La solution d'autoconsommation permet de produire sa propre électricité"
  ];
  
  // Étapes du processus de raccordement
  const loadingSteps = [
    {
      icon: <Zap className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Initialisation",
      description: "Préparation de votre espace personnel"
    },
    {
      icon: <LightbulbIcon className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Vérification",
      description: "Analyse des paramètres de raccordement"
    },
    {
      icon: <Power className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Chargement",
      description: "Configuration de votre projet Enedis"
    },
    {
      icon: <BatteryFull className="h-5 w-5 flex-shrink-0 mr-2" />,
      title: "Finalisation",
      description: "Préparation de votre interface personnalisée"
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
  
  // Afficher les badges de confiance après un délai
  useEffect(() => {
    if (!showTrustBadges) return;
    
    const timer = setTimeout(() => {
      setShowReassurance(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [showTrustBadges]);
  
  return (
    <div className={cn(
      "w-full flex justify-center items-center", 
      sizes[size],
      className
    )}>
      <div className="relative w-full max-w-md mx-auto bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="relative z-10">
          {/* Logo et en-tête */}
          <div className="flex flex-col items-center">
            {/* Cercle avec logo */}
            <div className="relative w-20 h-20 mb-5">
              {/* Cercle principal */}
              <div className="absolute inset-0 rounded-full bg-blue-50 border-2 border-blue-100"></div>
              
              {/* Animation d'éclairs */}
              <div className="absolute inset-0">
                {[1, 2, 3, 4].map((i) => {
                  const rotate = (i-1) * 90;
                  return (
                    <motion.div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-8"
                      style={{
                        transformOrigin: "0 0",
                        rotate: `${rotate}deg`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 0.7, 0],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        repeatDelay: 2,
                      }}
                    >
                      <svg width="8" height="32" viewBox="0 0 8 32" fill="none">
                        <path 
                          d="M4,0 L1,16 L7,16 L4,32" 
                          stroke="#0039A9" 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Cercles concentriques animés */}
              <motion.div 
                className="absolute inset-1 rounded-full border border-dashed border-blue-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div 
                className="absolute inset-3 rounded-full border border-blue-200"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Icône centrale */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 3, 0, -3, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Zap className="h-8 w-8 text-blue-600" />
                </motion.div>
              </div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute w-8 h-full bg-gradient-to-r from-transparent via-white to-transparent" 
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 1
                  }}
                />
              </div>
            </div>
            
            {/* Titre */}
            <div className="text-center mb-4">
              <h2 className="flex items-center justify-center text-xl font-semibold">
                <span className="text-blue-900">Raccordement</span>
                <span className="text-blue-600 ml-2">Enedis</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Service officiel de raccordement électrique
              </p>
            </div>
            
            {/* Barre de progression principale */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative mb-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                style={{ width: `${progress}%` }}
                initial={{ width: "0%" }}
                transition={{ ease: "easeOut" }}
              />
              
              {/* Effet de brillance sur la barre */}
              <motion.div
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  repeatDelay: 1.5
                }}
              />
            </div>
            
            {/* Pourcentage de progression */}
            <div className="text-sm text-gray-600 mb-4">
              {Math.round(progress)}% {progress >= 100 ? "Terminé" : "Chargement en cours"}
            </div>
            
            {/* Étape de chargement actuelle */}
            {showSteps && (
              <div className="mb-4 w-full">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="text-blue-600 mt-0.5"
                      >
                        {loadingSteps[phase - 1].icon}
                      </motion.div>
                      <div className="ml-2">
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
              </div>
            )}
            
            {/* Info éducative Enedis */}
            {showFacts && (
              <div className="mb-4 min-h-[80px] w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={factIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start">
                      <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mr-2 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {electricFacts[factIndex]}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            
            {/* Badges de confiance et sécurité */}
            {showTrustBadges && showReassurance && (
              <motion.div 
                className="w-full mt-2 space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center space-x-4">
                  {/* Badge de connexion sécurisée */}
                  <div className="flex items-center text-xs bg-blue-50 rounded-full px-3 py-1.5 text-blue-700 border border-blue-100">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Connexion sécurisée</span>
                  </div>
                  
                  {/* Badge service officiel */}
                  <div className="flex items-center text-xs bg-green-50 rounded-full px-3 py-1.5 text-green-700 border border-green-100">
                    <motion.span 
                      className="w-3 h-3 rounded-full bg-green-500 mr-1.5"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span>Service officiel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}