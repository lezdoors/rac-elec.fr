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
        
        {/* Subtle background container with rounded corners */}
        <rect x="1" y="1" width="198" height="58" rx="8" ry="8" fill={`${color.primary}03`} stroke={`${color.primary}1A`} strokeWidth="0.5"/>
        
        {/* Professional electric icon */}
        <g transform="translate(10, 12)">
          <circle cx="4" cy="4" r="3" fill="none" stroke={color.primary} strokeWidth="1.2" opacity="0.8"/>
          <path d="M2.5 2.5 L5.5 5.5 M5.5 2.5 L2.5 5.5" stroke={color.primary} strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
        </g>
        
        {/* Main title "PORTAIL RACCORDEMENT" - Professional styling */}
        <text x="100" y="24" textAnchor="middle" fill={color.primary} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Montserrat, sans-serif" fontSize="15" fontWeight="700" letterSpacing="0.8">
          PORTAIL RACCORDEMENT
        </text>
        
        {/* Small decorative line */}
        <line x1="40" y1="30" x2="160" y2="30" stroke={`${color.primary}26`} strokeWidth="0.5"/>
        
        {/* Subtitle with proper spacing */}
        <text x="100" y="42" textAnchor="middle" fill={color.secondary} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Montserrat, sans-serif" fontSize="7.5" fontWeight="500" letterSpacing="0.4">
          RACCORDEMENT AU RÉSEAU PUBLIC D'ÉLECTRICITÉ
        </text>
        
        {/* ENEDIS highlighted in brand green */}
        <text x="100" y="52" textAnchor="middle" fill={color.accent} fontFamily="system-ui, -apple-system, Segoe UI, Helvetica Neue, Montserrat, sans-serif" fontSize="8" fontWeight="700" letterSpacing="0.5">
          ENEDIS
        </text>
      </svg>
    </div>
  );
}

export default PortailRaccordementLogo;