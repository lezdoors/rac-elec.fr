import { useEffect } from 'react';

interface StatCounterProps {
  projectId?: string;
  securityCode?: string;
  invisible?: boolean;
}

/**
 * StatCounter Analytics Component
 * Optimisé pour les performances - chargement asynchrone et non-bloquant
 */
export const StatCounter: React.FC<StatCounterProps> = ({
  projectId = "13140920",
  securityCode = "3cd76429",
  invisible = true
}) => {
  useEffect(() => {
    // Éviter le double chargement
    if (document.getElementById('statcounter-script')) {
      return;
    }

    // Charger StatCounter de manière asynchrone après le rendu initial
    const loadStatCounter = () => {
      try {
        // Configuration StatCounter - Code officiel Racco-Elec
        window.sc_project = projectId;
        window.sc_security = securityCode;
        window.sc_invisible = invisible ? 1 : 0;

        // Créer et injecter le script de manière non-bloquante
        const script = document.createElement('script');
        script.id = 'statcounter-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://www.statcounter.com/counter/counter.js';
        
        // Gestion d'erreur silencieuse pour éviter les problèmes de performance
        script.onerror = () => {
          console.warn('StatCounter: Impossible de charger le script d\'analytics');
        };
        
        // Injecter le script dans le head
        document.head.appendChild(script);
        
        // Log de confirmation (seulement en dev)
        if (import.meta.env.DEV) {
          console.log('✅ StatCounter initialisé:', { projectId, securityCode });
        }
      } catch (error) {
        // Gestion d'erreur silencieuse
        if (import.meta.env.DEV) {
          console.warn('StatCounter: Erreur lors de l\'initialisation:', error);
        }
      }
    };

    // Retarder le chargement pour ne pas bloquer le rendu initial
    const timeoutId = setTimeout(loadStatCounter, 1000);

    // Cleanup au démontage du composant
    return () => {
      clearTimeout(timeoutId);
    };
  }, [projectId, securityCode, invisible]);

  // Rendu conditionnel pour le mode visible uniquement
  if (!invisible) {
    return (
      <div style={{ display: 'none' }}>
        <noscript>
          <div className="statcounter">
            <a
              title="real time web analytics"
              href="https://statcounter.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="statcounter"
                src={`https://c.statcounter.com/${projectId}/0/${securityCode}/1/`}
                alt="real time web analytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </noscript>
      </div>
    );
  }

  return null;
};

// Déclaration des types pour TypeScript
declare global {
  interface Window {
    sc_project: string;
    sc_security: string;
    sc_invisible: number;
    sc_remove_link: number;
  }
}

export default StatCounter;