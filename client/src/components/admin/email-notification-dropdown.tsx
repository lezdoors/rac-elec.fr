import { useState, useEffect } from 'react';
import { Mail, Check, CheckCheck, ChevronRight, X, ExternalLink, Reply, Trash, FileBox } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAdminWebSocketContext } from '@/hooks/use-admin-websocket-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmailUnreadCount } from "@/hooks/use-email-unread-count";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { INBOX_FOLDER, TRASH_FOLDER } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

// Définir l'interface Email pour ce composant
interface Email {
  id: string;
  from: string;
  subject: string;
  preview?: string;
  receivedAt: string;
  isRead: boolean;
  hasAttachments?: boolean;
  // Contenir l'email original pour les opérations avancées
  original?: any;
}

export function EmailNotificationDropdown() {
  const adminWebSockets = useAdminWebSocketContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
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
  
  // Déterminer si nous sommes en cours de chargement
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  
  // Stratégie de repli en cascade pour le nombre d'emails non lus
  const finalUnreadCount = websocketEmailsCount > 0 ? websocketEmailsCount : 
                         (unreadCount || localUnreadCount);
  
  // Utilisé pour charger les emails récents pour les notifications (optimisé)
  const { data: userEmailsData, isLoading: emailsLoading, refetch } = useQuery({
    queryKey: ["/api/user-emails/recent", 1, INBOX_FOLDER],
    queryFn: async ({ queryKey }) => {
      const [_, userId, mailbox] = queryKey;
      try {
        // Utiliser notre nouvel endpoint optimisé qui récupère seulement les emails récents
        const response = await fetch(`/api/user-emails/recent?userId=${userId}&mailbox=${mailbox}&limit=10`);
        if (!response.ok) {
          // Approche progressive - vérifier le cache en cas d'erreur
          const cachedData = sessionStorage.getItem('recent_emails');
          if (cachedData) {
            return JSON.parse(cachedData);
          }
          return { emails: [] };
        }
        const data = await response.json();
        
        // Mettre en cache pour un accès plus rapide aux notifications
        try {
          sessionStorage.setItem('recent_emails', JSON.stringify(data));
          
          // Aussi mettre à jour le compteur d'emails non lus si disponible
          if (data.emails) {
            const unreadEmailsCount = data.emails.filter((email: any) => !email.isRead).length;
            sessionStorage.setItem('email_unread_count', unreadEmailsCount.toString());
            // Mettre à jour le compteur local pour affichage immédiat
            setLocalUnreadCount(unreadEmailsCount);
          }
        } catch (e) {
          // Ignorer les erreurs de stockage
        }
        
        return data;
      } catch (error) {
        console.error("Erreur lors du chargement des emails récents:", error);
        // En cas d'erreur, tentative de récupération depuis le cache
        const cachedData = sessionStorage.getItem('recent_emails');
        if (cachedData) {
          return JSON.parse(cachedData);
        }
        return { emails: [] };
      }
    },
    refetchInterval: 0,
    staleTime: 20000, // Réduire pour plus de fraîcheur
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: isOpen
  });
  
  // Charger les emails quand le dropdown est ouvert
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      refetch().then(() => {
        setLoading(false);
      });
    }
  }, [isOpen, refetch]);
  
  // Extraire les emails du résultat de la requête
  useEffect(() => {
    if (userEmailsData && typeof userEmailsData === 'object' && 'emails' in userEmailsData && Array.isArray(userEmailsData.emails)) {
      // Prendre les 10 premiers emails (lus et non lus) pour le dropdown
      const recentEmails = userEmailsData.emails
        .slice(0, 10)
        .map((email: any) => {
          // Traitement approprié du champ from qui peut être un objet, un tableau d'objets ou une chaîne
          let fromText = 'Expéditeur inconnu';
          if (typeof email.from === 'string') {
            fromText = email.from;
          } else if (email.from?.text) {
            fromText = email.from.text;
          } else if (Array.isArray(email.from) && email.from.length > 0) {
            // Si from est un tableau d'objets avec name et address
            const sender = email.from[0];
            if (sender.name && sender.address) {
              fromText = `${sender.name} <${sender.address}>`;
            } else if (sender.address) {
              fromText = sender.address;
            } else if (sender.name) {
              fromText = sender.name;
            }
          } else if (typeof email.from === 'object' && email.from !== null) {
            // Si from est un objet simple avec name et address
            if (email.from.name && email.from.address) {
              fromText = `${email.from.name} <${email.from.address}>`;
            } else if (email.from.address) {
              fromText = email.from.address;
            } else if (email.from.name) {
              fromText = email.from.name;
            }
          }
          
          return {
            id: email.id || email.messageId,
            from: fromText,
            subject: email.subject || 'Sans objet',
            preview: email.preview || (typeof email.text === 'string' ? email.text.substring(0, 100) : ''),
            receivedAt: email.receivedAt || email.date,
            isRead: email.isRead || false,
            hasAttachments: email.hasAttachments || false,
            original: email // Conserver l'email original pour les opérations avancées
          };
        });
      
      setEmails(recentEmails);
      
      // Mettre en cache le nombre d'emails pour les futurs rendus
      const count = userEmailsData.emails.filter((email: any) => !email.isRead).length;
      try {
        sessionStorage.setItem('email_unread_count', count.toString());
      } catch (e) {
        // Ignorer les erreurs de stockage
      }
    }
  }, [userEmailsData]);
  
  // Marquer un email comme lu
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/emails/${id}/mark-read`, {
        method: 'POST',
      });
      
      // Mettre à jour la liste locale
      setEmails(prevEmails => 
        prevEmails.map(email => 
          email.id === id ? { ...email, isRead: true } : email
        )
      );
      
      // Rafraîchir le compteur
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/email-unread-count"] });
    } catch (error) {
      console.error("Erreur lors du marquage de l'email comme lu:", error);
    }
  };
  
  // Marquer tous les emails comme lus
  const markAllAsRead = async () => {
    try {
      await fetch('/api/emails/mark-all-read', {
        method: 'POST',
      });
      
      // Mettre à jour la liste locale
      setEmails(prevEmails => 
        prevEmails.map(email => ({ ...email, isRead: true }))
      );
      
      // Rafraîchir le compteur
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/email-unread-count"] });
    } catch (error) {
      console.error("Erreur lors du marquage des emails comme lus:", error);
    }
  };
  
  // Déplacer un email vers la corbeille
  const moveToTrash = async (id: string) => {
    try {
      await apiRequest("POST", `/api/emails/${id}/move`, {
        userId: 1, // Utilisateur administrateur par défaut
        messageId: id,
        destinationMailbox: TRASH_FOLDER,
        sourceMailbox: INBOX_FOLDER
      });
      
      // Mettre à jour la liste locale
      setEmails(prevEmails => prevEmails.filter(email => email.id !== id));
      
      // Rafraîchir les données
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/email-unread-count"] });
      
      toast({
        title: "Email déplacé",
        description: "L'email a été déplacé vers la corbeille",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors du déplacement de l'email:", error);
      toast({
        title: "Erreur",
        description: "Impossible de déplacer l'email vers la corbeille",
        variant: "destructive",
      });
    }
  };
  
  // Ouvrir la page email et pré-remplir le formulaire de réponse
  const handleReplyToEmail = (email: Email) => {
    if (!email.original) {
      toast({
        title: "Erreur",
        description: "Impossible de répondre à cet email, données manquantes",
        variant: "destructive",
      });
      return;
    }
    
    // Stocker l'email à répondre dans le sessionStorage pour le récupérer dans la page emails
    try {
      sessionStorage.setItem('reply_to_email', JSON.stringify(email.original));
      
      // Naviguer vers la page emails
      setIsOpen(false);
      navigate('/admin/emails');
    } catch (error) {
      console.error("Erreur lors de la préparation de la réponse:", error);
      toast({
        title: "Erreur",
        description: "Impossible de préparer la réponse à cet email",
        variant: "destructive",
      });
    }
  };
  
  // Formater la date des emails
  const formatEmailTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const isSameDay = date.getDate() === now.getDate() && 
                       date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
      
      if (isSameDay) {
        return format(date, "HH'h'mm", { locale: fr });
      } else {
        return format(date, "d MMM, HH'h'mm", { locale: fr });
      }
    } catch (e) {
      return timeString;
    }
  };
  
  // Formater l'expéditeur pour affichage
  const formatSender = (sender: string) => {
    try {
      // Si le format est "Nom <email@example.com>"
      const match = sender.match(/(.*)<(.*)>/);
      if (match && match[1].trim()) {
        return match[1].trim();
      }
      // Sinon, retourner l'adresse email ou le sender tel quel
      return sender;
    } catch (e) {
      return sender;
    }
  };
  
  // Déterminer si nous sommes en cours de chargement
  const isStillLoading = !isConnected && countLoading && emailsLoading;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div>Emails {finalUnreadCount > 0 && `(${finalUnreadCount})`}</div>
          {finalUnreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs py-1 px-2"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px] overflow-auto">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Chargement des emails...
            </div>
          ) : emails.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Pas d'emails récents
            </div>
          ) : (
            <DropdownMenuGroup>
              {emails.map((email) => (
                <div key={email.id}>
                  <DropdownMenuItem 
                    className={`relative flex gap-3 p-3 ${!email.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="bg-blue-100 rounded-full p-2 h-10 w-10 flex items-center justify-center text-xl">
                      📨
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start w-full">
                        <div className={`text-sm ${!email.isRead ? 'font-medium' : ''}`}>{formatSender(email.from)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatEmailTime(email.receivedAt)}
                        </div>
                      </div>
                      <p className={`text-sm ${!email.isRead ? 'font-semibold' : ''}`}>{email.subject}</p>
                      <p className="text-xs text-muted-foreground pt-1 line-clamp-2">{email.preview}</p>
                      
                      {/* Indicateur de pièces jointes */}
                      {email.hasAttachments && (
                        <div className="mt-1 flex items-center">
                          <FileBox className="h-3 w-3 text-blue-500 mr-1" />
                          <span className="text-xs text-blue-500">Pièces jointes</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions pour chaque email */}
                    <div className="absolute right-2 bottom-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                      <TooltipProvider>
                        {!email.isRead && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 bg-white/80 hover:bg-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(email.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Marquer comme lu</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReplyToEmail(email);
                              }}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Répondre</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveToTrash(email.id);
                              }}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Supprimer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Bouton de lecture pour mobiles / tablettes */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/emails?view=${email.id}`);
                        setIsOpen(false);
                      }}
                    >
                      <span className="sr-only">Ouvrir l'email</span>
                    </Button>
                  </DropdownMenuItem>
                  <Separator />
                </div>
              ))}
              <DropdownMenuItem 
                asChild 
                className="mt-2 text-center py-3 bg-gray-50 hover:bg-gray-100 flex justify-center items-center text-blue-600 gap-1 rounded-md mx-2"
                onClick={() => setIsOpen(false)}
              >
                <Link to="/admin/emails" className="flex items-center gap-1">
                  <span>Voir tous les emails</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}