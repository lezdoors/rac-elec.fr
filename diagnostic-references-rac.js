/**
 * 🔍 DIAGNOSTIC - Références RAC- dans le terminal de paiement
 * Vérifie pourquoi le terminal ne trouve pas les références RAC-
 */

const FRONTEND_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${FRONTEND_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: result
    };
  } catch (error) {
    console.error(`❌ Erreur requête ${method} ${endpoint}:`, error.message);
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function diagnosticReferencesRac() {
  console.log('🔍 DIAGNOSTIC RÉFÉRENCES RAC- DANS LE TERMINAL DE PAIEMENT');
  console.log('='.repeat(60));

  // 1. Vérifier les références RAC- en base
  console.log('\n📌 TEST 1: Références RAC- dans la base de données');
  const serviceRequestsResult = await makeRequest('GET', '/api/service-requests?limit=10');
  
  if (serviceRequestsResult.success) {
    const racRequests = serviceRequestsResult.data.serviceRequests?.filter(sr => 
      sr.referenceNumber && sr.referenceNumber.startsWith('RAC-')
    ) || [];
    
    console.log(`✅ ${racRequests.length} demandes avec référence RAC- trouvées`);
    
    if (racRequests.length > 0) {
      console.log('Exemples de références RAC-:');
      racRequests.slice(0, 3).forEach(sr => {
        console.log(`  - ${sr.referenceNumber} (ID: ${sr.id}, Statut: ${sr.paymentStatus || 'non défini'})`);
      });
    }
  } else {
    console.log('❌ Impossible de récupérer les demandes de service');
  }

  // 2. Tester la recherche par référence RAC- spécifique
  if (serviceRequestsResult.success && serviceRequestsResult.data.serviceRequests?.length > 0) {
    const firstRacRef = serviceRequestsResult.data.serviceRequests.find(sr => 
      sr.referenceNumber && sr.referenceNumber.startsWith('RAC-')
    );
    
    if (firstRacRef) {
      console.log(`\n📌 TEST 2: Recherche référence spécifique ${firstRacRef.referenceNumber}`);
      
      const searchResult = await makeRequest('GET', `/api/service-requests/${firstRacRef.referenceNumber}`);
      console.log('Résultat recherche directe:', {
        status: searchResult.status,
        success: searchResult.success,
        found: !!searchResult.data?.serviceRequest,
        reference: searchResult.data?.serviceRequest?.referenceNumber
      });
      
      if (!searchResult.success) {
        console.log('❌ Erreur lors de la recherche:', searchResult.data?.message);
      }
    }
  }

  // 3. Test de création d'intention de paiement avec référence RAC-
  if (serviceRequestsResult.success && serviceRequestsResult.data.serviceRequests?.length > 0) {
    const racRef = serviceRequestsResult.data.serviceRequests.find(sr => 
      sr.referenceNumber && sr.referenceNumber.startsWith('RAC-') && sr.paymentStatus !== 'paid'
    );
    
    if (racRef) {
      console.log(`\n📌 TEST 3: Création intention de paiement pour ${racRef.referenceNumber}`);
      
      const paymentIntentResult = await makeRequest('POST', '/api/create-payment-intent-multiple', {
        referenceNumber: racRef.referenceNumber,
        multiplier: 1,
        createOnly: true
      });
      
      console.log('Résultat création payment intent:', {
        status: paymentIntentResult.status,
        success: paymentIntentResult.success,
        hasClientSecret: !!paymentIntentResult.data?.clientSecret
      });
      
      if (!paymentIntentResult.success) {
        console.log('❌ Erreur création payment intent:', paymentIntentResult.data?.message);
      }
    } else {
      console.log('\n📌 TEST 3: Aucune référence RAC- non payée disponible pour test');
    }
  }

  // 4. Vérifier les anciennes références REF- vs nouvelles RAC-
  console.log('\n📌 TEST 4: Comparaison références REF- vs RAC-');
  
  if (serviceRequestsResult.success) {
    const allRequests = serviceRequestsResult.data.serviceRequests || [];
    const refRequests = allRequests.filter(sr => sr.referenceNumber?.startsWith('REF-'));
    const racRequests = allRequests.filter(sr => sr.referenceNumber?.startsWith('RAC-'));
    
    console.log(`📊 Statistiques des références:`);
    console.log(`  - Références REF-: ${refRequests.length}`);
    console.log(`  - Références RAC-: ${racRequests.length}`);
    console.log(`  - Total: ${allRequests.length}`);
    
    if (refRequests.length > 0) {
      console.log('\nExemples REF-:');
      refRequests.slice(0, 2).forEach(sr => {
        console.log(`  - ${sr.referenceNumber}`);
      });
    }
    
    if (racRequests.length > 0) {
      console.log('\nExemples RAC-:');
      racRequests.slice(0, 2).forEach(sr => {
        console.log(`  - ${sr.referenceNumber}`);
      });
    }
  }

  // 5. Test de l'endpoint de recherche général
  console.log('\n📌 TEST 5: Fonctionnalité de recherche générale');
  
  const searchTerms = ['RAC-', 'REF-'];
  for (const term of searchTerms) {
    const searchResult = await makeRequest('GET', `/api/search-requests?term=${encodeURIComponent(term)}`);
    console.log(`Recherche "${term}":`, {
      status: searchResult.status,
      success: searchResult.success,
      resultCount: searchResult.data?.results?.length || 0
    });
  }

  // Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DIAGNOSTIC FINAL');
  console.log('='.repeat(60));
  
  const issues = [];
  
  if (!serviceRequestsResult.success) {
    issues.push("❌ Impossible d'accéder aux demandes de service");
  }
  
  const racCount = serviceRequestsResult.data?.serviceRequests?.filter(sr => 
    sr.referenceNumber?.startsWith('RAC-')
  ).length || 0;
  
  if (racCount === 0) {
    issues.push("❌ Aucune référence RAC- trouvée en base");
  }
  
  console.log('\n🔍 PROBLÈMES IDENTIFIÉS:');
  if (issues.length === 0) {
    console.log('✅ Aucun problème technique détecté');
    console.log('\n💡 CAUSES POSSIBLES:');
    console.log('  • Frontend utilise encore l\'ancien format REF-');
    console.log('  • Cache navigateur ou interface non synchronisée');
    console.log('  • Validation côté client bloque les références RAC-');
  } else {
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  console.log('\n🔧 ACTIONS RECOMMANDÉES:');
  console.log('  1. Vérifier le code frontend du terminal de paiement');
  console.log('  2. Mettre à jour les expressions régulières de validation');
  console.log('  3. Synchroniser les formats de référence');
  console.log('  4. Tester avec une vraie référence RAC-');
}

// Exécution du diagnostic
diagnosticReferencesRac().catch(console.error);