import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, CheckCircle2, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { RealtimeIndicator as RealTimeIndicator } from '@/components/admin/real-time-indicator';

export default function PaymentDebugPage() {
  const [activeTab, setActiveTab] = useState('paiements');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Récupération des paiements
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['/api/payments'],
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Récupération des intentions de paiement Stripe
  const { data: paymentIntents, isLoading: isLoadingIntents } = useQuery({
    queryKey: ['/api/payments/intents'],
    refetchInterval: 30000,
  });

  // Mettre à jour le statut d'un paiement
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (data: { paymentId: number; status: string; message?: string }) => {
      const res = await apiRequest('PATCH', `/api/payments/update-status`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du paiement a été mis à jour avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Fonction pour rechercher et filtrer les paiements
  const getFilteredPayments = () => {
    if (!payments) return [];
    
    return payments.filter((payment: any) => {
      const matchesSearch = searchQuery === '' || 
        payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.stripePaymentIntentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Fonction pour rechercher et filtrer les intentions de paiement
  const getFilteredIntents = () => {
    if (!paymentIntents) return [];
    
    return paymentIntents.filter((intent: any) => {
      return searchQuery === '' || 
        intent.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intent.metadata?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intent.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  // Fonction pour afficher le détail d'un paiement
  const showPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
  };

  // Fonction pour réessayer un paiement échoué
  const retryPaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest('POST', `/api/payments/retry`, { paymentId });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Paiement réactivé',
        description: 'Un email a été envoyé au client pour réessayer le paiement',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Fonction pour vérifier le statut d'un paiement dans Stripe
  const verifyPaymentStatusMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest('POST', `/api/payments/verify-status`, { paymentId });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Statut vérifié',
        description: data.message || 'Le statut du paiement a été vérifié avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Statut d'un paiement avec badge coloré
  const PaymentStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'completed':
          return { label: 'Complété', variant: 'default' as const, icon: CheckCircle2 };
        case 'failed':
          return { label: 'Échoué', variant: 'destructive' as const, icon: AlertCircle };
        case 'pending':
          return { label: 'En attente', variant: 'outline' as const, icon: Loader2 };
        default:
          return { label: status, variant: 'default' as const, icon: null };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Débogage des Paiements</h1>
          <div className="flex items-center">
            <RealTimeIndicator />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paiements">Paiements</TabsTrigger>
            <TabsTrigger value="stripe">Intentions Stripe</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 my-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence, email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'paiements' && (
              <div className="w-full md:w-1/4">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Complétés</SelectItem>
                    <SelectItem value="failed">Échoués</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="paiements">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Paiements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPayments ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>ID Stripe</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredPayments().length > 0 ? (
                          getFilteredPayments().map((payment: any) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.reference}</TableCell>
                              <TableCell>{new Date(payment.createdAt).toLocaleString('fr-FR')}</TableCell>
                              <TableCell>{payment.customerEmail}</TableCell>
                              <TableCell>{payment.amount.toFixed(2)}€</TableCell>
                              <TableCell>
                                <PaymentStatusBadge status={payment.status} />
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {payment.stripePaymentIntentId || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => showPaymentDetails(payment)}
                                  >
                                    Détails
                                  </Button>
                                  {payment.status === 'failed' && (
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      onClick={() => retryPaymentMutation.mutate(payment.id)}
                                      disabled={retryPaymentMutation.isPending}
                                    >
                                      {retryPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Réessayer
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => verifyPaymentStatusMutation.mutate(payment.id)}
                                    disabled={verifyPaymentStatusMutation.isPending}
                                  >
                                    {verifyPaymentStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Vérifier
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              Aucun paiement trouvé
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPayment && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Détails du Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Informations de base</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span>{selectedPayment.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Référence:</span>
                          <span>{selectedPayment.reference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant:</span>
                          <span>{selectedPayment.amount.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Statut:</span>
                          <PaymentStatusBadge status={selectedPayment.status} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date de création:</span>
                          <span>{new Date(selectedPayment.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernière mise à jour:</span>
                          <span>{new Date(selectedPayment.updatedAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Informations Stripe</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Intent ID:</span>
                          <span className="text-sm truncate max-w-[200px]">{selectedPayment.stripePaymentIntentId || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Méthode de paiement:</span>
                          <span>{selectedPayment.paymentMethod || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email Client:</span>
                          <span>{selectedPayment.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Description:</span>
                          <span>{selectedPayment.description || '-'}</span>
                        </div>
                        {selectedPayment.errorMessage && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Message d'erreur:</span>
                            <span className="text-red-500">{selectedPayment.errorMessage}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 space-x-2 flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPayment(null)}
                        >
                          Fermer
                        </Button>
                        {selectedPayment.status === 'failed' && (
                          <Button
                            onClick={() => retryPaymentMutation.mutate(selectedPayment.id)}
                            disabled={retryPaymentMutation.isPending}
                          >
                            {retryPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Réessayer le paiement
                          </Button>
                        )}
                        {selectedPayment.status === 'pending' && (
                          <Button
                            onClick={() => updatePaymentStatusMutation.mutate({
                              paymentId: selectedPayment.id,
                              status: 'completed'
                            })}
                            disabled={updatePaymentStatusMutation.isPending}
                          >
                            {updatePaymentStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Marquer comme complété
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stripe">
            <Card>
              <CardHeader>
                <CardTitle>Intentions de Paiement Stripe</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingIntents ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Référence</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Client</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredIntents().length > 0 ? (
                          getFilteredIntents().map((intent: any) => (
                            <TableRow key={intent.id}>
                              <TableCell className="max-w-[150px] truncate">{intent.id}</TableCell>
                              <TableCell>{new Date(intent.created * 1000).toLocaleString('fr-FR')}</TableCell>
                              <TableCell>{(intent.amount / 100).toFixed(2)}€</TableCell>
                              <TableCell>{intent.metadata?.reference || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={intent.status === 'succeeded' ? 'default' : intent.status === 'requires_payment_method' ? 'destructive' : 'outline'}>
                                  {intent.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{intent.customer_email || intent.receipt_email || '-'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              Aucune intention de paiement trouvée
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}