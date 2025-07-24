/**
 * Composants de formulaires optimisés pour mobile avec design administratif
 * Interface professionnelle, responsive et accessible
 */

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileSectionHeader } from './professional-mobile-titles';
import { CheckCircle, AlertCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileFormFieldProps {
  label: string;
  children: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/**
 * Champ de formulaire professionnel optimisé pour mobile
 * Design administratif avec validation visuelle
 */
export function MobileFormField({
  label,
  children,
  description,
  error,
  required = false,
  className,
}: MobileFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(
        'text-sm font-medium text-slate-700 dark:text-slate-300',
        'flex items-center gap-1'
      )}>
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </Label>
      
      <div className="relative">
        {children}
        
        {/* Indicateur d'erreur */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {/* Description ou message d'erreur */}
      {(description || error) && (
        <p className={cn(
          'text-xs',
          error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
        )}>
          {error || description}
        </p>
      )}
    </div>
  );
}

/**
 * Input optimisé pour mobile avec design professionnel
 */
interface MobileInputProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MobileInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  description,
  required = false,
  disabled = false,
  className,
}: MobileInputProps) {
  return (
    <MobileFormField
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          'h-11 sm:h-10', // Hauteur optimisée pour mobile
          'text-base sm:text-sm', // Taille de texte pour éviter le zoom sur iOS
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
        )}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
    </MobileFormField>
  );
}

/**
 * Select optimisé pour mobile avec design administratif
 */
interface MobileSelectProps {
  label: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MobileSelect({
  label,
  placeholder = 'Sélectionnez une option',
  value,
  onValueChange,
  options,
  error,
  description,
  required = false,
  disabled = false,
  className,
}: MobileSelectProps) {
  return (
    <MobileFormField
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(
          'h-11 sm:h-10',
          'text-base sm:text-sm',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
        )}>
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
    </MobileFormField>
  );
}

/**
 * Textarea optimisé pour mobile
 */
interface MobileTextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function MobileTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  description,
  required = false,
  disabled = false,
  maxLength,
  className,
}: MobileTextareaProps) {
  return (
    <MobileFormField
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            'text-base sm:text-sm resize-none',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
        />
        
        {/* Compteur de caractères */}
        {maxLength && value && (
          <div className="absolute bottom-2 right-2 text-xs text-slate-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </MobileFormField>
  );
}

/**
 * Formulaire multi-étapes optimisé pour mobile
 * Design professionnel avec navigation intuitive
 */
interface MobileStepFormProps {
  steps: {
    title: string;
    description?: string;
    content: ReactNode;
  }[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function MobileStepForm({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  className,
}: MobileStepFormProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      onSubmit?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Indicateur de progression */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Étape {currentStep + 1} sur {steps.length}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* En-tête de l'étape actuelle */}
      <MobileSectionHeader
        title={steps[currentStep]?.title || ''}
        description={steps[currentStep]?.description}
        showDivider={false}
      />
      
      {/* Contenu de l'étape */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        {steps[currentStep]?.content}
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isSubmitting}
          className="order-2 sm:order-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="order-1 sm:order-2"
        >
          {isSubmitting ? (
            'Traitement...'
          ) : isLastStep ? (
            'Finaliser'
          ) : (
            <>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Section de formulaire avec validation visuelle
 */
interface MobileFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  isValid?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function MobileFormSection({
  title,
  description,
  children,
  isValid,
  isCompleted,
  className,
}: MobileFormSectionProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6',
      'space-y-4',
      className
    )}>
      {/* En-tête avec statut */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isValid === false ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Info className="h-5 w-5 text-blue-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Contenu de la section */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Bouton d'action principal optimisé pour mobile
 */
interface MobileActionButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export function MobileActionButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
}: MobileActionButtonProps) {
  return (
    <Button
      type={type}
      variant={variant === 'primary' ? 'default' : variant === 'secondary' ? 'outline' : variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        {
          'w-full': fullWidth,
          'h-12 text-base font-medium': size === 'lg',
          'h-10 text-sm font-medium': size === 'md',
          'h-8 text-sm': size === 'sm',
        },
        className
      )}
    >
      {loading ? 'Chargement...' : children}
    </Button>
  );
}