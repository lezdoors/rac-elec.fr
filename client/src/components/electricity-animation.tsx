import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ELECTRICITY_ANIMATIONS, ANIMATION_PALETTES } from "@/lib/animation-config";

interface ElectricityPathProps {
  className?: string;
  pathColor?: string;
  glowColor?: string;
  pathWidth?: number;
  pathLength?: number;
  delay?: number;
}

/**
 * Ligne électrique animée avec effet de courant électrique circulant
 */
export function ElectricityPath({
  className = "",
  pathColor = "#3B82F6",
  glowColor = "#93C5FD",
  pathWidth = 2,
  pathLength = 400,
  delay = 0
}: ElectricityPathProps) {
  // Configuration de l'animation du courant électrique
  const { duration, easing, dashOffset } = ELECTRICITY_ANIMATIONS.circuitPath;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${pathLength} 10`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={pathColor} stopOpacity="0.5" />
          <stop offset="50%" stopColor={pathColor} stopOpacity="1" />
          <stop offset="100%" stopColor={pathColor} stopOpacity="0.5" />
        </linearGradient>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -5"
            result="glow"
          />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>

        <motion.path
          d={`M 0 5 H ${pathLength}`}
          stroke="url(#lineGradient)"
          strokeWidth={pathWidth}
          strokeLinecap="round"
          strokeDasharray="10 15"
          filter="url(#glow)"
          initial={{ strokeDashoffset: dashOffset.from }}
          animate={{ strokeDashoffset: dashOffset.to }}
          transition={{
            duration,
            ease: easing,
            repeat: Infinity,
            delay
          }}
        />
      </svg>
    </div>
  );
}

interface PowerTransformerProps {
  className?: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
}

/**
 * Composant de transformateur électrique avec effet de pulsation
 */
export function PowerTransformer({
  className = "",
  size = 60,
  primaryColor = "#3B82F6",
  secondaryColor = "#1E40AF",
  glowColor = "#93C5FD"
}: PowerTransformerProps) {
  // Configuration de l'animation de pulsation
  const { duration, easing, opacity, scale, repeat, repeatDelay } = ELECTRICITY_ANIMATIONS.transformerPulse;
  
  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="transformerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"
            result="glow"
          />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>

        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill={secondaryColor}
          initial={{ opacity: opacity.sequence[0], scale: scale.sequence[0] }}
          animate={{ 
            opacity: [opacity.sequence[0], opacity.sequence[1], opacity.sequence[2]],
            scale: [scale.sequence[0], scale.sequence[1], scale.sequence[2]]
          }}
          transition={{
            duration,
            ease: easing,
            repeat,
            repeatDelay
          }}
          filter="url(#transformerGlow)"
        />
        
        <circle cx="25" cy="25" r="12" fill={primaryColor} />
        
        <rect x="16" y="24" width="18" height="2" fill={glowColor} rx="1" />
        <rect x="24" y="16" width="2" height="18" fill={glowColor} rx="1" />
      </svg>
    </div>
  );
}

interface PowerNodeProps {
  className?: string;
  size?: number;
  color?: string;
  glowColor?: string;
  pulseIntensity?: "low" | "medium" | "high";
}

/**
 * Nœud de connexion électrique animé
 */
export function PowerNode({
  className = "",
  size = 16,
  color = "#3B82F6",
  glowColor = "#93C5FD",
  pulseIntensity = "medium"
}: PowerNodeProps) {
  // Configuration de l'animation en fonction de l'intensité
  const getPulseConfig = () => {
    switch (pulseIntensity) {
      case "low":
        return {
          duration: 3,
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5]
        };
      case "high":
        return {
          duration: 1.5,
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6]
        };
      case "medium":
      default:
        return {
          duration: 2,
          scale: [1, 1.25, 1],
          opacity: [0.5, 0.9, 0.5]
        };
    }
  };
  
  const { duration, scale, opacity } = getPulseConfig();
  
  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 15 -5"
            result="glow"
          />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>

        <motion.circle
          cx="8"
          cy="8"
          r="6"
          fill={glowColor}
          filter="url(#nodeGlow)"
          initial={{ opacity: opacity[0], scale: scale[0] }}
          animate={{ 
            opacity: opacity,
            scale: scale
          }}
          transition={{
            duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <circle cx="8" cy="8" r="4" fill={color} />
      </svg>
    </div>
  );
}

interface ElectricGridProps {
  className?: string;
  nodeCount?: number;
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
}

/**
 * Grille électrique interactive avec nœuds et connexions
 */
export function ElectricGrid({
  className = "",
  nodeCount = 5,
  width = 400,
  height = 200,
  primaryColor = "#3B82F6",
  secondaryColor = "#1E40AF",
  glowColor = "#93C5FD"
}: ElectricGridProps) {
  const [nodes, setNodes] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    intensity: "low" | "medium" | "high";
  }>>([]);
  
  const [connections, setConnections] = useState<Array<{
    id: number;
    from: number;
    to: number;
    width: number;
  }>>([]);
  
  // Initialiser la grille au montage
  useEffect(() => {
    // Créer les nœuds aléatoirement
    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      size: Math.floor(Math.random() * 8) + 8,
      intensity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high"
    }));
    
    // Créer les connexions entre les nœuds
    const newConnections: typeof connections = [];
    let connectionId = 0;
    
    // Connecter chaque nœud à au moins un autre
    newNodes.forEach((node, index) => {
      // Trouver le nœud le plus proche
      const connections = [];
      const connectionsCount = Math.floor(Math.random() * 2) + 1; // 1 ou 2 connexions
      
      // Shuffle des nœuds pour des connexions aléatoires
      const otherNodeIds = newNodes
        .filter(n => n.id !== node.id)
        .map(n => n.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, connectionsCount);
      
      otherNodeIds.forEach(toId => {
        newConnections.push({
          id: connectionId++,
          from: node.id,
          to: toId,
          width: Math.random() * 1.5 + 0.5
        });
      });
    });
    
    setNodes(newNodes);
    setConnections(newConnections);
  }, [nodeCount, width, height]);
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dessiner les connexions */}
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          if (!fromNode || !toNode) return null;
          
          return (
            <motion.line
              key={conn.id}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={primaryColor}
              strokeWidth={conn.width}
              strokeDasharray="3 6"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -45 }}
              transition={{
                duration: Math.random() * 4 + 3,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          );
        })}
        
        {/* Dessiner les nœuds */}
        {nodes.map(node => (
          <foreignObject
            key={node.id}
            x={node.x - node.size / 2}
            y={node.y - node.size / 2}
            width={node.size}
            height={node.size}
          >
            <PowerNode
              size={node.size}
              color={primaryColor}
              glowColor={glowColor}
              pulseIntensity={node.intensity}
            />
          </foreignObject>
        ))}
      </svg>
    </div>
  );
}

interface ElectricityHeroProps {
  className?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCtaClick: () => void;
}

/**
 * Bannière héroïque avec animations électriques pour la page d'accueil
 */
export function ElectricityHero({
  className = "",
  title,
  subtitle,
  ctaLabel,
  onCtaClick
}: ElectricityHeroProps) {
  const { container, title: titleConfig, subtitle: subtitleConfig, cta } = 
    ANIMATION_PALETTES.homepage.heroSection;
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-900 to-gray-900 text-white rounded-xl ${className}`}>
      {/* Fond animé */}
      <div className="absolute inset-0 opacity-20">
        <ElectricGrid 
          width={1000} 
          height={600} 
          nodeCount={15}
          primaryColor="#60A5FA"
          glowColor="#93C5FD"
        />
      </div>
      
      {/* Effet de courant électrique en haut */}
      <div className="absolute top-0 left-0 right-0 h-2">
        <ElectricityPath 
          pathColor="#60A5FA"
          glowColor="#93C5FD"
          pathLength={1000}
          pathWidth={2}
        />
      </div>
      
      {/* Effet de courant électrique en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-2">
        <ElectricityPath 
          pathColor="#60A5FA"
          glowColor="#93C5FD"
          pathLength={1000}
          pathWidth={2}
          delay={0.5}
        />
      </div>
      
      {/* Contenu principal */}
      <motion.div 
        className="relative z-10 p-10 md:p-16 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: container.duration,
          ease: container.easing,
        }}
      >
        {/* Icône/logo animé */}
        <div className="mb-6 flex justify-center">
          <PowerTransformer 
            size={80}
            primaryColor="#60A5FA"
            secondaryColor="#1E40AF"
            glowColor="#93C5FD"
          />
        </div>
        
        {/* Titre avec animation */}
        <motion.h1 
          className="text-3xl md:text-5xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: titleConfig.duration,
            ease: titleConfig.easing,
            delay: titleConfig.delay,
          }}
        >
          {title}
        </motion.h1>
        
        {/* Sous-titre avec animation */}
        <motion.p 
          className="text-xl md:text-2xl mb-10 text-blue-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: subtitleConfig.duration,
            ease: subtitleConfig.easing,
            delay: subtitleConfig.delay,
          }}
        >
          {subtitle}
        </motion.p>
        
        {/* Bouton CTA avec animation */}
        <motion.button
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-colors"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: cta.duration,
            ease: cta.easing,
            delay: cta.delay,
          }}
          onClick={onCtaClick}
        >
          {ctaLabel}
        </motion.button>
      </motion.div>
    </div>
  );
}