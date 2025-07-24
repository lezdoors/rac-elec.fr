import React from "react";

interface MobileToggleProps extends React.InputHTMLAttributes<HTMLDivElement> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Composant d'interrupteur mobile pour remplacer les cases à cocher
 * Optimisé pour les petits écrans tactiles
 */
export function MobileToggle({
  checked,
  onCheckedChange,
  id,
  className = "",
  disabled = false,
  ...props
}: MobileToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      id={id}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          !disabled && onCheckedChange?.(!checked);
        }
      }}
      className={`
        relative inline-flex h-6 w-11 cursor-pointer rounded-full 
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-primary ${checked ? "bg-primary" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}
      `}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full 
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </div>
  );
}