const fs = require('fs');

// Ajouter les nouvelles routes de notifications dans server/index.ts
const indexContent = fs.readFileSync('server/index.ts', 'utf8');

// Ajouter les routes spécifiques de notifications
const newNotificationRoutes = `
// 📧 NOTIFICATION LEAD - Étape 1 → Étape 2
app.post("/api/notifications/lead-created", async (req, res) => {
  try {
    const leadData = req.body;
    console.log('🎯 LEAD CRÉÉ - Envoi notification:', leadData.email);
    
    const { sendLeadNotification } = await import('./email-service.js');
    const emailResult = await sendLeadNotification(leadData);
    
    res.json({ success: true, message: 'Notification lead envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📧 NOTIFICATION DEMANDE COMPLÈTE
app.post("/api/notifications/request-completed", async (req, res) => {
  try {
    const requestData = req.body;
    console.log('📋 DEMANDE COMPLÈTE - Envoi notification:', requestData.email);
    
    const { sendRequestCompletedNotification } = await import('./email-service.js');
    const emailResult = await sendRequestCompletedNotification(requestData);
    
    res.json({ success: true, message: 'Notification demande complète envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification demande complète:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📧 NOTIFICATION PAIEMENT RÉUSSI
app.post("/api/notifications/payment-success", async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('💰 PAIEMENT RÉUSSI - Envoi notification:', paymentData.referenceNumber);
    
    const { sendPaiementReussiNotification } = await import('./email-service.js');
    const emailResult = await sendPaiementReussiNotification(paymentData);
    
    res.json({ success: true, message: 'Notification paiement réussi envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification paiement réussi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📧 NOTIFICATION PAIEMENT ÉCHOUÉ
app.post("/api/notifications/payment-failed", async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('🚨 PAIEMENT ÉCHOUÉ - Envoi notification:', paymentData.referenceNumber);
    
    const { sendPaiementEchoueNotification } = await import('./email-service.js');
    const emailResult = await sendPaiementEchoueNotification(paymentData);
    
    res.json({ success: true, message: 'Notification paiement échoué envoyée', emailResult });
  } catch (error) {
    console.error('❌ Erreur notification paiement échoué:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
`;

// Insérer les nouvelles routes avant registerRoutes
const updatedIndexContent = indexContent.replace(
  'app.use(express.urlencoded({ extended: false }));',
  `app.use(express.urlencoded({ extended: false }));

${newNotificationRoutes}`
);

fs.writeFileSync('server/index.ts', updatedIndexContent);

// Modifier le formulaire pour utiliser la nouvelle route lead
const formContent = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');

const updatedFormContent = formContent.replace(
  /await sendNotification\("prelead_created", \{[\s\S]*?\}\);/,
  `// Notification via nouvelle route spécifique
      await fetch("/api/notifications/lead-created", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.phone,
          clientType: formData.clientType,
          raisonSociale: formData.raisonSociale,
          siren: formData.siren,
          nomCollectivite: formData.nomCollectivite,
          sirenCollectivite: formData.sirenCollectivite,
          referenceNumber: result.referenceNumber,
          timestamp: new Date().toISOString()
        }),
      });`
);

fs.writeFileSync('client/src/pages/raccordement-enedis.tsx', updatedFormContent);

// Modifier la soumission finale pour utiliser la nouvelle route
const finalSubmissionPattern = /await sendNotification\("form_completed"[\s\S]*?\);/;
const newFinalSubmission = `// Notification demande complète via nouvelle route
      await fetch("/api/notifications/request-completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mappedData.name,
          email: mappedData.email,
          phone: mappedData.phone,
          referenceNumber: reference,
          address: mappedData.address,
          city: mappedData.city,
          postalCode: mappedData.postalCode,
          requestType: mappedData.requestType,
          buildingType: mappedData.buildingType,
          powerRequired: mappedData.powerRequired,
          company: mappedData.company,
          comments: mappedData.comments,
          timestamp: new Date().toISOString()
        }),
      });`;

const finalFormContent = fs.readFileSync('client/src/pages/raccordement-enedis.tsx', 'utf8');
const updatedFinalFormContent = finalFormContent.replace(finalSubmissionPattern, newFinalSubmission);
fs.writeFileSync('client/src/pages/raccordement-enedis.tsx', updatedFinalFormContent);

console.log('✅ Système de notifications perfectionné configuré !');
console.log('');
console.log('📧 4 TYPES D\'EMAILS CONFIGURÉS :');
console.log('   1. 🎯 Lead créé (Étape 1 → 2) : /api/notifications/lead-created');
console.log('   2. 📋 Demande complète : /api/notifications/request-completed');
console.log('   3. 💰 Paiement réussi : /api/notifications/payment-success');
console.log('   4. 🚨 Paiement échoué : /api/notifications/payment-failed');
console.log('');
console.log('🚀 PRÊT POUR VOS TESTS !');
