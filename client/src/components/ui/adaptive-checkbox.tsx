import { Check } from "lucide-react";
import { Checkbox } from "./checkbox";
import { useIsMobile } from "@/lib/mobile-optimizations";

interface AdaptiveCheckboxProps {
  checked: boolean | undefined;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Composant adaptatif qui affiche un checkbox standard sur desktop
 * et un interrupteur personnalisé sur mobile
 */
export function AdaptiveCheckbox({
  checked,
  onCheckedChange,
  id,
  className = "",
  disabled = false,
}: AdaptiveCheckboxProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return (
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    );
  }
  
  // Version mobile avec style optimisé pour le toucher
  return (
    <div 
      id={id}
      className={`relative inline-flex items-center justify-center cursor-pointer rounded-full transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
    >
      {checked ? (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border border-gray-300 bg-white"></div>
      )}
    </div>
  );
}