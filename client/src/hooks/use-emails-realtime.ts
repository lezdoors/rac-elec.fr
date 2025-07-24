/**
 * Reexport de la version centralisée du hook
 * Redirige vers l'implémentation unifiée pour réduire les connexions WebSocket
 */
import { useEmailsRealtimeCentralized } from './use-centralized-websocket';

export const useEmailsRealtime = useEmailsRealtimeCentralized;