import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useIsMobile, getMobileClasses, MOBILE_UX_IMPROVEMENTS } from "@/lib/mobile-optimizations";
import { AnimatedInput } from "@/components/ui/animated-form";
import { cn } from "@/lib/utils";
import { Info, Eye, EyeOff, Calendar, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface ResponsiveFormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  tooltip?: string;
}

/**
 * Champ de formulaire réactif qui s'adapte aux appareils mobiles
 */
export function ResponsiveFormField({
  label,
  htmlFor,
  children,
  description,
  error,
  required = false,
  className = "",
  tooltip
}: ResponsiveFormFieldProps) {
  const isMobile = useIsMobile();
  const { forms } = MOBILE_UX_IMPROVEMENTS;
  
  // Détermine le layout du formulaire basé sur le mode mobile
  const formLayout = isMobile || forms.stackLabels
    ? "flex flex-col space-y-2"
    : "grid grid-cols-12 gap-4 items-start";
  
  // Classes pour les éléments du formulaire
  const labelClasses = isMobile || forms.stackLabels
    ? "block text-sm font-medium"
    : "col-span-3 text-sm font-medium pt-2.5";
  
  const inputClasses = isMobile || forms.stackLabels
    ? "w-full"
    : "col-span-9";
  
  return (
    <div className={cn(formLayout, "mb-6", className)}>
      <div className={cn(labelClasses, "flex items-center gap-1")}>
        <Label htmlFor={htmlFor} className="cursor-pointer">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {tooltip && !isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {tooltip && isMobile && (
          <Popover>
            <PopoverTrigger asChild>
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </PopoverTrigger>
            <PopoverContent className="w-72 text-xs">
              {tooltip}
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      <div className={inputClasses}>
        {children}
        
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  isValid?: boolean;
  isTyping?: boolean;
  icon?: ReactNode;
  type?: string;
}

/**
 * Champ de saisie texte optimisé pour mobile
 */
export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    tooltip, 
    isValid, 
    isTyping,
    icon,
    type = "text",
    className = "",
    ...props 
  }, ref) => {
    const isMobile = useIsMobile();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    
    // Ajouter l'auto-completion suivant le type d'input
    const getAutoComplete = () => {
      if (props.autoComplete) return props.autoComplete;
      
      switch (props.name) {
        case "email": return "email";
        case "name": 
        case "fullName": return "name";
        case "firstName": return "given-name";
        case "lastName": return "family-name";
        case "phone": 
        case "phoneNumber": 
        case "tel": return "tel";
        case "address": return "street-address";
        case "city": return "address-level2";
        case "zipCode": 
        case "postalCode": return "postal-code";
        case "username": return "username";
        case "password": return "current-password";
        case "newPassword": return "new-password";
        default: return undefined;
      }
    };
    
    // Type d'input actuel (pour les champs password)
    const inputType = type === "password" && passwordVisible ? "text" : type;
    
    return (
      <ResponsiveFormField
        label={label}
        htmlFor={props.id || props.name || ""}
        description={description}
        error={error}
        required={required}
        tooltip={tooltip}
        className={className}
      >
        <AnimatedInput isValid={isValid} isInvalid={!!error} isTyping={isTyping} className="relative">
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {icon}
              </div>
            )}
            
            <Input
              ref={ref}
              id={props.id || props.name || ""}
              type={inputType}
              className={cn(
                isMobile && "h-12 text-base",
                icon && "pl-10",
                type === "password" && "pr-10",
                isInputFocused && "ring-2 ring-primary ring-offset-1 border-primary",
                error ? "border-red-500 pr-10" : "",
              )}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              autoComplete={getAutoComplete()}
              {...props}
            />
            
            {type === "password" && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
                tabIndex={-1}
              >
                {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            {type === "date" && (
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
            )}
            
            {type === "search" && (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
            )}
          </div>
        </AnimatedInput>
      </ResponsiveFormField>
    );
  }
);

ResponsiveInput.displayName = "ResponsiveInput";

interface ResponsiveSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isValid?: boolean;
  placeholder?: string;
}

/**
 * Sélecteur optimisé pour mobile
 */
export function ResponsiveSelect({
  label,
  description,
  error,
  required,
  tooltip,
  options,
  onChange,
  value,
  isValid,
  placeholder = "Sélectionner...",
  className = "",
  ...props
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile();
  const { forms } = MOBILE_UX_IMPROVEMENTS;
  
  // Utiliser des sélecteurs natifs sur mobile
  if (isMobile && forms.useNativeSelects) {
    return (
      <ResponsiveFormField
        label={label}
        htmlFor={props.id || props.name || ""}
        description={description}
        error={error}
        required={required}
        tooltip={tooltip}
        className={className}
      >
        <select
          id={props.id || props.name || ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-12 text-base px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
            error ? "border-red-500" : ""
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </ResponsiveFormField>
    );
  }
  
  return (
    <ResponsiveFormField
      label={label}
      htmlFor={props.id || props.name || ""}
      description={description}
      error={error}
      required={required}
      tooltip={tooltip}
      className={className}
    >
      <AnimatedInput isValid={isValid} isInvalid={!!error}>
        <Select
          value={value as string}
          onValueChange={onChange}
          {...props}
        >
          <SelectTrigger 
            id={props.id || props.name || ""}
            className={cn(
              isMobile && "h-12 text-base",
              error ? "border-red-500" : ""
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AnimatedInput>
    </ResponsiveFormField>
  );
}

interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  isValid?: boolean;
  isTyping?: boolean;
}

/**
 * Zone de texte multiligne optimisée pour mobile
 */
export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ 
    label, 
    description, 
    error, 
    required, 
    tooltip, 
    isValid, 
    isTyping,
    className = "",
    ...props 
  }, ref) => {
    const isMobile = useIsMobile();
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
    
    return (
      <ResponsiveFormField
        label={label}
        htmlFor={props.id || props.name || ""}
        description={description}
        error={error}
        required={required}
        tooltip={tooltip}
        className={className}
      >
        <AnimatedInput isValid={isValid} isInvalid={!!error} isTyping={isTyping}>
          <Textarea
            ref={ref}
            id={props.id || props.name || ""}
            className={cn(
              isMobile && "text-base min-h-[100px]",
              isTextareaFocused && "ring-2 ring-primary ring-offset-1 border-primary",
              error ? "border-red-500" : ""
            )}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            {...props}
          />
        </AnimatedInput>
      </ResponsiveFormField>
    );
  }
);

ResponsiveTextarea.displayName = "ResponsiveTextarea";

interface ResponsiveRadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Groupe de boutons radio optimisé pour mobile
 */
export function ResponsiveRadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  description,
  error,
  required,
  tooltip,
  orientation = "vertical",
  className = "",
}: ResponsiveRadioGroupProps) {
  const isMobile = useIsMobile();
  
  return (
    <ResponsiveFormField
      label={label}
      htmlFor={name}
      description={description}
      error={error}
      required={required}
      tooltip={tooltip}
      className={className}
    >
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={cn(
          orientation === "horizontal" ? "flex space-x-4" : "flex flex-col space-y-3",
          isMobile && orientation === "horizontal" && "flex-wrap gap-y-2"
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              id={`${name}-${option.value}`}
              value={option.value}
              className={isMobile ? "h-5 w-5" : ""}
            />
            <Label
              htmlFor={`${name}-${option.value}`}
              className={cn(
                "cursor-pointer",
                isMobile && "text-base"
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </ResponsiveFormField>
  );
}

interface ResponsiveCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

/**
 * Case à cocher optimisée pour mobile
 */
export function ResponsiveCheckbox({
  label,
  name,
  checked,
  onChange,
  description,
  error,
  required,
  tooltip,
  className = "",
}: ResponsiveCheckboxProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("flex items-start space-x-2", className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        className={isMobile ? "h-5 w-5 mt-0.5" : "mt-1"}
      />
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <Label
            htmlFor={name}
            className={cn(
              "cursor-pointer font-medium",
              isMobile && "text-base"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}

interface ResponsiveSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
  tooltip?: string;
  className?: string;
}

/**
 * Interrupteur optimisé pour mobile
 */
export function ResponsiveSwitch({
  label,
  name,
  checked,
  onChange,
  description,
  error,
  tooltip,
  className = "",
}: ResponsiveSwitchProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      <Switch
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        className={isMobile ? "mt-0.5 scale-110" : "mt-1"}
      />
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <Label
            htmlFor={name}
            className={cn(
              "cursor-pointer font-medium",
              isMobile && "text-base"
            )}
          >
            {label}
          </Label>
          
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}