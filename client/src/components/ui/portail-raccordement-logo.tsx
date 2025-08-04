import { cn } from "../../lib/utils";

interface PortailRaccordementLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'light' | 'dark';
}

const sizesMap = {
  sm: 'h-6 w-auto min-w-[120px] max-w-[160px]',
  md: 'h-8 w-auto min-w-[160px] max-w-[200px]',
  lg: 'h-12 w-auto min-w-[180px] max-w-[220px]',
  xl: 'h-16 w-auto min-w-[200px] max-w-[240px]',
  header: 'h-10 w-auto min-w-[160px] max-w-[200px] md:h-12 md:min-w-[180px] md:max-w-[220px]'
};

/**
 * Modern Portail Raccordement Logo - Professional Enedis-inspired design
 * Clean, modern, lightweight for website header usage
 */
export function PortailRaccordementLogo({ className, size = 'header', variant = 'light' }: PortailRaccordementLogoProps) {
  const colors = {
    light: { 
      primary: '#0033A0',
      secondary: '#333333',
      accent: '#92C83E',
      background: '#E8F2FF',
      border: '#0033A0'
    },
    dark: { 
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      accent: '#92C83E',
      background: 'rgba(255,255,255,0.1)',
      border: '#FFFFFF'
    }
  };
  
  const color = colors[variant] || colors.light;

  return (
    <div className={cn("inline-flex items-center", sizesMap[size], className)}>
      <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>Portail Raccordement - Raccordement au réseau public d'électricité Enedis</title>
        
        {/* Background with rounded corners */}
        <rect x="2" y="2" width="196" height="56" rx="6" ry="6" fill={color.background} stroke={color.border} strokeWidth="0.5" opacity="0.1"/>
        
        {/* Small electric symbol */}
        <g transform="translate(8, 8)">
          <path d="M6 2 L2 8 L5 8 L4 14 L8 8 L5 8 Z" fill={color.primary} opacity="0.7"/>
        </g>
        
        {/* Main title "PORTAIL RACCORDEMENT" */}
        <text x="100" y="22" textAnchor="middle" fill={color.primary} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif" fontSize="16" fontWeight="700" letterSpacing="0.5">
          PORTAIL RACCORDEMENT
        </text>
        
        {/* Subtitle line */}
        <text x="20" y="38" fill={color.secondary} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif" fontSize="8" fontWeight="400" letterSpacing="0.3">
          RACCORDEMENT AU RÉSEAU PUBLIC D'ÉLECTRICITÉ
        </text>
        
        {/* ENEDIS highlighted */}
        <text x="180" y="38" textAnchor="end" fill={color.accent} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif" fontSize="8" fontWeight="600" letterSpacing="0.3">
          ENEDIS
        </text>
      </svg>
    </div>
  );
}

export default PortailRaccordementLogo;