import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ReactNode, useState } from "react";
import { Control, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

// Composant d'entrée texte amélioré avec accessibilité et performance
export const EnhancedInput = ({ 
  placeholder, 
  className,
  ...rest 
}: React.ComponentPropsWithoutRef<typeof Input>) => {
  return (
    <Input 
      className={cn(
        "premium-input",
        "transition-all duration-200 ease-in-out",
        "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
        "hover:border-gray-400",
        "will-change-auto",
        className
      )}
      placeholder={placeholder} 
      {...rest} 
    />
  );
};

// Composant de section de formulaire amélioré avec accessibilité
export const FormSection = ({ 
  children, 
  title,
  icon,
  className
}: { 
  children: ReactNode;
  title?: string; 
  icon?: ReactNode;
  className?: string;
}) => {
  return (
    <section 
      className={cn(
        "form-section", 
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6",
        "transition-shadow duration-200 hover:shadow-md",
        className
      )}
      aria-labelledby={title ? "form-section-title" : undefined}
    >
      {title && (
        <header 
          id="form-section-title"
          className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100"
        >
          {icon && (
            <div className="text-blue-600" aria-hidden="true">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </header>
      )}
      {children}
    </section>
  );
};

// Grille de formulaire améliorée avec responsive design
export const FormGrid = ({ 
  children, 
  columns = 1,
  gap = "md",
  className
}: { 
  children: ReactNode;
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8"
  };

  return (
    <div className={cn(
      "grid",
      gridClasses[columns],
      gapClasses[gap],
      "w-full",
      className
    )}>
      {children}
    </div>
  );
};

// Option de carte améliorée pour les sélections avec accessibilité complète
export const CardOption = ({ 
  selected, 
  onClick, 
  title, 
  description, 
  icon,
  value,
  name,
  className
}: { 
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon: ReactNode;
  value?: string;
  name?: string;
  className?: string;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "transform hover:scale-[1.02] active:scale-[0.98]",
        selected 
          ? "border-blue-500 bg-blue-50 shadow-sm" 
          : "border-gray-200 bg-white hover:border-gray-300",
        className
      )}
      onClick={onClick}
      aria-pressed={selected}
      aria-describedby={`${value}-description`}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm mb-1",
            selected ? "text-blue-900" : "text-gray-900"
          )}>
            {title}
          </h4>
          <p 
            id={`${value}-description`}
            className={cn(
              "text-xs leading-relaxed",
              selected ? "text-blue-700" : "text-gray-600"
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

// Composant de champ de formulaire avancé avec validation en temps réel
export const ValidationFormField = ({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  required = false,
  className,
  icon,
  validationRules,
  ...props
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "email" | "tel" | "password" | "number";
  required?: boolean;
  className?: string;
  icon?: ReactNode;
  validationRules?: object;
} & Omit<React.ComponentPropsWithoutRef<typeof Input>, "name">) => {
  const [focused, setFocused] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      rules={{
        required: required ? `${label} est requis` : false,
        ...validationRules
      }}
      render={({ field, fieldState }) => (
        <FormItem className={cn("space-y-2", className)}>
          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {icon && <span className="text-blue-600">{icon}</span>}
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                {...props}
                type={type}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={cn(
                  "transition-all duration-200",
                  fieldState.error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : fieldState.isDirty && !fieldState.error
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : "focus:border-blue-500 focus:ring-blue-500/20",
                  focused && "ring-2",
                  "pr-10"
                )}
              />
              
              {/* Icône de statut de validation */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {fieldState.error ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : fieldState.isDirty && !fieldState.error ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
            </div>
          </FormControl>

          {description && (
            <FormDescription className="flex items-center gap-1 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              {description}
            </FormDescription>
          )}
          
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

// Champ de formulaire simple avec render prop
export function SimpleFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required = false,
  children,
  className
}: {
  control: Control<T>;
  name: any;
  label: string;
  description?: string;
  required?: boolean;
  children: (field: any) => ReactNode;
  className?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="premium-label">
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            {children(field)}
          </FormControl>
          {description && <FormDescription className="premium-helper">{description}</FormDescription>}
          <FormMessage className="premium-error" />
        </FormItem>
      )}
    />
  );
}