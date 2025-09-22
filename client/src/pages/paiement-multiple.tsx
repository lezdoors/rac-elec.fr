import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
// Stripe loaded dynamically only when needed
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, AlertTriangle, BadgeEuro } from "lucide-react";
import Layout from "@/components/layout";
import { apiRequest } from "@/lib/queryClient";

// Assurez-vous que la clé Stripe est configurée
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("La clé publique Stripe n'est pas configurée. Ajoutez VITE_STRIPE_PUBLIC_KEY aux variables d'environnement.");
}

// Initialisation du client Stripe
// Stripe promise loaded dynamically when payment component is needed
const getStripePromise = async () => {
  const { loadStripe } = await import("@stripe/stripe-js");
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

// Styles pour l'élément de carte
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Composant de formulaire de carte
const CheckoutForm = ({ reference, multiplier }: { reference: string, multiplier: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcul du montant en fonction du multiplicateur
  const baseAmount = 129.80;
  const amount = baseAmount * multiplier;
  const formattedAmount = amount.toFixed(2).replace('.', ',');

  useEffect(() => {
    // Récupérer les détails de la demande
    const fetchServiceRequest = async () => {
      try {
        const response = await apiRequest("GET", `/api/service-requests/${reference}`);
        
        if (!response.ok) {
          throw new Error("Impossible de récupérer les détails de la demande");
        }
        
        const data = await response.json();
        setServiceRequest(data.serviceRequest);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        setError("Impossible de récupérer les détails de cette demande");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceRequest();
  }, [reference]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe n'est pas encore chargé
      toast({
        title: "Service de paiement non disponible",
        description: "Veuillez réessayer ultérieurement",
        variant: "destructive",
      });
      return;
    }
    
    if (!cardholderName.trim()) {
      toast({
        title: "Nom du titulaire requis",
        description: "Veuillez saisir le nom du titulaire de la carte",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // 1. Créer une intention de paiement avec le montant calculé
      const intentResponse = await apiRequest("POST", "/api/create-payment-intent-multiple", {
        referenceNumber: reference,
        multiplier: multiplier,
        createOnly: true // Indique qu'il s'agit seulement de la création (pas encore de confirmation)
      });
      
      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.message || "Erreur lors de la préparation du paiement");
      }
      
      const { clientSecret } = await intentResponse.json();
      
      // 2. Confirmer le paiement avec le nom du titulaire
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
        // Paiement réussi - rediriger vers la page de confirmation avec les détails du paiement multiple
        navigate(`/paiement-confirmation?reference=${reference}&status=success&payment_intent=${paymentIntent.id}&multiplier=${multiplier}&amount=${amount.toFixed(2)}`);
      } else {
        // Statut intermédiaire - rediriger vers confirmation avec vérification
        navigate(`/paiement-confirmation?reference=${reference}&payment_intent=${paymentIntent.id}&multiplier=${multiplier}`);
      }
      
    } catch (err: any) {
      console.error("Erreur de paiement:", err);
      
      // Traduire les messages d'erreur courants de Stripe
      let errorMessage = "Une erreur est survenue lors du traitement de votre paiement.";
      
      if (err.type === 'card_error') {
        switch (err.code) {
          case 'card_declined':
            errorMessage = "Votre carte a été refusée. Veuillez utiliser une autre carte.";
            break;
          case 'expired_card':
            errorMessage = "Votre carte est expirée. Veuillez utiliser une autre carte.";
            break;
          case 'incorrect_cvc':
            errorMessage = "Le code de sécurité (CVC) de votre carte est incorrect.";
            break;
          case 'processing_error':
            errorMessage = "Une erreur est survenue lors du traitement de votre carte. Veuillez réessayer.";
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }
      
      toast({
        title: "Échec du paiement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Erreur lors du chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.href = "/admin/demandes"}>
          Retour aux demandes
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
        <div className="flex items-start">
          <BadgeEuro className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Paiement de votre demande</h3>
            <p className="text-sm text-blue-700 mt-1">
              Cette page permet de régler le montant de <strong>{formattedAmount}€</strong> pour la demande {reference}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholderName">Nom du titulaire de la carte</Label>
          <Input
            id="cardholderName"
            placeholder="Nom complet tel qu'il apparaît sur la carte"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="card-element">Carte bancaire</Label>
          <div className="mt-1 border rounded-md p-3">
            <CardElement
              id="card-element"
              options={cardElementOptions}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Référence</span>
          <span className="font-medium">{reference}</span>
        </div>
        {serviceRequest && (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Client</span>
              <span className="font-medium">{serviceRequest.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Type de demande</span>
              <span className="font-medium">
                {serviceRequest.requestType === 'new_connection' ? 'Nouveau raccordement' :
                 serviceRequest.requestType === 'power_upgrade' ? 'Augmentation de puissance' :
                 serviceRequest.requestType === 'temporary_connection' ? 'Raccordement provisoire' :
                 serviceRequest.requestType === 'relocation' ? 'Déplacement de compteur' :
                 'Autre'}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
          <span className="text-gray-700 font-medium">Total à payer</span>
          <span className="text-lg font-bold text-blue-700">{formattedAmount}€</span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full py-6 text-lg flex items-center justify-center gap-2"
        disabled={!stripe || isProcessing || !cardComplete}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Payer {formattedAmount}€
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p>Paiement sécurisé. Vos informations de carte sont cryptées.</p>
      </div>
    </form>
  );
};

// Composant principal
export default function PaiementMultiplePage() {
  const params = useParams<{ reference: string; multiplier: string }>();
  const reference = params.reference;
  const multiplier = parseInt(params.multiplier, 10);
  
  if (!reference || isNaN(multiplier) || multiplier < 1 || multiplier > 5) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Erreur de paramètre</CardTitle>
              <CardDescription>
                La référence ou le paramètre de quantité spécifié est invalide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Veuillez vérifier l'URL et réessayer. Le paramètre de quantité doit être entre 1 et 5.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.location.href = "/admin/demandes"}>
                Retour aux demandes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-10">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Paiement de votre demande
            </CardTitle>
            <CardDescription>
              Effectuez le paiement pour la demande {reference}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4 space-x-2 bg-green-50 p-3 rounded-lg border border-green-100">
              <Shield className="h-5 w-5 text-green-600" />
              <p className="text-green-800 text-sm">Vos données sont protégées par notre système de paiement sécurisé.</p>
            </div>
            <Elements stripe={getStripePromise()}>
              <CheckoutForm reference={reference} multiplier={multiplier} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}