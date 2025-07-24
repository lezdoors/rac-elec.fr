/**
 * Renvoi de l'email avec ID: cf28d856-167e-0977-0193-83b0eed1de4c@raccordement-elec.fr
 */

const nodemailer = require('nodemailer');

async function renvoyerEmail() {
  console.log('📧 RENVOI EMAIL ID: cf28d856-167e-0977-0193-83b0eed1de4c@raccordement-elec.fr');
  console.log('📤 Vers: bonjour@raccordement-elec.fr');
  console.log('');

  try {
    const transporter = nodemailer.createTransport({
      host: 'premium234.web-hosting.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('🔄 Connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion réussie !');

    console.log('📧 Envoi de l\'email de demande complète...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'bonjour@raccordement-elec.fr',
      subject: '🎯 Demande Complétée - REF-7574-410611',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">🎯 DEMANDE COMPLÉTÉE</h1>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>👤 Informations Client</h3>
            <p><strong>Type de client :</strong> particulier</p>
            <p><strong>Prénom :</strong> azaz</p>
            <p><strong>Nom :</strong> HA</p>
            <p><strong>Email :</strong> <a href="mailto:contact@raccordement.net">contact@raccordement.net</a></p>
            <p><strong>Téléphone :</strong> <a href="tel:0644657005">0644657005</a></p>
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🏠 Adresse du Projet</h3>
            <p><strong>Adresse :</strong> 66 azazazazazxxxxx</p>
            <p><strong>Code postal :</strong> 34000</p>
            <p><strong>Ville :</strong> Montpellier</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>⚡ Détails Techniques</h3>
            <p><strong>Type de raccordement :</strong> temporary_connection</p>
            <p><strong>Type de projet :</strong> apartment_building</p>
            <p><strong>Puissance requise :</strong> 24 kVA</p>
            <p><strong>Type d'alimentation :</strong> triphase</p>
            <p><strong>Statut projet :</strong> planning</p>
          </div>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Référence</h3>
            <p><strong>Numéro de référence :</strong> REF-7574-410611</p>
            <p><strong>Date de création :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Email renvoyé :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `
    });

    console.log('✅ EMAIL RENVOYÉ AVEC SUCCÈS !');
    console.log('📨 Nouveau Message ID:', result.messageId);
    console.log('🎯 Vérifiez bonjour@raccordement-elec.fr');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

renvoyerEmail();
