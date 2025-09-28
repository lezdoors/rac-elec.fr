// Professional SVG illustrations for electrical connection service
// Modern flat design with corporate aesthetic

export const HeroFormIllustration = () => (
  <div className="relative w-full max-w-md mx-auto">
    <svg 
      viewBox="0 0 400 320" 
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background blob */}
      <ellipse cx="200" cy="280" rx="180" ry="40" fill="#E8F5E8" opacity="0.6"/>
      
      {/* Large device/tablet */}
      <rect x="120" y="80" width="160" height="200" rx="12" fill="#374151" stroke="#6B7280" strokeWidth="2"/>
      <rect x="128" y="88" width="144" height="184" rx="8" fill="#F9FAFB"/>
      
      {/* Screen header */}
      <rect x="136" y="96" width="128" height="24" rx="4" fill="#0072CE"/>
      <text x="200" y="110" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
        Demande de Raccordement
      </text>
      
      {/* Form fields */}
      <rect x="136" y="128" width="80" height="16" rx="2" fill="#E5E7EB"/>
      <text x="140" y="138" fill="#6B7280" fontSize="8">Nom</text>
      
      <rect x="136" y="152" width="120" height="16" rx="2" fill="#E5E7EB"/>
      <text x="140" y="162" fill="#6B7280" fontSize="8">Adresse</text>
      
      <rect x="136" y="176" width="100" height="16" rx="2" fill="#E5E7EB"/>
      <text x="140" y="186" fill="#6B7280" fontSize="8">Type de Logement</text>
      
      <rect x="136" y="200" width="90" height="16" rx="2" fill="#E5E7EB"/>
      <text x="140" y="210" fill="#6B7280" fontSize="8">Puissance Souhaitée</text>
      
      {/* Submit button */}
      <rect x="136" y="232" width="120" height="24" rx="12" fill="#4CAF50"/>
      <text x="196" y="246" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
        Finaliser ma Demande
      </text>
      
      {/* Professional woman character */}
      <g transform="translate(280, 140)">
        {/* Body */}
        <ellipse cx="20" cy="100" rx="18" ry="25" fill="#F59E0B"/>
        
        {/* Head */}
        <circle cx="20" cy="50" r="16" fill="#FBBF24"/>
        
        {/* Hair */}
        <path d="M8 45 C8 35, 32 35, 32 45 L32 55 C32 50, 8 50, 8 55 Z" fill="#374151"/>
        
        {/* Face features */}
        <circle cx="16" cy="48" r="1" fill="#374151"/>
        <circle cx="24" cy="48" r="1" fill="#374151"/>
        <path d="M18 54 Q20 56, 22 54" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Arm pointing */}
        <line x1="5" y1="85" x2="-15" y2="70" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
        
        {/* Legs */}
        <line x1="12" y1="125" x2="12" y2="150" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
        <line x1="28" y1="125" x2="28" y2="150" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
      </g>
      
      {/* Professional man character at desk */}
      <g transform="translate(40, 180)">
        {/* Desk */}
        <rect x="0" y="80" width="60" height="40" rx="4" fill="#6B7280"/>
        
        {/* Laptop */}
        <rect x="10" y="70" width="25" height="15" rx="2" fill="#374151"/>
        <rect x="12" y="72" width="21" height="11" rx="1" fill="#0072CE"/>
        
        {/* Character sitting */}
        {/* Body */}
        <ellipse cx="30" cy="70" rx="15" ry="20" fill="#EF4444"/>
        
        {/* Head */}
        <circle cx="30" cy="35" r="14" fill="#FBBF24"/>
        
        {/* Hair */}
        <path d="M18 30 C18 22, 42 22, 42 30 L42 38 C42 34, 18 34, 18 38 Z" fill="#92400E"/>
        
        {/* Face */}
        <circle cx="26" cy="33" r="1" fill="#374151"/>
        <circle cx="34" cy="33" r="1" fill="#374151"/>
        <path d="M28 38 Q30 40, 32 38" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Arms */}
        <line x1="18" y1="60" x2="8" y2="75" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"/>
        <line x1="42" y1="60" x2="35" y2="72" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"/>
      </g>
      
      {/* Decorative plants */}
      <g transform="translate(50, 100)">
        <ellipse cx="0" cy="20" rx="8" ry="6" fill="#84CC16"/>
        <rect x="-2" y="20" width="4" height="15" fill="#65A30D"/>
      </g>
      
      <g transform="translate(320, 120)">
        <ellipse cx="0" cy="15" rx="6" ry="4" fill="#84CC16"/>
        <rect x="-1" y="15" width="2" height="10" fill="#65A30D"/>
      </g>
      
      {/* Floating elements */}
      <circle cx="80" cy="60" r="4" fill="#0072CE" opacity="0.3"/>
      <circle cx="320" cy="80" r="3" fill="#4CAF50" opacity="0.4"/>
      <circle cx="60" cy="120" r="2" fill="#F59E0B" opacity="0.5"/>
    </svg>
  </div>
);

export const ServiceTypeIllustrations = {
  residential: () => (
    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
      {/* House structure */}
      <path d="M15 45 L40 20 L65 45 L65 70 L15 70 Z" fill="#E5E7EB" stroke="#0072CE" strokeWidth="2"/>
      <rect x="25" y="50" width="30" height="20" fill="#F3F4F6" stroke="#6B7280"/>
      <rect x="45" y="55" width="8" height="12" fill="#92400E"/>
      
      {/* Roof */}
      <path d="M10 45 L40 15 L70 45" stroke="#374151" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Electric connection */}
      <circle cx="55" cy="35" r="3" fill="#4CAF50"/>
      <path d="M52 32 L58 38 M58 32 L52 38" stroke="#4CAF50" strokeWidth="2"/>
    </svg>
  ),
  
  commercial: () => (
    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
      {/* Building structure */}
      <rect x="20" y="15" width="40" height="55" fill="#E5E7EB" stroke="#0072CE" strokeWidth="2"/>
      
      {/* Windows pattern */}
      <rect x="25" y="20" width="6" height="8" fill="#60A5FA"/>
      <rect x="35" y="20" width="6" height="8" fill="#60A5FA"/>
      <rect x="45" y="20" width="6" height="8" fill="#60A5FA"/>
      <rect x="55" y="20" width="6" height="8" fill="#60A5FA"/>
      
      <rect x="25" y="35" width="6" height="8" fill="#60A5FA"/>
      <rect x="35" y="35" width="6" height="8" fill="#60A5FA"/>
      <rect x="45" y="35" width="6" height="8" fill="#60A5FA"/>
      <rect x="55" y="35" width="6" height="8" fill="#60A5FA"/>
      
      {/* Entrance */}
      <rect x="35" y="55" width="10" height="15" fill="#92400E"/>
      
      {/* Power connection */}
      <circle cx="65" cy="25" r="4" fill="#4CAF50"/>
      <path d="M61 21 L69 29 M69 21 L61 29" stroke="#4CAF50" strokeWidth="2"/>
    </svg>
  ),
  
  solar: () => (
    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
      {/* Solar panel */}
      <rect x="15" y="25" width="50" height="30" fill="#1E40AF" stroke="#0072CE" strokeWidth="2"/>
      
      {/* Panel grid */}
      <line x1="25" y1="25" x2="25" y2="55" stroke="#60A5FA"/>
      <line x1="35" y1="25" x2="35" y2="55" stroke="#60A5FA"/>
      <line x1="45" y1="25" x2="45" y2="55" stroke="#60A5FA"/>
      <line x1="55" y1="25" x2="55" y2="55" stroke="#60A5FA"/>
      
      <line x1="15" y1="35" x2="65" y2="35" stroke="#60A5FA"/>
      <line x1="15" y1="45" x2="65" y2="45" stroke="#60A5FA"/>
      
      {/* Sun */}
      <circle cx="25" cy="15" r="6" fill="#F59E0B"/>
      <path d="M19 9 L31 21 M31 9 L19 21 M25 3 L25 27 M13 15 L37 15" stroke="#F59E0B" strokeWidth="1.5"/>
      
      {/* Connection */}
      <circle cx="55" cy="65" r="4" fill="#4CAF50"/>
      <path d="M51 61 L59 69 M59 61 L51 69" stroke="#4CAF50" strokeWidth="2"/>
    </svg>
  ),
  
  temporary: () => (
    <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
      {/* Construction site */}
      <rect x="20" y="50" width="40" height="20" fill="#F3F4F6" stroke="#0072CE" strokeWidth="2"/>
      
      {/* Crane */}
      <line x1="30" y1="50" x2="30" y2="20" stroke="#0072CE" strokeWidth="3"/>
      <line x1="30" y1="25" x2="55" y2="25" stroke="#0072CE" strokeWidth="2"/>
      <line x1="50" y1="25" x2="45" y2="40" stroke="#0072CE" strokeWidth="2"/>
      
      {/* Temporary power box */}
      <rect x="15" y="35" width="8" height="12" fill="#F59E0B" stroke="#0072CE" strokeWidth="1"/>
      <circle cx="19" cy="41" r="1.5" fill="#4CAF50"/>
      
      {/* Timer icon */}
      <circle cx="60" cy="15" r="6" fill="#0072CE"/>
      <path d="M60 12 L60 15 L62 17" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
};

export const ProcessStepIllustrations = {
  step1: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      {/* Document */}
      <rect x="16" y="8" width="32" height="48" rx="2" fill="white" stroke="#0072CE" strokeWidth="2"/>
      <rect x="20" y="16" width="24" height="2" fill="#E5E7EB"/>
      <rect x="20" y="22" width="20" height="2" fill="#E5E7EB"/>
      <rect x="20" y="28" width="16" height="2" fill="#E5E7EB"/>
      
      {/* Pen */}
      <line x1="40" y1="35" x2="50" y2="25" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="52" cy="23" r="2" fill="#4CAF50"/>
    </svg>
  ),
  
  step2: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      {/* Magnifying glass */}
      <circle cx="28" cy="28" r="16" fill="none" stroke="#0072CE" strokeWidth="3"/>
      <line x1="40" y1="40" x2="52" y2="52" stroke="#0072CE" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Checkmark inside */}
      <path d="M20 28 L26 34 L36 22" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  
  step3: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      {/* Gear */}
      <circle cx="32" cy="32" r="16" fill="none" stroke="#0072CE" strokeWidth="3"/>
      <circle cx="32" cy="32" r="8" fill="none" stroke="#0072CE" strokeWidth="2"/>
      
      {/* Gear teeth */}
      <rect x="30" y="8" width="4" height="8" fill="#0072CE"/>
      <rect x="30" y="48" width="4" height="8" fill="#0072CE"/>
      <rect x="8" y="30" width="8" height="4" fill="#0072CE"/>
      <rect x="48" y="30" width="8" height="4" fill="#0072CE"/>
    </svg>
  ),
  
  step4: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
      {/* Check circle */}
      <circle cx="32" cy="32" r="20" fill="#4CAF50"/>
      <path d="M22 32 L28 38 L42 24" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    </svg>
  )
};