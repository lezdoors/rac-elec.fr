import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Euro, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

interface Payment {
  id: number;
  paymentId: string;
  referenceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  commission: number;
}

interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
  total: number;
  commissionTotal: number;
}

interface AgentPaymentsProps {
  teamView?: boolean;
}

export default function AgentPayments({ teamView = false }: AgentPaymentsProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Récupérer les paiements (personnels ou d'équipe selon le mode)
  const { data, isLoading, error } = useQuery<PaymentsResponse>({ 
    queryKey: teamView ? ["/api/team/payments", { page, limit }] : ["/api/user/payments", { page, limit }],
  });

  // Convertir le montant en euros (les montants sont stockés en centimes)
  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  // Format de date français
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: fr });
  };

  // Statut de paiement en français
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
      case "succeeded":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">Payé</Badge>;
      case "pending":
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900">En attente</Badge>;
      case "failed":
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calcul du nombre de pages
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Générer les pages pour la pagination
  const generatePagination = () => {
    const items = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = totalPages > 5 && page < totalPages - 2;
    
    // Bouton précédent
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          className={page <= 1 ? "pointer-events-none opacity-50" : ""} 
        />
      </PaginationItem>
    );

    // Première page toujours visible
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          onClick={() => setPage(1)} 
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Ellipsis de début si nécessaire
    if (showEllipsisStart) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Pages autour de la page actuelle
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i === 1 || i === totalPages) continue; // éviter duplication de la première et dernière page
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            onClick={() => setPage(i)} 
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis de fin si nécessaire
    if (showEllipsisEnd) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Dernière page si plus d'une page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            onClick={() => setPage(totalPages)} 
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Bouton suivant
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""} 
        />
      </PaginationItem>
    );

    return items;
  };

  // Titres adaptés selon le mode (personnel ou équipe)
  const title = teamView ? "Paiements d'Équipe" : "Mes Paiements et Commissions";
  const description = teamView ? "Paiements et commissions de votre équipe" : "Vos paiements et commissions associées";

  // État de chargement
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Référence</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="w-[100px] text-center">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-red-500">Une erreur s'est produite lors du chargement des paiements.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si pas de données ou tableau vide
  if (!data || data.payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aucun paiement n'a été trouvé.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total des paiements</p>
                  <h3 className="text-2xl font-bold mt-1">{data.payments.length}</h3>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paiements réussis</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">
                    {data.payments.filter(p => p.status === 'paid' || p.status === 'succeeded').length}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commission totale</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600">{formatAmount(data.commissionTotal)}</h3>
                </div>
                <Euro className="h-8 w-8 text-blue-500" />
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="w-[100px] text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.referenceNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{payment.clientName}</span>
                          <span className="text-xs text-muted-foreground">{payment.clientEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell className="text-right font-medium">{formatAmount(payment.amount)}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">{formatAmount(payment.commission)}</TableCell>
                      <TableCell className="text-center">{getPaymentStatusLabel(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {generatePagination()}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
}