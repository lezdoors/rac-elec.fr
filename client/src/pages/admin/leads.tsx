import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { Loader2, Search, Download, User, X, AlertTriangle, ArrowRightCircle, UserPlus, Mail, Info as InfoIcon, UserCheck, Plus, Clock, CheckCircle, XCircle, Calendar, PhoneCall } from "lucide-react";
import { ServiceRequest, LEAD_STATUS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { IncompleteLeadsTab } from "@/components/admin/incomplete-tab";
import { AllLeadsTab } from "@/components/admin/all-tab";
import { NewLeadsTab } from "@/components/admin/new-tab";
import { LeadCreationModal } from "@/components/admin/lead-creation-modal";
import { LeadDetailsTabs } from "@/components/admin/lead-details-tabs";
import { AppointmentModal } from "@/components/admin/appointment-modal";
import { LeadActionsMenu } from "@/components/admin/lead-actions-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportLeadToPDF, exportLeadsToCSV } from "@/services/lead-pdf-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LeadsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // États pour les dialogues
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLeadCreationModalOpen, setIsLeadCreationModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  // Pagination
  const ITEMS_PER_PAGE = 20;
  
  // Récupérer les leads incomplets (formulaires partiellement remplis)
  const { data: incompleteLeadsData, isLoading: incompleteLeadsLoading, refetch: refetchIncompleteLeads } = useQuery<{ 
    success: boolean, 
    leads: any[], 
    pagination: { total: number, totalPages: number, currentPage: number, perPage: number } 
  }>({ 
    queryKey: ["/api/leads/incomplete", { page: currentPage, limit: ITEMS_PER_PAGE }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const { page, limit } = params as { page: number, limit: number };
      const response = await fetch(`${url}?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des leads');
      }
      return response.json();
    },
    enabled: activeTab === 'incomplete'
  });
  
  // Récupérer tous les leads pour l'onglet "Tous"
  const { data: allLeadsData, isLoading: allLeadsLoading, refetch: refetchAllLeads } = useQuery<{ 
    success: boolean, 
    leads: any[], 
    pagination: { total: number, totalPages: number, currentPage: number, perPage: number } 
  }>({ 
    queryKey: ["/api/leads/all", { page: currentPage, limit: ITEMS_PER_PAGE }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const { page, limit } = params as { page: number, limit: number };
      const response = await fetch(`/api/leads?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des leads');
      }
      const data = await response.json();
      // Vérifier si les données sont dans le format attendu ou les adapter
      if (data.success && Array.isArray(data.leads)) {
        // Les données sont déjà dans le bon format
        return data;
      } else if (Array.isArray(data)) {
        // Si l'API renvoie directement un tableau, adapter au format attendu
        return {
          success: true,
          leads: data,
          pagination: {
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
            currentPage: page,
            perPage: limit
          }
        };
      } else {
        // Autre format, essayer d'extraire les leads
        console.error("Format de données inattendu:", data);
        return {
          success: true,
          leads: [],
          pagination: {
            total: 0,
            totalPages: 1,
            currentPage: page,
            perPage: limit
          }
        };
      }
    },
    enabled: activeTab === 'all'
  });
  
  // Récupérer les nouveaux leads pour l'onglet "Nouveaux"
  const { data: newLeadsData, isLoading: newLeadsLoading, refetch: refetchNewLeads } = useQuery<{ 
    success: boolean, 
    leads: any[], 
    pagination: { total: number, totalPages: number, currentPage: number, perPage: number } 
  }>({ 
    queryKey: ["/api/leads/new", { page: currentPage, limit: ITEMS_PER_PAGE }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const { page, limit } = params as { page: number, limit: number };
      // Pour le moment, nous utilisons les mêmes leads que "tous" avec un filtre pour montrer uniquement 
      // les leads créés dans les dernières 24 heures ou avec un statut spécifique "nouveau"
      const response = await fetch(`/api/leads?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des nouveaux leads');
      }
      const data = await response.json();
      
      // Déterminer la source des leads à filtrer
      let leadsToFilter = [];
      if (data.success && Array.isArray(data.leads)) {
        leadsToFilter = data.leads;
      } else if (Array.isArray(data)) {
        leadsToFilter = data;
      } else {
        console.error("Format de données inattendu pour les nouveaux leads:", data);
        return {
          success: true,
          leads: [],
          pagination: {
            total: 0,
            totalPages: 1,
            currentPage: page,
            perPage: limit
          }
        };
      }
      
      // Filtrer pour n'afficher que les leads créés lors des dernières 24 heures
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const newLeads = leadsToFilter.filter((lead: any) => {
        if (!lead.createdAt) return false;
        const createdAt = new Date(lead.createdAt);
        return createdAt >= oneDayAgo;
      });
      
      return {
        success: true,
        leads: newLeads,
        pagination: {
          total: newLeads.length,
          totalPages: Math.ceil(newLeads.length / limit),
          currentPage: page,
          perPage: limit
        }
      };
    },
    enabled: activeTab === 'new'
  });
  
  // Effet pour réinitialiser la page à 1 quand l'onglet change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  // Effet pour rafraîchir les données quand on change de page ou d'onglet
  useEffect(() => {
    if (activeTab === "incomplete") {
      refetchIncompleteLeads();
    } else if (activeTab === "all") {
      refetchAllLeads();
    } else if (activeTab === "new") {
      refetchNewLeads();
    }
  }, [currentPage, activeTab, refetchIncompleteLeads, refetchAllLeads, refetchNewLeads]);
  
  // Récupération des détails d'un lead
  const fetchLeadDetails = async (id: number) => {
    if (!id) return null;
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du lead');
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur de récupération des détails du lead:", error);
      return null;
    }
  };
  
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  
  // États pour les actions du lead
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Effet pour charger les détails du lead lorsqu'on ouvre le dialogue
  useEffect(() => {
    const loadLeadDetails = async () => {
      if (selectedLeadId && isDetailsDialogOpen) {
        setLeadDetailsLoading(true);
        const details = await fetchLeadDetails(selectedLeadId);
        setLeadDetails(details?.lead || null);
        setLeadDetailsLoading(false);
      }
    };
    
    loadLeadDetails();
    
    // Nettoyer les détails quand on ferme le dialogue
    return () => {
      if (!isDetailsDialogOpen) {
        setLeadDetails(null);
      }
    };
  }, [selectedLeadId, isDetailsDialogOpen]);
  
  // Fonction pour convertir un lead en demande
  const convertLeadToRequest = async (leadId: number) => {
    if (!leadId) return;
    
    try {
      setIsActionLoading(true);
      const response = await apiRequest("POST", `/api/leads/${leadId}/convert`, {});
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Conversion réussie",
          description: `Le lead a été converti en demande #${data.referenceNumber}`,
        });
        setIsDetailsDialogOpen(false);
        refetchIncompleteLeads();
      } else {
        toast({
          title: "Erreur de conversion",
          description: data.message || "Une erreur est survenue lors de la conversion du lead",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la conversion du lead",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fonction pour ouvrir le dialogue de détails
  const openDetailsDialog = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsDetailsDialogOpen(true);
  };

  // Fonction pour ouvrir le dialogue d'assignation
  const openAssignDialog = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsAssignDialogOpen(true);
  };
  
  // Fonction pour ouvrir la modale de rendez-vous
  const openAppointmentModal = (leadId: number) => {
    setSelectedLeadId(leadId);
    setIsAppointmentModalOpen(true);
  };
  
  // Fonctions de navigation pour la pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    const currentData = 
      activeTab === "incomplete" ? incompleteLeadsData : 
      activeTab === "all" ? allLeadsData :
      newLeadsData;
    
    if (currentData && currentPage < currentData.pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Gestionnaire pour la création d'un lead via la modale
  const handleLeadCreated = () => {
    // Rafraîchir tous les onglets après la création d'un lead
    refetchIncompleteLeads();
    refetchAllLeads();
    refetchNewLeads();
  };
  
  // Mutation pour assigner un lead à un utilisateur
  const assignLeadMutation = useMutation({
    mutationFn: async ({ leadId, userId, priority, note }: { leadId: number, userId: number, priority: string, note?: string }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/assign`, { userId, priority, note });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Lead assigné",
          description: data.message || "Le lead a été assigné avec succès",
        });
        setIsAssignDialogOpen(false);
        // Rafraîchir les données en fonction de l'onglet actif
        if (activeTab === "incomplete") refetchIncompleteLeads();
        if (activeTab === "all") refetchAllLeads();
        if (activeTab === "new") refetchNewLeads();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Un problème est survenu lors de l'assignation du lead",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Erreur lors de l'assignation du lead:", error);
      toast({
        title: "Erreur",
        description: error.message || "Un problème est survenu lors de l'assignation du lead",
        variant: "destructive",
      });
    }
  });
  
  // Fonction pour assigner un lead
  const assignLead = (leadId: number, userId: number, priority: string, note?: string) => {
    assignLeadMutation.mutate({ leadId, userId, priority, note });
  };

  // Mutation pour supprimer un lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await apiRequest("DELETE", `/api/leads/${leadId}`);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Lead supprimé",
          description: "Le lead a été supprimé avec succès",
        });
        setIsDetailsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        queryClient.invalidateQueries({ queryKey: ['/api/leads/incomplete'] });
        queryClient.invalidateQueries({ queryKey: ['/api/leads/new'] });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Un problème est survenu lors de la suppression",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Un problème est survenu lors de la suppression",
        variant: "destructive",
      });
    }
  });

  // Fonction pour supprimer un lead avec confirmation
  const handleDeleteLead = (leadId: number) => {
    setLeadToDelete(leadId);
    setShowDeleteDialog(true);
  };
  
  // Confirmer la suppression du lead
  const confirmDeleteLead = () => {
    if (leadToDelete) {
      deleteLeadMutation.mutate(leadToDelete);
      setShowDeleteDialog(false);
      setLeadToDelete(null);
    }
  };

  // Fonction pour exporter un lead en PDF
  const handleExportPDF = async () => {
    if (!leadDetails) return;
    
    try {
      setIsPdfExporting(true);
      await exportLeadToPDF(leadDetails);
      toast({
        title: "Exportation réussie",
        description: "Le PDF a été généré et téléchargé",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'exportation PDF:", error);
      toast({
        title: "Erreur d'exportation",
        description: error.message || "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setIsPdfExporting(false);
    }
  };
  
  // Pas besoin de la fonction createNewLead puisque nous utilisons la LeadCreationModal
  // qui a déjà son propre système de mutation pour créer un lead
  
  // Compteurs pour les onglets
  const statusCounts = {
    all: allLeadsData?.pagination?.total || 0,
    incomplete: incompleteLeadsData?.pagination?.total || 0,
    new: newLeadsData?.pagination?.total || 0,
    pending: 0,
    inProgress: 0,
    validated: 0,
    completed: 0,
    cancelled: 0
  };

  return (
    <AdminLayout title="Leads" description="Gestion des leads et prospects">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">
              Gestion des prospects et demandes entrantes
            </p>
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            {/* Indicateur de statut en temps réel géré par AdminLayout */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  // Déterminer quels leads exporter en fonction de l'onglet actif
                  const leadsToExport = activeTab === "incomplete" 
                    ? incompleteLeadsData?.leads 
                    : activeTab === "all" 
                      ? allLeadsData?.leads 
                      : newLeadsData?.leads;
                  
                  if (leadsToExport && leadsToExport.length > 0) {
                    await exportLeadsToCSV(leadsToExport);
                    toast({
                      title: "Exportation réussie",
                      description: `${leadsToExport.length} leads ont été exportés au format CSV`,
                    });
                  } else {
                    toast({
                      title: "Aucune donnée à exporter",
                      description: "Il n'y a aucun lead à exporter dans cet onglet",
                      variant: "default",
                    });
                  }
                } catch (error: any) {
                  console.error("Erreur lors de l'exportation CSV:", error);
                  toast({
                    title: "Erreur d'exportation",
                    description: error.message || "Impossible d'exporter les leads au format CSV",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => setIsLeadCreationModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Lead
            </Button>
          </div>
        </div>

        <Tabs defaultValue="incomplete" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                Tous
                <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="incomplete" className="relative">
                Incomplets
                <Badge variant="secondary" className="ml-2">{incompleteLeadsData?.pagination?.total || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="new" className="relative">
                Nouveaux
                <Badge variant="secondary" className="ml-2">{statusCounts.new}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Contenu des onglets */}
          <TabsContent value="all" className="m-0">
            <AllLeadsTab
              leadsLoading={allLeadsLoading}
              allLeadsData={allLeadsData}
              currentPage={currentPage}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              openDetailsDialog={openDetailsDialog}
              openAssignDialog={openAssignDialog}
            />
          </TabsContent>
          
          <TabsContent value="incomplete" className="m-0">
            <IncompleteLeadsTab
              leadsLoading={incompleteLeadsLoading}
              incompleteLeadsData={incompleteLeadsData}
              currentPage={currentPage}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              openDetailsDialog={openDetailsDialog}
              openAssignDialog={openAssignDialog}
            />
          </TabsContent>
          
          <TabsContent value="new" className="m-0">
            <NewLeadsTab
              leadsLoading={newLeadsLoading}
              newLeadsData={newLeadsData}
              currentPage={currentPage}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              openDetailsDialog={openDetailsDialog}
              openAssignDialog={openAssignDialog}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogue de détails */}
      {isDetailsDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Détails du lead</h2>
                {leadDetails && leadDetails.referenceNumber && (
                  <p className="text-sm text-muted-foreground font-mono">{leadDetails.referenceNumber}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailsDialogOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {leadDetailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : !leadDetails ? (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-md">
                <p className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Aucune information disponible.
                </p>
              </div>
            ) : (
              <>
                {/* Barre de statut et actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-slate-50 p-3 rounded-md">
                  <div className="flex items-center flex-wrap gap-3">
                    <div className="bg-white px-3 py-1 rounded-full border flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${leadDetails.isCompleted ? "bg-green-500" : "bg-amber-500"}`}></span>
                      <span className="text-sm font-medium">
                        {leadDetails.isCompleted ? "Complet" : "Incomplet"}
                      </span>
                    </div>
                    
                    <div className="bg-white px-3 py-1 rounded-full border flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-sm">{new Date(leadDetails.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    
                    <div className="bg-white px-3 py-1 rounded-full border">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-1.5">Progression:</span>
                        <span className="text-xs font-medium">{Math.max(1, leadDetails.completedSteps || 1)}/5</span>
                        <div className="ml-2 bg-slate-200 w-16 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${Math.floor(((Math.max(1, leadDetails.completedSteps || 1)) / 5) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-auto" onClick={() => setIsAssignDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assigner
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-auto"
                      onClick={() => openAppointmentModal(leadDetails.id)}
                    >
                      <PhoneCall className="h-4 w-4 mr-1" />
                      Nouveau RDV
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1 sm:flex-auto"
                      onClick={() => convertLeadToRequest(leadDetails.id)}
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <ArrowRightCircle className="h-4 w-4 mr-1" />
                          Convertir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Informations générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">ID:</span>
                          <span className="font-mono">{leadDetails.id}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Créé le:</span>
                          <span>{new Date(leadDetails.createdAt).toLocaleString("fr-FR")}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Modifié le:</span>
                          <span>{new Date(leadDetails.updatedAt).toLocaleString("fr-FR")}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Source:</span>
                          <span>
                            {leadDetails.ipAddress ? (
                              <Tooltip content={leadDetails.userAgent}>
                                <div className="cursor-help flex items-center">
                                  {leadDetails.geoLocation?.flag && (
                                    <span className="mr-2 text-lg" aria-label={`Drapeau ${leadDetails.geoLocation.countryName}`}>
                                      {leadDetails.geoLocation.flag}
                                    </span>
                                  )}
                                  {leadDetails.ipAddress}
                                  {leadDetails.geoLocation?.countryName && (
                                    <span className="ml-2 text-xs text-slate-500">
                                      ({leadDetails.geoLocation.countryName})
                                    </span>
                                  )}
                                </div>
                              </Tooltip>
                            ) : (
                              "Aucune"
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base font-medium">Informations de contact</CardTitle>
                          <LeadActionsMenu
                            leadId={leadDetails.id}
                            phone={leadDetails.phone}
                            email={leadDetails.email}
                            firstName={leadDetails.firstName}
                            lastName={leadDetails.lastName} 
                            currentStatus={leadDetails.status || ''}
                            hasContract={leadDetails.hasContract || false}
                            onRequestAppointment={() => openAppointmentModal(leadDetails.id)}
                            onExportPDF={handleExportPDF}
                            onDelete={() => handleDeleteLead(leadDetails.id)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Nom:</span>
                          <span>
                            {(leadDetails.firstName || leadDetails.lastName) ? 
                              `${leadDetails.firstName || ''} ${leadDetails.lastName || ''}`.trim() : 
                              (leadDetails.email ? `<${leadDetails.email}>` : "Non renseigné")}
                          </span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Email:</span>
                          <span>{leadDetails.email ? (
                            <a href={`mailto:${leadDetails.email}`} className="text-blue-600 hover:underline">
                              {leadDetails.email}
                            </a>
                          ) : "Non renseigné"}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Téléphone:</span>
                          <span>{leadDetails.phone ? (
                            <a href={`tel:${leadDetails.phone}`} className="text-blue-600 hover:underline">
                              {leadDetails.phone}
                            </a>
                          ) : "Non renseigné"}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-1">
                          <span className="text-slate-500">Type de client:</span>
                          <span>{leadDetails.clientType === "particulier" ? "Particulier" : 
                            leadDetails.clientType === "professionnel" ? "Professionnel" : 
                            "Non renseigné"}</span>
                        </div>
                        {leadDetails.clientType === "professionnel" && (
                          <>
                            <div className="grid grid-cols-[120px_1fr] gap-1">
                              <span className="text-slate-500">Entreprise:</span>
                              <span>{leadDetails.company || "Non renseigné"}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-1">
                              <span className="text-slate-500">SIRET:</span>
                              <span>{leadDetails.siret || "Non renseigné"}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <LeadDetailsTabs leadDetails={leadDetails} />
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Fermer</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Dialogue d'assignation */}
      {isAssignDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Assigner le lead</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAssignDialogOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedLeadId && (
              <div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <InfoIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        Vous allez assigner <span className="font-medium">Lead #{selectedLeadId}</span> à un membre de l'équipe commerciale.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assignee">Sélectionner un utilisateur</Label>
                    <Select name="assignee">
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Marina Alves</SelectItem>
                        <SelectItem value="2">Thomas Dupont</SelectItem>
                        <SelectItem value="3">Sara Benali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Note (optionnelle)</Label>
                    <Textarea name="note" placeholder="Ajouter une note pour le destinataire..." className="resize-none" rows={3} />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Annuler</Button>
                  <Button 
                    disabled={assignLeadMutation.isPending || isActionLoading}
                    onClick={() => {
                      const userId = Number((document.querySelector('select[name="assignee"]') as HTMLSelectElement)?.value);
                      const priority = (document.querySelector('select[name="priority"]') as HTMLSelectElement)?.value;
                      const note = (document.querySelector('textarea[name="note"]') as HTMLTextAreaElement)?.value;
                      if (selectedLeadId && userId && priority) {
                        assignLead(selectedLeadId, userId, priority, note);
                      } else {
                        toast({
                          title: "Erreur",
                          description: "Veuillez sélectionner un utilisateur et une priorité",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {assignLeadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assigner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modale de création de lead */}
      <LeadCreationModal 
        isOpen={isLeadCreationModalOpen} 
        onClose={() => setIsLeadCreationModalOpen(false)} 
        onLeadCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/leads/all"] });
          queryClient.invalidateQueries({ queryKey: ["/api/leads/incomplete"] });
          queryClient.invalidateQueries({ queryKey: ["/api/leads/new"] });
        }} 
      />
      
      {/* Modale de rendez-vous */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        leadId={selectedLeadId}
        leadInfo={leadDetails ? {
          firstName: leadDetails.firstName,
          lastName: leadDetails.lastName,
          phone: leadDetails.phone,
          email: leadDetails.email
        } : undefined}
      />
      
      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lead ?
              <br /><br />
              <span className="text-red-600 font-medium">Cette action est irréversible.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLead}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
