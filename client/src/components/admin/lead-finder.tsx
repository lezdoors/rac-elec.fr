import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Search, User, FileText, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  postalCode?: string;
  city?: string;
  referenceNumber?: string;
  status?: string;
  requestType?: string;
  createdAt: string;
}

interface ServiceRequest {
  id: number;
  referenceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  createdAt: string;
  status: string;
  isPaid: boolean;
}

interface LeadFinderProps {
  onSelectLead: (lead: Lead) => void;
  onSelectRequest?: (request: ServiceRequest) => void;
  selectedLeadId?: number;
  selectedRequestId?: number;
  showServiceRequests?: boolean;
  emailAddress?: string; // Recherche automatique par email
}

export function LeadFinder({
  onSelectLead,
  onSelectRequest,
  selectedLeadId,
  selectedRequestId,
  showServiceRequests = true,
  emailAddress
}: LeadFinderProps) {
  const [searchTerm, setSearchTerm] = useState(emailAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "requests">("leads");

  const searchLeads = async () => {
    if (!searchTerm.trim()) {
      setLeads([]);
      setRequests([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Recherche de leads - essayons plusieurs endpoints possibles
      let leadsFound = false;
      
      // Essai 1: /api/leads/search
      try {
        const response = await apiRequest("GET", `/api/leads/search?term=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.leads && Array.isArray(data.leads)) {
            setLeads(data.leads);
            leadsFound = true;
            console.log("Leads trouvés via /api/leads/search", data.leads.length);
          }
        }
      } catch (error) {
        console.log("Échec de recherche sur /api/leads/search, tentative suivante...");
      }
      
      // Essai 2: /api/leads?search=terme
      if (!leadsFound) {
        try {
          const response = await apiRequest("GET", `/api/leads?search=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.leads && Array.isArray(data.leads)) {
              setLeads(data.leads);
              leadsFound = true;
              console.log("Leads trouvés via /api/leads?search=", data.leads.length);
            } else if (Array.isArray(data)) {
              setLeads(data);
              leadsFound = true;
              console.log("Leads trouvés (format tableau) via /api/leads?search=", data.length);
            }
          }
        } catch (error) {
          console.log("Échec de recherche sur /api/leads?search, tentative suivante...");
        }
      }
      
      // Essai 3: Recherche directe en filtrant tous les leads
      if (!leadsFound) {
        try {
          const response = await apiRequest("GET", `/api/leads`);
          if (response.ok) {
            const data = await response.json();
            let allLeads: Lead[] = [];
            
            if (data && data.leads && Array.isArray(data.leads)) {
              allLeads = data.leads;
            } else if (Array.isArray(data)) {
              allLeads = data;
            }
            
            // Filtrage côté client
            const searchTermLower = searchTerm.toLowerCase();
            const filteredLeads = allLeads.filter(lead => {
              return (
                lead.firstName.toLowerCase().includes(searchTermLower) ||
                lead.lastName.toLowerCase().includes(searchTermLower) ||
                lead.email.toLowerCase().includes(searchTermLower) ||
                (lead.phone && lead.phone.includes(searchTerm)) ||
                (lead.referenceNumber && lead.referenceNumber.toLowerCase().includes(searchTermLower))
              );
            });
            
            setLeads(filteredLeads);
            console.log("Leads trouvés par filtrage local", filteredLeads.length);
          }
        } catch (error) {
          console.error("Impossible de récupérer les leads:", error);
          setLeads([]);
        }
      }
      
      // Recherche de demandes de service si nécessaire
      if (showServiceRequests) {
        let requestsFound = false;
        
        // Essai 1: /api/service-requests/search
        try {
          const requestsResponse = await apiRequest("GET", `/api/service-requests/search?term=${encodeURIComponent(searchTerm)}`);
          if (requestsResponse.ok) {
            const data = await requestsResponse.json();
            if (data && data.requests && Array.isArray(data.requests)) {
              setRequests(data.requests);
              requestsFound = true;
            }
          }
        } catch (error) {
          console.log("Échec de recherche sur /api/service-requests/search, tentative suivante...");
        }
        
        // Essai 2: /api/service-requests?search=terme
        if (!requestsFound) {
          try {
            const requestsResponse = await apiRequest("GET", `/api/service-requests?search=${encodeURIComponent(searchTerm)}`);
            if (requestsResponse.ok) {
              const data = await requestsResponse.json();
              if (data && data.requests && Array.isArray(data.requests)) {
                setRequests(data.requests);
                requestsFound = true;
              } else if (Array.isArray(data)) {
                setRequests(data);
                requestsFound = true;
              }
            }
          } catch (error) {
            console.log("Échec de recherche sur /api/service-requests?search, tentative suivante...");
          }
        }
        
        // Essai 3: Recherche directe en filtrant toutes les demandes
        if (!requestsFound) {
          try {
            const response = await apiRequest("GET", `/api/service-requests`);
            if (response.ok) {
              const data = await response.json();
              let allRequests: ServiceRequest[] = [];
              
              if (data && data.requests && Array.isArray(data.requests)) {
                allRequests = data.requests;
              } else if (Array.isArray(data)) {
                allRequests = data;
              }
              
              // Filtrage côté client
              const searchTermLower = searchTerm.toLowerCase();
              const filteredRequests = allRequests.filter(request => {
                return (
                  request.clientName.toLowerCase().includes(searchTermLower) ||
                  request.clientEmail.toLowerCase().includes(searchTermLower) ||
                  request.clientPhone.includes(searchTerm) ||
                  request.referenceNumber.toLowerCase().includes(searchTermLower)
                );
              });
              
              setRequests(filteredRequests);
            }
          } catch (error) {
            console.error("Impossible de récupérer les demandes:", error);
            setRequests([]);
          }
        }
      }
    } catch (error) {
      console.error("Erreur globale lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Recherche automatique si un email est fourni
  useEffect(() => {
    if (emailAddress) {
      setSearchTerm(emailAddress);
      searchLeads();
    }
  }, [emailAddress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchLeads();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "contacted":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "qualified":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "converted":
        return "bg-green-50 text-green-600 border-green-200";
      case "closed":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "new":
        return "Nouveau";
      case "contacted":
        return "Contacté";
      case "qualified":
        return "Qualifié";
      case "converted":
        return "Converti";
      case "closed":
        return "Fermé";
      default:
        return "Non défini";
    }
  };

  const getRequestStatusColor = (status: string, isPaid: boolean) => {
    if (isPaid) {
      return "bg-green-50 text-green-600 border-green-200";
    }
    
    switch (status) {
      case "submitted":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "processing":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "canceled":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getRequestStatusLabel = (status: string, isPaid: boolean) => {
    if (isPaid) {
      return "Payé";
    }
    
    switch (status) {
      case "submitted":
        return "Soumise";
      case "processing":
        return "En traitement";
      case "completed":
        return "Terminée";
      case "canceled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Rechercher par nom, email, téléphone ou référence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={searchLeads} disabled={isSearching} type="button">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Rechercher</span>
        </Button>
      </div>

      {(leads.length > 0 || requests.length > 0) && (
        <div className="border rounded-md">
          {showServiceRequests && (
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === "leads" ? "bg-muted" : ""}`}
                onClick={() => setActiveTab("leads")}
              >
                <div className="flex items-center justify-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Leads</span>
                  {leads.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {leads.length}
                    </Badge>
                  )}
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === "requests" ? "bg-muted" : ""}`}
                onClick={() => setActiveTab("requests")}
              >
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Demandes</span>
                  {requests.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {requests.length}
                    </Badge>
                  )}
                </div>
              </button>
            </div>
          )}

          <ScrollArea className="h-[300px]">
            {activeTab === "leads" && leads.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow 
                      key={lead.id} 
                      className={selectedLeadId === lead.id ? "bg-muted" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{`${lead.firstName} ${lead.lastName}`}</div>
                        {lead.referenceNumber && (
                          <div className="text-xs text-muted-foreground">{lead.referenceNumber}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="text-xs text-muted-foreground">{lead.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant={selectedLeadId === lead.id ? "default" : "outline"}
                          onClick={() => onSelectLead(lead)}
                        >
                          Sélectionner
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "requests" && requests.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className={selectedRequestId === request.id ? "bg-muted" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{request.referenceNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.clientName}</div>
                        <div className="text-xs text-muted-foreground">{request.clientEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getRequestStatusColor(request.status, request.isPaid)}
                        >
                          {getRequestStatusLabel(request.status, request.isPaid)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {onSelectRequest && (
                          <Button 
                            size="sm" 
                            variant={selectedRequestId === request.id ? "default" : "outline"}
                            onClick={() => onSelectRequest(request)}
                          >
                            Sélectionner
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "leads" && leads.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>Aucun lead trouvé avec ces critères</p>
              </div>
            )}

            {activeTab === "requests" && requests.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>Aucune demande trouvée avec ces critères</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {searchTerm && !isSearching && leads.length === 0 && (!showServiceRequests || requests.length === 0) && (
        <div className="text-center py-4 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p>Aucun résultat trouvé</p>
        </div>
      )}
    </div>
  );
}
