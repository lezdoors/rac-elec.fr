import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Mail,
  LogOut,
  Bell,
  ChevronRight,
  UserPlus,
  Clock,
  Loader2,
  Sparkles,
  MailCheck,
  Terminal,
  BarChart3,
  LineChart,
  BarChartHorizontal,
  Code,
  Bug
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@shared/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNotifications } from "@/hooks/use-websocket";
import { useEmailUnreadCount } from "@/hooks/use-email-unread-count";
import { useContactsUnreadCount } from "@/hooks/use-contacts-unread-count";
import { useIsMobile } from "@/hooks/use-mobile";

interface SideNavProps {
  className?: string;
  activePath: string;
}

interface MenuItem {
  label: string;
  path: string;
  page: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function SideNav({ className, activePath }: SideNavProps) {
  // État pour le panneau de notifications
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  
  // Récupérer les informations de l'utilisateur pour gérer les permissions
  const { user, isLoading } = useAuth();
  
  // Les variables d'état sont uniquement calculées à partir des données utilisateur
  // pour éviter toute incohérence dans l'affichage des menus
  const userRole = user?.role?.toLowerCase() || '';
  
  // Ces variables ne sont utilisées que pour l'affichage, pas pour le contrôle d'accès
  // Le contrôle d'accès se fait directement avec les données utilisateur
  const isAdmin = user?.role?.toLowerCase() === USER_ROLES.ADMIN.toLowerCase();
  const isManager = user?.role?.toLowerCase() === USER_ROLES.MANAGER.toLowerCase();
  const isAgent = user?.role?.toLowerCase() === USER_ROLES.AGENT.toLowerCase();
  
  // Débogage - pour vérifier les données de l'utilisateur à chaque rendu
  console.log("SideNav - Données utilisateur:", {
    id: user?.id,
    username: user?.username,
    role: user?.role,
    isAdmin,
    isManager,
    isAgent,
    permissions: user?.permissions
  });
  
  // Utiliser notre hook de notifications avec options optimisées de mise en cache
  const { 
    unreadCount, // On n'utilise que le compteur, pas besoin de notifications complètes ici
  } = useNotifications();

  // Récupérer le nombre de contacts non lus avec mise en cache optimisée
  const { unreadCount: unreadContactsCount } = useContactsUnreadCount();

  // Hook pour détecter si on est sur mobile/tablette
  const isMobile = useIsMobile();
  
  // Fonction optimisée pour vérifier si l'utilisateur a accès à une page spécifique
  // Utilise un système de cache côté client pour éviter les vérifications redondantes
  const hasPagePermission = (pageName: string): boolean => {
    // 1. Vérification du cache de permission en premier pour une performance optimale
    const permissionCacheKey = `permission_${user?.id}_${pageName}`;
    const cachedPermission = sessionStorage.getItem(permissionCacheKey);
    
    if (cachedPermission) {
      return cachedPermission === 'true';
    }
    
    // 2. S'assurer que nous avons un utilisateur et qu'il est correctement initialisé
    if (!user || !user.id || !user.role) {
      return false;
    }
    
    // 3. Récupérer le rôle directement depuis l'utilisateur
    const userRole = user.role.toLowerCase();
    const isUserAdmin = userRole === USER_ROLES.ADMIN.toLowerCase();
    const isUserAgent = userRole === USER_ROLES.AGENT.toLowerCase();
    const isUserManager = userRole === USER_ROLES.MANAGER.toLowerCase();
    
    let hasAccess = false;
    
    // 4. Admin a toujours accès à tout - logique simplifiée
    if (isUserAdmin) {
      hasAccess = true;
    } 
    // 5. Vérifier les permissions personnalisées en priorité
    else if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      const permission = user.permissions.find((p) => p.page === pageName);
      if (permission) {
        hasAccess = permission.canView === true;
      } else {
        // 6. Si aucune permission spécifique trouvée, utiliser les règles par défaut selon le rôle
        if (isUserAgent) {
          // Agent a uniquement accès à ces pages par défaut
          const defaultAgentAccess = ["dashboard", "demandes", "leads", "clients", "rendez-vous", "emails", "contacts"];
          hasAccess = defaultAgentAccess.includes(pageName);
        } else if (isUserManager) {
          // Liste exhaustive des pages auxquelles le manager a accès
          const defaultManagerAccess = [
            "dashboard", 
            "demandes", 
            "leads", 
            "clients", 
            "rendez-vous", 
            "emails", 
            "contacts", 
            "notifications",
            "paiements" // Accessible pour voir les commissions
          ];
          // Les responsables n'ont strictement accès qu'aux pages listées
          hasAccess = defaultManagerAccess.includes(pageName);
        }
      }
    } 
    // 7. Si pas de permissions spécifiques, utiliser les règles par défaut
    else {
      if (isUserAgent) {
        const defaultAgentAccess = ["dashboard", "demandes", "leads", "clients", "rendez-vous", "emails", "contacts"];
        hasAccess = defaultAgentAccess.includes(pageName);
      } else if (isUserManager) {
        // Liste exhaustive des pages auxquelles le manager a accès (sans administration)
        const defaultManagerAccess = [
          "dashboard", 
          "demandes", 
          "leads", 
          "clients", 
          "rendez-vous", 
          "emails", 
          "contacts", 
          "notifications",
          "paiements" // Accessible pour voir les commissions
        ];
        // Les responsables n'ont strictement accès qu'aux pages listées
        hasAccess = defaultManagerAccess.includes(pageName);
      }
    }
    
    // 8. Mettre en cache le résultat pour de futures vérifications
    try {
      sessionStorage.setItem(permissionCacheKey, hasAccess.toString());
    } catch (e) {
      // Ignorer les erreurs de stockage (par exemple en mode navigation privée)
    }
    
    return hasAccess;
  };

  // Définir les sections de menu en fonction des permissions de l'utilisateur
  // Section Général - filtrer selon les permissions
  const getGeneralItems = () => {
    const allItems = [
      {
        label: "Tableau de bord",
        path: "/admin/dashboard",
        page: "dashboard",
        icon: LayoutDashboard,
        badge: null
      },
      {
        label: "Demandes",
        path: "/admin/demandes",
        page: "demandes",
        icon: FileText,
        badge: null // Badges dynamiques
      },
      {
        label: "Paiements",
        path: "/admin/paiements",
        page: "paiements",
        icon: CreditCard,
        badge: null
      },
      {
        label: "Terminal de paiement",
        path: "/admin/terminal-paiement",
        page: "paiements", // Utilise la même permission que paiements
        icon: Terminal,
        badge: null
      },
      {
        label: "Débogage paiements",
        path: "/payment-debug",
        page: "paiements", // Utilise la même permission que paiements
        icon: Bug,
        badge: null
      },
      {
        label: "Statistiques",
        path: "/admin/user-statistics",
        page: "dashboard", // Accessible à tous ceux qui ont accès au dashboard
        icon: LineChart,
        badge: null
      }
    ];
    
    // Filtrer les items selon les permissions
    return allItems.filter(item => hasPagePermission(item.page));
  };
  
  // Section Gestion - accessible selon les permissions utilisateur
  const getGestionItems = () => {
    const allItems = [
      {
        label: "Clients",
        path: "/admin/clients",
        page: "clients",
        icon: Users,
        badge: null
      },
      {
        label: "Leads",
        path: "/admin/leads",
        page: "leads",
        icon: UserPlus,
        badge: null // Badges dynamiques
      },
      {
        label: "Rendez-vous",
        path: "/admin/rendez-vous",
        page: "rendez-vous",
        icon: Clock,
        badge: null // Badges dynamiques
      },
      {
        label: "Contacts",
        path: "/admin/contacts",
        page: "contacts", // Tout le monde a accès aux contacts
        icon: Mail,
        badge: unreadContactsCount || null
      },
      {
        label: "Mail",
        path: "/admin/mail",
        page: "emails",
        icon: Mail,
        badge: null
      }
    ];
    
    // Filtrer les items selon les permissions
    return allItems.filter(item => hasPagePermission(item.page));
  };
  
  // Section Administration - filtrer selon les permissions
  const getAdminItems = () => {
    const allItems = [
      {
        label: "Utilisateurs",
        path: "/admin/users",
        page: "users", // Admin uniquement
        icon: Users,
        badge: null
      },
      {
        label: "Paramètres",
        path: "/admin/settings",
        page: "settings", // Admin uniquement
        icon: Settings,
        badge: null
      },
      {
        label: "Animations",
        path: "/admin/animations",
        page: "animations", // Utilise la même permission que settings
        icon: Sparkles,
        badge: null
      },
      {
        label: "Config SMTP",
        path: "/admin/smtp",
        page: "emails", // Utilise la même permission que emails
        icon: MailCheck,
        badge: null
      },
      {
        label: "Google Snippets",
        path: "/admin/google-snippets",
        page: "settings", // Admin uniquement
        icon: Code,
        badge: null
      },
      {
        label: "Performance",
        path: "/admin/performance-monitor",
        page: "settings", // Admin uniquement
        icon: BarChart3,
        badge: null
      },
      {
        label: "Test Notifications",
        path: "/admin/notification-tests",
        page: "settings", // Admin uniquement
        icon: Bell,
        badge: null
      },
      {
        label: "Notifications",
        path: "/admin/notifications",
        page: "notifications", // Accessible à tous les utilisateurs
        icon: Bell,
        badge: unreadCount || null
      }
    ];
    
    // Filtrer les items selon les permissions
    return allItems.filter(item => hasPagePermission(item.page));
  };
  
  // Sections de menu filtrées selon le rôle utilisateur
  // Créer les sections de menu en fonction du rôle de l'utilisateur
  let menuSections: MenuSection[] = [
    {
      title: "Général",
      items: getGeneralItems()
    },
    {
      title: "Gestion",
      items: getGestionItems()
    }
  ];
  
  // La section Administration est visible uniquement pour les administrateurs
  if (isAdmin) {
    menuSections.push({
      title: "Administration",
      items: getAdminItems()
    });
  }
  
  return (
    <div className={cn("pb-12 h-full overflow-hidden flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between space-x-2">
            <h2 className="text-lg font-semibold tracking-tight text-gray-800">
              Administration
            </h2>
          </div>
        </div>
        
        {menuSections
          .filter(section => section.items.length > 0) // Ne montrer que les sections avec des éléments
          .map((section, index) => (
          <div key={index} className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Link key={itemIndex} href={item.path}>
                  <Button
                    variant={activePath === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge 
                        className="ml-auto" 
                        variant={activePath === item.path ? "default" : "secondary"}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link href="/logout">
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}