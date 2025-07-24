import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function InfoTooltip({ 
  children, 
  content, 
  side = "top", 
  align = "center" 
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 bg-white border border-gray-200 shadow-md"
        >
          <div className="flex items-start gap-2 max-w-xs">
            <div className="text-sm text-gray-700">{content}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Composant pour les icônes d'aide avec tooltips d'information
export function InfoIcon({ 
  content, 
  className = "",
  side = "top",
  align = "center"
}: { 
  content: string; 
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  return (
    <InfoTooltip content={content} side={side} align={align}>
      <span className={`inline-flex items-center justify-center cursor-help ${className}`}>
        <Info className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors" />
      </span>
    </InfoTooltip>
  );
}

// Pour maintenir la compatibilité avec le code existant
export const ElectricInfoIcon = InfoIcon;
export const ElectricTooltip = InfoTooltip;