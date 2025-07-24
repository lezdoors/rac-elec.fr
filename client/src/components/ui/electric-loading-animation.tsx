import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

interface ElectricLoadingAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  showLogo?: boolean;
  showText?: boolean;
  className?: string;
  title?: string;
  description?: string;
  ariaLabel?: string;
  /** Pourcentage estimé du chargement (pour accessibilité et SEO) */
  progress?: number;
  /** Priorité de chargement pour SEO et Core Web Vitals */
  priority?: boolean;
}

/**
 * Animation de chargement ultra-moderne avec des effets électriques
 * Utilisée pour l'écran de démarrage et les chargements importants
 */
export function ElectricLoadingAnimation({
  size = "xl",
  showLogo = true,
  showText = true,
  className,
  title = "Raccordement Enedis",
  description = "Chargement de votre espace en cours...",
  ariaLabel = "Animation de chargement en cours",
  progress = 50,
  priority = true
}: ElectricLoadingAnimationProps) {
  // Configuration des tailles
  const sizes = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
    xl: "max-w-lg"
  };
  
  return (
    <div 
      className={cn("w-full flex flex-col items-center justify-center", className)}
      role="progressbar" 
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      {/* Métadonnées pour SEO */}
      <div className="sr-only">
        <h2>{title}</h2>
        <p>{description}</p>
        <div>Chargement: {progress}%</div>
      </div>
      
      {/* Carte container avec effet de verre amélioré */}
      <motion.div 
        className={cn(
          "relative w-full backdrop-blur-lg bg-gradient-to-b from-white/95 to-white/90 rounded-3xl border border-[#0039A9]/10 shadow-[0_8px_30px_rgba(0,57,169,0.12)] overflow-hidden",
          sizes[size]
        )}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 1, 
          ease: [0.34, 1.56, 0.64, 1]  // Spring-like animation
        }}
      >
        {/* Effet de lumière en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0039A9]/10 via-[#2C65E8]/10 to-[#0039A9]/10" />
        
        {/* Lignes de circuit animées */}
        <div className="absolute inset-0">
          <CircuitLines />
        </div>
        
        {/* Conteneur principal */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 md:p-10">
          {/* Logo avec animation de pulsation */}
          {showLogo && (
            <motion.div
              className="mb-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="relative mb-3">
                {/* Aura pulsante */}
                <motion.div 
                  className="absolute -inset-6 rounded-full bg-blue-500/10 blur-2xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Logo électrique */}
                <div className="relative scale-150 mb-5">
                  {/* Anneaux rotatifs */}
                  <div className="absolute inset-0 w-14 h-14 -m-1">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-dashed border-[#33b060]/30"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="absolute inset-1 rounded-full border border-[#0039A9]/20"
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  
                  {/* Orbitals d'énergie */}
                  <motion.div
                    className="absolute w-16 h-16 -m-2"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <motion.div
                        key={`orbital-${i}`}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ 
                          left: '50%', 
                          top: '50%', 
                          transform: `rotate(${angle}deg) translate(30px) rotate(-${angle}deg)` 
                        }}
                        animate={{
                          scale: [0.6, 1, 0.6],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      >
                        <div 
                          className={`w-full h-full rounded-full ${i % 2 === 0 ? 'bg-[#33b060]' : 'bg-[#0039A9]'}`} 
                          style={{ 
                            boxShadow: `0 0 6px ${i % 2 === 0 ? '#33b060' : '#0039A9'}` 
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Logo principal - design premium */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Cercle de base avec effet de verre */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#0039A9]/5 to-[#0039A9]/10 shadow-sm backdrop-blur-sm"></div>
                    
                    {/* Halo lumineux */}
                    <motion.div 
                      className="absolute -inset-1 rounded-full blur-md bg-[#33b060]/20"
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [0.95, 1.05, 0.95]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Cercle extérieur pulsant */}
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-[#33b060]"
                      animate={{ 
                        boxShadow: [
                          "0 0 0px #33b060",
                          "0 0 8px #33b060",
                          "0 0 0px #33b060"
                        ],
                        scale: [1, 1.03, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Cercle intérieur subtil */}
                    <motion.div 
                      className="absolute inset-1 rounded-full border border-[#0039A9]/40"
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4],
                        scale: [0.96, 1.04, 0.96]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Icône Power avec effets avancés */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.12, 1], 
                        rotate: [0, 5, 0, -5, 0],
                        y: [0, -1, 0, 1, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: [0.76, 0, 0.24, 1] // Animation fluide avec rebond subtil
                      }}
                      className="z-10 relative"
                      style={{ filter: "drop-shadow(0 1px 2px rgba(0,57,169,0.3))" }}
                    >
                      {/* Lueur sous l'icône */}
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-[#33b060]/20 blur-sm"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      
                      {/* Icône Power avec dégradé */}
                      <div className="relative">
                        <Power className="h-6 w-6 text-[#0039A9] dark:text-white" />
                      </div>
                    </motion.div>
                    
                    {/* Effet verre brillant */}
                    <div 
                      className="absolute inset-0 rounded-full overflow-hidden opacity-60 z-[1]"
                      style={{ 
                        background: "linear-gradient(140deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0) 100%)"
                      }}
                    />
                    
                    {/* Points de lumière qui tournent */}
                    <motion.div 
                      className="absolute inset-0"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      {[30, 150, 270].map((angle, i) => (
                        <motion.div
                          key={`dot-${i}`}
                          className="absolute w-1 h-1 rounded-full bg-white"
                          style={{ 
                            left: '50%', 
                            top: '50%',
                            marginLeft: '-0.5px',
                            marginTop: '-0.5px',
                            transform: `rotate(${angle}deg) translate(-45%) rotate(-${angle}deg) scale(0.8)`,
                            boxShadow: '0 0 3px #fff' 
                          }}
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Nom du service */}
              <motion.div 
                className="text-center opacity-80"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.9, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <span className="text-[#33b060] text-xl font-medium tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>Raccordement</span>
                  <span className="text-[#0039A9] text-xl font-semibold tracking-wide ml-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.01em' }}>Enedis</span>
                </div>
                <div className="text-xs text-[#0039A9]/70" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.03em', fontWeight: 400 }}>
                  Service officiel de raccordement électrique
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Barre de chargement premium */}
          <div className="w-full max-w-sm mx-auto mt-5">
            <LoadingBar />
          </div>
          
          {/* Texte d'état */}
          {showText && (
            <motion.div 
              className="mt-6 text-sm text-center text-[#0039A9] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <LoadingText />
            </motion.div>
          )}
          
          {/* Badge de sécurité amélioré - style français élégant */}
          <motion.div 
            className="mt-8 flex items-center text-[#0039A9] bg-gradient-to-r from-blue-50/30 to-blue-50/20 border border-[#0039A9]/10 rounded-full px-4 py-1.5 text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}
          >
            <motion.span 
              className="mr-2 text-[#0039A9]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </motion.span>
            <span style={{ fontWeight: 500 }}>Connexion sécurisée</span>
            <motion.span 
              className="ml-1.5 text-[#33b060] flex items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Composant pour les lignes de circuit animées
function CircuitLines() {
  // Effet d'énergie électrique - calculé une seule fois au chargement du composant
  const particles = Array.from({ length: 15 }, () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 0.8 + Math.random() * 2.2,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    color: Math.random() > 0.6 ? "#33b060" : "#0039A9"
  }));

  const lines = Array.from({ length: 8 }, () => ({
    x1: Math.random() * 100,
    y1: Math.random() * 100,
    x2: Math.random() * 100,
    y2: Math.random() * 100,
    duration: 20 + Math.random() * 10,
    delay: Math.random() * 5,
    dash: Math.ceil(Math.random() * 10),
    gap: Math.ceil(Math.random() * 15),
    color: Math.random() > 0.5 ? "#33b060" : "#0039A9",
    opacity: 0.3 + Math.random() * 0.7,
    width: 0.5 + Math.random() * 1
  }));

  // Points de connexion
  const connectionPoints = [
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 50, y: 50 },
    { x: 30, y: 70 },
    { x: 70, y: 80 }
  ];
  
  return (
    <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Pattern de base amélioré */}
      <pattern id="circuit-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
        <motion.path 
          d="M20,0 L20,20 L0,20 M40,0 L40,40 L0,40 M60,0 L60,60 L0,60 M80,0 L80,80 L0,80 M100,0 L100,100 L0,100" 
          fill="none" 
          stroke="#33b060" 
          strokeWidth="0.7"
          strokeDasharray="3,7"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.path 
          d="M0,0 L100,0 L100,100" 
          fill="none" 
          stroke="#0039A9" 
          strokeWidth="0.7"
          strokeDasharray="2,10"
          strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.path 
          d="M0,100 C25,70 50,130 100,50" 
          fill="none" 
          stroke="#0039A9" 
          strokeWidth="0.5"
          strokeDasharray="2,20"
          animate={{ strokeDashoffset: [0, -200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      
      {/* Lignes de connexion dynamiques */}
      {lines.map((line, i) => (
        <motion.line
          key={`line-${i}`}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x2}%`}
          y2={`${line.y2}%`}
          stroke={line.color}
          strokeWidth={line.width}
          strokeOpacity={line.opacity}
          strokeDasharray={`${line.dash},${line.gap}`}
          animate={{ 
            strokeDashoffset: [0, -200],
            x1: [`${line.x1}%`, `${line.x1 + (Math.random() * 10 - 5)}%`],
            y1: [`${line.y1}%`, `${line.y1 + (Math.random() * 10 - 5)}%`]
          }}
          transition={{ 
            duration: line.duration, 
            repeat: Infinity, 
            ease: "linear", 
            delay: line.delay 
          }}
        />
      ))}
      
      {/* Points de connexion et nœuds */}
      {connectionPoints.map((point, i) => (
        <g key={`conn-${i}`}>
          {/* Point central */}
          <motion.circle
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="2.5"
            fill={i % 2 === 0 ? "#33b060" : "#0039A9"}
            animate={{ 
              r: [2, 3, 2],
              opacity: [0.6, 0.9, 0.6],
              fill: i === 2 ? ["#33b060", "#0039A9", "#33b060"] : undefined
            }}
            transition={{ 
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Halo externe */}
          <motion.circle
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="5"
            fill="none"
            stroke={i % 2 === 0 ? "#33b060" : "#0039A9"}
            strokeWidth="0.7"
            animate={{ 
              r: [5, 10, 5],
              opacity: [0.3, 0.5, 0.3],
              strokeWidth: [0.7, 0.3, 0.7]
            }}
            transition={{ 
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </g>
      ))}
      
      {/* Particules mobiles avec traînées */}
      {particles.map((particle, i) => (
        <g key={`particle-${i}`}>
          {/* Traînée lumineuse */}
          <motion.line
            x1={`${particle.x - 2}%`}
            y1={`${particle.y - 2}%`}
            x2={`${particle.x + 2}%`}
            y2={`${particle.y + 2}%`}
            stroke={particle.color}
            strokeWidth="0.8"
            strokeLinecap="round"
            animate={{ 
              opacity: [0, 0.7, 0],
              x1: [`${particle.x - 2}%`, `${particle.x - 4}%`, `${particle.x - 2}%`],
              y1: [`${particle.y - 2}%`, `${particle.y - 4}%`, `${particle.y - 2}%`],
              x2: [`${particle.x + 2}%`, `${particle.x}%`, `${particle.x + 2}%`],
              y2: [`${particle.y + 2}%`, `${particle.y}%`, `${particle.y + 2}%`]
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: particle.delay 
            }}
          />
          
          {/* Particule principale */}
          <motion.circle
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size}
            fill={particle.color}
            animate={{ 
              r: [particle.size, particle.size * 1.5, particle.size],
              opacity: [0.4, 0.9, 0.4],
              cx: [`${particle.x}%`, `${particle.x + (Math.random() * 10 - 5)}%`, `${particle.x}%`],
              cy: [`${particle.y}%`, `${particle.y + (Math.random() * 10 - 5)}%`, `${particle.y}%`]
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: particle.delay 
            }}
          />
        </g>
      ))}

      {/* Flash occasionnel d'électricité */}
      <motion.path
        d="M30,50 L45,45 L35,55 L50,50 L40,65 L60,55 L50,70"
        fill="none"
        stroke="url(#electric-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ 
          pathLength: [0, 1, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          repeatDelay: 5,
          ease: "easeInOut" 
        }}
      />
      
      {/* Dégradé pour éclair */}
      <defs>
        <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#33b060" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#0039A9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Composant de barre de chargement professional et élégant pour style français
function LoadingBar() {
  return (
    <div 
      className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
    >
      {/* Ligne de séparateur subtile */}
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i}
            className="h-full w-px bg-slate-200"
            style={{ marginLeft: `${i * 20}%` }}
          />
        ))}
      </div>
      
      {/* Gradient de fond subtil à la française */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50" style={{ opacity: 0.6 }} />
      
      {/* Barrière de progression élégante */}
      <div className="absolute inset-0 flex">
        {/* Progression primaire (bleu Enedis) avec style premium */}
        <motion.div 
          className="absolute h-full origin-left"
          style={{
            background: 'linear-gradient(to right, #0039A9, #1C50C8, #0039A9)',
            boxShadow: '0 0 10px rgba(0, 57, 169, 0.4)'
          }}
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: [0, 0.4, 0.55, 0.68, 0.83, 0.9],
          }}
          transition={{ 
            duration: 7.5,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            ease: [0.22, 0.61, 0.36, 1] // Courbe d'ease professionnelle
          }}
        />
      </div>
      
      {/* Brillance élégante pour effet cristal */}
      <motion.div 
        className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/80 to-transparent"
        style={{ filter: 'blur(0.5px)' }}
        animate={{ 
          left: ["-5%", "105%"],
        }}
        transition={{ 
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1.2
        }}
      />
      
      {/* Seconde brillance discrète */}
      <motion.div 
        className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ 
          left: ["-5%", "105%"],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
          repeatDelay: 2.5
        }}
      />
      
      {/* Indicateurs d'étapes avec style français */}
      <div className="absolute inset-y-0 inset-x-1 flex justify-between">
        {[0, 1, 2, 3, 4].map((i) => {
          // Convertir l'index en position en pourcentage
          const position = i * 25; // 0%, 25%, 50%, 75%, 100% 
          const isActive = 90 >= position; // Si la barre a dépassé ce point
          
          return (
            <div key={i} className="relative h-full flex items-center justify-center">
              {/* Point de repère élégant */}
              <motion.div 
                className={`h-3.5 w-3.5 rounded-full absolute top-1/2 -mt-[7px] z-10 flex items-center justify-center`}
                style={{
                  backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  border: isActive ? '1px solid #0039A9' : '1px solid rgba(0,57,169,0.3)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,57,169,0.3)' : 'none'
                }}
                animate={{
                  scale: isActive ? [0.95, 1.05, 0.95] : 1,
                  opacity: isActive ? 1 : 0.6
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Point central du repère */}
                <motion.div 
                  className={`h-1.5 w-1.5 rounded-full`}
                  style={{
                    backgroundColor: isActive ? '#0039A9' : 'rgba(0,57,169,0.4)'
                  }}
                  animate={{
                    scale: isActive ? [0.8, 1.2, 0.8] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* Libellé discret - seulement pour les points actifs */}
              {isActive && (
                <motion.div 
                  className="absolute -bottom-5 text-[0.65rem] text-[#0039A9] whitespace-nowrap font-medium"
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: i === 0 ? 0.7 : i <= 2 ? 0.9 : 0.7, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.01em'
                  }}
                >
                  {i === 0 ? 'Connexion' : 
                   i === 1 ? 'Vérification' : 
                   i === 2 ? 'Sécurisation' : 
                   i === 3 ? 'Finalisation' : 'Prêt'}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Composant texte de chargement avec animation élégante
function LoadingText() {
  const [textIndex, setTextIndex] = useState(0);
  
  // Textes raffinés avec style français professionnel
  const loadingTexts = [
    "Connexion au réseau Enedis...",
    "Vérification de votre compte...",
    "Établissement connexion sécurisée...",
    "Initialisation de votre espace...",
    "Accès à votre tableau de bord...",
  ];
  
  useEffect(() => {
    // Animation de séquence des textes avec timing élégant
    const intervalId = setInterval(() => {
      setTextIndex((prev: number) => (prev + 1) % loadingTexts.length);
    }, 3200); // Légèrement plus long pour une lecture confortable
    
    return () => clearInterval(intervalId);
  }, [loadingTexts.length]);
  
  return (
    <div className="h-6 flex justify-center overflow-hidden relative">
      {/* Effet de fondu pour la transition entre les textes */}
      <motion.div 
        className="absolute inset-x-0 h-full z-0 pointer-events-none bg-gradient-to-r from-white/0 via-transparent to-white/0"
        animate={{ 
          opacity: [0, 0.5, 0],
          x: ['-10%', '120%'] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatDelay: 2.5 
        }}
      />
      
      <AnimatePresence mode="popLayout">
        <motion.div
          key={textIndex}
          className="absolute" // Position absolue pour éviter les sauts
          initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(2px)' }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1] // Courbe d'animation française élégante
          }}
          style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 450, // Font weight un peu plus fine pour l'élégance française
            letterSpacing: '0.01em'
          }}
        >
          <TextWithDots text={loadingTexts[textIndex]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Composant pour l'animation des points de suspension - style raffiné français
function TextWithDots({ text }: { text: string }) {
  return (
    <div 
      className="inline-flex items-center text-[#0039A9]/80"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        fontWeight: 450, 
        letterSpacing: '0.01em' 
      }}
    >
      <span>{text.replace(/\.\.\.$/, '')}</span>
      <span className="inline-flex w-16 relative overflow-hidden justify-start">
        {/* Trait élégant qui glisse sous les points */}
        <motion.div
          className="absolute top-[55%] h-[1px] bg-gradient-to-r from-[#0039A9]/0 via-[#33b060]/40 to-[#0039A9]/0"
          style={{ width: '100%' }}
          animate={{ 
            left: ['-100%', '100%'],
            opacity: [0, 0.7, 0]
          }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity, 
            repeatDelay: 2,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }}
        />
        
        {/* Point lumineux qui parcourt l'animation */}
        <motion.span 
          className="absolute top-0 opacity-90 z-10 blur-[0.5px]"
          animate={{ 
            left: ['-5%', '110%'],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: [0.22, 0.61, 0.36, 1] // Bézier pour mouvement organique
          }}
        >
          <span className="flex h-1 w-1 rounded-full bg-[#33b060]" 
            style={{ boxShadow: '0 0 3px #33b060' }}
          />
        </motion.span>
        
        {/* Points de suspension avec style élégant français */}
        <div className="flex items-center justify-start">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={`dot-${i}`}
              animate={{ 
                opacity: [0.4, 1, 0.4], 
                y: [0, -1, 0],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.25, 
                ease: "easeInOut" 
              }}
              className="mx-0.5 text-[#0039A9]"
              style={{ 
                display: 'inline-block',
                lineHeight: 1,
                fontSize: '1.1em',
                fontWeight: 'bold'
              }}
            >
              .
            </motion.span>
          ))}
        </div>
      </span>
    </div>
  );
}