import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Download, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function PaymentConfirmationPage() {
  const [location] = useLocation();
  const [status, setStatus] = useState<"success" | "pending" | "failed">("pending");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [verificationCount, setVerificationCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [shouldStopChecking, setShouldStopChecking] = useState(false);
  
  // Extraire les paramètres de l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    const paymentStatus = params.get("status") || "pending";
    
    // Si aucune référence n'est présente, essayer de récupérer depuis le localStorage
    const savedRef = !ref ? localStorage.getItem("payment_reference") : null;
    const referenceToUse = ref || savedRef;
    
    console.log("Référence dans les params:", ref);
    console.log("Référence sauvegardée:", savedRef);
    console.log("Référence à utiliser:", referenceToUse);
    
    // Si nous n'avons pas de référence, ne rien faire
    if (!referenceToUse) {
      console.error("Aucune référence de paiement trouvée");
      setReferenceNumber(null);
      return;
    }
    
    // Définir la référence pour affichage et requêtes
    setReferenceNumber(referenceToUse);
    
    // Mettre l'état en attente pendant la vérification
    setStatus("pending");
    
    // Interroger l'API pour obtenir le statut réel du paiement
    console.log("Vérification du statut du paiement pour la référence:", referenceToUse);
    
    apiRequest("GET", `/api/payment-status/${referenceToUse}`)
      .then(res => {
        if (!res.ok) {
          console.error("Erreur de réponse API:", res.status, res.statusText);
          throw new Error("Erreur lors de la vérification du statut du paiement");
        }
        return res.json();
      })
      .then(data => {
        console.log("Statut du paiement vérifié:", data);
        
        // Vérifier que la réponse est valide et contient le statut attendu
        if (!data.success) {
          console.error("Réponse de vérification invalide:", data);
          throw new Error("Impossible de vérifier le statut du paiement");
        }
        
        // Log détaillé des informations Stripe complètes
        console.log("Détails du statut Stripe:", {
          status: data.status,
          stripeStatus: data.stripeStatus || 'non fourni',
          paymentId: data.paymentId || 'non fourni'
        });
        
        // Analyse rigoureuse du statut
        if (data.status === "paid" || data.status === "succeeded") {
          console.log("Paiement CONFIRMÉ comme réussi");
          setStatus("success");
        } else if (data.status === "failed" || data.status === "canceled") {
          console.log("Paiement CONFIRMÉ comme échoué");
          // Rediriger IMMÉDIATEMENT vers la page d'échec si le paiement a échoué
          window.location.href = `/payment-failure?reference=${referenceToUse}&error=${encodeURIComponent("Le paiement a été rejeté par votre banque.")}`;                       
        } else {
          console.log("Paiement toujours en attente");
          setStatus("pending");
        }
      })
      .catch(err => {
        console.error("Erreur lors de la vérification du statut du paiement:", err);
        // En cas d'erreur de vérification, on considère que le statut est en attente
        setStatus("pending");
      });
  }, [location]);
  
  // Fonction pour vérifier en temps réel le statut de paiement via l'API avancée
  async function checkPaymentStatus(reference: string, paymentIntent?: string) {
    try {
      console.log(`Vérification avancée pour ${reference}`, paymentIntent ? `avec PaymentIntent: ${paymentIntent}` : 'sans PaymentIntent');
      
      // Incrémenter le compteur de vérifications
      setVerificationCount(prev => prev + 1);
      
      const startTime = Date.now();
      
      const res = await apiRequest('POST', '/api/check-payment-status', {
        referenceNumber: reference,
        paymentIntentId: paymentIntent
      });
      
      // Mesurer le temps de réponse
      const responseTime = Date.now() - startTime;
      setLastResponseTime(responseTime);
      
      // Gérer l'erreur 404 de manière spéciale pour éviter les erreurs consoles
      if (res.status === 404) {
        console.warn('Référence de demande introuvable, arrêt des vérifications');
        setStatus('failed');
        setErrorDetails({
          message: "Cette référence de demande n'existe pas dans notre système.",
          code: "reference_not_found"
        });
        // Arrêter les vérifications ultérieures
        setShouldStopChecking(true);
        return { stop: true };
      }
      
      if (!res.ok) {
        console.error('Erreur lors de la vérification avancée:', res.status, res.statusText);
        // Continuer les vérifications même en cas d'erreur temporaire
        return null;
      }
      
      const data = await res.json();
      console.log('Résultat de la vérification avancée:', data);
      
      // Stocker les détails d'erreur s'ils existent
      if (data.hasError && data.errorDetails) {
        setErrorDetails(data.errorDetails);
      }
      
      // Si le paiement est confirmé comme réussi
      if (data.status === 'paid' || data.status === 'succeeded') {
        setStatus('success');
      } 
      // Si le paiement a échoué définitivement
      else if (data.status === 'failed' || data.status === 'canceled') {
        setStatus('failed');
        
        // Ne pas rediriger immédiatement, mais permettre à l'utilisateur de voir l'erreur détaillée
        if (!errorDetails && data.errorDetails) {
          setErrorDetails(data.errorDetails);
        }
      }
      // Si le paiement est toujours en cours de traitement
      else {
        setStatus('pending');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification avancée du paiement:', error);
      return null;
    }
  }
  
  
  // Effet pour vérifier périodiquement le statut du paiement
  useEffect(() => {
    // On ne lance pas de vérification si :
    // - Pas de référence
    // - Paiement déjà confirmé comme réussi
    // - Arrêt des vérifications demandé (pour les références invalides)
    if (!referenceNumber || status === 'success' || shouldStopChecking) return;
    
    let isActive = true; // Flag pour éviter les mises à jour après démontage
    
    // Fonction de vérification
    const runCheck = async () => {
      if (!isActive) return;
      
      const result = await checkPaymentStatus(referenceNumber);
      
      // Si on reçoit un signal d'arrêt, on arrête les vérifications
      if (result && typeof result === 'object' && 'stop' in result && result.stop === true) {
        if (isActive) setShouldStopChecking(true);
      }
    };
    
    // Première vérification immédiate
    runCheck();
    
    // Puis vérifier toutes les 3 secondes si toujours en attente
    const intervalId = setInterval(() => {
      // Vérifier que le statut est toujours en attente et qu'on ne devrait pas arrêter
      if (status !== 'pending' || shouldStopChecking) {
        clearInterval(intervalId);
        return;
      }
      
      runCheck();
    }, 3000);
    
    // Nettoyer l'intervalle et désactiver les vérifications lorsque le composant est démonté
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [referenceNumber, status, shouldStopChecking]);
  
  // Récupérer les détails de la demande si le numéro de référence est disponible
  const { data: serviceRequest, isLoading } = useQuery({
    queryKey: [`/api/service-requests/${referenceNumber}`],
    queryFn: async () => {
      if (!referenceNumber) throw new Error("Numéro de référence manquant");
      
      const res = await apiRequest("GET", `/api/service-requests/${referenceNumber}`);
      return res.json();
    },
    enabled: !!referenceNumber,
  });
  
  // Téléchargement du certificat
  const handleDownloadCertificate = async () => {
    if (!referenceNumber) return;
    
    try {
      const response = await apiRequest("GET", `/api/certificate/${referenceNumber}`);
      
      if (!response.ok) {
        throw new Error("Impossible de télécharger le certificat");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificat-${referenceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement du certificat:", error);
    }
  };
  
  if (!referenceNumber) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-10">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Numéro de référence manquant. Impossible d'afficher les détails de la confirmation.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = "/"}>Retour à l'accueil</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">
              {status === "success" 
                ? "Paiement confirmé" 
                : status === "failed" 
                  ? "Échec du paiement" 
                  : "Traitement du paiement"}
            </CardTitle>
            <CardDescription>
              Référence de votre demande: <span className="font-medium">{referenceNumber}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {status === "success" && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertTitle>Paiement réussi</AlertTitle>
                    <AlertDescription>
                      Votre paiement de 129,80€ TTC a été traité avec succès. Un e-mail de confirmation a été envoyé à {serviceRequest?.success ? serviceRequest.serviceRequest.email : "votre adresse email"}.
                    </AlertDescription>
                  </Alert>
                )}
                
                {status === "failed" && (
                  <div className="space-y-4">
                    <Alert className="bg-red-50 border-red-200 text-red-800">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <AlertTitle>Échec du paiement</AlertTitle>
                      <AlertDescription>
                        Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter notre service client pour obtenir de l'aide.
                      </AlertDescription>
                    </Alert>
                    
                    {/* Affichage détaillé de l'erreur Stripe */}
                    <div className="rounded-lg border bg-red-50 border-red-200 p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                        <div className="space-y-2">
                          <h3 className="font-medium text-red-800">Détails de l'erreur</h3>
                          
                          <div className="bg-white border border-red-100 rounded-md p-3 text-sm">
                            <p className="font-medium text-gray-800">
                              {errorDetails ? (
                                <>
                                  {errorDetails.message || "Une erreur est survenue lors du traitement de votre paiement."}
                                  {errorDetails.decline_code && (
                                    <span className="block text-xs mt-1 text-red-600">
                                      Code d'erreur : {errorDetails.decline_code}
                                    </span>
                                  )}
                                </>
                              ) : (
                                "Une erreur est survenue lors du traitement de votre paiement."
                              )}
                            </p>
                          </div>
                          
                          <p className="text-sm text-red-700 font-medium">Suggestions :</p>
                          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                            <li>Vérifiez que le numéro de carte est correct</li>
                            <li>Assurez-vous que la date d'expiration est valide</li>
                            <li>Vérifiez le code de sécurité (CVC/CVV)</li>
                            <li>Assurez-vous que votre carte est activée pour les paiements en ligne</li>
                            <li>Contactez votre banque si le problème persiste</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {status === "pending" && (
                  <div className="space-y-4">
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-yellow-600 mr-2" />
                        <div>
                          <AlertTitle className="font-bold">Paiement en cours</AlertTitle>
                          <AlertDescription>
                            Votre paiement est en cours de traitement. La page sera automatiquement mise à jour...
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                    
                    <div className="rounded-md border p-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Vérification du paiement</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Clock className="h-3 w-3 mr-1" />
                              En cours
                            </Badge>
                          </div>
                          <Progress 
                            value={verificationCount > 0 ? Math.min(verificationCount * 15, 90) : 65} 
                            className="h-2 bg-blue-100" 
                            // L'animation de progression donne un retour visuel plus dynamique
                            // sur l'avancement du traitement du paiement
                            style={{
                              animation: "pulse 1.5s infinite",
                              background: "linear-gradient(90deg, rgba(219,234,254,1) 0%, rgba(96,165,250,0.5) 50%, rgba(219,234,254,1) 100%)",
                              backgroundSize: "200% 100%"
                            }}
                          />
                          {verificationCount > 0 && (
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{verificationCount} vérification{verificationCount > 1 ? 's' : ''}</span>
                              {lastResponseTime && <span>Dernière réponse: {lastResponseTime}ms</span>}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-muted-foreground">Demande reçue</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-muted-foreground">Carte bancaire validée</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                          </div>
                          <span className="text-muted-foreground">Transaction en cours...<span className="text-xs ml-1 text-yellow-500 animate-pulse">communication avec Stripe</span></span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-gray-400" />
                          </div>
                          <span className="text-muted-foreground">Confirmation finale</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.reload()}
                          className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 mt-2"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Actualiser manuellement
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {status === "success" && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-md border p-4">
                      <h3 className="font-semibold mb-2">Prochaines étapes</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Votre demande a été enregistrée et sera traitée par notre équipe dans les plus brefs délais.</li>
                        <li>Un conseiller va examiner votre dossier et vous contacter si des informations supplémentaires sont nécessaires.</li>
                        <li>Lorsque votre demande sera validée, nous vous contacterons pour planifier un rendez-vous avec un technicien Enedis.</li>
                        <li>Vous pouvez suivre l'avancement de votre demande en utilisant votre numéro de référence.</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-md bg-blue-50 border border-blue-100 p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Vos documents</h3>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          onClick={handleDownloadCertificate}
                          className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger le certificat de confirmation
                        </Button>
                      </div>
                    </div>
                    {serviceRequest?.success && (
                    <div className="rounded-md border p-4">
                      <h3 className="font-semibold mb-2">Détails du demandeur</h3>
                      <p><span className="font-medium">Nom:</span> {serviceRequest.serviceRequest.name}</p>
                      <p><span className="font-medium">Email:</span> {serviceRequest.serviceRequest.email}</p>
                      <p><span className="font-medium">Téléphone:</span> {serviceRequest.serviceRequest.phone}</p>
                      <p><span className="font-medium">Adresse:</span> {serviceRequest.serviceRequest.address}, {serviceRequest.serviceRequest.postalCode} {serviceRequest.serviceRequest.city}</p>
                    </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-0">
            {status === "failed" ? (
              <Button 
                onClick={() => window.location.href = `/payment/${referenceNumber}`}
                className="w-full"
              >
                Réessayer le paiement
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            )}
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p>Besoin d'aide ? Contactez notre service client au 01 23 45 67 89</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}