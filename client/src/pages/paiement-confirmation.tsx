import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle, Loader2, AlertCircle, Mail, Home, ShieldCheck, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout";
import { ContactModal } from "@/components/contact-modal";
import { GoogleSnippetsInitializer } from "@/components/google-snippets-initializer";
import { Helmet } from "react-helmet";
import BankingSecuritySection from "@/components/banking-security-section";
import { trackPurchase } from "@/lib/analytics";

export default function PaiementConfirmationPage() {
  const [, params] = useLocation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const referenceNumber = urlParams.get("reference");
  const status = urlParams.get("status");
  const paymentIntentId = urlParams.get("payment_intent");
  const multiplier = urlParams.get("multiplier");
  const urlAmount = urlParams.get("amount");
  
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing' | 'unknown'>(status === "success" ? "success" : "unknown");
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationCount, setVerificationCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  // Calculs pour les paiements multiples
  const isMultiplePayment = multiplier && parseInt(multiplier) > 1;
  const baseAmount = 129.80;
  const finalAmount = isMultiplePayment ? baseAmount * parseInt(multiplier) : (urlAmount ? parseFloat(urlAmount) : baseAmount);
  const formattedAmount = finalAmount.toFixed(2).replace('.', ',');
  
  // CENTRALIZED: Purchase conversion via analytics.ts (dedupe by reference)
  // Returns true if actually fired, false if already fired (dedupe)
  const firePurchaseConversion = (ref: string, amount: number = 129.80): boolean => {
    return trackPurchase(ref, amount);
  };

  // IMMEDIATE: If URL says success, fire conversion tag right away (don't wait for API)
  useEffect(() => {
    if (status === "success" && referenceNumber) {
      console.log("✅ URL indique paiement réussi - tag déclenché immédiatement");
      setPaymentStatus("success");
      firePurchaseConversion(referenceNumber, finalAmount);
      setIsVerifying(false);
    }
  }, [status, referenceNumber, finalAmount]);

  // 1. Vérifier le statut du paiement via API (ONLY if URL doesn't already say success)
  useEffect(() => {
    // Skip API check if URL already confirms success
    if (status === "success") {
      console.log("ℹ️ Statut succès confirmé par URL, pas besoin de vérifier via API");
      return;
    }
    
    if (!referenceNumber) return;
    
    const checkPaymentStatus = async () => {
      try {
        setIsVerifying(true);
        const res = await apiRequest("GET", `/api/payment-status/${referenceNumber}`);
        
        if (!res.ok) {
          throw new Error("Impossible de vérifier le statut du paiement");
        }
        
        const data = await res.json();
        console.log("Statut du paiement vérifié via API:", data);
        
        if (data.status === "paid" || data.status === "succeeded") {
          setPaymentStatus("success");
          console.log("Paiement CONFIRMÉ comme réussi par l'API");
          firePurchaseConversion(referenceNumber, finalAmount);
        } else if (data.status === "failed" || data.status === "canceled") {
          setPaymentStatus("failed");
          console.log("Paiement CONFIRMÉ comme échoué par l'API");
          if (data.errorDetails) {
            setErrorDetails(data.errorDetails);
          }
        } else if (data.status === "processing") {
          setPaymentStatus("processing");
          // Si le paiement est toujours en cours de traitement, réessayer après un délai
          if (verificationCount < 10) { // Limiter à 10 tentatives
            setTimeout(() => {
              setVerificationCount(prev => prev + 1);
            }, 2000);
          } else {
            setPaymentStatus("unknown");
          }
        } else {
          setPaymentStatus("unknown");
        }
        
      } catch (err) {
        console.error("Erreur lors de la vérification du paiement:", err);
        setPaymentStatus("unknown");
      } finally {
        setIsVerifying(false);
      }
    };
    
    checkPaymentStatus();
  }, [referenceNumber, verificationCount, status]);
  
  // 2. Récupérer les détails de la demande
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
  
  // 3. Si la redirection vient de Stripe avec un statut de succès, confirmer le paiement côté serveur
  useEffect(() => {
    if (status === "success" && referenceNumber && paymentIntentId) {
      const confirmPayment = async () => {
        try {
          await apiRequest("POST", `/api/payment-confirmed`, {
            referenceNumber,
            paymentIntentId
          });
          console.log("Confirmation serveur envoyée pour le paiement réussi");
        } catch (err) {
          console.error("Erreur lors de la confirmation au serveur:", err);
        }
      };
      
      confirmPayment();
    }
  }, [status, referenceNumber, paymentIntentId]);
  
  // Afficher un message d'erreur si pas de référence
  if (!referenceNumber) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-10">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Numéro de référence manquant. Impossible de vérifier votre paiement.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Fonction pour convertir les types de demande en libellés français
  const getRequestTypeLabel = (requestType: string): string => {
    switch (requestType) {
      case 'new_connection': return 'Nouveau raccordement';
      case 'power_upgrade': return 'Augmentation de puissance';
      case 'temporary_connection': return 'Raccordement temporaire';
      case 'meter_installation': return 'Installation de compteur';
      default: return requestType;
    }
  };
  
  // Rendu du statut de paiement
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8 animate-in fade-in-50 duration-500">
            <div className="relative inline-flex mx-auto mb-6">
              <div className="absolute -inset-3 rounded-full bg-green-200 animate-pulse opacity-30"></div>
              <CheckCircle2 className="h-16 w-16 text-green-600 relative" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Paiement réussi !</h2>
            <p className="text-lg text-green-700 mb-6">
              Votre paiement de <strong>{formattedAmount} € TTC</strong> a été traité avec succès.
              {isMultiplePayment && (
                <span className="block text-sm text-green-600 mt-1">
                  (Paiement multiple x{multiplier})
                </span>
              )}
              <br />Référence : {referenceNumber}
            </p>
            <p className="text-sm text-green-600 mb-6">
              Un email de confirmation vous sera envoyé dans les prochaines minutes.
            </p>
            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-4">Votre paiement a été traité de manière sécurisée.</p>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-2 rounded-full mb-2">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Transaction sécurisée</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-2 rounded-full mb-2">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Données chiffrées</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-2 rounded-full mb-2">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Paiement vérifié</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8 animate-in shake-x-3 duration-200">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-800 mb-4">Échec du paiement</h2>
            <p className="text-lg text-red-700 mb-6">
              Nous n'avons pas pu traiter votre paiement
            </p>
            
            {errorDetails && (
              <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
                <AlertTitle>Erreur de paiement</AlertTitle>
                <AlertDescription>
                  {errorDetails.message || errorDetails.code}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4 max-w-md mx-auto mb-6 text-left">
              <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Problème avec votre carte bancaire
              </h3>
              <ul className="text-sm text-amber-700 space-y-2 list-disc pl-5">
                <li>Vérifiez que le numéro de carte est correct</li>
                <li>Assurez-vous que la date d'expiration est valide</li>
                <li>Confirmez que vous avez bien saisi le code CVV au dos de votre carte</li>
                <li>Contactez votre banque pour vérifier si la transaction a été bloquée</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => navigate(`/paiement/${referenceNumber}`)}
              className="bg-blue-600 hover:bg-blue-700">
              Réessayer le paiement
            </Button>
          </div>
        );
      case 'processing':
        return (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Traitement en cours</h2>
            <p className="text-lg text-blue-700 mb-6">
              Veuillez patienter pendant que nous vérifions le statut de votre paiement. Cela peut prendre quelques instants...
            </p>
            <p className="text-sm text-blue-600">
              Référence : {referenceNumber}
            </p>
            <div className="w-full max-w-md mx-auto mt-6 bg-blue-100 rounded overflow-hidden">
              <div className="h-2 bg-blue-500 animate-pulse" style={{ width: `${Math.min(verificationCount * 10, 90)}%` }}></div>
            </div>
            <p className="text-xs text-blue-500 mt-2">Vérification en cours</p>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Statut du paiement indéterminé</h2>
            <p className="text-lg text-gray-600 mb-6">
              Nous n'avons pas pu déterminer avec certitude le statut de votre paiement.
            </p>
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-500">
                Si vous avez effectué un paiement, il est possible qu'il soit toujours en cours de traitement. Voici ce que vous pouvez faire :
              </p>
              <div className="bg-gray-100 p-4 rounded text-left max-w-md mx-auto">
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>Vérifiez votre boîte mail pour un reçu de paiement</li>
                  <li>Attendez quelques minutes et rafraîchissez cette page</li>
                  <li>Vérifiez que votre carte bancaire a été débitée</li>
                  <li>Si nécessaire, essayez de procéder à un nouveau paiement</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate(`/paiement/${referenceNumber}`)}>
                Réessayer le paiement
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline">
                Rafraîchir la page
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Layout>
      {/* Métadonnées SEO optimisées */}
      <Helmet>
        <title>Confirmation de Paiement | Raccordement Électrique Enedis</title>
        <meta name="description" content="Confirmation de votre paiement pour votre demande de raccordement électrique Enedis. Suivez le statut de votre demande et recevez des mises à jour en temps réel." />
        <meta name="keywords" content="confirmation paiement, raccordement enedis, suivi demande, branchement électrique, raccordement électrique, paiement raccordement" />
        <link rel="canonical" href="https://www.demande-raccordement.fr/paiement-confirmation" />
        
        {/* Balises Open Graph */}
        <meta property="og:title" content="Confirmation de Paiement | Raccordement Électrique Enedis" />
        <meta property="og:description" content="Confirmation du traitement de votre demande de raccordement électrique et de votre paiement. Suivez l'avancement de votre dossier en temps réel." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.demande-raccordement.fr/paiement-confirmation" />
        
        {/* Balisage Schema.org pour Order et Service */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Confirmation de Paiement pour Raccordement Électrique",
              "description": "Page de confirmation de paiement pour une demande de raccordement électrique Enedis",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Accueil",
                    "item": "https://www.demande-raccordement.fr/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Raccordement Électrique",
                    "item": "https://www.demande-raccordement.fr/raccordement-enedis"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Confirmation de Paiement",
                    "item": "https://www.demande-raccordement.fr/paiement-confirmation"
                  }
                ]
              },
              "mainEntity": {
                "@type": "Order",
                "orderStatus": "${paymentStatus === 'success' ? 'https://schema.org/OrderDelivered' : 'https://schema.org/OrderProcessing'}",
                "acceptedOffer": {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Service de Raccordement Électrique Enedis",
                    "description": "Traitement de demande de raccordement électrique auprès d'Enedis",
                    "provider": {
                      "@type": "Organization",
                      "name": "RaccordementElec",
                      "url": "https://demande-raccordement.fr"
                    }
                  },
                  "price": "${finalAmount}",
                  "priceCurrency": "EUR"
                },
                "paymentMethodId": "CreditCard",
                "confirmationNumber": "${referenceNumber || ''}"
              }
            }
          `}
        </script>
      </Helmet>
      
      {/* Initialisation des snippets Google pour la page de confirmation avec succès du paiement */}
      {paymentStatus === "success" && referenceNumber && (
        <GoogleSnippetsInitializer 
          page="/paiement-confirmation" 
          triggerEvent="load" 
          variables={{ reference: referenceNumber }}
        />
      )}
      
      <div className="container max-w-5xl mx-auto py-10">
        {/* Statut du paiement */}
        {renderPaymentStatus()}
        
        {/* Détails de la demande */}
        {(paymentStatus === 'success' && serviceRequest) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Que se passe-t-il maintenant ?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Dossier créé</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Votre demande sera traitée par notre équipe dans les 24-48 heures ouvrables
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">2. Traitement technique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Analyse technique et coordination avec Enedis pour votre raccordement
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">3. Planification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Nous vous contacterons pour fixer une date d'intervention
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Récapitulatif de votre demande</CardTitle>
                <CardDescription>
                  Référence: {referenceNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Informations personnelles</h3>
                    <div className="space-y-1 text-sm">
                      <p>{serviceRequest.firstName && serviceRequest.lastName 
                         ? `${serviceRequest.firstName} ${serviceRequest.lastName}` 
                         : serviceRequest.name}</p>
                      <p>{serviceRequest.email}</p>
                      <p>{serviceRequest.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Détails de la demande</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Type:</span> {getRequestTypeLabel(serviceRequest.requestType)}</p>
                      <p><span className="font-medium">Puissance:</span> {serviceRequest.powerRequired} kVA</p>
                      <p><span className="font-medium">Adresse:</span> {serviceRequest.address}, {serviceRequest.postalCode} {serviceRequest.city}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Date de création: {new Date(serviceRequest.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  Imprimer le récapitulatif
                </Button>
              </CardFooter>
            </Card>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  // Redirection vers la page de remerciement française avec suivi des conversions
                  const params = new URLSearchParams();
                  params.set('reference', referenceNumber || '');
                  params.set('amount', finalAmount.toString());
                  params.set('currency', 'EUR');
                  navigate(`/merci?${params.toString()}`);
                }} 
                className="mr-4"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Voir le récapitulatif complet
              </Button>
              
              <Button onClick={() => navigate("/")} variant="outline" className="mr-4">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
              
              <Button variant="outline" onClick={() => setContactModalOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Nous contacter
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Section d'informations de sécurité bancaire */}
      <BankingSecuritySection />
      
      {/* Modale de contact */}
      <ContactModal
        defaultOpen={contactModalOpen}
        onOpenChange={setContactModalOpen}
        source="payment_confirmation"
      />
    </Layout>
  );
}
