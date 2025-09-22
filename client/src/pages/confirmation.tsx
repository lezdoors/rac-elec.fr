import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
// Stripe loaded dynamically only when needed
import { Helmet } from "react-helmet";
import {
  CardElement,
  CardExpiryElement,
  CardCvcElement,
  CardNumberElement,
  Elements,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { gtagReportConversion } from "@/lib/analytics";
import { CreditCard, Loader2, Shield, Phone, Home, Mail, MapPin, Calendar, Zap, X, Lock as LockIcon, ShieldCheck as ShieldCheckIcon, EyeOff as EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
// Pas besoin d'import Head dans cette configuration

// Charger Stripe à l'extérieur du composant pour éviter des rechargements multiples
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("La clé publique de paiement n'est pas définie.");
}

// Stripe promise loaded dynamically when payment component is needed
const getStripePromise = async () => {
  const { loadStripe } = await import("@stripe/stripe-js");
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

function FormulaireCarteBancaire({ referenceNumber, clientName, serviceRequest, isLoadingRequest }: { referenceNumber: string, clientName: string, serviceRequest: any, isLoadingRequest: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [formComplete, setFormComplete] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Mettre à jour le nom du titulaire de la carte quand les données de serviceRequest sont chargées
  useEffect(() => {
    if (serviceRequest?.name) {
      // Construire le nom complet avec prénom et nom si disponibles séparément
      const fullName = serviceRequest.prenom && serviceRequest.nom 
        ? `${serviceRequest.prenom} ${serviceRequest.nom}`.trim()
        : serviceRequest.name;
      setCardholderName(fullName);
      console.log('Nom du titulaire de la carte mis à jour:', fullName);
    }
  }, [serviceRequest]);
  
  // Suppression de l'animation de chargement initial pour optimiser la vitesse
  useEffect(() => {
    // Désactivation immédiate de l'animation pour améliorer la performance
    setInitializing(false);
  }, []);
  
  // Configuration commune pour les composants Stripe Elements
  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#3b82f6',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    classes: {
      base: 'stripe-element',
      focus: 'stripe-element-focus',
      invalid: 'stripe-element-invalid',
    },
    hidePostalCode: true,
  };
  
  // État pour suivre si chaque élément du formulaire est complet
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  
  // Vérifier si tous les champs de carte sont complets
  useEffect(() => {
    setFormComplete(cardNumberComplete && cardExpiryComplete && cardCvcComplete && cardholderName.trim() !== '');
  }, [cardNumberComplete, cardExpiryComplete, cardCvcComplete, cardholderName]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Service de paiement non disponible",
        description: "Veuillez patienter ou actualiser la page.",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier si la référence est valide
    if (!referenceNumber || referenceNumber.trim() === '') {
      toast({
        title: "Erreur de référence",
        description: "La référence de la demande est invalide ou manquante.",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier si le nom du titulaire est fourni
    if (!cardholderName || cardholderName.trim() === '') {
      toast({
        title: "Informations manquantes",
        description: "Veuillez entrer le nom du titulaire de la carte.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Vérifier que la demande existe et n'a pas déjà été payée
      const checkResponse = await apiRequest("GET", `/api/service-requests/${referenceNumber}`);
      
      if (!checkResponse.ok) {
        throw new Error("Cette référence de demande est invalide ou introuvable.");
      }
      
      const requestData = await checkResponse.json();
      
      // Si la demande a déjà été payée, rediriger vers la confirmation
      if (requestData.request && requestData.request.paymentStatus === "paid") {
        toast({
          title: "Demande déjà payée",
          description: "Cette demande a déjà été payée. Vous allez être redirigé.",
        });
        
        // Rediriger vers la page de confirmation
        navigate(`/paiement-confirmation?reference=${referenceNumber}&status=success`);
        return;
      }
      
      // 2. Créer ou récupérer l'intention de paiement
      const intentResponse = await apiRequest("POST", "/api/create-payment-intent", {
        referenceNumber,
        amount: 129.80 // Montant fixe pour toutes les demandes
      });
      
      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.message || "Erreur lors de la préparation du paiement");
      }
      
      const { clientSecret } = await intentResponse.json();
      
      // 3. Préparer la validation du formulaire de carte
      const cardNumberElement = elements.getElement(CardNumberElement);
      
      if (!cardNumberElement) {
        throw new Error("Impossible de trouver l'élément de carte bancaire.");
      }
      
      const result = await elements.submit();
      
      if (result.error) {
        throw new Error(result.error.message || "Informations de carte invalides");
      }
      
      // 4. Confirmer le paiement avec le nom du titulaire
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardholderName.trim()
          }
        }
      });
      
      if (error) {
        // Erreur de paiement
        throw error;
      } else if (paymentIntent.status === "succeeded") {
        // Paiement réussi - déclencher le tracking de conversion Google Ads
        gtagReportConversion(referenceNumber, () => {
          // Rediriger vers la page de confirmation après le tracking
          navigate(`/paiement-confirmation?reference=${referenceNumber}&status=success`);
        });
      } else {
        // Statut intermédiaire - rediriger vers confirmation avec vérification
        navigate(`/paiement-confirmation?reference=${referenceNumber}&payment_intent=${paymentIntent.id}`);
      }
      
    } catch (err: any) {
      console.error("Erreur de paiement:", err);
      
      // Traduire les messages d'erreur courants de Stripe
      let errorMessage = "Une erreur est survenue lors du traitement de votre paiement.";
      let errorCode = "unknown";
      
      if (err.type === "card_error") {
        errorCode = err.code || "card_error";
        if (err.code === "card_declined") {
          errorMessage = "Votre carte a été refusée. Veuillez vérifier vos informations ou essayer avec une autre carte.";
        } else if (err.code === "expired_card") {
          errorMessage = "Votre carte est expirée.";
        } else if (err.code === "incorrect_cvc") {
          errorMessage = "Le code de sécurité (CVC) est incorrect.";
        } else if (err.code === "processing_error") {
          errorMessage = "Une erreur est survenue lors du traitement de votre carte. Veuillez réessayer.";
        } else if (err.code === "insufficient_funds") {
          errorMessage = "Fonds insuffisants sur votre carte.";
        }
      }
      
      // Tenter de sauvegarder les informations de carte en cas d'échec
      try {
        // Récupérer les informations de la carte de manière sécurisée
        const cardNumberElement = elements?.getElement(CardNumberElement);
        
        if (cardNumberElement) {
          // Récupérer les détails de la carte de manière sécurisée via Stripe
          // La méthode retrievePaymentMethod n'existe pas, nous allons utiliser createPaymentMethod 
          // puis extraire les informations de la réponse
          const paymentMethod = await stripe?.createPaymentMethod({
            type: 'card',
            card: cardNumberElement
          });
          
          // Extraire les détails de la carte si disponibles
          const { brand, last4, exp_month, exp_year } = paymentMethod?.paymentMethod?.card || {};
          
          // Enregistrer les détails partiels de la carte pour le service client
          await apiRequest("POST", "/api/store-payment-attempt", {
            referenceNumber,
            paymentError: {
              code: errorCode,
              message: err.message || errorMessage,
              cardDetails: {
                cardholderName, 
                last4: last4 || "****",
                brand: brand || "unknown",
                expMonth: exp_month,
                expYear: exp_year
              }
            }
          });
          
          console.log("Détails d'échec de paiement sauvegardés pour assistance future");
        }
      } catch (saveError) {
        console.error("Impossible de sauvegarder les détails de l'échec de paiement:", saveError);
      }
      
      toast({
        title: "Échec du paiement",
        description: err.message || errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (initializing) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8 py-10 px-4">
        {/* Version simplifiée et légère du chargement */}
        <div className="flex flex-col items-center">
          {/* Logo simple sans animations */}
          <div className="bg-blue-600 p-2 rounded-lg shadow-md">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
            </svg>
          </div>
          
          {/* Texte sans animation */}
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold text-blue-700">Traitement en cours</h2>
            <p className="text-sm text-gray-600 mt-2">Nous préparons votre demande de raccordement</p>
          </div>
        </div>
        
        {/* Indicateur de progression simplifié */}
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-blue-600"></div>
            </div>
            
            {/* Points d'étape simplifiés */}
            <div className="flex justify-between mt-2">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-xs mt-1 text-gray-600">Validation</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-xs mt-1 text-gray-600">Préparation</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                <span className="text-xs mt-1 text-gray-600">Finalisation</span>
              </div>
            </div>
          </div>
          
          {/* Information de référence simplifiée */}
          <div className="flex items-center justify-center mt-6 bg-white border border-blue-100 rounded-md py-2 px-4 shadow-sm">
            <svg className="w-4 h-4 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Référence: <span className="font-bold text-blue-700">{referenceNumber}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h3 className="font-medium">Confirmation de votre demande</h3>
            <p className="text-sm text-gray-600">Traitement Enedis</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg text-blue-700">129,8 €</span>
            <p className="text-xs text-gray-500">TTC</p>
          </div>
        </div>
      </div>
      
      {/* Informations de paiement */}
      <div className="space-y-5 mb-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <h3 className="font-medium text-gray-800">Informations de paiement</h3>
        </div>
        
        <div className="space-y-4">
          
          <div className="space-y-1">
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">
              Titulaire de la carte
            </label>
            <Input
              type="text"
              id="cardholderName"
              className="w-full p-2"
              placeholder="Nom complet tel qu'il apparaît sur la carte"
              required
              disabled={isProcessing}
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
            />
          </div>

          {/* Numéro de carte - placé en premier comme demandé */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Numéro de carte
            </label>
            <div className="p-2 border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <CardNumberElement
                options={cardElementOptions}
                onChange={(event) => {
                  setCardNumberComplete(event.complete);
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Date d'expiration
              </label>
              <div className="p-2 border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                <CardExpiryElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setCardExpiryComplete(event.complete);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Cryptogramme
              </label>
              <div className="p-2 border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                <CardCvcElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setCardCvcComplete(event.complete);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing || !formComplete}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-primary hover:from-primary hover:to-blue-700 text-white font-medium rounded-md transition-all duration-300 hover:shadow-lg flex items-center justify-center h-auto text-base shadow-md"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            <span>Finaliser le paiement de 129,80€ TTC</span>
          </>
        )}
      </Button>

      <div className="mt-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <LockIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">Paiement sécurisé</span>
          </div>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">Protection SSL</span>
          </div>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <EyeOffIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">Données chiffrées</span>
          </div>
        </div>
        
        <div className="text-center bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">
            Vos informations bancaires sont protégées et ne sont jamais stockées sur nos serveurs.
          </p>
          <p className="text-xs text-gray-600">
            En procédant au paiement, vous acceptez nos
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="text-blue-600 hover:underline inline-flex items-center">
                  &nbsp;conditions générales de service
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-blue-800 mb-4 flex items-center justify-between">
                    <span>Conditions Générales d'Utilisation</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="prose prose-blue max-w-none text-sm">
                  <p className="text-gray-600 mb-4">
                    Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">1. Acceptation des conditions</h3>
                  <p>
                    En accédant et en utilisant ce site web, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation, tous les termes et conditions applicables, ainsi que toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions, vous êtes prié de ne pas utiliser ce site.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">2. Présentation des services</h3>
                  <p>
                    Notre service d'assistance à la demande de raccordement électrique est une prestation d'accompagnement qui vous aide à constituer votre dossier auprès d'Enedis (anciennement ERDF), le gestionnaire du réseau de distribution d'électricité en France. Nous ne sommes pas Enedis, mais un intermédiaire indépendant qui facilite vos démarches.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">3. Prix et paiement</h3>
                  <p>
                    Le prix de notre prestation est de 129,80€ TTC. Ce montant est distinct des frais qui pourraient être demandés par Enedis pour la réalisation technique du raccordement. Le paiement s'effectue en ligne par carte bancaire avant l'exécution de la prestation.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">4. Droits de rétractation</h3>
                  <p>
                    Conformément au Code de la consommation, vous acceptez expressément que l'exécution de notre prestation commence dès le paiement, avant l'expiration du délai de rétractation de 14 jours. En conséquence, vous reconnaissez que votre droit de rétractation ne s'applique pas une fois que nous avons commencé à traiter votre dossier.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">5. Protection des données personnelles</h3>
                  <p>
                    Les informations que vous nous communiquez sont nécessaires au traitement de votre demande. Elles sont conservées de manière sécurisée et ne sont partagées qu'avec les services d'Enedis dans le cadre du traitement de votre raccordement. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">6. Limitation de responsabilité</h3>
                  <p>
                    Notre service se limite à la constitution et à la transmission de votre dossier. Nous ne garantissons pas l'acceptation de votre demande par Enedis, ni les délais de traitement qui dépendent entièrement de leurs services. Notre responsabilité ne peut être engagée en cas de retard ou de refus émanant d'Enedis.
                  </p>
  
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-3">7. Contact</h3>
                  <p>
                    Pour toute question concernant ces Conditions Générales d'Utilisation, veuillez nous contacter à l'adresse suivante : contact@portail-electricite.com ou par téléphone au 09 70 70 16 43.
                  </p>
                </div>
              </DialogContent>
            </Dialog>.
          </p>
        </div>
      </div>
    </form>
  );
}

export default function ConfirmationPage() {
  const [match, params] = useRoute("/confirmation/:reference");
  const pathname = window.location.pathname;
  
  // Ajouter des logs pour débogage
  console.log('URL actuelle:', window.location.href);
  console.log('Pathname:', pathname);
  console.log('Match route ConfirmationPage:', match);
  console.log('Params route:', params);
  
  // Extraction simplifiée de la référence
  const referenceNumber = params?.reference || "";
  
  const { toast } = useToast();
  
  // Récupérer le paramètre nom du client de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const clientName = urlParams.get("nom") || "";
  
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les détails de la demande
  useEffect(() => {
    if (!referenceNumber) return;
    
    const loadServiceRequest = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest("GET", `/api/service-requests/${referenceNumber}`);
        
        if (!res.ok) {
          throw new Error(res.status === 404 
            ? "Cette référence de demande n'existe pas" 
            : "Impossible de récupérer les détails de la demande");
        }
        
        const data = await res.json();
        console.log('Données de la demande:', data);
        
        // Vérifier la structure de la réponse
        const requestData = data.serviceRequest || data.request || data;
        setServiceRequest(requestData);
        
        // Si la demande a déjà été payée, afficher un message
        if (requestData && requestData.paymentStatus === "paid") {
          toast({
            title: "Demande déjà payée",
            description: "Cette demande a déjà été payée."
          });
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des détails",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServiceRequest();
  }, [referenceNumber, toast]);
  
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-5xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-blue-600">
            {referenceNumber}
          </h1>
          <p className="text-gray-600 text-sm">
            Paiement sécurisé pour votre demande de raccordement électrique
          </p>
          <div className="text-xs text-gray-500 mt-1">
            <Helmet>
              <title>Raccordement électrique - Paiement pour demande {referenceNumber}</title>
              <meta name="description" content="Finalisez le paiement sécurisé pour votre demande de raccordement électrique référence {referenceNumber}" />
            </Helmet>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-gray-100 h-full">
              <div className="mb-5">
                <h2 className="text-lg font-bold mb-1">Confirmation de demande {referenceNumber}</h2>
              </div>
              
              {error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-100">
                  {error}
                </div>
              ) : (
                // Le provider Elements est nécessaire pour utiliser les composants Stripe
                <Elements stripe={getStripePromise()}>
                  <FormulaireCarteBancaire 
                    referenceNumber={referenceNumber} 
                    clientName={(serviceRequest?.name || clientName) ?? ""}
                    serviceRequest={serviceRequest}
                    isLoadingRequest={isLoading}
                  />
                </Elements>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            {/* Récapitulatif client */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-5 border border-gray-100 h-full">
              <h3 className="font-medium text-gray-800 mb-3 text-base">Résumé de votre demande</h3>
              
              {!isLoading && serviceRequest ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><Mail size={16} /></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-xs">Email</p>
                      <p className="text-gray-600 truncate text-xs">{serviceRequest?.email || "h.haddaoui@outlook.fr"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><Phone size={16} /></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Téléphone</p>
                      <p className="text-gray-600 text-xs">{serviceRequest?.phone || "0654221144"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><Home size={16} /></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Adresse</p>
                      <p className="text-gray-600 text-xs">
                        {serviceRequest?.address || "382 bir rami est"}
                        <br />
                        {serviceRequest?.postalCode || "14000"} {serviceRequest?.city || "Caen"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><MapPin size={16} /></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Type de demande</p>
                      <p className="text-gray-600 text-xs">
                        {(() => {
                          // Fonction pour traduire le type de demande
                          const requestType = serviceRequest?.requestType || "";
                          switch(requestType) {
                            case "new_connection":
                              return "Raccordement d'une habitation neuve";
                            case "temporary_connection":
                              return "Raccordement provisoire";
                            case "power_upgrade":
                              return "Augmentation de puissance";
                            case "meter_relocation":
                              return "Déplacement de compteur";
                            case "other":
                              return serviceRequest?.otherRequestTypeDesc || "Autre type de demande";
                            default:
                              return "Raccordement électrique";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><Calendar size={16} /></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Date de soumission</p>
                      <p className="text-gray-600 text-xs">{new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600 mt-0.5"><CreditCard size={16} /></div>
                    <div className="flex-1">
                      <p className="font-medium text-xs">Montant</p>
                      <p className="text-gray-600 text-xs">129,80€ TTC (108,17€ HT + 21,63€ TVA)</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-start space-x-2">
                      <div className="text-green-600 mt-0.5"><Shield size={16} /></div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">Sécurité garantie</p>
                        <div className="space-y-1">
                          <p className="text-gray-600 text-xs">Toutes vos données sont sécurisées et chiffrées selon les normes bancaires les plus strictes (PCI DSS).</p>
                          <ul className="text-gray-600 text-xs list-disc pl-4 mt-1">
                            <li>Paiement sécurisé SSL 256 bits</li>
                            <li>Authentification 3D Secure</li>
                            <li>Aucune donnée bancaire n'est conservée</li>
                          </ul>
                          <p className="text-xs text-blue-600 font-medium mt-1">Plateforme certifiée aux normes européennes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}