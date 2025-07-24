// index.js - Le fichier principal de votre application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_votrecléprivée');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Base de données en mémoire (dans un environnement de production, utilisez une vraie base de données)
const serviceRequests = {};
const payments = {};

// POINT CRITIQUE 1: Créer une demande de service AVANT le paiement
app.post('/api/create-service-request', (req, res) => {
  try {
    // Génération d'une référence unique
    const reference = `REF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Stockage des données de la demande
    serviceRequests[reference] = {
      ...req.body,
      reference,
      createdAt: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    console.log(`Demande créée: ${reference}`, serviceRequests[reference]);
    
    res.json({
      success: true,
      reference,
      request: serviceRequests[reference]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la demande'
    });
  }
});

// Obtenir les détails d'une demande
app.get('/api/service-requests/:reference', (req, res) => {
  const { reference } = req.params;
  
  console.log(`Recherche de la demande: ${reference}`);
  console.log('Demandes disponibles:', Object.keys(serviceRequests));
  
  if (!serviceRequests[reference]) {
    return res.status(404).json({
      success: false,
      message: 'Demande non trouvée'
    });
  }
  
  res.json({
    success: true,
    request: serviceRequests[reference]
  });
});

// POINT CRITIQUE 2: Créer une intention de paiement Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { reference, paymentMethodId, amount, currency = 'eur' } = req.body;
    
    console.log(`Traitement du paiement pour: ${reference}`, req.body);
    
    // VALIDATION: Vérifier si la référence existe
    if (!reference || !serviceRequests[reference]) {
      // Si la référence n'existe pas, la créer automatiquement
      if (!serviceRequests[reference]) {
        // Créer une demande pour éviter les erreurs
        const newReference = reference || `REF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        serviceRequests[newReference] = {
          amount: amount || 99.99,
          currency: currency || 'EUR',
          items: [{ name: "Service", price: amount || 99.99, quantity: 1 }],
          reference: newReference,
          createdAt: new Date().toISOString(),
          status: 'pending_payment',
          autoCreated: true
        };
        
        console.log(`Demande auto-créée: ${newReference}`, serviceRequests[newReference]);
        
        // Utiliser cette nouvelle référence
        req.body.reference = newReference;
      }
    }
    
    // Récupérer la référence (originale ou nouvellement créée)
    const finalReference = req.body.reference;
    
    try {
      // Créer une intention de paiement avec Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Conversion en centimes
        currency,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          reference: finalReference
        }
      });
      
      console.log(`PaymentIntent créé: ${paymentIntent.id}`, paymentIntent.status);
      
      // Enregistrer les détails du paiement
      payments[finalReference] = {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
        createdAt: new Date().toISOString()
      };
      
      // Mettre à jour le statut de la demande
      serviceRequests[finalReference].status = 
        paymentIntent.status === 'succeeded' ? 'paid' :
        paymentIntent.status === 'requires_action' ? 'pending_authentication' : 
        'payment_processing';
      
      serviceRequests[finalReference].paymentIntentId = paymentIntent.id;
      
      res.json({
        success: true,
        status: paymentIntent.status,
        reference: finalReference,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requiresAction: paymentIntent.status === 'requires_action'
      });
    } catch (stripeError) {
      console.error('Erreur Stripe:', stripeError);
      
      // Formater l'erreur pour l'utilisateur
      let errorMessage = 'Une erreur est survenue lors du traitement du paiement.';
      
      if (stripeError.type === 'StripeCardError') {
        switch(stripeError.code) {
          case 'card_declined':
            errorMessage = 'Votre carte a été refusée.';
            break;
          case 'expired_card':
            errorMessage = 'Votre carte est expirée.';
            break;
          case 'incorrect_cvc':
            errorMessage = 'Le code de sécurité (CVC) est incorrect.';
            break;
          case 'processing_error':
            errorMessage = 'Une erreur est survenue lors du traitement de votre carte.';
            break;
          case 'incorrect_number':
            errorMessage = 'Le numéro de carte est invalide.';
            break;
          default:
            errorMessage = stripeError.message || errorMessage;
        }
      }
      
      // Marquer la demande comme échouée
      if (serviceRequests[finalReference]) {
        serviceRequests[finalReference].status = 'payment_failed';
        serviceRequests[finalReference].errorMessage = errorMessage;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        reference: finalReference
      });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du traitement de la demande de paiement'
    });
  }
});

// POINT CRITIQUE 3: Vérifier le statut d'un paiement
app.get('/api/payment-status/:reference', (req, res) => {
  const { reference } = req.params;
  
  console.log(`Vérification du statut pour: ${reference}`);
  console.log('Paiements disponibles:', Object.keys(payments));
  
  if (!payments[reference]) {
    return res.status(404).json({
      success: false,
      message: 'Demande non trouvée avec cette référence'
    });
  }
  
  res.json({
    success: true,
    payment: payments[reference]
  });
});

// POINT CRITIQUE 4: Compléter un paiement après 3D Secure
app.post('/api/complete-payment', async (req, res) => {
  try {
    const { paymentIntentId, reference } = req.body;
    
    console.log(`Complétion du paiement: ${paymentIntentId}, ref: ${reference}`);
    
    // Vérification de la référence
    if (!reference || (!payments[reference] && !paymentIntentId)) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }
    
    // Si pas de paymentIntentId mais une référence, chercher dans les payments
    const finalPaymentIntentId = paymentIntentId || (payments[reference] ? payments[reference].paymentIntentId : null);
    
    if (!finalPaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de paiement manquant'
      });
    }
    
    // Récupérer les informations à jour depuis Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(finalPaymentIntentId);
      console.log(`PaymentIntent récupéré: ${paymentIntent.id}`, paymentIntent.status);
      
      // Si la référence existe dans les payments, mettre à jour
      if (payments[reference]) {
        payments[reference].status = paymentIntent.status;
        payments[reference].lastUpdated = new Date().toISOString();
      } else if (paymentIntent.metadata && paymentIntent.metadata.reference) {
        // Créer l'entrée si elle n'existe pas
        const stripeReference = paymentIntent.metadata.reference;
        
        payments[stripeReference] = {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          createdAt: new Date().toISOString(),
          recoveredFromStripe: true
        };
        
        console.log(`Paiement récupéré depuis Stripe: ${stripeReference}`);
      }
      
      // Mettre à jour la demande de service si elle existe
      const paymentReference = reference || (paymentIntent.metadata ? paymentIntent.metadata.reference : null);
      
      if (paymentReference && serviceRequests[paymentReference]) {
        serviceRequests[paymentReference].status = 
          paymentIntent.status === 'succeeded' ? 'paid' : 
          paymentIntent.status === 'requires_action' ? 'pending_authentication' : 
          'payment_processing';
      }
      
      res.json({
        success: true,
        status: paymentIntent.status,
        reference: paymentReference
      });
    } catch (stripeError) {
      console.error('Erreur Stripe lors de la récupération:', stripeError);
      res.status(400).json({
        success: false,
        message: 'Erreur lors de la récupération des informations de paiement',
        error: stripeError.message
      });
    }
  } catch (error) {
    console.error('Erreur serveur lors de la complétion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la complétion du paiement'
    });
  }
});

// ROUTES DES PAGES

// Servir la page principale (formulaire du service)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Servir la page de paiement
app.get('/payment/:reference', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Servir la page de confirmation
app.get('/confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

// Endpoint de debug (à supprimer en production)
app.get('/debug/requests', (req, res) => {
  res.json({
    requests: serviceRequests,
    payments: payments
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
