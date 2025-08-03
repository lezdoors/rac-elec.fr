import nodemailer from 'nodemailer';

// Templates d'emails professionnels avec design UI/UX parfait
const EMAIL_TEMPLATES = {
  lead: {
    subject: '🎯 Nouveau Lead - Étape 1 Complétée',
    getHtml: (data: any) => {
      // Template qui affiche les VRAIES données saisies
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Nouveau Lead</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
              
              <h1 style="color: #059669; text-align: center;">🎯 NOUVEAU LEAD GÉNÉRÉ</h1>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>👤 Informations Client</h3>
                <p><strong>Nom :</strong> ${data.prenom || ''} ${data.nom || ''}</p>
                <p><strong>Email :</strong> <a href="mailto:${data.email}">${data.email || ''}</a></p>
                <p><strong>Téléphone :</strong> <a href="tel:${data.telephone}">${data.telephone || ''}</a></p>
                <p><strong>Type :</strong> ${data.clientType || ''}</p>
                ${data.raisonSociale ? `<p><strong>Société :</strong> ${data.raisonSociale}</p>` : ''}
              </div>

              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-weight: bold; color: #166534;">
                  ⚡ CONTACTER DANS LES 2 HEURES
                </p>
              </div>

            </div>
          </body>
        </html>
      `;
    }
  },

  paiementReussi: {
    subject: '✅ Paiement Confirmé - Référence {reference}',
    getHtml: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement Confirmé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">✅ Paiement Confirmé</h1>
              <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Transaction réussie</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              
              <!-- Status Badge -->
              <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <span style="background: #059669; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 16px;">💰 PAIEMENT RÉUSSI</span>
              </div>

              <!-- Informations de Référence -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📋 Référence Demande</h3>
                <div style="background: white; border-radius: 6px; padding: 15px; border-left: 4px solid #059669;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${data.referenceNumber || 'N/A'}</div>
                  <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Payé le: ${new Date(data.paymentDate || Date.now()).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              <!-- Informations Paiement -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">💳 Détails du Paiement</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Montant :</strong>
                    <span style="color: #059669; margin-left: 10px; font-weight: bold; font-size: 18px;">${data.amount ? (parseFloat(data.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">ID Transaction :</strong>
                    <span style="color: #1f2937; margin-left: 10px; font-family: monospace;">${data.stripePaymentIntentId || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Carte :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">${data.cardBrand || 'N/A'} •••• ${data.cardLast4 || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Informations Client -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Client</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Nom :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">${data.clientName || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Email :</strong>
                    <a href="mailto:${data.clientEmail}" style="color: #059669; margin-left: 10px; text-decoration: none; font-weight: bold;">${data.clientEmail || 'N/A'}</a>
                  </div>
                </div>
              </div>

              <!-- Actions suivantes -->
              <div style="background: #dbeafe; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">📋 Prochaines Étapes</h3>
                <ol style="color: #1e40af; text-align: left; margin: 0; padding-left: 20px; font-weight: bold;">
                  <li style="margin-bottom: 8px;">Confirmer la demande dans le système</li>
                  <li style="margin-bottom: 8px;">Envoyer l'accusé de réception au client</li>
                  <li style="margin-bottom: 8px;">Planifier l'intervention technique</li>
                  <li>Notifier le client des prochaines étapes</li>
                </ol>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                📧 Notification automatique portail-electricite.com<br>
                ✅ Paiement sécurisé • ⏰ ${new Date().toLocaleString('fr-FR')}
              </p>
            </div>

          </div>
        </body>
      </html>
    `
  },

  paiementEchoue: {
    subject: '🚨 URGENT - Paiement Échoué - Référence {reference}',
    getHtml: (data: any) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement Échoué</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🚨 Paiement Échoué</h1>
              <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Action immédiate requise</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              
              <!-- Status Badge -->
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <span style="background: #dc2626; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 16px;">❌ PAIEMENT ÉCHOUÉ</span>
              </div>

              <!-- Informations de Référence -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📋 Référence Demande</h3>
                <div style="background: white; border-radius: 6px; padding: 15px; border-left: 4px solid #dc2626;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${data.referenceNumber || 'N/A'}</div>
                  <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tentative: ${new Date(data.attemptDate || Date.now()).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              <!-- Informations Client -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Contact Client</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Nom :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">${data.clientName || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Email :</strong>
                    <a href="mailto:${data.clientEmail}" style="color: #dc2626; margin-left: 10px; text-decoration: none; font-weight: bold;">${data.clientEmail || 'N/A'}</a>
                  </div>
                </div>
              </div>

              <!-- Actions Urgentes -->
              <div style="background: #fbbf24; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">🚨 Actions URGENTES</h3>
                <ol style="color: #92400e; text-align: left; margin: 0; padding-left: 20px; font-weight: bold;">
                  <li style="margin-bottom: 8px;">Contacter le client IMMÉDIATEMENT</li>
                  <li style="margin-bottom: 8px;">Proposer une solution de paiement alternative</li>
                  <li style="margin-bottom: 8px;">Vérifier les informations bancaires</li>
                  <li>Envoyer un lien de paiement sécurisé</li>
                </ol>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                📧 Alerte automatique portail-electricite.com<br>
                🚨 Priorité CRITIQUE • ⏰ ${new Date().toLocaleString('fr-FR')}
              </p>
            </div>

          </div>
        </body>
      </html>
    `
  }
};

// Configuration globale du transporteur SMTP
let globalTransporter: nodemailer.Transporter | null = null;

// Interface pour la configuration SMTP
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  enabled: boolean;
}

// Fonction pour initialiser le service SMTP
export function setupSmtpService(config?: SmtpConfig) {
  try {
    // Configuration SMTP Namecheap parfaite (port 465 SSL)
    const smtpConfig = config || {
      host: 'premium234.web-hosting.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: 'notification@portail-electricite.com',
        pass: 'K@maka00@'
      },
      defaultFrom: 'notification@portail-electricite.com',
      enabled: true
    };

    console.log('🔧 Configuration SMTP:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user
    });

    // Créer le transporteur avec la configuration correcte
    globalTransporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      // Options optimisées pour Namecheap
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      tls: {
        rejectUnauthorized: false,
        servername: smtpConfig.host
      },
      pool: true,
      maxConnections: 5,
      debug: true,
      logger: true
    });

    console.log('✅ Service SMTP initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation SMTP:', error);
  }
}

// Fonction pour envoyer la notification de nouveau lead (Étape 1 → Étape 2)
export async function sendLeadNotification(leadData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    // Template HTML avec les VRAIES données directement intégrées
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau Lead</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3730a3, #4f46e5); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">⚡ Nouveau Lead Généré</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Étape 1 du formulaire complétée</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              
              <!-- Status Badge -->
              <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <span style="background: #16a34a; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">🎯 LEAD QUALIFIÉ</span>
              </div>

              <!-- Informations Client -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations Client</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Type de client :</strong>
                    <span style="color: #1e293b;">${leadData.clientType || 'Non renseigné'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Nom complet :</strong>
                    <span style="color: #1e293b;">${leadData.prenom || ''} ${leadData.nom || ''}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Email :</strong>
                    <a href="mailto:${leadData.email}" style="color: #1e40af; text-decoration: none;">${leadData.email || ''}</a>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <strong style="color: #475569;">Téléphone :</strong>
                    <a href="tel:${leadData.telephone}" style="color: #1e40af; text-decoration: none;">${leadData.telephone || ''}</a>
                  </div>
                  ${leadData.raisonSociale ? `
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Société :</strong>
                    <span style="color: #1e293b;">${leadData.raisonSociale}</span>
                  </div>
                  ` : ''}
                  ${leadData.nomCollectivite ? `
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Collectivité :</strong>
                    <span style="color: #1e293b;">${leadData.nomCollectivite}</span>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- Actions recommandées -->
              <div style="background: #fef3c7; border-radius: 8px; padding: 20px; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">⚡ Actions Recommandées</h3>
                <p style="color: #92400e; margin: 0; font-weight: bold;">Contacter ce lead dans les 2 heures pour maximiser les chances de conversion</p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                📧 Notification automatique portail-electricite.com<br>
                ⏰ ${new Date().toLocaleString('fr-FR')}
              </p>
            </div>

          </div>
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: `🎯 NOUVEAU LEAD - ${leadData.prenom || ''} ${leadData.nom || ''} (${leadData.referenceNumber || 'N/A'})`,
      html: htmlContent,
      text: `🎯 NOUVEAU LEAD GÉNÉRÉ
Référence: ${leadData.referenceNumber || 'N/A'}
Nom: ${leadData.prenom || ''} ${leadData.nom || ''}
Email: ${leadData.email || ''}
Téléphone: ${leadData.telephone || ''}
Type: ${leadData.clientType || ''}
${leadData.raisonSociale ? `Société: ${leadData.raisonSociale}` : ''}
${leadData.nomCollectivite ? `Collectivité: ${leadData.nomCollectivite}` : ''}

⚡ Action requise: Contacter dans les 2 heures`
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Lead envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Transporteur SMTP non configuré');
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Lead:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction pour envoyer la notification de demande complète
export async function sendRequestCompletedNotificationBackup(requestData: any) {
  try {
    const htmlContent = `
    <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="padding: 30px;">

                <!-- Informations de Référence -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📋 Référence Demande</h3>
                  <div style="background: white; border-radius: 6px; padding: 15px; border-left: 4px solid #059669;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${requestData.referenceNumber}</div>
                    <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Complétée: ${new Date().toLocaleString('fr-FR')}</div>
                  </div>
                </div>

                <!-- Informations Client Complètes -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations Client</h3>
                  <div style="display: grid; gap: 10px;">
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Nom complet :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.name}</span>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Email :</strong>
                      <a href="mailto:${requestData.email}" style="color: #059669; margin-left: 10px; text-decoration: none; font-weight: bold;">${requestData.email}</a>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #475569;">Téléphone :</strong>
                      <a href="tel:${requestData.phone}" style="color: #1e40af; text-decoration: none;">${requestData.phone}</a>
                    </div>
                    ${requestData.company ? `
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Société :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.company}</span>
                    </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Détails Projet -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">🏗️ Détails du Projet</h3>
                  <div style="display: grid; gap: 10px;">
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Adresse :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.address}, ${requestData.postalCode} ${requestData.city}</span>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Type de raccordement :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.requestType}</span>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Type de bâtiment :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.buildingType}</span>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Puissance demandée :</strong>
                      <span style="color: #1f2937; margin-left: 10px;">${requestData.powerRequired} kVA</span>
                    </div>
                  </div>
                </div>

                ${requestData.comments ? `
                <!-- Commentaires -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">💬 Commentaires</h3>
                  <div style="background: white; border-radius: 6px; padding: 15px; border: 1px solid #e5e7eb;">
                    <p style="color: #1f2937; margin: 0;">${requestData.comments}</p>
                  </div>
                </div>
                ` : ''}

                <!-- Actions recommandées -->
                <div style="background: #dcfce7; border-radius: 8px; padding: 20px; text-align: center;">
                  <h3 style="color: #166534; margin: 0 0 15px 0;">🎯 Actions Recommandées</h3>
                  <p style="color: #166534; margin: 0; font-weight: bold;">Traiter cette demande complète et contacter le client pour finalisation</p>
                </div>

              </div>

              <!-- Footer -->
              <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  📧 Notification automatique portail-electricite.com<br>
                  ⏰ ${new Date().toLocaleString('fr-FR')}
                </p>
              </div>

            </div>
          </div>
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: `📋 Demande complète - ${requestData.referenceNumber}`,
      html: htmlContent,
      text: `📋 DEMANDE COMPLÈTE
Référence: ${requestData.referenceNumber}
Nom: ${requestData.name}
Email: ${requestData.email}
Téléphone: ${requestData.phone}
Adresse: ${requestData.address}, ${requestData.postalCode} ${requestData.city}
Type raccordement: ${requestData.requestType}
Type bâtiment: ${requestData.buildingType}
Puissance: ${requestData.powerRequired} kVA
${requestData.comments ? 'Commentaires: ' + requestData.comments : ''}

🎯 Action requise: Traiter cette demande complète`
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Demande Complète envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Transporteur SMTP non configuré');
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Demande Complète:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction pour envoyer la notification de paiement réussi
export async function sendPaiementReussiNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const template = EMAIL_TEMPLATES.paiementReussi;
    
    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: template.subject.replace('{reference}', paiementData.referenceNumber || 'N/A'),
      html: template.getHtml(paiementData),
      text: `Paiement confirmé - Référence: ${paiementData.referenceNumber} - Montant: ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}`
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Paiement Réussi envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Transporteur SMTP non configuré');
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Paiement Réussi:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction pour envoyer la notification de paiement échoué
export async function sendPaiementEchoueNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const template = EMAIL_TEMPLATES.paiementEchoue;
    
    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: template.subject.replace('{reference}', paiementData.referenceNumber || 'N/A'),
      html: template.getHtml(paiementData),
      text: `URGENT - Paiement échoué - Référence: ${paiementData.referenceNumber} - Contact: ${paiementData.clientEmail}`
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Paiement Échoué envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Transporteur SMTP non configuré');
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Paiement Échoué:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// FONCTION DÉJÀ DÉFINIE CI-DESSUS - Duplication supprimée

// Initialiser le service automatiquement
setupSmtpService();