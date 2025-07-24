import { 
  type User, 
  type InsertUser, 
  type ServiceRequest, 
  type InsertServiceRequest,
  type Lead,
  type InsertLead,
  type Contact,
  type InsertContact,
  type Payment,
  type InsertPayment,
  type ActivityLog,
  type InsertActivityLog,

  REQUEST_STATUS,
  users,
  leads,
  contacts,
  serviceRequests,
  payments,
  uiAnimations,
  activityLogs,

} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, inArray, isNotNull } from "drizzle-orm";

// Simple interface for minimal functionality
export interface IStorage {
  // Basic user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<boolean>;

  // Basic service request methods
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestByReference(reference: string): Promise<ServiceRequest | undefined>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  updateServiceRequest(id: number, data: Partial<InsertServiceRequest>): Promise<ServiceRequest>;

  // Basic lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;

  // Basic contact methods  
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Basic payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
}

// Simple in-memory storage - perfect for development and minimal setup
export class MemStorage implements IStorage {
  private users: User[] = [];
  private serviceRequests: ServiceRequest[] = [];
  private leads: Lead[] = [];
  private contacts: Contact[] = [];
  private payments: Payment[] = [];
  private nextId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUserLastLogin(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.users[userIndex] = {
      ...this.users[userIndex],
      lastLogin: new Date()
    };
    return true;
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      id: this.nextId++,
      status: REQUEST_STATUS.NEW,
      ...insertRequest,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.serviceRequests.push(request);
    return request;
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.find(r => r.id === id);
  }

  async getServiceRequestByReference(reference: string): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.find(r => r.reference === reference);
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return [...this.serviceRequests];
  }

  async updateServiceRequest(id: number, data: Partial<InsertServiceRequest>): Promise<ServiceRequest> {
    const index = this.serviceRequests.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Service request ${id} not found`);

    this.serviceRequests[index] = {
      ...this.serviceRequests[index],
      ...data,
      updatedAt: new Date()
    };
    return this.serviceRequests[index];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: this.nextId++,
      ...insertLead,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leads.push(lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: this.nextId++,
      ...insertContact,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contacts.push(contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return [...this.contacts];
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.nextId++,
      ...insertPayment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.push(payment);
    return payment;
  }

  async getPayments(): Promise<Payment[]> {
    return [...this.payments];
  }
}



// Legacy interface for backward compatibility
export interface IStorageLegacy {
  // Méthodes utilisateur
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<boolean>;
  updateUserLastLogin(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersForManager(managerId: number): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Méthodes pour les tâches des agents
  createAgentTask(task: InsertAgentTask): Promise<AgentTask>;
  getAgentTask(id: number): Promise<AgentTask | undefined>;
  getAgentTasks(userId: number, filters?: { status?: string, priority?: string, dueDate?: Date }): Promise<AgentTask[]>;
  updateAgentTask(id: number, data: Partial<InsertAgentTask>): Promise<AgentTask | undefined>;
  completeAgentTask(id: number, userId: number): Promise<AgentTask | undefined>;
  deleteAgentTask(id: number): Promise<boolean>;
  getDueTasks(userId?: number): Promise<AgentTask[]>;

  // Méthodes de paiement spécifiques aux agents
  getAgentPayments(userId: number, page?: number, limit?: number): Promise<{ payments: any[], total: number, commissionTotal: number }>;
  getUserPayments(userId: number): Promise<Payment[]>;

  // Méthodes des leads (formulaires partiellement complétés)
  createLead(data: Partial<InsertLead>): Promise<Lead>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeadByToken(token: string): Promise<Lead | undefined>;
  updateLead(token: string, data: Partial<InsertLead>, step: number): Promise<Lead | undefined>;
  completeLeadStep(token: string, step: number): Promise<Lead | undefined>;
  completeLead(token: string): Promise<Lead | undefined>;
  convertLeadToServiceRequest(token: string, referenceNumber: string): Promise<{ lead: Lead, serviceRequest: ServiceRequest } | undefined>;
  getAllLeads(page?: number, limit?: number): Promise<{ leads: Lead[], total: number }>;
  getIncompletedLeads(page?: number, limit?: number): Promise<{ leads: Lead[], total: number }>;
  getRecentLeads(limit: number): Promise<Lead[]>;

  // Méthodes de gestion des contacts
  createContact(contactData: InsertContact): Promise<Contact>;
  getContact(id: number): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  getContacts(page?: number, limit?: number): Promise<{ contacts: Contact[], total: number }>;
  updateContactStatus(id: number, status: string, userId?: number): Promise<Contact | undefined>;
  getUnreadContactsCount(): Promise<number>;
  assignLeadToUser(leadId: number, userId: number): Promise<Lead | undefined>;
  updateLeadField(leadId: number, field: string, value: any): Promise<Lead | undefined>;

  // Méthodes de demande de service
  createServiceRequest(request: InsertServiceRequest & { referenceNumber: string }): Promise<ServiceRequest>;
  getServiceRequestByReference(referenceNumber: string): Promise<ServiceRequest | undefined>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  getRecentServiceRequests(limit: number): Promise<ServiceRequest[]>;

  // Méthodes de flux de traitement
  assignServiceRequest(requestId: number, userId: number, assignedBy: number): Promise<ServiceRequest>;
  validateServiceRequest(requestId: number, userId: number): Promise<ServiceRequest>;
  updateServiceRequestStatus(requestId: number, status: string, updatedBy: number): Promise<ServiceRequest>;
  scheduleServiceRequest(requestId: number, date: Date, timeSlot: string, enedisRef: string, updatedBy: number): Promise<ServiceRequest>;
  completeServiceRequest(requestId: number, userId: number): Promise<ServiceRequest>;
  cancelServiceRequest(requestId: number, reason: string, userId: number): Promise<ServiceRequest>;
  updateServiceRequestNotes(requestId: number, notes: string, userId: number): Promise<ServiceRequest>;

  // Méthodes de filtrage et recherche
  getServiceRequestsByStatus(status: string): Promise<ServiceRequest[]>;
  getServiceRequestsByAssignee(userId: number): Promise<ServiceRequest[]>;

  // Méthodes pour gérer les statuts et rappels des leads
  updateLeadStatus(leadId: number, data: { status: string, statusUpdatedAt: Date, statusUpdatedBy: number | undefined }): Promise<Lead>;
  updateLeadCallback(leadId: number, data: { callbackDate: Date, callbackNotes?: string, status: string, statusUpdatedAt: Date, statusUpdatedBy: number | undefined }): Promise<Lead>;

  // Méthode pour accéder aux configurations système
  getSystemConfig(key: string): Promise<string | null>;

  // Méthodes de paiement
  getRecentPayments(limit: number): Promise<any[]>;
  getPayments(page?: number, limit?: number): Promise<{ payments: Payment[], total: number }>;
  getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined>;
  createPayment(paymentData: InsertPayment): Promise<Payment>;
  updatePaymentStatus(paymentId: string, status: string): Promise<Payment | undefined>;
  cancelPayment(paymentId: string, userId?: number): Promise<Payment | undefined>;

  updateServiceRequestPayment(
    requestId: number, 
    paymentId: string, 
    paymentStatus: string, 
    amount: number,
    paymentDetails?: {
      cardBrand?: string;
      cardLast4?: string;
      cardExpMonth?: number;
      cardExpYear?: number;
      billingName?: string;
      bankName?: string;
      paymentMethod?: string;
    }
  ): Promise<ServiceRequest>;

  // Méthodes de liaison entre lead et demande de service
  findAndLinkLeadToServiceRequest(serviceRequestId: number): Promise<boolean>;

  // Méthodes pour les contacts
  createContact(data: InsertContact): Promise<Contact>;
  getContact(id: number): Promise<Contact | undefined>;
  getContacts(page?: number, limit?: number): Promise<{ contacts: Contact[], total: number }>;
  getUnreadContacts(page?: number, limit?: number): Promise<{ contacts: Contact[], total: number }>;
  getUnreadContactsCount(): Promise<number>;
  updateContactStatus(id: number, status: string, userId?: number): Promise<Contact | undefined>;
  linkLeadToServiceRequest(leadId: number, serviceRequestId: number): Promise<boolean>;

  // Méthode pour enregistrer les tentatives de paiement échouées
  updateServiceRequestPaymentAttempt(
    requestId: number,
    status: string,
    amount: number,
    paymentErrorDetails: {
      code: string;
      message: string;
      timestamp: string;
      cardDetails?: {
        cardholderName?: string;
        brand?: string;
        last4?: string;
        expMonth?: number;
        expYear?: number;
      }
    }
  ): Promise<ServiceRequest>;

  // Configuration système simplifiée


}

export class DatabaseStorage implements IStorage {
  // Méthodes utilisateur
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const allUsers = await db.select().from(users).where(eq(users.role, role));

    // Si la requête est faite par un admin normal (pas l'admin principal),
    // on filtre l'utilisateur principal 'admin' des résultats
    const requestingUser = GlobalContext.getRequestingUser();

    if (requestingUser && requestingUser.id !== 1 && requestingUser.role === 'admin') {
      // Filtrer l'admin principal (username='admin' ou id=1) des résultats
      return allUsers.filter(user => user.username !== 'admin' && user.id !== 1);
    }

    return allUsers;
  }

  async getUsersForManager(managerId: number): Promise<User[]> {
    try {
      // Récupérer tous les utilisateurs avec le rôle 'agent'
      const allAgents = await db.select().from(users).where(eq(users.role, 'agent'));

      // Récupérer les informations du manager
      const manager = await this.getUser(managerId);

      if (!manager) {
        console.error(`getUsersForManager: Manager avec ID ${managerId} non trouvé`);
        return [];
      }

      // Si c'est un admin, retourner tous les agents
      if (manager.role === 'admin') {
        return allAgents;
      }

      // Si c'est un manager, on doit filtrer les agents qui sont sous sa responsabilité
      if (manager.role === 'manager') {
        // Ici, nous utilisons le champ managerId dans le schéma utilisateur
        // pour déterminer quels agents sont sous la responsabilité de ce manager

        // Première approche: chercher les agents qui ont explicitement ce managerId
        const teamMembers = allAgents.filter(agent => {
          return agent.managerId === managerId || 
                 (agent.metadata && agent.metadata.managerId === managerId);
        });

        // Si aucun membre n'est trouvé avec l'approche explicite, on peut implémenter
        // une logique de fallback basée sur d'autres critères (comme le bureau, la région, etc.)
        if (teamMembers.length === 0 && manager.metadata && manager.metadata.region) {
          // Fallback: attribuer les agents de la même région si aucune attribution explicite
          return allAgents.filter(agent => 
            agent.metadata && agent.metadata.region === manager.metadata.region
          );
        }

        return teamMembers;
      }

      // Pour tout autre rôle, retourner un tableau vide
      return [];
    } catch (error) {
      console.error("Erreur dans getUsersForManager:", error);
      return [];
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true; // Si nous arrivons ici, la suppression a réussi
  }

  async updateUserLastLogin(id: number): Promise<boolean> {
    try {
      const now = new Date();
      await db
        .update(users)
        .set({ lastLogin: now })
        .where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la dernière connexion:", error);
      return false;
    }
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      return false;
    }
  }

  // Méthodes des leads (formulaires partiellement complétés)
  async createLead(data: Partial<InsertLead>): Promise<Lead> {
    const now = new Date();
    const [lead] = await db
      .insert(leads)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
        lastTouchedAt: now,
        completedSteps: 0,
        isCompleted: false,
        convertedToRequest: false
      })
      .returning();

    return lead;
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));

    return lead || undefined;
  }

  async getLeadByToken(token: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.sessionToken, token));

    return lead || undefined;
  }

  async updateLead(token: string, data: Partial<InsertLead>, step: number): Promise<Lead | undefined> {
    const now = new Date();
    const [lead] = await db
      .update(leads)
      .set({
        ...data,
        updatedAt: now,
        lastTouchedAt: now,
        completedSteps: step > 0 ? step : undefined
      })
      .where(eq(leads.sessionToken, token))
      .returning();

    return lead || undefined;
  }

  async completeLeadStep(token: string, step: number): Promise<Lead | undefined> {
    const now = new Date();
    const [lead] = await db
      .update(leads)
      .set({
        completedSteps: step,
        updatedAt: now,
        lastTouchedAt: now
      })
      .where(eq(leads.sessionToken, token))
      .returning();

    return lead || undefined;
  }

  async completeLead(token: string): Promise<Lead | undefined> {
    const now = new Date();
    const [lead] = await db
      .update(leads)
      .set({
        isCompleted: true,
        completedSteps: 3, // Définir à 3 pour indiquer que toutes les étapes sont complétées (total de 3 étapes au lieu de 5)
        updatedAt: now,
        lastTouchedAt: now
      })
      .where(eq(leads.sessionToken, token))
      .returning();

    return lead || undefined;
  }

  async convertLeadToServiceRequest(token: string, referenceNumber: string): Promise<{ lead: Lead, serviceRequest: ServiceRequest } | undefined> {
    // Récupérer d'abord le lead
    const lead = await this.getLeadByToken(token);
    if (!lead) return undefined;

    // Construire les données pour la demande de service en deux parties
    // 1. Les données d'insertion qui correspondent au schéma
    const insertData: InsertServiceRequest = {
      clientType: lead.clientType || 'particulier',
      name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company,
      siret: lead.siret,
      serviceType: lead.serviceType || 'electricity',
      requestType: lead.requestType || 'new_connection',
      otherRequestTypeDesc: lead.otherRequestTypeDesc,
      buildingType: lead.buildingType || 'individual_house',
      terrainViabilise: lead.terrainViabilise,
      projectStatus: lead.projectStatus || 'planning',
      permitNumber: lead.permitNumber,
      permitDeliveryDate: lead.permitDeliveryDate,
      address: lead.address || '',
      addressComplement: lead.addressComplement,
      city: lead.city || '',
      postalCode: lead.postalCode || '',
      cadastralReference: lead.cadastralReference,
      powerRequired: lead.powerRequired || '',
      phaseType: lead.phaseType,
      desiredCompletionDate: lead.desiredCompletionDate,
      billingAddress: lead.billingAddress,
      billingCity: lead.billingCity,
      billingPostalCode: lead.billingPostalCode,
      hasArchitect: lead.hasArchitect,
      architectName: lead.architectName,
      architectPhone: lead.architectPhone,
      architectEmail: lead.architectEmail,
      comments: lead.comments,
      ipAddress: lead.ipAddress,
      userAgent: lead.userAgent
    };

    // 2. Créer la demande de service en passant les données supplémentaires
    const serviceRequest = await this.createServiceRequest({
      ...insertData,
      referenceNumber,
      leadId: lead.id // Lien vers le lead d'origine
    });

    // Marquer le lead comme converti
    const [updatedLead] = await db
      .update(leads)
      .set({
        convertedToRequest: true,
        convertedRequestId: serviceRequest.id,
        updatedAt: new Date()
      })
      .where(eq(leads.id, lead.id))
      .returning();

    return {
      lead: updatedLead,
      serviceRequest
    };
  }

  async convertLeadToServiceRequestById(leadId: number, referenceNumber: string): Promise<{ success: boolean, serviceRequestId?: number, message?: string }> {
    try {
      // Récupérer d'abord le lead
      const lead = await this.getLead(leadId);
      if (!lead) {
        return { success: false, message: "Lead non trouvé" };
      }

      // Vérifier si le lead a déjà été converti
      if (lead.convertedToRequest && lead.convertedRequestId) {
        return {
          success: true,
          serviceRequestId: lead.convertedRequestId,
          message: "Le lead a déjà été converti en demande"
        };
      }

      // Construire les données pour la demande de service en deux parties
      // 1. Les données d'insertion qui correspondent au schéma
      const insertData: InsertServiceRequest = {
        clientType: lead.clientType || 'particulier',
        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company,
        siret: lead.siret,
        serviceType: lead.serviceType || 'electricity',
        requestType: lead.requestType || 'new_connection',
        otherRequestTypeDesc: lead.otherRequestTypeDesc,
        buildingType: lead.buildingType || 'individual_house',
        terrainViabilise: lead.terrainViabilise,
        projectStatus: lead.projectStatus || 'planning',
        permitNumber: lead.permitNumber,
        permitDeliveryDate: lead.permitDeliveryDate,
        address: lead.address || '',
        addressComplement: lead.addressComplement,
        city: lead.city || '',
        postalCode: lead.postalCode || '',
        cadastralReference: lead.cadastralReference,
        powerRequired: lead.powerRequired || '',
        phaseType: lead.phaseType,
        desiredCompletionDate: lead.desiredCompletionDate,
        billingAddress: lead.billingAddress,
        billingCity: lead.billingCity,
        billingPostalCode: lead.billingPostalCode,
        hasArchitect: lead.hasArchitect,
        architectName: lead.architectName,
        architectPhone: lead.architectPhone,
        architectEmail: lead.architectEmail,
        comments: lead.comments,
        ipAddress: lead.ipAddress,
        userAgent: lead.userAgent
      };

      // 2. Créer la demande de service en passant les données supplémentaires
      const serviceRequest = await this.createServiceRequest({
        ...insertData,
        referenceNumber,
        leadId: lead.id // Lien vers le lead d'origine
      });

      // Marquer le lead comme converti
      await db
        .update(leads)
        .set({
          convertedToRequest: true,
          convertedRequestId: serviceRequest.id,
          updatedAt: new Date()
        })
        .where(eq(leads.id, lead.id));

      return {
        success: true,
        serviceRequestId: serviceRequest.id,
        message: "Lead converti en demande avec succès"
      };
    } catch (error: any) {
      console.error("Erreur lors de la conversion du lead par ID:", error);
      return {
        success: false,
        message: `Erreur lors de la conversion: ${error.message || "Erreur inconnue"}`
      };
    }
  }

  async getLeadById(leadId: number): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId));

    return lead || undefined;
  }

  async getAllLeads(page: number = 1, limit: number = 20): Promise<{ leads: Lead[], total: number }> {
    const offset = (page - 1) * limit;

    try {
      // Récupérer tous les leads selon pagination
      const leadsData = await db
        .select()
        .from(leads)
        .orderBy(desc(leads.lastTouchedAt))
        .limit(limit)
        .offset(offset);

      // Compter le nombre total de leads pour calculer le nombre de pages
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads);

      console.log(`Récupération de ${leadsData.length} leads, page ${page}, total ${count.count}`);
      return { leads: leadsData, total: count.count };  
    } catch (error) {
      console.error("Erreur dans getAllLeads:", error);
      return { leads: [], total: 0 };
    }
  }

  async getIncompletedLeads(page: number = 1, limit: number = 20): Promise<{ leads: Lead[], total: number }> {
    const offset = (page - 1) * limit;

    try {
      // Récupérer les leads selon pagination
      const leadsData = await db
        .select()
        .from(leads)
        .where(
          sql`"is_completed" = false AND "converted_to_request" = false`
        )
        .orderBy(desc(leads.lastTouchedAt))
        .limit(limit)
        .offset(offset);

      // Compter le nombre total de leads incomplets pour calculer le nombre de pages
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          sql`"is_completed" = false AND "converted_to_request" = false`
        );

      console.log(`Récupération de ${leadsData.length} leads incomplets, page ${page}, total ${count.count}`);
      return { leads: leadsData, total: count.count };  
    } catch (error) {
      console.error("Erreur dans getIncompletedLeads:", error);
      return { leads: [], total: 0 };
    }
  }

  async getRecentLeads(limit: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(limit);
  }

  async assignLeadToUser(leadId: number, userId: number): Promise<Lead | undefined> {
    const now = new Date();
    const [lead] = await db
      .update(leads)
      .set({
        assignedTo: userId,
        updatedAt: now
      })
      .where(eq(leads.id, leadId))
      .returning();

    return lead || undefined;
  }

  async updateLeadField(leadId: number, field: string, value: any): Promise<Lead | undefined> {
    const now = new Date();
    const updateData: any = {
      updatedAt: now
    };

    // Définir la valeur du champ à mettre à jour
    updateData[field] = value;

    const [lead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))
      .returning();

    return lead || undefined;
  }

  async updateLeadPaymentInfo(leadId: number, paymentInfo: {
    paymentStatus: string;
    paymentId?: string;
    paymentAmount?: number;
    cardDetails?: {
      cardBrand?: string;
      cardLast4?: string;
      cardExpMonth?: number;
      cardExpYear?: number;
      billingName?: string;
      bankName?: string;
      paymentMethod?: string;
    };
    paymentError?: any;
  }): Promise<Lead | undefined> {
    const now = new Date();
    const [lead] = await db
      .update(leads)
      .set({
        paymentStatus: paymentInfo.paymentStatus,
        paymentId: paymentInfo.paymentId || null,
        paymentAmount: paymentInfo.paymentAmount ? sql`${paymentInfo.paymentAmount}` : null,
        paymentDate: now,
        updatedAt: now,
        lastTouchedAt: now,
        // Stocker les détails de carte bancaire, qu'ils proviennent d'un paiement réussi ou échoué
        ...(paymentInfo.cardDetails?.cardBrand && { cardBrand: paymentInfo.cardDetails.cardBrand }),
        ...(paymentInfo.cardDetails?.cardLast4 && { cardLast4: paymentInfo.cardDetails.cardLast4 }),
        ...(paymentInfo.cardDetails?.cardExpMonth && { cardExpMonth: paymentInfo.cardDetails.cardExpMonth }),
        ...(paymentInfo.cardDetails?.cardExpYear && { cardExpYear: paymentInfo.cardDetails.cardExpYear }),
        ...(paymentInfo.cardDetails?.billingName && { billingName: paymentInfo.cardDetails.billingName }),
        ...(paymentInfo.cardDetails?.bankName && { bankName: paymentInfo.cardDetails.bankName }),
        ...(paymentInfo.cardDetails?.paymentMethod && { paymentMethod: paymentInfo.cardDetails.paymentMethod }),
        // Stocker les détails d'erreur de paiement si disponibles
        ...(paymentInfo.paymentError && { paymentError: JSON.stringify(paymentInfo.paymentError) })
      })
      .where(eq(leads.id, leadId))
      .returning();

    return lead || undefined;
  }

  // Méthodes de demande de service
  async createServiceRequest(requestData: InsertServiceRequest & { referenceNumber: string, leadId?: number }): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .insert(serviceRequests)
      .values({
        ...requestData,
        // Inclure le leadId si présent
        leadId: requestData.leadId,
        createdAt: now,
        updatedAt: now,
        status: REQUEST_STATUS.NEW,
      })
      .returning();

    return serviceRequest;
  }

  async getServiceRequestByReference(referenceNumber: string): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.referenceNumber, referenceNumber));

    return serviceRequest || undefined;
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));

    return serviceRequest || undefined;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests);
  }

  async getRecentServiceRequests(limit: number): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit);
  }

  // Méthodes de flux de traitement
  async assignServiceRequest(requestId: number, userId: number, assignedBy: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        assignedTo: userId,
        assignedAt: now,
        status: REQUEST_STATUS.IN_PROGRESS,        updatedAt: now,
        lastUpdatedBy: assignedBy
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async validateServiceRequest(requestId: number, userId: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        validatedBy: userId,
        validatedAt: now,
        status: REQUEST_STATUS.VALIDATED,
        updatedAt: now,
        lastUpdatedBy: userId
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async updateServiceRequestStatus(requestId: number, status: string, updatedBy: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        updatedAt: now,
        lastUpdatedBy: updatedBy
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async scheduleServiceRequest(requestId: number, date: Date, timeSlot: string, enedisRef: string, updatedBy: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        scheduledDate: date,
        scheduledTime: timeSlot,
        enedisReferenceNumber: enedisRef,
        status: REQUEST_STATUS.SCHEDULED,
        updatedAt: now,
        lastUpdatedBy: updatedBy
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async completeServiceRequest(requestId: number, userId: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        status: REQUEST_STATUS.COMPLETED,
        completedAt: now,
        updatedAt: now,
        lastUpdatedBy: userId
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async cancelServiceRequest(requestId: number, reason: string, userId: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        status: REQUEST_STATUS.CANCELLED,
        cancellationReason: reason,
        updatedAt: now,
        lastUpdatedBy: userId
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async updateServiceRequestNotes(requestId: number, notes: string, userId: number): Promise<ServiceRequest> {
    const now = new Date();
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        notes,
        updatedAt: now,
        lastUpdatedBy: userId
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  // Méthodes de filtrage et recherche
  async getServiceRequestsByStatus(status: string): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.status, status));
  }

  async getServiceRequestsByAssignee(userId: number): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.assignedTo, userId));
  }

  // Méthodes de paiement
  async getRecentPayments(limit: number): Promise<any[]> {
    // Récupérer les paiements de la table payments
    try {
      console.log(`Récupération des ${limit} paiements les plus récents`);

      const recentPayments = await db
        .select()
        .from(payments)
        .orderBy(desc(payments.createdAt))
        .limit(limit);

      // Vérifier les données pour le débogage
      if (recentPayments.length > 0) {
        console.log(`${recentPayments.length} paiements trouvés`);
        console.log(`Premier paiement: ${JSON.stringify({
          id: recentPayments[0].id, 
          paymentId: recentPayments[0].paymentId,
          reference: recentPayments[0].referenceNumber, 
          amount: recentPayments[0].amount,
          status: recentPayments[0].status
        })}`);
      } else {
        console.log('Aucun paiement trouvé');
      }

      return recentPayments;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements récents:', error);
      return [];
    }
  }

  async getPayments(page: number = 1, limit: number = 20): Promise<{ payments: Payment[], total: number }> {
    const offset = (page - 1) * limit;

    // Récupérer les paiements avec pagination - filtrer uniquement les références RAC-
    const paymentsData = await db
      .select()
      .from(payments)
      .where(sql`${payments.referenceNumber} LIKE 'RAC-%'`)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    // Compter le nombre total de paiements RAC- uniquement
    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(payments)
      .where(sql`${payments.referenceNumber} LIKE 'RAC-%'`);

    return {
      payments: paymentsData,
      total: count || 0
    };
  }

  async getPaymentByPaymentId(paymentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, paymentId));

    return payment || undefined;
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const now = new Date();

    // S'assurer que le montant est bien une chaîne pour la compatibilité avec le type decimal
    let paymentDataWithCorrectTypes = { ...paymentData };

    if (typeof paymentDataWithCorrectTypes.amount === 'number') {
      paymentDataWithCorrectTypes.amount = String(paymentDataWithCorrectTypes.amount);
    }

    const [payment] = await db
      .insert(payments)
      .values({
        ...paymentDataWithCorrectTypes,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return payment;
  }

  async updatePaymentStatus(paymentId: number | string, status: string): Promise<Payment | undefined> {
    const now = new Date();

    // Si le paymentId est un nombre, nous devons le convertir en chaîne
    const paymentIdStr = paymentId.toString();

    const [payment] = await db
      .update(payments)
      .set({
        status,
        updatedAt: now
      })
      .where(eq(payments.paymentId, paymentIdStr))
      .returning();

    return payment || undefined;
  }

  async cancelPayment(paymentId: string | number, userId?: number): Promise<Payment | undefined> {
    const now = new Date();

    // Si le paymentId est un nombre, nous devons le convertir en chaîne
    const paymentIdStr = paymentId.toString();

    const [payment] = await db
      .update(payments)
      .set({
        status: "canceled",
        updatedAt: now,
        metadata: sql`jsonb_set(coalesce(metadata, '{}'::jsonb), '{canceledBy}', ${userId ? userId.toString() : null}::jsonb, true)`
      })
      .where(eq(payments.paymentId, paymentIdStr))
      .returning();

    // Si le paiement est lié à une demande de service, mettre à jour son statut
    if (payment) {
      const serviceRequest = await this.getServiceRequestByReference(payment.referenceNumber);
      if (serviceRequest) {
        await this.updateServiceRequestStatus(
          serviceRequest.id, 
          REQUEST_STATUS.PAYMENT_PENDING, 
          userId || 0
        );
      }
    }

    return payment || undefined;
  }

  async getAgentPayments(userId: number, page: number = 1, limit: number = 20): Promise<{ payments: any[], total: number, commissionTotal: number }> {
    const offset = (page - 1) * limit;

    try {
      // Récupérer les demandes assignées à l'agent et qui ont un paiement
      const requests = await db
        .select()
        .from(serviceRequests)
        .where(and(
          eq(serviceRequests.assignedTo, userId),
          isNotNull(serviceRequests.paymentId),
          eq(serviceRequests.paymentStatus, 'paid')
        ))
        .orderBy(desc(serviceRequests.updatedAt))
        .limit(limit)
        .offset(offset);

      // Compter le nombre total de paiements pour cet agent
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceRequests)
        .where(and(
          eq(serviceRequests.assignedTo, userId),
          isNotNull(serviceRequests.paymentId),
          eq(serviceRequests.paymentStatus, 'paid')
        ));

      // Calculer le montant total des commissions (14€ pour 129.80€, 28€ pour 259.60€)
      let commissionTotal = 0;

      const payments = requests.map(request => {
        // Calcul de la commission pour cette demande
        let commission = 0;
        // Convertir en nombre pour éviter les problèmes de comparaison
        const amount = Number(request.paymentAmount || 0);
        // Calculer la commission basée sur le tarif de 14€ par tranche de 129.80€
        if (amount > 0) {
          // Calculer combien de fois 129.80€ est présent dans le montant
          const baseAmount = 12980; // 129.80€ en centimes
          const baseCommission = 1400; // 14€ en centimes
          // Math.ceil pour arrondir au supérieur (ex: 1.1 tranches = 2 tranches complètes)
          const multiplier = Math.ceil(amount / baseAmount);
          commission = baseCommission * multiplier;
        }

        // Ajouter au total des commissions
        commissionTotal += commission;

        return {
          id: request.id,
          paymentId: request.paymentId,
          referenceNumber: request.referenceNumber,
          amount: request.paymentAmount || 129.80,
          status: request.paymentStatus || "pending",
          createdAt: request.paymentDate || request.updatedAt,
          clientName: request.name,
          clientEmail: request.email,
          commission: commission
        };
      });

      return { 
        payments, 
        total: count.count, 
        commissionTotal 
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements d'agent:", error);
      return { payments: [], total: 0, commissionTotal: 0 };
    }
  }

  async updateServiceRequestPayment(
    requestId: number, 
    paymentId: string, 
    paymentStatus: string, 
    amount: number | string,
    paymentDetails?: {
      cardBrand?: string;
      cardLast4?: string;
      cardExpMonth?: number;
      cardExpYear?: number;
      billingName?: string;
      bankName?: string;
      paymentMethod?: string;
    }
  ): Promise<ServiceRequest> {
    const now = new Date();
    // Convertir le montant en chaîne pour s'assurer de la compatibilité avec le type decimal
    const amountString = typeof amount === 'number' ? String(amount) : amount;

    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        paymentId,
        paymentStatus,
        paymentAmount: amountString,
        paymentDate: now,
        updatedAt: now,
        // Si le paiement est réussi, mettre à jour le statut de la demande
        ...(paymentStatus === "paid" && { status: REQUEST_STATUS.PAID }),
        // Ajouter les informations bancaires si disponibles
        ...(paymentDetails?.cardBrand && { cardBrand: paymentDetails.cardBrand }),
        ...(paymentDetails?.cardLast4 && { cardLast4: paymentDetails.cardLast4 }),
        ...(paymentDetails?.cardExpMonth && { cardExpMonth: paymentDetails.cardExpMonth }),
        ...(paymentDetails?.cardExpYear && { cardExpYear: paymentDetails.cardExpYear }),
        ...(paymentDetails?.billingName && { billingName: paymentDetails.billingName }),
        ...(paymentDetails?.bankName && { bankName: paymentDetails.bankName }),
        ...(paymentDetails?.paymentMethod && { paymentMethod: paymentDetails.paymentMethod }),
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  async updateServiceRequestPaymentAttempt(
    requestId: number,
    status: string,
    amount: number | string,
    paymentErrorDetails: {
      code: string;
      message: string;
      timestamp: string;
      cardDetails?: {
        cardholderName?: string;
        brand?: string;
        last4?: string;
        expMonth?: number;
        expYear?: number;
      }
    }
  ): Promise<ServiceRequest> {
    const now = new Date();
    // Convertir le montant en chaîne pour s'assurer de la compatibilité avec le type decimal
    const amountString = typeof amount === 'number' ? String(amount) : amount;

    // Stockons les détails de la carte dans les champs appropriés
    // mais aussi dans un champ JSON pour pouvoir stocker les détails d'erreur complètement
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        // Mettre à jour le statut de paiement et les métadonnées
        paymentStatus: status,
        paymentAmount: amountString,
        paymentError: JSON.stringify(paymentErrorDetails),
        updatedAt: now,

        // Stocker les détails de carte dans les champs structurés si disponibles
        ...(paymentErrorDetails.cardDetails?.brand && { 
          cardBrand: paymentErrorDetails.cardDetails.brand 
        }),
        ...(paymentErrorDetails.cardDetails?.last4 && { 
          cardLast4: paymentErrorDetails.cardDetails.last4 
        }),
        ...(paymentErrorDetails.cardDetails?.expMonth && { 
          cardExpMonth: paymentErrorDetails.cardDetails.expMonth 
        }),
        ...(paymentErrorDetails.cardDetails?.expYear && { 
          cardExpYear: paymentErrorDetails.cardDetails.expYear 
        }),
        ...(paymentErrorDetails.cardDetails?.cardholderName && { 
          billingName: paymentErrorDetails.cardDetails.cardholderName 
        }),
        // Utiliser paymentDate au lieu de paymentFailedAt qui n'existe pas dans notre schéma
        paymentDate: now,
      })
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return serviceRequest;
  }

  // Méthodes de journalisation - temporairement désactivée
  async logActivity(activityLog: InsertActivityLog): Promise<ActivityLog> {
    // Temporairement désactivé pour éviter les erreurs
    console.log('Activity log skipped:', activityLog);
    return { id: 1, ...activityLog, createdAt: new Date(), ipAddress: null } as ActivityLog;
  }

  async getActivityLogs(entityType: string, entityId: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(
        eq(activityLogs.entityType, entityType) && 
        eq(activityLogs.entityId, entityId)
      );
  }

  async getUserActivityLogs(userId: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId));
  }

  // Méthodes pour gérer les statuts et rappels des leads
  async updateLeadStatus(leadId: number, data: { status: string, statusUpdatedAt: Date, statusUpdatedBy: number | undefined }): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({
        status: data.status,
        statusUpdatedAt: data.statusUpdatedAt,
        statusUpdatedBy: data.statusUpdatedBy,
        updatedAt: new Date()
      })
      .where(eq(leads.id, leadId))
      .returning();

    return updatedLead;
  }

  async updateLeadCallback(leadId: number, data: { callbackDate: Date, callbackNotes?: string, status: string, statusUpdatedAt: Date, statusUpdatedBy: number | undefined }): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({
        status: data.status,
        statusUpdatedAt: data.statusUpdatedAt,
        statusUpdatedBy: data.statusUpdatedBy,
        callbackDate: data.callbackDate,
        callbackNotes: data.callbackNotes || null,
        updatedAt: new Date()
      })
      .where(eq(leads.id, leadId))
      .returning();

    return updatedLead;
  }

  // Méthodes pour les tâches des agents
  async createAgentTask(task: InsertAgentTask): Promise<AgentTask> {
    const now = new Date();
    const [newTask] = await db
      .insert(agentTasks)
      .values({
        ...task,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return newTask;
  }

  async getAgentTask(id: number): Promise<AgentTask | undefined> {
    const [task] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, id));

    return task || undefined;
  }

  async getAgentTasks(userId: number, filters?: { status?: string, priority?: string, dueDate?: Date }): Promise<AgentTask[]> {
    let query = db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.userId, userId));

    if (filters) {
      if (filters.status) {
        query = query.where(eq(agentTasks.status, filters.status));
      }

      if (filters.priority) {
        query = query.where(eq(agentTasks.priority, filters.priority));
      }

      if (filters.dueDate) {
        // Obtenez la date à minuit
        const startDate = new Date(filters.dueDate);
        startDate.setHours(0, 0, 0, 0);

        // Obtenez la fin de la journée
        const endDate = new Date(filters.dueDate);
        endDate.setHours(23, 59, 59, 999);

        query = query.where(
          and(
            sql`${agentTasks.dueDate} >= ${startDate}`,
            sql`${agentTasks.dueDate} <= ${endDate}`
          )
        );
      }
    }

    return await query.orderBy(
      agentTasks.dueDate,
      desc(sql`CASE 
        WHEN ${agentTasks.priority} = 'high' THEN 1
        WHEN ${agentTasks.priority} = 'medium' THEN 2
        WHEN ${agentTasks.priority} = 'normal' THEN 3
        WHEN ${agentTasks.priority} = 'low' THEN 4
        ELSE 5
      END`)
    );
  }

  async updateAgentTask(id: number, data: Partial<InsertAgentTask>): Promise<AgentTask | undefined> {
    const now = new Date();
    const [updatedTask] = await db
      .update(agentTasks)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(agentTasks.id, id))
      .returning();

    return updatedTask || undefined;
  }

  async completeAgentTask(id: number, userId: number): Promise<AgentTask | undefined> {
    const now = new Date();
    const [completedTask] = await db
      .update(agentTasks)
      .set({
        status: 'completed',
        completedAt: now,
        updatedAt: now
      })
      .where(
        and(
          eq(agentTasks.id, id),
          eq(agentTasks.userId, userId)
        )
      )
      .returning();

    return completedTask || undefined;
  }

  async deleteAgentTask(id: number): Promise<boolean> {
    await db
      .delete(agentTasks)
      .where(eq(agentTasks.id, id));

    return true;
  }

  async getDueTasks(userId?: number): Promise<AgentTask[]> {
    console.log("[DEBUG getDueTasks] Entrée dans la fonction");

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    console.log(`[DEBUG getDueTasks] Date limite définie: ${today.toISOString()}`);

    // On va simplifier la requête pour récupérer d'abord toutes les tâches en attente
    let query = db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.status, 'pending'));

    if (userId) {
      console.log(`[DEBUG getDueTasks] Filtrage par userId: ${userId}`);
      query = query.where(eq(agentTasks.userId, userId));
    }

    // Exécuter la requête
    const tasks = await query.orderBy(agentTasks.dueDate);

    console.log(`[DEBUG getDueTasks] ${tasks.length} tâches en attente récupérées`);

    // Filtrer les tâches dont la date d'échéance est passée ou aujourd'hui
    // On fait ce filtrage en JavaScript plutôt qu'en SQL pour éviter les problèmes de format de date
    const dueTasks = tasks.filter(task => {
      // Si pas de date d'échéance, ne pas l'inclure
      if (!task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      const taskDue = dueDate <= today;

      console.log(`[DEBUG getDueTasks] Tâche ${task.id}: date d'échéance ${dueDate.toISOString()}, est due? ${taskDue}`);

      return taskDue;
    });

    console.log(`[DEBUG getDueTasks] ${dueTasks.length} tâches dues après filtrage`);

    // Trier par priorité
    dueTasks.sort((a, b) => {
      // D'abord par date d'échéance
      const dateA = new Date(a.dueDate!).getTime();
      const dateB = new Date(b.dueDate!).getTime();
      if (dateA !== dateB) return dateA - dateB;

      // Ensuite par priorité
      const priorityOrder = { 'high': 1, 'medium': 2, 'normal': 3, 'low': 4 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 5);
    });

    return dueTasks;
  }

  // Méthodes pour les animations UI
  async getAllUiAnimations(): Promise<UiAnimation[]> {
    return await db.select().from(uiAnimations);
  }

  async getUiAnimation(id: number): Promise<UiAnimation | undefined> {
    const [animation] = await db
      .select()
      .from(uiAnimations)
      .where(eq(uiAnimations.id, id));

    return animation || undefined;
  }

  async createUiAnimation(animation: InsertUiAnimation): Promise<UiAnimation> {
    const now = new Date();
    const [newAnimation] = await db
      .insert(uiAnimations)
      .values({
        ...animation,
        createdAt: now
      })
      .returning();

    return newAnimation;
  }

  async updateUiAnimation(id: number, animationData: Partial<InsertUiAnimation>, userId: number): Promise<UiAnimation | undefined> {
    // Vérifier si l'animation existe
    const existingAnimation = await this.getUiAnimation(id);
    if (!existingAnimation) {
      return undefined;
    }

    const now = new Date();
    const [updatedAnimation] = await db
      .update(uiAnimations)
      .set({
        ...animationData,
        lastModifiedAt: now,
        lastModifiedBy: userId
      })
      .where(eq(uiAnimations.id, id))
      .returning();

    return updatedAnimation;
  }

  async toggleUiAnimation(id: number, userId: number): Promise<UiAnimation | undefined> {
    // Récupérer l'animation actuelle
    const animation = await this.getUiAnimation(id);
    if (!animation) {
      return undefined;
    }

    // Inverser l'état enabled et mettre à jour
    const [updatedAnimation] = await db
      .update(uiAnimations)
      .set({
        enabled: !animation.enabled,
        lastModifiedAt: new Date(),
        lastModifiedBy: userId
      })
      .where(eq(uiAnimations.id, id))
      .returning();

    return updatedAnimation;
  }

  async getUiAnimationsByCategory(category: string): Promise<UiAnimation[]> {
    return await db
      .select()
      .from(uiAnimations)
      .where(eq(uiAnimations.category, category));
  }

  async deleteAllUiAnimations(): Promise<boolean> {
    await db.delete(uiAnimations);
    return true;
  }

  // Méthode d'accès aux configurations système
  async getSystemConfig(key: string): Promise<string | null> {
    try {
      const [config] = await db
        .select()
        .from(systemConfigs)
        .where(eq(systemConfigs.configKey, key));

      return config?.configValue || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la configuration ${key}:`, error);
      return null;
    }
  }

  // Méthodes de liaison entre lead et demande de service
  async findAndLinkLeadToServiceRequest(serviceRequestId: number): Promise<boolean> {
    try {
      // D'abord, récupérer la demande de service
      const serviceRequest = await this.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        console.error(`Demande de service non trouvée avec l'ID ${serviceRequestId}`);
        return false;
      }

      // Si la demande a déjà un leadId, pas besoin de chercher
      if (serviceRequest.leadId) {
        console.log(`La demande ${serviceRequest.referenceNumber} a déjà un lead associé (ID: ${serviceRequest.leadId})`);
        return true;
      }

      // Chercher un lead correspondant par numéro de référence
      if (serviceRequest.referenceNumber) {
        // Vérifier s'il existe un lead avec cette référence
        const [leadByRef] = await db
          .select()
          .from(leads)
          .where(eq(leads.referenceNumber, serviceRequest.referenceNumber));

        if (leadByRef) {
          return await this.linkLeadToServiceRequest(leadByRef.id, serviceRequestId);
        }

        // Essayer de trouver le lead par email et nom
        if (serviceRequest.email && serviceRequest.name) {
          // Extraire prénom et nom
          const nameParts = serviceRequest.name.split(' ');
          let firstName = nameParts[0] || '';
          let lastName = nameParts.slice(1).join(' ') || '';

          // Rechercher les leads avec le même email
          const leadsWithEmail = await db
            .select()
            .from(leads)
            .where(eq(leads.email, serviceRequest.email));

          // Si on trouve des leads, essayer de correspondre avec le nom
          if (leadsWithEmail.length > 0) {
            // Prendre le plus récent si plusieurs
            const matchingLead = leadsWithEmail[0];
            return await this.linkLeadToServiceRequest(matchingLead.id, serviceRequestId);
          }
        }

        // Note: Les demandes complètes utilisent RAC- et ne devraient pas être liées aux leads LEAD-
        // Les leads utilisent LEAD- et les demandes complètes utilisent RAC-
        // Cette liaison automatique n'est plus nécessaire car les workflows sont distincts
      }

      console.log(`Aucun lead correspondant trouvé pour la demande ${serviceRequest.referenceNumber}`);
      return false;
    } catch (error) {
      console.error('Erreur lors de la recherche et liaison lead-demande:', error);
      return false;
    }
  }

  async linkLeadToServiceRequest(leadId: number, serviceRequestId: number): Promise<boolean> {
    try {
      // Vérifier que le lead existe
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        console.error(`Lead non trouvé avec l'ID ${leadId}`);
        return false;
      }

      // Vérifier que la demande de service existe
      const serviceRequest = await this.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        console.error(`Demande de service non trouvée avec l'ID ${serviceRequestId}`);
        return false;
      }

      // Mettre à jour la demande de service avec l'ID du lead
      await db
        .update(serviceRequests)
        .set({
          leadId: leadId,
          updatedAt: new Date()
        })
        .where(eq(serviceRequests.id, serviceRequestId));

      // Mettre à jour le lead pour marquer la conversion et associer à la demande de service
      await db
        .update(leads)
        .set({
          convertedToRequest: true,
          convertedRequestId: serviceRequestId,
          referenceNumber: serviceRequest.referenceNumber, // Synchronisation de la référence
          updatedAt: new Date()
        })
        .where(eq(leads.id, leadId));

      // Si le paiement a été effectué sur la demande de service, synchroniser avec le lead
      if (serviceRequest.paymentStatus && serviceRequest.paymentId) {
        await db
          .update(leads)
          .set({
            paymentStatus: serviceRequest.paymentStatus,
            paymentId: serviceRequest.paymentId,
            paymentAmount: serviceRequest.paymentAmount,
            paymentMethod: serviceRequest.paymentMethod,
            paymentDate: serviceRequest.paymentDate,
            cardBrand: serviceRequest.cardBrand,
            cardLast4: serviceRequest.cardLast4,
            cardExpMonth: serviceRequest.cardExpMonth,
            cardExpYear: serviceRequest.cardExpYear,
            billingName: serviceRequest.billingName,
            bankName: serviceRequest.bankName,
            paymentError: serviceRequest.paymentError,
            updatedAt: new Date()
          })
          .where(eq(leads.id, leadId));
      }

      console.log(`Lead ${leadId} lié avec succès à la demande de service ${serviceRequestId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la liaison lead-demande:', error);
      return false;
    }
  }

  /************ Méthodes de gestion des contacts ************/

  // Créer un nouveau contact
  async createContact(contactData: InsertContact): Promise<Contact> {
    // Insérer dans la base de données
    const [contact] = await db
      .insert(contacts)
      .values(contactData)
      .returning();

    return contact;
  }

  // Récupérer un contact par son ID
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    return contact;
  }

  // Récupérer tous les contacts
  async getAllContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  // Récupérer les contacts avec pagination (pour l'interface getContacts)
  async getContacts(page: number = 1, limit: number = 20): Promise<{ contacts: Contact[], total: number }> {
    const offset = (page - 1) * limit;

    const contactsResult = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts);

    return {
      contacts: contactsResult,
      total: Number(count),
    };
  }

  // Récupérer les contacts non lus avec pagination
  async getUnreadContacts(page: number = 1, limit: number = 20): Promise<{ contacts: Contact[], total: number }> {
    const offset = (page - 1) * limit;

    const contactsResult = await db
      .select()
      .from(contacts)
      .where(eq(contacts.status, "unread"))
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.status, "unread"));

    return {
      contacts: contactsResult,
      total: Number(count),
    };
  }

  // Retrocompatibilité - utilise getContacts
  async getContactsPaginated(page: number = 1, limit: number = 20): Promise<{ contacts: Contact[], total: number }> {
    return this.getContacts(page, limit);
  }

  // Récupérer le nombre de contactsnon lus
  async getUnreadContactsCount(): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.status, "unread"));

    return Number(count);
  }

  // Mettre à jour le statut d'un contact
  async updateContactStatus(id: number, status: string, userId?: number): Promise<Contact | undefined> {
    const now = new Date();
    let updateData: any = {
      status
    };

    // Si on marque comme lu
    if (status === "read" && userId) {
      updateData.readAt = now;
      updateData.readBy = userId;
    }

    // Si on marque comme répondu
    if (status === "replied" && userId) {
      updateData.repliedAt = now;
      updateData.repliedBy = userId;
    }

    const [contact] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();

    return contact;
  }

  // Méthode dupliquée supprimée pour corriger l'erreur de build

  // Récupérer les paiements associés à un utilisateur
  async getUserPayments(userId: number): Promise<Payment[]> {
    try {
      // Récupérer les demandes de service liées à l'utilisateur
      const userRequests = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.assignedTo, userId));

      // Extraire les numéros de référence
      const referenceNumbers = userRequests.map(req => req.referenceNumber);

      if (referenceNumbers.length === 0) {
        return [];
      }

      // Récupérer les paiements associés aux références
      const userPayments = await db
        .select()
        .from(payments)
        .where(
          referenceNumbers.length === 1 
            ? eq(payments.referenceNumber, referenceNumbers[0]) 
            : inArray(payments.referenceNumber, referenceNumbers)
        );

      return userPayments;
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements utilisateur:", error);
      return [];
    }
  }
}

// Export the storage instance after class definition
export const storage = new DatabaseStorage();