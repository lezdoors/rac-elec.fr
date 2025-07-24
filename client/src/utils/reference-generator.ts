/**
 * Utilitaire pour la génération des numéros de référence uniques
 * selon le type de formulaire utilisé
 */

/**
 * Génère une référence de type "ENE-" pour les formulaires spécialisés
 * @param formType Type de formulaire ('solaire', 'particulier', 'professionnel')
 * @returns Référence unique au format "ENE-XXXX-XXXXXX"
 */
export function generateSpecializedReference(formType: 'solaire' | 'particulier' | 'professionnel'): string {
  // Préfixe pour distinguer les formulaires spécialisés
  const prefix = 'ENE';
  
  // Identifiant numérique aléatoire à 4 chiffres
  const numericId = Math.floor(1000 + Math.random() * 9000);
  
  // Horodatage codé en 6 chiffres pour unicité
  const timestamp = Math.floor(100000 + Math.random() * 900000);
  
  return `${prefix}-${numericId}-${timestamp}`;
}

/**
 * Détermine s'il s'agit d'une référence de formulaire spécialisé
 * @param reference Numéro de référence à vérifier
 * @returns true si c'est une référence spécialisée (ENE-), false sinon
 */
export function isSpecializedReference(reference: string): boolean {
  return reference.startsWith('ENE-');
}

/**
 * Détermine s'il s'agit d'une référence du formulaire principal
 * @param reference Numéro de référence à vérifier
 * @returns true si c'est une référence standard (RAC- ou REF- pour rétrocompatibilité), false sinon
 */
export function isStandardReference(reference: string): boolean {
  return reference.startsWith('RAC-') || reference.startsWith('REF-');
}

/**
 * Valide le format d'une référence de service RAC-
 * @param reference Numéro de référence à valider
 * @returns true si le format RAC- est valide
 */
export function validateServiceReference(reference: string): boolean {
  // Pattern exclusif pour références RAC- (format actuel uniquement)
  const racPattern = /^RAC-\d{4}-\d{6}$/;
  
  return racPattern.test(reference);
}

/**
 * Détermine si une référence peut être utilisée pour un paiement
 * @param reference Numéro de référence à vérifier
 * @returns true si la référence RAC- est valide pour paiement
 */
export function isPaymentEligibleReference(reference: string): boolean {
  // Accepter exclusivement les références RAC- pour les paiements
  return reference.startsWith('RAC-') && validateServiceReference(reference);
}