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
  REQUEST_STATUS
} from "@shared/schema";

// Simple interface for minimal functionality
export interface IStorage {
  // Basic user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Basic service request methods
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
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

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      id: this.nextId++,
      status: REQUEST_STATUS.NOUVEAU,
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

// Export the simple storage instance
export const storage = new MemStorage();