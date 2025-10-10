import { useEffect, useState } from "react";
import { getActiveSnippetsForPage, injectGoogleSnippet } from "@/lib/google-snippets";

interface GoogleSnippetButtonProps {
  page: string;
  selector: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * Bouton qui déclenche l'exécution des snippets Google lors du clic
 * Utiliser ce composant pour les boutons qui doivent déclencher des événements de suivi Google
 */
export function GoogleSnippetButton({
  page,
  selector,
  children,
  className = "",
  onClick,
  disabled = false,
  type = "button"
}: GoogleSnippetButtonProps) {
  const [snippets, setSnippets] = useState<any[]>([]);
  
  // Charger les snippets au montage du composant
  useEffect(() => {
    async function loadSnippets() {
      try {
        const pageSnippets = await getActiveSnippetsForPage(page);
        const filteredSnippets = pageSnippets.filter(snippet => 
          snippet.triggerEvent === "click" && 
          snippet.triggerSelector && 
          snippet.triggerSelector.split(',').some(s => s.trim() === selector)
        );
        
        setSnippets(filteredSnippets);
      } catch (error) {
        console.error("Erreur lors du chargement des snippets pour le bouton:", error);
      }
    }
    
    loadSnippets();
  }, [page, selector]);
  
  // Gestionnaire de clic qui injecte les snippets
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`🔍 GoogleSnippetButton: Clic sur "${children}" - Sélecteur: ${selector}, Page: ${page}`);
    
    // Exécuter les snippets Google
    snippets.forEach(snippet => {
      console.log(`📌 Exécution du snippet: ${snippet.id} - "${snippet.name}"`);
      const success = injectGoogleSnippet(snippet);
      
      // Vérifier si le snippet a été correctement injecté
      if (!success) {
        console.warn(`❌ Échec de l'injection du snippet ${snippet.id}`);
        return;
      }
      
      // Si le snippet contient une fonction gtag_report_conversion, essayer de l'exécuter
      if (snippet.code && snippet.code.includes('gtag_report_conversion')) {
        console.log(`🔔 Snippet ${snippet.id} contient gtag_report_conversion - Tentative d'exécution...`);
        
        // Attendre que la fonction soit disponible dans window
        setTimeout(() => {
          if (typeof (window as any).gtag_report_conversion === 'function') {
            console.log(`✅ Fonction gtag_report_conversion trouvée - Exécution de la conversion pour ${snippet.id}`);
            try {
              (window as any).gtag_report_conversion();
              console.log(`✅ Conversion Google Ads envoyée avec succès pour ${snippet.id}`);
            } catch (error) {
              console.error(`❌ Erreur lors de l'appel à gtag_report_conversion pour ${snippet.id}:`, error);
            }
          } else {
            console.warn(`⚠️ La fonction gtag_report_conversion n'a pas été trouvée pour ${snippet.id}`);
            
            // GTM-only: Push conversion to dataLayer instead of direct gtag
            if (Array.isArray((window as any).dataLayer) && snippet.code.includes('AW-')) {
              console.log(`🔄 Pushing conversion to GTM dataLayer for ${snippet.id}`);
              try {
                // Extract conversion ID
                const match = snippet.code.match(/AW-([0-9]+\/[a-zA-Z0-9]+)/) || 
                             snippet.code.match(/AW-([0-9]+)/);
                if (match) {
                  console.log(`📊 GTM conversion event for ${match[0]}`);
                  (window as any).dataLayer.push({
                    event: 'ads_conversion',
                    conversion_id: match[0]
                  });
                  console.log(`✅ GTM dataLayer push successful for ${match[0]}`);
                }
              } catch (error) {
                console.error(`❌ Error pushing to GTM dataLayer:`, error);
              }
            }
          }
        }, 300);
      } else if (snippet.code && (snippet.code.includes('gtag("event", "conversion"') || 
                snippet.code.includes('gtag(\'event\', \'conversion\''))) {
        console.log(`🔔 Snippet ${snippet.id} uses gtag - should be migrated to GTM dataLayer`);
      }
    });
    
    // Appeler le gestionnaire de clic d'origine
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      data-ga-selector={selector}
    >
      {children}
    </button>
  );
}