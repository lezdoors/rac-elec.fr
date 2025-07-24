import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ServiceRequest, REQUEST_STATUS, ACTIVITY_ACTIONS } from "@shared/schema";
import {
  Building,
  Calendar,
  Check,
  Clipboard,
  Clock,
  FileText,
  HelpCircle,
  History,
  Hourglass,
  Inbox,
  InfoIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  TagIcon,
  User,
  UserCircle,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ClientCertificate } from "./client-certificate";
import { ClientEmailDialog } from "./client-email-dialog";

interface ClientDetailsProps {
  clientId: number;
  onClose: () => void;
}

export function ClientDetails({ clientId, onClose }: ClientDetailsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  // Récupérer les détails du client en utilisant le service-request-id endpoint
  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/service-request-id/${clientId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/service-request-id/${clientId}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des détails du client");
      }
      return res.json();
    },
  });
  
  // Récupérer les logs d'activité
  const {
    data: activityLogs,
    isLoading: logsLoading,
  } = useQuery({
    queryKey: [`/api/activity-logs/service_request/${clientId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/activity-logs/service_request/${clientId}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des logs d'activité");
      }
      return res.json();
    },
    enabled: !!client,
  });
  
  // Fonction pour générer la bonne icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return <Inbox className="h-4 w-4 text-blue-500" />;
      case REQUEST_STATUS.PENDING:
        return <Hourglass className="h-4 w-4 text-amber-500" />;
      case REQUEST_STATUS.ASSIGNED:
        return <User className="h-4 w-4 text-purple-500" />;
      case REQUEST_STATUS.VALIDATED:
        return <Check className="h-4 w-4 text-green-500" />;
      case REQUEST_STATUS.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-indigo-500" />;
      case REQUEST_STATUS.SCHEDULED:
        return <Calendar className="h-4 w-4 text-cyan-500" />;
      case REQUEST_STATUS.COMPLETED:
        return <Check className="h-4 w-4 text-emerald-500" />;
      case REQUEST_STATUS.CANCELLED:
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "Nouvelle demande";
      case REQUEST_STATUS.PENDING:
        return "En attente";
      case REQUEST_STATUS.ASSIGNED:
        return "Assignée";
      case REQUEST_STATUS.VALIDATED:
        return "Validée";
      case REQUEST_STATUS.IN_PROGRESS:
        return "En cours";
      case REQUEST_STATUS.SCHEDULED:
        return "Rendez-vous planifié";
      case REQUEST_STATUS.COMPLETED:
        return "Terminée";
      case REQUEST_STATUS.CANCELLED:
        return "Annulée";
      default:
        return "Statut inconnu";
    }
  };
  
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "blue";
      case REQUEST_STATUS.PENDING:
        return "amber";
      case REQUEST_STATUS.ASSIGNED:
        return "purple";
      case REQUEST_STATUS.VALIDATED:
        return "green";
      case REQUEST_STATUS.IN_PROGRESS:
        return "indigo";
      case REQUEST_STATUS.SCHEDULED:
        return "cyan";
      case REQUEST_STATUS.COMPLETED:
        return "emerald";
      case REQUEST_STATUS.CANCELLED:
        return "red";
      default:
        return "gray";
    }
  };
  
  // Fonction pour formater les dates
  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return "N/A";
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  
  // Fonction pour le libellé de la phase
  const getPhaseType = (phase: string | null) => {
    if (!phase) return "N/A";
    
    switch (phase) {
      case "monophase":
        return "Monophasé";
      case "triphase":
        return "Triphasé";
      default:
        return phase;
    }
  };
  
  // Fonction pour le libellé du type de client
  const getClientType = (type: string) => {
    switch (type) {
      case "particulier":
        return "Particulier";
      case "professionnel":
        return "Professionnel";
      case "collectivite":
        return "Collectivité";
      default:
        return type;
    }
  };
  
  // Fonction pour le libellé du type de demande
  const getRequestType = (type: string) => {
    switch (type) {
      case "new_connection":
        return "Nouveau raccordement";
      case "power_upgrade":
        return "Augmentation de puissance";
      case "temporary_connection":
        return "Raccordement temporaire";
      case "relocation":
        return "Déplacement d'ouvrage";
      case "technical_visit":
        return "Visite technique";
      case "other":
        return "Autre";
      default:
        return type;
    }
  };
  
  // Fonction pour le libellé du type de bâtiment
  const getBuildingType = (type: string) => {
    switch (type) {
      case "individual_house":
        return "Maison individuelle";
      case "apartment_building":
        return "Immeuble collectif";
      case "commercial":
        return "Local commercial";
      case "industrial":
        return "Site industriel";
      case "agricultural":
        return "Exploitation agricole";
      case "public":
        return "Bâtiment public";
      case "terrain":
        return "Terrain";
      default:
        return type;
    }
  };
  
  // Fonction pour le libellé de l'état du projet
  const getProjectStatus = (status: string) => {
    switch (status) {
      case "planning":
        return "En phase de planification";
      case "permit_pending":
        return "Permis en cours d'instruction";
      case "permit_approved":
        return "Permis approuvé";
      case "construction_started":
        return "Construction démarrée";
      case "construction_completed":
        return "Construction terminée";
      default:
        return status;
    }
  };
  
  // Fonction pour formater l'action du log
  const formatLogAction = (action: string) => {
    switch (action) {
      case ACTIVITY_ACTIONS.CREATE:
        return "Création";
      case ACTIVITY_ACTIONS.UPDATE:
        return "Mise à jour";
      case ACTIVITY_ACTIONS.ASSIGN:
        return "Assignation";
      case ACTIVITY_ACTIONS.VALIDATE:
        return "Validation";
      case ACTIVITY_ACTIONS.SCHEDULE:
        return "Planification";
      case ACTIVITY_ACTIONS.COMPLETE:
        return "Finalisation";
      case ACTIVITY_ACTIONS.CANCEL:
        return "Annulation";
      case "payment_succeeded":
        return "Paiement réussi";
      case "payment_failed":
        return "Paiement échoué";
      case "certificate_generated":
        return "Certificat généré";
      case "email_sent":
        return "Email envoyé";
      default:
        return action;
    }
  };
  
  // Fonction pour associer une icône à l'action du log
  const getActionIcon = (action: string) => {
    switch (action) {
      case ACTIVITY_ACTIONS.CREATE:
        return <Inbox className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.UPDATE:
        return <FileText className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.ASSIGN:
        return <User className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.VALIDATE:
        return <Check className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.SCHEDULE:
        return <Calendar className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.COMPLETE:
        return <Check className="h-4 w-4" />;
      case ACTIVITY_ACTIONS.CANCEL:
        return <X className="h-4 w-4" />;
      case "payment_succeeded":
        return <Check className="h-4 w-4 text-green-500" />;
      case "payment_failed":
        return <X className="h-4 w-4 text-red-500" />;
      case "certificate_generated":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "email_sent":
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };
  
  // Si on est en train de charger
  if (isLoading) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-[600px] sm:max-w-full overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des détails du client...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Si une erreur est survenue
  if (error || !client) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-[600px] sm:max-w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Détails du client</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Erreur</h3>
            <p className="text-muted-foreground text-center">
              {error instanceof Error ? error.message : "Une erreur est survenue lors de la récupération des détails du client."}
            </p>
            <Button onClick={onClose} className="mt-6">
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  const serviceRequest = client as ServiceRequest;
  
  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-[600px] sm:max-w-full overflow-y-auto">
          <SheetHeader className="mb-1">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-primary" />
                Détails du client
              </div>
              <Badge
                className={`bg-${getStatusColor(serviceRequest.status)}-100 text-${getStatusColor(serviceRequest.status)}-800 hover:bg-${getStatusColor(serviceRequest.status)}-100`}
              >
                <span className="flex items-center">
                  {getStatusIcon(serviceRequest.status)}
                  <span className="ml-1">{getStatusLabel(serviceRequest.status)}</span>
                </span>
              </Badge>
            </SheetTitle>
            <SheetDescription>
              <div className="flex justify-between flex-wrap items-start">
                <span>
                  Référence: <span className="font-semibold">{serviceRequest.referenceNumber}</span>
                </span>
                <span>
                  Créée le: {formatDate(serviceRequest.createdAt)}
                </span>
              </div>
            </SheetDescription>
          </SheetHeader>
          
          <Separator className="my-4" />
          
          <div className="flex justify-end space-x-2 mb-4">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => {
                const tel = serviceRequest.phone.replace(/\s/g, '');
                window.open(`tel:${tel}`, '_blank');
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Appeler
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Envoyer un email
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info">
                <UserCircle className="h-4 w-4 mr-1" />
                Infos client
              </TabsTrigger>
              <TabsTrigger value="tech">
                <Building className="h-4 w-4 mr-1" />
                Infos techniques
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-1" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[calc(90vh-200px)]">
              <TabsContent value="info" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Informations client
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Nom</span>
                        <span className="font-medium">{serviceRequest.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{serviceRequest.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Téléphone</span>
                        <span className="font-medium">{serviceRequest.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{getClientType(serviceRequest.clientType)}</span>
                      </div>
                      {serviceRequest.company && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Entreprise</span>
                          <span className="font-medium">{serviceRequest.company}</span>
                        </div>
                      )}
                      {serviceRequest.siret && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">SIRET</span>
                          <span className="font-medium">{serviceRequest.siret}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-red-500" />
                      Adresse du site
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Adresse</span>
                        <span className="font-medium">{serviceRequest.address}</span>
                      </div>
                      {serviceRequest.addressComplement && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Complément</span>
                          <span className="font-medium">{serviceRequest.addressComplement}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Ville</span>
                        <span className="font-medium">{serviceRequest.city}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Code postal</span>
                        <span className="font-medium">{serviceRequest.postalCode}</span>
                      </div>
                      {serviceRequest.cadastralReference && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Référence cadastrale</span>
                          <span className="font-medium">{serviceRequest.cadastralReference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {serviceRequest.billingAddress && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <TagIcon className="h-5 w-5 mr-2 text-green-500" />
                        Adresse de facturation
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Adresse</span>
                          <span className="font-medium">{serviceRequest.billingAddress}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Ville</span>
                          <span className="font-medium">{serviceRequest.billingCity}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Code postal</span>
                          <span className="font-medium">{serviceRequest.billingPostalCode}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <ClientCertificate 
                    clientId={serviceRequest.id}
                    referenceNumber={serviceRequest.referenceNumber}
                    showTitle={true}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="tech" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Clipboard className="h-5 w-5 mr-2 text-amber-500" />
                      Informations de la demande
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Type de demande</span>
                        <span className="font-medium">{getRequestType(serviceRequest.requestType)}</span>
                      </div>
                      {serviceRequest.requestType === "other" && serviceRequest.otherRequestTypeDesc && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Précision</span>
                          <span className="font-medium">{serviceRequest.otherRequestTypeDesc}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Type de bâtiment</span>
                        <span className="font-medium">{getBuildingType(serviceRequest.buildingType)}</span>
                      </div>
                      {serviceRequest.buildingType === "terrain" && serviceRequest.terrainViabilise && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">État du terrain</span>
                          <span className="font-medium">
                            {serviceRequest.terrainViabilise === "viabilise" ? "Viabilisé" : "Non viabilisé"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <TagIcon className="h-5 w-5 mr-2 text-purple-500" />
                      État du projet
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Statut</span>
                        <span className="font-medium">{getProjectStatus(serviceRequest.projectStatus)}</span>
                      </div>
                      {serviceRequest.permitNumber && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Numéro de permis</span>
                          <span className="font-medium">{serviceRequest.permitNumber}</span>
                        </div>
                      )}
                      {serviceRequest.permitDeliveryDate && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Date de délivrance</span>
                          <span className="font-medium">{serviceRequest.permitDeliveryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <TagIcon className="h-5 w-5 mr-2 text-yellow-500" />
                      Puissance
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Puissance demandée</span>
                        <span className="font-medium">{serviceRequest.powerRequired} kVA</span>
                      </div>
                      {serviceRequest.phaseType && (
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Type de phase</span>
                          <span className="font-medium">{getPhaseType(serviceRequest.phaseType)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {serviceRequest.desiredCompletionDate && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        Planning
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Date souhaitée</span>
                          <span className="font-medium">{serviceRequest.desiredCompletionDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {serviceRequest.hasArchitect && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <User className="h-5 w-5 mr-2 text-indigo-500" />
                        Architecte
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {serviceRequest.architectName && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Nom</span>
                            <span className="font-medium">{serviceRequest.architectName}</span>
                          </div>
                        )}
                        {serviceRequest.architectPhone && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Téléphone</span>
                            <span className="font-medium">{serviceRequest.architectPhone}</span>
                          </div>
                        )}
                        {serviceRequest.architectEmail && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{serviceRequest.architectEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {serviceRequest.comments && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <TagIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Commentaires
                      </h3>
                      <div className="border rounded-md p-3">
                        <p className="whitespace-pre-wrap">{serviceRequest.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <div className="space-y-4">
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="history"
                    className="mb-4"
                  >
                    <AccordionItem value="history">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center">
                          <History className="h-5 w-5 mr-2 text-blue-600" />
                          <span>Historique des activités</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {logsLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : !activityLogs || activityLogs.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            Aucune activité enregistrée
                          </div>
                        ) : (
                          <div className="space-y-3 py-2">
                            {activityLogs.map((log: any) => (
                              <div
                                key={log.id}
                                className="relative border rounded-md p-3"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center">
                                    <span className="rounded-full p-1.5 bg-blue-100 mr-2">
                                      {getActionIcon(log.action)}
                                    </span>
                                    <span className="font-medium">
                                      {formatLogAction(log.action)}
                                    </span>
                                  </div>
                                  <Badge variant="outline">
                                    {formatDate(log.createdAt)}
                                  </Badge>
                                </div>
                                <div className="text-sm pl-7 text-muted-foreground">
                                  {log.details}
                                </div>
                                {log.ipAddress && (
                                  <div className="text-xs mt-2 text-muted-foreground flex items-center pl-7">
                                    <span>IP: {log.ipAddress}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Accordion
                    type="single"
                    collapsible
                    className="mb-4"
                  >
                    <AccordionItem value="payment">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          <span>Informations de paiement</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Statut</span>
                            <Badge variant={serviceRequest.paymentStatus === "succeeded" ? "default" : serviceRequest.paymentStatus === "failed" ? "destructive" : "outline"}>
                              {serviceRequest.paymentStatus || "Non payé"}
                            </Badge>
                          </div>
                          {serviceRequest.paymentId && (
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-muted-foreground">ID Transaction</span>
                              <span className="font-medium font-mono text-sm">
                                {serviceRequest.paymentId}
                              </span>
                            </div>
                          )}
                          {serviceRequest.paymentMethod && (
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-muted-foreground">Méthode</span>
                              <span className="font-medium">
                                {serviceRequest.paymentMethod}
                              </span>
                            </div>
                          )}
                          {serviceRequest.paymentDate && (
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-muted-foreground">Date</span>
                              <span className="font-medium">
                                {formatDate(serviceRequest.paymentDate)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Montant</span>
                            <span className="font-medium">
                              129,80 € TTC
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {serviceRequest.notes && (
                    <Accordion
                      type="single"
                      collapsible
                      className="mb-4"
                    >
                      <AccordionItem value="notes">
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-amber-600" />
                            <span>Notes internes</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-3 border rounded-md whitespace-pre-wrap">
                            {serviceRequest.notes}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>
      
      {/* Dialogue d'envoi d'email */}
      {showEmailDialog && (
        <ClientEmailDialog
          clientEmail={serviceRequest.email}
          clientName={serviceRequest.name}
          referenceNumber={serviceRequest.referenceNumber}
          isOpen={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
        />
      )}
    </>
  );
}