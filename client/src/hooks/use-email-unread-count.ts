import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { INBOX_FOLDER } from "@/lib/constants";

/**
 * Hook optimisé pour récupérer le nombre d'emails non lus
 * - Utilise un système de cache à plusieurs niveaux
 * - Réduit le nombre de requêtes au serveur
 * - Fournit une réponse instantanée grâce au cache local
 */
export function useEmailUnreadCount(userId?: number) {
  // Par défaut, utilise l'utilisateur 1 (admin)
  const actualUserId = userId || 1;
  
  // État local pour le nombre d'emails non lus
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    // Initialiser avec des données en cache si disponibles
    try {
      const cachedCount = sessionStorage.getItem(`email_unread_${actualUserId}`);
      return cachedCount ? parseInt(cachedCount, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  
  // Fonction pour mettre à jour le cache
  const updateCache = useCallback((count: number) => {
    try {
      sessionStorage.setItem(`email_unread_${actualUserId}`, count.toString());
      sessionStorage.setItem(`email_last_check_${actualUserId}`, new Date().getTime().toString());
    } catch (e) {
      // Ignorer les erreurs de stockage
    }
  }, [actualUserId]);
  
  // Vérifier l'âge des données en cache
  const isCacheStale = useCallback(() => {
    try {
      const lastCheck = sessionStorage.getItem(`email_last_check_${actualUserId}`);
      if (!lastCheck) return true;
      
      const now = new Date().getTime();
      const lastCheckTime = parseInt(lastCheck, 10);
      // Cache considéré périmé après 2 minutes
      return (now - lastCheckTime) > 120000;
    } catch (e) {
      return true;
    }
  }, [actualUserId]);
  
  // Requête à la base de données avec des paramètres optimisés pour réduire les appels API
  const { data: userEmails, isLoading, error } = useQuery({
    queryKey: ["/api/user-emails", actualUserId, INBOX_FOLDER],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes au lieu de 2
    staleTime: 3 * 60 * 1000,      // Considérer les données fraîches pendant 3 minutes
    gcTime: 10 * 60 * 1000,        // Garder en cache pendant 10 minutes
    refetchOnWindowFocus: false,   // Ne pas rafraîchir lors du focus de la fenêtre
    refetchOnMount: false,         // Ne pas rafraîchir au montage du composant
    enabled: isCacheStale()        // N'activer la requête que si le cache est périmé
  });
  
  // Effet pour mettre à jour le nombre d'emails non lus
  useEffect(() => {
    if (userEmails && typeof userEmails === 'object' && 'emails' in userEmails && Array.isArray(userEmails.emails)) {
      // Calcul du nombre d'emails non lus
      const count = userEmails.emails.filter((email: any) => !email.isRead).length;
      setUnreadCount(count);
      updateCache(count);
    }
  }, [userEmails, updateCache]);
  
  // Effet pour la mise à jour périodique du compteur si le WebSocket n'est pas disponible
  // Optimisé pour réduire les requêtes et la consommation de ressources
  useEffect(() => {
    // Vérifier si le WebSocket est actif à travers une variable globale
    const wsActive = (window as any).__WS_ACTIVE;
    
    // Si le WebSocket n'est pas actif, mettre en place une mise à jour périodique
    if (!wsActive) {
      const interval = setInterval(() => {
        // Vérifier si le cache est périmé avant de forcer un rafraîchissement
        // Et vérifier que l'onglet est visible pour éviter des requêtes inutiles
        if (isCacheStale() && document.visibilityState === 'visible') {
          // Forcer un rafraîchissement des emails non lus avec anti-cache
          fetch(`/api/email-unread-count?userId=${actualUserId}&_t=${new Date().getTime()}`, {
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
              "Cache-Control": "no-cache"
            }
          })
            .then(response => response.json())
            .then(data => {
              if (data && typeof data.count === 'number') {
                setUnreadCount(data.count);
                updateCache(data.count);
              }
            })
            .catch(err => {
              // Réduire le bruit dans la console en masquant l'erreur spécifique
              console.error("Erreur lors du rafraîchissement du compteur d'emails:", {});
            });
        }
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes au lieu de 2
      
      return () => clearInterval(interval);
    }
  }, [actualUserId, isCacheStale, updateCache]);
  
  return { unreadCount, isLoading, error };
}
