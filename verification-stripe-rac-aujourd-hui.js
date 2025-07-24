/**
 * 🔍 VÉRIFICATION STRIPE - Paiements RAC- aujourd'hui
 * Rapport complet des paiements avec référence RAC- pour la date d'aujourd'hui
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function verifierPaiementsRacAujourdhui() {
  console.log('🔍 VÉRIFICATION STRIPE - Paiements RAC- aujourd\'hui');
  console.log('===============================================');
  
  try {
    // Date d'aujourd'hui
    const aujourdhui = new Date();
    const debutJournee = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
    const finJournee = new Date(debutJournee);
    finJournee.setDate(finJournee.getDate() + 1);
    
    console.log(`📅 Période de vérification: ${debutJournee.toLocaleDateString('fr-FR')} (00:00 - 23:59)`);
    console.log(`⏰ Timestamps: ${Math.floor(debutJournee.getTime() / 1000)} - ${Math.floor(finJournee.getTime() / 1000)}`);
    console.log('');
    
    // 1. Vérification des PaymentIntents Stripe
    console.log('🔎 1. VÉRIFICATION STRIPE PAYMENT INTENTS');
    console.log('----------------------------------------');
    
    const paymentIntents = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(debutJournee.getTime() / 1000),
        lt: Math.floor(finJournee.getTime() / 1000)
      },
      limit: 100
    });
    
    console.log(`📊 Total PaymentIntents aujourd'hui: ${paymentIntents.data.length}`);
    
    // Filtrer les paiements RAC-
    const paiementsRAC = paymentIntents.data.filter(pi => {
      const metadata = pi.metadata || {};
      const description = pi.description || '';
      
      // Vérifier dans les métadonnées et description
      const hasRacReference = 
        Object.values(metadata).some(value => 
          typeof value === 'string' && value.includes('RAC-')
        ) ||
        description.includes('RAC-');
      
      return hasRacReference;
    });
    
    console.log(`🎯 Paiements avec référence RAC-: ${paiementsRAC.length}`);
    console.log('');
    
    // 2. Détails des paiements RAC-
    if (paiementsRAC.length > 0) {
      console.log('📋 DÉTAILS DES PAIEMENTS RAC-');
      console.log('-----------------------------');
      
      let totalMontant = 0;
      let paiementsReussis = 0;
      
      paiementsRAC.forEach((pi, index) => {
        const montant = pi.amount / 100; // Convertir de centimes en euros
        const statut = pi.status;
        const reference = pi.metadata?.reference || 
                         pi.description?.match(/RAC-[^\\s]+/)?.[0] || 
                         'Référence non trouvée';
        
        console.log(`${index + 1}. ID: ${pi.id}`);
        console.log(`   Référence: ${reference}`);
        console.log(`   Montant: ${montant.toFixed(2)}€`);
        console.log(`   Statut: ${statut}`);
        console.log(`   Créé: ${new Date(pi.created * 1000).toLocaleString('fr-FR')}`);
        console.log(`   Métadonnées:`, pi.metadata);
        console.log('');
        
        totalMontant += montant;
        if (statut === 'succeeded') {
          paiementsReussis++;
        }
      });
      
      // 3. Statistiques résumées
      console.log('📊 STATISTIQUES RÉSUMÉES');
      console.log('------------------------');
      console.log(`🔢 Nombre total de paiements RAC-: ${paiementsRAC.length}`);
      console.log(`💰 Montant total: ${totalMontant.toFixed(2)}€`);
      console.log(`✅ Paiements réussis: ${paiementsReussis}`);
      console.log(`❌ Paiements échoués: ${paiementsRAC.length - paiementsReussis}`);
      console.log(`📈 Taux de réussite: ${((paiementsReussis / paiementsRAC.length) * 100).toFixed(1)}%`);
      
    } else {
      console.log('ℹ️  Aucun paiement avec référence RAC- trouvé aujourd\'hui');
    }
    
    // 4. Vérification des charges (pour double vérification)
    console.log('');
    console.log('🔎 2. VÉRIFICATION STRIPE CHARGES (Double vérification)');
    console.log('-------------------------------------------------------');
    
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(debutJournee.getTime() / 1000),
        lt: Math.floor(finJournee.getTime() / 1000)
      },
      limit: 100
    });
    
    const chargesRAC = charges.data.filter(charge => {
      const metadata = charge.metadata || {};
      const description = charge.description || '';
      
      return Object.values(metadata).some(value => 
        typeof value === 'string' && value.includes('RAC-')
      ) || description.includes('RAC-');
    });
    
    console.log(`📊 Total Charges aujourd'hui: ${charges.data.length}`);
    console.log(`🎯 Charges avec référence RAC-: ${chargesRAC.length}`);
    
    if (chargesRAC.length > 0) {
      console.log('');
      console.log('📋 CHARGES RAC- DÉTECTÉES:');
      chargesRAC.forEach((charge, index) => {
        const reference = charge.metadata?.reference || 
                         charge.description?.match(/RAC-[^\\s]+/)?.[0] || 
                         'Référence non trouvée';
        console.log(`${index + 1}. Charge ID: ${charge.id}, Référence: ${reference}, Montant: ${(charge.amount / 100).toFixed(2)}€`);
      });
    }
    
    console.log('');
    console.log('✅ Vérification terminée');
    
    return {
      date: aujourdhui.toLocaleDateString('fr-FR'),
      totalPaymentIntents: paymentIntents.data.length,
      paiementsRAC: paiementsRAC.length,
      totalMontant: paiementsRAC.reduce((sum, pi) => sum + (pi.amount / 100), 0),
      paiementsReussis: paiementsRAC.filter(pi => pi.status === 'succeeded').length,
      totalCharges: charges.data.length,
      chargesRAC: chargesRAC.length
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification Stripe:', error.message);
    throw error;
  }
}

// Exécution du script
if (require.main === module) {
  verifierPaiementsRacAujourdhui()
    .then(resultat => {
      console.log('');
      console.log('🎯 RAPPORT FINAL:');
      console.log(`Date: ${resultat.date}`);
      console.log(`Paiements RAC- trouvés: ${resultat.paiementsRAC}`);
      console.log(`Montant total: ${resultat.totalMontant.toFixed(2)}€`);
      console.log(`Taux de réussite: ${resultat.paiementsRAC > 0 ? ((resultat.paiementsReussis / resultat.paiementsRAC) * 100).toFixed(1) : 0}%`);
    })
    .catch(error => {
      console.error('Échec de la vérification:', error.message);
      process.exit(1);
    });
}

module.exports = { verifierPaiementsRacAujourdhui };