/**
 * Reexport de la version centralisée du hook
 * Redirige vers l'implémentation unifiée pour réduire les connexions WebSocket
 */
import { useContactsRealtimeCentralized } from './use-centralized-websocket';

// Type pour les contacts (conservé pour la compatibilité)
export interface ContactFromWebSocket {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  createdAt: string;
  status: string;
}

// Export de la version centralisée
export const useContactsWebSocket = useContactsRealtimeCentralized;
