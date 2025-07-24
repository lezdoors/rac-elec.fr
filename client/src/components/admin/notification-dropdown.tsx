import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { useAdminWebSocketContext } from '@/hooks/use-admin-websocket-context';

// Définir l'interface Notification pour ce composant
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
}
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationDropdown() {
  const adminWebSockets = useAdminWebSocketContext();
  // Récupérer les données des notifications depuis notre contexte central
  const notificationsData = adminWebSockets.notifications || {};
  // Définir une interface pour les données de notifications pour éviter les erreurs de type
  interface NotificationsDataType {
    isConnected?: boolean;
    newNotifications?: Notification[];
    allNotifications?: Notification[];
    resetNewNotifications?: () => void;
    markAsRead?: (id: string) => void;
  }
  
  // Cast sécurisé pour les données de notifications
  const typedNotificationsData = notificationsData as NotificationsDataType;
  
  // Utiliser les propriétés spécifiques du hook de notifications avec valeurs par défaut
  const allNotifications = typedNotificationsData.allNotifications || [];
  
  // État local pour stocker les notifications (chargées depuis l'API si nécessaire)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Ne pas considérer comme chargement s'il n'y a pas de connexion WebSocket
  // Cela permet d'éviter le chargement infini
  const [loading, setLoading] = useState(false);
  
  // Utiliser useEffect pour définir un timeout court pour éviter un loading infini
  useEffect(() => {
    // Initialiser loading à true seulement pour un court instant
    setLoading(true);
    
    // Définir un délai maximum de 3 secondes pour le chargement
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Si les données sont déjà disponibles, arrêter le chargement immédiatement
    if (allNotifications.length > 0 || typedNotificationsData.isConnected === false) {
      setLoading(false);
      clearTimeout(timeoutId);
    }
    
    return () => clearTimeout(timeoutId);
  }, [allNotifications.length, typedNotificationsData.isConnected]);
  
  // Effet pour charger les notifications si elles ne sont pas déjà chargées
  useEffect(() => {
    if (allNotifications.length > 0) {
      setNotifications(allNotifications);
      setLoading(false);
    } else {
      // Charger les notifications depuis l'API avec gestion améliorée des erreurs
      fetch('/api/notifications')
        .then(res => {
          if (!res.ok) {
            // Si le statut n'est pas OK (200-299), on lance une erreur
            if (res.status === 401) {
              // Cas spécifique: utilisateur non authentifié
              throw new Error("Utilisateur non authentifié");
            }
            throw new Error(`Erreur HTTP: ${res.status}`);
          }
          // Vérifier que la réponse est bien du JSON avant de la parser
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            throw new Error("Réponse non-JSON reçue");
          }
        })
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          } else if (data && data.success === false) {
            // Gérer les réponses d'erreur formatées
            console.warn("Erreur API lors du chargement des notifications:", data.message || "Erreur inconnue");
            setNotifications([]);
          } else {
            // Format de données incorrect
            console.warn("Format de données incorrect pour les notifications");
            setNotifications([]);
          }
        })
        .catch(err => {
          console.warn("Erreur lors du chargement des notifications:", err.message);
          // En cas d'erreur d'authentification, ne pas afficher d'erreur à l'utilisateur
          // car c'est probablement juste qu'il n'a pas les permissions
          setNotifications([]);
        })
        .finally(() => {
          // Toujours arrêter le chargement quoi qu'il arrive
          setLoading(false);
        });
    }
  }, [allNotifications]);
  
  // Utiliser les fonctions du hook de marquage des notifications comme lues (si elles existent)
  const markAsRead = (id: string) => {
    if (typedNotificationsData.markAsRead) {
      typedNotificationsData.markAsRead(id);
      // Mise à jour de l'état local également
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };
  
  const markAllAsRead = () => {
    console.log("Marquage de toutes les notifications comme lues - début de l'opération");
    
    if (typedNotificationsData.resetNewNotifications) {
      // Mettre à jour l'interface utilisateur immédiatement pour une expérience fluide
      typedNotificationsData.resetNewNotifications();
      // Marquer toutes les notifications comme lues dans l'état local
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      
      console.log("Envoi de la requête API pour marquer toutes les notifications comme lues");
      
      // Appel API pour marquer toutes les notifications comme lues
      fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Ajouter les credentials pour garantir l'authentification
        credentials: 'same-origin'
      })
      .then(res => {
        console.log(`Réponse de l'API pour marquer toutes les notifications comme lues: status=${res.status}`);
        if (!res.ok && res.status !== 401) {
          // On ignore les 401 car il est possible que l'utilisateur n'ait pas les permissions
          // mais on loggue les autres erreurs
          console.warn(`Erreur HTTP ${res.status} lors du marquage des notifications comme lues`);
        } else if (res.ok) {
          console.log("Toutes les notifications marquées comme lues avec succès");
        }
      })
      .catch(err => {
        // Erreur silencieuse - ne pas perturber l'utilisateur avec des erreurs techniques
        console.error("Erreur lors du marquage des notifications:", err.message);
      });
    } else {
      console.warn("Impossible de marquer toutes les notifications comme lues - resetNewNotifications n'est pas disponible");
    }
  };
  
  // Récupérer le nombre de notifications non lues depuis le contexte
  const unreadCount = adminWebSockets.unreadCounts?.notifications || 0;
  const [isOpen, setIsOpen] = useState(false);

  // Formater la date des notifications
  const formatNotificationTime = (timeString: string) => {
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

  // Déterminer l'icône et la couleur de fond en fonction du type de notification
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'payment':
        return { bg: 'bg-green-50', icon: '💶' };
      case 'lead':
        return { bg: 'bg-blue-50', icon: '📊' };
      default:
        return { bg: 'bg-gray-50', icon: '🔔' };
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-blue-500 animate-pulse' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <div>Notifications {unreadCount > 0 && `(${unreadCount})`}</div>
          {unreadCount > 0 && (
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
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Pas de notification pour le moment
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification: Notification) => {
                const { bg, icon } = getNotificationStyles(notification.type);
                return (
                  <div key={notification.id}>
                    <DropdownMenuItem 
                      className={`flex gap-3 p-3 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`${bg} rounded-full p-2 h-10 w-10 flex items-center justify-center text-xl`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start w-full">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.time)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 ml-auto flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </DropdownMenuItem>
                    <Separator />
                  </div>
                );
              })}
              <DropdownMenuItem 
                asChild 
                className="mt-2 text-center py-3 bg-gray-50 hover:bg-gray-100 flex justify-center items-center text-blue-600 gap-1 rounded-md mx-2"
                onClick={() => setIsOpen(false)}
              >
                <Link to="/admin/notifications" className="flex items-center gap-1">
                  <span>Voir toutes les notifications</span>
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