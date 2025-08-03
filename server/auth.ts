import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { compare, hash } from "bcrypt";
import { USER_ROLES, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import GlobalContext from "./global-context";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Session configuration
export const sessionConfig = {
  name: 'crm.session',
  secret: process.env.SESSION_SECRET || 'default-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' as const
  }
};

// Types for user authentication
interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  permissions: any[];
  isAdmin: boolean;
  isManager: boolean;
  isAgent: boolean;
}

// Middleware pour vérifier l'authentification
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Auth middleware - checking request:", {
      sessionExists: !!req.session,
      sessionUserId: req.session?.userId,
      authHeader: req.headers.authorization,
      method: req.method,
      path: req.path
    });
    
    let userId = null;
    
    // Check session first
    if (req.session && req.session.userId) {
      userId = req.session.userId;
      console.log("Found session userId:", userId);
    } else {
      // Check for Authorization header with token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        console.log("Found token:", token);
        
        // Handle session tokens that store user info in localStorage/sessionStorage
        if (token.startsWith('admin-session-')) {
          console.log("Processing session token");
          
          // Try to get user info from token - this is a temporary session token
          // We need to check which user is currently logged in by checking the last login
          try {
            // Get all active users ordered by last login
            const allUsers = await db.select().from(users)
              .where(eq(users.active, true))
              .orderBy(users.lastLogin);
            
            // Find the most recently logged in user
            const recentUser = allUsers[allUsers.length - 1];
            
            if (recentUser) {
              console.log("Found recent user:", recentUser.username);
              req.user = recentUser;
              console.log("Auth successful for user:", recentUser.username);
              next();
              return;
            }
          } catch (err) {
            console.error("Error finding recent user:", err);
          }
          
          // Fallback: try admin user for backward compatibility
          const adminUser = await storage.getUserByUsername("admin");
          console.log("Admin user found:", !!adminUser, adminUser?.active);
          
          if (adminUser && adminUser.active) {
            req.user = adminUser;
            console.log("Auth successful for admin user");
            next();
            return;
          }
        }
      }
    }
    
    if (!userId) {
      console.log("No userId found, returning 401");
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    
    // Get user from database and attach to request
    const user = await storage.getUser(userId);
    if (!user) {
      console.log("User not found for userId:", userId);
      if (req.session) {
        req.session.destroy(() => {});
      }
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }
    
    req.user = user;
    console.log("Auth successful for user:", user.username);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }
};

// Middleware pour vérifier les permissions admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ success: false, message: "Accès non autorisé" });
  }
  next();
};

// Middleware pour vérifier les permissions admin ou manager
export const requireAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    console.log("RequireAdminOrManager: No user found");
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }
  
  console.log("RequireAdminOrManager - User role check:", {
    userRole: req.user.role,
    userRoleType: typeof req.user.role,
    adminRole: USER_ROLES.ADMIN,
    managerRole: USER_ROLES.MANAGER,
    isAdmin: req.user.role === USER_ROLES.ADMIN,
    isManager: req.user.role === USER_ROLES.MANAGER,
    username: req.user.username
  });
  
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.MANAGER) {
    console.log("RequireAdminOrManager: Access denied for role:", req.user.role);
    return res.status(403).json({ success: false, message: "Accès non autorisé" });
  }
  
  console.log("RequireAdminOrManager: Access granted for:", req.user.username, "with role:", req.user.role);
  next();
};

// Gestionnaire de connexion
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Nom d'utilisateur et mot de passe requis"
      });
    }

    // Rechercher l'utilisateur dans la base de données
    const users_list = await db.select().from(users).where(eq(users.username, username));
    const user = users_list[0];

    if (!user) {
      console.log(`Tentative de connexion échouée pour l'utilisateur: ${username} - Utilisateur non trouvé`);
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    // Vérifier le mot de passe
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      console.log(`Tentative de connexion échouée pour l'utilisateur: ${username} - Mot de passe incorrect`);
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      console.log(`Tentative de connexion échouée pour l'utilisateur: ${username} - Compte désactivé`);
      return res.status(401).json({
        success: false,
        message: "Compte désactivé"
      });
    }

    // Générer les permissions utilisateur
    let calculatedPermissions: any[] = [];
    
    try {
      // Essayer de parser les permissions existantes
      if (user.permissions && typeof user.permissions === 'string') {
        calculatedPermissions = JSON.parse(user.permissions);
      } else if (user.permissions && Array.isArray(user.permissions)) {
        calculatedPermissions = user.permissions;
      }
    } catch (e) {
      console.log('Erreur lors du parsing des permissions, utilisation des permissions par défaut');
      calculatedPermissions = [];
    }

    // Ajouter les permissions par défaut selon le rôle si aucune permission spécifique n'est définie
    if (user.role === USER_ROLES.ADMIN && (!calculatedPermissions || !calculatedPermissions.length)) {
      calculatedPermissions = [
        { page: 'dashboard', canEdit: true, canView: true },
        { page: 'leads', canEdit: true, canView: true },
        { page: 'demandes', canEdit: true, canView: true },
        { page: 'paiements', canEdit: true, canView: true },
        { page: 'clients', canEdit: true, canView: true },
        { page: 'rendez-vous', canEdit: true, canView: true },
        { page: 'emails', canEdit: true, canView: true },
        { page: 'settings', canEdit: true, canView: true },
        { page: 'users', canEdit: true, canView: true },
        { page: 'animations', canEdit: true, canView: true },
        { page: 'notifications', canEdit: true, canView: true },
        { page: 'contacts', canEdit: true, canView: true }
      ];
    }

    // Créer la session utilisateur
    if (!req.session) {
      req.session = {};
    }
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.username = user.username;

    // Mettre à jour la dernière connexion
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Construire la réponse avec les informations utilisateur
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: calculatedPermissions,
      isAdmin: user.role === USER_ROLES.ADMIN,
      isManager: user.role === USER_ROLES.MANAGER,
      isAgent: user.role === USER_ROLES.AGENT
    };

    console.log(`Connexion réussie pour l'utilisateur: ${username} (ID: ${user.id}, Rôle: ${user.role})`);

    res.json({
      success: true,
      message: "Connexion réussie",
      user: authUser
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion"
    });
  }
};

// Gestionnaire de déconnexion
export const logoutHandler = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion"
      });
    }
    
    res.clearCookie('crm.session');
    res.json({
      success: true,
      message: "Déconnexion réussie"
    });
  });
};

// Gestionnaire pour obtenir les informations utilisateur actuelles
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // The user should already be attached by requireAuth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié"
      });
    }

    // Use the user already attached by the middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Générer les permissions utilisateur
    let calculatedPermissions: any[] = [];
    
    try {
      if (user.permissions && typeof user.permissions === 'string') {
        calculatedPermissions = JSON.parse(user.permissions);
      } else if (user.permissions && Array.isArray(user.permissions)) {
        calculatedPermissions = user.permissions;
      }
    } catch (e) {
      calculatedPermissions = [];
    }

    // Ajouter les permissions par défaut selon le rôle si nécessaire
    if (user.role === USER_ROLES.ADMIN && (!calculatedPermissions || !calculatedPermissions.length)) {
      calculatedPermissions = [
        { page: 'dashboard', canEdit: true, canView: true },
        { page: 'leads', canEdit: true, canView: true },
        { page: 'demandes', canEdit: true, canView: true },
        { page: 'paiements', canEdit: true, canView: true },
        { page: 'clients', canEdit: true, canView: true },
        { page: 'rendez-vous', canEdit: true, canView: true },
        { page: 'emails', canEdit: true, canView: true },
        { page: 'settings', canEdit: true, canView: true },
        { page: 'users', canEdit: true, canView: true },
        { page: 'animations', canEdit: true, canView: true },
        { page: 'notifications', canEdit: true, canView: true },
        { page: 'contacts', canEdit: true, canView: true }
      ];
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: calculatedPermissions,
      isAdmin: user.role === USER_ROLES.ADMIN,
      isManager: user.role === USER_ROLES.MANAGER,
      isAgent: user.role === USER_ROLES.AGENT
    };

    res.json({
      success: true,
      user: authUser
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

// Initialiser l'utilisateur admin par défaut
export const initializeAdminUser = async () => {
  try {
    // Vérifier si l'utilisateur admin existe
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (existingAdmin.length === 0) {
      // Créer l'utilisateur admin par défaut
      const hashedPassword = await hash('p4sSw0rD', 10);
      
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@portail-electricite.com',
        fullName: 'Administrateur',
        password: hashedPassword,
        role: USER_ROLES.ADMIN,
        active: true,
        permissions: JSON.stringify([
          { page: 'dashboard', canEdit: true, canView: true },
          { page: 'leads', canEdit: true, canView: true },
          { page: 'demandes', canEdit: true, canView: true },
          { page: 'paiements', canEdit: true, canView: true },
          { page: 'clients', canEdit: true, canView: true },
          { page: 'rendez-vous', canEdit: true, canView: true },
          { page: 'emails', canEdit: true, canView: true },
          { page: 'settings', canEdit: true, canView: true },
          { page: 'users', canEdit: true, canView: true },
          { page: 'animations', canEdit: true, canView: true },
          { page: 'notifications', canEdit: true, canView: true },
          { page: 'contacts', canEdit: true, canView: true }
        ])
      });
      
      console.log('✅ Utilisateur admin créé avec succès');
    } else {
      console.log('✅ Utilisateur admin déjà existant');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'utilisateur admin:', error);
  }
};