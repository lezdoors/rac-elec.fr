import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
// Suppression de l'import RealtimeStatusBadge qui est maintenant géré par AdminLayout
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, FileText, Mail, Phone } from "lucide-react";
import { ServiceRequest } from "@shared/schema";
import { ClientDetails } from "@/components/admin/client-details";
import { ClientEmailDialog } from "@/components/admin/client-email-dialog";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
  id: number;
  name: string;
  email: string; 
  phone: string;
  companyName: string | null;
  status: string;
  referenceNumber: string;
  createdAt: string;
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailClientId, setEmailClientId] = useState<number | null>(null);
  
  // Récupérer les demandes de service (qui contiennent les données clients)
  const { data: serviceRequests, isLoading, error } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fonction pour voir les détails d'un client
  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
  };
  
  // Fonction pour envoyer un email à un client
  const handleSendEmail = (clientId: number) => {
    setEmailClientId(clientId);
    setShowEmailDialog(true);
  };
  
  // Fonction pour initier un appel téléphonique
  const initiateCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
    toast({
      title: "Appel en cours",
      description: `Appel vers ${phoneNumber}`,
    });
  };

  // Convertir les demandes de service en données clients uniques
  const clients: ClientData[] = serviceRequests 
    ? serviceRequests
        .map(req => ({
          id: req.id,
          name: req.name || "Client sans nom",
          email: req.email,
          phone: req.phone,
          companyName: req.company || null,
          status: req.status,
          referenceNumber: req.referenceNumber,
          createdAt: new Date(req.createdAt).toISOString()
        }))
        // Filtrer selon la recherche
        .filter(client => 
          searchTerm === "" || 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          client.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  return (
    <AdminLayout title="Clients" description="Gestion des clients et prospects">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Gestion des clients</h1>
            </div>
            <p className="text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un client..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="default">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Une erreur est survenue lors du chargement des clients.</p>
              <Button variant="outline" size="sm" className="mt-4">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-4">Aucun client trouvé.</p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Liste des clients</CardTitle>
              <CardDescription>
                Consultez et gérez tous vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Client</th>
                      <th className="text-left py-3 px-2 font-medium">Contact</th>
                      <th className="text-left py-3 px-2 font-medium">Référence</th>
                      <th className="text-left py-3 px-2 font-medium">Statut</th>
                      <th className="text-left py-3 px-2 font-medium">Date</th>
                      <th className="text-right py-3 px-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const createdDate = new Date(client.createdAt);
                      const formattedDate = createdDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                      
                      // Déterminer la couleur du badge de statut
                      let statusBadgeVariant: "default" | "outline" | "secondary" | "destructive" = "default";
                      let statusLabel = "";
                      
                      switch (client.status) {
                        case "new":
                          statusBadgeVariant = "default";
                          statusLabel = "Nouveau";
                          break;
                        case "pending":
                          statusBadgeVariant = "outline";
                          statusLabel = "En attente";
                          break;
                        case "in_progress":
                          statusBadgeVariant = "secondary";
                          statusLabel = "En cours";
                          break;
                        case "validated":
                          statusBadgeVariant = "default";
                          statusLabel = "Validé";
                          break;
                        case "scheduled":
                          statusBadgeVariant = "default";
                          statusLabel = "Planifié";
                          break;
                        case "completed":
                          statusBadgeVariant = "default";
                          statusLabel = "Terminé";
                          break;
                        case "cancelled":
                          statusBadgeVariant = "destructive";
                          statusLabel = "Annulé";
                          break;
                        default:
                          statusBadgeVariant = "outline";
                          statusLabel = client.status;
                      }
                      
                      return (
                        <tr key={client.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{client.name}</div>
                            {client.companyName && (
                              <div className="text-xs text-muted-foreground">{client.companyName}</div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-mono text-xs">{client.referenceNumber}</div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground text-xs">
                            {formattedDate}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Voir les détails"
                                onClick={() => handleViewClient(client.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Envoyer un email"
                                onClick={() => handleSendEmail(client.id)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Appeler"
                                onClick={() => initiateCall(client.phone)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Modales */}
      {selectedClientId && (
        <ClientDetails
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
      
      {showEmailDialog && emailClientId && (
        <ClientEmailDialog
          clientEmail={clients.find(c => c.id === emailClientId)?.email || ""}
          clientName={clients.find(c => c.id === emailClientId)?.name || ""}
          referenceNumber={clients.find(c => c.id === emailClientId)?.referenceNumber || ""}
          isOpen={showEmailDialog}
          onClose={() => {
            setShowEmailDialog(false);
            setEmailClientId(null);
          }}
        />
      )}
    </AdminLayout>
  );
}