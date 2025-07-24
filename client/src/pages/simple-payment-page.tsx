import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HomeIcon, CreditCard, CheckCircle, Download, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import Layout from '@/components/layout';
import SimpleCheckoutForm from '@/components/payment/simple-checkout-form';

// S'assurer que le chargement de Stripe se produit une seule fois
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'invalid_reference';

export default function SimplePaymentPage() {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  
  // Initialiser le composant avec la référence de l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference');
    
    if (!ref) {
      setPaymentStatus('invalid_reference');
      setErrorMessage("Aucune référence de demande n'a été fournie.");
      return;
    }
    
    setReferenceNumber(ref);
    
    // Vérifier que la référence existe
    const validateReference = async () => {
      try {
        const response = await fetch(`/api/service-requests/${ref}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Réponse invalide:', response.status, data);
          setPaymentStatus('invalid_reference');
          setErrorMessage(data.message || "Cette référence de demande n'existe pas dans notre système.");
          return;
        }
        
        setServiceRequest(data);
        
        // Si la demande existe, créer l'intent de paiement
        createPaymentIntent(ref);
      } catch (error) {
        console.error('Erreur lors de la validation de la référence:', error);
        setPaymentStatus('invalid_reference');
        setErrorMessage("Impossible de vérifier cette référence. Veuillez réessayer ultérieurement.");
      }
    };
    
    validateReference();
  }, []);
  
  // Créer un PaymentIntent
  const createPaymentIntent = async (reference: string) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amount: 129.80 }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création du paiement');
      }
      
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Erreur lors de la création du PaymentIntent:', error);
      setErrorMessage('Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.');
      setPaymentStatus('failed');
    }
  };
  
  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentId(paymentIntentId);
    setPaymentStatus('succeeded');
    toast({
      title: "Paiement accepté",
      description: "Votre paiement a été traité avec succès.",
    });
  };
  
  const handlePaymentProcessing = () => {
    setPaymentStatus('processing');
  };
  
  const handlePaymentError = (errorMsg: string) => {
    setPaymentStatus('failed');
    setErrorMessage(errorMsg);
    toast({
      title: "Paiement refusé",
      description: errorMsg,
      variant: "destructive",
    });
  };
  
  const handleHomeClick = () => {
    window.location.href = '/';
  };
  
  const handleRetryClick = () => {
    // Réinitialiser l'état pour permettre une nouvelle tentative
    setPaymentStatus('idle');
    setErrorMessage(null);
    // Recréer l'intent de paiement
    if (referenceNumber) {
      createPaymentIntent(referenceNumber);
    }
  };
  
  const handleDownloadCertificate = async () => {
    if (!referenceNumber || !paymentId) return;
    
    try {
      // Rediriger vers l'URL du certificat
      window.open(`/api/certificates/${referenceNumber}`, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement du certificat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le certificat pour le moment.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonne de gauche avec le formulaire de paiement */}
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>
                      {paymentStatus === 'succeeded' ? 'Paiement confirmé' :
                       paymentStatus === 'processing' ? 'Traitement en cours' :
                       paymentStatus === 'failed' ? 'Paiement refusé' :
                       paymentStatus === 'invalid_reference' ? 'Référence invalide' :
                       'Paiement sécurisé'}
                    </CardTitle>
                    <CardDescription>
                      {referenceNumber || 'Référence non disponible'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Formulaire de paiement Stripe (affiché uniquement si idle) */}
                {paymentStatus === 'idle' && clientSecret && (
                  <div className="py-4">
                    <p className="text-sm text-gray-600 mb-6">Veuillez saisir les informations de votre carte bancaire pour effectuer le paiement de 129,80€ TTC.</p>
                    
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <SimpleCheckoutForm 
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onProcessing={handlePaymentProcessing}
                        referenceNumber={referenceNumber || ''}
                        clientSecret={clientSecret}
                      />
                    </Elements>
                  </div>
                )}
                
                {/* Affichage en attente de chargement */}
                {paymentStatus === 'idle' && !clientSecret && !errorMessage && (
                  <div className="py-8 flex justify-center">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
                      <p className="text-gray-600">Initialisation du service de paiement...</p>
                    </div>
                  </div>
                )}
                
                {/* Affichage pendant le traitement du paiement */}
                {paymentStatus === 'processing' && (
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Traitement en cours</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Le paiement est en cours de traitement par notre système. Veuillez patienter...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Affichage après paiement réussi */}
                {paymentStatus === 'succeeded' && (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-md border border-green-100">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800">Paiement accepté</h4>
                          <p className="text-green-700 text-sm mt-1">
                            Votre paiement de 129,80€ a été traité avec succès. Votre demande est maintenant en cours de traitement.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {serviceRequest && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-3">Détails de votre demande</h4>
                        <dl className="grid grid-cols-2 gap-y-2 text-sm">
                          <dt className="text-gray-500">Nom</dt>
                          <dd>{serviceRequest.clientName}</dd>
                          
                          <dt className="text-gray-500">Email</dt>
                          <dd>{serviceRequest.clientEmail}</dd>
                          
                          <dt className="text-gray-500">Type de service</dt>
                          <dd>{serviceRequest.serviceType}</dd>
                          
                          <dt className="text-gray-500">Date de soumission</dt>
                          <dd>{new Date(serviceRequest.submissionDate).toLocaleDateString()}</dd>
                        </dl>
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <ShieldCheck className="h-4 w-4 text-blue-500 mr-1" />
                        <span>Prochaines étapes</span>
                      </h4>
                      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        <li>Un email de confirmation vous a été envoyé</li>
                        <li>Notre équipe traitera votre demande sous 48h</li>
                        <li>Vous serez contacté pour planifier un rendez-vous</li>
                      </ol>
                    </div>
                  </div>
                )}
                
                {/* Affichage après paiement échoué */}
                {paymentStatus === 'failed' && (
                  <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-md border border-red-100">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Paiement refusé</h4>
                          <p className="text-red-700 text-sm mt-1">
                            {errorMessage || "Nous n'avons pas pu traiter votre paiement."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">Suggestions</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Vérifiez les informations de votre carte</li>
                        <li>Assurez-vous que votre carte n'est pas expirée</li>
                        <li>Vérifiez que votre compte dispose de fonds suffisants</li>
                        <li>Essayez une autre méthode de paiement</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Affichage après référence invalide */}
                {paymentStatus === 'invalid_reference' && (
                  <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-md border border-red-100">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Référence invalide</h4>
                          <p className="text-red-700 text-sm mt-1">
                            {errorMessage || "La référence fournie n'est pas valide ou n'existe pas dans notre système."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">Suggestions</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Vérifiez que vous avez correctement saisi la référence</li>
                        <li>Assurez-vous que le lien que vous avez suivi est correct</li>
                        <li>Si vous avez reçu ce lien par email, vérifiez que vous avez cliqué sur le bon lien</li>
                        <li>Contactez notre service client si le problème persiste</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between items-center">
                {/* Boutons spécifiques pour chaque état */}
                {paymentStatus === 'succeeded' && (
                  <div className="flex space-x-4 w-full">
                    <Button variant="outline" className="w-1/2" onClick={handleHomeClick}>
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Retour à l'accueil
                    </Button>
                    <Button className="w-1/2" onClick={handleDownloadCertificate}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le certificat
                    </Button>
                  </div>
                )}
                
                {paymentStatus === 'failed' && (
                  <div className="flex space-x-4 w-full">
                    <Button variant="outline" className="w-1/2" onClick={handleHomeClick}>
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Retour à l'accueil
                    </Button>
                    <Button className="w-1/2" onClick={handleRetryClick}>
                      Réessayer
                    </Button>
                  </div>
                )}
                
                {paymentStatus === 'invalid_reference' && (
                  <Button className="w-full" onClick={handleHomeClick}>
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          {/* Colonne de droite avec récapitulatif et informations rassurantes */}
          <div className="w-full md:w-1/3 space-y-6">
            {serviceRequest && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Demande</h3>
                      <p className="text-base font-semibold">{serviceRequest.serviceType || "Raccordement électrique"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                      <p className="text-base">
                        {serviceRequest.address}, {serviceRequest.postalCode} {serviceRequest.city}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Montant à payer</h3>
                      <p className="text-lg font-bold text-blue-700">129,80€ TTC</p>
                      <p className="text-xs text-gray-500">Dont TVA (20%): 21,63€</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Votre sécurité est notre priorité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="mr-3 bg-blue-50 p-2 rounded-full">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Paiement sécurisé</h3>
                      <p className="text-xs text-gray-500">Toutes vos données sont chiffrées et sécurisées.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-3 bg-blue-50 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">48h de traitement</h3>
                      <p className="text-xs text-gray-500">Prise en charge de votre demande sous 48h ouvrées.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-3 bg-blue-50 p-2 rounded-full">
                      <Download className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Certificat de paiement</h3>
                      <p className="text-xs text-gray-500">Un certificat vous sera délivré après paiement.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}