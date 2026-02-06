import { ReactNode, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Loader2, Zap, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@shared/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interface pour définir les données utilisateur
interface UserData {
  id: number;
  role: string;
  username: string;
  permissions?: {
    page: string;
    canView: boolean;
    canEdit: boolean;
  }[];
  [key: string]: any;
}

interface AdminProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

// Simple loader for CRM performance
const CrmLoaderAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full crm-essential-spinner"></div>
      <span className="ml-3 text-indigo-700 font-medium">Chargement...</span>
    </div>
  );
};

export default function AdminProtectedRoute({ 
  children, 
  allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MANAGER] // Par défaut, seuls admin et manager
}: AdminProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  // Fonction optimisée et simplifiée pour vérifier l'accès à une page
  const checkPagePermission = useCallback((userData: UserData, pageName: string): boolean => {
    // Vérification beaucoup plus simple et rapide
    
    // 1. Admin a toujours tous les accès
    if (userData.role.toLowerCase() === 'admin') {
      return true;
    }
    
    // 2. Cache de session pour les performances
    const permissionCacheKey = `perm_${userData.id}_${pageName}`;
    const cachedPermission = sessionStorage.getItem(permissionCacheKey);
    
    if (cachedPermission) {
      return cachedPermission === 'true';
    }
    
    // 3. Vérification simplifiée des permissions
    if (userData.role.toLowerCase() === 'manager') {
      // Manager a accès à presque tout par défaut sauf settings
      const hasAccess = pageName !== 'settings';
      sessionStorage.setItem(permissionCacheKey, hasAccess.toString());
      return hasAccess;
    }
    
    if (userData.role.toLowerCase() === 'agent') {
      // Agent a accès limité mais large
      const agentRestrictedPages = ["settings", "users", "system", "analytics", "audit"];
      const hasAccess = !agentRestrictedPages.includes(pageName);
      sessionStorage.setItem(permissionCacheKey, hasAccess.toString());
      return hasAccess;
    }
    
    // Par défaut, pas d'accès
    sessionStorage.setItem(permissionCacheKey, 'false');
    return false;
  }, []);

  useEffect(() => {
    // Version hautement simplifiée et optimisée
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin");
          return;
        }
        
        // Système de cache avec validité étendue (30 minutes)
        const userStr = localStorage.getItem("adminUser");
        const lastCheckStr = localStorage.getItem("lastAuthCheck");
        const now = new Date().getTime();
        const lastCheck = lastCheckStr ? parseInt(lastCheckStr) : 0;
        const timeSinceLastCheck = now - lastCheck;
        
        // Cache de 30 minutes pour éviter les vérifications trop fréquentes
        const hasRecentData = userStr && timeSinceLastCheck < 1800000; // 30 minutes
        
        // Page courante
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
        
        // Si nous avons des données récentes, les utiliser immédiatement
        if (hasRecentData && userStr) {
          const userData = JSON.parse(userStr);
          
          if (userData && userData.id && userData.role) {
            setIsAuthenticated(true);
            
            // Vérifications simplifiées - support des rôles standards
            const userRole = userData.role.toLowerCase();
            const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
            
            if (userRole === 'admin' || normalizedAllowedRoles.includes(userRole) || userRole === 'manager') {
              setHasRequiredRole(true);
              setIsLoading(false);
              return;
            }
            
            // Vérification des permissions simplifiée
            const hasPermission = checkPagePermission(userData, currentPage);
            
            if (hasPermission) {
              setHasRequiredRole(true);
              setIsLoading(false);
              return;
            }
            
            // Accès refusé
            setHasRequiredRole(false);
            setIsLoading(false);
            
            toast({
              title: "Accès refusé",
              description: "Redirection vers le tableau de bord...",
              variant: "destructive",
            });
            
            navigate("/admin/dashboard");
            return;
          }
        }
        
        // Si pas de données récentes, vérifier avec le serveur
        const response = await fetch(`/api/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/admin");
          return;
        }
        
        const userData: UserData = await response.json();
        
        // Validation minimum des données
        if (!userData || !userData.id || !userData.role) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate("/admin");
          return;
        }
        
        // Mettre à jour le cache
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("lastAuthCheck", now.toString());
        localStorage.setItem("userRole", userData.role);
        
        setIsAuthenticated(true);
        
        // Vérifications simplifiées - support des rôles standards
        const userRole = userData.role.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
        
        if (userRole === 'admin' || normalizedAllowedRoles.includes(userRole) || userRole === 'manager') {
          setHasRequiredRole(true);
          setIsLoading(false);
          return;
        }
        
        // Vérification des permissions simplifiée
        const hasPermission = checkPagePermission(userData, currentPage);
        setHasRequiredRole(hasPermission);
        setIsLoading(false);
        
        if (!hasPermission) {
          toast({
            title: "Accès refusé",
            description: "Redirection vers le tableau de bord...",
            variant: "destructive",
          });
          navigate("/admin/dashboard");
        }
        
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/admin");
      }
    };
    
    // Exécuter la vérification
    checkAuth();
    
  }, [navigate, toast, allowedRoles, checkPagePermission]);
  
  // Animation de chargement CRM spéciale
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-6">
        <CrmLoaderAnimation />
        <div className="text-indigo-600 font-medium">
          <p className="text-sm">Connexion au système...</p>
        </div>
      </div>
    );
  }
  
  // Si l'authentification échoue, afficher un message clair avant la redirection
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 p-6">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertDescription className="py-2 text-red-700 flex items-center gap-2">
            <span>Redirection vers la page de connexion...</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Si l'utilisateur n'a pas le rôle requis, afficher un message explicatif
  if (!hasRequiredRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 p-6">
        <Alert className="max-w-md bg-amber-50 border-amber-200">
          <AlertDescription className="py-2 text-amber-700 flex items-center gap-2">
            <span>Redirection vers le tableau de bord...</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Afficher le contenu protégé
  return <>{children}</>;
}