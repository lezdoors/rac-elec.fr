import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, Clock, FileCheck, Zap, Lightbulb, Lock, BellRing, AlertTriangle } from "lucide-react";

interface EnedisEnhancedLoaderProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  speed?: number;
  showInfo?: boolean;
  showSecurity?: boolean;
}

/**
 * Chargeur amélioré dans le style de l'image fournie avec des améliorations UX
 * Se concentre sur un design simple mais élégant avec des informations utiles
 */
export function EnedisEnhancedLoader({
  size = "md",
  className,
  speed = 3000,
  showInfo = true,
  showSecurity = true
}: EnedisEnhancedLoaderProps) {
  const [infoIndex, setInfoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [securityBadgesVisible, setSecurityBadgesVisible] = useState(false);
  
  // Tailles disponibles
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };
  
  // Informations importantes sur le raccordement Enedis
  const raccordementInfo = [
    {
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      title: "Délai moyen de raccordement",
      description: "6 à 8 semaines après validation de votre dossier"
    },
    {
      icon: <FileCheck className="h-4 w-4 text-blue-600" />,
      title: "Documents nécessaires",
      description: "Plan de situation, plan de masse et attestation de conformité"
    },
    {
      icon: <Zap className="h-4 w-4 text-blue-600" />,
      title: "Puissance standard",
      description: "De 3 à 36 kVA selon vos besoins énergétiques"
    },
    {
      icon: <Shield className="h-4 w-4 text-blue-600" />,
      title: "Obligations légales",
      description: "Installation conforme à la norme NF C 15-100"
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      title: "Point important",
      description: "Seul Enedis est habilité à intervenir sur le réseau public"
    },
    {
      icon: <Lightbulb className="h-4 w-4 text-blue-600" />,
      title: "Conseil pratique",
      description: "Prévoyez un emplacement accessible pour votre compteur"
    }
  ];
  
  // Informations de sécurité
  const securityInfo = [
    {
      icon: <Lock className="h-3.5 w-3.5" />,
      text: "Connexion sécurisée"
    },
    {
      icon: <Shield className="h-3.5 w-3.5" />,
      text: "Site officiel Enedis"
    },
    {
      icon: <BellRing className="h-3.5 w-3.5" />,
      text: "Support client 24/7"
    }
  ];
  
  // Animation pour les infos éducatives
  useEffect(() => {
    if (!showInfo) return;
    
    const infoTimer = setInterval(() => {
      setInfoIndex(prev => (prev + 1) % raccordementInfo.length);
    }, speed * 1.2);
    
    return () => clearInterval(infoTimer);
  }, [showInfo, speed, raccordementInfo.length]);
  
  // Animation pour la progression
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 2 + 0.5;
        return prev >= 100 ? 100 : prev + increment;
      });
    }, 150);
    
    return () => clearInterval(progressTimer);
  }, []);
  
  // Afficher les badges de sécurité après un délai
  useEffect(() => {
    if (!showSecurity) return;
    
    const timer = setTimeout(() => {
      setSecurityBadgesVisible(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [showSecurity]);
  
  return (
    <div className={cn(
      "w-full flex justify-center items-center", 
      sizes[size],
      className
    )}>
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-5">
        <div className="space-y-6">
          {/* Icône principale et logo */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Cercle principal */}
              <motion.div 
                className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Effet de halo */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-400/30 blur-md z-0"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                
                {/* Icône d'éclair */}
                <motion.div
                  className="relative z-10"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#1d4ed8" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>
          
          {/* Titre */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Raccordement Enedis</h2>
            <p className="text-sm text-gray-500">
              Chargement de votre espace personnel
            </p>
          </div>
          
          {/* Barre de progression principale */}
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Ligne d'information secondaire */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% complété</span>
              <span>Préparation de votre interface...</span>
            </div>
          </div>
          
          {/* Barres de progression secondaires */}
          <div className="space-y-3 pt-2">
            {[
              { label: "Données utilisateur", progress: Math.min(100, progress * 1.2), color: "bg-blue-500" },
              { label: "Vérification dossier", progress: Math.min(100, progress * 1.1), color: "bg-green-500" },
              { label: "Chargement interface", progress: Math.min(100, progress * 0.9), color: "bg-purple-500" }
            ].map((bar, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-700">{bar.label}</span>
                  <span className="text-gray-500">{Math.round(bar.progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full", bar.color)}
                    style={{ width: `${bar.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Informations éducatives */}
          {showInfo && (
            <div className="min-h-[90px] bg-gray-50 rounded-lg p-3 border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={infoIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 p-1.5 bg-white rounded-full border border-gray-200">
                      {raccordementInfo[infoIndex].icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {raccordementInfo[infoIndex].title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {raccordementInfo[infoIndex].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          
          {/* Badges de sécurité */}
          {showSecurity && securityBadgesVisible && (
            <motion.div 
              className="flex justify-center space-x-3 pt-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {securityInfo.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-200"
                >
                  <span className="mr-1.5 text-blue-600">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}