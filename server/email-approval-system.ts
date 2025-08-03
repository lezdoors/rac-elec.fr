/**
 * Système d'approbation d'emails - 100% français
 * Empêche l'envoi d'emails automatiques sans approbation
 */

interface EmailApprovalRequest {
  id: string;
  to: string;
  subject: string;
  content: string;
  type: 'lead' | 'payment' | 'notification' | 'marketing';
  priority: 'haute' | 'normale' | 'basse';
  requestedBy: string;
  requestedAt: Date;
  status: 'en_attente' | 'approuve' | 'rejete' | 'envoye';
  approvedBy?: string;
  approvedAt?: Date;
  language: 'fr';
}

class EmailApprovalSystem {
  private pendingEmails: Map<string, EmailApprovalRequest> = new Map();
  private approvers: Set<string> = new Set(['admin@portail-electricite.com']);

  /**
   * Demande d'approbation pour envoyer un email
   * TOUS les emails doivent passer par cette fonction
   */
  async requestEmailApproval(emailData: {
    to: string;
    subject: string;
    content: string;
    type: EmailApprovalRequest['type'];
    priority?: EmailApprovalRequest['priority'];
    requestedBy: string;
  }): Promise<{ success: boolean; approvalId: string; message: string }> {
    
    // Vérifier que le contenu est en français UNIQUEMENT pour les emails clients
    // Les notifications internes vers bonjour@portail-electricite.com sont toujours autorisées
    const isInternalNotification = emailData.to === 'bonjour@portail-electricite.com';
    
    if (!isInternalNotification && (this.containsEnglishContent(emailData.subject) || this.containsEnglishContent(emailData.content))) {
      throw new Error('ERREUR CRITIQUE: Contenu détecté en anglais. Tous les emails clients doivent être en français uniquement.');
    }

    const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: EmailApprovalRequest = {
      id: approvalId,
      to: emailData.to,
      subject: emailData.subject,
      content: emailData.content,
      type: emailData.type,
      priority: emailData.priority || 'normale',
      requestedBy: emailData.requestedBy,
      requestedAt: new Date(),
      status: 'en_attente',
      language: 'fr'
    };

    this.pendingEmails.set(approvalId, request);

    // Notifier les approbateurs immédiatement
    await this.notifyApprovers(request);

    console.log(`📧 DEMANDE D'APPROBATION EMAIL CRÉÉE: ${approvalId}`);
    console.log(`📤 Destinataire: ${emailData.to}`);
    console.log(`📝 Sujet: ${emailData.subject}`);
    console.log(`⏰ En attente d'approbation par un administrateur`);

    return {
      success: true,
      approvalId,
      message: `Email en attente d'approbation. ID: ${approvalId}`
    };
  }

  /**
   * Approuver un email (seuls les administrateurs peuvent approuver)
   */
  async approveEmail(approvalId: string, approverEmail: string): Promise<{ success: boolean; message: string }> {
    if (!this.approvers.has(approverEmail)) {
      throw new Error('Accès refusé: Seuls les administrateurs peuvent approuver les emails');
    }

    const request = this.pendingEmails.get(approvalId);
    if (!request) {
      throw new Error(`Demande d'approbation introuvable: ${approvalId}`);
    }

    if (request.status !== 'en_attente') {
      throw new Error(`Email déjà traité avec le statut: ${request.status}`);
    }

    request.status = 'approuve';
    request.approvedBy = approverEmail;
    request.approvedAt = new Date();

    console.log(`✅ EMAIL APPROUVÉ par ${approverEmail}: ${approvalId}`);
    
    // Maintenant l'email peut être envoyé
    return { success: true, message: 'Email approuvé et prêt à être envoyé' };
  }

  /**
   * Rejeter un email
   */
  async rejectEmail(approvalId: string, approverEmail: string, reason: string): Promise<{ success: boolean; message: string }> {
    if (!this.approvers.has(approverEmail)) {
      throw new Error('Accès refusé: Seuls les administrateurs peuvent rejeter les emails');
    }

    const request = this.pendingEmails.get(approvalId);
    if (!request) {
      throw new Error(`Demande d'approbation introuvable: ${approvalId}`);
    }

    request.status = 'rejete';
    request.approvedBy = approverEmail;
    request.approvedAt = new Date();

    console.log(`❌ EMAIL REJETÉ par ${approverEmail}: ${approvalId} - Raison: ${reason}`);
    
    return { success: true, message: `Email rejeté: ${reason}` };
  }

  /**
   * Vérifier si un email contient du contenu anglais
   */
  private containsEnglishContent(text: string): boolean {
    const englishWords = [
      'payment', 'successful', 'failed', 'error', 'warning', 'notification',
      'confirmation', 'receipt', 'invoice', 'billing', 'account', 'customer',
      'service', 'support', 'help', 'contact', 'please', 'thank you',
      'dear', 'sincerely', 'regards', 'email', 'message', 'subject'
    ];

    const textLower = text.toLowerCase();
    return englishWords.some(word => textLower.includes(word));
  }

  /**
   * Notifier les approbateurs qu'un email est en attente
   */
  private async notifyApprovers(request: EmailApprovalRequest): Promise<void> {
    console.log(`🔔 NOTIFICATION AUX APPROBATEURS:`);
    console.log(`📧 Nouvel email en attente d'approbation`);
    console.log(`🆔 ID: ${request.id}`);
    console.log(`👤 Destinataire: ${request.to}`);
    console.log(`📝 Sujet: ${request.subject}`);
    console.log(`⚡ Priorité: ${request.priority}`);
    console.log(`🔍 Type: ${request.type}`);
    
    // Ici vous pouvez ajouter une notification Slack, SMS, ou autre
    // pour alerter immédiatement les administrateurs
  }

  /**
   * Obtenir tous les emails en attente d'approbation
   */
  getPendingEmails(): EmailApprovalRequest[] {
    return Array.from(this.pendingEmails.values())
      .filter(request => request.status === 'en_attente')
      .sort((a, b) => {
        // Priorité haute en premier
        if (a.priority === 'haute' && b.priority !== 'haute') return -1;
        if (b.priority === 'haute' && a.priority !== 'haute') return 1;
        // Puis par date
        return b.requestedAt.getTime() - a.requestedAt.getTime();
      });
  }

  /**
   * Ajouter un approbateur
   */
  addApprover(email: string): void {
    this.approvers.add(email);
    console.log(`✅ Approbateur ajouté: ${email}`);
  }

  /**
   * Supprimer un approbateur
   */
  removeApprover(email: string): void {
    this.approvers.delete(email);
    console.log(`❌ Approbateur supprimé: ${email}`);
  }
}

// Instance globale du système d'approbation
export const emailApprovalSystem = new EmailApprovalSystem();

// Configuration initiale des approbateurs
emailApprovalSystem.addApprover('admin@portail-electricite.com');
emailApprovalSystem.addApprover('bonjour@portail-electricite.com');

console.log(`🛡️ SYSTÈME D'APPROBATION EMAIL INITIALISÉ`);
console.log(`🇫🇷 Mode: 100% français uniquement`);
console.log(`🔒 Aucun email automatique sans approbation`);