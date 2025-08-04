// Script de test des notifications email avec nouvelle configuration SMTP
const nodemailer = require('nodemailer');

// Configuration SMTP stableserver.net
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

async function testEmailNotification() {
  try {
    console.log('🔄 Initialisation du transporteur SMTP...');
    const transporter = nodemailer.createTransport(smtpConfig);

    // Test de connexion
    console.log('🔍 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!');

    // 1. Test notification de paiement
    console.log('\n💰 Envoi du test de notification de paiement...');
    const paiementTestData = {
      referenceNumber: 'RAC-TEST-' + Date.now(),
      amount: 15000, // 150.00 €
      paymentIntentId: 'pi_test_' + Date.now(),
      clientName: 'Test Client',
      clientEmail: 'test@example.com',
      clientPhone: '0123456789'
    };

    const htmlPaiement = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">💰 TEST PAIEMENT CONFIRMÉ</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Test de notification avec nouvelle configuration SMTP</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 20px;">💳 Détails du Test</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> <span style="color: #15803d; font-weight: bold;">${paiementTestData.referenceNumber}</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Montant:</strong> <span style="color: #15803d; font-weight: bold;">${(paiementTestData.amount / 100).toFixed(2)} €</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Serveur:</strong> <span style="color: #15803d; font-weight: bold;">s4015.fra1.stableserver.net</span></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Status:</strong> <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">TEST RÉUSSI</span></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ⏰ ${new Date().toLocaleString('fr-FR')} | 🔄 Test automatique nouvelle configuration
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: `💰 TEST PAIEMENT - ${paiementTestData.referenceNumber} - ${(paiementTestData.amount / 100).toFixed(2)} €`,
      html: htmlPaiement
    });

    console.log('✅ Test notification paiement envoyé avec succès!');

    // 2. Test notification de nouveau lead
    console.log('\n📧 Envoi du test de notification de lead...');
    const leadTestData = {
      referenceNumber: 'LEAD-TEST-' + Date.now(),
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '0123456789',
      type: 'Raccordement Définitif',
      ville: 'Paris'
    };

    const htmlLead = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📧 TEST NOUVEAU LEAD</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Test de formulaire avec nouvelle configuration</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
              <h3 style="color: #1d4ed8; margin: 0 0 15px 0; font-size: 20px;">👤 Informations du Lead</h3>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Référence:</strong> ${leadTestData.referenceNumber}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Nom:</strong> ${leadTestData.name}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${leadTestData.email}">${leadTestData.email}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Téléphone:</strong> <a href="tel:${leadTestData.phone}">${leadTestData.phone}</a></p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Type:</strong> ${leadTestData.type}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Ville:</strong> ${leadTestData.ville}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ⏰ ${new Date().toLocaleString('fr-FR')} | 🔄 Test automatique stableserver.net
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'notification@portail-electricite.com',
      to: 'bonjour@portail-electricite.com',
      subject: `📧 TEST LEAD - ${leadTestData.referenceNumber} - ${leadTestData.name}`,
      html: htmlLead
    });

    console.log('✅ Test notification lead envoyé avec succès!');

    console.log('\n🎉 TOUS LES TESTS RÉUSSIS!');
    console.log('\n📊 RAPPORT DE CONFIGURATION:');
    console.log('==============================');
    console.log(`✅ Serveur SMTP: ${smtpConfig.host}:${smtpConfig.port}`);
    console.log(`✅ Utilisateur: ${smtpConfig.auth.user}`);
    console.log(`✅ Destination: bonjour@portail-electricite.com`);
    console.log(`✅ SSL/TLS: Activé`);
    console.log(`✅ Tests envoyés: 2 notifications`);
    console.log('\n🔄 La configuration est maintenant opérationnelle!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    if (error.code === 'EAUTH') {
      console.error('❌ Erreur d\'authentification - Vérifiez les identifiants');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ Erreur de connexion - Vérifiez le serveur et le port');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

// Lancer le test
console.log('🚀 Test de la nouvelle configuration SMTP stableserver.net');
console.log('===========================================================\n');
testEmailNotification();