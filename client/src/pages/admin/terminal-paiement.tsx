import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CreditCard, CheckCircle, XCircle, Search, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceRequest {
  id: number;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  clientType: string;
}

export default function TerminalPaiement() {
  const { toast } = useToast();

  // États pour le formulaire
  const [referenceNumber, setReferenceNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [amount, setAmount] = useState(129.80);
  const [showDemandePicker, setShowDemandePicker] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<ServiceRequest | null>(null);
  const [paymentMode, setPaymentMode] = useState<"manual" | "terminal">("manual");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // État pour les étapes de traitement
  const [processing, setProcessing] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);
  const [processFailed, setProcessFailed] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Récupérer la liste des demandes en attente de paiement
  const { data: serviceRequests = [], isLoading: isLoadingRequests } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests-unpaid'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: showDemandePicker,
  });

  // Vérifier si l'URL contient le paramètre canceled
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const canceled = urlParams.get('canceled');
    
    if (canceled === 'true') {
      toast({
        title: "Paiement annulé",
        description: "Le paiement a été annulé ou abandonné par le client.",
        variant: "destructive",
      });
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Mutation pour créer une session de terminal de paiement
  const createTerminalMutation = useMutation({
    mutationFn: async (data: { referenceNumber: string; amount: number; serviceRequestId: number }) => {
      const response = await apiRequest('POST', '/api/create-payment-terminal-session', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du terminal de paiement');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProcessing(false);
      setCheckoutUrl(data.checkoutUrl);
      setPaymentId(data.paymentId);
      
      toast({
        title: "Terminal prêt",
        description: `Terminal de paiement créé pour ${amount.toFixed(2).replace('.', ',')}€. Cliquez sur le lien pour procéder au paiement.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      setProcessing(false);
      setProcessFailed(true);
      
      toast({
        title: "Échec de la création du terminal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation pour vérifier le statut d'un paiement
  const checkPaymentStatusMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await apiRequest('GET', `/api/payment-terminal-status/${paymentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la vérification du paiement');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCheckingStatus(false);
      setPaymentStatus(data.status);
      
      if (data.status === 'succeeded') {
        setProcessCompleted(true);
        
        toast({
          title: "Paiement confirmé",
          description: `Le paiement de ${data.amount?.toFixed(2).replace('.', ',')}€ a été traité avec succès.`,
          variant: "default",
        });
        
        // Invalider les requêtes pour rafraîchir les données
        queryClient.invalidateQueries({queryKey: ['/api/service-requests']});
        queryClient.invalidateQueries({queryKey: ['/api/service-requests-unpaid']});
        queryClient.invalidateQueries({queryKey: ['/api/payments/recent']});
        queryClient.invalidateQueries({queryKey: ['/api/payments/stats']});
      } else if (data.status === 'canceled') {
        setProcessFailed(true);
        
        toast({
          title: "Paiement annulé",
          description: "Le paiement a été annulé.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Paiement en attente",
          description: `Le paiement est en statut: ${data.status}. Vérifiez à nouveau plus tard.`,
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      setCheckingStatus(false);
      
      toast({
        title: "Erreur de vérification",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation pour traiter le paiement manuellement (ancienne méthode)
  const processPaymentMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('POST', '/api/process-manual-payment', formData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du traitement du paiement');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProcessing(false);
      setProcessCompleted(true);
      setPaymentId(data.paymentId);
      
      toast({
        title: "Paiement réussi",
        description: `Le paiement de ${amount.toFixed(2).replace('.', ',')}€ a été traité avec succès. ID de transaction: ${data.paymentId}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      setProcessing(false);
      setProcessFailed(true);
      
      toast({
        title: "Échec du paiement",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fonction pour formater les numéros de carte au format XXXX XXXX XXXX XXXX
  const formatCardNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.slice(i, i + 4));
    }
    
    return groups.join(' ');
  };

  // Fonction pour formater la date d'expiration au format MM/YY
  const formatExpiry = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
  };

  // Fonction pour traiter le paiement manuellement (saisie de carte)
  const handleProcessManualPayment = () => {
    if (!selectedDemande) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une demande de service",
        variant: "destructive",
      });
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs du formulaire de paiement",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que le numéro de carte a au moins 16 chiffres
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    if (cleanedCardNumber.length < 16) {
      toast({
        title: "Numéro de carte invalide",
        description: "Le numéro de carte doit comporter au moins 16 chiffres",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la date d'expiration
    const expParts = cardExpiry.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      toast({
        title: "Date d'expiration invalide",
        description: "La date d'expiration doit être au format MM/YY",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que la carte n'est pas expirée
    const expMonth = parseInt(expParts[0], 10);
    const expYear = parseInt(`20${expParts[1]}`, 10);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() retourne 0-11
    const currentYear = currentDate.getFullYear();

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast({
        title: "Carte expirée",
        description: "La date d'expiration de la carte est dépassée. Veuillez utiliser une carte valide.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier le CVC
    if (cardCvc.length < 3) {
      toast({
        title: "CVC invalide",
        description: "Le code de sécurité (CVC) doit comporter au moins 3 chiffres",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProcessCompleted(false);
    setProcessFailed(false);

    // Formater les données pour l'API
    const paymentData = {
      referenceNumber: selectedDemande.referenceNumber,
      cardNumber: cleanedCardNumber,
      cardExpMonth: parseInt(expParts[0]),
      cardExpYear: parseInt(`20${expParts[1]}`),
      cardCvc: cardCvc,
      cardholderName: cardholderName,
      amount: amount, // Montant personnalisable
      serviceRequestId: selectedDemande.id
    };

    // Appeler la mutation pour traiter le paiement
    processPaymentMutation.mutate(paymentData);
  };
  
  // Fonction pour créer un terminal de paiement Stripe
  const handleCreateTerminal = () => {
    if (!selectedDemande) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une demande de service",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    setProcessCompleted(false);
    setProcessFailed(false);
    setCheckoutUrl(null);
    
    // Données pour créer le terminal
    const terminalData = {
      referenceNumber: selectedDemande.referenceNumber,
      amount: amount,
      serviceRequestId: selectedDemande.id
    };
    
    // Appeler la mutation pour créer le terminal
    createTerminalMutation.mutate(terminalData);
  };
  
  // Fonction pour vérifier le statut d'un paiement
  const handleCheckPaymentStatus = () => {
    if (!paymentId) {
      toast({
        title: "Erreur",
        description: "Aucun paiement en cours",
        variant: "destructive",
      });
      return;
    }
    
    setCheckingStatus(true);
    
    // Appeler la mutation pour vérifier le statut
    checkPaymentStatusMutation.mutate(paymentId);
  };

  // Filtrer les demandes en fonction de la recherche
  const filteredRequests = serviceRequests.filter(req => {
    const searchLower = searchQuery.toLowerCase();
    return (
      req.referenceNumber.toLowerCase().includes(searchLower) ||
      req.name.toLowerCase().includes(searchLower) ||
      req.email.toLowerCase().includes(searchLower) ||
      req.phone.toLowerCase().includes(searchLower)
    );
  });

  // Fonction pour sélectionner une demande
  const selectDemande = (demande: ServiceRequest) => {
    setSelectedDemande(demande);
    setReferenceNumber(demande.referenceNumber);
    setShowDemandePicker(false);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardholderName("");
    setReferenceNumber("");
    setSelectedDemande(null);
    setProcessCompleted(false);
    setProcessFailed(false);
  };

  return (
    <AdminLayout 
      title="Terminal de paiement" 
      description="Traitez les paiements par téléphone ou en personne"
    >
      <div className="max-w-2xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Terminal de paiement virtuel</CardTitle>
            <CardDescription>
              Utilisez ce terminal pour traiter les paiements par téléphone ou en personne.
              Vos clients peuvent vous communiquer leurs informations de carte bancaire par téléphone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Référence de la demande - Commun aux deux méthodes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reference">Référence de la demande</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDemandePicker(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
              <Input
                id="reference"
                placeholder="ex: RAC-2025-0602-143045-742"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={processing || processCompleted}
                className="font-mono"
              />
              {selectedDemande && (
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  Client: {selectedDemande.name} • {selectedDemande.email} • {selectedDemande.phone}
                </div>
              )}
            </div>

            {/* Montant - Commun aux deux méthodes */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                value={amount.toFixed(2)}
                step="0.01"
                min="0"
                placeholder="Entrez le montant"
                className="font-bold"
                disabled={processing || processCompleted}
                onChange={(e) => {
                  // Conserver uniquement deux décimales
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setAmount(parseFloat(value.toFixed(2)));
                  }
                }}
              />
            </div>
            
            {/* Sélecteur de mode de paiement */}
            <Tabs 
              defaultValue={paymentMode} 
              value={paymentMode}
              onValueChange={(value) => setPaymentMode(value as "manual" | "terminal")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" disabled={processing || processCompleted}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Saisie manuelle
                </TabsTrigger>
                <TabsTrigger value="terminal" disabled={processing || processCompleted}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Terminal Stripe
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-4 space-y-4">
                {/* Informations de carte - Mode manuel uniquement */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      disabled={processing || processCompleted}
                      maxLength={19}
                      className="font-mono"
                    />
                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Date d'expiration</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      disabled={processing || processCompleted}
                      maxLength={5}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        setCardCvc(cleaned.slice(0, 4));
                      }}
                      disabled={processing || processCompleted}
                      maxLength={4}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Nom du titulaire</Label>
                  <Input
                    id="cardholderName"
                    placeholder="Jean Dupont"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={processing || processCompleted}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="terminal" className="mt-4 space-y-4">
                {/* Terminal Stripe */}
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="text-sm font-medium mb-2">Terminal de paiement Stripe</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ce mode crée un terminal de paiement Stripe sécurisé que vous pouvez partager avec votre client.
                    Il pourra entrer ses informations bancaires directement sur la page Stripe.
                  </p>
                  
                  {checkoutUrl && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2 text-sm font-medium text-blue-600">
                        <span>URL du terminal:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={checkoutUrl}
                          className="flex-1 p-2 text-sm font-mono bg-white border rounded"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (checkoutUrl) {
                              window.open(checkoutUrl, '_blank');
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Status: {paymentStatus || 'En attente de paiement'}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCheckPaymentStatus}
                          disabled={checkingStatus || !paymentId}
                        >
                          {checkingStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Vérifier le statut
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Messages de statut - Communs aux deux méthodes */}
            {processing && !checkoutUrl && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <AlertTitle>Traitement en cours</AlertTitle>
                <AlertDescription>
                  Veuillez patienter pendant que nous préparons votre paiement...
                </AlertDescription>
              </Alert>
            )}

            {processCompleted && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Paiement réussi!</AlertTitle>
                <AlertDescription>
                  Le paiement de {amount.toFixed(2).replace('.', ',')}€ a été traité avec succès. ID de transaction: {paymentId}
                </AlertDescription>
              </Alert>
            )}

            {processFailed && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Échec du paiement</AlertTitle>
                <AlertDescription>
                  Le paiement a échoué. Veuillez vérifier les informations et réessayer.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={resetForm}
              disabled={processing}
            >
              Réinitialiser
            </Button>
            {paymentMode === 'manual' ? (
              <Button 
                onClick={handleProcessManualPayment} 
                disabled={processing || !selectedDemande || processCompleted || !cardNumber || !cardExpiry || !cardCvc || !cardholderName}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : "Traiter le paiement manuel"}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateTerminal} 
                disabled={processing || !selectedDemande || processCompleted}
              >
                {processing && !checkoutUrl ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Préparation...
                  </>
                ) : checkoutUrl ? (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ouvrir le terminal
                  </>
                ) : "Créer un terminal de paiement"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Dialog pour sélectionner une demande */}
      <Dialog open={showDemandePicker} onOpenChange={setShowDemandePicker}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sélectionner une demande</DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez une demande pour traiter le paiement
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Input
              placeholder="Rechercher par référence, nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-2 px-4 text-left">Référence</th>
                      <th className="py-2 px-4 text-left">Client</th>
                      <th className="py-2 px-4 text-left">Contact</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {isLoadingRequests ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" />
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Aucune demande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-4 font-mono text-sm">{request.referenceNumber}</td>
                        <td className="py-2 px-4">{request.name}</td>
                        <td className="py-2 px-4 text-sm">
                          {request.email}<br/>{request.phone}
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {request.clientType === 'professional' ? 'Pro' : 'Part.'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => selectDemande(request)}
                          >
                            Sélectionner
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDemandePicker(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}