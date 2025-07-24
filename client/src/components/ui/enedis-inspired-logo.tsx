import React from 'react';
import { cn } from '@/lib/utils';

interface EnedisInspiredLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
}

const sizesMap = {
  sm: 'w-32 h-12',
  md: 'w-48 h-18', 
  lg: 'w-64 h-24',
  xl: 'w-80 h-30',
  header: 'w-72 h-14',
};

/**
 * Option 1: Logo officiel Enedis avec maison simple
 */
export function EnedisInspiredLogo({ className, size = 'header', variant = 'light' }: EnedisInspiredLogoProps) {
  // Couleurs basées sur la charte officielle Enedis
  const colors = {
    light: {
      houseStroke: '#4A63E8', // Bleu Enedis officiel
      houseFill: '#FFFFFF',
      text: '#4A63E8',
      background: '#FFFFFF',
    },
    dark: {
      houseStroke: '#FFFFFF',
      houseFill: '#4A63E8',
      text: '#FFFFFF', 
      background: 'transparent',
    },
    blue: {
      houseStroke: '#4A63E8',
      houseFill: '#FFFFFF',
      text: '#4A63E8',
      background: 'transparent',
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMap[size], className)}>
      <svg 
        viewBox="0 0 240 56" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full" 
        aria-labelledby="enedis-logo-title"
      >
        <title id="enedis-logo-title">Enedis - Raccordement</title>
        
        {/* Icône maison simple et clean comme Enedis */}
        <g transform="translate(8, 12)">
          {/* Fond de la maison */}
          <path 
            d="M2 18 L12 8 L22 18 L22 30 L2 30 Z" 
            fill={color.houseFill}
            stroke={color.houseStroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Toit simple */}
          <path 
            d="M0 18 L12 6 L24 18" 
            stroke={color.houseStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Porte simple */}
          <rect 
            x="9" 
            y="22" 
            width="6" 
            height="8" 
            fill={color.houseStroke}
            rx="0.5"
          />
          
          {/* Poignée de porte */}
          <circle 
            cx="13" 
            cy="26" 
            r="0.5" 
            fill={color.houseFill}
          />
        </g>
        
        {/* Titre "Votre partenaire" */}
        <g transform="translate(48, 22)">
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="14" 
            fontWeight="bold" 
            fill={color.text}
          >
            Votre partenaire
          </text>
        </g>
        
        {/* Sous-titre officiel */}
        <g transform="translate(48, 40)">
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="12" 
            fill={color.text}
            opacity="0.8"
          >
            Raccordement au réseau
          </text>
          <text 
            fontFamily="Arial, sans-serif" 
            fontSize="12" 
            fill={color.text}
            opacity="0.8"
            y="14"
          >
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Option 2: Logo avec maison plus détaillée et sous-titre
 */
export function EnedisLogoOption2({ className, size = 'header', variant = 'light' }: EnedisInspiredLogoProps) {
  const sizesMap = {
    sm: 'w-36 h-12',
    md: 'w-52 h-18', 
    lg: 'w-68 h-24',
    xl: 'w-84 h-30',
    header: 'w-80 h-16',
  };

  const colors = {
    light: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', background: '#FFFFFF' },
    dark: { houseStroke: '#FFFFFF', houseFill: '#4A63E8', text: '#FFFFFF', background: 'transparent' },
    blue: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', background: 'transparent' }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMap[size], className)}>
      <svg viewBox="0 0 280 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Enedis - Raccordement électrique</title>
        
        {/* Maison avec plus de détails */}
        <g transform="translate(8, 16)">
          <path d="M2 20 L16 6 L30 20 L30 36 L2 36 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="2" strokeLinejoin="round"/>
          <path d="M0 20 L16 4 L32 20" stroke={color.houseStroke} strokeWidth="2" strokeLinecap="round" fill="none"/>
          
          {/* Fenêtres */}
          <rect x="6" y="22" width="6" height="6" fill={color.houseStroke} rx="1"/>
          <rect x="20" y="22" width="6" height="6" fill={color.houseStroke} rx="1"/>
          
          {/* Porte */}
          <rect x="12" y="26" width="8" height="10" fill={color.houseStroke} rx="1"/>
          <circle cx="18" cy="31" r="1" fill={color.houseFill}/>
        </g>
        
        {/* Titre "Votre partenaire" */}
        <g transform="translate(56, 26)">
          <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill={color.text}>
            Votre partenaire
          </text>
        </g>
        
        {/* Sous-titre officiel */}
        <g transform="translate(56, 44)">
          <text fontFamily="Arial, sans-serif" fontSize="11" fill={color.text} opacity="0.8">
            Raccordement au réseau
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="11" fill={color.text} opacity="0.8" y="12">
            d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Option 3: Logo horizontal compact
 */
export function EnedisLogoOption3({ className, size = 'header', variant = 'light' }: EnedisInspiredLogoProps) {
  const sizesMap = {
    sm: 'w-32 h-10',
    md: 'w-48 h-14', 
    lg: 'w-64 h-18',
    xl: 'w-80 h-22',
    header: 'w-64 h-12',
  };

  const colors = {
    light: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', background: '#FFFFFF' },
    dark: { houseStroke: '#FFFFFF', houseFill: '#4A63E8', text: '#FFFFFF', background: 'transparent' },
    blue: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', background: 'transparent' }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Enedis</title>
        
        {/* Icône maison compacte */}
        <g transform="translate(4, 12)">
          <path d="M2 14 L12 4 L22 14 L22 24 L2 24 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="1.5"/>
          <path d="M0 14 L12 2 L24 14" stroke={color.houseStroke} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <rect x="9" y="18" width="6" height="6" fill={color.houseStroke} rx="0.5"/>
        </g>
        
        {/* Texte compact officiel */}
        <g transform="translate(36, 20)">
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill={color.text}>
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="9" fill={color.text} opacity="0.8" y="16">
            Raccordement au réseau d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Option 4: Logo avec icône électrique
 */
export function EnedisLogoOption4({ className, size = 'header', variant = 'light' }: EnedisInspiredLogoProps) {
  const sizesMap = {
    sm: 'w-36 h-12',
    md: 'w-52 h-16', 
    lg: 'w-68 h-20',
    xl: 'w-84 h-24',
    header: 'w-76 h-14',
  };

  const colors = {
    light: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', accent: '#5BC248' },
    dark: { houseStroke: '#FFFFFF', houseFill: '#4A63E8', text: '#FFFFFF', accent: '#5BC248' },
    blue: { houseStroke: '#4A63E8', houseFill: '#FFFFFF', text: '#4A63E8', accent: '#5BC248' }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMap[size], className)}>
      <svg viewBox="0 0 260 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Enedis - Raccordement</title>
        
        {/* Maison avec éclair */}
        <g transform="translate(6, 14)">
          <path d="M2 16 L14 4 L26 16 L26 28 L2 28 Z" fill={color.houseFill} stroke={color.houseStroke} strokeWidth="1.5"/>
          <path d="M0 16 L14 2 L28 16" stroke={color.houseStroke} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          
          {/* Éclair électrique */}
          <path d="M16 10 L12 16 L16 16 L14 22" stroke={color.accent} strokeWidth="2" strokeLinecap="round" fill="none"/>
          
          {/* Porte */}
          <rect x="11" y="20" width="6" height="8" fill={color.houseStroke} rx="0.5"/>
        </g>
        
        {/* Titre "Votre partenaire" */}
        <g transform="translate(48, 26)">
          <text fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.text}>
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="10" fill={color.text} opacity="0.8" y="16">
            Raccordement au réseau d'électricité d'Enedis
          </text>
        </g>
        
        {/* Point vert d'énergie */}
        <circle cx="42" cy="28" r="2" fill={color.accent}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}

/**
 * Option 5: Logo minimaliste style officiel
 */
export function EnedisLogoOption5({ className, size = 'header', variant = 'light' }: EnedisInspiredLogoProps) {
  const sizesMap = {
    sm: 'w-28 h-10',
    md: 'w-42 h-14', 
    lg: 'w-56 h-18',
    xl: 'w-70 h-22',
    header: 'w-56 h-12',
  };

  const colors = {
    light: { icon: '#4A63E8', text: '#4A63E8' },
    dark: { icon: '#FFFFFF', text: '#FFFFFF' },
    blue: { icon: '#4A63E8', text: '#4A63E8' }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Enedis</title>
        
        {/* Icône maison ultra simple */}
        <g transform="translate(4, 16)">
          <path d="M2 12 L8 6 L14 12 L14 16 L2 16 Z" fill="none" stroke={color.icon} strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M0 12 L8 4 L16 12" stroke={color.icon} strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        
        {/* Texte officiel minimaliste */}
        <g transform="translate(28, 22)">
          <text fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill={color.text}>
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="8" fill={color.text} opacity="0.8" y="14">
            Raccordement au réseau d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

export default EnedisInspiredLogo;