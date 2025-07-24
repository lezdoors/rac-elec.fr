/**
 * Renvoi de l'email 2 avec ID: c29697e0-b8a8-2700-a77e-91f39efc593e@raccordement-elec.fr
 */

const nodemailer = require('nodemailer');

async function renvoyerEmail2() {
  console.log('📧 RENVOI EMAIL 2 ID: c29697e0-b8a8-2700-a77e-91f39efc593e@raccordement-elec.fr');
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

    console.log('📧 Renvoi de l\'email 2 - Demande complète...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'bonjour@raccordement-elec.fr',
      subject: '🎯 Demande Complétée - REF-7574-410611 (Email 2)',
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
            <p><strong>Type de raccordement :</strong> Raccordement temporaire</p>
            <p><strong>Type de projet :</strong> Immeuble d'appartements</p>
            <p><strong>Puissance requise :</strong> 24 kVA</p>
            <p><strong>Type d'alimentation :</strong> Triphasé</p>
            <p><strong>Statut projet :</strong> En cours de planification</p>
          </div>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Référence</h3>
            <p><strong>Numéro de référence :</strong> REF-7574-410611</p>
            <p><strong>Email original :</strong> c29697e0-b8a8-2700-a77e-91f39efc593e@raccordement-elec.fr</p>
            <p><strong>Renvoyé le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-weight: bold; color: #166534;">⚡ CONTACTER LE PROSPECT RAPIDEMENT</p>
          </div>
        </div>
      `
    });

    console.log('✅ EMAIL 2 RENVOYÉ AVEC SUCCÈS !');
    console.log('📨 Nouveau Message ID:', result.messageId);
    console.log('🎯 Vérifiez bonjour@raccordement-elec.fr');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

renvoyerEmail2();
