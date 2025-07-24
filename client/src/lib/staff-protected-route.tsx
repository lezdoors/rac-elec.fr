import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@shared/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StaffProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function StaffProtectedRoute({ 
  children, 
  allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MANAGER] // Par défaut, seuls admin et manager
}: StaffProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin");
          return;
        }
        
        // Système de cache avec vérification d'âge
        const userStr = localStorage.getItem("adminUser");
        const lastCheckStr = localStorage.getItem("lastAuthCheck");
        const now = new Date().getTime();
        const lastCheck = lastCheckStr ? parseInt(lastCheckStr) : 0;
        const timeSinceLastCheck = now - lastCheck;
        
        // Utiliser le cache si moins de 5 minutes
        const cacheExpiration = 5 * 60 * 1000; // 5 minutes
        
        if (userStr && timeSinceLastCheck < cacheExpiration) {
          const userData = JSON.parse(userStr);
          
          if (userData && userData.id && userData.role) {
            setIsAuthenticated(true);
            
            // Vérifier si l'utilisateur a un rôle autorisé
            if (allowedRoles.includes(userData.role)) {
              setHasRequiredRole(true);
            } else {
              setHasRequiredRole(false);
              
              toast({
                title: "Accès refusé",
                description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
                variant: "destructive",
              });
              navigate("/admin/dashboard");
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // Si pas de cache ou cache expiré, faire une requête au serveur
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Cache-Control": "no-cache"
          },
          credentials: "include"
        });
        
        if (!response.ok) {
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          setIsLoading(false);
          navigate("/admin");
          return;
        }
        
        const userData = await response.json();
        
        if (!userData || !userData.id || !userData.role) {
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          setIsLoading(false);
          navigate("/admin");
          return;
        }
        
        // Mettre à jour le cache
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("lastAuthCheck", now.toString());
        localStorage.setItem("userRole", userData.role);
        
        setIsAuthenticated(true);
        
        // Vérifier si l'utilisateur a un rôle autorisé
        if (allowedRoles.includes(userData.role)) {
          setHasRequiredRole(true);
        } else {
          setHasRequiredRole(false);
          
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
            variant: "destructive",
          });
          navigate("/admin/dashboard");
        }
        
        setIsLoading(false);
        
      } catch (error) {
        console.error("Erreur lors de la vérification des accès:", error);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        setIsLoading(false);
        navigate("/admin");
      }
    };
    
    checkAuth();
    
  }, [navigate, toast, allowedRoles]);
  
  // Affichage du loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <div className="text-gray-600 font-medium text-center">
          <p className="text-sm">Vérification des permissions d'accès...</p>
        </div>
      </div>
    );
  }
  
  // Si l'authentification échoue
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 p-6">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertDescription className="py-2 text-red-700 flex items-center gap-2">
            <span>Authentification requise. Vous allez être redirigé vers la page de connexion...</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Si l'utilisateur n'a pas le rôle requis
  if (!hasRequiredRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 p-6">
        <Alert className="max-w-md bg-amber-50 border-amber-200">
          <AlertDescription className="py-2 text-amber-700 flex items-center gap-2">
            <span>Accès insuffisant. Vous allez être redirigé vers le tableau de bord...</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Afficher le contenu protégé
  return <>{children}</>;
}