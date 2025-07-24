// Interface UserEmail
interface UserEmail {
  id: string;
  uid: number;
  date: Date;
  // Le champ from peut être un tableau d'objets, un objet, ou une chaîne selon la source
  from: { name?: string; address: string }[] | { name?: string; address: string } | string;
  to: { name?: string; address: string }[] | { name?: string; address: string } | string;
  cc?: { name?: string; address: string }[] | { name?: string; address: string } | string;
  subject: string;
  text?: string;
  html?: string;
  hasAttachments: boolean;
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
  }[];
  isRead: boolean;
  flags?: string[];
  isSpam?: boolean;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

/**
 * Normalise le format "from" d'un email, quelle que soit sa structure
 * Renvoie toujours un tableau d'objets {name, address} standardisé
 */
export const normalizeEmailAddresses = (addresses: any): {name?: string; address: string}[] => {
  // Si c'est déjà un tableau, vérifier qu'il contient des objets au bon format
  if (Array.isArray(addresses)) {
    if (addresses.length === 0) return [{name: 'Inconnu', address: ''}];
    
    // Vérifier que chaque élément est un objet au format correct
    return addresses.map(addr => {
      if (typeof addr === 'string') {
        // Si c'est juste une chaîne, la traiter comme une adresse
        return {address: addr};
      }
      if (typeof addr === 'object' && addr !== null) {
        // S'assurer que l'objet a au moins la propriété address
        return {
          name: addr.name || undefined,
          address: addr.address || addr.email || ''
        };
      }
      return {name: 'Inconnu', address: ''};
    });
  }
  
  // Si c'est un objet simple
  if (typeof addresses === 'object' && addresses !== null) {
    return [{
      name: addresses.name || undefined,
      address: addresses.address || addresses.email || ''
    }];
  }
  
  // Si c'est une chaîne
  if (typeof addresses === 'string') {
    // Tenter d'extraire le nom et l'adresse du format "Nom <email@exemple.com>"
    const match = addresses.match(/(.*)<(.*)>/);
    if (match) {
      return [{
        name: match[1].trim(),
        address: match[2].trim()
      }];
    }
    // Simple adresse email
    return [{address: addresses}];
  }
  
  // Valeur par défaut si rien ne correspond
  return [{name: 'Inconnu', address: ''}];
};

/**
 * Helper pour extraire le nom d'expéditeur en toute sécurité
 */
export const getSenderName = (email: UserEmail | null | undefined): string => {
  if (!email || !email.from) return 'Inconnu';
  
  // Normaliser l'adresse d'expéditeur quel que soit son format
  const normalizedFrom = normalizeEmailAddresses(email.from);
  
  if (normalizedFrom.length === 0) return 'Inconnu';
  
  // Utiliser le nom s'il existe, sinon l'adresse
  return (normalizedFrom[0].name && normalizedFrom[0].name.trim()) 
    ? normalizedFrom[0].name 
    : (normalizedFrom[0].address) 
      ? normalizedFrom[0].address 
      : 'Inconnu';
};

/**
 * Helper pour extraire l'initiale de l'expéditeur en toute sécurité
 */
export const getSenderInitial = (email: UserEmail | null | undefined): string => {
  if (!email || !email.from) return '?';
  
  // Normaliser l'adresse d'expéditeur quel que soit son format
  const normalizedFrom = normalizeEmailAddresses(email.from);
  
  if (normalizedFrom.length === 0) return '?';
  
  const name = normalizedFrom[0].name;
  const address = normalizedFrom[0].address;
  
  if (name && name.trim().length > 0) {
    return name[0].toUpperCase();
  } else if (address && address.length > 0) {
    return address[0].toUpperCase();
  }
  return '?';
};

/**
 * Helper pour extraire le sujet de l'email en toute sécurité
 */
export const getEmailSubject = (email: UserEmail | null | undefined): string => {
  if (!email) return '(Sans objet)';
  return email.subject || '(Sans objet)';
};
