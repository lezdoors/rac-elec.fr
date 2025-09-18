import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  Phone,
  MoreHorizontal,
  FileText,
  Zap,
  User,
  Download,
  Plus,
  Pencil,
  ArrowRight,
  CreditCard,
  MapPin,
  HardHat,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { ServiceRequest } from "@shared/schema";
import { PaymentLinksGenerator } from "@/components/payment-links-generator";

// Formatter pour les dates
function formatDate(dateString: string | Date) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Formatter pour les montants
function formatAmount(amount: number) {
  if (!amount) return "N/A";
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Formatte le numéro de téléphone pour l'affichage
function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return "N/A";
  
  // Format français: 06 12 34 56 78
  return phoneNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
}

// Déclenche l'appel téléphonique
function callCustomer(phoneNumber: string, name: string) {
  window.open(`tel:${phoneNumber}`, '_blank');
  console.log(`Appel de ${name} au ${phoneNumber}`);
}

// Statistiques pour le tableau de bord
function DashboardStats({ requests }: { requests: ServiceRequest[] }) {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const pendingPayments = requests.filter(r => !r.paymentStatus || r.paymentStatus !== 'succeeded').length;
  const paidRequests = requests.filter(r => r.paymentStatus === 'succeeded').length;
  
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-blue-600 mb-1" />
          <p className="text-xl font-bold text-blue-800">{totalRequests}</p>
          <p className="text-xs text-blue-700">Total demandes</p>
        </CardContent>
      </Card>
      
      <Card className="bg-yellow-50 border-yellow-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <Clock className="h-8 w-8 text-yellow-600 mb-1" />
          <p className="text-xl font-bold text-yellow-800">{pendingRequests}</p>
          <p className="text-xs text-yellow-700">En attente</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50 border-purple-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <Zap className="h-8 w-8 text-purple-600 mb-1" />
          <p className="text-xl font-bold text-purple-800">{inProgressRequests}</p>
          <p className="text-xs text-purple-700">En cours</p>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 border-green-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 mb-1" />
          <p className="text-xl font-bold text-green-800">{completedRequests}</p>
          <p className="text-xs text-green-700">Terminées</p>
        </CardContent>
      </Card>
      
      <Card className="bg-indigo-50 border-indigo-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <User className="h-8 w-8 text-indigo-600 mb-1" />
          <p className="text-xl font-bold text-indigo-800">{paidRequests}</p>
          <p className="text-xs text-indigo-700">Clients</p>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-50 border-orange-100">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-orange-600 mb-1" />
          <p className="text-xl font-bold text-orange-800">{pendingPayments}</p>
          <p className="text-xs text-orange-700">Leads</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant de détail pour visualiser une demande
function RequestDetails({ request, onClose }: { request: ServiceRequest, onClose: () => void }) {
  if (!request) return null;
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {request.referenceNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            Créée le {formatDate(request.createdAt)}
          </p>
        </div>
        
        <Badge 
          variant={
            request.status === 'completed' ? 'default' :
            request.status === 'in_progress' ? 'secondary' :
            request.status === 'pending' ? 'outline' : 'destructive'
          }
        >
          {request.status === 'completed' ? 'Terminé' :
           request.status === 'in_progress' ? 'En cours' :
           request.status === 'pending' ? 'En attente' : 'Annulé'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-h-[70vh] md:max-h-none overflow-y-auto md:overflow-visible pb-4 pr-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Nom</div>
              <div className="font-medium">{request.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Email</div>
              <div>
                <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">
                  {request.email}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Téléphone</div>
              <div>
                <a href={`tel:${request.phone}`} className="text-blue-600 hover:underline">
                  {formatPhoneNumber(request.phone)}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Type</div>
              <div>
                <Badge variant="outline" className="font-normal">
                  {request.clientType === 'particulier' ? 'Particulier' : 
                   request.clientType === 'professionnel' ? 'Professionnel' : 'Collectivité'}
                </Badge>
              </div>
            </div>
            {request.clientType !== 'particulier' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Société</div>
                  <div className="font-medium">{request.company}</div>
                </div>
                {request.siret && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">SIRET</div>
                    <div className="font-mono text-xs">{request.siret}</div>
                  </div>
                )}
              </>
            )}
            {request.ipAddress && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">IP</div>
                <div className="font-mono text-xs">{request.ipAddress}</div>
              </div>
            )}
            {request.userAgent && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Navigateur</div>
                <div className="truncate text-xs">{request.userAgent}</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Détails de la demande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Type</div>
              <div>
                {request.requestType === 'new_connection' ? 'Nouvelle connexion' : 
                 request.requestType === 'power_upgrade' ? 'Augmentation puissance' :
                 request.requestType === 'meter_upgrade' ? 'Modification compteur' :
                 request.requestType === 'temporary_connection' ? 'Raccordement temporaire' :
                 request.requestType === 'relocation' ? 'Déplacement d\'ouvrage' :
                 request.requestType === 'technical_visit' ? 'Visite technique' : 
                 'Autre'}
              </div>
            </div>
            {request.otherRequestTypeDesc && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Détail</div>
                <div>{request.otherRequestTypeDesc}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Puissance</div>
              <div>{request.powerRequired} kVA</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Phase</div>
              <div>{request.phaseType === 'monophase' ? 'Monophasé' : 'Triphasé'}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Bâtiment</div>
              <div>
                {request.buildingType === 'individual_house' ? 'Maison individuelle' :
                 request.buildingType === 'apartment_building' ? 'Immeuble collectif' :
                 request.buildingType === 'commercial' ? 'Local commercial' :
                 request.buildingType === 'industrial' ? 'Bâtiment industriel' :
                 request.buildingType === 'agricultural' ? 'Exploitation agricole' :
                 request.buildingType === 'public' ? 'Établissement public' :
                 request.buildingType === 'terrain' ? 'Terrain' : 'Autre'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Avancement</div>
              <div>
                {request.projectStatus === 'planning' ? 'En projet' :
                 request.projectStatus === 'permit_pending' ? 'Permis déposé' :
                 request.projectStatus === 'permit_approved' ? 'Permis approuvé' :
                 request.projectStatus === 'construction_started' ? 'Construction démarrée' :
                 request.projectStatus === 'construction_completed' ? 'Construction terminée' : 'Autre'}
              </div>
            </div>
            {request.terrainViabilise && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Terrain</div>
                <div>{request.terrainViabilise === 'viabilise' ? 'Viabilisé' : 'Non viabilisé'}</div>
              </div>
            )}
            {(request.billingAddress && request.billingAddress !== request.address) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Adresse facturation différente</div>
                <div>Oui</div>
              </div>
            )}
            {request.permitNumber && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">N° Permis</div>
                <div>{request.permitNumber}</div>
              </div>
            )}
            {request.permitDeliveryDate && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date permis</div>
                <div>{request.permitDeliveryDate}</div>
              </div>
            )}
            {request.desiredCompletionDate && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date souhaitée</div>
                <div>{request.desiredCompletionDate}</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              Adresse du projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-medium">
              {request.address}
              {request.addressComplement && <span>, {request.addressComplement}</span>}
              <br />
              {request.postalCode} {request.city}
            </div>
            {request.cadastralReference && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm font-medium">Référence cadastrale</div>
                <div>{request.cadastralReference}</div>
              </div>
            )}
            {(request.billingAddress && request.billingAddress !== request.address) && (
              <>
                <div className="mt-4 mb-2 text-sm font-medium">Adresse de facturation</div>
                <div className="font-medium">
                  {request.billingAddress}
                  <br />
                  {request.billingPostalCode} {request.billingCity}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {request.hasArchitect && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardHat className="mr-2 h-5 w-5 text-blue-600" />
                Architecte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.architectName && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Nom</div>
                  <div>{request.architectName}</div>
                </div>
              )}
              {request.architectPhone && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Téléphone</div>
                  <div>{formatPhoneNumber(request.architectPhone)}</div>
                </div>
              )}
              {request.architectEmail && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Email</div>
                  <div>{request.architectEmail}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Informations bancaires */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <CreditCard className="mr-2 h-5 w-5" />
              Informations de paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Statut</div>
              <div>
                <Badge 
                  variant={(request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'default' : 'outline'}
                  className={`${(request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'bg-green-100 text-green-800' : 
                    request.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}`}
                >
                  {(request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'Payé' : 
                   request.paymentStatus === 'processing' ? 'En cours' :
                   request.paymentStatus === 'failed' ? 'Échec' : 'Non payé'}
                </Badge>
              </div>
            </div>
            {request.paymentAmount && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Montant</div>
                <div className="font-semibold">{formatAmount(parseFloat(request.paymentAmount.toString()))}</div>
              </div>
            )}
            {request.paymentMethod && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Méthode</div>
                <div>{request.paymentMethod === 'card' ? 'Carte bancaire' : 
                      request.paymentMethod === 'manual' ? 'Paiement manuel' : request.paymentMethod}</div>
              </div>
            )}
            {request.paymentDate && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date</div>
                <div>{formatDate(request.paymentDate)}</div>
              </div>
            )}
            {request.paymentId && (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID Paiement</div>
                <div className="text-xs">{request.paymentId}</div>
              </div>
            )}
            
            {/* Informations bancaires détaillées */}
            {request.cardBrand && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Carte</div>
                  <div className="capitalize">{request.cardBrand}</div>
                </div>
                {request.cardLast4 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Numéro</div>
                    <div className="font-mono">{request.cardLast4}</div>
                  </div>
                )}
                {(request.cardExpMonth && request.cardExpYear) && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Expiration</div>
                    <div>{request.cardExpMonth.toString().padStart(2, '0')}/{request.cardExpYear}</div>
                  </div>
                )}
                {request.billingName && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Titulaire</div>
                    <div>{request.billingName}</div>
                  </div>
                )}
                {request.bankName && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Banque</div>
                    <div>{request.bankName}</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Erreurs de paiement */}
            {request.paymentError && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="text-sm font-medium text-red-600 mb-1">Erreur de paiement</div>
                <div className="text-xs whitespace-pre-wrap text-red-600 bg-red-50 p-2 rounded">
                  {request.paymentError}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Liens de paiement multiples - seulement affiché pour les demandes non payées */}
        {(!request.paymentStatus || (request.paymentStatus !== 'succeeded' && request.paymentStatus !== 'paid')) && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-green-700">
                <CreditCard className="mr-2 h-5 w-5" />
                Liens de paiement multiples
              </CardTitle>
              <CardDescription className="text-green-600">
                Générateur de liens de paiement avec montant majoré
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentLinksGenerator referenceNumber={request.referenceNumber} />
            </CardContent>
          </Card>
        )}
        
        {request.scheduledDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Rendez-vous Enedis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date</div>
                <div>{formatDate(request.scheduledDate)}</div>
              </div>
              {request.scheduledTime && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Créneau</div>
                  <div>{request.scheduledTime}</div>
                </div>
              )}
              {request.enedisReferenceNumber && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Référence Enedis</div>
                  <div>{request.enedisReferenceNumber}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {request.comments && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                Commentaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{request.comments}</p>
            </CardContent>
          </Card>
        )}
        
        {request.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Notes internes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{request.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex flex-wrap justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button 
          variant="outline" 
          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
          onClick={() => callCustomer(request.phone, request.name)}
        >
          <Phone className="mr-2 h-4 w-4" />
          Appeler
        </Button>
        <Button>Traiter la demande</Button>
      </div>
    </div>
  );
}

export default function DemandesPage() {
  // États pour les filtres et les données
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Constante pour définir le nombre d'éléments par page
  const ITEMS_PER_PAGE = 20;
  
  // Récupérer les données des demandes
  const { 
    data: serviceRequests, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mutation pour marquer une demande comme payée
  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/service-requests/${id}`, {
        paymentStatus: 'paid',
        status: 'in_progress',
        paymentMethod: 'manual',
        paymentDate: new Date().toISOString()
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
    },
  });
  
  // Assurer que les tableaux ne sont jamais undefined
  const safeRequests = serviceRequests || [];
  
  // Filtrer les demandes selon les critères
  const filteredRequests = safeRequests.filter((request) => {
    // Recherche par texte (référence, nom, email, etc.)
    const matchesSearch = 
      !searchTerm || 
      request.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.name && request.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.email && request.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.phone && request.phone.includes(searchTerm)) ||
      (request.address && request.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtres par état et type
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesType = !typeFilter || request.requestType === typeFilter;
    
    // Filtre par statut de paiement
    const matchesPayment = !paymentFilter || 
      (paymentFilter === 'paid' && (request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid')) ||
      (paymentFilter === 'unpaid' && (!request.paymentStatus || (request.paymentStatus !== 'succeeded' && request.paymentStatus !== 'paid')));
    
    // Filtre par date
    let matchesDate = true;
    if (dateRange !== "all" && request.createdAt) {
      const requestDate = new Date(request.createdAt);
      const now = new Date();
      
      if (dateRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        matchesDate = requestDate >= today;
      } else if (dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = requestDate >= weekAgo;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = requestDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesPayment && matchesDate;
  });
  
  // Trier les demandes par date de création (les plus récentes d'abord)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Gérer l'ouverture des détails
  const handleShowDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };
  
  // Gérer la fermeture des détails
  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
  };
  
  // Marquer comme payé
  const handleMarkAsPaid = (request: ServiceRequest) => {
    markAsPaidMutation.mutate(request.id);
  };
  
  return (
    <AdminLayout 
      title="Gestion des demandes" 
      description="Gérez toutes les demandes de raccordement électrique"
    >
      <div className="space-y-6">
        {/* Statistiques */}
        {!isLoading && !error && safeRequests && (
          <DashboardStats requests={safeRequests} />
        )}
        
        {/* Filtres et actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle>Toutes les demandes</CardTitle>
                {/* L'indicateur de statut en temps réel est maintenant géré par AdminLayout */}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle demande
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute h-4 w-4 top-3 left-3 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, référence, adresse..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminées</SelectItem>
                    <SelectItem value="cancelled">Annulées</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="new_connection">Nouvelle connexion</SelectItem>
                    <SelectItem value="power_upgrade">Augmentation puissance</SelectItem>
                    <SelectItem value="meter_upgrade">Modification compteur</SelectItem>
                    <SelectItem value="technical_visit">Visite technique</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentFilter || "all"} onValueChange={(value) => setPaymentFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="paid">Payés</SelectItem>
                    <SelectItem value="unpaid">Non payés</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">7 derniers jours</SelectItem>
                    <SelectItem value="month">30 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tableau des demandes */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Une erreur est survenue lors du chargement des demandes</p>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : sortedRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucune demande ne correspond à vos critères de recherche</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Référence</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequests
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.referenceNumber}
                        </TableCell>
                        <TableCell>
                          <div>{request.name}</div>
                          <div className="text-xs text-muted-foreground">{request.email}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(request.createdAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {request.requestType === 'new_connection' ? 'Nouvelle connexion' : 
                          request.requestType === 'power_upgrade' ? 'Augmentation puissance' :
                          request.requestType === 'meter_upgrade' ? 'Modification compteur' : 'Visite technique'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === 'completed' ? 'default' :
                              request.status === 'in_progress' ? 'secondary' :
                              request.status === 'pending' ? 'outline' : 'destructive'
                            }
                          >
                            {request.status === 'completed' ? 'Terminé' :
                            request.status === 'in_progress' ? 'En cours' :
                            request.status === 'pending' ? 'En attente' : 'Annulé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={(request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'default' : 'outline'}
                            className={
                              (request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                              request.paymentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                              request.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''
                            }
                          >
                            {(request.paymentStatus === 'succeeded' || request.paymentStatus === 'paid') ? 'Payé' : 
                             request.paymentStatus === 'processing' ? 'En cours' : 
                             request.paymentStatus === 'failed' ? 'Échoué' : 'Non payé'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowDetails(request)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => callCustomer(request.phone, request.name)}>
                                <Phone className="mr-2 h-4 w-4" />
                                Appeler client
                              </DropdownMenuItem>
                              {(!request.paymentStatus || (request.paymentStatus !== 'succeeded' && request.paymentStatus !== 'paid')) && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(request)}>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Marquer comme payé
                                </DropdownMenuItem>
                              )}
                              {request.paymentStatus === 'succeeded' && !request.scheduledDate && (
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Planifier RDV
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Contrôles de pagination */}
                {sortedRequests.length > 0 && (
                  <div className="flex justify-between items-center mt-4 px-4 pb-4">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sortedRequests.length)} à {Math.min(currentPage * ITEMS_PER_PAGE, sortedRequests.length)} sur {sortedRequests.length} demandes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedRequests.length / ITEMS_PER_PAGE), p + 1))}
                        disabled={currentPage >= Math.ceil(sortedRequests.length / ITEMS_PER_PAGE)}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog pour afficher les détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>Consultez et gérez les informations détaillées de la demande</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <RequestDetails 
              request={selectedRequest} 
              onClose={handleCloseDetails} 
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}