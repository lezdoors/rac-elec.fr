import { cn } from "../../lib/utils";

interface EnedisAuthenticLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark' | 'blue';
}

const sizesMap = {
  sm: 'h-6 w-auto min-w-[120px] max-w-[160px]',
  md: 'h-8 w-auto min-w-[160px] max-w-[220px]',
  lg: 'h-12 w-auto min-w-[200px] max-w-[280px]',
  xl: 'h-16 w-auto min-w-[240px] max-w-[320px]',
  header: 'h-10 w-auto min-w-[180px] max-w-[260px] md:h-12 md:min-w-[220px] md:max-w-[300px]'
};

/**
 * AUTHENTIC ENEDIS MASTERPIECE - Inspired by official website
 * Clean, modern, beautiful like the screenshots you showed me
 */
export function EnedisAuthenticMasterpiece({ className, size = 'header', variant = 'light' }: EnedisAuthenticLogoProps) {
  const colors = {
    light: { 
      enedisBlue: '#0072CE',
      enedisGreen: '#5BC248', 
      houseFill: '#FFFFFF',
      text: '#0072CE',
      textBold: '#0072CE',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      accent: '#5BC248'
    },
    dark: { 
      enedisBlue: '#FFFFFF',
      enedisGreen: '#5BC248', 
      houseFill: '#0072CE',
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      accent: '#5BC248'
    },
    blue: { 
      enedisBlue: '#0072CE',
      enedisGreen: '#5BC248', 
      houseFill: '#FFFFFF',
      text: '#0072CE',
      textBold: '#0072CE',
      bulb: '#F59E0B',
      bulbGlow: '#FEF3C7',
      accent: '#5BC248'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-3", sizesMap[size], className)}>
      <svg viewBox="0 0 350 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Service Raccordement Électricité - Expert raccordement Enedis</title>
        
        <defs>
          {/* Filtre doux pour l'authentique style Enedis */}
          <filter id="enedisStyle" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="softBlur"/>
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor={color.enedisBlue} floodOpacity="0.15"/>
            <feMerge>
              <feMergeNode in="softBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient authentique pour l'ampoule */}
          <radialGradient id="authenticBulb" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="25%" stopColor="#FEF3C7" />
            <stop offset="60%" stopColor={color.bulb} />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          
          {/* Gradient pour la maison */}
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.houseFill} />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
        
        {/* MAISON ENEDIS AUTHENTIQUE - Style officiel exact */}
        <g transform="translate(10, 20)">
          {/* Corps principal - proportions parfaites */}
          <path 
            d="M4 18 L16 8 L28 18 L28 32 L4 32 Z" 
            fill="url(#houseGradient)" 
            stroke={color.enedisBlue} 
            strokeWidth="2.5"
            filter="url(#enedisStyle)"
          />
          
          {/* Toit distinctif Enedis */}
          <path 
            d="M2 18 L16 6 L30 18" 
            stroke={color.enedisBlue} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            filter="url(#enedisStyle)"
          />
          
          {/* Porte moderne */}
          <rect 
            x="12" 
            y="22" 
            width="8" 
            height="10" 
            fill={color.enedisBlue} 
            rx="1.5"
          />
          <circle cx="17.5" cy="27" r="0.8" fill="white"/>
          
          {/* Fenêtres avec accent vert Enedis */}
          <rect x="6" y="20" width="4" height="4" fill={color.enedisGreen} opacity="0.8" rx="0.5"/>
          <rect x="22" y="20" width="4" height="4" fill={color.enedisGreen} opacity="0.8" rx="0.5"/>
          <rect x="7" y="21" width="2" height="2" fill="white" opacity="0.9" rx="0.2"/>
          <rect x="23" y="21" width="2" height="2" fill="white" opacity="0.9" rx="0.2"/>
          
          {/* Reflets et détails architecturaux */}
          <circle cx="16" cy="6" r="1.2" fill="white" opacity="0.9"/>
          <line x1="8" y1="14" x2="12" y2="10" stroke="white" strokeWidth="1.8" opacity="0.7"/>
          <line x1="20" y1="10" x2="24" y2="14" stroke="white" strokeWidth="1.8" opacity="0.7"/>
        </g>
        
        {/* AMPOULE ÉLECTRIQUE AUTHENTIQUE - Inspiration directe des screenshots */}
        <g transform="translate(45, 22)">
          {/* Halo lumineux subtil comme sur le site officiel */}
          <circle cx="0" cy="6" r="9" fill={color.bulbGlow} opacity="0.25"/>
          <circle cx="0" cy="6" r="6" fill={color.bulbGlow} opacity="0.35"/>
          
          {/* Corps de l'ampoule - style moderne Enedis */}
          <circle 
            cx="0" 
            cy="4" 
            r="4" 
            fill="url(#authenticBulb)" 
            filter="url(#enedisStyle)"
          />
          
          {/* Culot technique */}
          <rect x="-2" y="8" width="4" height="3" fill="#4B5563" rx="0.4"/>
          <rect x="-1.5" y="8.5" width="3" height="0.5" fill="#9CA3AF"/>
          <rect x="-1.5" y="9.5" width="3" height="0.5" fill="#9CA3AF"/>
          
          {/* Filament style moderne */}
          <path d="M-2 2 Q0 4.5 2 2 Q0 6.5 -2 4.5" stroke="#F59E0B" strokeWidth="0.7" fill="none" opacity="0.9"/>
          <path d="M-1.2 3 Q0 4.8 1.2 3" stroke="#FCD34D" strokeWidth="0.5" fill="none" opacity="0.8"/>
          
          {/* Rayons d'énergie - couleur verte authentique Enedis */}
          <g opacity="0.85">
            <line x1="-7" y1="4" x2="-5" y2="4" stroke={color.enedisGreen} strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="4" x2="7" y2="4" stroke={color.enedisGreen} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="-2" x2="0" y2="0" stroke={color.enedisGreen} strokeWidth="2" strokeLinecap="round"/>
            <line x1="0" y1="12" x2="0" y2="14" stroke={color.enedisGreen} strokeWidth="2" strokeLinecap="round"/>
            <line x1="-5" y1="0" x2="-3.5" y2="1.5" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3.5" y1="1.5" x2="5" y2="0" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-5" y1="12" x2="-3.5" y2="10.5" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3.5" y1="10.5" x2="5" y2="12" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          
          {/* Étincelles d'énergie verte - style site officiel */}
          <circle cx="-5" cy="1" r="0.6" fill={color.enedisGreen} opacity="0.9"/>
          <circle cx="5" cy="8" r="0.5" fill={color.enedisGreen} opacity="0.8"/>
          <circle cx="2" cy="-1" r="0.4" fill={color.enedisGreen} opacity="0.7"/>
          <circle cx="-3" cy="10" r="0.4" fill={color.enedisGreen} opacity="0.8"/>
          
          {/* Éclat central lumineux */}
          <circle cx="-1" cy="3" r="0.8" fill="white" opacity="0.7"/>
          <circle cx="0" cy="4" r="1.2" fill="white" opacity="0.4"/>
        </g>
        
        {/* TEXTE OFFICIEL - Mobile-optimized */}
        <g transform="translate(75, 26)">
          <text 
            fontFamily="Arial, Helvetica, sans-serif" 
            fontSize={size === 'sm' ? '14' : size === 'md' ? '16' : '18'} 
            fontWeight="700" 
            fill={color.textBold} 
            letterSpacing="0.2px"
          >
            Service Raccordement
          </text>
          <text 
            fontFamily="Arial, Helvetica, sans-serif" 
            fontSize={size === 'sm' ? '10' : size === 'md' ? '12' : '13'} 
            fontWeight="400" 
            fill={color.text} 
            y={size === 'sm' ? '15' : '18'} 
            letterSpacing="0.1px"
          >
            Électricité
          </text>
          <text 
            fontFamily="Arial, Helvetica, sans-serif" 
            fontSize={size === 'sm' ? '10' : size === 'md' ? '12' : '13'} 
            fontWeight="400" 
            fill={color.text} 
            y={size === 'sm' ? '27' : '32'} 
            letterSpacing="0.1px"
          >
            Expert raccordement Enedis
          </text>
        </g>
        
        {/* Accents décoratifs subtils - style moderne */}
        <g opacity="0.3">
          <circle cx="320" cy="15" r="2" fill={color.enedisGreen}/>
          <circle cx="315" cy="65" r="1.5" fill={color.enedisBlue}/>
          <circle cx="5" cy="10" r="1" fill={color.accent}/>
        </g>
      </svg>
    </div>
  );
}

/**
 * COMPACT MOBILE VERSION - Perfect for headers and tight spaces
 */
function EnedisAuthenticCompact({ className, size = 'header', variant = 'light' }: EnedisAuthenticLogoProps) {
  const colors = {
    light: { 
      enedisBlue: '#0072CE',
      enedisGreen: '#5BC248', 
      houseFill: '#FFFFFF',
      text: '#0072CE',
      textBold: '#0072CE',
      bulb: '#F59E0B',
      accent: '#5BC248'
    },
    dark: { 
      enedisBlue: '#FFFFFF',
      enedisGreen: '#5BC248', 
      houseFill: '#0072CE',
      text: '#FFFFFF',
      textBold: '#F1F5F9',
      bulb: '#F59E0B',
      accent: '#5BC248'
    },
    blue: { 
      enedisBlue: '#0072CE',
      enedisGreen: '#5BC248', 
      houseFill: '#FFFFFF',
      text: '#0072CE',
      textBold: '#0072CE',
      bulb: '#F59E0B',
      accent: '#5BC248'
    }
  };

  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center gap-2", sizesMap[size], className)}>
      <svg viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Service Raccordement Électricité - Expert raccordement Enedis</title>
        
        {/* Maison compacte */}
        <g transform="translate(8, 15)">
          <path d="M3 15 L12 6 L21 15 L21 25 L3 25 Z" fill={color.houseFill} stroke={color.enedisBlue} strokeWidth="2"/>
          <path d="M1 15 L12 4 L23 15" stroke={color.enedisBlue} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <rect x="9" y="18" width="6" height="7" fill={color.enedisBlue} rx="1"/>
          <circle cx="13" cy="21.5" r="0.6" fill="white"/>
          <rect x="5" y="17" width="2.5" height="2.5" fill={color.enedisGreen} opacity="0.8" rx="0.3"/>
          <rect x="16.5" y="17" width="2.5" height="2.5" fill={color.enedisGreen} opacity="0.8" rx="0.3"/>
        </g>
        
        {/* Ampoule compacte */}
        <g transform="translate(32, 17)">
          <circle cx="0" cy="4" r="6" fill="#FEF3C7" opacity="0.3"/>
          <circle cx="0" cy="3" r="3" fill={color.bulb}/>
          <rect x="-1.5" y="6" width="3" height="2" fill="#4B5563" rx="0.3"/>
          <line x1="-5" y1="3" x2="-3.5" y2="3" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3.5" y1="3" x2="5" y2="3" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="0" y1="-1" x2="0" y2="0.5" stroke={color.enedisGreen} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="-3" cy="0" r="0.4" fill={color.enedisGreen} opacity="0.8"/>
          <circle cx="3" cy="6" r="0.3" fill={color.enedisGreen} opacity="0.9"/>
        </g>
        
        {/* Texte compact mobile-optimized */}
        <g transform="translate(50, 20)">
          <text fontFamily="Arial, sans-serif" fontSize="14" fontWeight="700" fill={color.textBold}>
            Service Raccordement
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="10" fontWeight="400" fill={color.text} y="12">
            Électricité
          </text>
          <text fontFamily="Arial, sans-serif" fontSize="10" fontWeight="400" fill={color.text} y="22">
            Expert raccordement Enedis
          </text>
        </g>
      </svg>
    </div>
  );
}

export default EnedisAuthenticMasterpiece;