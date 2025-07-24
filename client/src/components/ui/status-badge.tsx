import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, XCircle, BarChart, Hourglass } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "pending" | "processing" | "completed" | "cancelled" | "verified" | "draft" | "archived";
  size?: "sm" | "md" | "lg";
  withIcon?: boolean;
  withBorder?: boolean;
  withShadow?: boolean;
  className?: string;
  label?: string;
}

/**
 * Badge de statut pour interfaces administratives
 * Affiche clairement l'état d'une demande, document ou processus
 */
export function StatusBadge({
  status,
  size = "md",
  withIcon = true,
  withBorder = true,
  withShadow = false,
  className = "",
  label
}: StatusBadgeProps) {
  // Configuration des couleurs et icônes par statut
  const statusConfig = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: <CheckCircle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Succès"
    },
    warning: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: <AlertTriangle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Attention"
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: <XCircle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Erreur"
    },
    pending: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: <Clock size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "En attente"
    },
    processing: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: <Hourglass size={size === "sm" ? 12 : size === "lg" ? 16 : 14} className="animate-pulse" />,
      defaultLabel: "En cours"
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: <CheckCircle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Terminé"
    },
    cancelled: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: <XCircle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Annulé"
    },
    verified: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      border: "border-cyan-200",
      icon: <CheckCircle size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Vérifié"
    },
    draft: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: <BarChart size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Brouillon"
    },
    archived: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      icon: <BarChart size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
      defaultLabel: "Archivé"
    }
  };

  // Configuration des tailles
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1"
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={cn(
        config.bg,
        config.text,
        sizeClasses[size],
        withBorder ? `border ${config.border}` : "",
        withShadow ? "shadow-sm" : "",
        "inline-flex items-center rounded-full font-medium",
        className
      )}
    >
      {withIcon && (
        <span className="mr-1">
          {config.icon}
        </span>
      )}
      {displayLabel}
    </span>
  );
}