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
      host: 's4015.fra1.stableserver.net',
      port: 465,
      secure: true, // SSL
      auth: {
        user: 'notification@portail-electricite.com',
        pass: 'xecmug-wakDed-xunje5'
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    globalTransporter = nodemailer.createTransport(smtpConfig);
    console.log('✅ SMTP STABLESERVER - notification@portail-electricite.com → contact@portail-electricite.com');
  } catch (error) {
    console.error('❌ Erreur configuration SMTP:', error);
  }
}

// 💰 FONCTIONS DE NOTIFICATION PAIEMENT EN TEMPS RÉEL

// Fonction pour envoyer notification de paiement réussi
export async function sendPaiementReussiNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">💰 PAIEMENT CONFIRMÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Nouveau paiement reçu avec succès</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Informations du paiement -->
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 20px;">💳 Détails du Paiement</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #15803d; font-weight: bold;">${paiementData.referenceNumber || 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant:</strong> <span style="color: #15803d; font-weight: bold;">${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Statut:</strong> <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">PAYÉ</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Payment ID:</strong> ${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</p>
            </div>

            <!-- Informations client -->
            <div style="background: #f8fafc; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations Client</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${paiementData.clientName || paiementData.name || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #2563eb;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #2563eb; font-weight: bold; font-size: 18px;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a></p>
            </div>

            <!-- Action requise -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
              <h3 style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 18px;">🎯 Action Immédiate</h3>
              <p style="margin: 0; color: #1e40af; font-weight: 600;">✅ Traitement du dossier à démarrer</p>
              <p style="margin: 5px 0 0 0; color: #1e40af;">📞 Contacter le client pour planifier l'intervention</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ⏰ ${new Date().toLocaleString('fr-FR')} | 🔄 Notification automatique
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'contact@portail-electricite.com',
      subject: `💰 PAIEMENT CONFIRMÉ - ${paiementData.referenceNumber || 'N/A'} - ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}`,
      html: htmlContent,
      text: `💰 PAIEMENT CONFIRMÉ
Référence: ${paiementData.referenceNumber || 'N/A'}
Montant: ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}
Client: ${paiementData.clientName || paiementData.name || 'N/A'}
Email: ${paiementData.clientEmail || paiementData.email || 'N/A'}
Téléphone: ${paiementData.clientPhone || paiementData.phone || 'N/A'}

🎯 Action requise: Traiter le dossier et contacter le client`
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

// Fonction pour envoyer notification de paiement échoué
export async function sendPaiementEchoueNotification(paiementData: any) {
  try {
    // S'assurer que le transporteur est initialisé
    if (!globalTransporter) {
      setupSmtpService();
    }

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🚨 PAIEMENT ÉCHOUÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Tentative de paiement non aboutie</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Informations du paiement échoué -->
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">💳 Détails de l'Échec</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #dc2626; font-weight: bold;">${paiementData.referenceNumber || 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant tenté:</strong> <span style="color: #dc2626; font-weight: bold;">${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Statut:</strong> <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">ÉCHEC</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Raison:</strong> ${paiementData.errorMessage || paiementData.error || 'Erreur de paiement'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Payment ID:</strong> ${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</p>
            </div>

            <!-- Informations client à recontacter -->
            <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">👤 Client à Recontacter</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${paiementData.clientName || paiementData.name || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #ea580c;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #ea580c; font-weight: bold; font-size: 18px;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a></p>
            </div>

            <!-- Action urgente requise -->
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">🚨 Action URGENTE</h3>
              <p style="margin: 0; color: #dc2626; font-weight: 600;">📞 Contacter le client dans les 2 heures</p>
              <p style="margin: 5px 0 0 0; color: #dc2626;">💳 L'accompagner pour finaliser le paiement</p>
              <p style="margin: 5px 0 0 0; color: #dc2626;">🔄 Proposer un nouveau lien de paiement si nécessaire</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ⏰ ${new Date().toLocaleString('fr-FR')} | 🔔 Notification automatique
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: 'notification@portail-electricite.com',
      to: 'contact@portail-electricite.com',
      subject: `🚨 URGENT - PAIEMENT ÉCHOUÉ - ${paiementData.referenceNumber || 'N/A'} - ${paiementData.clientName || 'Client'}`,
      html: htmlContent,
      text: `🚨 URGENT - PAIEMENT ÉCHOUÉ
Référence: ${paiementData.referenceNumber || 'N/A'}
Montant: ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}
Client: ${paiementData.clientName || paiementData.name || 'N/A'}
Email: ${paiementData.clientEmail || paiementData.email || 'N/A'}
Téléphone: ${paiementData.clientPhone || paiementData.phone || 'N/A'}
Raison: ${paiementData.errorMessage || paiementData.error || 'Erreur de paiement'}

🚨 ACTION URGENTE: Contacter le client dans les 2 heures pour l'accompagner dans le paiement`
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
      from: 'notification@portail-electricite.com',
      to: 'contact@portail-electricite.com',
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
    
    const contenuEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau Lead - Raccordement Électrique</title>
        </head>
        <body style="margin: 0; padding: 15px; font-family: Arial, sans-serif; background: #f8f9fa; color: #212529;">
          
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #dee2e6;">
            
            <!-- Header Simple -->
            <div style="background: #495057; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                Lead ${leadData.referenceNumber || `LEAD-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`}
              </h1>
              <p style="color: #ced4da; margin: 8px 0 0 0; font-size: 14px;">
                Étape 1/3 - Informations recueillies
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

              <!-- Note de Suivi Simple -->
              <div style="background: #e9ecef; padding: 15px; border-radius: 4px; text-align: center; margin-top: 20px;">
                <div style="color: #495057; font-size: 14px; font-weight: 600;">
                  Lead en cours - Étape 1/3 complétée
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
      </div>
    `;

    // ENVOI DIRECT - Notifications internes en français (pas d'approbation)
    if (!globalTransporter) {
      throw new Error('Transporteur SMTP non configuré');
    }

    const mailOptions = {
      from: `"Notifications Raccordement" <notification@portail-electricite.com>`,
      to: 'contact@portail-electricite.com',
      subject: `🎯 NOUVEAU PROSPECT - ${leadData.prenom || ''} ${leadData.nom || ''} - Référence ${leadData.referenceNumber || 'N/A'}`,
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
      from: `"Support Raccordement" <notification@portail-electricite.com>`,
      to: 'contact@portail-electricite.com',
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
                  
                  ${requestData.typeAlimentation ? `
                  <!-- Type d'alimentation -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">TYPE D'ALIMENTATION</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.typeAlimentation}</div>
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
                  ${requestData.etatProjet ? `
                  <!-- État du projet -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ÉTAT DU PROJET</div>
                    <div style="color: #198754; font-weight: 600; font-size: 14px;">${requestData.etatProjet}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.delaiRaccordement ? `
                  <!-- Délai de raccordement -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">DÉLAI SOUHAITÉ</div>
                    <div style="color: #fd7e14; font-weight: 600; font-size: 14px;">${requestData.delaiRaccordement}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.numeroPermis ? `
                  <!-- Numéro de permis -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">NUMÉRO PERMIS DE CONSTRUIRE</div>
                    <div style="color: #212529; font-size: 14px; font-family: monospace;">${requestData.numeroPermis}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.datePermis ? `
                  <!-- Date permis -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">DATE PERMIS</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.datePermis}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.nomArchitecte ? `
                  <!-- Architecte -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ARCHITECTE</div>
                    <div style="color: #212529; font-size: 14px; font-weight: 600;">${requestData.nomArchitecte}</div>
                    ${requestData.telephoneArchitecte ? `<div style="color: #6c757d; font-size: 14px;">📞 ${requestData.telephoneArchitecte}</div>` : ''}
                    ${requestData.emailArchitecte ? `<div style="color: #6c757d; font-size: 14px;">📧 ${requestData.emailArchitecte}</div>` : ''}
                  </div>
                  ` : ''}
                  
                  ${requestData.adresseFacturationDifferente && requestData.adresseFacturation ? `
                  <!-- Adresse de facturation -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">ADRESSE DE FACTURATION</div>
                    <div style="color: #212529; font-size: 14px;">${requestData.adresseFacturation}</div>
                    <div style="color: #6c757d; font-size: 14px;">${requestData.codePostalFacturation || ''} ${requestData.villeFacturation || ''}</div>
                  </div>
                  ` : ''}
                  
                  ${requestData.commentaires ? `
                  <!-- Commentaires -->
                  <div style="margin-bottom: 15px;">
                    <div style="color: #6c757d; font-size: 12px; font-weight: 600; margin-bottom: 4px;">COMMENTAIRES</div>
                    <div style="color: #212529; font-size: 14px; background: #fff3cd; padding: 12px; border-radius: 4px; border-left: 3px solid #ffc107;">${requestData.commentaires}</div>
                  </div>
                  ` : ''}
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
      from: 'notification@portail-electricite.com',
      to: 'contact@portail-electricite.com',
      subject: `✅ DEMANDE COMPLÉTÉE - ${requestData.prenom || ''} ${requestData.nom || ''} - ${requestData.referenceNumber}`,
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
      from: 'notification@portail-electricite.com',
      to: 'contact@portail-electricite.com',
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
