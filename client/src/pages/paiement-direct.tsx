import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Loader2, Mail, Shield, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { ContactModal } from "@/components/contact-modal";

// Charger Stripe à l'extérieur du composant pour éviter des rechargements multiples
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("La clé publique Stripe (VITE_STRIPE_PUBLIC_KEY) n'est pas définie.");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function FormulaireCarteBancaire({ referenceNumber, clientName }: { referenceNumber: string, clientName: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState(clientName || "");
  const [formComplete, setFormComplete] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Animation de chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1500); // Affiche l'animation pendant 1.5 secondes
    
    return () => clearTimeout(timer);
  }, []);
  
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
      const result = await elements.submit();
      
      if (result.error) {
        throw new Error(result.error.message || "Informations de carte invalides");
      }
      
      // 4. Confirmer le paiement avec le nom du titulaire
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardholderName.trim()
          }
        }
      });
      
      if (error) {
        // Erreur de paiement
        throw error;
      } else if (paymentIntent.status === "succeeded") {
        // Paiement réussi - rediriger vers la page de confirmation
        navigate(`/paiement-confirmation?reference=${referenceNumber}&status=success`);
      } else {
        // Statut intermédiaire - rediriger vers confirmation avec vérification
        navigate(`/paiement-confirmation?reference=${referenceNumber}&payment_intent=${paymentIntent.id}`);
      }
      
    } catch (err: any) {
      console.error("Erreur de paiement:", err);
      
      // Traduire les messages d'erreur courants de Stripe
      let errorMessage = "Une erreur est survenue lors du traitement de votre paiement.";
      
      if (err.type === "card_error") {
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
      <div className="h-[400px] flex flex-col items-center justify-center space-y-8">
        <div className="relative w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-200 opacity-60"></div>
          <div className="text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        </div>
        <div className="w-64 h-3 bg-blue-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress-bar"></div>
        </div>
        <p className="text-gray-600 text-center">Référence: {referenceNumber}</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Frais d'étude de votre dossier</h3>
            <p className="text-sm text-gray-600">Traitement et accompagnement</p>
          </div>
          <div>
            <span className="font-bold text-lg text-blue-700">129,8 € TTC</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">
            Titulaire de la carte
          </label>
          <input
            type="text"
            id="cardholderName"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nom complet tel qu'il apparaît sur la carte"
            required
            disabled={isProcessing}
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Numéro de carte
          </label>
          <div className="p-3 border border-gray-300 rounded-md bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement
              options={{
                style: {
                  base: {
                    color: '#32325d',
                    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
                hidePostalCode: true,
              }}
              onChange={(event) => {
                setFormComplete(event.complete);
              }}
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing || !formComplete}
        className={`w-full py-6 text-base ${!formComplete ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Finaliser le paiement de 129,80€ TTC
          </>
        )}
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Paiement sécurisé. Vos informations bancaires sont chiffrées.
        </p>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Transaction sécurisée</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Données chiffrées</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Paiement vérifié</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function PaiementDirectPage() {
  const [, params] = useRoute("/paiement-direct/:reference");
  const referenceNumber = params?.reference || "";
  const { toast } = useToast();
  
  // Récupérer le paramètre nom du client de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const clientName = urlParams.get("nom") || "";
  
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
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
        setServiceRequest(data.serviceRequest);
        
        // Si la demande a déjà été payée, afficher un message
        if (data.serviceRequest && data.serviceRequest.paymentStatus === "paid") {
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
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-4 mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Paiement sécurisé</h1>
            <p className="text-gray-600">Référence : <span className="font-medium">{referenceNumber}</span></p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setContactModalOpen(true)} size="sm" className="mt-2">
                <Mail className="mr-2 h-4 w-4" />
                Besoin d'aide ? Contactez-nous
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 border border-gray-100">
            {error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-100">
                {error}
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <FormulaireCarteBancaire 
                  referenceNumber={referenceNumber} 
                  clientName={(serviceRequest?.name || clientName) ?? ""} 
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
      
      {/* Modale de contact */}
      <ContactModal
        defaultOpen={contactModalOpen}
        onOpenChange={setContactModalOpen}
        source="payment_page"
      />
    </Layout>
  );
}
