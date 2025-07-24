import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, uuid, doublePrecision } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table des messages de contact
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  source: text("source").notNull().default("contact_form"), // contact_form, footer, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").notNull().default("unread"), // unread, read, replied, archived
  priority: text("priority").default("normal"), // normal, medium, high (défini par analyse de contenu)
  subject: text("subject"), // Sujet du message (pour l'affichage et le tri)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
  readBy: integer("read_by"), // ID de l'utilisateur qui a lu le message
  repliedAt: timestamp("replied_at"),
  repliedBy: integer("replied_by"), // ID de l'utilisateur qui a répondu
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  status: true,
  createdAt: true,
  readAt: true,
  readBy: true,
  repliedAt: true,
  repliedBy: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Table des notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'payment', 'lead', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  data: jsonb("data"), // Données additionnelles
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

// Définition des types pour les notifications
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Table des tâches des agents
export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("normal"),
  status: text("status").default("pending"),
  relatedType: text("related_type"),
  relatedId: integer("related_id"),
  remindAt: timestamp("remind_at"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  completedAt: timestamp("completed_at"),
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true, 
  createdAt: true,
  updatedAt: true,
  completedAt: true
});

export const agentTaskValidationSchema = insertAgentTaskSchema.extend({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  priority: z.enum(["high", "medium", "normal", "low"], {
    errorMap: () => ({ message: "Priorité invalide" }),
  }).default("normal"),
  status: z.enum(["pending", "in_progress", "completed", "canceled"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }).default("pending"),
  dueDate: z.string().optional().or(z.date()).nullable(),
  remindAt: z.string().optional().or(z.date()).nullable(),
});

export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;

// Table des performances du site
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  route: text("route").notNull(),  // La route qui a été mesurée
  loadTime: integer("load_time").notNull(), // Temps de chargement en ms
  memoryUsage: integer("memory_usage"),     // Utilisation mémoire en MB
  cpuUsage: decimal("cpu_usage", { precision: 5, scale: 2 }), // % d'utilisation CPU
  userAgent: text("user_agent"),    // Info sur le navigateur
  userId: integer("user_id"),       // L'utilisateur concerné (si authentifié)
  statusCode: integer("status_code"), // Code HTTP de la réponse
  requestSize: integer("request_size"), // Taille de la requête en octets
  responseSize: integer("response_size"), // Taille de la réponse en octets
  serverInfo: jsonb("server_info"), // Informations supplémentaires sur le serveur
});

// Créer un schéma d'insertion personnalisé pour les métriques de performance
// car certains champs peuvent être null ou de différents types
export const insertPerformanceMetricSchema = z.object({
  route: z.string(),
  loadTime: z.number().int(),
  memoryUsage: z.number().int().nullable().optional(),
  cpuUsage: z.number().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.number().int().nullable().optional(),
  statusCode: z.number().int().nullable().optional(),
  requestSize: z.number().int().nullable().optional(),
  responseSize: z.number().int().nullable().optional(),
  serverInfo: z.any().optional()
});

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").default("").notNull(), // Valeur par défaut vide
  email: text("email").default("admin@example.com").notNull(), // Valeur par défaut
  role: text("role").notNull().default("agent"), // admin, manager, agent
  permissions: jsonb("permissions"), // Stockage des permissions spécifiques
  active: boolean("active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"), // ID de l'utilisateur qui a créé ce compte
  onboardingCompleted: boolean("onboarding_completed").default(false), // Indique si l'utilisateur a vu l'onboarding
  // Configuration SMTP personnelle
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpSecure: boolean("smtp_secure").default(true),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  smtpFromEmail: text("smtp_from_email"),
  smtpEnabled: boolean("smtp_enabled").default(false),
  // Informations de commission
  commissionEnabled: boolean("commission_enabled").default(true),
  commissionRate: decimal("commission_rate").default("14"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  active: true,
  permissions: true,
  smtpHost: true,
  smtpPort: true,
  smtpSecure: true,
  smtpUser: true,
  smtpPassword: true,
  smtpFromEmail: true,
  smtpEnabled: true,
  commissionEnabled: true,
  commissionRate: true,
  onboardingCompleted: true,
});

export const userValidationSchema = insertUserSchema.extend({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Adresse email invalide"),
  role: z.enum(["admin", "manager", "agent"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
  active: z.boolean().default(true),
  permissions: z.array(
    z.object({
      page: z.string(),
      canView: z.boolean(),
      canEdit: z.boolean()
    })
  ).default([]),
  smtpHost: z.string().optional().or(z.literal('')),
  smtpPort: z.number().int().positive().optional().or(z.literal(0)).or(z.literal(587)),
  smtpUser: z.string().optional().or(z.literal('')),
  smtpPassword: z.string().optional().or(z.literal('')),
  smtpFromEmail: z.string().email("Adresse email d'expédition invalide").optional().or(z.literal('')),
  commissionRate: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'number' ? String(val) : val
  ).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Service connection request schema
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  // Lien avec le lead d'origine
  leadId: integer("lead_id"),
  // Informations du demandeur
  clientType: text("client_type").notNull(), // Particulier, Professionnel, Collectivité
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"), // Pour professionnels
  siret: text("siret"), // Pour professionnels
  
  // Type de demande
  serviceType: text("service_type").notNull(), // Toujours "electricity"
  requestType: text("request_type").notNull(), // Nouveau raccordement, Modification, etc.
  otherRequestTypeDesc: text("other_request_type_desc"), // Description pour le type "other"
  buildingType: text("building_type").notNull(), // Maison individuelle, Immeuble, Local professionnel, etc.
  terrainViabilise: text("terrain_viabilise"), // État du terrain (viabilisé ou non)
  projectStatus: text("project_status").notNull(), // Projet, Permis déposé, Permis accordé, etc.
  permitNumber: text("permit_number"), // Numéro du permis de construire
  permitDeliveryDate: text("permit_delivery_date"), // Date de délivrance du permis
  
  // Adresse du projet
  address: text("address").notNull(),
  addressComplement: text("address_complement"),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  cadastralReference: text("cadastral_reference"), // Référence cadastrale
  
  // Puissance demandée
  powerRequired: text("power_required").notNull(), // En kVA
  phaseType: text("phase_type"), // Monophasé ou Triphasé
  
  // Planning
  desiredCompletionDate: text("desired_completion_date"), // Date souhaitée de mise en service
  
  // Facturation
  billingAddress: text("billing_address"), // Si différente de l'adresse du projet
  billingCity: text("billing_city"),
  billingPostalCode: text("billing_postal_code"),
  
  // Autres informations
  hasArchitect: boolean("has_architect"), // Le client a-t-il un architecte?
  architectName: text("architect_name"),
  architectPhone: text("architect_phone"),
  architectEmail: text("architect_email"),
  
  comments: text("comments"),
  
  // Métadonnées
  estimatedPrice: text("estimated_price"), // Prix estimé
  status: text("status").default("new").notNull(), // new, validated, in_progress, scheduled, completed, cancelled
  category: text("category"), // Catégorie déterminée par l'analyse (standard, urgent, high_priority, complex, etc.)
  priceEstimate: text("price_estimate"), // Estimation du prix générée par Claude
  aiAnalysis: text("ai_analysis"), // Analyse complète générée par Claude
  customerResponse: text("customer_response"), // Réponse client générée par Claude
  
  // Informations de paiement
  paymentStatus: text("payment_status"), // succeeded, processing, requires_action, requires_payment_method, requires_confirmation, canceled, failed
  paymentId: text("payment_id"), // ID de la transaction Stripe
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }), // Montant du paiement
  paymentMethod: text("payment_method"), // Méthode de paiement utilisée
  paymentDate: timestamp("payment_date"), // Date du paiement
  
  // Informations bancaires
  cardBrand: text("card_brand"), // Marque de la carte (visa, mastercard, etc.)
  cardLast4: text("card_last4"), // 4 derniers chiffres de la carte
  cardExpMonth: integer("card_exp_month"), // Mois d'expiration
  cardExpYear: integer("card_exp_year"), // Année d'expiration
  billingName: text("billing_name"), // Nom figurant sur la carte
  bankName: text("bank_name"), // Nom de la banque (si disponible)
  
  // Détails des erreurs de paiement (pour la récupération des paiements échoués)
  paymentError: text("payment_error"), // JSON sous forme de texte contenant les détails de l'erreur de paiement
  
  // Informations de connexion
  ipAddress: text("ip_address"), // Adresse IP de l'utilisateur
  userAgent: text("user_agent"), // User agent du navigateur
  
  // Gestion du flux de traitement
  assignedTo: integer("assigned_to"), // ID de l'utilisateur traiteur assigné
  assignedAt: timestamp("assigned_at"), // Date d'assignation
  validatedBy: integer("validated_by"), // ID de l'utilisateur qui a validé la demande
  validatedAt: timestamp("validated_at"), // Date de validation
  scheduledDate: timestamp("scheduled_date"), // Date du rendez-vous avec Enedis
  scheduledTime: text("scheduled_time"), // Heure du rendez-vous (matin, après-midi)
  enedisReferenceNumber: text("enedis_reference_number"), // Numéro de référence Enedis
  notes: text("notes"), // Notes internes de suivi
  completedAt: timestamp("completed_at"), // Date de finalisation
  cancellationReason: text("cancellation_reason"), // Raison d'annulation
  hasReminderSent: boolean("has_reminder_sent").default(false), // Indique si un rappel a été envoyé
  
  // Traçabilité
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUpdatedBy: integer("last_updated_by"), // ID du dernier utilisateur à avoir modifié
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  referenceNumber: true,
  leadId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  estimatedPrice: true,
  category: true,
  priceEstimate: true,
  aiAnalysis: true,
  customerResponse: true,
  assignedTo: true,
  assignedAt: true,
  validatedBy: true,
  validatedAt: true,
  scheduledDate: true,
  scheduledTime: true,
  enedisReferenceNumber: true,
  notes: true,
  completedAt: true,
  cancellationReason: true,
  lastUpdatedBy: true,
  paymentStatus: true,
  paymentId: true,
  paymentAmount: true,
  paymentMethod: true,
  paymentDate: true,
  cardBrand: true,
  cardLast4: true,
  cardExpMonth: true,
  cardExpYear: true,
  billingName: true,
  bankName: true,
  paymentError: true,
});

// Extended for client-side validation
export const serviceRequestValidationSchema = insertServiceRequestSchema.extend({
  // Informations du demandeur
  clientType: z.enum(["particulier", "professionnel", "collectivite"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de client" }),
  }),
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,20}$/, "Numéro de téléphone invalide"),
  company: z.string().optional().or(z.literal("")),
  siret: z.string().optional().or(z.literal("")).transform(val => val || ""), // Renommé en SIREN dans l'interface

  // Type de demande
  serviceType: z.enum(["electricity", "solar", "particulier", "professionnel"]),
  requestType: z.enum([
    "new_connection", 
    "power_upgrade", 
    "temporary_connection", 
    "relocation",
    "technical_visit",
    "other"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de demande" }),
  }),
  otherRequestTypeDesc: z.string().optional().or(z.literal("")),
  buildingType: z.enum([
    "individual_house", 
    "apartment_building", 
    "commercial", 
    "industrial",
    "agricultural",
    "public",
    "terrain"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de bâtiment" }),
  }),
  terrainViabilise: z.enum(["viabilise", "non_viabilise"]).optional().or(z.literal("")),
  projectStatus: z.enum([
    "planning", 
    "permit_pending", 
    "permit_approved", 
    "construction_started",
    "construction_completed"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner l'état du projet" }),
  }),
  permitNumber: z.string().optional().or(z.literal("")),
  permitDeliveryDate: z.string().optional().or(z.literal("")),

  // Adresse
  address: z.string().min(1, "L'adresse est requise"),
  addressComplement: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)"),
  cadastralReference: z.string().optional().or(z.literal("")),

  // Puissance
  powerRequired: z.string().min(1, "La puissance demandée est requise").transform(val => {
    // Si nous recevons "36-jaune", convertir en "36" mais ajouter une note indiquant "Tarif Jaune"
    if (val === "36-jaune") {
      return "36";
    }
    return val;
  }),
  phaseType: z.enum(["monophase", "triphase", "inconnu"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de phase" }),
  }).optional().or(z.literal("")),

  // Planning
  desiredCompletionDate: z.string().optional().or(z.literal("")),

  // Facturation
  useDifferentBillingAddress: z.boolean().optional().default(false),
  billingAddress: z.string().optional().or(z.literal("")),
  billingCity: z.string().optional().or(z.literal("")),
  billingPostalCode: z.string().optional().or(z.literal("")).or(
    z.string().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)").optional()
  ),

  // Architecte
  hasArchitect: z.boolean().optional(),
  architectName: z.string().optional().or(z.literal("")),
  architectPhone: z.string().optional().or(z.literal("")),
  architectEmail: z.string().email("Adresse email invalide").optional().or(z.literal("")),

  // Commentaires
  comments: z.string().optional().or(z.literal("")),
});

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

// Table des leads (formulaires partiellement remplis)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  sessionToken: uuid("session_token").notNull().unique().defaultRandom(),
  referenceNumber: text("reference_number"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  clientType: text("client_type"),
  company: text("company"),
  siret: text("siret"),
  
  // Type de demande
  serviceType: text("service_type").default("electricity"),
  requestType: text("request_type"),
  otherRequestTypeDesc: text("other_request_type_desc"),
  buildingType: text("building_type"),
  terrainViabilise: text("terrain_viabilise"),
  projectStatus: text("project_status"),
  permitNumber: text("permit_number"),
  permitDeliveryDate: text("permit_delivery_date"),
  
  // Adresse du projet
  address: text("address"),
  addressComplement: text("address_complement"),
  city: text("city"),
  postalCode: text("postal_code"),
  cadastralReference: text("cadastral_reference"),
  
  // Puissance demandée
  powerRequired: text("power_required"),
  phaseType: text("phase_type"),
  desiredCompletionDate: text("desired_completion_date"),
  
  // Facturation
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingPostalCode: text("billing_postal_code"),
  
  // Architecte
  hasArchitect: boolean("has_architect"),
  architectName: text("architect_name"),
  architectPhone: text("architect_phone"),
  architectEmail: text("architect_email"),
  
  // Commentaires
  comments: text("comments"),
  
  // TVA et termes
  vatRate: text("vat_rate"),
  termsAccepted: boolean("terms_accepted").default(false),
  immediatePurchaseAccepted: boolean("immediate_purchase_accepted").default(false),
  connectionDelay: text("connection_delay"),
  
  // Méta-données
  completedSteps: integer("completed_steps").default(0),
  isCompleted: boolean("is_completed").default(false),
  convertedToRequest: boolean("converted_to_request").default(false),
  convertedRequestId: integer("converted_request_id"),
  assignedTo: integer("assigned_to"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastTouchedAt: timestamp("last_touched_at").defaultNow().notNull(),
  
  // Statut du lead et suivi
  status: text("status").default("new"), // new, interested, not_interested, no_response, callback_scheduled
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: integer("status_updated_by"),
  callbackDate: timestamp("callback_date"),
  callbackNotes: text("callback_notes"),
  
  // Contrat
  hasContract: boolean("has_contract").default(false),
  
  // Informations de paiement
  paymentStatus: text("payment_status"), // succeeded, processing, requires_action, requires_payment_method, requires_confirmation, canceled, failed
  paymentId: text("payment_id"), // ID de la transaction Stripe
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }), // Montant du paiement
  paymentMethod: text("payment_method"), // Méthode de paiement utilisée
  paymentDate: timestamp("payment_date"), // Date du paiement
  
  // Informations bancaires
  cardBrand: text("card_brand"), // Marque de la carte (visa, mastercard, etc.)
  cardLast4: text("card_last4"), // 4 derniers chiffres de la carte
  cardExpMonth: integer("card_exp_month"), // Mois d'expiration
  cardExpYear: integer("card_exp_year"), // Année d'expiration
  billingName: text("billing_name"), // Nom figurant sur la carte
  bankName: text("bank_name"), // Nom de la banque (si disponible)
  
  // Détails des erreurs de paiement (pour la récupération des paiements échoués)
  paymentError: text("payment_error"), // JSON sous forme de texte contenant les détails de l'erreur de paiement
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  sessionToken: true,
  completedSteps: true,
  isCompleted: true,
  convertedToRequest: true,
  convertedRequestId: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true,
  lastTouchedAt: true,
  status: true,
  statusUpdatedAt: true,
  statusUpdatedBy: true,
  callbackDate: true,
  callbackNotes: true,
  paymentStatus: true,
  paymentId: true,
  paymentAmount: true,
  paymentMethod: true,
  paymentDate: true,
  cardBrand: true,
  cardLast4: true,
  cardExpMonth: true,
  cardExpYear: true,
  billingName: true,
  bankName: true,
  paymentError: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;



// Constantes pour les statuts de lead
export const LEAD_STATUS = {
  NEW: "new", // Nouveau lead non traité
  INTERESTED: "interested", // Client intéressé (OK)
  NOT_INTERESTED: "not_interested", // Client pas intéressé
  NO_RESPONSE: "no_response", // Pas de réponse (NRP)
  CALLBACK_SCHEDULED: "callback_scheduled", // Rappel programmé
  PROCESS_COMPLETE: "process_complete", // 5/5 vert (tous les critères sont satisfaits)
} as const;

// Constantes pour les statuts de demande
export const REQUEST_STATUS = {
  NEW: "new", // Nouvelle demande non assignée
  PENDING: "pending", // En attente de traitement
  ASSIGNED: "assigned", // Demande assignée à un traiteur
  VALIDATED: "validated", // Demande validée, en attente d'assignation
  IN_PROGRESS: "in_progress", // Demande en cours de traitement par un traiteur
  CONTACT_PENDING: "contact_pending", // En attente de contact avec le client
  DOCUMENTS_PENDING: "documents_pending", // En attente de documents du client
  ENEDIS_SUBMITTED: "enedis_submitted", // Soumis à Enedis
  SCHEDULED: "scheduled", // Rendez-vous planifié avec Enedis
  COMPLETED: "completed", // Demande terminée
  PROCESS_COMPLETE: "process_complete", // 5/5 vert (tous les critères sont satisfaits)
  CANCELLED: "cancelled", // Demande annulée
  PAYMENT_PENDING: "payment_pending", // En attente de paiement
  PAID: "paid", // Paiement effectué
  PAYMENT_FAILED: "payment_failed" // Échec du paiement
} as const;

// Constantes pour les rôles utilisateur
export const USER_ROLES = {
  ADMIN: "admin", // Administrateur système - tous les droits
  MANAGER: "manager", // Responsable - peut assigner des demandes aux agents et gérer les paiements
  AGENT: "agent", // Agent - traite les demandes qui lui sont assignées
} as const;

// Constantes pour les types d'actions de log
export const ACTIVITY_ACTIONS = {
  CREATE: "create", // Création d'une entité
  UPDATE: "update", // Mise à jour d'une entité
  DELETE: "delete", // Suppression d'une entité
  ASSIGN: "assign", // Assignation d'une demande
  VALIDATE: "validate", // Validation d'une demande
  SCHEDULE: "schedule", // Planification d'un rendez-vous
  COMPLETE: "complete", // Finalisation d'une demande
  CANCEL: "cancel", // Annulation d'une demande
  LOGIN: "login", // Connexion d'un utilisateur
  LOGOUT: "logout", // Déconnexion d'un utilisateur
  PAYMENT_CONFIRMED: "payment_confirmed", // Confirmation du paiement
  PAYMENT_FAILED: "payment_failed", // Échec du paiement
  PAYMENT_REMINDER_SENT: "payment_reminder_sent", // Rappel de paiement envoyé
  PAYMENT_INITIATED: "payment_initiated", // Initiation d'un paiement (terminal virtuel)
  PAYMENT_PROCESSED: "payment_processed", // Paiement traité (terminal virtuel)
  CERTIFICATE_GENERATED: "certificate_generated", // Génération d'un certificat
  EMAIL_SENT: "email_sent", // Email envoyé
  SMTP_CONFIG_UPDATED: "smtp_config_updated", // Mise à jour de la config SMTP
  SMTP_TEST: "smtp_test", // Test de la config SMTP
  APPOINTMENT_REMINDER_SENT: "appointment_reminder_sent", // Rappel de rendez-vous envoyé
  TASK_CREATED: "task_created", // Création d'une tâche
  TASK_UPDATED: "task_updated", // Mise à jour d'une tâche
  TASK_COMPLETED: "task_completed", // Tâche terminée
  TASK_DELETED: "task_deleted" // Suppression d'une tâche
} as const;

// Table des configurations système
export const systemConfigs = pgTable("system_configs", {
  id: serial("id").primaryKey(),
  configKey: text("config_key").notNull().unique(),
  configValue: text("config_value"),
  configGroup: text("config_group").notNull(), // stripe, sendgrid, smtp, system, etc.
  isSecret: boolean("is_secret").default(false).notNull(), // Si true, masquer la valeur dans l'interface
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"), // ID de l'utilisateur qui a modifié la config
});

export const insertSystemConfigSchema = createInsertSchema(systemConfigs).omit({
  id: true,
  updatedAt: true,
});

export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type SystemConfig = typeof systemConfigs.$inferSelect;

// Configuration des modèles d'emails
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateKey: text("template_key").notNull().unique(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content").notNull(),
  description: text("description"),
  variables: text("variables"), // Variables disponibles dans le template au format JSON
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"), // ID de l'utilisateur qui a modifié le template
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Configuration des animations UI
export const uiAnimations = pgTable("ui_animations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nom identifiant l'animation
  type: text("type").notNull(), // Type d'animation: spinner, pulse, progress, dots, etc.
  category: text("category").notNull(), // Catégorie: form, payment, loading, analysis, etc.
  component: text("component").notNull(), // Composant React utilisé
  enabled: boolean("enabled").default(true).notNull(), // Animation active ou non
  default: boolean("default").default(false).notNull(), // Animation par défaut pour sa catégorie
  config: jsonb("config").default({}).notNull(), // Configuration JSON de l'animation
  pages: text("pages").array(), // Pages spécifiques où l'animation est utilisée
  lastModifiedAt: timestamp("last_modified_at").defaultNow().notNull(),
  lastModifiedBy: integer("last_modified_by"), // ID de l'utilisateur ayant modifié
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUiAnimationSchema = createInsertSchema(uiAnimations).omit({
  id: true,
  lastModifiedAt: true,
  createdAt: true,
});

// Types pour validation
export const uiAnimationValidationSchema = insertUiAnimationSchema.extend({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  type: z.enum(["spinner", "pulse", "progress", "dots", "circuit", "wave"], {
    errorMap: () => ({ message: "Type d'animation non valide" }),
  }),
  category: z.enum(["form", "payment", "loading", "analysis", "processing"], {
    errorMap: () => ({ message: "Catégorie non valide" }),
  }),
  component: z.string().min(1, "Le composant est requis"),
  enabled: z.boolean(),
  default: z.boolean(),
});

export type InsertUiAnimation = z.infer<typeof insertUiAnimationSchema>;
export type UiAnimation = typeof uiAnimations.$inferSelect;

// Table des paiements
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentId: text("payment_id").notNull(), // ID de transaction Stripe ou ID manuel
  referenceNumber: text("reference_number").notNull(), // Référence de la demande associée
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // paid, succeeded, pending, failed, abandoned, processing, canceled
  method: text("method").default("card"), // card, manual, etc.
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  
  // Informations bancaires
  cardBrand: text("card_brand"),
  cardLast4: text("card_last4"),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  billingName: text("billing_name"),
  paymentMethod: text("payment_method"),
  
  // Métadonnées
  metadata: jsonb("metadata"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by"), // ID de l'utilisateur qui a créé le paiement manuel
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayment = typeof payments.$inferInsert;
export type Payment = typeof payments.$inferSelect;

// Table des métriques de performance des agents
export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  periodStart: timestamp("period_start", { mode: "string" }).notNull(),
  periodEnd: timestamp("period_end", { mode: "string" }).notNull(),
  leadsReceived: integer("leads_received").default(0),
  leadsConverted: integer("leads_converted").default(0),
  leadsConversionRate: doublePrecision("leads_conversion_rate").default(0),
  paymentsProcessed: integer("payments_processed").default(0),
  paymentsAmount: integer("payments_amount").default(0),
  commissionsEarned: integer("commissions_earned").default(0),
  taskCompletionRate: doublePrecision("task_completion_rate").default(0),
  averageResponseTime: doublePrecision("average_response_time").default(0),
  appointmentsScheduled: integer("appointments_scheduled").default(0),
  clientsAcquired: integer("clients_acquired").default(0),
  qualityScore: integer("quality_score").default(0),
  efficiency: integer("efficiency").default(0),
  dailyActivity: text("daily_activity"), // Stocké en JSON
  createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" })
});

// Schéma Zod pour la validation
export const insertAgentPerformanceMetricsSchema = createInsertSchema(agentPerformanceMetrics, {
  dailyActivity: z.string().optional()
}).omit({ id: true });

// Types dérivés
export type InsertAgentPerformanceMetrics = z.infer<typeof insertAgentPerformanceMetricsSchema>;
export type AgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferSelect;



// Table des logs d'activité
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Les constantes ACTIVITY_ACTIONS sont déjà définies plus haut dans le fichier

// Le statut LEAD_STATUS est déjà défini plus haut dans le fichier
