/**
 * Reexport de la version centralisée du hook
 * Redirige vers l'implémentation unifiée pour réduire les connexions WebSocket
 */
import { useDashboardRealtimeCentralized } from './use-centralized-websocket';

export const useDashboardRealtime = useDashboardRealtimeCentralized;
