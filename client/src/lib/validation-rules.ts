import { ValidationRule } from "@/components/ui/input-with-validation";

// Email validation with real-time feedback
export const emailValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true; // Allow empty for optional fields
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: "Format d'email invalide",
    type: 'error'
  },
  {
    test: (value: string) => {
      if (!value) return true;
      const commonDomains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com', 'orange.fr', 'wanadoo.fr', 'free.fr', 'laposte.net'];
      const domain = value.split('@')[1];
      return commonDomains.includes(domain) || true; // Don't block, just warn
    },
    message: "Vérifiez que le domaine email est correct",
    type: 'warning'
  }
];

// Phone validation for French numbers - Single comprehensive rule
export const phoneValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      // Remove spaces, dots, and dashes
      const cleaned = value.replace(/[\s\.\-]/g, '');
      // French format: 10 digits starting with 0, or +33 format (12 chars)
      const isValidLength = cleaned.length === 10 || cleaned.length === 12;
      const isValidFormat = /^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/.test(cleaned);
      return isValidLength && isValidFormat;
    },
    message: "Format invalide (ex: 06 12 34 56 78)",
    type: 'error'
  }
];

// Postal code validation for France
export const postalCodeValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      return /^[0-9]{5}$/.test(value);
    },
    message: "Code postal français invalide (5 chiffres)",
    type: 'error'
  },
  {
    test: async (value: string) => {
      if (!value || value.length !== 5) return true;
      
      try {
        // Validate against official French postal codes API
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&fields=nom&format=json&geometry=centre`);
        const data = await response.json();
        return data && data.length > 0;
      } catch {
        // If API fails, don't block the user
        return true;
      }
    },
    message: "Code postal non reconnu",
    type: 'warning'
  }
];

// Name validation (French names)
export const nameValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      return value.trim().length >= 2;
    },
    message: "Le nom doit contenir au moins 2 caractères",
    type: 'error'
  },
  {
    test: (value: string) => {
      if (!value) return true;
      // Allow French names with accents, hyphens, apostrophes
      return /^[a-zA-ZÀ-ÿ\s\-']+$/.test(value);
    },
    message: "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes",
    type: 'error'
  }
];

// SIREN validation for companies
export const sirenValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      const cleaned = value.replace(/\s/g, '');
      return /^[0-9]{9}$/.test(cleaned);
    },
    message: "Le SIREN doit contenir 9 chiffres",
    type: 'error'
  },
  {
    test: (value: string) => {
      if (!value) return true;
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length !== 9) return false;
      
      // Luhn algorithm for SIREN validation
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let digit = parseInt(cleaned[i]);
        if (i % 2 === 1) {
          digit *= 2;
          if (digit > 9) {
            digit = Math.floor(digit / 10) + (digit % 10);
          }
        }
        sum += digit;
      }
      return sum % 10 === 0;
    },
    message: "Numéro SIREN invalide",
    type: 'error'
  }
];

// Address validation
export const addressValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      return value.trim().length >= 5;
    },
    message: "L'adresse doit contenir au moins 5 caractères",
    type: 'error'
  },
  {
    test: (value: string) => {
      if (!value) return true;
      // Basic check for number at the beginning
      return /^\d+/.test(value.trim());
    },
    message: "L'adresse devrait commencer par un numéro",
    type: 'warning'
  }
];

// Power validation for electrical connections
export const powerValidationRules: ValidationRule[] = [
  {
    test: (value: string) => {
      if (!value) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    message: "La puissance doit être un nombre positif",
    type: 'error'
  },
  {
    test: (value: string) => {
      if (!value) return true;
      const num = parseFloat(value);
      return num >= 3 && num <= 36; // Typical power range for French connections
    },
    message: "La puissance standard est entre 3 et 36 kVA",
    type: 'warning'
  }
];

// Generic required field validation
export const requiredValidationRule: ValidationRule = {
  test: (value: string) => {
    return value.trim().length > 0;
  },
  message: "Ce champ est obligatoire",
  type: 'error'
};

// Combine validation rules utility
export const createValidationRules = (
  rules: ValidationRule[][],
  isRequired: boolean = false
): ValidationRule[] => {
  const combinedRules = rules.flat();
  
  if (isRequired) {
    return [requiredValidationRule, ...combinedRules];
  }
  
  return combinedRules;
};