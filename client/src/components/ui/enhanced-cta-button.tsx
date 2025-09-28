import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

interface EnhancedCtaButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showIcon?: boolean;
  pulseEffect?: boolean;
  onClick?: () => void;
}

export function EnhancedCtaButton({ 
  href = "/raccordement-enedis#formulaire-raccordement",
  children, 
  variant = "primary",
  size = "lg",
  className = "",
  showIcon = true,
  pulseEffect = false,
  onClick
}: EnhancedCtaButtonProps) {
  const baseClasses = `
    font-semibold transition-all duration-300 transform
    focus:outline-none focus:ring-4 focus:ring-blue-300/50
    active:scale-95 relative overflow-hidden group
    ${pulseEffect ? 'animate-pulse-glow' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 
      hover:from-blue-700 hover:via-blue-800 hover:to-blue-900
      text-white shadow-lg hover:shadow-xl
      border-2 border-blue-600 hover:border-blue-700
      hover:scale-[1.02] hover:-translate-y-0.5
      before:absolute before:inset-0 before:bg-gradient-to-r 
      before:from-white/20 before:to-transparent before:opacity-0 
      before:hover:opacity-100 before:transition-opacity before:duration-300
    `,
    secondary: `
      bg-white text-blue-700 border-2 border-blue-300
      hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800
      shadow-md hover:shadow-lg
      hover:scale-[1.01] hover:-translate-y-0.5
    `
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg", 
    lg: "px-8 py-4 text-lg rounded-xl",
    xl: "px-10 py-5 text-xl rounded-xl"
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  const ButtonContent = () => (
    <span className="relative z-10 flex items-center gap-2">
      {variant === "primary" && <Zap className="w-5 h-5" />}
      {children}
      {showIcon && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />}
    </span>
  );

  if (href) {
    return (
      <Link href={href}>
        <button className={buttonClasses} onClick={onClick}>
          <ButtonContent />
        </button>
      </Link>
    );
  }

  return (
    <button className={buttonClasses} onClick={onClick}>
      <ButtonContent />
    </button>
  );
}

// Sticky mobile CTA component
export function StickyMobileCta() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <EnhancedCtaButton 
        size="lg"
        className="w-full justify-center shadow-2xl animate-bounce-subtle"
        pulseEffect={true}
      >
        Commencer ma demande
      </EnhancedCtaButton>
    </div>
  );
}