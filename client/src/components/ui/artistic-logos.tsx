import React from 'react';
import { cn } from '@/lib/utils';

interface ArtisticLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'colorful' | 'minimal' | 'vibrant';
  animate?: boolean;
}

const sizesMap = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-80 h-80',
  header: 'w-56 h-14',
};

/**
 * Design artistique 1: Logo avec effet 3D et perspective
 */
export function PerspectiveLogo({ className, size = 'md', variant = 'colorful', animate = false }: ArtisticLogoProps) {
  // Palette de couleurs selon le variant
  const baseColors = {
    light: {
      primary: '#0046AD',
      secondary: '#4285F4',
      accent1: '#17ABEB',
      accent2: '#4ED8DA',
      text: '#333333',
      background: '#FFFFFF',
      shadow: 'rgba(0,0,0,0.2)',
      highlight: '#FFD54F',
      dark: '#01397B',
    },
    dark: {
      primary: '#0D47A1',
      secondary: '#2962FF',
      accent1: '#00B0FF',
      accent2: '#18FFFF',
      text: '#FFFFFF',
      background: '#162447',
      shadow: 'rgba(0,0,0,0.5)',
      highlight: '#FFD700',
      dark: '#052456',
    },
    colorful: {
      primary: '#1E88E5',
      secondary: '#5E35B1',
      accent1: '#00ACC1',
      accent2: '#7CB342',
      text: '#212121',
      background: '#FFFFFF',
      shadow: 'rgba(0,0,0,0.2)',
      highlight: '#FFC107',
      dark: '#0D47A1',
    },
    minimal: {
      primary: '#546E7A',
      secondary: '#78909C',
      accent1: '#90A4AE',
      accent2: '#B0BEC5',
      text: '#263238',
      background: '#ECEFF1',
      shadow: 'rgba(0,0,0,0.1)',
      highlight: '#CFD8DC',
      dark: '#37474F',
    },
    vibrant: {
      primary: '#1A237E',
      secondary: '#D50000',
      accent1: '#2962FF',
      accent2: '#00BFA5',
      text: '#212121',
      background: '#FFFFFF',
      shadow: 'rgba(0,0,0,0.3)',
      highlight: '#FFAB00',
      dark: '#0D1259',
    }
  };

  const colors = baseColors[variant] || baseColors.colorful;

  return (
    <div className={cn("inline-flex items-center justify-center", sizesMap[size], className)}>
      <svg width="100%" height="100%" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Raccordement Enedis - Logo Perspective</title>
        <defs>
          {/* Dégradés */}
          <linearGradient id="perspective-wall-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.dark} />
          </linearGradient>
          <linearGradient id="perspective-roof-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.accent1} />
          </linearGradient>
          <linearGradient id="perspective-ground-gradient" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor={colors.accent2} />
            <stop offset="100%" stopColor={colors.dark} />
          </linearGradient>
          
          {/* Filtres */}
          <filter id="perspective-shadow" x="-10%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor={colors.shadow} floodOpacity="0.5"/>
          </filter>
          <filter id="perspective-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Fond */}
        <rect width="240" height="120" rx="10" fill={colors.background} opacity="0.95" />
        
        {/* Horizon/Sol */}
        <path d="M0 80 L240 75 L240 120 L0 120 Z" fill="url(#perspective-ground-gradient)" opacity="0.7" />
        
        {/* Maison en perspective avec effet 3D */}
        <g filter="url(#perspective-shadow)" className={animate ? "animate-pulse" : ""}>
          {/* Mur avant */}
          <path d="M50 40 L110 35 L110 85 L50 90 Z" fill="url(#perspective-wall-gradient)" />
          
          {/* Mur latéral */}
          <path d="M110 35 L150 40 L150 80 L110 85 Z" fill={colors.primary} opacity="0.8" />
          
          {/* Toit principal */}
          <path d="M40 40 L80 15 L130 25 L110 35 L50 40 Z" fill="url(#perspective-roof-gradient)" />
          
          {/* Toit latéral */}
          <path d="M130 25 L165 30 L150 40 L110 35 Z" fill={colors.secondary} opacity="0.9" />
          
          {/* Fenêtre */}
          <rect x="65" y="50" width="25" height="20" fill="#B3E5FC" stroke={colors.dark} strokeWidth="1" />
          <line x1="77.5" y1="50" x2="77.5" y2="70" stroke={colors.dark} strokeWidth="1" />
          <line x1="65" y1="60" x2="90" y2="60" stroke={colors.dark} strokeWidth="1" />
          
          {/* Porte */}
          <path d="M120 55 L135 57 L135 80 L120 82 Z" fill={colors.accent2} stroke={colors.dark} strokeWidth="1" />
          <circle cx="124" cy="70" r="1.5" fill={colors.highlight} />
        </g>
        
        {/* Élément de connexion électrique - câbles en 3D */}
        <g className={animate ? "animate-[flow_3s_linear_infinite]" : ""}>
          <path d="M150 60 C170 55, 180 70, 200 65" stroke={colors.accent1} strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M150 70 C175 65, 185 80, 200 75" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round" fill="none" />
          
          {/* Points de connexion */}
          <circle cx="150" cy="60" r="4" fill={colors.highlight} />
          <circle cx="150" cy="70" r="4" fill={colors.highlight} />
          <circle cx="200" cy="65" r="4" fill={colors.highlight} />
          <circle cx="200" cy="75" r="4" fill={colors.highlight} />
        </g>
        
        {/* Texte */}
        <g>
          <text x="45" y="110" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={colors.text}>
            Raccordement Enedis
          </text>
          {animate && 
            <text x="180" y="40" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill={colors.highlight}>
              Votre partenaire
            </text>
          }
        </g>
      </svg>
    </div>
  );
}

/**
 * Design artistique 2: Logo abstrait avec formes géométriques
 */
export function AbstractLogo({ className, size = 'md', variant = 'vibrant', animate = false }: ArtisticLogoProps) {
  // Palette de couleurs selon le variant
  const baseColors = {
    light: {
      primary: '#0046AD',
      secondary: '#FFC107',
      accent1: '#4CAF50',
      accent2: '#03A9F4',
      text: '#333333',
      background: '#FFFFFF',
      highlight: '#FFEB3B',
    },
    dark: {
      primary: '#1A237E',
      secondary: '#FF6F00',
      accent1: '#388E3C',
      accent2: '#0288D1',
      text: '#FFFFFF',
      background: '#121212',
      highlight: '#FFFF00',
    },
    colorful: {
      primary: '#673AB7',
      secondary: '#FF5722',
      accent1: '#8BC34A',
      accent2: '#2196F3',
      text: '#212121',
      background: '#FAFAFA',
      highlight: '#FFC107',
    },
    minimal: {
      primary: '#607D8B',
      secondary: '#9E9E9E',
      accent1: '#90A4AE',
      accent2: '#78909C',
      text: '#37474F',
      background: '#ECEFF1',
      highlight: '#B0BEC5',
    },
    vibrant: {
      primary: '#3F51B5',
      secondary: '#FF5252',
      accent1: '#00E676',
      accent2: '#00B0FF',
      text: '#212121',
      background: '#FAFAFA',
      highlight: '#FFFF00',
    }
  };

  const colors = baseColors[variant] || baseColors.vibrant;

  return (
    <div className={cn("inline-flex items-center justify-center", sizesMap[size], className)}>
      <svg width="100%" height="100%" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Raccordement Enedis - Logo Abstrait</title>
        <defs>
          {/* Dégradés */}
          <linearGradient id="abstract-primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.accent2} />
          </linearGradient>
          <linearGradient id="abstract-secondary-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.accent1} />
          </linearGradient>
          
          {/* Filtres */}
          <filter id="abstract-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Fond */}
        <rect width="240" height="120" rx="10" fill={colors.background} />
        
        {/* Formes géométriques abstraites */}
        <g filter="url(#abstract-glow)">
          {/* Forme de maison abstraite */}
          <path 
            d="M40 35 L70 20 L100 35 L100 75 L40 75 Z" 
            fill="url(#abstract-primary-gradient)" 
            className={animate ? "animate-pulse" : ""}
          />
          
          {/* Circuit électrique abstrait */}
          <circle cx="115" cy="55" r="8" fill={colors.accent2} />
          <path 
            d="M125 55 L150 55 L150 35 L180 35 L180 55 L210 55" 
            stroke={colors.secondary} 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            strokeDasharray={animate ? "1, 8" : "0"}
            className={animate ? "animate-[dash_10s_linear_infinite]" : ""}
          />
          <circle cx="210" cy="55" r="8" fill={colors.secondary} />
          
          {/* Points de connexion */}
          <circle cx="150" cy="35" r="6" fill={colors.accent1} />
          <circle cx="180" cy="35" r="6" fill={colors.accent1} />
          <circle cx="150" cy="55" r="6" fill={colors.accent1} />
          <circle cx="180" cy="55" r="6" fill={colors.accent1} />
        </g>
        
        {/* Symbole électrique stylisé */}
        <path 
          d="M70 45 L65 60 L75 60 L70 75" 
          stroke={colors.highlight} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={animate ? "animate-pulse" : ""}
        />
        
        {/* Texte stylisé */}
        <text 
          x="120" 
          y="100" 
          textAnchor="middle" 
          fontFamily="Arial, sans-serif" 
          fontSize="18" 
          fontWeight="bold" 
          fill={colors.text}>
          Raccordement Enedis
        </text>
      </svg>
    </div>
  );
}

/**
 * Design artistique 3: Logo avec effet d'énergie dynamique
 */
export function EnergyLogo({ className, size = 'md', variant = 'vibrant', animate = false }: ArtisticLogoProps) {
  // Palette de couleurs selon le variant
  const baseColors = {
    light: {
      primary: '#1565C0',
      secondary: '#FFA000',
      energy: '#4FC3F7',
      accent: '#4CAF50',
      text: '#333333',
      background: '#FFFFFF',
      highlight: '#FFECB3',
    },
    dark: {
      primary: '#0D47A1',
      secondary: '#FF8F00',
      energy: '#0288D1',
      accent: '#388E3C',
      text: '#FFFFFF',
      background: '#263238',
      highlight: '#FFE082',
    },
    colorful: {
      primary: '#1A237E',
      secondary: '#FF3D00',
      energy: '#18FFFF',
      accent: '#76FF03',
      text: '#212121',
      background: '#E8EAF6',
      highlight: '#FFAB40',
    },
    minimal: {
      primary: '#455A64',
      secondary: '#78909C',
      energy: '#90A4AE',
      accent: '#B0BEC5',
      text: '#37474F',
      background: '#ECEFF1',
      highlight: '#CFD8DC',
    },
    vibrant: {
      primary: '#304FFE',
      secondary: '#FF6D00',
      energy: '#00E5FF',
      accent: '#AEEA00',
      text: '#212121',
      background: '#FFFFFF',
      highlight: '#FFAB00',
    }
  };

  const colors = baseColors[variant] || baseColors.vibrant;

  return (
    <div className={cn("inline-flex items-center justify-center", sizesMap[size], className)}>
      <svg width="100%" height="100%" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Raccordement Enedis - Logo Énergétique</title>
        <defs>
          {/* Dégradés d'énergie */}
          <radialGradient id="energy-glow" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={colors.energy} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.energy} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="energy-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.energy} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          
          {/* Filtres */}
          <filter id="energy-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="energy-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#00000066"/>
          </filter>
        </defs>
        
        {/* Fond */}
        <rect width="240" height="120" rx="10" fill={colors.background} />
        
        {/* Effet de halo d'énergie */}
        {animate && (
          <circle 
            cx="120" 
            cy="60" 
            r="50" 
            fill="url(#energy-glow)" 
            opacity="0.6"
            className="animate-pulse"
          />
        )}
        
        {/* Maison stylisée */}
        <g filter="url(#energy-shadow)">
          {/* Corps de la maison */}
          <rect x="50" y="45" width="50" height="40" fill={colors.primary} rx="2" />
          
          {/* Toit */}
          <path d="M45 45 L75 25 L105 45" stroke={colors.secondary} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Fenêtre */}
          <rect x="60" y="55" width="15" height="15" fill={colors.highlight} rx="2" />
          <line x1="67.5" y1="55" x2="67.5" y2="70" stroke={colors.primary} strokeWidth="1" />
          <line x1="60" y1="62.5" x2="75" y2="62.5" stroke={colors.primary} strokeWidth="1" />
          
          {/* Porte */}
          <rect x="85" y="65" width="10" height="20" fill={colors.secondary} rx="1" />
          <circle cx="88" cy="75" r="1" fill={colors.highlight} />
        </g>
        
        {/* Flux d'énergie */}
        <g className={animate ? "animate-[flow_4s_ease-in-out_infinite]" : ""}>
          <path 
            d="M105 60 C130 40, 160 80, 185 60" 
            stroke="url(#energy-flow)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeDasharray={animate ? "1, 10" : "0"}
            filter="url(#energy-blur)"
          />
          
          {/* Points d'énergie/connexion */}
          {[1, 2, 3, 4, 5].map((i) => (
            <circle 
              key={i} 
              cx={105 + (i * 20)} 
              cy={60 + (i % 2 === 0 ? -10 : 10) * Math.sin(i/2)} 
              r={animate ? 3 + Math.sin(i) * 2 : 4}
              fill={colors.energy}
              className={animate ? "animate-ping" : ""}
              style={{animationDelay: `${i * 0.2}s`, animationDuration: '1.5s'}}
            />
          ))}
        </g>
        
        {/* Éclair symbole d'énergie */}
        <path 
          d="M75 40 L65 60 L80 60 L70 80" 
          stroke={colors.accent} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={animate ? "animate-pulse" : ""}
        />
        
        {/* Texte avec effet d'énergie */}
        <g filter={animate ? "url(#energy-blur)" : ""}>
          <text 
            x="120" 
            y="100" 
            textAnchor="middle" 
            fontFamily="Arial, sans-serif" 
            fontSize="16" 
            fontWeight="bold" 
            fill={colors.text}
          >
            Raccordement Enedis
          </text>
          {animate && (
            <text 
              x="185" 
              y="45" 
              textAnchor="middle" 
              fontFamily="Arial, sans-serif" 
              fontSize="12" 
              fontWeight="500"
              fill={colors.secondary}
              opacity="0.9"
              className="animate-pulse"
            >
              Votre énergie connectée
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * Logo artistique avec effet néon
 */
export function NeonLogo({ className, size = 'md', variant = 'dark', animate = false }: ArtisticLogoProps) {
  // Palette de couleurs selon le variant
  const baseColors = {
    light: {
      primary: '#2196F3',
      secondary: '#FF9800',
      neon1: '#00E5FF',
      neon2: '#76FF03',
      text: '#333333',
      background: '#FFFFFF',
      glow1: 'rgba(0,229,255,0.5)',
      glow2: 'rgba(118,255,3,0.5)',
    },
    dark: {
      primary: '#1A237E',
      secondary: '#FF6D00',
      neon1: '#18FFFF',
      neon2: '#EEFF41',
      text: '#E0E0E0',
      background: '#121212',
      glow1: 'rgba(24,255,255,0.5)',
      glow2: 'rgba(238,255,65,0.5)',
    },
    colorful: {
      primary: '#AA00FF',
      secondary: '#FF1744',
      neon1: '#D500F9',
      neon2: '#FF9100',
      text: '#212121',
      background: '#0A0A0A',
      glow1: 'rgba(213,0,249,0.5)',
      glow2: 'rgba(255,145,0,0.5)',
    },
    minimal: {
      primary: '#424242',
      secondary: '#757575',
      neon1: '#9E9E9E',
      neon2: '#BDBDBD',
      text: '#212121',
      background: '#EEEEEE',
      glow1: 'rgba(158,158,158,0.5)',
      glow2: 'rgba(189,189,189,0.5)',
    },
    vibrant: {
      primary: '#6200EA',
      secondary: '#FF6D00',
      neon1: '#00E5FF',
      neon2: '#FFEA00',
      text: '#FFFFFF',
      background: '#000000',
      glow1: 'rgba(0,229,255,0.7)',
      glow2: 'rgba(255,234,0,0.7)',
    }
  };

  const colors = baseColors[variant] || baseColors.dark;

  return (
    <div className={cn("inline-flex items-center justify-center", sizesMap[size], className)}>
      <svg width="100%" height="100%" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Raccordement Enedis - Logo Néon</title>
        <defs>
          {/* Filtres d'effet néon */}
          <filter id="neon-blue" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={colors.neon1} floodOpacity="0.8"/>
          </filter>
          <filter id="neon-yellow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={colors.neon2} floodOpacity="0.8"/>
          </filter>
          <filter id="neon-text" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor={colors.primary} floodOpacity="0.8"/>
          </filter>
        </defs>
        
        {/* Fond */}
        <rect width="240" height="120" rx="10" fill={colors.background} />
        
        {/* Contours néon */}
        <g filter="url(#neon-blue)" className={animate ? "animate-pulse" : ""} style={{animationDuration: '3s'}}>
          {/* Silhouette de maison en néon */}
          <path 
            d="M50 75 L50 45 L75 25 L100 45 L100 75 Z" 
            stroke={colors.neon1} 
            strokeWidth="3" 
            fill="none" 
            strokeLinejoin="round"
          />
          
          {/* Porte */}
          <rect x="70" y="55" width="10" height="20" stroke={colors.neon1} strokeWidth="2" fill="none" />
          
          {/* Fenêtre */}
          <rect x="55" y="50" width="10" height="10" stroke={colors.neon1} strokeWidth="2" fill="none" />
        </g>
        
        {/* Circuit électrique en néon */}
        <g filter="url(#neon-yellow)" className={animate ? "animate-pulse" : ""} style={{animationDuration: '2.5s', animationDelay: '0.5s'}}>
          <path 
            d="M100 50 L120 50 C130 50, 130 60, 140 60 L170 60 C180 60, 180 50, 190 50 L210 50" 
            stroke={colors.neon2} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
            strokeDasharray={animate ? "1, 4" : "0"}
            className={animate ? "animate-[dash_20s_linear_infinite]" : ""}
          />
          
          {/* Points de connexion */}
          <circle cx="120" cy="50" r="3" fill={colors.neon2} />
          <circle cx="140" cy="60" r="3" fill={colors.neon2} />
          <circle cx="170" cy="60" r="3" fill={colors.neon2} />
          <circle cx="190" cy="50" r="3" fill={colors.neon2} />
          <circle cx="210" cy="50" r="3" fill={colors.neon2} />
        </g>
        
        {/* Symbole électrique */}
        <path 
          d="M75 35 L70 50 L80 50 L75 65" 
          stroke={animate ? colors.neon2 : colors.secondary} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter={animate ? "url(#neon-yellow)" : ""}
          className={animate ? "animate-pulse" : ""}
        />
        
        {/* Texte en néon */}
        <g filter="url(#neon-text)">
          <text 
            x="120" 
            y="100" 
            textAnchor="middle" 
            fontFamily="Arial, sans-serif" 
            fontSize="16" 
            fontWeight="bold" 
            fill={colors.primary}
            className={animate ? "animate-pulse" : ""}
            style={{animationDuration: '4s'}}
          >
            Raccordement Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Composant de galerie artistique
 */
export function ArtisticLogoGallery() {
  const [animate, setAnimate] = React.useState(true);
  
  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Logos Artistiques & Créatifs</h2>
        <button 
          onClick={() => setAnimate(!animate)} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {animate ? 'Désactiver les animations' : 'Activer les animations'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Logo Perspective 3D</h3>
          <PerspectiveLogo size="lg" animate={animate} />
          <p className="mt-4 text-gray-600 text-center">
            Un design moderne avec effet de profondeur et perspective, symbolisant la dimension du raccordement.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-center mb-1">Coloré</p>
              <PerspectiveLogo size="sm" variant="colorful" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Clair</p>
              <PerspectiveLogo size="sm" variant="light" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Sombre</p>
              <PerspectiveLogo size="sm" variant="dark" animate={animate} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Logo Abstrait</h3>
          <AbstractLogo size="lg" animate={animate} />
          <p className="mt-4 text-gray-600 text-center">
            Approche abstraite et géométrique évoquant la modernité et l'innovation dans le raccordement électrique.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-center mb-1">Vibrant</p>
              <AbstractLogo size="sm" variant="vibrant" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Coloré</p>
              <AbstractLogo size="sm" variant="colorful" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Minimal</p>
              <AbstractLogo size="sm" variant="minimal" animate={animate} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Logo Énergie Dynamique</h3>
          <EnergyLogo size="lg" animate={animate} />
          <p className="mt-4 text-gray-600 text-center">
            Ce design représente le flux dynamique d'énergie reliant la maison au réseau Enedis.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-center mb-1">Vivant</p>
              <EnergyLogo size="sm" variant="vibrant" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Foncé</p>
              <EnergyLogo size="sm" variant="dark" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Coloré</p>
              <EnergyLogo size="sm" variant="colorful" animate={animate} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Logo Néon</h3>
          <NeonLogo size="lg" animate={animate} />
          <p className="mt-4 text-gray-600 text-center">
            Design futuriste avec effet néon, symbolisant l'électricité et la modernité des services Enedis.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-center mb-1">Sombre</p>
              <NeonLogo size="sm" variant="dark" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Vibrant</p>
              <NeonLogo size="sm" variant="vibrant" animate={animate} />
            </div>
            <div>
              <p className="text-xs text-center mb-1">Coloré</p>
              <NeonLogo size="sm" variant="colorful" animate={animate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant d'en-tête avec logo artistique
 */
export function ArtisticHeader({ logo = 'energy', animate = true }) {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {logo === 'perspective' && <PerspectiveLogo size="header" animate={animate} />}
            {logo === 'abstract' && <AbstractLogo size="header" animate={animate} />}
            {logo === 'energy' && <EnergyLogo size="header" animate={animate} />}
            {logo === 'neon' && <NeonLogo size="header" animate={animate} variant="vibrant" />}
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Accueil</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Services</a>
            <a href="#" className="text-gray-800 hover:text-blue-600 font-medium">Contact</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Demande de raccordement
            </button>
          </nav>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

// Animation keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dash {
    to {
      stroke-dashoffset: 30;
    }
  }
  @keyframes flow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;
document.head.appendChild(styleSheet);

export default function ArtisticLogos() {
  return <ArtisticLogoGallery />;
}