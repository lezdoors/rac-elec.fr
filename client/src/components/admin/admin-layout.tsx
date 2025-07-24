import { ReactNode } from "react";
import { useLocation } from "wouter";
import { SideNav } from "./side-nav";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmailNotificationDropdown } from "./email-notification-dropdown";
import { NotificationDropdown } from "./notification-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
import { WebSocketStatus } from "./websocket-status";

// Composant pour afficher un message de bienvenue personnalisé
function UserWelcome() {
  // Utiliser le hook d'authentification pour obtenir l'utilisateur
  const { user } = useAuth();
  // État local pour stocker le nom d'utilisateur récupéré directement
  const [directUsername, setDirectUsername] = useState<string | null>(null);
  
  // Effet optimisé pour récupérer les données utilisateur
  // Utilise d'abord les données locales pour plus de fluidité
  useEffect(() => {
    // D'abord, essayer de récupérer les données du localStorage
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData && (userData.fullName || userData.username)) {
          // Utiliser les données du cache immédiatement pour l'affichage
          const displayName = userData.fullName || userData.username || userData.email || "Utilisateur";
          setDirectUsername(displayName);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture des données utilisateur du cache:", error);
      }
    }
    
    // Fonction pour récupérer les données utilisateur du serveur
    async function fetchCurrentUser() {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          return;
        }
        
        // Faire une requête au serveur - plus simple sans les paramètres anti-cache
        const response = await fetch(`/api/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
        
        if (!response.ok) {
          return;
        }
        
        const userData = await response.json();
        
        // Vérification des données reçues
        if (!userData || !userData.id) {
          return;
        }
        
        // Mettre à jour le nom d'utilisateur à afficher
        const displayName = userData.fullName || userData.username || userData.email || "Utilisateur";
        setDirectUsername(displayName);
        
        // Stocker les données dans localStorage
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("lastUserCheck", new Date().getTime().toString());
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    }
    
    // Exécuter la requête une fois au montage
    fetchCurrentUser();
    
    // Désactivé pour améliorer les performances - plus besoin de rafraîchir constamment
    // const interval = setInterval(fetchCurrentUser, 30000); // Toutes les 30 secondes au lieu de 3
    // return () => clearInterval(interval);
  }, []);
  
  // Désactivation des logs de débogage pour améliorer les performances
  // console.log("UserWelcome - Données utilisateur du hook:", user);
  // console.log("UserWelcome - Nom récupéré directement:", directUsername);
  
  // Si nous avons un nom récupéré directement, l'utiliser en priorité
  const displayName = directUsername || 
                     (user ? (user.fullName || user.username || user.email || "Utilisateur") : "Utilisateur");
  
  return (
    <span className="text-sm text-gray-600 font-normal ml-2">
      Bonjour <span className="text-blue-600 font-medium">{displayName}</span>
    </span>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ 
  children, 
  title = 'Tableau de bord', 
  description 
}: AdminLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    // Fermer automatiquement la sidebar sur mobile au chargement
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Handle responsive layout
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <WebSocketProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar pour la navigation */}
        <div 
          className={`fixed inset-y-0 z-50 flex w-72 flex-col bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ height: "100vh" }}
        >
          <SideNav activePath={location} />
          
          {/* Bouton pour fermer la sidebar sur mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Contenu principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* En-tête */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-2 md:gap-4 border-b bg-white px-3 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            <div className="flex-1 min-w-0"> {/* min-w-0 empêche le débordement */}
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold truncate">{title}</h1>
                <UserWelcome />
                <div className="ml-2">
                  <WebSocketStatus />
                </div>
              </div>
              {description && (
                <p className="text-sm text-gray-500 truncate hidden sm:block">{description}</p>
              )}
            </div>
            
            {/* Badges de notification */}
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <EmailNotificationDropdown />
            </div>
          </header>
          
          {/* Contenu de la page */}
          <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
            {children}
          </main>
        </div>
        
        {/* Overlay pour fermer la sidebar sur mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </WebSocketProvider>
  );
}

export default AdminLayout;