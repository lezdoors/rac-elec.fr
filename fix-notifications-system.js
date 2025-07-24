/**
 * Script de correction du système de notifications
 * Corrige le formulaire principal pour créer des leads et déclencher les notifications
 */

import fs from 'fs';
import path from 'path';

function fixNotificationSystem() {
  console.log('🔧 Correction du système de notifications...');
  
  const formPath = './client/src/pages/raccordement-enedis.tsx';
  
  try {
    // Lire le fichier du formulaire principal
    let formContent = fs.readFileSync(formPath, 'utf8');
    
    // 1. Ajouter l'état pour le token de lead
    if (!formContent.includes('leadToken')) {
      const stateDeclaration = formContent.match(/const \[currentStep, setCurrentStep\] = useState\(1\);/);
      if (stateDeclaration) {
        formContent = formContent.replace(
          /const \[currentStep, setCurrentStep\] = useState\(1\);/,
          `const [currentStep, setCurrentStep] = useState(1);
  const [leadToken, setLeadToken] = useState<string | null>(null);`
        );
        console.log('✅ Ajout de l\'état leadToken');
      }
    }
    
    // 2. Ajouter la fonction de création de lead
    const createLeadFunction = `
  // Fonction pour créer un lead à la première étape
  const createLead = async (data: Partial<RequestFormValues>) => {
    try {
      const leadData = {
        firstName: data.prenom,
        lastName: data.nom,
        email: data.email,
        phone: data.telephone,
        clientType: data.clientType,
        company: data.societe || null,
        siret: data.siren || null,
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
        title: "Première étape sauvegardée",
        description: "Vos informations ont été enregistrées avec succès",
      });
      
      return result.token;
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error);
      // On continue même si le lead échoue
      return null;
    }
  };`;
    
    // Insérer la fonction avant la fonction de validation
    if (!formContent.includes('createLead = async')) {
      const insertPoint = formContent.indexOf('// Fonction de validation des champs par étape');
      if (insertPoint !== -1) {
        formContent = formContent.slice(0, insertPoint) + createLeadFunction + '\n\n  ' + formContent.slice(insertPoint);
        console.log('✅ Ajout de la fonction createLead');
      }
    }
    
    // 3. Modifier la fonction nextStep pour créer un lead à l'étape 1
    const nextStepPattern = /const nextStep = async \(\) => \{[\s\S]*?setCurrentStep\(currentStep \+ 1\);[\s\S]*?\};/;
    const currentNextStep = formContent.match(nextStepPattern);
    
    if (currentNextStep && !currentNextStep[0].includes('createLead')) {
      const newNextStep = `const nextStep = async () => {
    const isValid = await form.trigger(getFieldsForStep(currentStep));
    if (!isValid) {
      const errors = form.formState.errors;
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(\`[name="\${firstErrorField}"]\`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }
      return;
    }
    
    // Si c'est la première étape, créer un lead
    if (currentStep === 1) {
      const formData = form.getValues();
      await createLead(formData);
    }
    
    // Sauvegarde automatique lors du passage à l'étape suivante
    saveFormData(form.getValues());
    setCurrentStep(currentStep + 1);
  };`;
      
      formContent = formContent.replace(nextStepPattern, newNextStep);
      console.log('✅ Modification de la fonction nextStep');
    }
    
    // 4. Modifier la fonction onSubmit pour utiliser le leadToken
    const onSubmitPattern = /const onSubmit = async \(data: RequestFormValues\) => \{[\s\S]*?finally \{[\s\S]*?\}\s*\};/;
    const currentOnSubmit = formContent.match(onSubmitPattern);
    
    if (currentOnSubmit && !currentOnSubmit[0].includes('leadToken')) {
      // Ajouter leadToken aux données de la requête
      formContent = formContent.replace(
        /const requestData = \{/,
        `const requestData = {
        leadToken: leadToken, // Lier la demande au lead créé`
      );
      console.log('✅ Ajout du leadToken à la soumission');
    }
    
    // Écrire le fichier modifié
    fs.writeFileSync(formPath, formContent);
    console.log('✅ Fichier du formulaire principal mis à jour');
    
    console.log('\n🎯 CORRECTION TERMINÉE !');
    console.log('📋 Modifications apportées :');
    console.log('  - Ajout de l\'état leadToken');
    console.log('  - Création de la fonction createLead');
    console.log('  - Modification de nextStep pour créer un lead à l\'étape 1');
    console.log('  - Liaison du lead à la demande finale');
    console.log('\n✅ Votre système de notifications devrait maintenant fonctionner :');
    console.log('  - Notification "nouveau lead" à l\'étape 1');
    console.log('  - Notification "demande complète" à la soumission finale');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

// Exécuter la correction
fixNotificationSystem();