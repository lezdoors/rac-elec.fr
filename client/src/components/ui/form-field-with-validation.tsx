import * as React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputWithValidation, ValidationRule } from "@/components/ui/input-with-validation";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormFieldWithValidationProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  debounceMs?: number;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormFieldWithValidation<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  validationRules = [],
  showValidation = true,
  debounceMs = 300,
  required = false,
  className,
  disabled = false,
}: FormFieldWithValidationProps<TFieldValues, TName>) {
  const [validationState, setValidationState] = React.useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  const handleValidationChange = React.useCallback((isValid: boolean, errors: string[]) => {
    setValidationState({ isValid, errors });
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            <InputWithValidation
              type={type}
              placeholder={placeholder}
              validationRules={validationRules}
              showValidation={showValidation}
              debounceMs={debounceMs}
              onValidationChange={handleValidationChange}
              disabled={disabled}
              hideErrorMessages={true}
              data-testid={`input-${name}`}
              {...field}
            />
          </FormControl>
          {description && (
            <FormDescription>
              {description}
            </FormDescription>
          )}
          
          {/* Show only ONE error message - React Hook Form errors take priority */}
          {fieldState.error ? (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          ) : (
            !validationState.isValid && validationState.errors.length > 0 && (
              <p className="text-sm font-medium text-destructive">
                {validationState.errors[0]}
              </p>
            )
          )}
        </FormItem>
      )}
    />
  );
}