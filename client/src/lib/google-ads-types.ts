/**
 * GTM Google Ads Integration (GTM-K597C4C2 + Google Ads AW-16683623620)
 * All conversion events flow through GTM dataLayer + Google Ads gtag
 */

declare global {
  interface Window {
    /**
     * GTM dataLayer for event tracking (GTM-only setup)
     */
    dataLayer: any[];
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
 * GTM Google Ads Helper - All conversions via dataLayer (GTM-only)
 */
export const GoogleAdsHelper = {
  /**
   * Check if GTM dataLayer is available
   */
  isDataLayerAvailable(): boolean {
    return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
  },
  
  /**
   * Send Google Ads conversion via GTM dataLayer
   * @param conversionId Conversion ID (AW-XXXXXXXXXX/YYYYYYYYYYYYY)
   * @param transactionId Optional transaction ID
   * @param value Optional monetary value
   */
  sendConversion(conversionId: string, transactionId?: string, value?: number): boolean {
    if (!this.isDataLayerAvailable()) {
      console.warn("⚠️ GTM dataLayer not available, conversion not sent");
      return false;
    }
    
    const conversionData: any = {
      event: 'ads_conversion',
      conversion_id: conversionId
    };
    
    if (transactionId) {
      conversionData.transaction_id = transactionId;
    }
    
    if (value) {
      conversionData.value = value;
      conversionData.currency = 'EUR';
    }
    
    try {
      window.dataLayer.push(conversionData);
      console.log("✅ GTM conversion event pushed:", conversionData);
      return true;
    } catch (error) {
      console.error("❌ Error pushing conversion to dataLayer:", error);
      return false;
    }
  }
};

// Exporter les types et fonctions utilitaires
export default GoogleAdsHelper;