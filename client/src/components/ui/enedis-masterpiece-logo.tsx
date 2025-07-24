import React from 'react';
import { cn } from '@/lib/utils';

interface EnedisMasterpieceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
}

const sizesMap = {
  sm: 'w-40 h-12',
  md: 'w-56 h-16', 
  lg: 'w-72 h-20',
  xl: 'w-96 h-24',
  header: 'w-80 h-18',
};

/**
 * Masterpiece A: Luminous Bulb Edition - Mozart meets DaVinci
 */
export function EnedisMasterpieceA({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#FCD34D',
      bulbGlow: '#FEF3C7',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#FCD34D',
      bulbGlow: '#FEF3C7',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#FCD34D',
      bulbGlow: '#FEF3C7',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-4", sizesMap[size], className)}>
      <svg viewBox="0 0 320 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Raccordement Enedis</title>
        
        <defs>
          {/* Filtres 3D pour effets professionnels */}
          <filter id="masterpiece3D" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor={color.shadow} floodOpacity="0.3"/>
            <feSpecularLighting result="specOut" specularExponent="25" lightingColor="white">
              <fePointLight x="20" y="10" z="25"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          {/* Filtre pour l'ampoule lumineuse */}
          <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="50%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor={color.bulb} />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        
        {/* Icône maison officielle Enedis avec finition premium */}
        <g transform="translate(8, 16)">
          {/* Corps de la maison avec effet 3D */}
          <path 
            d="M4 20 L16 8 L28 20 L28 32 L4 32 Z" 
            fill="url(#houseGradient)" 
            stroke={color.houseStroke} 
            strokeWidth="2.5"
            filter="url(#masterpiece3D)"
          />
          
          {/* Toit avec perspective */}
          <path 
            d="M2 20 L16 6 L30 20" 
            stroke={color.houseStroke} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#masterpiece3D)"
          />
          
          {/* Porte élégante */}
          <rect 
            x="12" 
            y="24" 
            width="8" 
            height="8" 
            fill={color.houseStroke} 
            rx="1"
            filter="url(#masterpiece3D)"
          />
          
          {/* Poignée de porte */}
          <circle cx="18" cy="28" r="1" fill="white" opacity="0.9"/>
          
          {/* Reflets artistiques sur la maison */}
          <line x1="8" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" opacity="0.7"/>
          <line x1="20" y1="12" x2="24" y2="16" stroke="white" strokeWidth="2" opacity="0.7"/>
          <circle cx="16" cy="8" r="1" fill="white" opacity="0.8"/>
        </g>
        
        {/* Ampoule lumineuse magique */}
        <g transform="translate(42, 18)">
          {/* Halo lumineux autour de l'ampoule */}
          <circle 
            cx="0" 
            cy="8" 
            r="8" 
            fill={color.bulbGlow} 
            opacity="0.3"
            filter="url(#bulbGlow)"
          />
          
          {/* Corps de l'ampoule */}
          <circle 
            cx="0" 
            cy="6" 
            r="4" 
            fill="url(#bulbGradient)" 
            filter="url(#masterpiece3D)"
          />
          
          {/* Culot de l'ampoule */}
          <rect 
            x="-2" 
            y="10" 
            width="4" 
            height="3" 
            fill="#9CA3AF" 
            rx="0.5"
          />
          
          {/* Filament artistique */}
          <path 
            d="M-2 4 Q0 6 2 4 Q0 8 -2 6" 
            stroke="#F59E0B" 
            strokeWidth="0.8" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Rayons de lumière */}
          <g opacity="0.6">
            <line x1="-8" y1="6" x2="-6" y2="6" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="8" y2="6" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="-2" x2="0" y2="0" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="12" x2="0" y2="14" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-6" y1="0" x2="-4" y2="2" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="2" x2="6" y2="0" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-6" y1="12" x2="-4" y2="10" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="10" x2="6" y2="12" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        </g>
        
        {/* Texte à 3 lignes exactement comme l'officiel */}
        <g transform="translate(68, 24)" filter="url(#masterpiece3D)">
          {/* Ligne 1: "Votre partenaire" en gras */}
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="16" 
            fontWeight="bold" 
            fill={color.textBold}
            letterSpacing="0.3px"
          >
            Votre partenaire
          </text>
          
          {/* Ligne 2: "Raccordement au réseau" */}
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="12" 
            fontWeight="normal" 
            fill={color.text}
            y="16"
            letterSpacing="0.2px"
          >
            Raccordement au réseau
          </text>
          
          {/* Ligne 3: "d'électricité d'Enedis" */}
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="12" 
            fontWeight="normal" 
            fill={color.text}
            y="28"
            letterSpacing="0.2px"
          >
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Masterpiece B: Golden Cable Edition - Pure artistic brilliance
 */
export function EnedisMasterpieceB({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      cable: '#F59E0B',
      cableGlow: '#FEF3C7',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      cable: '#F59E0B',
      cableGlow: '#FEF3C7',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      cable: '#F59E0B',
      cableGlow: '#FEF3C7',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-4", sizesMap[size], className)}>
      <svg viewBox="0 0 320 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Raccordement électrique</title>
        
        <defs>
          <filter id="masterpiece3DB" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor={color.shadow} floodOpacity="0.3"/>
            <feSpecularLighting result="specOut" specularExponent="25" lightingColor="white">
              <fePointLight x="20" y="10" z="25"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          <filter id="cableGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id="houseGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="50%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor={color.cable} />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        
        {/* Maison Enedis artistique */}
        <g transform="translate(8, 16)">
          <path 
            d="M4 20 L16 8 L28 20 L28 32 L4 32 Z" 
            fill="url(#houseGradientB)" 
            stroke={color.houseStroke} 
            strokeWidth="2.5"
            filter="url(#masterpiece3DB)"
          />
          
          <path 
            d="M2 20 L16 6 L30 20" 
            stroke={color.houseStroke} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#masterpiece3DB)"
          />
          
          <rect x="12" y="24" width="8" height="8" fill={color.houseStroke} rx="1" filter="url(#masterpiece3DB)"/>
          <circle cx="18" cy="28" r="1" fill="white" opacity="0.9"/>
          
          {/* Reflets artistiques */}
          <line x1="8" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" opacity="0.7"/>
          <line x1="20" y1="12" x2="24" y2="16" stroke="white" strokeWidth="2" opacity="0.7"/>
        </g>
        
        {/* Câble électrique doré artistique */}
        <g transform="translate(38, 24)">
          {/* Halo autour du câble */}
          <path 
            d="M0 0 Q8 -4 16 0 Q24 4 32 0" 
            stroke={color.cableGlow} 
            strokeWidth="6" 
            fill="none"
            opacity="0.4"
            filter="url(#cableGlow)"
          />
          
          {/* Câble principal avec gradient */}
          <path 
            d="M0 0 Q8 -4 16 0 Q24 4 32 0" 
            stroke="url(#cableGradient)" 
            strokeWidth="3" 
            fill="none"
            filter="url(#masterpiece3DB)"
            strokeLinecap="round"
          />
          
          {/* Connecteur de début */}
          <circle cx="0" cy="0" r="2.5" fill={color.cable} filter="url(#masterpiece3DB)"/>
          <circle cx="0" cy="0" r="1.5" fill={color.cableGlow}/>
          
          {/* Connecteur de fin */}
          <circle cx="32" cy="0" r="2.5" fill={color.cable} filter="url(#masterpiece3DB)"/>
          <circle cx="32" cy="0" r="1.5" fill={color.cableGlow}/>
          
          {/* Étincelles d'énergie */}
          <g opacity="0.8">
            <circle cx="8" cy="-4" r="0.8" fill={color.cable}/>
            <circle cx="16" cy="0" r="1" fill={color.cable}/>
            <circle cx="24" cy="4" r="0.8" fill={color.cable}/>
          </g>
        </g>
        
        {/* Texte officiel à 3 lignes */}
        <g transform="translate(68, 24)" filter="url(#masterpiece3DB)">
          <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.textBold} letterSpacing="0.3px">
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="16" letterSpacing="0.2px">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="28" letterSpacing="0.2px">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Masterpiece C: Mobile-Optimized Compact Version
 */
export function EnedisMasterpieceC({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const sizesMapMobile = {
    sm: 'w-32 h-10',
    md: 'w-44 h-12', 
    lg: 'w-56 h-14',
    xl: 'w-68 h-16',
    header: 'w-60 h-14',
  };

  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      accent: '#FCD34D',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      accent: '#FCD34D',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      accent: '#FCD34D',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMapMobile[size], className)}>
      <svg viewBox="0 0 240 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Version mobile</title>
        
        <defs>
          <filter id="mobile3D" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor={color.shadow} floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Maison compacte pour mobile */}
        <g transform="translate(6, 14)">
          <path d="M3 16 L12 7 L21 16 L21 26 L3 26 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="2" filter="url(#mobile3D)"/>
          <path d="M1 16 L12 5 L23 16" stroke={color.houseStroke} strokeWidth="2" strokeLinecap="round" fill="none"/>
          <rect x="9" y="20" width="6" height="6" fill={color.houseStroke} rx="0.5"/>
          
          {/* Mini ampoule pour mobile */}
          <circle cx="18" cy="12" r="2" fill={color.accent} opacity="0.8"/>
          <circle cx="18" cy="12" r="1" fill="#FEF3C7"/>
        </g>
        
        {/* Texte compact pour mobile */}
        <g transform="translate(36, 20)" filter="url(#mobile3D)">
          <text fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill={color.textBold}>
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="8" fill={color.text} y="12">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="8" fill={color.text} y="22">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Masterpiece D: Enhanced Luminous Edition - Monet's refined vision
 */
export function EnedisMasterpieceD({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      enedisGreen: '#5BC248',
      accent: '#10B981',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      enedisGreen: '#5BC248',
      accent: '#10B981',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      enedisGreen: '#5BC248',
      accent: '#10B981',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-4", sizesMap[size], className)}>
      <svg viewBox="0 0 320 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Raccordement Enedis Enhanced</title>
        
        <defs>
          <filter id="enhancedGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <radialGradient id="enhancedBulb" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="40%" stopColor={color.bulb} />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>
        </defs>
        
        {/* Maison premium */}
        <g transform="translate(8, 16)">
          <path 
            d="M4 20 L16 8 L28 20 L28 32 L4 32 Z" 
            fill={color.houseFill} 
            stroke={color.houseStroke} 
            strokeWidth="2.8"
            filter="url(#enhancedGlow)"
          />
          <path 
            d="M2 20 L16 6 L30 20" 
            stroke={color.houseStroke} 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#enhancedGlow)"
          />
          <rect x="12" y="24" width="8" height="8" fill={color.houseStroke} rx="1"/>
          <circle cx="18" cy="28" r="1.2" fill="white"/>
          
          {/* Reflets artistiques améliorés */}
          <line x1="8" y1="16" x2="13" y2="11" stroke="white" strokeWidth="2.5" opacity="0.8"/>
          <line x1="19" y1="11" x2="24" y2="16" stroke="white" strokeWidth="2.5" opacity="0.8"/>
          <circle cx="16" cy="8" r="1.5" fill="white" opacity="0.9"/>
        </g>
        
        {/* Ampoule lumineuse améliorée */}
        <g transform="translate(42, 18)">
          {/* Grand halo lumineux */}
          <circle cx="0" cy="8" r="12" fill={color.bulbGlow} opacity="0.2" filter="url(#enhancedGlow)"/>
          <circle cx="0" cy="8" r="8" fill={color.bulbGlow} opacity="0.4" filter="url(#enhancedGlow)"/>
          
          {/* Corps de l'ampoule avec gradient radial */}
          <circle cx="0" cy="6" r="4.5" fill="url(#enhancedBulb)" filter="url(#enhancedGlow)"/>
          
          {/* Culot métallique */}
          <rect x="-2.5" y="10" width="5" height="4" fill="#6B7280" rx="0.5"/>
          <rect x="-2" y="10.5" width="4" height="1" fill="#9CA3AF" rx="0.2"/>
          
          {/* Filament détaillé */}
          <path d="M-2.5 4 Q0 6.5 2.5 4 Q0 8.5 -2.5 6" stroke="#F59E0B" strokeWidth="1" fill="none" opacity="0.9"/>
          <path d="M-1.5 5 Q0 7 1.5 5" stroke="#FCD34D" strokeWidth="0.8" fill="none" opacity="0.7"/>
          
          {/* Rayons de lumière étendus */}
          <g opacity="0.7">
            <line x1="-10" y1="6" x2="-7" y2="6" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="7" y1="6" x2="10" y2="6" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="-4" x2="0" y2="-1" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="13" x2="0" y2="16" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="-7" y1="-1" x2="-5" y2="1" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="1" x2="7" y2="-1" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="-7" y1="13" x2="-5" y2="11" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="11" x2="7" y2="13" stroke={color.bulb} strokeWidth="2" strokeLinecap="round"/>
          </g>
          
          {/* Étincelles d'énergie avec vert Enedis */}
          <circle cx="-6" cy="3" r="0.8" fill={color.enedisGreen} opacity="0.8"/>
          <circle cx="6" cy="9" r="0.6" fill={color.enedisGreen} opacity="0.9"/>
          <circle cx="2" cy="-2" r="0.7" fill={color.enedisGreen} opacity="0.7"/>
          
          {/* Petit accent vert sur l'ampoule */}
          <circle cx="2" cy="4" r="0.5" fill={color.enedisGreen} opacity="0.6"/>
        </g>
        
        {/* Texte premium avec ombrage */}
        <g transform="translate(68, 24)" filter="url(#enhancedGlow)">
          <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.textBold} letterSpacing="0.4px">
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="16" letterSpacing="0.3px">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="28" letterSpacing="0.3px">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Masterpiece E: Artistic Vintage Bulb - Classic refinement
 */
export function EnedisMasterpieceE({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      vintage: '#B45309',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      vintage: '#B45309',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      vintage: '#B45309',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-4", sizesMap[size], className)}>
      <svg viewBox="0 0 320 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Style vintage</title>
        
        <defs>
          <linearGradient id="vintageBulb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="30%" stopColor={color.bulb} />
            <stop offset="70%" stopColor={color.vintage} />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          
          <filter id="vintageGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor={color.shadow} floodOpacity="0.3"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Maison élégante */}
        <g transform="translate(8, 16)">
          <path d="M4 20 L16 8 L28 20 L28 32 L4 32 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="2.5" filter="url(#vintageGlow)"/>
          <path d="M2 20 L16 6 L30 20" stroke={color.houseStroke} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <rect x="12" y="24" width="8" height="8" fill={color.houseStroke} rx="1"/>
          <circle cx="18" cy="28" r="1" fill="white"/>
          
          {/* Détails artistiques */}
          <line x1="8" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" opacity="0.7"/>
          <line x1="20" y1="12" x2="24" y2="16" stroke="white" strokeWidth="2" opacity="0.7"/>
        </g>
        
        {/* Ampoule vintage Edison */}
        <g transform="translate(42, 18)">
          {/* Halo doux */}
          <circle cx="0" cy="8" r="9" fill={color.bulbGlow} opacity="0.3" filter="url(#vintageGlow)"/>
          
          {/* Forme d'ampoule vintage plus ovale */}
          <ellipse cx="0" cy="6" rx="4" ry="5" fill="url(#vintageBulb)" filter="url(#vintageGlow)"/>
          
          {/* Culot vintage détaillé */}
          <rect x="-2.5" y="11" width="5" height="3" fill="#6B7280" rx="0.3"/>
          <rect x="-2" y="11.5" width="4" height="0.5" fill="#9CA3AF"/>
          <rect x="-2" y="12.5" width="4" height="0.5" fill="#9CA3AF"/>
          
          {/* Filament Edison authentique */}
          <path d="M-2 2 Q-1 4 0 2 Q1 4 2 2" stroke="#F59E0B" strokeWidth="0.8" fill="none" opacity="0.9"/>
          <path d="M-2 6 Q-1 8 0 6 Q1 8 2 6" stroke="#F59E0B" strokeWidth="0.8" fill="none" opacity="0.9"/>
          <path d="M-2 10 Q-1 8 0 10 Q1 8 2 10" stroke="#F59E0B" strokeWidth="0.8" fill="none" opacity="0.9"/>
          
          {/* Rayons vintage subtils */}
          <g opacity="0.6">
            <line x1="-8" y1="6" x2="-6" y2="6" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="8" y2="6" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="-2" x2="0" y2="0" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="0" y1="14" x2="0" y2="16" stroke={color.bulb} strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        </g>
        
        {/* Texte raffiné */}
        <g transform="translate(68, 24)" filter="url(#vintageGlow)">
          <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.textBold} letterSpacing="0.3px">
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="16" letterSpacing="0.2px">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="28" letterSpacing="0.2px">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Masterpiece F: Modern Luminous - Contemporary brilliance
 */
export function EnedisMasterpieceF({ className, size = 'header', variant = 'light' }: EnedisMasterpieceLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#FBBF24',
      bulbGlow: '#FEF3C7',
      modern: '#06B6D4',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#FBBF24',
      bulbGlow: '#FEF3C7',
      modern: '#06B6D4',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#2563EB',
      textBold: '#1E40AF',
      bulb: '#FBBF24',
      bulbGlow: '#FEF3C7',
      modern: '#06B6D4',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-4", sizesMap[size], className)}>
      <svg viewBox="0 0 320 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Style moderne</title>
        
        <defs>
          <radialGradient id="modernBulb" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="white" />
            <stop offset="20%" stopColor={color.bulbGlow} />
            <stop offset="60%" stopColor={color.bulb} />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          
          <filter id="modernGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feDropShadow dx="2" dy="3" stdDeviation="1.5" floodColor={color.shadow} floodOpacity="0.25"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Maison moderne */}
        <g transform="translate(8, 16)">
          <path d="M4 20 L16 8 L28 20 L28 32 L4 32 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="2.5" filter="url(#modernGlow)"/>
          <path d="M2 20 L16 6 L30 20" stroke={color.houseStroke} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <rect x="12" y="24" width="8" height="8" fill={color.houseStroke} rx="1.5"/>
          <circle cx="18" cy="28" r="1" fill="white"/>
          
          {/* Accents modernes */}
          <rect x="8" y="20" width="3" height="3" fill={color.modern} opacity="0.3" rx="0.5"/>
          <rect x="21" y="20" width="3" height="3" fill={color.modern} opacity="0.3" rx="0.5"/>
        </g>
        
        {/* Ampoule LED moderne */}
        <g transform="translate(42, 18)">
          {/* Halo moderne */}
          <circle cx="0" cy="8" r="10" fill={color.bulbGlow} opacity="0.2" filter="url(#modernGlow)"/>
          <circle cx="0" cy="8" r="6" fill={color.bulbGlow} opacity="0.4"/>
          
          {/* Corps LED moderne */}
          <circle cx="0" cy="6" r="4" fill="url(#modernBulb)" filter="url(#modernGlow)"/>
          
          {/* Base LED */}
          <rect x="-2" y="10" width="4" height="3" fill="#4B5563" rx="0.5"/>
          <rect x="-1.5" y="10.5" width="3" height="0.5" fill={color.modern} opacity="0.7"/>
          
          {/* Points LED internes */}
          <circle cx="-1.5" cy="4" r="0.5" fill="#FEF3C7" opacity="0.9"/>
          <circle cx="1.5" cy="4" r="0.5" fill="#FEF3C7" opacity="0.9"/>
          <circle cx="0" cy="7" r="0.5" fill="#FEF3C7" opacity="0.9"/>
          
          {/* Rayons modernes géométriques */}
          <g opacity="0.7">
            <rect x="-8" y="5.5" width="3" height="1" fill={color.bulb} rx="0.5"/>
            <rect x="5" y="5.5" width="3" height="1" fill={color.bulb} rx="0.5"/>
            <rect x="-0.5" y="-2" width="1" height="3" fill={color.bulb} rx="0.5"/>
            <rect x="-0.5" y="13" width="1" height="3" fill={color.bulb} rx="0.5"/>
            <rect x="-6" y="0" width="2" height="0.8" fill={color.bulb} rx="0.4" transform="rotate(45 -5 0.4)"/>
            <rect x="4" y="0" width="2" height="0.8" fill={color.bulb} rx="0.4" transform="rotate(-45 5 0.4)"/>
          </g>
        </g>
        
        {/* Texte moderne */}
        <g transform="translate(68, 24)" filter="url(#modernGlow)">
          <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.textBold} letterSpacing="0.3px">
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="16" letterSpacing="0.2px">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="normal" fill={color.text} y="28" letterSpacing="0.2px">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

export default EnedisMasterpieceA;