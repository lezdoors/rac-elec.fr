import nodemailer from 'nodemailer';

// Configuration SMTP unique et fonctionnelle
let globalTransporter: any = null;

// Configuration SSL premium234.web-hosting.com - LA SEULE CONFIGURATION
export function setupSmtpService() {
  try {
    const smtpConfig = {
      host: 'premium234.web-hosting.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    globalTransporter = nodemailer.createTransport(smtpConfig);
    console.log('✅ Service SMTP SSL configuré - CONFIGURATION UNIQUE');
  } catch (error) {
    console.error('❌ Erreur configuration SMTP:', error);
  }
}

// Email de notification nouveau lead
export async function sendLeadNotification(leadData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER!,
      to: 'bonjour@portail-electricite.com',
      subject: `🎯 NOUVEAU LEAD - ${leadData.prenom || ''} ${leadData.nom || ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">🎯 NOUVEAU LEAD GÉNÉRÉ</h1>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
            <h3>👤 Informations Client</h3>
            <p><strong>Nom :</strong> ${leadData.prenom || ''} ${leadData.nom || ''}</p>
            <p><strong>Email :</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
            <p><strong>Téléphone :</strong> <a href="tel:${leadData.telephone}">${leadData.telephone}</a></p>
            <p><strong>Type :</strong> ${leadData.clientType}</p>
          </div>
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-weight: bold; color: #166534;">⚡ CONTACTER DANS LES 2 HEURES</p>
          </div>
        </div>
      `
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Lead envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Lead:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Email de demande complétée avec TOUS les détails français
export async function sendRequestCompletedNotification(requestData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER!,
      to: 'bonjour@portail-electricite.com',
      subject: `🎯 Demande Complétée - ${requestData.referenceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">🎯 DEMANDE COMPLÉTÉE</h1>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>👤 Informations Client</h3>
            <p><strong>Type de client :</strong> ${requestData.clientType}</p>
            <p><strong>Prénom :</strong> ${requestData.prenom || ''}</p>
            <p><strong>Nom :</strong> ${requestData.nom || ''}</p>
            <p><strong>Email :</strong> <a href="mailto:${requestData.email}">${requestData.email}</a></p>
            <p><strong>Téléphone :</strong> <a href="tel:${requestData.phone}">${requestData.phone}</a></p>
            ${requestData.raisonSociale ? `<p><strong>Raison sociale :</strong> ${requestData.raisonSociale}</p>` : ''}
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🏠 Adresse du Projet</h3>
            <p><strong>Adresse :</strong> ${requestData.address}</p>
            ${requestData.complementAdresseProjet ? `<p><strong>Complément d'adresse :</strong> ${requestData.complementAdresseProjet}</p>` : ''}
            <p><strong>Code postal :</strong> ${requestData.postalCode}</p>
            <p><strong>Ville :</strong> ${requestData.city}</p>
            ${requestData.terrainViabilise !== undefined ? `<p><strong>Terrain viabilisé :</strong> ${requestData.terrainViabilise ? 'Oui' : 'Non'}</p>` : ''}
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📮 Adresse de Facturation</h3>
            ${requestData.adresseFacturationDifferente || requestData.facturationDifferente ? 
              `<p><strong>Adresse :</strong> ${requestData.adresseFacturation || 'Non spécifiée'}</p>` :
              `<p><strong>Adresse :</strong> Similaire à l'adresse du projet</p>`
            }
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>⚡ Détails Techniques</h3>
            <p><strong>Type de raccordement :</strong> ${requestData.typeRaccordement || requestData.requestType}</p>
            <p><strong>Type de projet :</strong> ${requestData.typeProjet || requestData.buildingType}</p>
            <p><strong>Type d'alimentation :</strong> ${
              requestData.typeAlimentation === 'monophase' ? 'Monophasé (Habitations standard 3-12 kVA)' :
              requestData.typeAlimentation === 'triphase' ? 'Triphasé (Usage intensif)' :
              requestData.typeAlimentation || 'Non spécifié'
            }</p>
            <p><strong>Puissance requise :</strong> ${
              requestData.puissance === 'inconnu' ? 'Je ne connais pas ma puissance' :
              requestData.puissance === '36-tarif-jaune' ? '36 kVA - Tarif jaune' :
              requestData.powerRequired || requestData.puissance
            }</p>
            <p><strong>Statut projet :</strong> ${requestData.projectStatus}</p>
            ${requestData.autreTypeRaccordement ? `<p><strong>Autre type de raccordement :</strong> ${requestData.autreTypeRaccordement}</p>` : ''}
          </div>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Référence</h3>
            <p><strong>Numéro de référence :</strong> ${requestData.referenceNumber}</p>
            <p><strong>Date de création :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `
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

// Email de notification paiement réussi
export async function sendPaiementReussiNotification(paiementData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER!,
      to: 'bonjour@portail-electricite.com',
      subject: `💰 PAIEMENT CONFIRMÉ - ${paiementData.referenceNumber || 'N/A'} - ${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">💰 PAIEMENT CONFIRMÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Nouveau paiement reçu avec succès</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 20px;">💳 Détails du Paiement</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #15803d; font-weight: bold;">${paiementData.referenceNumber || 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant:</strong> <span style="color: #15803d; font-weight: bold;">${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Statut:</strong> <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">PAYÉ</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Payment ID:</strong> ${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</p>
            </div>

            <div style="background: #f8fafc; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Informations Client</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${paiementData.clientName || paiementData.name || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #2563eb;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #2563eb; font-weight: bold; font-size: 18px;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a></p>
            </div>

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
        </div>
      `
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Paiement Réussi envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Paiement Réussi:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Email de notification paiement échoué
export async function sendPaiementEchoueNotification(paiementData: any) {
  try {
    if (!globalTransporter) {
      setupSmtpService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER!,
      to: 'bonjour@portail-electricite.com',
      subject: `🚨 URGENT - PAIEMENT ÉCHOUÉ - ${paiementData.referenceNumber || 'N/A'} - ${paiementData.clientName || 'Client'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🚨 PAIEMENT ÉCHOUÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Tentative de paiement non aboutie</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">💳 Détails de l'Échec</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #dc2626; font-weight: bold;">${paiementData.referenceNumber || 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant tenté:</strong> <span style="color: #dc2626; font-weight: bold;">${paiementData.amount ? (parseFloat(paiementData.amount) / 100).toFixed(2) + ' €' : 'N/A'}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Statut:</strong> <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">ÉCHEC</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Raison:</strong> ${paiementData.errorMessage || paiementData.error || 'Erreur de paiement'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Payment ID:</strong> ${paiementData.paymentIntentId || paiementData.paymentId || 'N/A'}</p>
            </div>

            <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">👤 Client à Recontacter</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${paiementData.clientName || paiementData.name || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${paiementData.clientEmail || paiementData.email || ''}" style="color: #ea580c;">${paiementData.clientEmail || paiementData.email || 'N/A'}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${paiementData.clientPhone || paiementData.phone || ''}" style="color: #ea580c; font-weight: bold; font-size: 18px;">${paiementData.clientPhone || paiementData.phone || 'N/A'}</a></p>
            </div>

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
        </div>
      `
    };

    if (globalTransporter) {
      const result = await globalTransporter.sendMail(mailOptions);
      console.log('✅ Notification Paiement Échoué envoyée:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: 'Transporteur non configuré' };
    }
  } catch (error) {
    console.error('❌ Erreur envoi notification Paiement Échoué:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}