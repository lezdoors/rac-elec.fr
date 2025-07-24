import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { INBOX_FOLDER } from "@/lib/constants";

interface EmailData {
  emails: Array<{
    id: string;
    isRead: boolean;
    subject: string;
    date: string;
    // Autres propriétés d'email
  }>;
}

/**
 * Hook pour obtenir le nombre d'emails non lus dans la boîte de réception
 * Utile pour les badges de notification
 */
export function useEmailUnreadCount(userId: number = 1, mailbox: string = INBOX_FOLDER) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const queryClient = useQueryClient();
  
  // Par défaut, on utilise l'utilisateur admin (id=1)
  const { data: userEmails, isLoading, isError } = useQuery<EmailData>({
    queryKey: ["/api/user-emails", userId, mailbox],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 15000, // Considérer les données comme périmées après 15 secondes
  });
  
  useEffect(() => {
    if (userEmails && 'emails' in userEmails && Array.isArray(userEmails.emails)) {
      const count = userEmails.emails.filter(email => !email.isRead).length;
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [userEmails]);
  
  // Fonction utilitaire pour forcer le rafraîchissement du compteur
  const refreshCount = () => {
    queryClient.invalidateQueries({
      queryKey: ["/api/user-emails", userId, mailbox]
    });
  };
  
  return {
    unreadCount,
    isLoading,
    isError,
    refreshCount
  };
}
