/**
 * Envoi direct des 3 templates perfectionnés
 */

async function envoyerTemplatesViaDirect() {
  console.log('🎯 ENVOI DES 3 TEMPLATES PERFECTIONNÉS');
  console.log('📧 Vers: bonjour@raccordement-elec.fr\n');

  const donnees = {
    nom: 'Moreau',
    prenom: 'Isabelle',
    email: 'isabelle.moreau@gmail.com',
    telephone: '07 89 12 34 56',
    phone: '07 89 12 34 56',
    clientType: 'particulier',
    referenceNumber: 'DESIGN-TEST-001'
  };

  try {
    // Template 1 - Simple et Clean
    console.log('📧 Template 1 - Design Simple et Clean');
    await fetch('http://localhost:5000/api/notifications/lead-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...donnees,
        templateType: 'clean',
        sujet: '[TEMPLATE 1] Design Simple et Clean'
      })
    });
    console.log('✅ Template Clean envoyé');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Template 2 - Gradient
    console.log('📧 Template 2 - Design Professionnel avec Gradient');
    await fetch('http://localhost:5000/api/notifications/lead-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...donnees,
        nom: 'Durand',
        prenom: 'Vincent',
        email: 'vincent.durand@entreprise.com',
        telephone: '01 45 67 89 12',
        phone: '01 45 67 89 12',
        clientType: 'entreprise',
        raisonSociale: 'DURAND CONSULTING SAS',
        siren: '123456789',
        templateType: 'gradient',
        sujet: '[TEMPLATE 2] Design Professionnel avec Gradient'
      })
    });
    console.log('✅ Template Gradient envoyé');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Template 3 - Premium
    console.log('📧 Template 3 - Design Premium avec Sections Colorées');
    await fetch('http://localhost:5000/api/notifications/lead-created', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...donnees,
        nom: 'Bernard',
        prenom: 'Sylvie',
        email: 'sylvie.bernard@mairie-exemple.fr',
        telephone: '04 76 89 01 23',
        phone: '04 76 89 01 23',
        clientType: 'collectivite',
        nomCollectivite: 'Mairie de Exemple-les-Bains',
        sirenCollectivite: '987654321',
        templateType: 'premium',
        sujet: '[TEMPLATE 3] Design Premium avec Sections Colorées'
      })
    });
    console.log('✅ Template Premium envoyé');

    console.log('\n🎯 TOUS LES TEMPLATES ENVOYÉS !');
    console.log('📧 Vérifiez votre boîte mail bonjour@raccordement-elec.fr');
    console.log('\n📋 Vous recevrez 3 emails avec des designs distincts :');
    console.log('   1. 🔷 Design Simple et Clean (Isabelle Moreau - Particulier)');
    console.log('   2. 🌈 Design Professionnel avec Gradient (Vincent Durand - Entreprise)');
    console.log('   3. 🌟 Design Premium avec Sections Colorées (Sylvie Bernard - Collectivité)');
    console.log('\n💡 Comparez les 3 designs et choisissez votre préféré !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

envoyerTemplatesViaDirect().catch(console.error);