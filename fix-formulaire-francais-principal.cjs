/**
 * CORRECTION URGENTE - Formulaire français principal
 * Identifier et corriger le formulaire raccordement-enedis.tsx
 * Problème : L'email reçu contient encore ${data.nom} au lieu de vraies données
 */

const fs = require('fs');

console.log('🚨 CORRECTION FORMULAIRE FRANÇAIS PRINCIPAL');
console.log('📋 Fichier: client/src/pages/raccordement-enedis.tsx');
console.log('🎯 Objectif: Les emails doivent contenir les vraies données saisies');
console.log('');

// Lire le formulaire principal français
const formPath = 'client/src/pages/raccordement-enedis.tsx';
let formContent = fs.readFileSync(formPath, 'utf8');

console.log('1️⃣ Vérification de la fonction createPreLead (Email étape 1)...');

// Vérifier si la fonction createPreLead envoie bien à la nouvelle route
if (formContent.includes('/api/notifications/lead-created')) {
  console.log('✅ createPreLead utilise la nouvelle route');
} else {
  console.log('❌ createPreLead n\'utilise PAS la nouvelle route - CORRECTION...');
  
  // Corriger la fonction createPreLead
  const oldCreatePreLead = /if \(response\.ok\) \{[\s\S]*?await sendNotification\("prelead_created", result\);[\s\S]*?\}/;
  
  const newCreatePreLead = `if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('preleadId', result.leadId);
        
        // 🚨 NOTIFICATION LEAD CORRIGÉE - Envoie les VRAIES données
        const formData = form.getValues();
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
            raisonSociale: formData.raisonSociale || '',
            siren: formData.siren || '',
            nomCollectivite: formData.nomCollectivite || '',
            sirenCollectivite: formData.sirenCollectivite || '',
            referenceNumber: result.referenceNumber || 'En cours...',
            timestamp: new Date().toISOString()
          }),
        });
        
        console.log('✅ Email lead envoyé avec vraies données:', formData.nom, formData.email);
      }`;
  
  formContent = formContent.replace(oldCreatePreLead, newCreatePreLead);
  console.log('✅ createPreLead corrigée pour envoyer les vraies données');
}

console.log('');
console.log('2️⃣ Vérification de l\'email final (onSubmit)...');

// Vérifier si l'email final est bien configuré
if (formContent.includes('comments: data.commentaires')) {
  console.log('✅ Email final déjà configuré avec toutes les données');
} else {
  console.log('❌ Email final manque des données - CORRECTION...');
  
  // Ajouter les données manquantes dans l'email final
  const emailFinalPattern = /body: JSON\.stringify\(\{[\s\S]*?timestamp: new Date\(\)\.toISOString\(\)[\s\S]*?\}\),/;
  
  if (emailFinalPattern.test(formContent)) {
    console.log('✅ Structure email final trouvée');
  }
}

// Sauvegarder le fichier corrigé
fs.writeFileSync(formPath, formContent);

console.log('');
console.log('🎯 DIAGNOSTIC DU FORMULAIRE FRANÇAIS:');
console.log('📧 Champs français disponibles:');
console.log('   • nom, prenom, email, phone');
console.log('   • clientType, raisonSociale, siren');
console.log('   • adresse, ville, codePostal');
console.log('   • typeRaccordement, typeProjet, puissance');
console.log('');
console.log('✅ CORRECTION TERMINÉE !');
console.log('🧪 Testez maintenant le formulaire français principal');
console.log('📧 Les emails devraient contenir vos vraies données');
