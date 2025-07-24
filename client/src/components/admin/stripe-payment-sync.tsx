import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  ArrowDownUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ClockIcon, 
  RefreshCw, 
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentInfo {
  id: string;
  status: string;
  amount: number;
  customerId: string;
  created: number;
  metadata?: {
    referenceNumber?: string;
  };
}

interface SyncResult {
  id: string;
  status: string;
  reference?: string;
  paymentStatus?: string;
  message?: string;
}

/**
 * Composant de gestion et de synchronisation des paiements Stripe
 * Permet de visualiser et synchroniser les données de paiement depuis Stripe
 */
export function StripePaymentSync() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Récupération des paiements depuis Stripe
  const { 
    data: payments, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<PaymentInfo[]>({
    queryKey: ['/api/stripe/payments'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fonction pour synchroniser les paiements avec Stripe
  const syncPayments = async () => {
    setSyncing(true);
    setShowResults(false);
    
    try {
      const response = await apiRequest('POST', '/api/stripe/sync-payments');
      const data = await response.json();
      
      if (data.success) {
        setSyncResults(data.results || []);
        setShowResults(true);
        
        // Actualiser les données de paiement
        await refetch();
        
        // Actualiser d'autres données pertinentes
        await queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
        
        toast({
          title: "Synchronisation réussie",
          description: `${data.results.filter((r: SyncResult) => r.status === "synced").length} paiements mis à jour.`,
          variant: "default",
        });
      } else {
        throw new Error(data.message || "Erreur de synchronisation");
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation Stripe:", error);
      toast({
        title: "Échec de la synchronisation",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Formatter un montant pour l'affichage
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Formatter une date pour l'affichage
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur et le libellé d'un statut de paiement
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return { color: "bg-green-500", label: "Réussi" };
      case 'processing':
        return { color: "bg-yellow-500", label: "En cours" };
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return { color: "bg-blue-500", label: "En attente" };
      case 'canceled':
        return { color: "bg-red-500", label: "Annulé" };
      default:
        return { color: "bg-gray-500", label: status };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Synchronisation des paiements</CardTitle>
            <CardDescription>Gérer les paiements Stripe et leur statut</CardDescription>
          </div>
          <Button
            onClick={syncPayments}
            disabled={syncing || isLoading}
            className="flex items-center space-x-1"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Synchroniser</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-muted-foreground mb-2">Impossible de charger les paiements</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {showResults && syncResults.length > 0 && (
              <div className="mb-4 p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Résultats de la synchronisation</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
                    Fermer
                  </Button>
                </div>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
                  {syncResults.map((result) => (
                    <div key={result.id} className="flex items-center space-x-2 py-1 border-b border-border last:border-0">
                      {result.status === "synced" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : result.status === "skipped" ? (
                        <ArrowDownUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-mono text-xs opacity-70">{result.id}</span>
                      {result.reference && (
                        <Badge variant="outline" className="ml-1">
                          {result.reference}
                        </Badge>
                      )}
                      <span className="text-muted-foreground ml-auto">
                        {result.message || 
                         (result.status === "synced" 
                          ? `Synchronisé (${result.paymentStatus})` 
                          : result.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Référence</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Statut</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {payments && payments.length > 0 ? (
                    payments.slice(0, 10).map((payment) => {
                      const statusInfo = getStatusBadge(payment.status);
                      return (
                        <tr key={payment.id} className="border-b border-border">
                          <td className="py-3 px-2 font-mono text-xs">
                            {payment.id}
                          </td>
                          <td className="py-3 px-2">
                            {payment.metadata?.referenceNumber ? (
                              <Badge variant="outline" className="font-medium text-blue-600">
                                {payment.metadata.referenceNumber}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Non lié</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {formatDate(payment.created)}
                          </td>
                          <td className="py-3 px-2">
                            <Badge 
                              variant="outline" 
                              className={`font-medium ${statusInfo.color} text-white rounded-full`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right font-medium">
                            {formatAmount(payment.amount / 100)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <CreditCard className="h-8 w-8 mb-2 opacity-40" />
                          <p>Aucun paiement trouvé</p>
                          <p className="text-xs mt-1">Les paiements apparaîtront ici après traitement</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {payments && payments.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm">
                  Voir tous les paiements ({payments.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}