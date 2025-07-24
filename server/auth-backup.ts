import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { compare, hash } from "bcrypt";
import { USER_ROLES, users, activityLogs, ACTIVITY_ACTIONS } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import GlobalContext from "./global-context";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        username?: string;
        fullName?: string;
        permissions?: any[];
      };
    }
  }
}

// Cache pour stocker temporairement les permissions des utilisateurs
// Permet d'éviter de constamment récupérer et recalculer les permissions
const userPermissionsCache = new Map();

// Délais d'expiration du cache (en ms) - 30 minutes
const CACHE_TTL = 30 * 60 * 1000;

// Middleware d'authentification
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Check for auth token in headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: "Accès non autorisé" 
    });
  }
  
  try {
    // Vérifier si le token commence par "Bearer "
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7); // Enlever "Bearer " du début
      
      // Récupérer l'ID de l'utilisateur depuis le token (format : "user-{ID}")
      const userId = token.startsWith("user-") ? Number(token.slice(5)) : null;
      
      if (userId) {
        // OPTIMISATION: Vérifier d'abord si l'utilisateur est dans le cache
        if (userPermissionsCache.has(userId)) {
          const cachedUser = userPermissionsCache.get(userId);
          req.user = cachedUser.user;
          GlobalContext.setRequestingUser(cachedUser.user);
          next();
          return;
        }
        
        // Si non, récupérer l'utilisateur à partir de son ID
        const user = await storage.getUser(userId);
        
        if (user && user.active) {
          // C'est ici que nous calculons les permissions une seule fois
          let calculatedPermissions = [];
          
          try {
            calculatedPermissions = Array.isArray(user.permissions) ? [...user.permissions] : [];
            
            // Pour l'utilisateur admin, ajouter automatiquement toutes les permissions
            if (user.role === USER_ROLES.ADMIN && (!calculatedPermissions || !calculatedPermissions.length)) {
              calculatedPermissions = [
                { page: 'dashboard', canEdit: true, canView: true },
                { page: 'leads', canEdit: true, canView: true },
                { page: 'demandes', canEdit: true, canView: true },
                { page: 'paiements', canEdit: true, canView: true },
                { page: 'clients', canEdit: true, canView: true },
                { page: 'rendez-vous', canEdit: true, canView: true },
                { page: 'emails', canEdit: true, canView: true },
                { page: 'settings', canEdit: true, canView: true }
              ];
            }
            // Pour le manager, ajouter les permissions par défaut s'il n'en a pas de spécifiques
            else if (user.role === USER_ROLES.MANAGER && (!calculatedPermissions || !calculatedPermissions.length)) {
              calculatedPermissions = [
                { page: 'dashboard', canEdit: true, canView: true },
                { page: 'leads', canEdit: true, canView: true },
                { page: 'demandes', canEdit: true, canView: true },
                { page: 'paiements', canEdit: true, canView: true },
                { page: 'clients', canEdit: true, canView: true },
                { page: 'rendez-vous', canEdit: true, canView: true },
                { page: 'emails', canEdit: true, canView: true },
                { page: 'tasks', canEdit: true, canView: true },
                { page: 'stats', canEdit: true, canView: true },
                { page: 'contacts', canEdit: true, canView: true },
                { page: 'notifications', canEdit: true, canView: true },
                // Aucun accès aux sections d'administration (définition explicite)
                { page: 'settings', canEdit: false, canView: false },
                { page: 'configuration', canEdit: false, canView: false },
                { page: 'users', canEdit: false, canView: false },
                { page: 'animations', canEdit: false, canView: false },
                { page: 'google-snippets', canEdit: false, canView: false },
                { page: 'notification-tests', canEdit: false, canView: false },
                { page: 'smtp', canEdit: false, canView: false },
                { page: 'smtp-settings', canEdit: false, canView: false },
                { page: 'performance-monitor', canEdit: false, canView: false }
              ];
            }
            // Pour l'agent, ajouter les permissions par défaut s'il n'en a pas de spécifiques
            else if (user.role === USER_ROLES.AGENT && (!calculatedPermissions || !calculatedPermissions.length)) {
              calculatedPermissions = [
                { page: 'dashboard', canEdit: false, canView: true },
                { page: 'leads', canEdit: true, canView: true },
                { page: 'demandes', canEdit: true, canView: true },
                { page: 'paiements', canEdit: false, canView: true },
                { page: 'clients', canEdit: false, canView: true },
                { page: 'rendez-vous', canEdit: false, canView: true },
                { page: 'emails', canEdit: false, canView: false },
                { page: 'settings', canEdit: false, canView: false }
              ];
            }
          } catch (error) {
            console.error("Erreur lors du calcul des permissions:", error);
            calculatedPermissions = [];
          }
          
          // Créer l'objet utilisateur pour la requête avec les permissions calculées
          const userObj = { 
            id: user.id, 
            role: user.role,
            username: user.username,
            fullName: user.fullName,
            permissions: calculatedPermissions
          };
          
          // Mettre en cache les données de l'utilisateur pour les prochaines requêtes
          userPermissionsCache.set(userId, {
            user: userObj,
            timestamp: Date.now()
          });
          
          // Définir l'utilisateur pour la requête
          req.user = userObj;
          
          // Définir l'utilisateur actuel dans le contexte global
          GlobalContext.setRequestingUser(userObj);
          next();
          return;
        }
      } 
      // Support du token admin pour la compatibilité
      else if (token === "admin-token") {
        // Vérifier d'abord si admin est dans le cache
        if (userPermissionsCache.has('admin-token')) {
          const cachedUser = userPermissionsCache.get('admin-token');
          req.user = cachedUser.user;
          GlobalContext.setRequestingUser(cachedUser.user);
          next();
          return;
        }
        
        // Trouver l'utilisateur admin
        const adminUser = await storage.getUserByUsername("admin");
        
        if (adminUser) {
          // Calculer les permissions admin une seule fois
          const adminPermissions = [
            { page: 'dashboard', canEdit: true, canView: true },
            { page: 'leads', canEdit: true, canView: true },
            { page: 'demandes', canEdit: true, canView: true },
            { page: 'paiements', canEdit: true, canView: true },
            { page: 'clients', canEdit: true, canView: true },
            { page: 'rendez-vous', canEdit: true, canView: true },
            { page: 'emails', canEdit: true, canView: true },
            { page: 'settings', canEdit: true, canView: true }
          ];
          
          // Créer l'objet utilisateur pour la requête
          const userObj = { 
            id: adminUser.id, 
            role: "admin",
            username: adminUser.username,
            fullName: adminUser.fullName,
            permissions: adminPermissions
          };
          
          // Mettre en cache les données admin
          userPermissionsCache.set('admin-token', {
            user: userObj,
            timestamp: Date.now()
          });
          
          // Définir l'utilisateur pour la requête
          req.user = userObj;
          
          // Définir l'utilisateur actuel dans le contexte global
          GlobalContext.setRequestingUser(userObj);
          next();
          return;
        }
      }
    }
    
    // Si nous arrivons ici, le token est invalide
    return res.status(401).json({ 
      success: false, 
      message: "Token invalide" 
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Token invalide" 
    });
  }
};

// Nettoyer le cache des utilisateurs expirés toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  userPermissionsCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      userPermissionsCache.delete(key);
    }
  });
}, 5 * 60 * 1000);

// Middleware de vérification des rôles
export const requireAdmin = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentification requise" 
      });
    }
    
    // Vérifier si l'utilisateur a le rôle requis
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès non autorisé pour votre rôle" 
      });
    }
    
    // Utilisateur authentifié et autorisé
    next();
  };
};

// Handler de connexion
export const loginHandler = async (req: Request, res: Response) => {
  const { username, password, rememberMe } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Identifiant et mot de passe requis" 
    });
  }
  
  try {
    // Rechercher l'utilisateur par son nom d'utilisateur
    const user = await storage.getUserByUsername(username);
    
    // Enregistrer l'adresse IP pour le logging
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!user) {
      // Log simple sans base de données pour éviter les erreurs
      console.log(`Tentative de connexion échouée: utilisateur '${username}' non trouvé depuis ${ipAddress}`);
      
      return res.status(401).json({ 
        success: false, 
        message: "Identifiants invalides" 
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      // Log simple sans base de données pour éviter les erreurs
      console.log(`Tentative de connexion d'un utilisateur inactif: '${username}' depuis ${ipAddress}`);
      
      return res.status(401).json({ 
        success: false, 
        message: "Compte désactivé" 
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      // Log simple sans base de données pour éviter les erreurs
      console.log(`Mot de passe incorrect pour '${username}' depuis ${ipAddress}`);
      
      return res.status(401).json({ 
        success: false, 
        message: "Identifiants invalides" 
      });
    }
    
    // Log simple de la connexion réussie
    console.log(`Connexion réussie pour '${username}' depuis ${ipAddress}`);
    
    // Skip last login update for now - proceed with successful login
    
    // Création du token (dans une vraie app, ce serait un JWT)
    const token = `user-${user.id}`;
    
    // Calculer les permissions utilisateur une seule fois lors de la connexion
    let calculatedPermissions = [];
    
    try {
      calculatedPermissions = Array.isArray(user.permissions) ? [...user.permissions] : [];
      
      // Pour l'utilisateur admin, ajouter automatiquement toutes les permissions
      if (user.role === USER_ROLES.ADMIN && (!calculatedPermissions || !calculatedPermissions.length)) {
        calculatedPermissions = [
          { page: 'dashboard', canEdit: true, canView: true },
          { page: 'leads', canEdit: true, canView: true },
          { page: 'demandes', canEdit: true, canView: true },
          { page: 'paiements', canEdit: true, canView: true },
          { page: 'clients', canEdit: true, canView: true },
          { page: 'rendez-vous', canEdit: true, canView: true },
          { page: 'emails', canEdit: true, canView: true },
          { page: 'notifications', canEdit: true, canView: true },
          { page: 'settings', canEdit: true, canView: true }
        ];
      }
      // Pour le manager, ajouter les permissions par défaut s'il n'en a pas de spécifiques
      else if (user.role === USER_ROLES.MANAGER && (!calculatedPermissions || !calculatedPermissions.length)) {
        calculatedPermissions = [
          { page: 'dashboard', canEdit: true, canView: true },
          { page: 'leads', canEdit: true, canView: true },
          { page: 'demandes', canEdit: true, canView: true },
          { page: 'paiements', canEdit: true, canView: true },
          { page: 'clients', canEdit: true, canView: true },
          { page: 'rendez-vous', canEdit: true, canView: true },
          { page: 'emails', canEdit: true, canView: true },
          { page: 'notifications', canEdit: true, canView: true },
          { page: 'settings', canEdit: false, canView: false }
        ];
      }
      // Pour l'agent, ajouter les permissions par défaut s'il n'en a pas de spécifiques
      else if (user.role === USER_ROLES.AGENT && (!calculatedPermissions || !calculatedPermissions.length)) {
        calculatedPermissions = [
          { page: 'dashboard', canEdit: false, canView: true },
          { page: 'leads', canEdit: true, canView: true },
          { page: 'demandes', canEdit: true, canView: true },
          { page: 'paiements', canEdit: false, canView: true },
          { page: 'clients', canEdit: false, canView: true },
          { page: 'rendez-vous', canEdit: false, canView: true },
          { page: 'notifications', canEdit: false, canView: true },
          { page: 'emails', canEdit: false, canView: false },
          { page: 'settings', canEdit: false, canView: false }
        ];
      }
    } catch (error) {
      console.error("Erreur lors du calcul des permissions:", error);
      calculatedPermissions = [];
    }
    
    // Ajouter l'utilisateur au cache avec ses permissions pré-calculées
    const userObj = { 
      id: user.id, 
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      permissions: calculatedPermissions
    };
    
    userPermissionsCache.set(user.id, {
      user: userObj,
      timestamp: Date.now()
    });

    // Retourner les informations de l'utilisateur et le token
    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          permissions: calculatedPermissions,
        },
        token,
        expires: rememberMe ? "30d" : "24h"
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la connexion" 
    });
  }
};

// Fonctions utilitaires pour le hachage et la vérification des mots de passe
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 10);
};

export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await compare(plainPassword, hashedPassword);
};

// Register handler - only for first admin user creation
// Vérifier si l'utilisateur a accès aux fonctionnalités d'administration
export const isAdminUser = (user: any): boolean => {
  if (!user || !user.role) return false;
  
  // Seuls les administrateurs ont accès aux fonctionnalités d'administration
  return user.role.toLowerCase() === USER_ROLES.ADMIN.toLowerCase();
};

// Middleware spécifique pour les routes d'administration (seul l'admin peut y accéder)
export const adminOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !isAdminUser(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Accès refusé. Cette fonctionnalité est réservée aux administrateurs."
    });
  }
  
  next();
};

export const registerInitialAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      
      // Mise à jour du mot de passe administrateur à p4sSw0rD
      const hashedPassword = await hashPassword("p4sSw0rD");
      
      // Vérifier si le mot de passe doit être mis à jour
      const adminPasswordCheck = await comparePasswords("p4sSw0rD", existingAdmin.password);
      if (!adminPasswordCheck) {
        // Mettre à jour le mot de passe admin s'il ne correspond pas
        await storage.updateUserPassword(existingAdmin.id, hashedPassword);
        console.log("Mot de passe administrateur mis à jour vers p4sSw0rD");
      }
      
      return;
    }
    
    // Hash password - utiliser p4sSw0rD au lieu de admin123
    const hashedPassword = await hashPassword("p4sSw0rD");
    
    // Create admin user with all required fields
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      fullName: "Administrateur",
      email: "admin@example.com",
      role: USER_ROLES.ADMIN,
      active: true
    });
    
    console.log("Initial admin user created successfully");
  } catch (error) {
    console.error("Error creating initial admin user:", error);
  }
};
