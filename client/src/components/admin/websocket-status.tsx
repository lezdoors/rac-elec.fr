import React from 'react';
import { useWebSocketContext } from '@/components/providers/websocket-provider';
import { Badge } from '@/components/ui/badge';

/**
 * Composant pour afficher l'état de la connexion WebSocket
 * Utilisé dans l'interface d'administration
 */
export function WebSocketStatus() {
  const { isConnected } = useWebSocketContext();
  
  if (isConnected) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="whitespace-nowrap">Mises à jour en temps réel actives</span>
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1.5">
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
      <span className="whitespace-nowrap">Connexion en cours...</span>
    </Badge>
  );
}