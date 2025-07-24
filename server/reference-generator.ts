/**
 * Générateur de références uniques pour les leads et demandes
 * Assure l'unicité et la traçabilité parfaite de chaque enregistrement
 */

// Types de préfixes selon le service
const SERVICE_PREFIXES = {
  electricity: 'ENE',       // Électricité
  gas: 'GAZ',              // Gaz
  solar: 'SOL',            // Solaire
  professional: 'PRO',     // Professionnel
  default: 'RAC'           // Référence raccordement (anciennement REF)
};

/**
 * Génère une référence unique selon le type de service
 * Format: PRÉFIXE-YYYY-MMDD-HHMMSS-RND
 */
export function generateReference(serviceType?: string): string {
  const now = new Date();
  
  // Déterminer le préfixe selon le type de service
  let prefix = SERVICE_PREFIXES.default;
  
  if (serviceType) {
    if (serviceType.includes('electric') || serviceType.includes('raccordement')) {
      prefix = SERVICE_PREFIXES.electricity;
    } else if (serviceType.includes('gas') || serviceType.includes('gaz')) {
      prefix = SERVICE_PREFIXES.gas;
    } else if (serviceType.includes('solar') || serviceType.includes('solaire')) {
      prefix = SERVICE_PREFIXES.solar;
    } else if (serviceType.includes('professional') || serviceType.includes('professionnel')) {
      prefix = SERVICE_PREFIXES.professional;
    }
  }
  
  // Composants de la référence
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Nombre aléatoire pour garantir l'unicité
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  
  // Format final: RAC-2025-0602-143045-742 (ou autre préfixe selon le service)
  return `${prefix}-${year}-${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Génère une référence spécifique pour les leads (étape 1)
 */
export function generateLeadReference(clientType?: string): string {
  const timestamp = Date.now().toString().substring(7);
  const random = Math.floor(Math.random() * 10000);
  
  return `LEAD-${random}-${timestamp}`;
}

/**
 * Génère une référence pour les paiements
 */
export function generatePaymentReference(amount?: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `PAY-${dateStr}-${timeStr}-${random}`;
}

/**
 * Valide le format d'une référence
 */
export function validateReference(reference: string): boolean {
  // Patterns pour différents types de références (REF- et RAC- pour rétrocompatibilité)
  const patterns = [
    /^(ENE|GAZ|SOL|PRO|REF|RAC)-\d{4}-\d{4}-\d{6}-\d{3}$/,  // Références service
    /^LEAD-\d{1,4}-\d{6,}$/,                                 // Références lead
    /^PAY-\d{8}-\d{6}-\d{4}$/                                // Références paiement
  ];
  
  return patterns.some(pattern => pattern.test(reference));
}

export default {
  generateReference,
  generateLeadReference,
  generatePaymentReference,
  validateReference
};