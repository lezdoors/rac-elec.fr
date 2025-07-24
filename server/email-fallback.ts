/**
 * Module de contournement pour les emails dans l'environnement Replit
 * 
 * Ce module implémente une solution de contournement pour les problèmes d'envoi d'emails
 * dans l'environnement Replit qui bloque les connexions SMTP sur les ports 465 et 587.
 * 
 * Il enregistre les emails qui ne peuvent pas être envoyés dans la base de données
 * pour qu'ils puissent être consultés par les administrateurs dans l'interface.
 */

import db from './db';
import { emailQueue } from '../shared/schema';
import type { NewSubmissionEmailData, PaymentConfirmationEmailData, AppointmentReminderEmailData, ContactEmailData } from './email-service';

// Fonction pour enregistrer un email dans la file d'attente
export async function queueEmail(emailData: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  type: 'new_submission' | 'payment_confirmation' | 'appointment_reminder' | 'contact' | 'other';
  referenceData?: any;
}) {
  try {
    const recipients = Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to;
    
    console.log(`📧 Enregistrement d'un email dans la file d'attente: ${emailData.subject} pour ${recipients}`);
    
    // Enregistrer l'email dans la base de données
    await db.insert(emailQueue).values({
      recipients,
      subject: emailData.subject,
      htmlContent: emailData.html,
      textContent: emailData.text || '',
      fromAddress: emailData.from || 'notification@raccordement-elec.fr',
      replyToAddress: emailData.replyTo || '',
      emailType: emailData.type,
      referenceData: emailData.referenceData ? JSON.stringify(emailData.referenceData) : null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Email enregistré avec succès dans la file d'attente`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'email dans la file d\'attente:', error);
    return false;
  }
}

// Fonction pour enregistrer une notification de nouvelle demande
export async function queueNewSubmissionNotification(data: NewSubmissionEmailData): Promise<boolean> {
  try {
    // Préparer les destinataires
    const recipients = ['marina.alves@raccordement-elec.fr', 'contact@raccordement-elec.fr'];
    
    // Créer le sujet
    const subject = `Nouvelle demande de raccordement: ${data.referenceNumber}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Nouvelle demande de raccordement</h2>
        <p>Une nouvelle demande de raccordement a été soumise avec les informations suivantes :</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Référence :</strong> ${data.referenceNumber}</p>
          <p><strong>Client :</strong> ${data.clientName}</p>
          <p><strong>Email :</strong> ${data.clientEmail}</p>
          <p><strong>Téléphone :</strong> ${data.clientPhone}</p>
          <p><strong>Type de client :</strong> ${data.clientType}</p>
          <p><strong>Date de soumission :</strong> ${new Date(data.submissionDate).toLocaleString('fr-FR')}</p>
          <p><strong>Type de service :</strong> ${data.serviceType}</p>
          ${data.address ? `<p><strong>Adresse :</strong> ${data.address}</p>` : ''}
          ${data.postalCode ? `<p><strong>Code postal :</strong> ${data.postalCode}</p>` : ''}
          ${data.city ? `<p><strong>Ville :</strong> ${data.city}</p>` : ''}
        </div>
        
        <p>Connectez-vous à l'interface d'administration pour voir les détails complets.</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Nouvelle demande de raccordement
      
      Une nouvelle demande de raccordement a été soumise avec les informations suivantes :
      
      Référence : ${data.referenceNumber}
      Client : ${data.clientName}
      Email : ${data.clientEmail}
      Téléphone : ${data.clientPhone}
      Type de client : ${data.clientType}
      Date de soumission : ${new Date(data.submissionDate).toLocaleString('fr-FR')}
      Type de service : ${data.serviceType}
      ${data.address ? `Adresse : ${data.address}` : ''}
      ${data.postalCode ? `Code postal : ${data.postalCode}` : ''}
      ${data.city ? `Ville : ${data.city}` : ''}
      
      Connectez-vous à l'interface d'administration pour voir les détails complets.
    `;
    
    // Enregistrer l'email dans la file d'attente
    return await queueEmail({
      to: recipients,
      subject,
      html,
      text,
      from: 'notification@raccordement-elec.fr',
      replyTo: data.clientEmail,
      type: 'new_submission',
      referenceData: data
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise en file d\'attente de la notification de nouvelle demande:', error);
    return false;
  }
}

// Fonction pour enregistrer une confirmation de paiement
export async function queuePaymentConfirmation(data: PaymentConfirmationEmailData): Promise<boolean> {
  try {
    // Créer le sujet
    const subject = `Confirmation de paiement - ${data.referenceNumber}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Confirmation de paiement</h2>
        <p>Bonjour ${data.clientName},</p>
        <p>Nous vous confirmons que votre paiement a bien été reçu et traité.</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Référence de votre demande :</strong> ${data.referenceNumber}</p>
          <p><strong>Date du paiement :</strong> ${new Date(data.paymentDate).toLocaleString('fr-FR')}</p>
          <p><strong>Montant :</strong> ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €</p>
          <p><strong>Identifiant du paiement :</strong> ${data.paymentId}</p>
          ${data.cardBrand && data.cardLast4 ? `<p><strong>Carte :</strong> ${data.cardBrand} se terminant par ${data.cardLast4}</p>` : ''}
        </div>
        
        <p>Notre équipe a été informée et va traiter votre demande dans les plus brefs délais.</p>
        <p>Un membre de notre équipe vous contactera prochainement pour organiser la suite des démarches.</p>
        
        <p>Cordialement,</p>
        <p>L'équipe Raccordement.net</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Confirmation de paiement
      
      Bonjour ${data.clientName},
      
      Nous vous confirmons que votre paiement a bien été reçu et traité.
      
      Référence de votre demande : ${data.referenceNumber}
      Date du paiement : ${new Date(data.paymentDate).toLocaleString('fr-FR')}
      Montant : ${typeof data.paymentAmount === 'number' ? data.paymentAmount.toFixed(2) : data.paymentAmount} €
      Identifiant du paiement : ${data.paymentId}
      ${data.cardBrand && data.cardLast4 ? `Carte : ${data.cardBrand} se terminant par ${data.cardLast4}` : ''}
      
      Notre équipe a été informée et va traiter votre demande dans les plus brefs délais.
      Un membre de notre équipe vous contactera prochainement pour organiser la suite des démarches.
      
      Cordialement,
      L'équipe Raccordement.net
    `;
    
    // Enregistrer l'email dans la file d'attente
    return await queueEmail({
      to: data.clientEmail,
      subject,
      html,
      text,
      type: 'payment_confirmation',
      referenceData: data
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise en file d\'attente de la confirmation de paiement:', error);
    return false;
  }
}

// Fonction pour enregistrer un email de contact
export async function queueContactNotification(data: ContactEmailData): Promise<boolean> {
  try {
    // Déterminer la priorité
    const priorityLabels = {
      high: '⚠️ HAUTE',
      medium: '⚡ MOYENNE',
      normal: 'NORMALE'
    };
    
    // Déterminer la priorité en fonction du contenu du message
    let priority = 'normal';
    if (data.message.toLowerCase().includes('urgent') || 
        data.message.toLowerCase().includes('urgence') ||
        data.message.toLowerCase().includes('immédiat')) {
      priority = 'high';
    } else if (data.message.toLowerCase().includes('rapide') ||
               data.message.toLowerCase().includes('rapidement') ||
               data.message.toLowerCase().includes('besoin')) {
      priority = 'medium';
    }
    
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels];
    
    // Créer le sujet
    const subject = `${priorityLabel} - Nouveau message de contact: ${data.name}`;
    
    // Créer le contenu HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0047AB;">Nouveau message de contact (Priorité: ${priorityLabel})</h2>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Nom :</strong> ${data.name}</p>
          <p><strong>Email :</strong> ${data.email}</p>
          ${data.subject ? `<p><strong>Sujet :</strong> ${data.subject}</p>` : ''}
          <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            <p><strong>Message :</strong></p>
            <p style="white-space: pre-line;">${data.message}</p>
          </div>
        </div>
        
        <p>Vous pouvez répondre directement à cet email pour contacter le client.</p>
      </div>
    `;
    
    // Créer le contenu texte
    const text = `
      Nouveau message de contact (Priorité: ${priorityLabel})
      
      Nom : ${data.name}
      Email : ${data.email}
      ${data.subject ? `Sujet : ${data.subject}` : ''}
      
      Message :
      ${data.message}
      
      Vous pouvez répondre directement à cet email pour contacter le client.
    `;
    
    // Enregistrer l'email dans la file d'attente pour l'équipe
    const result = await queueEmail({
      to: ['marina.alves@raccordement-elec.fr', 'contact@raccordement-elec.fr'],
      subject,
      html,
      text,
      replyTo: data.email,
      type: 'contact',
      referenceData: { ...data, priority }
    });
    
    // Confirmer la réception au client
    const confirmationResult = await queueEmail({
      to: data.email,
      subject: 'Votre message a bien été reçu - Raccordement.net',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0047AB;">Confirmation de réception</h2>
          <p>Bonjour ${data.name},</p>
          <p>Nous vous confirmons avoir bien reçu votre message.</p>
          <p>Notre équipe l'examinera dans les plus brefs délais et reviendra vers vous rapidement.</p>
          <p>Cordialement,</p>
          <p>L'équipe Raccordement.net</p>
        </div>
      `,
      text: `
        Confirmation de réception
        
        Bonjour ${data.name},
        
        Nous vous confirmons avoir bien reçu votre message.
        Notre équipe l'examinera dans les plus brefs délais et reviendra vers vous rapidement.
        
        Cordialement,
        L'équipe Raccordement.net
      `,
      type: 'contact'
    });
    
    return result && confirmationResult;
  } catch (error) {
    console.error('❌ Erreur lors de la mise en file d\'attente de la notification de contact:', error);
    return false;
  }
}