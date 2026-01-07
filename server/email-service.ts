import nodemailer from 'nodemailer';

// Configuration SMTP unique et fonctionnelle
let globalTransporter: any = null;

// Fonction helper pour déterminer le meilleur moment d'appel
function getOptimalCallTime(): string {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 9 && hour <= 12) {
    return "Maintenant (matin optimal)";
  } else if (hour >= 14 && hour <= 18) {
    return "Maintenant (après-midi optimal)";
  } else if (hour < 9) {
    return "À partir de 9h00";
  } else if (hour > 18) {
    return "Demain entre 9h-12h ou 14h-18h";
  } else {
    return "Entre 14h-18h aujourd'hui";
  }
}

// Configuration SMTP stableserver.net - NOUVELLE CONFIGURATION OFFICIELLE
export function setupSmtpService() {
  try {
    const smtpConfig = {
      host: 's3474.fra1.stableserver.net',
      port: 465,
      secure: true, // SSL
      auth: {
        user: 'kevin@monelec.net',
        pass: 'Kamaka00.'
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    globalTransporter = nodemailer.createTransport(smtpConfig);
    console.log('✅ SMTP STABLESERVER - kevin@monelec.net → notifications@raccordement-connect.com');
  } catch (error) {
    console.error('❌ Erreur configuration SMTP:', error);
  }
}

// 💰 FONCTIONS DE NOTIFICATION PAIEMENT EN TEMPS RÉEL

// Fonction pour envoyer notification de paiement reussi
export async function sendPaiementReussiNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialise
    if (!globalTransporter) {
      setupSmtpService();
    }

    const clientName = paiementData.clientName || paiementData.name || 'N/A';
    const montantFormate = paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' EUR' : 'N/A';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 15px; font-family: Arial, sans-serif; background: #f8f9fa; color: #212529;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">
            
            <!-- Header Simple -->
            <div style="background: #198754; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                PAIEMENT CONFIRME
              </h1>
              <p style="color: #d1e7dd; margin: 8px 0 0 0; font-size: 14px;">
                ${paiementData.referenceNumber || 'N/A'}
              </p>
            </div>
            
            <!-- Contenu -->
            <div style="padding: 25px;">
              
              <!-- Details du paiement -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 20px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">DETAILS DU PAIEMENT</h3>
                </div>
                <div style="padding: 20px;">
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">REFERENCE</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${paiementData.referenceNumber || 'N/A'}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">MONTANT</div>
                    <div style="color: #198754; font-size: 18px; font-weight: 900;">${montantFormate}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">STATUT</div>
                    <span style="background: #198754; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">PAYE</span>
                  </div>
                  <div>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ID TRANSACTION</div>
                    <div style="color: #6c757d; font-size: 12px; font-family: monospace;">${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <!-- Informations client -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">INFORMATIONS CLIENT</h3>
                </div>
                <div style="padding: 20px;">
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NOM</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${clientName}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">EMAIL</div>
                    <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #0d6efd; font-size: 14px; text-decoration: none;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a>
                  </div>
                  <div style="background: #d1ecf1; padding: 12px; border-radius: 4px; border-left: 3px solid #0dcaf0;">
                    <div style="color: #055160; font-size: 12px; font-weight: 700; margin-bottom: 4px;">TELEPHONE</div>
                    <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #212529; font-size: 18px; font-weight: 900; text-decoration: none;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  ${new Date().toLocaleString('fr-FR')} - Notification automatique
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'kevin@monelec.net',
      to: 'notifications@raccordement-connect.com',
      subject: `✅ PAIEMENT RÉUSSI - ${clientName} - ${paiementData.referenceNumber || 'N/A'} - ${montantFormate}`,
      html: htmlContent,
      text: `PAIEMENT CONFIRME
Reference: ${paiementData.referenceNumber || 'N/A'}
Montant: ${montantFormate}
Client: ${clientName}
Email: ${paiementData.clientEmail || paiementData.email || 'N/A'}
Telephone: ${paiementData.clientPhone || paiementData.phone || 'N/A'}`
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

// Fonction pour envoyer notification de paiement echoue
export async function sendPaiementEchoueNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialise
    if (!globalTransporter) {
      setupSmtpService();
    }

    const clientName = paiementData.clientName || paiementData.name || 'N/A';
    const montantFormate = paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' EUR' : 'N/A';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 15px; font-family: Arial, sans-serif; background: #f8f9fa; color: #212529;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">
            
            <!-- Header Simple -->
            <div style="background: #dc3545; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                PAIEMENT ECHOUE
              </h1>
              <p style="color: #f8d7da; margin: 8px 0 0 0; font-size: 14px;">
                ${paiementData.referenceNumber || 'N/A'}
              </p>
            </div>
            
            <!-- Contenu -->
            <div style="padding: 25px;">
              
              <!-- Details de l'echec -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 20px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">DETAILS DE L'ECHEC</h3>
                </div>
                <div style="padding: 20px;">
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">REFERENCE</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${paiementData.referenceNumber || 'N/A'}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">MONTANT TENTE</div>
                    <div style="color: #dc3545; font-size: 18px; font-weight: 900;">${montantFormate}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">STATUT</div>
                    <span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">ECHEC</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">RAISON</div>
                    <div style="color: #dc3545; font-size: 14px;">${paiementData.errorMessage || paiementData.error || 'Erreur de paiement'}</div>
                  </div>
                  <div>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ID TRANSACTION</div>
                    <div style="color: #6c757d; font-size: 12px; font-family: monospace;">${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <!-- Informations client -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">INFORMATIONS CLIENT</h3>
                </div>
                <div style="padding: 20px;">
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NOM</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${clientName}</div>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">EMAIL</div>
                    <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #0d6efd; font-size: 14px; text-decoration: none;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a>
                  </div>
                  <div style="background: #fff3cd; padding: 12px; border-radius: 4px; border-left: 3px solid #ffc107;">
                    <div style="color: #856404; font-size: 12px; font-weight: 700; margin-bottom: 4px;">TELEPHONE</div>
                    <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #212529; font-size: 18px; font-weight: 900; text-decoration: none;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  ${new Date().toLocaleString('fr-FR')} - Notification automatique
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'kevin@monelec.net',
      to: 'notifications@raccordement-connect.com',
      subject: `🚨 ÉCHEC PAIEMENT - ${clientName} - ${paiementData.referenceNumber || 'N/A'}`,
      html: htmlContent,
      text: `PAIEMENT ECHOUE
Reference: ${paiementData.referenceNumber || 'N/A'}
Montant: ${montantFormate}
Client: ${clientName}
Email: ${paiementData.clientEmail || paiementData.email || 'N/A'}
Telephone: ${paiementData.clientPhone || paiementData.phone || 'N/A'}
Raison: ${paiementData.errorMessage || paiementData.error || 'Erreur de paiement'}`
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

// Fonction pour envoyer notification de tentative de paiement
export async function sendTentativePaiementNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔄 TENTATIVE DE PAIEMENT</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Paiement en cours de traitement</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Informations de la tentative -->
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 20px;">💳 Tentative en Cours</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #d97706; font-weight: bold;">${paiementData.referenceNumber || 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant:</strong> <span style="color: #d97706; font-weight: bold;">${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Statut:</strong> <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">EN COURS</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Payment ID:</strong> ${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</p>
            </div>

            <!-- Informations client -->
            <div style="background: #f8fafc; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations Client</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${paiementData.clientName || paiementData.name || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #2563eb;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #2563eb; font-weight: bold; font-size: 18px;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a></p>
            </div>

            <!-- Information de suivi -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
              <h3 style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 18px;">👁️ Suivi en Cours</h3>
              <p style="margin: 0; color: #1e40af;">🔄 Paiement en cours de validation</p>
              <p style="margin: 5px 0 0 0; color: #1e40af;">⏱️ Confirmation attendue sous quelques minutes</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ⏰ ${new Date().toLocaleString('fr-FR')} | 📊 Notification de suivi
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'kevin@monelec.net',
      to: 'notifications@raccordement-connect.com',
      subject: `🔄 TENTATIVE PAIEMENT - ${paiementData.referenceNumber || 'N/A'} - ${paiementData.clientName || 'Client'}`,
      html: htmlContent,
      text: `🔄 TENTATIVE DE PAIEMENT
Référence: ${paiementData.referenceNumber || 'N/A'}
Montant: ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}
Client: ${paiementData.clientName || paiementData.name || 'N/A'}
Email: ${paiementData.clientEmail || paiementData.email || 'N/A'}
Téléphone: ${paiementData.clientPhone || paiementData.phone || 'N/A'}

🔄 Statut: Paiement en cours de validation - Confirmation attendue`
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Tentative Paiement envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Transporteur SMTP non configuré');
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Tentative Paiement:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction pour envoyer notification de nouveau lead
export async function sendLeadNotification(leadData: any) {
  try {
    // ✅ NOTIFICATION INTERNE - ENVOI DIRECT (pas d'approbation requise)
    // Le système d'approbation ne concerne QUE les emails automatiques aux clients en anglais
    
    const isComplete = leadData.isComplete === true;
    const headerColor = isComplete ? '#28a745' : '#495057'; // Vert pour complet, gris pour lead
    const headerTitle = isComplete ? 'DEMANDE COMPLÈTE' : 'NOUVEAU LEAD';
    const stepText = isComplete ? 'Étape 2/3 - Formulaire complet' : 'Étape 1/3 - Informations recueillies';
    const subjectPrefix = isComplete ? 'COMPLET' : '1st';
    
    const contenuEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${headerTitle} - Raccordement Électrique</title>
        </head>
        <body style="margin: 0; padding: 15px; font-family: Arial, sans-serif; background: #f8f9fa; color: #212529;">
          
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">
            
            <!-- Header Simple -->
            <div style="background: ${headerColor}; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                ${headerTitle} - ${leadData.referenceNumber || 'N/A'}
              </h1>
              <p style="color: #ced4da; margin: 8px 0 0 0; font-size: 14px;">
                ${stepText}
              </p>
            </div>
        
            
            <!-- Contenu Compact -->
            <div style="padding: 25px;">
              
              <!-- Informations Client Compact -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">
                    INFORMATIONS CLIENT
                  </h3>
                </div>
                
                <div style="padding: 20px;">
                  <!-- Nom complet -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NOM COMPLET</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${leadData.prenom || ''} ${leadData.nom || ''}</div>
                  </div>
                  
                  <!-- Téléphone - Prioritaire -->
                  <div style="margin-bottom: 15px; background: #fff3cd; padding: 12px; border-radius: 4px; border-left: 3px solid #ffc107;">
                    <div style="color: #856404; font-size: 12px; font-weight: 700; margin-bottom: 4px;">📞 TÉLÉPHONE</div>
                    <a href="tel:${leadData.telephone || leadData.phone}" style="color: #212529; font-size: 18px; font-weight: 900; text-decoration: none; display: block; word-break: break-all;">${leadData.telephone || leadData.phone || 'Non fourni'}</a>
                  </div>
                  
                  <!-- Email -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">EMAIL</div>
                    <a href="mailto:${leadData.email}" style="color: #007bff; font-size: 14px; font-weight: 600; text-decoration: none; display: block; word-break: break-all;">${leadData.email || 'Non fourni'}</a>
                  </div>
                  
                  <!-- Type de client -->
                  <div>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE</div>
                    <span style="color: #28a745; font-weight: 600; font-size: 14px; background: #d4edda; padding: 4px 8px; border-radius: 4px; text-transform: capitalize;">${leadData.clientType || 'Particulier'}</span>
                  </div>
                  ${leadData.societe || leadData.raisonSociale ? `
                  <!-- Société -->
                  <div style="margin-top: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">SOCIÉTÉ</div>
                    <div style="color: #fd7e14; font-weight: 600; font-size: 14px; background: #fff3cd; padding: 4px 8px; border-radius: 4px;">${leadData.societe || leadData.raisonSociale}</div>
                  </div>
                  ` : ''}
                </div>
              </div>

              ${isComplete ? `
              <!-- Détails du Projet (uniquement pour demande complète) -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-top: 20px;">
                <div style="background: #28a745; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #fff; font-size: 14px; font-weight: 600;">
                    DÉTAILS DU PROJET
                  </h3>
                </div>
                
                <div style="padding: 20px;">
                  <!-- Adresse -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ADRESSE DU PROJET</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.address || 'Non fournie'}</div>
                  </div>
                  
                  <!-- Type de raccordement -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE RACCORDEMENT</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.typeRaccordement || 'Non spécifié'}</div>
                  </div>
                  
                  <!-- Puissance -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">PUISSANCE DEMANDÉE</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.powerKva || 'N/A'} kVA</div>
                  </div>
                  
                  <!-- Phase -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE PHASE</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.phase || 'Non spécifié'}</div>
                  </div>
                  
                  <!-- Usage -->
                  ${leadData.usage ? `
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">USAGE</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.usage}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Terrain viabilisé -->
                  ${leadData.terrainViabilise !== undefined ? `
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TERRAIN VIABILISÉ</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.terrainViabilise}</div>
                  </div>
                  ` : ''}
                  
                  <!-- État du projet -->
                  ${leadData.projectState ? `
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ÉTAT DU PROJET</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.projectState}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Délai -->
                  ${leadData.timeline ? `
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">DÉLAI SOUHAITÉ</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${leadData.timeline}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Commentaires -->
                  ${leadData.comments ? `
                  <div>
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">COMMENTAIRES</div>
                    <div style="color: #212529; font-size: 14px; background: #fff3cd; padding: 10px; border-radius: 4px;">${leadData.comments}</div>
                  </div>
                  ` : ''}
                </div>
              </div>
              ` : ''}

              <!-- Note de Suivi Simple -->
              <div style="background: ${isComplete ? '#d4edda' : '#e9ecef'}; padding: 15px; border-radius: 4px; text-align: center; margin-top: 20px;">
                <div style="color: ${isComplete ? '#155724' : '#495057'}; font-size: 14px; font-weight: 600;">
                  ${isComplete ? 'Demande complète - En attente de paiement' : 'Lead en cours - Étape 1/3 complétée'}
                </div>
                <div style="color: #6c757d; font-size: 12px; margin-top: 4px;">
                  ${new Date().toLocaleString('fr-FR', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // ENVOI DIRECT - Notifications internes en français (pas d'approbation)
    if (!globalTransporter) {
      throw new Error('Transporteur SMTP non configuré');
    }

    const mailOptions = {
      from: `"Notifications Raccordement" <kevin@monelec.net>`,
      to: 'notifications@raccordement-connect.com',
      subject: `${subjectPrefix} - ${leadData.prenom || ''} ${leadData.nom || ''} - ${leadData.referenceNumber || 'N/A'}`,
      html: contenuEmail
    };

    const result = await globalTransporter.sendMail(mailOptions);
    console.log('✅ NOTIFICATION LEAD ENVOYÉE DIRECTEMENT:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Notification lead envoyée avec succès' 
    };
    
  } catch (error) {
    console.error('❌ Erreur demande approbation Lead:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur système' };
  }
}

// Fonction pour envoyer notification de message de support
export async function sendSupportMessageNotification(supportData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const contenuEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💬 NOUVEAU MESSAGE SUPPORT</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Message reçu via le formulaire de contact</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px;">📋 Informations du contact</h2>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="margin: 8px 0;"><strong>👤 Nom:</strong> ${supportData.name || 'Non fourni'}</p>
            <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${supportData.email || 'Non fourni'}</p>
            <p style="margin: 8px 0;"><strong>📱 Téléphone:</strong> ${supportData.phone || 'Non fourni'}</p>
            <p style="margin: 8px 0;"><strong>📝 Sujet:</strong> ${supportData.subject || 'Support général'}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">💭 Message:</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
              <p style="margin: 0; line-height: 1.6; color: #334155;">${supportData.message || 'Aucun message fourni'}</p>
            </div>
          </div>
          
          <p style="margin: 20px 0 0 0; text-align: center; color: #64748b; font-size: 14px;">
            ⏰ ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Support Raccordement" <kevin@monelec.net>`,
      to: 'notifications@raccordement-connect.com',
      subject: `💬 NOUVEAU MESSAGE SUPPORT - ${supportData.name || 'Contact anonyme'}`,
      html: contenuEmail
    };

    const result = await globalTransporter.sendMail(mailOptions);
    console.log('✅ NOTIFICATION SUPPORT ENVOYÉE:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Notification support envoyée avec succès' 
    };
    
  } catch (error) {
    console.error('❌ Erreur notification support:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur système' };
  }
}

// Fonction pour envoyer notification de demande complétée
export async function sendRequestCompletedNotification(requestData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const contenuEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Demande Complétée - Raccordement Électrique</title>
        </head>
        <body style="margin: 0; padding: 15px; font-family: Arial, sans-serif; background: #f8f9fa; color: #212529;">
          
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">
            
            <!-- Header Simple -->
            <div style="background: #198754; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                Demande ${requestData.referenceNumber || 'Complétée'}
              </h1>
              <p style="color: #d1e7dd; margin: 8px 0 0 0; font-size: 14px;">
                Formulaire 3/3 étapes - Prêt pour traitement
              </p>
            </div>
            
            <!-- Contenu Compact -->
            <div style="padding: 25px;">
              
              <!-- ÉTAPE 1 : Informations Client -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 20px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">
                    ÉTAPE 1/3 - INFORMATIONS CLIENT
                  </h3>
                </div>
                
                <div style="padding: 20px;">
                  <!-- Type de client -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE CLIENT</div>
                    <span style="color: #28a745; font-weight: 600; font-size: 14px; background: #d4edda; padding: 4px 8px; border-radius: 4px; text-transform: capitalize;">${requestData.clientType || 'Particulier'}</span>
                  </div>
                  
                  <!-- Nom et Prénom -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NOM COMPLET</div>
                    <div style="color: #212529; font-size: 16px; font-weight: 700;">${requestData.prenom || ''} ${requestData.nom || ''}</div>
                  </div>
                  
                  <!-- Téléphone - Prioritaire -->
                  <div style="margin-bottom: 15px; background: #d1ecf1; padding: 12px; border-radius: 4px; border-left: 3px solid #0dcaf0;">
                    <div style="color: #055160; font-size: 12px; font-weight: 700; margin-bottom: 4px;">📞 TÉLÉPHONE</div>
                    <a href="tel:${requestData.phone || requestData.telephone}" style="color: #212529; font-size: 18px; font-weight: 900; text-decoration: none; display: block; word-break: break-all;">${requestData.phone || requestData.telephone || 'Non fourni'}</a>
                  </div>
                  
                  <!-- Email -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">EMAIL</div>
                    <a href="mailto:${requestData.email}" style="color: #007bff; font-size: 14px; font-weight: 600; text-decoration: none; display: block; word-break: break-all;">${requestData.email || 'Non fourni'}</a>
                  </div>
                  
                  ${requestData.societe || requestData.raisonSociale ? `
                  <!-- Société -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">SOCIÉTÉ</div>
                    <div style="color: #fd7e14; font-weight: 600; font-size: 14px; background: #fff3cd; padding: 4px 8px; border-radius: 4px;">${requestData.societe || requestData.raisonSociale}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.siren ? `
                  <!-- SIREN -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NUMÉRO SIREN</div>
                    <div style="color: #6f42c1; font-weight: 600; font-size: 14px; font-family: monospace;">${requestData.siren}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.nomCollectivite ? `
                  <!-- Collectivité -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">COLLECTIVITÉ</div>
                    <div style="color: #6f42c1; font-weight: 600; font-size: 14px;">${requestData.nomCollectivite}</div>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- ÉTAPE 2 : Adresse et Détails Techniques -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 20px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">
                    ÉTAPE 2/3 - ADRESSE ET TECHNIQUE
                  </h3>
                </div>
                
                <div style="padding: 20px;">
                  <!-- Adresse complète -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ADRESSE DU PROJET</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${requestData.adresse || requestData.address || 'Non fourni'}</div>
                    ${requestData.complementAdresse ? `<div style="color: #6c757d; font-size: 14px;">${requestData.complementAdresse}</div>` : ''}
                    <div style="color: #6c757d; font-size: 14px;">${requestData.codePostal || requestData.postalCode || ''} ${requestData.ville || requestData.city || ''}</div>
                  </div>
                  
                  ${requestData.referenceCadastrale ? `
                  <!-- Référence cadastrale -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">RÉFÉRENCE CADASTRALE</div>
                    <div style="color: #212529; font-size: 14px; font-family: monospace;">${requestData.referenceCadastrale}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Type de raccordement -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE RACCORDEMENT</div>
                    <div style="color: #198754; font-weight: 600; font-size: 14px; background: #d1e7dd; padding: 4px 8px; border-radius: 4px;">${requestData.typeRaccordement || 'Non spécifié'}</div>
                  </div>
                  
                  ${requestData.typeProjet ? `
                  <!-- Type de projet -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE PROJET</div>
                    <div style="color: #0d6efd; font-weight: 600; font-size: 14px;">${requestData.typeProjet}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.typeBatiment ? `
                  <!-- Type de bâtiment -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE BÂTIMENT</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.typeBatiment}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Puissance demandée -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">PUISSANCE DEMANDÉE</div>
                    <div style="color: #dc3545; font-weight: 700; font-size: 16px;">${requestData.puissanceDemandee || requestData.puissance || requestData.powerRequired || 'Non spécifiée'} kVA</div>
                  </div>
                  
                  ${requestData.typePhase ? `
                  <!-- Type de phase -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE DE PHASE</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.typePhase}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.typeAlimentation && requestData.typeAlimentation !== 'inconnu' ? `
                  <!-- Type d'alimentation -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE D'ALIMENTATION</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.typeAlimentation === 'monophase' ? 'Monophasé' : requestData.typeAlimentation === 'triphase' ? 'Triphasé' : requestData.typeAlimentation}</div>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- ÉTAPE 3 : Informations Complémentaires -->
              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 20px;">
                <div style="background: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                  <h3 style="margin: 0; color: #495057; font-size: 14px; font-weight: 600;">
                    ÉTAPE 3/3 - INFORMATIONS COMPLÉMENTAIRES
                  </h3>
                </div>
                
                <div style="padding: 20px;">
                  ${requestData.terrainViabilise !== undefined ? `
                  <!-- Terrain viabilisé -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TERRAIN VIABILISÉ</div>
                    <div style="color: #198754; font-weight: 600; font-size: 14px;">${requestData.terrainViabilise ? 'Oui' : 'Non'}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.autreTypeRaccordement ? `
                  <!-- Autre type de raccordement -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">AUTRE TYPE DE RACCORDEMENT</div>
                    <div style="color: #fd7e14; font-weight: 600; font-size: 14px;">${requestData.autreTypeRaccordement}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.adresseFacturationDifferente && requestData.adresseFacturation ? `
                  <!-- Adresse de facturation -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ADRESSE DE FACTURATION</div>
                    <div style="color: #212529; font-size: 14px;">${requestData.adresseFacturation}</div>
                  </div>
                  ` : ''}
                  
                  <!-- Date de soumission -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">DATE DE SOUMISSION</div>
                    <div style="color: #212529; font-size: 14px;">${requestData.timestamp ? new Date(requestData.timestamp).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              </div>

              <!-- Note de Suivi Simple -->
              <div style="background: #d1e7dd; padding: 15px; border-radius: 4px; text-align: center;">
                <div style="color: #0f5132; font-size: 14px; font-weight: 600;">
                  Demande finalisée - Prête pour traitement
                </div>
                <div style="color: #6c757d; font-size: 12px; margin-top: 4px;">
                  ${new Date().toLocaleString('fr-FR', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'kevin@monelec.net',
      to: 'notifications@raccordement-connect.com',
      subject: `C DDE - ${requestData.prenom || ''} ${requestData.nom || ''} - ${requestData.referenceNumber || 'N/A'}`,
      html: contenuEmail
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification demande complétée envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification demande complétée:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

/**
 * Détermine la priorité d'un message de contact
 * @param contactData - Données du formulaire de contact
 * @returns string - Niveau de priorité (haute, normale, basse)
 */
export function determineContactPriority(contactData: any): string {
  // Mots-clés urgents dans le sujet ou message
  const urgentKeywords = ['urgent', 'problème', 'panne', 'erreur', 'échec', 'bloqué'];
  const subject = (contactData.subject || '').toLowerCase();
  const message = (contactData.message || '').toLowerCase();
  
  const hasUrgentKeyword = urgentKeywords.some(keyword => 
    subject.includes(keyword) || message.includes(keyword)
  );
  
  if (hasUrgentKeyword) {
    return 'haute';
  }
  
  // Messages courts peuvent indiquer une urgence
  if (message.length < 50) {
    return 'normale';
  }
  
  return 'normale';
}

/**
 * Envoie un email de contact vers l'équipe support
 * @param contactData - Données du formulaire de contact
 * @returns Promise<{success: boolean, messageId?: string, error?: string}>
 */
export async function sendContactEmail(contactData: any) {
  try {
    if (!globalTransporter) {
      console.error('❌ Transporteur SMTP non configuré pour contact');
      return { success: false, error: 'Service email non disponible' };
    }

    const priority = determineContactPriority(contactData);
    const priorityEmoji = priority === 'haute' ? '🚨' : '📧';
    const priorityColor = priority === 'haute' ? '#dc2626' : '#0072CE';

    const contenuEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, ${priorityColor}, #0072CE); padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${priorityEmoji} NOUVEAU MESSAGE DE CONTACT</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0;">Priorité : ${priority.toUpperCase()}</p>
        </div>
        
        <div style="padding: 25px;">
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations du Contact</h3>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <strong style="color: #475569;">Nom :</strong>
                <span style="color: #1e293b;">${contactData.name || 'Non renseigné'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <strong style="color: #475569;">Email :</strong>
                <span style="color: #1e293b;">${contactData.email || 'Non renseigné'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <strong style="color: #475569;">Téléphone :</strong>
                <span style="color: #1e293b;">${contactData.phone || 'Non renseigné'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <strong style="color: #475569;">Sujet :</strong>
                <span style="color: #1e293b;">${contactData.subject || 'Aucun sujet'}</span>
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">💬 Message</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; line-height: 1.6; color: #1f2937;">${contactData.message || 'Aucun message'}</p>
            </div>
          </div>

          <div style="background: #eff6ff; border-radius: 8px; padding: 15px; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">⏰ Reçu le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'kevin@monelec.net',
      to: 'notifications@raccordement-connect.com',
      subject: `${priorityEmoji} Nouveau message de contact${priority === 'haute' ? ' - URGENT' : ''} - ${contactData.subject || 'Sans sujet'}`,
      html: contenuEmail
    };

    const result = await globalTransporter.sendMail(mailOptions);
    console.log('✅ Message de contact envoyé:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      priority: priority
    };
    
  } catch (error) {
    console.error('❌ Erreur envoi message de contact:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur système' 
    };
  }
}

/**
 * Envoie une notification à l'équipe interne quand un nouveau contact arrive
 * @param contactData - Données du contact
 * @returns Promise<{success: boolean, messageId?: string}>
 */
export async function sendContactNotificationToStaff(contactData: any) {
  try {
    const priority = determineContactPriority(contactData);
    
    // Utilise la même fonction d'envoi mais avec un titre différent pour l'équipe interne
    const result = await sendContactEmail({
      ...contactData,
      _isStaffNotification: true
    });
    
    console.log(`📧 Notification équipe envoyée (priorité: ${priority}):`, result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur notification équipe contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur système' };
  }
}

// Initialiser le service
setupSmtpService();
