import { 
  type User, 
  type InsertUser, 
  type ServiceRequest, 
  type InsertServiceRequest,
  REQUEST_STATUS
} from "@shared/schema";

// Super simple interface - just what we need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequests(): Promise<ServiceRequest[]>;
}

// Clean in-memory storage - exactly like yesterday!
export class MemStorage implements IStorage {
  private users: User[] = [];
  private serviceRequests: ServiceRequest[] = [];
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
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      fullName: insertUser.fullName || '',
      role: insertUser.role || 'user',
      permissions: insertUser.permissions || {},
      active: insertUser.active !== false,
      lastLogin: null,
      createdAt: new Date(),
      createdBy: null,
      updatedAt: new Date(),
      updatedBy: null,
      deletedAt: null,
      deletedBy: null,
      profileImage: insertUser.profileImage || null,
      phone: insertUser.phone || null,
      department: insertUser.department || null,
      managerId: insertUser.managerId || null,
      commissionRate: insertUser.commissionRate || null
    };
    this.users.push(user);
    return user;
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      id: this.nextId++,
      name: insertRequest.name,
      email: insertRequest.email,
      createdAt: new Date(),
      status: REQUEST_STATUS.NEW,
      referenceNumber: `REQ-${this.nextId}`,
      leadId: null,
      clientType: insertRequest.clientType || '',
      phone: insertRequest.phone || '',
      company: insertRequest.company || null,
      siret: insertRequest.siret || null,
      serviceType: insertRequest.serviceType || '',
      requestType: insertRequest.requestType || '',
      buildingType: insertRequest.buildingType || '',
      projectStatus: insertRequest.projectStatus || '',
      address: insertRequest.address || '',
      city: insertRequest.city || '',
      postalCode: insertRequest.postalCode || '',
      cadastralReference: insertRequest.cadastralReference || null,
      existingInstallation: insertRequest.existingInstallation || false,
      connectionType: insertRequest.connectionType || null,
      plannedUsage: insertRequest.plannedUsage || null,
      maxPower: insertRequest.maxPower || null,
      urgency: insertRequest.urgency || 'normal',
      description: insertRequest.description || null,
      attachments: insertRequest.attachments || null,
      estimatedPrice: null,
      finalPrice: null,
      category: null,
      subcategory: null,
      priority: 'medium',
      assignedTo: null,
      validatedAt: null,
      validatedBy: null,
      completedAt: null,
      completedBy: null,
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
      internalNotes: null,
      customerNotes: null,
      followUpDate: null,
      lastContactDate: null,
      nextActionDate: null,
      tags: null,
      source: 'website',
      utm: null,
      ipAddress: null,
      userAgent: null,
      paymentStatus: null,
      paymentId: null,
      paymentAmount: null,
      paymentDate: null,
      invoiceNumber: null,
      invoiceDate: null,
      workStartDate: null,
      workEndDate: null,
      warrantyEndDate: null,
      updatedAt: new Date(),
      lastUpdatedBy: null,
      hasContract: null
    };
    this.serviceRequests.push(request);
    return request;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return [...this.serviceRequests];
  }
}

export const storage = new MemStorage();