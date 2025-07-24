import React from 'react';
import { cn } from '@/lib/utils';

interface Enedis3DLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
}

const sizesMap = {
  sm: 'w-32 h-10',
  md: 'w-48 h-14', 
  lg: 'w-64 h-18',
  xl: 'w-80 h-22',
  header: 'w-64 h-12',
};

/**
 * Option A: 3D Compact avec ombres réalistes
 */
export function Enedis3DCompactA({ className, size = 'header', variant = 'light' }: Enedis3DLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      shadow: '#1E40AF',
      highlight: '#E0E7FF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF', 
      shadow: '#1E3A8A',
      highlight: '#DBEAFE'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      shadow: '#1E40AF',
      highlight: '#E0E7FF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Enedis</title>
        
        <defs>
          {/* Filtres 3D pour l'ombre et le relief */}
          <filter id="house3DA" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="3" stdDeviation="1.5" floodColor={color.shadow} floodOpacity="0.4"/>
            <feSpecularLighting result="specOut" specularExponent="20" lightingColor="white">
              <fePointLight x="10" y="5" z="20"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          <linearGradient id="house3DGradientA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.highlight} />
            <stop offset="50%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Maison 3D compacte */}
        <g transform="translate(4, 12)">
          {/* Corps principal avec gradient 3D */}
          <path 
            d="M2 14 L12 4 L22 14 L22 24 L2 24 Z" 
            fill="url(#house3DGradientA)" 
            stroke={color.houseStroke} 
            strokeWidth="1.8"
            filter="url(#house3DA)"
          />
          
          {/* Toit avec effet de profondeur */}
          <path 
            d="M0 14 L12 2 L24 14" 
            stroke={color.houseStroke} 
            strokeWidth="2" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#house3DA)"
          />
          
          {/* Porte avec relief */}
          <rect 
            x="9" 
            y="18" 
            width="6" 
            height="6" 
            fill={color.houseStroke} 
            rx="0.5"
            filter="url(#house3DA)"
          />
          
          {/* Reflets lumineux */}
          <path d="M4 10 L8 6 L12 10" stroke="white" strokeWidth="1" opacity="0.6" fill="none"/>
          <circle cx="12" cy="21" r="0.5" fill="white" opacity="0.8"/>
        </g>
        
        {/* Texte avec ombre portée */}
        <g transform="translate(36, 20)" filter="url(#house3DA)">
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
 * Option B: 3D avec éclair en relief
 */
export function Enedis3DElectricB({ className, size = 'header', variant = 'light' }: Enedis3DLogoProps) {
  const sizesMapB = {
    sm: 'w-36 h-12',
    md: 'w-52 h-16', 
    lg: 'w-68 h-20',
    xl: 'w-84 h-24',
    header: 'w-76 h-14',
  };

  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      accent: '#5BC248',
      shadow: '#1E40AF',
      highlight: '#FBBF24'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF', 
      accent: '#5BC248',
      shadow: '#1E3A8A',
      highlight: '#FBBF24'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      accent: '#5BC248',
      shadow: '#1E40AF',
      highlight: '#FBBF24'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMapB[size], className)}>
      <svg viewBox="0 0 260 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Raccordement électrique</title>
        
        <defs>
          <filter id="house3DB" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="4" stdDeviation="2" floodColor={color.shadow} floodOpacity="0.5"/>
            <feSpecularLighting result="specOut" specularExponent="25" lightingColor="white">
              <fePointLight x="14" y="8" z="25"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          <filter id="lightning3D" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor={color.highlight} floodOpacity="0.8"/>
            <feGaussianBlur stdDeviation="0.5"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          
          <linearGradient id="house3DGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="50%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Maison avec éclair 3D */}
        <g transform="translate(6, 14)">
          {/* Corps de la maison */}
          <path 
            d="M2 16 L14 4 L26 16 L26 28 L2 28 Z" 
            fill="url(#house3DGradientB)" 
            stroke={color.houseStroke} 
            strokeWidth="2"
            filter="url(#house3DB)"
          />
          
          <path 
            d="M0 16 L14 2 L28 16" 
            stroke={color.houseStroke} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#house3DB)"
          />
          
          {/* Éclair électrique en 3D */}
          <path 
            d="M16 8 L11 16 L16 16 L13 24" 
            stroke={color.accent} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#lightning3D)"
          />
          
          {/* Halo lumineux autour de l'éclair */}
          <path 
            d="M16 8 L11 16 L16 16 L13 24" 
            stroke={color.highlight} 
            strokeWidth="6" 
            strokeLinecap="round" 
            fill="none"
            opacity="0.3"
          />
          
          {/* Porte avec relief */}
          <rect 
            x="20" 
            y="20" 
            width="5" 
            height="8" 
            fill={color.houseStroke} 
            rx="0.5"
            filter="url(#house3DB)"
          />
          
          {/* Reflets sur la maison */}
          <line x1="6" y1="12" x2="10" y2="8" stroke="white" strokeWidth="1.5" opacity="0.7"/>
          <line x1="18" y1="8" x2="22" y2="12" stroke="white" strokeWidth="1.5" opacity="0.7"/>
        </g>
        
        {/* Texte avec effet 3D */}
        <g transform="translate(48, 26)" filter="url(#house3DB)">
          <text fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={color.text}>
            Votre partenaire
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="10" fill={color.text} opacity="0.8" y="16">
            Raccordement au réseau d'électricité d'Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Option C: 3D Premium avec effets métalliques
 */
export function Enedis3DPremiumC({ className, size = 'header', variant = 'light' }: Enedis3DLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#F8FAFF', 
      text: '#4A63E8', 
      metal: '#C7D2FE',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF', 
      metal: '#6366F1',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#F8FAFF', 
      text: '#4A63E8', 
      metal: '#C7D2FE',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 240 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Premium</title>
        
        <defs>
          <filter id="premium3D" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="2.5" floodColor={color.shadow} floodOpacity="0.6"/>
            <feSpecularLighting result="specOut" specularExponent="30" lightingColor="white">
              <fePointLight x="12" y="6" z="30"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="25%" stopColor={color.metal} />
            <stop offset="75%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.text} />
            <stop offset="50%" stopColor={color.shadow} />
            <stop offset="100%" stopColor={color.text} />
          </linearGradient>
        </defs>
        
        {/* Maison métallique premium */}
        <g transform="translate(4, 12)">
          <path 
            d="M2 14 L12 4 L22 14 L22 24 L2 24 Z" 
            fill="url(#metalGradient)" 
            stroke={color.houseStroke} 
            strokeWidth="2.5"
            filter="url(#premium3D)"
          />
          
          <path 
            d="M0 14 L12 2 L24 14" 
            stroke={color.houseStroke} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#premium3D)"
          />
          
          {/* Détails métalliques */}
          <rect x="9" y="18" width="6" height="6" fill={color.houseStroke} rx="1" filter="url(#premium3D)"/>
          
          {/* Reflets métalliques multiples */}
          <line x1="4" y1="10" x2="8" y2="6" stroke="white" strokeWidth="2" opacity="0.8"/>
          <line x1="16" y1="6" x2="20" y2="10" stroke="white" strokeWidth="2" opacity="0.8"/>
          <line x1="12" y1="4" x2="12" y2="8" stroke="white" strokeWidth="1.5" opacity="0.9"/>
          
          {/* Bords biseautés */}
          <path d="M2 14 L4 12 L20 12 L22 14" stroke={color.metal} strokeWidth="1" opacity="0.6"/>
        </g>
        
        {/* Texte avec gradient métallique */}
        <g transform="translate(36, 20)" filter="url(#premium3D)">
          <text fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="url(#textGradient)">
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
 * Option D: 3D Moderne avec perspective
 */
export function Enedis3DModernD({ className, size = 'header', variant = 'light' }: Enedis3DLogoProps) {
  const colors = {
    light: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      perspective: '#8B5CF6',
      shadow: '#1E40AF'
    },
    dark: { 
      houseStroke: '#FFFFFF', 
      houseFill: '#4A63E8', 
      text: '#FFFFFF', 
      perspective: '#A78BFA',
      shadow: '#1E3A8A'
    },
    blue: { 
      houseStroke: '#4A63E8', 
      houseFill: '#FFFFFF', 
      text: '#4A63E8', 
      perspective: '#8B5CF6',
      shadow: '#1E40AF'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 230 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Votre partenaire - Moderne</title>
        
        <defs>
          <filter id="modern3D" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor={color.shadow} floodOpacity="0.4"/>
            <feSpecularLighting result="specOut" specularExponent="35" lightingColor="white">
              <fePointLight x="12" y="4" z="35"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          <linearGradient id="perspectiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" />
            <stop offset="30%" stopColor={color.houseFill} />
            <stop offset="70%" stopColor={color.perspective} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color.shadow} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Maison avec perspective moderne */}
        <g transform="translate(4, 12)">
          {/* Effet de profondeur arrière */}
          <path 
            d="M4 16 L14 6 L24 16 L24 26 L4 26 Z" 
            fill={color.shadow} 
            opacity="0.2"
            transform="translate(1, 1)"
          />
          
          {/* Corps principal */}
          <path 
            d="M2 14 L12 4 L22 14 L22 24 L2 24 Z" 
            fill="url(#perspectiveGradient)" 
            stroke={color.houseStroke} 
            strokeWidth="2.2"
            filter="url(#modern3D)"
          />
          
          <path 
            d="M0 14 L12 2 L24 14" 
            stroke={color.houseStroke} 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#modern3D)"
          />
          
          {/* Porte moderne */}
          <rect x="9" y="18" width="6" height="6" fill={color.houseStroke} rx="1" filter="url(#modern3D)"/>
          
          {/* Effets de perspective */}
          <line x1="2" y1="24" x2="4" y2="26" stroke={color.perspective} strokeWidth="1.5" opacity="0.5"/>
          <line x1="22" y1="24" x2="24" y2="26" stroke={color.perspective} strokeWidth="1.5" opacity="0.5"/>
          
          {/* Reflets en perspective */}
          <polygon points="4,12 8,8 12,12 8,16" fill="white" opacity="0.4"/>
          <polygon points="12,8 16,12 20,8 16,4" fill="white" opacity="0.3"/>
        </g>
        
        {/* Texte moderne */}
        <g transform="translate(36, 20)" filter="url(#modern3D)">
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

export default Enedis3DCompactA;