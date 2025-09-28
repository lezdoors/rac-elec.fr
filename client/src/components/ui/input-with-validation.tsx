import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, Loader2, AlertCircle } from "lucide-react";

export interface ValidationRule {
  test: (value: string) => boolean | Promise<boolean>;
  message: string;
  type?: 'error' | 'warning';
}

export interface InputWithValidationProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  debounceMs?: number;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

const InputWithValidation = React.forwardRef<HTMLInputElement, InputWithValidationProps>(
  ({ className, type, validationRules = [], showValidation = true, debounceMs = 300, onValidationChange, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");
    const [isValidating, setIsValidating] = React.useState(false);
    const [validationState, setValidationState] = React.useState<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>({ isValid: true, errors: [], warnings: [] });
    
    const timeoutRef = React.useRef<NodeJS.Timeout>();
    const abortControllerRef = React.useRef<AbortController>();

    const validateInput = React.useCallback(async (inputValue: string) => {
      if (!validationRules.length || !showValidation) {
        const newState = { isValid: true, errors: [], warnings: [] };
        setValidationState(newState);
        onValidationChange?.(true, []);
        return;
      }

      // Cancel previous validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsValidating(true);

      try {
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const rule of validationRules) {
          try {
            const result = await Promise.resolve(rule.test(inputValue));
            if (!result) {
              if (rule.type === 'warning') {
                warnings.push(rule.message);
              } else {
                errors.push(rule.message);
              }
            }
          } catch (error) {
            // If validation throws an error, treat as invalid
            errors.push(rule.message);
          }
        }

        if (!abortControllerRef.current?.signal.aborted) {
          const newState = {
            isValid: errors.length === 0,
            errors,
            warnings
          };
          setValidationState(newState);
          onValidationChange?.(newState.isValid, errors);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          const newState = { isValid: false, errors: ['Erreur de validation'], warnings: [] };
          setValidationState(newState);
          onValidationChange?.(false, ['Erreur de validation']);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsValidating(false);
        }
      }
    }, [validationRules, showValidation, onValidationChange]);

    const debouncedValidate = React.useCallback((inputValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        validateInput(inputValue);
      }, debounceMs);
    }, [validateInput, debounceMs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      props.onChange?.(e);
      
      if (showValidation && validationRules.length > 0) {
        debouncedValidate(newValue);
      }
    };

    // Validate on mount if there's an initial value
    React.useEffect(() => {
      if (value && validationRules.length > 0 && showValidation) {
        validateInput(value.toString());
      }
    }, [validateInput, validationRules.length, showValidation, value]);

    // Cleanup timeouts
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    const getValidationIcon = () => {
      if (!showValidation || validationRules.length === 0) return null;
      
      if (isValidating) {
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      }
      
      if (validationState.errors.length > 0) {
        return <X className="h-4 w-4 text-red-500" />;
      }
      
      if (validationState.warnings.length > 0) {
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      }
      
      if (value && validationState.isValid) {
        return <Check className="h-4 w-4 text-green-500" />;
      }
      
      return null;
    };

    const getInputClassName = () => {
      if (!showValidation || validationRules.length === 0) {
        return className;
      }
      
      let baseClasses = "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
      
      if (validationState.errors.length > 0) {
        baseClasses += " border-red-500 focus-visible:ring-red-500";
      } else if (validationState.warnings.length > 0) {
        baseClasses += " border-yellow-500 focus-visible:ring-yellow-500";
      } else if (value && validationState.isValid) {
        baseClasses += " border-green-500 focus-visible:ring-green-500";
      } else {
        baseClasses += " border-input focus-visible:ring-ring";
      }
      
      return cn(baseClasses, className);
    };

    return (
      <div className="relative">
        <input
          type={type}
          className={getInputClassName()}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        {showValidation && validationRules.length > 0 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
        
        {showValidation && (validationState.errors.length > 0 || validationState.warnings.length > 0) && (
          <div className="mt-1 space-y-1">
            {validationState.errors.map((error, index) => (
              <p key={`error-${index}`} className="text-sm text-red-600 flex items-center gap-1">
                <X className="h-3 w-3" />
                {error}
              </p>
            ))}
            {validationState.warnings.map((warning, index) => (
              <p key={`warning-${index}`} className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {warning}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

InputWithValidation.displayName = "InputWithValidation";

export { InputWithValidation };