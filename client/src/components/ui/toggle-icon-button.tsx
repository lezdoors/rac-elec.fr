import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToggleIconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  colorScheme?: "blue" | "green" | "default"
  size?: "sm" | "md" 
  disabled?: boolean
}

export function ToggleIconButton({
  checked,
  onCheckedChange,
  colorScheme = "default",
  size = "md",
  disabled = false,
  className,
  ...props
}: ToggleIconButtonProps) {
  const getColorClasses = () => {
    if (disabled) return "bg-gray-100 border-gray-300 text-gray-400";
    
    if (checked) {
      switch (colorScheme) {
        case "blue": return "bg-blue-100 text-blue-600 border-blue-300";
        case "green": return "bg-green-100 text-green-600 border-green-300";
        default: return "bg-primary-100 text-primary-600 border-primary-300";
      }
    } else {
      return "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:border-gray-300";
    }
  };

  const getSizeClasses = () => {
    return size === "sm" 
      ? "h-6 w-6 min-w-6" 
      : "h-7 w-7 min-w-7";
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative flex items-center justify-center rounded-md border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation active:scale-95 cursor-pointer",
        getSizeClasses(),
        getColorClasses(),
        disabled && "cursor-not-allowed opacity-70",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {checked ? (
        <Check className={size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} strokeWidth={3} />
      ) : (
        <X className={size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} strokeWidth={3} />
      )}
    </button>
  );
}