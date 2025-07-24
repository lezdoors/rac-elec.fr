import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { useWebSocketContext } from '../providers/websocket-provider';

/**
 * Composant simplifié qui affiche l'état de la connexion WebSocket en temps réel
 * Ce badge utilise une seule connexion WebSocket centralisée pour réduire les connexions simultanées
 */
export function RealtimeStatusBadge() {
  const { isConnected } = useWebSocketContext();
  const [displayStatus, setDisplayStatus] = useState(false);

  // Effet pour suivre l'état de la connexion
  useEffect(() => {
    setDisplayStatus(isConnected);
  }, [isConnected]);

  if (displayStatus) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        Mises à jour en temps réel actives
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1.5">
      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
      Connexion en cours...
    </Badge>
  );
}