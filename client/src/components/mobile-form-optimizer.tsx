import { useEffect } from 'react';

export function MobileFormOptimizer() {
  useEffect(() => {
    // Mobile keyboard optimization
    const optimizeKeyboards = () => {
      const inputs = document.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        const inputElement = input as HTMLInputElement;
        
        // Set appropriate keyboard types for mobile
        if (inputElement.type === 'email' || inputElement.name?.includes('email')) {
          inputElement.setAttribute('inputmode', 'email');
          inputElement.setAttribute('autocomplete', 'email');
        }
        
        if (inputElement.type === 'tel' || inputElement.name?.includes('phone') || inputElement.name?.includes('telephone')) {
          inputElement.setAttribute('inputmode', 'tel');
          inputElement.setAttribute('autocomplete', 'tel');
        }
        
        if (inputElement.name?.includes('postal') || inputElement.name?.includes('zip')) {
          inputElement.setAttribute('inputmode', 'numeric');
          inputElement.setAttribute('autocomplete', 'postal-code');
        }
        
        if (inputElement.name?.includes('address')) {
          inputElement.setAttribute('autocomplete', 'street-address');
        }
        
        if (inputElement.name?.includes('city') || inputElement.name?.includes('ville')) {
          inputElement.setAttribute('autocomplete', 'address-level2');
        }
        
        if (inputElement.name?.includes('firstname') || inputElement.name?.includes('prenom')) {
          inputElement.setAttribute('autocomplete', 'given-name');
        }
        
        if (inputElement.name?.includes('lastname') || inputElement.name?.includes('nom')) {
          inputElement.setAttribute('autocomplete', 'family-name');
        }
        
        // Prevent zoom on iOS when focusing inputs
        if (inputElement.style.fontSize !== '16px') {
          inputElement.style.fontSize = '16px';
        }
      });
    };

    // Enhanced mobile form validation
    const enhanceMobileValidation = () => {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
          const inputElement = input as HTMLInputElement;
          
          // Create or find error container
          let errorContainer = inputElement.parentElement?.querySelector('.mobile-error');
          if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'mobile-error text-red-500 text-sm mt-1 hidden';
            inputElement.parentElement?.appendChild(errorContainer);
          }
          
          // Real-time validation for mobile
          const validateInput = () => {
            const isValid = inputElement.checkValidity();
            const errorElement = errorContainer as HTMLElement;
            
            if (!isValid) {
              inputElement.classList.add('border-red-500', 'bg-red-50');
              inputElement.classList.remove('border-green-500', 'bg-green-50');
              
              // Show specific error messages
              if (inputElement.validity.valueMissing) {
                errorElement.textContent = 'Ce champ est obligatoire';
              } else if (inputElement.validity.typeMismatch) {
                if (inputElement.type === 'email') {
                  errorElement.textContent = 'Format d\'email invalide';
                } else if (inputElement.type === 'tel') {
                  errorElement.textContent = 'Numéro de téléphone invalide';
                }
              } else if (inputElement.validity.patternMismatch) {
                errorElement.textContent = 'Format invalide';
              }
              
              errorElement.classList.remove('hidden');
            } else {
              inputElement.classList.remove('border-red-500', 'bg-red-50');
              inputElement.classList.add('border-green-500', 'bg-green-50');
              errorElement.classList.add('hidden');
            }
          };
          
          // Validate on blur for better mobile UX
          inputElement.addEventListener('blur', validateInput);
          
          // Also validate on input for immediate feedback
          inputElement.addEventListener('input', () => {
            if (inputElement.value.length > 0) {
              validateInput();
            }
          });
        });
      });
    };

    // Mobile layout optimization
    const optimizeMobileLayout = () => {
      // Ensure touch targets are at least 44px
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      
      interactiveElements.forEach(element => {
        const el = element as HTMLElement;
        const styles = window.getComputedStyle(el);
        const height = parseInt(styles.height);
        const width = parseInt(styles.width);
        
        if (height < 44 && window.innerWidth <= 768) {
          el.style.minHeight = '44px';
        }
        
        if (width < 44 && window.innerWidth <= 768) {
          el.style.minWidth = '44px';
        }
      });
      
      // Add proper spacing between form elements on mobile
      const formGroups = document.querySelectorAll('.form-group, .form-field');
      formGroups.forEach(group => {
        if (window.innerWidth <= 768) {
          (group as HTMLElement).style.marginBottom = '1.5rem';
        }
      });
    };

    // Performance optimization for mobile
    const optimizeMobilePerformance = () => {
      // Debounce form validation
      let validationTimeout: NodeJS.Timeout;
      
      const debouncedValidation = (callback: () => void) => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(callback, 300);
      };
      
      // Optimize scroll events for mobile
      let scrollTimeout: NodeJS.Timeout;
      const optimizeScrollEvents = () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
          // Your scroll logic here
          scrollTimeout = null as any;
        }, 16); // ~60fps
      };
      
      if (window.innerWidth <= 768) {
        window.addEventListener('scroll', optimizeScrollEvents, { passive: true });
      }
    };

    // Initialize all optimizations
    const initializeMobileOptimizations = () => {
      optimizeKeyboards();
      enhanceMobileValidation();
      optimizeMobileLayout();
      optimizeMobilePerformance();
    };

    // Run immediately and on window resize
    initializeMobileOptimizations();
    
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        initializeMobileOptimizations();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
  }, []);

  return null;
}