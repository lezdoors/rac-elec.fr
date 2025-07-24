/**
 * Optimiseur spécifique pour Stripe.js
 * 
 * Ce script optimise le chargement de Stripe.js, identifié dans PageSpeed
 * comme une ressource JavaScript pouvant être retardée
 */
(function() {
  // Fonction pour détecter les scripts Stripe
  function optimizeStripeLoading() {
    // Rechercher tous les scripts qui contiennent "stripe" dans leur URL
    document.querySelectorAll('script[src*="stripe"]').forEach(script => {
      if (script.hasAttribute('data-stripe-optimized')) return;
      
      // Vérifier si ce script n'est pas déjà différé ou asynchrone
      if (!script.defer && !script.async) {
        try {
          // Sauvegarder l'URL d'origine
          const originalSrc = script.src;
          
          // Créer un nouveau script optimisé
          const optimizedScript = document.createElement('script');
          optimizedScript.src = originalSrc;
          optimizedScript.defer = true;
          optimizedScript.setAttribute('data-stripe-optimized', 'true');
          
          // Remplacer l'ancien script par le nouveau
          if (script.parentNode) {
            script.parentNode.replaceChild(optimizedScript, script);
            console.debug('Stripe script optimisé:', originalSrc);
          }
        } catch (e) {
          console.warn('Erreur non critique lors de l\'optimisation de Stripe:', e);
        }
      }
    });
    
    // Créer une fonction de remplacement pour Stripe qui chargera Stripe à la demande
    if (typeof window.Stripe === 'undefined') {
      let stripeLoaded = false;
      let pendingCallbacks = [];
      
      // Créer un objet Stripe temporaire
      window.Stripe = function(publishableKey) {
        if (!stripeLoaded) {
          // Charger Stripe.js dynamiquement seulement quand il est réellement utilisé
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = function() {
            // Quand Stripe est chargé, remplacer notre fonction temporaire par la vraie
            stripeLoaded = true;
            // Récupérer l'instance réelle de Stripe
            const realStripe = window.Stripe;
            // Initialiser Stripe avec la clé fournie
            const stripeInstance = realStripe(publishableKey);
            // Traiter tous les callbacks en attente
            pendingCallbacks.forEach(callback => callback(stripeInstance));
            pendingCallbacks = [];
          };
          document.head.appendChild(script);
          
          // Retourner un objet qui met en file d'attente les appels jusqu'à ce que Stripe soit chargé
          return new Proxy({}, {
            get: function(target, prop) {
              return function(...args) {
                return new Promise(resolve => {
                  pendingCallbacks.push(stripeInstance => {
                    const method = stripeInstance[prop];
                    if (typeof method === 'function') {
                      resolve(method.apply(stripeInstance, args));
                    }
                  });
                });
              };
            }
          });
        }
      };
    }
  }
  
  // Exécuter lorsque le DOM est complètement chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeStripeLoading);
  } else {
    optimizeStripeLoading();
  }
})();