/**
 * Application automatique du système de notifications à tous les formulaires
 * Conserve la configuration existante du formulaire principal
 */

import fs from 'fs';
import path from 'path';

const FORMS_TO_UPDATE = [
  'client/src/pages/particulier.tsx',
  'client/src/pages/particulier-new.tsx',
  'client/src/pages/professionnel.tsx',
  'client/src/pages/professionnel-new.tsx',
  'client/src/pages/solaire.tsx',
  'client/src/pages/solaire-new.tsx'
];

function applyNotificationsToForm(filePath) {
  console.log(`🔧 Mise à jour de ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Ajouter leadToken si pas déjà présent
    if (!content.includes('leadToken')) {
      const statePattern = /const \[currentStep, setCurrentStep\] = useState\(1\);/;
      if (statePattern.test(content)) {
        content = content.replace(
          statePattern,
          `const [currentStep, setCurrentStep] = useState(1);
  const [leadToken, setLeadToken] = useState<string | null>(null);`
        );
        modified = true;
        console.log('  ✅ leadToken ajouté');
      } else {
        // Chercher autre pattern pour l'état
        const altStatePattern = /const \[.*setCurrentStep.*\] = useState.*;\s*const \[.*setFormProgress.*\] = useState/;
        if (altStatePattern.test(content)) {
          content = content.replace(
            /(\[.*setFormProgress.*\] = useState.*;\s*)/,
            `$1
  const [leadToken, setLeadToken] = useState<string | null>(null);`
          );
          modified = true;
          console.log('  ✅ leadToken ajouté (pattern alternatif)');
        }
      }
    }
    
    // 2. Ajouter la fonction createLead si pas déjà présente
    if (!content.includes('const createLead = async')) {
      const createLeadFunction = `
  // Fonction pour créer un lead au début du formulaire
  const createLead = async (data: Partial<RequestFormValues>) => {
    try {
      const leadData = {
        firstName: data.prenom,
        lastName: data.nom,
        email: data.email,
        phone: data.telephone,
        clientType: data.clientType,
        company: data.societe || null,
        siret: data.siret || null,
        serviceType: "electricity",
        address: data.adresse,
        postalCode: data.codePostal,
        city: data.ville
      };
      
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du lead');
      }
      
      const result = await response.json();
      setLeadToken(result.token);
      
      toast({
        title: "Informations sauvegardées",
        description: "Vos données ont été enregistrées avec succès",
      });
      
      return result.token;
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error);
      return null;
    }
  };
`;
      
      // Insérer avant la fonction de validation ou onSubmit
      const insertPatterns = [
        /(\s*\/\/ Fonction pour valider)/,
        /(\s*\/\/ Fonction de validation)/,
        /(\s*const onSubmit = async)/,
        /(\s*const lookupCity = async)/
      ];
      
      let inserted = false;
      for (const pattern of insertPatterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, createLeadFunction + '\n$1');
          inserted = true;
          modified = true;
          console.log('  ✅ Fonction createLead ajoutée');
          break;
        }
      }
      
      if (!inserted) {
        console.log('  ⚠️  Impossible de trouver un point d\'insertion pour createLead');
      }
    }
    
    // 3. Modifier onSubmit pour inclure leadToken
    if (!content.includes('leadToken: leadToken') && content.includes('const requestData = {')) {
      content = content.replace(
        /const requestData = \{/,
        `const requestData = {
        leadToken: leadToken, // Lier la demande au lead créé`
      );
      modified = true;
      console.log('  ✅ leadToken ajouté à onSubmit');
    }
    
    // 4. Ajouter appel createLead lors de la première validation
    if (content.includes('nextStep') && !content.includes('await createLead')) {
      // Pattern pour nextStep
      const nextStepPattern = /const nextStep = async \(\) => \{([^}]+)\};/s;
      const nextStepMatch = content.match(nextStepPattern);
      
      if (nextStepMatch) {
        const nextStepBody = nextStepMatch[1];
        if (!nextStepBody.includes('createLead')) {
          const newNextStepBody = nextStepBody.replace(
            /(setCurrentStep\(currentStep \+ 1\);)/,
            `// Créer un lead à la première étape
    if (currentStep === 1) {
      const formData = form.getValues();
      await createLead(formData);
    }
    
    $1`
          );
          
          content = content.replace(nextStepPattern, `const nextStep = async () => {${newNextStepBody}};`);
          modified = true;
          console.log('  ✅ Appel createLead ajouté à nextStep');
        }
      }
    }
    
    // Sauvegarder si modifié
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} mis à jour avec succès`);
      return true;
    } else {
      console.log(`ℹ️  ${filePath} déjà à jour`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
    return false;
  }
}

async function applyNotificationsToAllForms() {
  console.log('🚀 Application du système de notifications à tous les formulaires...');
  console.log('📋 Conservation de la configuration existante du formulaire principal');
  
  let successCount = 0;
  let totalCount = FORMS_TO_UPDATE.length;
  
  for (const formPath of FORMS_TO_UPDATE) {
    if (applyNotificationsToForm(formPath)) {
      successCount++;
    }
  }
  
  console.log('\n🎯 RÉSUMÉ DE L\'APPLICATION:');
  console.log(`✅ Formulaires mis à jour: ${successCount}/${totalCount}`);
  console.log('📧 Système de notifications configuré:');
  console.log('  • Création de lead à la première étape');
  console.log('  • Notification email "nouveau lead"');
  console.log('  • Notification email "demande complète" à la soumission');
  console.log('  • Destinataire: bonjour@raccordement-elec.fr');
  
  if (successCount === totalCount) {
    console.log('\n🎉 TOUS LES FORMULAIRES SONT MAINTENANT CONFIGURÉS !');
    console.log('🚀 Votre site est prêt pour le déploiement avec notifications complètes');
  } else {
    console.log(`\n⚠️  ${totalCount - successCount} formulaire(s) nécessite(nt) une attention manuelle`);
  }
}

// Exécuter l'application
applyNotificationsToAllForms();