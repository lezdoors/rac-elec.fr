import { useEffect, useRef } from 'react';

export function EnhancedMobileFormOptimizer() {
  const listenerCleanupRef = useRef<Array<() => void>>([]);
  const processedElementsRef = useRef(new WeakSet());

  useEffect(() => {
    // Enhanced mobile form optimization with proper cleanup
    const optimizeFormInputs = () => {
      // Scope to form containers instead of document-wide to avoid unintended targets
      const formContainers = document.querySelectorAll('form, [data-form-container]');
      
      formContainers.forEach(container => {
        // Get all form inputs within this container
        const inputs = container.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input) => {
          const inputElement = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          
          // Skip if already processed to avoid duplicate listeners
          if (processedElementsRef.current.has(inputElement)) {
            return;
          }
          processedElementsRef.current.add(inputElement);
          
          // CWV OPTIMIZATION: Ensure minimum touch targets (48px) for better accessibility
          if (!inputElement.style.minHeight || parseInt(inputElement.style.minHeight) < 48) {
            inputElement.style.minHeight = '48px';
          }
          
          // Prevent zoom on iOS while maintaining readability
          const computedStyle = window.getComputedStyle(inputElement);
          if (parseInt(computedStyle.fontSize) < 16) {
            inputElement.style.fontSize = '16px';
          }
          
          // Add missing autocomplete attributes based on input names and types
          if (!inputElement.getAttribute('autocomplete')) {
            const name = inputElement.name || inputElement.id;
            const type = inputElement.getAttribute('type');
            
            // Add autocomplete based on field names
            if (name) {
              const autocompleteMap: { [key: string]: string } = {
                'nom': 'family-name',
                'prenom': 'given-name',
                'email': 'email',
                'phone': 'tel',
                'telephone': 'tel',
                'adresse': 'street-address',
                'adresseProjet': 'street-address',
                'adresseFacturation': 'billing street-address',
                'codePostal': 'postal-code',
                'codePostalProjet': 'postal-code',
                'ville': 'address-level2',
                'villeProjet': 'address-level2',
                'raisonSociale': 'organization',
                'nomCollectivite': 'organization',
                'complementAdresse': 'address-line2',
                'complementAdresseProjet': 'address-line2'
              };
              
              if (autocompleteMap[name]) {
                inputElement.setAttribute('autocomplete', autocompleteMap[name]);
              }
            }
            
            // Add autocomplete based on input types
            if (type === 'email' && !inputElement.getAttribute('autocomplete')) {
              inputElement.setAttribute('autocomplete', 'email');
            }
            if (type === 'tel' && !inputElement.getAttribute('autocomplete')) {
              inputElement.setAttribute('autocomplete', 'tel');
            }
          }
          
          // Add proper input modes for better mobile keyboards
          // Fix: Use 'inputmode' (lowercase) as it's the correct HTML attribute
          if (!inputElement.getAttribute('inputmode')) {
            const type = inputElement.getAttribute('type');
            const name = inputElement.name || inputElement.id;
            
            if (type === 'email' || (name && name.includes('email'))) {
              inputElement.setAttribute('inputmode', 'email');
            } else if (type === 'tel' || (name && (name.includes('phone') || name.includes('telephone')))) {
              inputElement.setAttribute('inputmode', 'tel');
            } else if (name && (name.includes('codePostal') || name.includes('postal'))) {
              inputElement.setAttribute('inputmode', 'numeric');
              inputElement.setAttribute('pattern', '[0-9]*');
            }
          }
          
          // Add data-testid for interactive elements if missing
          if (!inputElement.getAttribute('data-testid') && inputElement.name) {
            inputElement.setAttribute('data-testid', `input-${inputElement.name}`);
          }
          
          // Add touch-manipulation for better touch response and INP optimization
          if (!inputElement.style.touchAction) {
            inputElement.style.touchAction = 'manipulation';
          }
          
          // CWV OPTIMIZATION: Optimize for faster input response
          if (!inputElement.style.userSelect) {
            inputElement.style.userSelect = 'text';
          }
          
          // Enhanced validation feedback (non-conflicting with react-hook-form)
          const blurHandler = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const value = target.value.trim();
            
            // Only provide visual feedback if react-hook-form isn't already handling validation
            // Check if there's already a validation message from RHF
            const hasRHFValidation = target.closest('[data-invalid]') || 
                                   target.parentElement?.querySelector('[role="alert"]') ||
                                   target.parentElement?.querySelector('.text-destructive');
            
            if (!hasRHFValidation) {
              // Gentle validation feedback without conflicting styles
              if (target.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  target.classList.add('border-amber-300');
                  target.classList.remove('border-green-300');
                } else {
                  target.classList.add('border-green-300');
                  target.classList.remove('border-amber-300');
                }
              }
              
              if (target.type === 'tel' && value) {
                const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
                if (!phoneRegex.test(value)) {
                  target.classList.add('border-amber-300');
                  target.classList.remove('border-green-300');
                } else {
                  target.classList.add('border-green-300');
                  target.classList.remove('border-amber-300');
                }
              }
              
              if ((target.name === 'codePostal' || target.name === 'codePostalProjet') && value) {
                const postalRegex = /^\d{5}$/;
                if (!postalRegex.test(value)) {
                  target.classList.add('border-amber-300');
                  target.classList.remove('border-green-300');
                } else {
                  target.classList.add('border-green-300');
                  target.classList.remove('border-amber-300');
                }
              }
            }
          };
          
          // Clear gentle validation on focus
          const focusHandler = (e: Event) => {
            const target = e.target as HTMLInputElement;
            target.classList.remove('border-amber-300', 'border-green-300');
          };
          
          inputElement.addEventListener('blur', blurHandler);
          inputElement.addEventListener('focus', focusHandler);
          
          // Store cleanup functions
          listenerCleanupRef.current.push(() => {
            inputElement.removeEventListener('blur', blurHandler);
            inputElement.removeEventListener('focus', focusHandler);
          });
        });
        
        // Optimize buttons for mobile touch
        const buttons = container.querySelectorAll('button, [role="button"]');
        buttons.forEach((button) => {
          const buttonElement = button as HTMLButtonElement;
          
          // Skip if already processed
          if (processedElementsRef.current.has(buttonElement)) {
            return;
          }
          processedElementsRef.current.add(buttonElement);
          
          // Ensure minimum touch target
          if (!buttonElement.style.minHeight) {
            buttonElement.style.minHeight = '48px';
          }
          if (!buttonElement.style.minWidth) {
            buttonElement.style.minWidth = '48px';
          }
          
          // Add touch manipulation
          if (!buttonElement.classList.contains('touch-manipulation')) {
            buttonElement.classList.add('touch-manipulation');
          }
          
          // Add data-testid if missing and has meaningful text
          if (!buttonElement.getAttribute('data-testid') && buttonElement.textContent?.trim()) {
            const testId = buttonElement.textContent.trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            buttonElement.setAttribute('data-testid', `button-${testId}`);
          }
        });
        
        // Optimize selects and comboboxes with proper data-testid coverage
        const selects = container.querySelectorAll('select, [role="combobox"]');
        selects.forEach((select) => {
          const selectElement = select as HTMLSelectElement;
          
          // Skip if already processed
          if (processedElementsRef.current.has(selectElement)) {
            return;
          }
          processedElementsRef.current.add(selectElement);
          
          // Ensure minimum touch target
          if (!selectElement.style.minHeight) {
            selectElement.style.minHeight = '48px';
          }
          
          // Prevent zoom on iOS
          selectElement.style.fontSize = '16px';
          
          // Add touch manipulation
          if (!selectElement.classList.contains('touch-manipulation')) {
            selectElement.classList.add('touch-manipulation');
          }
          
          // Add data-testid for selects if missing
          if (!selectElement.getAttribute('data-testid') && selectElement.name) {
            selectElement.setAttribute('data-testid', `select-${selectElement.name}`);
          }
        });
        
        // Add data-testid for critical links
        const criticalLinks = container.querySelectorAll('a[href*="paiement"], a[href*="confirmation"], a[href*="contact"], a[href*="aide"]');
        criticalLinks.forEach((link) => {
          const linkElement = link as HTMLAnchorElement;
          
          // Skip if already processed
          if (processedElementsRef.current.has(linkElement)) {
            return;
          }
          processedElementsRef.current.add(linkElement);
          
          if (!linkElement.getAttribute('data-testid') && linkElement.textContent?.trim()) {
            const testId = linkElement.textContent.trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            linkElement.setAttribute('data-testid', `link-${testId}`);
          }
        });
      });
    };
    
    // Progressive enhancement - run optimization after DOM is ready
    const runOptimization = () => {
      // Wait for React components to be mounted
      setTimeout(optimizeFormInputs, 100);
      
      // Re-run when new elements are added (for dynamic forms)
      const observer = new MutationObserver((mutations) => {
        let shouldReRun = false;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Only trigger re-run for form-related changes
              if (element.matches('form, [data-form-container]') ||
                  element.querySelector('form, [data-form-container]') ||
                  element.matches('input, textarea, select, button, [role="button"], [role="combobox"]')) {
                shouldReRun = true;
              }
            }
          });
        });
        
        if (shouldReRun) {
          setTimeout(optimizeFormInputs, 50);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    };
    
    // Initialize optimizations
    const observerCleanup = runOptimization();
    
    // Add CSS for enhanced mobile form styles
    const style = document.createElement('style');
    style.setAttribute('data-mobile-optimizer', 'true');
    style.textContent = `
      /* Enhanced mobile form optimizations */
      .touch-manipulation {
        touch-action: manipulation;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }
      
      /* Gentle validation feedback colors */
      .border-amber-300 {
        border-color: #fcd34d;
      }
      
      .border-green-300 {
        border-color: #86efac;
      }
      
      @media (max-width: 768px) {
        /* Ensure all interactive elements meet touch target guidelines */
        input:not([type="hidden"]), 
        textarea, 
        select, 
        button, 
        [role="button"], 
        [role="combobox"] {
          min-height: 48px !important;
          min-width: 48px !important;
          font-size: 16px !important;
          touch-action: manipulation;
        }
        
        /* Enhanced button spacing on mobile */
        button + button,
        [role="button"] + [role="button"] {
          margin-left: 12px;
        }
        
        /* Better form field spacing */
        .form-field,
        [data-testid*="input"],
        [data-testid*="select"] {
          margin-bottom: 1.5rem;
        }
        
        /* Improved focus states for mobile */
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }
        
        /* Ensure proper touch targets for critical links */
        a[data-testid*="link"] {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
        }
      }
      
      /* Progress indicator styles */
      .form-progress {
        position: sticky;
        top: 0;
        z-index: 10;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      @media (max-width: 768px) {
        .form-progress {
          padding: 0.75rem;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      // Clean up all event listeners
      listenerCleanupRef.current.forEach(cleanup => cleanup());
      listenerCleanupRef.current = [];
      
      // Clean up observer
      observerCleanup();
      
      // Clean up processed elements tracking
      processedElementsRef.current = new WeakSet();
      
      // Clean up CSS
      const existingStyle = document.head.querySelector('[data-mobile-optimizer]');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []); // Empty dependency array is correct here as we want this to run once
  
  return null;
}