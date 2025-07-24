/**
 * Diagnostic spécifique pour la référence RAC-4891-274776
 * visible dans la capture d'écran du terminal de paiement
 */

const FRONTEND_URL = 'http://localhost:5000';
const TEST_REFERENCE = 'RAC-4891-274776';

async function makeRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
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
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function diagnosticReferenceSpecifique() {
  console.log(`DIAGNOSTIC SPÉCIFIQUE - ${TEST_REFERENCE}`);
  console.log('='.repeat(50));

  // 1. Test direct de la référence
  console.log('\n1. Test recherche directe par référence');
  const directResult = await makeRequest('GET', `/api/service-requests/${TEST_REFERENCE}`);
  console.log(`Recherche directe: ${directResult.success ? 'TROUVÉE' : 'NON TROUVÉE'}`);
  
  if (directResult.success) {
    console.log(`Client: ${directResult.data.serviceRequest?.name}`);
    console.log(`Email: ${directResult.data.serviceRequest?.email}`);
    console.log(`Statut: ${directResult.data.serviceRequest?.paymentStatus || 'non défini'}`);
  } else {
    console.log(`Erreur: ${directResult.data?.message}`);
  }

  // 2. Recherche dans toutes les demandes récentes
  console.log('\n2. Recherche dans les demandes récentes');
  const recentResult = await makeRequest('GET', '/api/service-requests/recent?limit=50');
  
  if (recentResult.success) {
    const found = recentResult.data.requests?.find(r => r.referenceNumber === TEST_REFERENCE);
    console.log(`Dans les demandes récentes: ${found ? 'TROUVÉE' : 'NON TROUVÉE'}`);
    
    if (found) {
      console.log(`Client: ${found.name}`);
      console.log(`Date: ${found.createdAt}`);
    }
  }

  // 3. Recherche pattern similaire
  console.log('\n3. Recherche de références similaires');
  if (recentResult.success) {
    const similarRefs = recentResult.data.requests?.filter(r => 
      r.referenceNumber?.startsWith('RAC-4891')
    ) || [];
    
    console.log(`Références RAC-4891-*: ${similarRefs.length}`);
    similarRefs.forEach(ref => {
      console.log(`  - ${ref.referenceNumber} (${ref.name})`);
    });
  }

  // 4. Validation du format
  console.log('\n4. Validation du format de référence');
  const racPattern = /^RAC-\d{4}-\d{6}$/;
  const isValidFormat = racPattern.test(TEST_REFERENCE);
  console.log(`Format valide: ${isValidFormat ? 'OUI' : 'NON'}`);
  console.log(`Pattern: RAC-XXXX-XXXXXX`);
  console.log(`Référence: ${TEST_REFERENCE}`);

  // 5. Test création payment intent
  console.log('\n5. Test création payment intent');
  const paymentResult = await makeRequest('POST', '/api/create-payment-intent-multiple', {
    referenceNumber: TEST_REFERENCE,
    multiplier: 1,
    createOnly: true
  });
  
  console.log(`Payment intent: ${paymentResult.success ? 'SUCCÈS' : 'ÉCHEC'}`);
  if (!paymentResult.success) {
    console.log(`Erreur payment: ${paymentResult.data?.message}`);
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('RÉSUMÉ DIAGNOSTIC');
  console.log('='.repeat(50));
  
  if (!directResult.success) {
    console.log('❌ RÉFÉRENCE NON TROUVÉE EN BASE');
    console.log('\nCAUSES POSSIBLES:');
    console.log('• Référence inexistante dans la base de données');
    console.log('• Référence supprimée ou archivée');
    console.log('• Erreur de saisie dans le format');
    console.log('• Problème de synchronisation base de données');
  } else {
    console.log('✅ RÉFÉRENCE TROUVÉE - Problème ailleurs');
  }
}

// Exécution du diagnostic
diagnosticReferenceSpecifique().catch(console.error);