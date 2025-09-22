import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard } from "lucide-react";
// Stripe loaded dynamically only when needed
import { Elements } from "@stripe/react-stripe-js";
import CardCheckoutForm from "@/components/payment/card-checkout-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Charger Stripe avec la clé publique
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("La clé publique Stripe (VITE_STRIPE_PUBLIC_KEY) n'est pas définie");
}

// Stripe promise loaded dynamically when payment component is needed
const getStripePromise = async () => {
  const { loadStripe } = await import("@stripe/stripe-js");
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

export default function CardPaymentPage() {
  // Utiliser window.location.search au lieu de useLocation pour éviter les problèmes
  const searchParams = new URLSearchParams(window.location.search);
  const reference = searchParams.get("reference");
  
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceRequest, setServiceRequest] = useState<any>(null);

  useEffect(() => {
    async function fetchPaymentIntent() {
      if (!reference) {
        setError("Numéro de référence manquant");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les détails de la demande
        const serviceRequestResponse = await apiRequest(
          "GET",
          `/api/service-requests/${reference}`
        );
        const serviceRequestData = await serviceRequestResponse.json();

        if (!serviceRequestResponse.ok) {
          throw new Error(serviceRequestData.message || "Erreur lors de la récupération des détails de la demande");
        }

        setServiceRequest(serviceRequestData.request);

        // Créer ou récupérer le PaymentIntent
        const response = await apiRequest(
          "POST",
          "/api/create-payment-intent",
          { reference }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors de la création de l'intention de paiement");
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error instanceof Error ? error.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentIntent();
  }, [reference]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">Préparation du paiement...</h1>
        <p className="text-gray-500 mt-2">Veuillez patienter, nous préparons votre paiement sécurisé.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de préparer le paiement. Veuillez réessayer ultérieurement.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-2">Finaliser votre commande</h1>
            <p className="text-gray-500 text-center">Référence: {reference}</p>
          </div>
          
          <Elements stripe={getStripePromise()} options={{ clientSecret }}>
            <CardCheckoutForm 
              referenceNumber={reference || ""}
              clientSecret={clientSecret}
            />
          </Elements>
        </div>

        <div className="lg:w-96 bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
            Détails de la commande
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Client</h3>
              <p className="text-gray-600">{serviceRequest?.clientName}</p>
              <p className="text-gray-600">{serviceRequest?.clientEmail}</p>
              <p className="text-gray-600">{serviceRequest?.clientPhone}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">Adresse</h3>
              <p className="text-gray-600">{serviceRequest?.address}</p>
              <p className="text-gray-600">{serviceRequest?.postalCode} {serviceRequest?.city}</p>
            </div>

            <div className="border-t border-blue-200 pt-4">
              <h3 className="font-medium text-gray-700">Service</h3>
              <p className="text-gray-600">{serviceRequest?.serviceType}</p>
            </div>

            <div className="border-t border-blue-200 pt-4">
              <div className="flex justify-between font-medium">
                <span>Montant à payer</span>
                <span>129,80€ TTC</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">TVA incluse</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-100 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">Sécurité des paiements</h3>
            <p className="text-xs text-blue-700 mt-1">
              Toutes les transactions sont sécurisées et chiffrées. Les informations de paiement ne sont jamais stockées sur nos serveurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}