import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Zap, Shield, Info, CheckCircle, Clock, Award } from "lucide-react";

interface SimpleElectricLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Afficher des informations Enedis */
  showInfo?: boolean;
  /** Afficher les badges de sécurité */
  showBadges?: boolean;
  /** Afficher un logo officiel */
  showLogo?: boolean;
  /** Afficher les certifications */
  showCertifications?: boolean;
}

/**
 * Loader inspiré de l'image fournie avec des améliorations et informations Enedis
 * Animation simple et efficace avec des barres de progression
 */
export function SimpleElectricLoader({
  size = "md",
  className,
  showInfo = true,
  showBadges = true,
  showLogo = true,
  showCertifications = true
}: SimpleElectricLoaderProps) {
  const [infoIndex, setInfoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showReassurance, setShowReassurance] = useState(false);
  
  // Infos instructives et rassurantes sur Enedis et l'électricité
  const enedisInfo = [
    "Enedis raccorde plus de 400 000 clients chaque année en toute sécurité",
    "Service public: Enedis assure l'égalité de traitement à tous les usagers",
    "Certification ISO 9001: nos services respectent les normes de qualité",
    "Enedis est le gestionnaire officiel du réseau de distribution électrique",
    "Vos données sont protégées selon les normes RGPD les plus strictes",
    "Notre service client est disponible 7j/7 en cas d'urgence",
    "95% de nos clients sont satisfaits de leur raccordement",
    "Nous intervenons partout en France métropolitaine",
    "Enedis gère plus de 1,4 million de km de réseau électrique",
    "Nos techniciens sont formés et certifiés pour votre sécurité",
    "Tous nos prestataires sont agréés et contrôlés régulièrement",
    "Nous travaillons en conformité avec les règlementations en vigueur",
    "Une assistance dédiée vous accompagne à chaque étape"
  ];
  
  // Configuration des tailles
  const sizes = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
    xl: "max-w-lg"
  };
  
  // Animation des informations Enedis
  useEffect(() => {
    if (!showInfo) return;
    
    const infoTimer = setInterval(() => {
      setInfoIndex(prev => (prev + 1) % enedisInfo.length);
    }, 3500);
    
    return () => clearInterval(infoTimer);
  }, [showInfo, enedisInfo.length]);
  
  // Simulation de progression
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 2 + 0.5;
      });
    }, 150);
    
    return () => clearInterval(progressTimer);
  }, []);
  
  // Variables d'état pour le logo et certifications
  const [showLogoElement, setShowLogoElement] = useState(false);
  const [showCertificationsElement, setShowCertificationsElement] = useState(false);
  
  // Afficher le badge de sécurité après un délai
  useEffect(() => {
    if (!showBadges) return;
    
    const timer = setTimeout(() => {
      setShowReassurance(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [showBadges]);
  
  // Afficher le logo après un délai
  useEffect(() => {
    if (!showLogo) return;
    
    const timer = setTimeout(() => {
      setShowLogoElement(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [showLogo]);
  
  // Afficher les certifications après un délai
  useEffect(() => {
    if (!showCertifications) return;
    
    const timer = setTimeout(() => {
      setShowCertificationsElement(true);
    }, 2200);
    
    return () => clearTimeout(timer);
  }, [showCertifications]);
  
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center",
      sizes[size],
      className
    )}>
      <div className="w-full flex flex-col items-center px-4">
        {/* Icône principale - cercle avec éclair */}
        <motion.div 
          className="mb-5 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center relative">
            {/* Effet de halo */}
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-300/20"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Icône d'éclair */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 2, 0, -2, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-blue-600 z-10"
            >
              <Zap className="h-8 w-8" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Barre de progression */}
        <div className="w-full">
          <motion.div 
            className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        </div>
        
        {/* Titre et statut */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-lg font-medium text-gray-900">Raccordement Enedis</h3>
          <p className="text-sm text-gray-500">
            {progress < 100 ? "Chargement de votre espace..." : "Chargement terminé"}
          </p>
        </motion.div>
        
        {/* Informations instructives Enedis */}
        {showInfo && (
          <div className="mt-5 min-h-[56px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={infoIndex}
                className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5 mr-2" />
                <p className="text-xs text-gray-700 leading-tight">
                  {enedisInfo[infoIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        {/* Logo Enedis officiel */}
        {showLogo && showLogoElement && (
          <motion.div
            className="mt-3 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center bg-blue-50 rounded-md px-4 py-2 border border-blue-100">
              <div className="text-center">
                <div className="font-bold uppercase text-blue-700 tracking-wider text-sm flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                  <span>Enedis</span>
                </div>
                <div className="text-[10px] uppercase tracking-tight text-blue-600 mt-0.5">
                  Service public de l'électricité
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Badges de sécurité */}
        {showBadges && showReassurance && (
          <motion.div
            className="mt-4 flex justify-center gap-2 flex-wrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
              <Shield className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
              <span>Connexion sécurisée</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
              <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
              <span>Site officiel</span>
            </div>
          </motion.div>
        )}
        
        {/* Certifications */}
        {showCertifications && showCertificationsElement && (
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-md py-2 px-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 justify-center">
                <div className="flex flex-col items-center">
                  <Award className="h-4 w-4 text-blue-700 mb-1" />
                  <span className="text-[9px] font-medium text-gray-600">ISO 9001</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-4 w-4 text-blue-700 mb-1" />
                  <span className="text-[9px] font-medium text-gray-600">24/7</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="h-4 w-4 text-blue-700 mb-1" />
                  <span className="text-[9px] font-medium text-gray-600">RGPD</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}