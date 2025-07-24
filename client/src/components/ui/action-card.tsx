import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  ChevronRight, 
  Clock, 
  FileText, 
  ShieldCheck, 
  User,
  Zap
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { AdminButton } from "./admin-button";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: "success" | "warning" | "error" | "pending" | "processing" | "completed" | "cancelled" | "verified" | "draft" | "archived";
  actions?: Array<{
    label: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "export" | "secure";
    disabled?: boolean;
  }>;
  metadata?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
  }>;
  elevation?: "none" | "low" | "medium" | "high";
  variant?: "default" | "outlined" | "filled";
  highlight?: boolean;
  className?: string;
}

/**
 * Carte d'action administrative pour afficher les informations et actions 
 * relatives à une demande ou un processus
 */
export function ActionCard({
  title,
  description,
  icon = <FileText className="h-5 w-5 text-blue-600" />,
  status,
  actions = [],
  metadata = [],
  elevation = "medium",
  variant = "default",
  highlight = false,
  className = ""
}: ActionCardProps) {
  // Classes pour les différents niveaux d'élévation
  const elevationClasses = {
    none: "",
    low: "shadow-sm",
    medium: "shadow",
    high: "shadow-md"
  };

  // Classes pour les différentes variantes
  const variantClasses = {
    default: "bg-white",
    outlined: "bg-white border border-gray-200",
    filled: "bg-gray-50"
  };

  // Classes pour le surlignage
  const highlightClasses = highlight 
    ? "border-l-4 border-l-blue-600 pl-4" 
    : "";

  return (
    <div 
      className={cn(
        elevationClasses[elevation],
        variantClasses[variant],
        highlightClasses,
        "rounded-lg p-4",
        className
      )}
    >
      {/* En-tête avec icône, titre et statut */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        
        {status && (
          <StatusBadge status={status} size="md" />
        )}
      </div>
      
      {/* Métadonnées */}
      {metadata.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mt-3 text-sm text-gray-600">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center">
              {item.icon ? (
                <span className="mr-1.5 text-gray-500">{item.icon}</span>
              ) : (
                <span className="mr-1.5 text-gray-500">
                  {index === 0 ? <User size={14} /> : 
                   index === 1 ? <Clock size={14} /> : 
                   index === 2 ? <BarChart size={14} /> : 
                   <FileText size={14} />}
                </span>
              )}
              <span className="text-gray-600 truncate">
                <span className="font-medium">{item.label}:</span> {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          {actions.map((action, index) => (
            <AdminButton
              key={index}
              variant={action.variant || (index === 0 ? "primary" : "secondary")}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </AdminButton>
          ))}
        </div>
      )}
    </div>
  );
}