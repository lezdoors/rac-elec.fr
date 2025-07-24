/**
 * Types pour l'intégration Google Ads
 * Ces types permettent de définir les interfaces pour les objets et fonctions Google Ads
 */

// Étendre l'interface Window pour inclure les fonctions Google Ads
declare global {
  interface Window {
    /**
     * Fonction Google Analytics/GTM pour le suivi des événements
     */
    gtag: (...args: any[]) => void;
    
    /**
     * Fonction Google Ads pour le suivi des conversions
     * @param url URL de redirection optionnelle
     * @returns false pour empêcher la redirection par défaut
     */
    gtag_report_conversion?: (url?: string) => boolean;
    
    /**
     * Indicateur que les appels à gtag ont été interceptés pour le débogage
     */
    _gtagIntercepted?: boolean;
    
    /**
     * Indicateur que les appels à gtag_report_conversion ont été interceptés pour le débogage
     */
    _gtagReportConversionIntercepted?: boolean;
  }
}

/**
 * Interface pour les données de conversion Google Ads
 */
export interface GoogleAdsConversionData {
  /**
   * Identifiant de conversion Google Ads à utiliser
   * Format : AW-XXXXXXXXXX/YYYYYYYYYYYYY
   */
  send_to: string;
  
  /**
   * Identifiant de transaction optionnel pour le suivi des conversions
   */
  transaction_id?: string;
  
  /**
   * Valeur monétaire de la conversion (sans la devise)
   */
  value?: number;
  
  /**
   * Code de devise (ex: EUR)
   */
  currency?: string;
  
  /**
   * Callback à exécuter après l'envoi de la conversion
   */
  event_callback?: () => void;
}

/**
 * Fonctions utilitaires pour le suivi des conversions Google Ads
 */
export const GoogleAdsHelper = {
  /**
   * Vérifie si gtag est disponible
   */
  isGtagAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  },
  
  /**
   * Envoie une conversion Google Ads
   * @param conversionId Identifiant de conversion (AW-XXXXXXXXXX/YYYYYYYYYYYYY)
   * @param transactionId Identifiant de transaction optionnel
   * @param value Valeur monétaire optionnelle
   */
  sendConversion(conversionId: string, transactionId?: string, value?: number): boolean {
    if (!this.isGtagAvailable()) {
      console.warn("⚠️ gtag n'est pas disponible, la conversion ne sera pas envoyée");
      return false;
    }
    
    const conversionData: GoogleAdsConversionData = {
      send_to: conversionId
    };
    
    if (transactionId) {
      conversionData.transaction_id = transactionId;
    }
    
    if (value) {
      conversionData.value = value;
      conversionData.currency = 'EUR';
    }
    
    try {
      window.gtag('event', 'conversion', conversionData);
      console.log("✅ Conversion Google Ads envoyée:", conversionData);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la conversion Google Ads:", error);
      return false;
    }
  }
};

// Exporter les types et fonctions utilitaires
export default GoogleAdsHelper;