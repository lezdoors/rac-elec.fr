import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { INBOX_FOLDER } from "@/lib/constants";
import { useEmailUnreadCount } from "@/hooks/use-email-unread-count";
import { useAdminWebSocketContext } from "@/hooks/use-admin-websocket-context";

export function EmailNotificationBadge() {
  const [, setLocation] = useLocation();
  
  // Utiliser notre contexte de WebSockets pour l'admin
  const adminWebSockets = useAdminWebSocketContext();
  
  // Récupérer le nombre d'emails non lus depuis le contexte central
  const websocketEmailsCount = adminWebSockets.unreadCounts?.emails || 0;
  
  // Vérifier l'état de la connexion WebSocket
  const isConnected = adminWebSockets.emails?.isConnected || false;
  
  // Utiliser notre hook optimisé comme secours si le WebSocket n'est pas connecté
  const { unreadCount, isLoading: countLoading } = useEmailUnreadCount();
  
  // Version de secours qui utilise le cache local en dernier recours
  const [localUnreadCount, setLocalUnreadCount] = useState<number>(() => {
    // Tenter de récupérer une valeur en cache pour affichage instantané
    try {
      const cachedCount = sessionStorage.getItem('email_unread_count');
      return cachedCount ? parseInt(cachedCount, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  
  // Utilisé uniquement si aucune des autres méthodes ne fonctionne
  const { data: userEmails, isLoading: emailsLoading } = useQuery({
    queryKey: ["/api/user-emails", 1, INBOX_FOLDER],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 60000, // Rafraîchir moins fréquemment (toutes les 60 secondes)
    staleTime: 60000,        // Considérer les données fraîches pendant 1 minute
    gcTime: 1000 * 60 * 10,  // Garder en cache pendant 10 minutes
    refetchOnWindowFocus: false, // Ne pas rafraîchir lors du focus de la fenêtre
    // Désactiver cette requête si d'autres méthodes fonctionnent
    enabled: !isConnected && !unreadCount && !countLoading
  });
  
  // Effet de secours pour le cache local
  useEffect(() => {
    if (userEmails && typeof userEmails === 'object' && 'emails' in userEmails && Array.isArray(userEmails.emails)) {
      const count = userEmails.emails.filter((email: any) => !email.isRead).length;
      setLocalUnreadCount(count);
      // Mettre en cache pour les futurs rendus
      try {
        sessionStorage.setItem('email_unread_count', count.toString());
      } catch (e) {
        // Ignorer les erreurs de stockage
      }
    }
  }, [userEmails]);
  
  // Stratégie de repli en cascade pour le nombre d'emails non lus
  // 1. Utiliser les données WebSocket en temps réel (plus rapide et moins de requêtes)
  // 2. Sinon, utiliser le hook optimisé useEmailUnreadCount
  // 3. En dernier recours, utiliser les données mises en cache ou la requête directe
  const finalUnreadCount = websocketEmailsCount > 0 ? websocketEmailsCount : 
                         (unreadCount || localUnreadCount);
  
  // Déterminer si nous sommes en cours de chargement
  const isStillLoading = !isConnected && countLoading && emailsLoading;
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="relative" 
      onClick={() => setLocation("/admin/emails")}
      title="Voir les emails"
    >
      <Mail 
        className={`h-5 w-5 ${finalUnreadCount > 0 ? 'text-green-500 animate-pulse' : isStillLoading ? 'text-gray-400' : ''}`} 
      />
      {finalUnreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
        >
          {finalUnreadCount}
        </Badge>
      )}
    </Button>
  );
}
