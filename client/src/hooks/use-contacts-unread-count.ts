import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

/**
 * Hook optimisé pour récupérer le nombre de contacts non lus
 * - Utilise un système de cache à plusieurs niveaux
 * - Réduit le nombre de requêtes au serveur
 * - Fournit une réponse instantanée grâce au cache local
 */
export function useContactsUnreadCount() {
  // État local pour le nombre de contacts non lus
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    // Initialiser avec des données en cache si disponibles
    try {
      const cachedCount = sessionStorage.getItem('contacts_unread_count');
      return cachedCount ? parseInt(cachedCount, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  
  // Fonction pour mettre à jour le cache
  const updateCache = useCallback((count: number) => {
    try {
      sessionStorage.setItem('contacts_unread_count', count.toString());
      sessionStorage.setItem('contacts_last_check', new Date().getTime().toString());
    } catch (e) {
      // Ignorer les erreurs de stockage
    }
  }, []);
  
  // Vérifier l'âge des données en cache
  const isCacheStale = useCallback(() => {
    try {
      const lastCheck = sessionStorage.getItem('contacts_last_check');
      if (!lastCheck) return true;
      
      const now = new Date().getTime();
      const lastCheckTime = parseInt(lastCheck, 10);
      // Cache considéré périmé après 2 minutes
      return (now - lastCheckTime) > 120000;
    } catch (e) {
      return true;
    }
  }, []);
  
  // Requête pour récupérer le nombre de contacts non lus avec optimisations
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/contacts/unread-count"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes au lieu de 2
    staleTime: 3 * 60 * 1000,      // Considérer les données fraîches pendant 3 minutes
    gcTime: 10 * 60 * 1000,        // Garder en cache pendant 10 minutes
    refetchOnWindowFocus: false,   // Ne pas rafraîchir lors du focus de la fenêtre
    refetchOnMount: false,         // Ne jamais rafraîchir au montage du composant
    enabled: isCacheStale(),       // N'activer la requête que si le cache est périmé
  });
  
  // Effet pour mettre à jour le nombre de contacts non lus
  useEffect(() => {
    if (data && typeof data === 'object' && 'count' in data && typeof data.count === 'number') {
      setUnreadCount(data.count);
      updateCache(data.count);
    }
  }, [data, updateCache]);
  
  // Effet pour la mise à jour périodique des informations avec optimisations
  useEffect(() => {
    // Vérifier si le WebSocket est actif à travers une variable globale
    const wsActive = (window as any).__WS_ACTIVE;
    
    // Si le WebSocket n'est pas actif, mettre en place une mise à jour périodique optimisée
    if (!wsActive) {
      const interval = setInterval(() => {
        // Vérifier si le cache est périmé avant de forcer un rafraîchissement
        // Et vérifier que l'onglet est visible pour éviter des requêtes inutiles
        if (isCacheStale() && document.visibilityState === 'visible') {
          // Forcer un rafraîchissement du compteur de contacts non lus avec anti-cache
          fetch(`/api/contacts/unread-count?_t=${new Date().getTime()}`, {
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
              // Réduire le bruit dans la console
              console.error("Erreur lors du rafraîchissement du compteur de contacts:", {});
            });
        }
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes au lieu de 2
      
      return () => clearInterval(interval);
    }
  }, [isCacheStale, updateCache]);
  
  return { unreadCount, isLoading, error };
}
