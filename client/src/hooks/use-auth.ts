import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type pour les utilisateurs
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  fullName?: string;
  createdAt: string;
  lastLogin?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpEnabled?: boolean;
  commissionEnabled?: boolean;
  commissionRate?: number;
  onboardingCompleted?: boolean;
  [key: string]: any;
}

// Type pour les données de connexion
type LoginData = {
  username: string;
  password: string;
};

// Type pour les données d'inscription
type RegisterData = {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  role?: string;
};

// FONCTION OPTIMISÉE : Récupération des données utilisateur avec gestion avancée du cache
// Pour réduire les appels au serveur et améliorer les performances
const fetchUser = async (): Promise<User | null> => {
  try {
    // Vérifier d'abord si nous avons un adminToken
    const token = localStorage.getItem("adminToken");
    
    // Si pas de token, on ne peut pas authentifier l'utilisateur
    if (!token) {
      console.log("fetchUser - Pas de token, utilisateur non authentifié");
      // S'assurer que toutes les données sont nettoyées
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      return null;
    }

    // OPTIMISATION: Vérifier d'abord les données en cache
    const userStr = localStorage.getItem("adminUser");
    const lastCheckStr = localStorage.getItem("lastAuthCheck");
    const now = new Date().getTime();
    const lastCheck = lastCheckStr ? parseInt(lastCheckStr) : 0;
    const timeSinceLastCheck = now - lastCheck;
    
    // Utiliser un cache plus long (15 minutes) pour réduire les appels répétés
    const CACHE_VALIDITY = 15 * 60 * 1000; // 15 minutes
    
    // Si nous avons des données récentes en cache, les utiliser
    if (userStr && timeSinceLastCheck < CACHE_VALIDITY) {
      try {
        const cachedUser = JSON.parse(userStr);
        // Vérifier que les données sont valides
        if (cachedUser && cachedUser.id && cachedUser.username && cachedUser.role) {
          console.log(`fetchUser - Utilisation des données en cache (${Math.round(timeSinceLastCheck/1000)}s)`); 
          return { ...cachedUser };
        }
      } catch (e) {
        console.error("Erreur lors de la lecture du cache:", e);
        // Continuer pour récupérer de nouvelles données
      }
    }
    
    // Générer un timestamp pour éviter le cache du navigateur
    const timestamp = new Date().getTime();
    console.log(`fetchUser - Requête directe au serveur avec timestamp: ${timestamp}`);
    
    // REQUÊTE DIRECTE avec cache-busting
    const res = await fetch(`/api/user?_t=${timestamp}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      credentials: "include"
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Si non autorisé, nettoyer localStorage
        console.log("fetchUser - Token invalide (401), nettoyage des données locales");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        sessionStorage.clear();
        return null;
      }
      // Journaliser le statut exact pour faciliter le débogage
      console.error(`Échec de récupération des données utilisateur - Statut HTTP: ${res.status}`);
      throw new Error(`Échec de récupération des données utilisateur - Statut: ${res.status}`);
    }
    
    // Données récupérées avec succès 
    const userData = await res.json();
    console.log(`fetchUser - Utilisateur récupéré du serveur au timestamp ${timestamp}`);
    
    // Vérification rigoureuse des données reçues
    if (!userData || typeof userData !== 'object') {
      console.error("Données utilisateur invalides (format incorrect)", userData);
      return null;
    }
    
    if (!userData.id || !userData.username || !userData.role) {
      console.error("Données utilisateur incomplètes", userData);
      return null;
    }
    
    // Mise à jour des données utilisateur en localStorage avec timestamp
    localStorage.setItem("adminUser", JSON.stringify(userData));
    localStorage.setItem("lastAuthCheck", now.toString());
    console.log(`Utilisateur mis à jour en cache: ${userData.username} (${userData.role})`);
    
    // IMPORTANT: Retourner une COPIE des données pour éviter les références partagees
    return { ...userData };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

// Hook d'authentification pour l'application
export function useAuth() {
  const { toast } = useToast();

  // Requête pour récupérer l'utilisateur courant - avec une stratégie optimisée
  // qui favorise les performances tout en gardant une certaine fraicheur des données
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: fetchUser,
    // Stratégie de cache optimisée pour un maximum de performance avec mise en cache améliorée
    staleTime: 5 * 60 * 1000,    // Considérer les données fraîches pendant 5 minutes
    gcTime: 20 * 60 * 1000,     // Garder en cache pendant 20 minutes
    refetchInterval: 10 * 60 * 1000, // Rafraichir seulement toutes les 10 minutes
    refetchOnMount: false,   // Ne pas rafraîchir au montage car nous utilisons notre propre cache
    refetchOnWindowFocus: false, // Ne pas rafraichir quand la fenêtre reprend le focus
  });
  
  // Forcer une revalidation immédiate des données après le montage initial
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("useAuth - Refetch forcé des données utilisateur");
      refetch();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [refetch]);

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        // D'abord, nettoyer toutes les données précédentes
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        
        console.log("Tentative de connexion pour:", credentials.username);
        
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials),
          credentials: "include"
        });
        
        // Convertir la réponse en JSON une seule fois
        const responseData = await res.json();
        
        if (!res.ok) {
          throw new Error(responseData.message || "Échec de connexion");
        }
        
        console.log("Réponse de connexion complète:", responseData);
        
        // Stocker le token dans le localStorage
        if (responseData.token) {
          localStorage.setItem("adminToken", responseData.token);
          console.log("Token stocké:", responseData.token);
        }
        
        return responseData;
      } catch (error) {
        console.error("Erreur de connexion:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // S'assurer que nous avons bien des données utilisateur
      if (!data.user || !data.user.id || !data.user.role) {
        console.error("Données utilisateur invalides reçues:", data);
        toast({
          title: "Erreur d'authentification",
          description: "Données utilisateur invalides. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // SOLUTION EXTRÊME : Nettoyage total avant stockage des nouvelles données
      console.log("Connexion réussie - NETTOYAGE RADICAL avant affichage de l'interface de", data.user.username);
      
      // 1. Supprimer TOUTES les données locales existantes
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Nettoyer les cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 3. Vider le cache React Query
      queryClient.clear();
      
      // 4. Stocker les nouvelles informations d'authentification
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      localStorage.setItem("lastLoginTime", new Date().toString());
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id.toString());
      
      // Notification avant le rechargement
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${data.user.fullName || data.user.username}! Chargement de votre interface...`,
      });
      
      // SOLUTION ABSOLUE : Forcer un HARD RELOAD complet du navigateur
      // Ce qui efface tous les caches, incluant le cache HTTP et les workers
      setTimeout(() => {
        console.log("HARD RELOAD complet du navigateur...");
        window.location.href = "/admin/dashboard?t=" + new Date().getTime();
        // Force le navigateur à récupérer une nouvelle page sans utiliser le cache
      }, 800);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec d'inscription");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Début du processus de déconnexion");
      // D'abord nettoyer les données locales avant même d'envoyer la requête
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      queryClient.setQueryData(["/api/user"], null);

      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Échec de déconnexion");
      }
    },
    onSuccess: () => {
      // SOLUTION RADICALE: Nettoyage complet et rechargement total
      console.log("Déconnexion - Nettoyage complet des données en cours...");
      
      // 1. Nettoyer les requêtes React Query
      queryClient.clear();
      
      // 2. Nettoyer entièrement localStorage
      localStorage.clear();
      
      // 3. Nettoyer sessionStorage
      sessionStorage.clear();
      
      // 4. Réinitialiser les cookies en les faisant expirer
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log("Déconnexion effectuée - Données utilisateur supprimées");
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté.",
      });
      
      // Rediriger avec un rafraîchissement complet après un court délai
      setTimeout(() => {
        console.log("Redirection vers la page d'authentification...");
        window.location.href = "/admin";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };
}