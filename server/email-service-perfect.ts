import nodemailer from 'nodemailer';

// Templates d'emails professionnels avec design UI/UX parfait
const EMAIL_TEMPLATES = {
  lead: {
    subject: '🔔 Nouveau Lead - Étape 2 Complétée',
    getHtml: (data: any) => `
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
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">⚡ Nouveau Lead Généré</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Étape 2 du formulaire complétée</p>
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
                    <span style="color: #1e293b;">\${data.clientType || 'Non renseigné'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Nom :</strong>
                    <span style="color: #1e293b;">\${data.nom || 'Non renseigné'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong style="color: #475569;">Email :</strong>
                    <a href="mailto:\${data.email}" style="color: #1e40af; text-decoration: none;">\${data.email || 'Non renseigné'}</a>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <strong style="color: #475569;">Téléphone :</strong>
                    <a href="tel:\${data.telephone}" style="color: #1e40af; text-decoration: none;">\${data.telephone || 'Non renseigné'}</a>
                  </div>
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
                ⏰ \${new Date().toLocaleString('fr-FR')}
              </p>
            </div>

          </div>
        </body>
      </html>
    `
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
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">\${data.referenceNumber || 'N/A'}</div>
                  <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Payé le: \${new Date(data.paymentDate || Date.now()).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              <!-- Informations Paiement -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">💳 Détails du Paiement</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Montant :</strong>
                    <span style="color: #059669; margin-left: 10px; font-weight: bold; font-size: 18px;">\${data.amount ? (parseFloat(data.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">ID Transaction :</strong>
                    <span style="color: #1f2937; margin-left: 10px; font-family: monospace;">\${data.stripePaymentIntentId || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Carte :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">\${data.cardBrand || 'N/A'} •••• \${data.cardLast4 || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Informations Client -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Client</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Nom :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">\${data.clientName || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Email :</strong>
                    <a href="mailto:\${data.clientEmail}" style="color: #059669; margin-left: 10px; text-decoration: none; font-weight: bold;">\${data.clientEmail || 'N/A'}</a>
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
                ✅ Paiement sécurisé • ⏰ \${new Date().toLocaleString('fr-FR')}
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
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">\${data.referenceNumber || 'N/A'}</div>
                  <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tentative: \${new Date(data.attemptDate || Date.now()).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              <!-- Informations Client -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Contact Client</h3>
                <div style="display: grid; gap: 10px;">
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Nom :</strong>
                    <span style="color: #1f2937; margin-left: 10px;">\${data.clientName || 'N/A'}</span>
                  </div>
                  <div style="background: white; border-radius: 6px; padding: 12px; border: 1px solid #e5e7eb;">
                    <strong style="color: #374151;">Email :</strong>
                    <a href="mailto:\${data.clientEmail}" style="color: #dc2626; margin-left: 10px; text-decoration: none; font-weight: bold;">\${data.clientEmail || 'N/A'}</a>
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
                🚨 Priorité CRITIQUE • ⏰ \${new Date().toLocaleString('fr-FR')}
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

// Fonction pour envoyer la notification de nouveau lead
export async function sendLeadNotification(leadData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const template = EMAIL_TEMPLATES.lead;
    
    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: template.subject,
      html: template.getHtml(leadData),
      text: `Nouveau lead généré - Type: ${leadData.clientType} - Nom: ${leadData.nom} - Email: ${leadData.email} - Téléphone: ${leadData.telephone}`
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

// Initialiser le service automatiquement
setupSmtpService();