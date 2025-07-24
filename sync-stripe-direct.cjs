/**
 * Synchronisation directe Stripe → PostgreSQL
 * Corrige le tableau de bord avec les vraies données
 */

const Stripe = require('stripe');
const { Client } = require('pg');

async function syncStripeDirectly() {
  console.log('🔄 SYNCHRONISATION STRIPE → POSTGRESQL');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY manquant');
    return;
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant');
    return;
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');
    
    // Période juin 2025
    const debutJuin = Math.floor(new Date('2025-06-01T00:00:00Z').getTime() / 1000);
    const finJuin = Math.floor(new Date('2025-06-06T23:59:59Z').getTime() / 1000);
    
    // Récupérer tous les paiements Stripe
    let allPayments = [];
    let hasMore = true;
    let startingAfter = null;
    
    while (hasMore) {
      const params = {
        limit: 100,
        created: { gte: debutJuin, lte: finJuin }
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const paymentsList = await stripe.paymentIntents.list(params);
      allPayments = allPayments.concat(paymentsList.data);
      hasMore = paymentsList.has_more;
      
      if (hasMore && paymentsList.data.length > 0) {
        startingAfter = paymentsList.data[paymentsList.data.length - 1].id;
      }
    }
    
    // Filtrer les paiements RAC-
    const racPayments = allPayments.filter(payment => {
      const metadata = payment.metadata || {};
      const reference = metadata.referenceNumber || '';
      return reference.startsWith('RAC-');
    });
    
    console.log(`📥 ${racPayments.length} paiements RAC- trouvés dans Stripe`);
    
    let imported = 0;
    let updated = 0;
    
    for (const payment of racPayments) {
      const metadata = payment.metadata || {};
      
      // Données du paiement
      const paymentData = {
        payment_id: payment.id,
        reference_number: metadata.referenceNumber || '',
        amount: (payment.amount / 100).toString(),
        status: payment.status,
        method: 'card',
        customer_name: metadata.customerName || '',
        customer_email: metadata.customerEmail || '',
        card_brand: payment.charges?.data[0]?.payment_method_details?.card?.brand || '',
        card_last4: payment.charges?.data[0]?.payment_method_details?.card?.last4 || '',
        card_exp_month: payment.charges?.data[0]?.payment_method_details?.card?.exp_month || null,
        card_exp_year: payment.charges?.data[0]?.payment_method_details?.card?.exp_year || null,
        billing_name: payment.charges?.data[0]?.billing_details?.name || '',
        metadata: JSON.stringify(metadata),
        created_at: new Date(payment.created * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Vérifier si le paiement existe déjà
      const existingQuery = 'SELECT id FROM payments WHERE payment_id = $1';
      const existingResult = await client.query(existingQuery, [payment.id]);
      
      if (existingResult.rows.length === 0) {
        // Insérer nouveau paiement
        const insertQuery = `
          INSERT INTO payments (
            payment_id, reference_number, amount, status, method,
            customer_name, customer_email, card_brand, card_last4,
            card_exp_month, card_exp_year, billing_name, metadata,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;
        
        await client.query(insertQuery, [
          paymentData.payment_id,
          paymentData.reference_number,
          paymentData.amount,
          paymentData.status,
          paymentData.method,
          paymentData.customer_name,
          paymentData.customer_email,
          paymentData.card_brand,
          paymentData.card_last4,
          paymentData.card_exp_month,
          paymentData.card_exp_year,
          paymentData.billing_name,
          paymentData.metadata,
          paymentData.created_at,
          paymentData.updated_at
        ]);
        
        imported++;
        console.log(`✅ Importé: ${paymentData.reference_number} - ${paymentData.amount}€`);
      } else {
        // Mettre à jour paiement existant
        const updateQuery = `
          UPDATE payments 
          SET status = $1, updated_at = $2 
          WHERE payment_id = $3
        `;
        
        await client.query(updateQuery, [
          paymentData.status,
          paymentData.updated_at,
          payment.id
        ]);
        updated++;
      }
    }
    
    console.log(`\n📊 SYNCHRONISATION TERMINÉE:`);
    console.log(`- ${imported} nouveaux paiements importés`);
    console.log(`- ${updated} paiements mis à jour`);
    
    // Vérifier les totaux par jour
    const verificationQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CAST(amount AS DECIMAL)) as total
      FROM payments 
      WHERE reference_number LIKE 'RAC-%'
        AND created_at >= '2025-06-01'
        AND created_at <= '2025-06-06'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const verificationResult = await client.query(verificationQuery);
    
    console.log(`\n🔍 VÉRIFICATION PAR JOUR:`);
    verificationResult.rows.forEach(row => {
      const label = row.date === '2025-06-05' ? 'AUJOURD\'HUI' : 
                   row.date === '2025-06-04' ? 'HIER' : row.date;
      console.log(`${label}: ${row.count} paiements - ${parseFloat(row.total).toFixed(2)}€`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

syncStripeDirectly()
  .then(() => console.log('\n✅ Synchronisation terminée'))
  .catch(console.error);