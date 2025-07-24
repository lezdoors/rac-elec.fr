import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Check, 
  Download, 
  ExternalLink, 
  FileText, 
  Lock, 
  ShieldCheck 
} from "lucide-react";

interface AdminButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "export" | "secure";
  size?: "sm" | "default" | "lg" | "xl";
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  href?: string;
}

/**
 * Bouton administratif optimisé avec différentes variantes et états
 * pour une interface professionnelle de gestion
 */
export function AdminButton({
  children,
  variant = "primary",
  size = "default",
  iconPosition = "right",
  fullWidth = false,
  disabled = false,
  loading = false,
  className = "",
  onClick,
  href
}: AdminButtonProps) {
  // Définir les classes de base selon la variante
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
    success: "bg-green-600 hover:bg-green-700 text-white border-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white border-transparent",
    warning: "bg-amber-500 hover:bg-amber-600 text-white border-transparent",
    info: "bg-cyan-600 hover:bg-cyan-700 text-white border-transparent",
    export: "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent",
    secure: "bg-purple-600 hover:bg-purple-700 text-white border-transparent"
  };

  // Définir les tailles
  const sizeClasses = {
    sm: "text-xs py-1.5 px-3",
    default: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-5",
    xl: "text-lg py-3 px-6"
  };

  // Définir l'icône selon la variante
  const IconComponent = () => {
    switch (variant) {
      case "primary":
        return <ArrowRight className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      case "success":
        return <Check className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      case "export":
        return <Download className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      case "info":
        return <ExternalLink className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      case "secure":
        return <Lock className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      case "secondary":
        return <FileText className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
      default:
        return <ArrowRight className={iconPosition === "left" ? "mr-2" : "ml-2"} size={size === "sm" ? 14 : size === "xl" ? 20 : 16} />;
    }
  };

  // Styles pour l'état de chargement
  const loadingClasses = loading ? "opacity-80 cursor-wait" : "";
  
  // Styles pour la largeur
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <Button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        loadingClasses,
        "font-medium rounded shadow-sm transition-all duration-200 flex items-center justify-center gap-1",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
      )}
      
      {iconPosition === "left" && !loading && <IconComponent />}
      <span className="flex-shrink-0">{children}</span>
      {iconPosition === "right" && !loading && <IconComponent />}
    </Button>
  );
}