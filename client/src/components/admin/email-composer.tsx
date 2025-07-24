import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Send, Mail, Loader2, Search, Plus, Info, FileText, User, List, ChevronRight, Upload, Signature, PlusCircle, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { SignatureWizard } from "@/components/admin/signature-wizard";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

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

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string;
  selectedLead?: Lead | null;
  selectedServiceRequest?: ServiceRequest | null;
}

// Nouveau composeur d'email simplifié - redesign pour une meilleure UX
export function EmailComposer({
  isOpen,
  onClose,
  initialRecipient = "",
  initialSubject = "",
  initialBody = "",
  selectedLead = null,
  selectedServiceRequest = null,
}: EmailComposerProps) {
  const { toast } = useToast();
  
  // États de base
  const [recipient, setRecipient] = useState(initialRecipient);
  const [recipients, setRecipients] = useState<string[]>(initialRecipient ? [initialRecipient] : []);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Lead | ServiceRequest>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  
  // État pour les modèles
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // État pour l'assistant de signature
  const [signatureWizardOpen, setSignatureWizardOpen] = useState(false);
  const [signature, setSignature] = useState("");
  
  // Mutation pour envoyer un email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      const res = await apiRequest("POST", "/api/send-email", emailData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de l'email");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "Votre email a été envoyé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-logs"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Chargement des modèles d'email
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await apiRequest("GET", "/api/email-templates");
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setTemplates(data);
          } else if (data && data.templates && Array.isArray(data.templates)) {
            setTemplates(data.templates);
          } else {
            setTemplates([]);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des modèles d'email:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [isOpen]);
  
  // Mise à jour des champs lorsque le lead ou la demande change
  useEffect(() => {
    if (selectedLead) {
      // Si un lead a été fourni au composant
      setRecipient(selectedLead.email);
      if (!recipients.includes(selectedLead.email)) {
        setRecipients([...recipients, selectedLead.email]);
      }
    }
  }, [selectedLead]);

  useEffect(() => {
    if (selectedServiceRequest) {
      // Si une demande a été fournie au composant
      setRecipient(selectedServiceRequest.clientEmail);
      if (!recipients.includes(selectedServiceRequest.clientEmail)) {
        setRecipients([...recipients, selectedServiceRequest.clientEmail]);
      }
    }
  }, [selectedServiceRequest]);
  
  // Fonction de recherche unifiée pour leads et demandes
  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Recherche de leads - méthode robuste avec plusieurs essais
      let leadsResults: Lead[] = [];
      let leadsFound = false;
      
      // Essai 1: /api/leads/search
      try {
        const response = await apiRequest("GET", `/api/leads/search?term=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.leads && Array.isArray(data.leads)) {
            leadsResults = data.leads;
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
              leadsResults = data.leads;
              leadsFound = true;
              console.log("Leads trouvés via /api/leads?search=", data.leads.length);
            } else if (Array.isArray(data)) {
              leadsResults = data;
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
            leadsResults = allLeads.filter(lead => {
              return (
                lead.firstName.toLowerCase().includes(searchTermLower) ||
                lead.lastName.toLowerCase().includes(searchTermLower) ||
                lead.email.toLowerCase().includes(searchTermLower) ||
                (lead.phone && lead.phone.includes(searchTerm)) ||
                (lead.referenceNumber && lead.referenceNumber.toLowerCase().includes(searchTermLower))
              );
            });
            
            console.log("Leads trouvés par filtrage local", leadsResults.length);
          }
        } catch (error) {
          console.error("Impossible de récupérer les leads:", error);
        }
      }
      
      // Recherche de demandes de service
      let requestsResults: ServiceRequest[] = [];
      let requestsFound = false;
      
      // Essai 1: /api/service-requests/search
      try {
        const requestsResponse = await apiRequest("GET", `/api/service-requests/search?term=${encodeURIComponent(searchTerm)}`);
        if (requestsResponse.ok) {
          const data = await requestsResponse.json();
          if (data && data.requests && Array.isArray(data.requests)) {
            requestsResults = data.requests;
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
              requestsResults = data.requests;
              requestsFound = true;
            } else if (Array.isArray(data)) {
              requestsResults = data;
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
            requestsResults = allRequests.filter(request => {
              return (
                request.clientName.toLowerCase().includes(searchTermLower) ||
                request.clientEmail.toLowerCase().includes(searchTermLower) ||
                request.clientPhone.includes(searchTerm) ||
                request.referenceNumber.toLowerCase().includes(searchTermLower)
              );
            });
          }
        } catch (error) {
          console.error("Impossible de récupérer les demandes:", error);
        }
      }
      
      // Combiner les résultats
      const combinedResults = [...leadsResults, ...requestsResults];
      setSearchResults(combinedResults);
      setSearchPopoverOpen(combinedResults.length > 0);
      
      if (combinedResults.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucun lead ou demande ne correspond à votre recherche",
        });
      } else {
        console.log(`${combinedResults.length} résultats trouvés au total (${leadsResults.length} leads, ${requestsResults.length} demandes)`);
      }
      
    } catch (error) {
      console.error("Erreur globale lors de la recherche:", error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible de charger les résultats",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Gestion du changement de modèle
  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      setSelectedTemplate("none");
      return;
    }
    
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    
    if (template) {
      // Application du modèle
      let personalizedSubject = template.subject;
      let personalizedBody = template.body;
      
      // Personnalisation avec les données du lead ou de la demande
      if (selectedLead) {
        personalizedSubject = personalizedSubject
          .replace(/\{nom\}/gi, `${selectedLead.firstName} ${selectedLead.lastName}`)
          .replace(/\{prenom\}/gi, selectedLead.firstName)
          .replace(/\{reference\}/gi, selectedLead.referenceNumber || '');
          
        personalizedBody = personalizedBody
          .replace(/\{nom\}/gi, `${selectedLead.firstName} ${selectedLead.lastName}`)
          .replace(/\{prenom\}/gi, selectedLead.firstName)
          .replace(/\{reference\}/gi, selectedLead.referenceNumber || '');
      }
      
      // Personnalisation avec les données de la demande de service
      if (selectedServiceRequest) {
        personalizedSubject = personalizedSubject
          .replace(/\{nom\}/gi, selectedServiceRequest.clientName)
          .replace(/\{reference\}/gi, selectedServiceRequest.referenceNumber);
          
        personalizedBody = personalizedBody
          .replace(/\{nom\}/gi, selectedServiceRequest.clientName)
          .replace(/\{reference\}/gi, selectedServiceRequest.referenceNumber);
      }
      
      setSubject(personalizedSubject);
      setBody(personalizedBody);
      
      toast({
        title: "Modèle appliqué",
        description: `Le modèle "${template.name}" a été appliqué au message`,
      });
    }
  };
  
  // Ajouter un destinataire
  const addRecipient = (email: string) => {
    if (!email || recipients.includes(email)) return;
    
    setRecipients([...recipients, email]);
    setRecipient("");
    setSearchPopoverOpen(false);
  };
  
  // Supprimer un destinataire
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };
  
  // Gérer la sélection d'un résultat de recherche
  const handleResultSelect = (result: Lead | ServiceRequest) => {
    const email = 'clientEmail' in result ? result.clientEmail : result.email;
    addRecipient(email);
    
    toast({
      title: "Destinataire ajouté",
      description: `${email} a été ajouté aux destinataires`
    });
  };
  
  // Envoyer l'email
  const handleSendEmail = () => {
    if (recipients.length === 0) {
      toast({
        title: "Destinataire manquant",
        description: "Veuillez ajouter au moins un destinataire",
        variant: "destructive",
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "Sujet manquant",
        description: "Veuillez ajouter un sujet à votre email",
        variant: "destructive",
      });
      return;
    }
    
    if (!body) {
      toast({
        title: "Contenu manquant",
        description: "Veuillez ajouter du contenu à votre email",
        variant: "destructive",
      });
      return;
    }
    
    const emailData = {
      to: recipients.join(","),
      subject,
      content: body,
      leadId: selectedLead?.id,
      serviceRequestId: selectedServiceRequest?.id,
      templateId: selectedTemplate || undefined,
    };
    
    sendEmailMutation.mutate(emailData);
  };
  
  // Fonction pour déterminer le type d'un résultat de recherche
  const isLead = (result: Lead | ServiceRequest): result is Lead => {
    return 'firstName' in result;
  };

  // Gérer l'ajout de signature
  const handleAddSignature = (html: string) => {
    setSignature(html);
    setBody(body + "\n\n" + html);
    setSignatureWizardOpen(false);
    toast({
      title: "Signature ajoutée",
      description: "Votre signature a été ajoutée à l'email",
    });
  };

  return (
    <>
      {/* Assistant de signature */}
      <SignatureWizard 
        isOpen={signatureWizardOpen} 
        onClose={() => setSignatureWizardOpen(false)} 
        onSave={handleAddSignature}
        initialHtml={signature}
      />
      
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Nouveau message
            </DialogTitle>
            <DialogDescription>
              Composez votre email et envoyez-le à vos contacts
            </DialogDescription>
          </DialogHeader>
        
        <div className="overflow-y-auto p-1" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Section destinataires */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="recipient" className="text-sm font-medium mb-1 text-muted-foreground">À:</Label>
                
                <div className="flex items-center gap-2">
                  <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Search className="h-3.5 w-3.5" />
                        <span className="text-xs">Rechercher</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="p-3 border-b">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Nom, email, référence..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-8 px-3"
                            onClick={handleSearch}
                            disabled={isSearching || !searchTerm}
                          >
                            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto p-0">
                        {searchResults.length > 0 ? (
                          <div className="divide-y">
                            {searchResults.map((result) => (
                              <div 
                                key={isLead(result) ? `lead-${result.id}` : `request-${result.id}`}
                                className="p-2.5 hover:bg-muted flex items-center justify-between cursor-pointer"
                                onClick={() => handleResultSelect(result)}
                              >
                                <div className="overflow-hidden">
                                  <div className="flex items-center gap-2">
                                    {isLead(result) ? (
                                      <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    )}
                                    <div>
                                      <p className="text-sm font-medium truncate">
                                        {isLead(result) 
                                          ? `${result.firstName} ${result.lastName}` 
                                          : result.clientName}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {isLead(result) ? result.email : result.clientEmail}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        ) : isSearching ? (
                          <div className="p-6 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground opacity-50 mb-2" />
                            <p className="text-sm text-muted-foreground">Recherche en cours...</p>
                          </div>
                        ) : searchTerm ? (
                          <div className="p-6 text-center">
                            <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <Search className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
                            <p className="text-sm text-muted-foreground">Recherchez des contacts par nom, email ou référence</p>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex items-center gap-1">
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="h-8 text-xs w-44">
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun modèle</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" title="Gérer les modèles">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Gérer les modèles d'emails
                          </DialogTitle>
                          <DialogDescription>
                            Créez et personnalisez vos modèles d'emails pour une utilisation rapide
                          </DialogDescription>
                        </DialogHeader>
                        
                        {/* Nouveau modèle */}
                        <Tabs defaultValue="new" className="mt-4">
                          <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="new" className="flex items-center gap-1">
                              <PlusCircle className="h-4 w-4" />
                              <span>Nouveau modèle</span>
                            </TabsTrigger>
                            <TabsTrigger value="list" className="flex items-center gap-1">
                              <List className="h-4 w-4" />
                              <span>Modèles existants</span>
                            </TabsTrigger>
                          </TabsList>
                          
                          {/* Onglet nouveau modèle */}
                          <TabsContent value="new" className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="templateName">Nom du modèle</Label>
                              <Input id="templateName" placeholder="Ex: Confirmation de commande" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="templateSubject">Sujet</Label>
                              <Input id="templateSubject" placeholder="Ex: Confirmation de votre demande {reference}" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="templateBody">Corps du message</Label>
                              <Textarea 
                                id="templateBody" 
                                placeholder="Bonjour {prenom},\n\nNous avons bien reçu votre demande avec la référence {reference}." 
                                className="min-h-[150px]"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="templateActive" defaultChecked />
                              <Label htmlFor="templateActive">Activer ce modèle</Label>
                            </div>
                            <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                              <h3 className="text-sm font-medium">Variables disponibles :</h3>
                              <p><code>{'{nom}'}</code> - Nom complet du client</p>
                              <p><code>{'{prenom}'}</code> - Prénom du client</p>
                              <p><code>{'{reference}'}</code> - Numéro de référence</p>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <Button variant="outline">Annuler</Button>
                              <Button type="submit" onClick={() => {
                                // Logique pour enregistrer le nouveau modèle
                                const name = (document.getElementById('templateName') as HTMLInputElement)?.value;
                                const subject = (document.getElementById('templateSubject') as HTMLInputElement)?.value;
                                const body = (document.getElementById('templateBody') as HTMLTextAreaElement)?.value;
                                const active = (document.getElementById('templateActive') as HTMLInputElement)?.checked;
                                
                                if (!name || !subject || !body) {
                                  toast({
                                    title: "Formulaire incomplet",
                                    description: "Veuillez remplir tous les champs requis",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                // Envoi au serveur
                                const saveTemplate = async () => {
                                  try {
                                    const response = await apiRequest("POST", "/api/email-templates", {
                                      name,
                                      subject,
                                      body,
                                      active: active || false,
                                      trigger: "manual"
                                    });
                                    
                                    if (response.ok) {
                                      // Mise à jour des modèles
                                      const data = await response.json();
                                      if (data) {
                                        // Recharger les modèles
                                        const templatesResponse = await apiRequest("GET", "/api/email-templates");
                                        if (templatesResponse.ok) {
                                          const newTemplates = await templatesResponse.json();
                                          if (Array.isArray(newTemplates)) {
                                            setTemplates(newTemplates);
                                          }
                                        }
                                        
                                        toast({
                                          title: "Modèle enregistré",
                                          description: `Le modèle "${name}" a été créé avec succès`
                                        });
                                      }
                                    } else {
                                      throw new Error("Impossible d'enregistrer le modèle");
                                    }
                                  } catch (error) {
                                    console.error("Erreur lors de l'enregistrement du modèle:", error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible d'enregistrer le modèle",
                                      variant: "destructive"
                                    });
                                  }
                                };
                                
                                saveTemplate();
                              }}>
                                Enregistrer le modèle
                              </Button>
                            </div>
                          </TabsContent>
                          
                          {/* Onglet liste des modèles */}
                          <TabsContent value="list">
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                              {templates.length > 0 ? (
                                <div className="space-y-2 divide-y">
                                  {templates.map((template) => (
                                    <div key={template.id} className="pt-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="font-medium">{template.name}</h3>
                                          <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifier">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8" 
                                            title="Utiliser ce modèle"
                                            onClick={() => {
                                              handleTemplateChange(template.id);
                                              const closeButton = document.querySelector('[data-dialog-close]') as HTMLElement;
                                              if (closeButton) closeButton.click();
                                            }}
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                                  <p className="text-muted-foreground">Aucun modèle disponible</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-1 border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <div className="flex flex-wrap gap-1.5 mr-2">
                  {recipients.map(email => (
                    <Badge key={email} variant="secondary" className="gap-1.5 py-1">
                      <span className="text-xs">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        className="h-3.5 w-3.5 rounded-full hover:bg-muted-foreground/10 inline-flex items-center justify-center"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={recipients.length > 0 ? "" : "Destinataires"}
                  className="border-0 focus-visible:ring-0 px-0 py-1 h-8 text-sm focus-visible:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && recipient) {
                      e.preventDefault();
                      addRecipient(recipient);
                    }
                  }}
                />
              </div>
            </div>

            {/* Sujet */}
            <div>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet"
                className="border-x-0 border-t-0 rounded-none focus-visible:ring-0 px-3 py-3 text-base focus-visible:border-primary"
              />
            </div>

            {/* Contenu */}
            <div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Rédigez votre message ici..."
                className="min-h-[200px] focus-visible:ring-0 p-3 resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center justify-between space-x-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" title="Joindre un fichier">
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSignatureWizardOpen(true)}
              className="flex items-center gap-1 h-8">
              <Signature className="h-3.5 w-3.5" />
              <span className="text-xs">Signature</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={sendEmailMutation.isPending || recipients.length === 0 || !subject || !body}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
