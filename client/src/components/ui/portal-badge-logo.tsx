import React from 'react';

interface PortalBadgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  className?: string;
}

export default function PortalBadgeLogo({ 
  size = 'md', 
  variant = 'light', 
  className = '' 
}: PortalBadgeLogoProps) {
  
  const sizeClasses = {
    sm: 'w-32 h-16 text-xs',
    md: 'w-40 h-20 text-sm',
    lg: 'w-48 h-24 text-base',
    xl: 'w-56 h-28 text-lg'
  };
  
  const backgroundGradient = variant === 'dark' 
    ? 'from-slate-700 to-slate-800' 
    : 'from-[#E9F4FF] to-[#D7EBFF]';
    
  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={`
      relative inline-flex items-center
      bg-gradient-to-br ${backgroundGradient}
      rounded-lg border border-blue-100/50
      px-4 py-2
      ${sizeClasses[size]}
      ${className}
    `}>
      
      {/* Accent vertical line */}
      <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#95C11F] rounded-l-lg"></div>
      
      {/* Main content */}
      <div className="flex flex-col justify-center ml-2 flex-1">
        
        {/* Title section */}
        <div className="flex flex-col leading-tight">
          <div className="font-semibold tracking-wide">
            <span 
              className="text-[#1C3FAA]"
              style={{ fontFamily: 'Montserrat, Manrope, sans-serif' }}
            >
              PORTAIL
            </span>
          </div>
          <div className="font-semibold tracking-wide -mt-0.5">
            <span 
              className="text-[#0032FF]"
              style={{ fontFamily: 'Montserrat, Manrope, sans-serif' }}
            >
              RACCORDEMENT
            </span>
          </div>
        </div>
        
        {/* Subtitle section */}
        <div className={`
          uppercase tracking-wider font-medium mt-1
          ${size === 'sm' ? 'text-[10px]' : 
            size === 'md' ? 'text-xs' : 
            size === 'lg' ? 'text-sm' : 'text-base'}
        `}>
          <span className="text-[#4B4B4B]">SERVICE RÉSEAU </span>
          <span 
            className="text-[#95C11F] font-semibold"
            style={{ fontFamily: 'Montserrat, Manrope, sans-serif' }}
          >
            ENEDIS
          </span>
        </div>
        
      </div>
      
    </div>
  );
}

// Export named version for compatibility
export { PortalBadgeLogo };