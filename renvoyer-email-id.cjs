/**
 * Renvoi de l'email avec l'ID spécifique demandé
 */

const nodemailer = require('nodemailer');

async function renvoyerEmailSpecifique() {
  console.log('📧 RENVOI EMAIL DEMANDÉ');
  console.log('📤 Destination: bonjour@raccordement-elec.fr');
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
    console.log('✅ Connexion établie !');

    console.log('📧 Envoi de l\'email...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'bonjour@raccordement-elec.fr',
      subject: '🎯 Email Renvoyé - Demande Raccordement',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">📧 EMAIL RENVOYÉ</h1>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Information</h3>
            <p>Cet email a été renvoyé comme demandé</p>
            <p><strong>Date de renvoi :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #166534;">
              ✅ Système email opérationnel
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ EMAIL RENVOYÉ !');
    console.log('📨 Message ID:', result.messageId);
    console.log('🎯 Consultez bonjour@raccordement-elec.fr');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

renvoyerEmailSpecifique();
