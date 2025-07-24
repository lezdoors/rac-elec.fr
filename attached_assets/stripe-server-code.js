// Ce code doit être ajouté à votre serveur Node.js sur Replit
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_votrecléprivée'); // Remplacez par votre clé privée Stripe

const app = express();

// Middleware pour parser le JSON
app.use(bodyParser.json());
app.use(express.static('public')); // Pour servir votre page HTML

// Route pour créer une intention de paiement
app.post('/create-payment-intent', async (req, res) => {
  try {
    // Récupérer les informations du formulaire de commande
    const { amount, currency, paymentMethodId, description } = req.body;
    
    // Vérifier les données requises
    if (!amount || !currency || !paymentMethodId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Informations de paiement incomplètes' 
      });
    }

    // Créer un client (optionnel mais recommandé pour une meilleure gestion)
    const customer = await stripe.customers.create();
    
    // Attacher la méthode de paiement au client
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    
    // Créer l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: currency,
      customer: customer.id,
      payment_method: paymentMethodId,
      description: description || 'Commande en ligne',
      confirm: true, // Confirmer immédiatement
      return_url: `${req.protocol}://${req.get('host')}/confirmation`,
    });
    
    // Vérifier le statut du paiement
    if (paymentIntent.status === 'succeeded') {
      // Générer une référence unique
      const referenceNumber = 'REF-' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      // Enregistrer la commande dans votre base de données ici avec le referenceNumber
      
      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        referenceNumber: referenceNumber
      });
    } else if (paymentIntent.status === 'requires_action') {
      // 3D Secure ou autre action requise
      return res.json({
        success: true,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } else {
      // Paiement échoué
      return res.json({
        success: false,
        error: 'Le paiement a échoué.',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Erreur Stripe:', error);
    
    // Formater le message d'erreur pour l'utilisateur
    let errorMessage = 'Une erreur est survenue lors du traitement du paiement.';
    
    // Gérer les erreurs spécifiques de Stripe
    if (error.type === 'StripeCardError') {
      // Erreurs liées à la carte
      switch(error.code) {
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
          errorMessage = error.message || errorMessage;
      }
    }
    
    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

// Route pour vérifier le statut d'un paiement
app.get('/check-payment/:paymentIntentId', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.params.paymentIntentId
    );
    
    res.json({
      success: true,
      status: paymentIntent.status
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Impossible de vérifier le statut du paiement.'
    });
  }
});

// Route pour la page de confirmation
app.get('/confirmation', (req, res) => {
  // Ici, vous afficheriez votre page de confirmation HTML
  // avec les détails basés sur les paramètres d'URL (comme la référence)
  res.sendFile(__dirname + '/public/confirmation.html');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
