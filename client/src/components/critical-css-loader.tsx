import { useEffect } from 'react';

export function CriticalCSSLoader() {
  useEffect(() => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      .hero-section {
        background: white;
        color: #1a202c;
        padding: 3rem 1rem;
        min-height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .hero-title {
        font-size: clamp(2rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 1rem;
      }
      
      .hero-subtitle {
        font-size: clamp(1.25rem, 3vw, 2rem);
        font-weight: 600;
        margin-bottom: 2rem;
        opacity: 0.95;
      }
      
      .hero-description {
        font-size: clamp(1rem, 2vw, 1.25rem);
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      .cta-button {
        background: #5BC248;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1.125rem;
        border: none;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .cta-button:hover {
        transform: translateY(-2px);
        background: #4CAF50;
      }
    `;

    // Create and inject critical CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = criticalCSS;
    styleElement.setAttribute('data-critical', 'true');
    document.head.insertBefore(styleElement, document.head.firstChild);

    // Remove any existing critical CSS to prevent duplicates
    return () => {
      const existingCritical = document.querySelector('[data-critical="true"]');
      if (existingCritical && existingCritical !== styleElement) {
        existingCritical.remove();
      }
    };
  }, []);

  return null;
}