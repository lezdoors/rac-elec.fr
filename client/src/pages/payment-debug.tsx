import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BugIcon, RefreshCcw, Search, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentDebugPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [serviceRequestData, setServiceRequestData] = useState<any>(null);
  const [paymentStatusData, setPaymentStatusData] = useState<any>(null);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState({
    reference: false,
    payment: false,
    create: false
  });
  const [error, setError] = useState({
    reference: '',
    payment: '',
    create: ''
  });
  const [createdClientSecret, setCreatedClientSecret] = useState('');
  const [allReferences, setAllReferences] = useState<string[]>([]);
  
  // Charger les références récentes au démarrage
  useEffect(() => {
    fetchRecentReferences();
  }, []);
  
  // Charger des références récentes pour les tests
  const fetchRecentReferences = async () => {
    try {
      const response = await fetch('/api/service-requests/recent?limit=5');
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Extraire juste les numéros de référence
        const references = data.requests.map((req: any) => req.referenceNumber);
        setAllReferences(references);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des références récentes:', error);
    }
  };
  
  // Vérifier une référence
  const checkReference = async () => {
    if (!referenceNumber) return;
    
    setLoading({...loading, reference: true});
    setError({...error, reference: ''});
    setServiceRequestData(null);
    
    try {
      const response = await fetch(`/api/service-requests/${referenceNumber}`);
      const data = await response.json();
      
      if (response.ok) {
        setServiceRequestData(data);
      } else {
        setError({...error, reference: data.message || 'Référence introuvable'});
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de la référence:', err);
      setError({...error, reference: 'Erreur de communication avec le serveur'});
    } finally {
      setLoading({...loading, reference: false});
    }
  };
  
  // Vérifier le statut d'un paiement
  const checkPaymentStatus = async () => {
    if (!referenceNumber) return;
    
    setLoading({...loading, payment: true});
    setError({...error, payment: ''});
    setPaymentStatusData(null);
    
    try {
      const url = paymentIntentId
        ? `/api/payment-status/${referenceNumber}?payment_intent=${paymentIntentId}`
        : `/api/payment-status/${referenceNumber}`;
        
      const response = await fetch(url);
      const data = await response.json();
      
      setPaymentStatusData(data);
      
      if (!response.ok) {
        setError({...error, payment: data.message || 'Erreur lors de la vérification du paiement'});
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut du paiement:', err);
      setError({...error, payment: 'Erreur de communication avec le serveur'});
    } finally {
      setLoading({...loading, payment: false});
    }
  };
  
  // Créer un payment intent pour la référence
  const createPaymentIntent = async () => {
    if (!referenceNumber) return;
    
    setLoading({...loading, create: true});
    setError({...error, create: ''});
    setCreatedClientSecret('');
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: referenceNumber,
          amount: 129.80
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCreatedClientSecret(data.clientSecret);
      } else {
        setError({...error, create: data.message || 'Erreur lors de la création du payment intent'});
      }
    } catch (err) {
      console.error('Erreur lors de la création du payment intent:', err);
      setError({...error, create: 'Erreur de communication avec le serveur'});
    } finally {
      setLoading({...loading, create: false});
    }
  };
  
  // Lien direct vers la nouvelle page de paiement
  const goToPaymentPage = () => {
    if (referenceNumber) {
      window.open(`/simple-payment?reference=${referenceNumber}`, '_blank');
    }
  };
  
  // Formater JSON pour l'affichage
  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };
  
  return (
    <AdminLayout title="Diagnostic Paiement" description="Outil de débogage pour les problèmes liés au paiement">
      <div className="container py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded-md text-sm flex items-center">
              <span className="font-medium">Accès restreint :</span>
              <span className="ml-1">Cette page est réservée aux administrateurs et responsables.</span>
            </div>
          </div>
          <Button variant="outline" onClick={fetchRecentReferences} size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" /> Rafraîchir les références
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Entrée de référence</CardTitle>
            <CardDescription>Entrez une référence de demande ou sélectionnez-en une récente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="referenceInput">Référence</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="referenceInput" 
                    placeholder="ex: RAC-2025-0602-143045-742" 
                    value={referenceNumber} 
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                  <Button onClick={checkReference}>
                    <Search className="h-4 w-4 mr-2" />
                    Vérifier
                  </Button>
                  <Button variant="secondary" onClick={goToPaymentPage} disabled={!referenceNumber}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Page Paiement
                  </Button>
                </div>
              </div>
              
              {allReferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {allReferences.map((ref) => (
                    <Badge 
                      key={ref} 
                      className="cursor-pointer" 
                      variant="outline"
                      onClick={() => setReferenceNumber(ref)}
                    >
                      {ref}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="reference">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reference">
              Vérifier Référence
              {serviceRequestData && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
              {error.reference && <XCircle className="h-3 w-3 ml-1 text-red-500" />}
            </TabsTrigger>
            <TabsTrigger value="payment">
              Vérifier Paiement
              {paymentStatusData && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
              {error.payment && <XCircle className="h-3 w-3 ml-1 text-red-500" />}
            </TabsTrigger>
            <TabsTrigger value="create">
              Créer Intent
              {createdClientSecret && <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />}
              {error.create && <XCircle className="h-3 w-3 ml-1 text-red-500" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reference" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vérification de la référence</CardTitle>
                <CardDescription>Vérifie si une référence existe dans la base de données</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.reference ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Vérification en cours...</p>
                  </div>
                ) : error.reference ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error.reference}</AlertDescription>
                  </Alert>
                ) : serviceRequestData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-700 font-medium">Référence valide trouvée</p>
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="serviceRequest">
                        <AccordionTrigger>Détails de la demande</AccordionTrigger>
                        <AccordionContent>
                          <pre className="p-4 bg-gray-50 rounded-md text-xs overflow-auto max-h-96">
                            {formatJSON(serviceRequestData)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>Aucune vérification n'a encore été effectuée</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={checkReference} disabled={!referenceNumber || loading.reference}>
                  {loading.reference ? 'Chargement...' : 'Vérifier la référence'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vérification du statut de paiement</CardTitle>
                <CardDescription>Vérifie le statut du paiement associé à une référence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="paymentIdInput">ID PaymentIntent (optionnel)</Label>
                    <Input 
                      id="paymentIdInput" 
                      placeholder="ex: pi_3RK6TSF0p2SYXeXz1BY5vORk" 
                      value={paymentIntentId} 
                      onChange={(e) => setPaymentIntentId(e.target.value)}
                    />
                  </div>
                  
                  {loading.payment ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Vérification en cours...</p>
                    </div>
                  ) : error.payment ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error.payment}</AlertDescription>
                    </Alert>
                  ) : paymentStatusData ? (
                    <div className="space-y-4">
                      <div className={`p-4 ${paymentStatusData.status === 'succeeded' ? 'bg-green-50 border-green-100' : paymentStatusData.status === 'failed' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'} border rounded-md`}>
                        <div className="flex items-center">
                          {paymentStatusData.status === 'succeeded' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : paymentStatusData.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          ) : (
                            <RefreshCcw className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <p className={`font-medium ${paymentStatusData.status === 'succeeded' ? 'text-green-700' : paymentStatusData.status === 'failed' ? 'text-red-700' : 'text-yellow-700'}`}>
                            Statut: {paymentStatusData.status}
                          </p>
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="paymentStatus">
                          <AccordionTrigger>Détails du statut de paiement</AccordionTrigger>
                          <AccordionContent>
                            <pre className="p-4 bg-gray-50 rounded-md text-xs overflow-auto max-h-96">
                              {formatJSON(paymentStatusData)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>Aucune vérification n'a encore été effectuée</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={checkPaymentStatus} disabled={!referenceNumber || loading.payment}>
                  {loading.payment ? 'Chargement...' : 'Vérifier le paiement'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Créer un Payment Intent</CardTitle>
                <CardDescription>Crée un nouveau Payment Intent pour tester le paiement</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.create ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Création en cours...</p>
                  </div>
                ) : error.create ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error.create}</AlertDescription>
                  </Alert>
                ) : createdClientSecret ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                      <div className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-green-700 font-medium">PaymentIntent créé avec succès</p>
                          <p className="text-green-600 text-sm mt-1">
                            ClientSecret généré et prêt à être utilisé avec Stripe Elements
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <Label className="block mb-2">Client Secret</Label>
                      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto font-mono break-all">
                        {createdClientSecret}
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button onClick={goToPaymentPage}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Tester le paiement
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>Aucun PaymentIntent n'a encore été créé</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={createPaymentIntent} disabled={!referenceNumber || loading.create}>
                  {loading.create ? 'Chargement...' : 'Créer PaymentIntent'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
