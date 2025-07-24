import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Mail,
  Send,
  Users,
  User,
  Info,
  Copy,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  X,
  Star,
  Clock,
  ChevronRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
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

interface EmailWithLeadData {
  leadId?: number;
  templateId: string;
  to: string;
  subject: string;
  content: string; // Modifié de 'body' à 'content' pour correspondre à l'API
  cc?: string[];
  bcc?: string[];
  attachments?: {name: string, path: string}[];
  recipients?: Array<{
    id: number;
    email: string;
    name: string;
    referenceNumber?: string;
  }>;
}

interface AdvancedEmailDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  initialTemplate?: EmailTemplate | null;
}

export function AdvancedEmailDialog({ open, onClose, initialTemplate }: AdvancedEmailDialogProps) {
  const { toast } = useToast();
  
  // États pour l'email
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(initialTemplate || null);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<string>("");
  
  // États pour les destinataires
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [customRecipient, setCustomRecipient] = useState<string>("");
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  
  // États pour la recherche de leads
  const [leadSearchTerm, setLeadSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Récupérer les leads depuis l'API
  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leads");
      return await res.json();
    },
  });
  
  // Récupérer les modèles d'email
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-templates");
      return await res.json();
    },
  });

  // S'assurer que templates est un tableau valide
  // Si templatesData est déjà un tableau, l'utiliser tel quel, sinon essayer de récupérer templates depuis templatesData
  const templates = Array.isArray(templatesData) ? templatesData : 
                    templatesData && 'templates' in templatesData && Array.isArray(templatesData.templates) ? 
                    templatesData.templates : [];

  // Mutation pour envoyer un email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: EmailWithLeadData) => {
      const res = await apiRequest("POST", "/api/send-email", emailData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé avec succès",
        variant: "default",
      });
      onClose(false);
      // Invalider les requêtes pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ["/api/email-logs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de l'envoi de l'email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialiser avec le modèle sélectionné si disponible
  useEffect(() => {
    if (initialTemplate && typeof initialTemplate === 'object') {
      setSelectedTemplate(initialTemplate);
      // Vérifier que les propriétés existent avant d'y accéder
      setEmailSubject(initialTemplate.subject || "");
      setEmailContent(initialTemplate.body || "");
      setEmailPreview(initialTemplate.body || "");
    } else {
      // Réinitialiser à vide
      setSelectedTemplate(null);
      setEmailSubject("");
      setEmailContent("");
      setEmailPreview("");
    }
  }, [initialTemplate, open]);

  // Charger les leads récents au montage du composant
  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        const response = await apiRequest("GET", "/api/leads/recent");
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.leads)) {
            setRecentLeads(data.leads.slice(0, 5)); // Prendre les 5 leads les plus récents
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des leads récents:", error);
      }
    };

    if (open) {
      fetchRecentLeads();
    }
  }, [open]);

  // Fonction pour la recherche des leads
  useEffect(() => {
    if (!leadSearchTerm || leadSearchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Chercher d'abord par référence exacte (priorité haute)
    const searchLeads = async () => {
      setIsSearching(true);
      try {
        const response = await apiRequest("GET", `/api/leads/search?term=${encodeURIComponent(leadSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.results)) {
            setSearchResults(data.results);
            setShowSearchResults(data.results.length > 0);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la recherche de leads:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Ajouter un délai avant de déclencher la recherche (debounce)
    const timer = setTimeout(() => {
      searchLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [leadSearchTerm]);

  // Fonction pour valider un email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour gérer la sélection d'un lead
  const handleSelectLead = (lead: Lead, checked: boolean) => {
    if (checked) {
      // Ajouter le lead à la sélection s'il n'y est pas déjà
      if (!selectedLeads.some(l => l.id === lead.id)) {
        setSelectedLeads(prev => [...prev, lead]);
      }
      
      // Appliquer automatiquement les informations du lead à l'email
      if (selectedLeads.length === 0) { // Seulement pour le premier lead sélectionné
        const name = `${lead.firstName} ${lead.lastName}`;
        
        // Appliquer un sujet d'email par défaut si vide
        if (!emailSubject) {
          setEmailSubject(`Votre demande de raccordement ${lead.referenceNumber || ''}`);
        }
        
        // Appliquer un contenu d'email par défaut si vide
        if (!emailContent) {
          setEmailContent(`Bonjour {{name}},\n\nNous vous confirmons la bonne réception de votre demande de raccordement avec la référence {{referenceNumber}}.\n\nNotre équipe est à votre disposition pour toute information complémentaire.\n\nCordialement,\nL'équipe Raccordement`);
        }
        
        // Créer une prévisualisation avec le contenu actuel et les données du lead
        let preview = emailContent || "";
        preview = preview
          .replace(/\{\{name\}\}/g, name)
          .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || 'N/A')
          .replace(/\{\{address\}\}/g, lead.address || 'N/A')
          .replace(/\{\{postalCode\}\}/g, lead.postalCode || 'N/A')
          .replace(/\{\{city\}\}/g, lead.city || 'N/A')
          .replace(/\{\{phone\}\}/g, lead.phone || 'N/A')
          .replace(/\{\{email\}\}/g, lead.email || 'N/A')
          .replace(/\{\{status\}\}/g, lead.status || 'N/A')
          .replace(/\{\{requestType\}\}/g, lead.requestType || 'N/A')
          .replace(/\{\{tarif\}\}/g, '129,80€ TTC')
          .replace(/\{\{tarifHT\}\}/g, '108,17€ HT')
          .replace(/\{\{TVA\}\}/g, '21,63€');
        
        setEmailPreview(preview);
      }
    } else {
      // Retirer le lead de la sélection
      setSelectedLeads(prev => prev.filter(l => l.id !== lead.id));
    }
    
    // Fermer la recherche
    setShowSearchResults(false);
    setLeadSearchTerm("");
  };

  // Fonction pour ajouter un destinataire personnalisé
  const handleAddCustomRecipient = () => {
    if (!customRecipient) return;
    
    // Si c'est un email valide, l'ajouter directement
    if (isValidEmail(customRecipient)) {
      if (!customRecipients.includes(customRecipient)) {
        setCustomRecipients(prev => [...prev, customRecipient]);
        setCustomRecipient("");
        toast({
          title: "Destinataire ajouté",
          description: `${customRecipient} a été ajouté aux destinataires.`,
        });
      } else {
        toast({
          title: "Destinataire déjà ajouté",
          description: `${customRecipient} est déjà dans la liste des destinataires.`,
          variant: "destructive",
        });
      }
      return;
    }
    
    // Si ce n'est pas un email, vérifier s'il s'agit d'une référence valide
    setIsSearching(true);
    fetch(`/api/leads/search?term=${encodeURIComponent(customRecipient)}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          // Sélectionner automatiquement le premier résultat
          const lead = data.results[0];
          // Vérifier si ce lead n'est pas déjà sélectionné
          if (!selectedLeads.some(l => l.id === lead.id)) {
            handleSelectLead(lead, true);
            toast({
              title: "Lead trouvé",
              description: `${lead.firstName} ${lead.lastName} a été ajouté aux destinataires.`,
            });
          } else {
            toast({
              title: "Lead déjà sélectionné",
              description: `${lead.firstName} ${lead.lastName} est déjà dans la liste des destinataires.`,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Aucun lead trouvé",
            description: `Aucun lead correspondant à "${customRecipient}" n'a été trouvé.`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error("Erreur lors de la recherche:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la recherche.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSearching(false);
        setCustomRecipient("");
      });
  };

  // Supprimer un destinataire personnalisé
  const handleRemoveCustomRecipient = (email: string) => {
    setCustomRecipients(prev => prev.filter(e => e !== email));
  };

  // Supprimer un lead sélectionné
  const handleRemoveSelectedLead = (leadId: number) => {
    setSelectedLeads(prev => prev.filter(lead => lead.id !== leadId));
  };

  // Sélectionner un template
  const handleSelectTemplate = (template: EmailTemplate) => {
    if (!template) {
      console.error("Tentative de sélection d'un template null ou undefined");
      return;
    }
    
    setSelectedTemplate(template);
    setEmailSubject(template.subject || "");
    setEmailContent(template.body || "");
    
    // Générer l'aperçu si des leads sont sélectionnés
    if (selectedLeads && selectedLeads.length > 0) {
      const lead = selectedLeads[0];
      if (!lead) {
        console.error("Lead sélectionné est null ou undefined");
        setEmailPreview(template.body || "");
        return;
      }
      
      const name = `${lead.firstName || ""} ${lead.lastName || ""}`;
      
      let preview = template.body || "";
      preview = preview
        .replace(/\{\{name\}\}/g, name)
        .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || 'N/A')
        .replace(/\{\{address\}\}/g, lead.address || 'N/A')
        .replace(/\{\{postalCode\}\}/g, lead.postalCode || 'N/A')
        .replace(/\{\{city\}\}/g, lead.city || 'N/A')
        .replace(/\{\{phone\}\}/g, lead.phone || 'N/A')
        .replace(/\{\{email\}\}/g, lead.email || 'N/A')
        .replace(/\{\{status\}\}/g, lead.status || 'N/A')
        .replace(/\{\{requestType\}\}/g, lead.requestType || 'N/A')
        .replace(/\{\{tarif\}\}/g, '129,80€ TTC')
        .replace(/\{\{tarifHT\}\}/g, '108,17€ HT')
        .replace(/\{\{TVA\}\}/g, '21,63€');
      
      setEmailPreview(preview);
    } else {
      setEmailPreview(template.body || "");
    }
  };

  // Envoyer l'email
  const handleSendEmail = () => {
    // Vérifier qu'il y a au moins un destinataire
    if ((selectedLeads?.length || 0) === 0 && (customRecipients?.length || 0) === 0) {
      toast({
        title: "Aucun destinataire",
        description: "Veuillez sélectionner au moins un destinataire.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que le sujet et le contenu sont renseignés
    if (!emailSubject || !emailContent) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le sujet et le contenu de l'email.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Préparation des données pour l'envoi
      const recipients = [
        ...(selectedLeads || []).map(lead => ({
          id: lead.id,
          email: lead.email || "",
          name: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
          referenceNumber: lead.referenceNumber
        })),
        ...(customRecipients || []).map((email, index) => ({
          id: -1 - index, // ID négatif pour les destinataires personnalisés
          email,
          name: email.includes('@') ? email.split('@')[0] : email,
          referenceNumber: undefined
        }))
      ];

      if (recipients.length === 0) {
        toast({
          title: "Aucun destinataire",
          description: "Impossible de préparer la liste des destinataires.",
          variant: "destructive",
        });
        return;
      }

      const emailData: EmailWithLeadData = {
        templateId: selectedTemplate?.id || "custom-email",
        to: recipients[0].email, // Premier destinataire dans le champ "to"
        subject: emailSubject || "",
        content: emailContent || "", // Renommé 'body' en 'content' pour correspondre à l'API
        recipients: recipients
      };

      sendEmailMutation.mutate(emailData);
    } catch (error) {
      console.error("Erreur lors de la préparation de l'email:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la préparation de l'email.",
        variant: "destructive",
      });
    }
  };


  const leads = leadsData && 'leads' in leadsData && Array.isArray(leadsData.leads) 
    ? leadsData.leads 
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" style={{ backgroundColor: "#f8fafc" }}>
        <DialogHeader className="px-6 pt-6 pb-2 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Envoyer un email</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Recherchez un destinataire, choisissez un modèle et personnalisez votre email.
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => onClose(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Section des destinataires */}
          <section className="bg-white rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Destinataires
                <Badge variant="outline" className="ml-2 font-normal">
                  {selectedLeads.length + customRecipients.length}
                </Badge>
              </h3>
            </div>
            
            {/* Recherche avancée de destinataires */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="Rechercher par référence, nom ou email..."
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="bg-gray-50 border-gray-200 pr-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRecipient();
                    }
                  }}
                />
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
                
                {/* Résultats de recherche avec style amélioré */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md border shadow-lg overflow-hidden">
                    <div className="py-1 bg-blue-50 px-3 text-xs font-medium text-blue-800 border-b">
                      Résultats ({searchResults.length})
                    </div>
                    <ScrollArea className="max-h-[250px]">
                      {searchResults.map((lead) => (
                        <div 
                          key={lead.id}
                          className="hover:bg-blue-50 transition-colors cursor-pointer p-2 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectLead(lead, true)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {lead.firstName && lead.firstName[0] || ""}{lead.lastName && lead.lastName[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {lead.firstName} {lead.lastName}
                                {lead.status && (
                                  <Badge variant="outline" className="ml-1 text-xs font-normal">
                                    {lead.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{lead.email}</span>
                                {lead.referenceNumber && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-primary font-medium">{lead.referenceNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-primary hover:bg-primary/10 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleAddCustomRecipient}
                disabled={!customRecipient || isSearching}
                className="bg-primary hover:bg-primary/90"
              >
                Ajouter
              </Button>
            </div>
            
            {/* Suggestions et derniers leads */}
            {!showSearchResults && (
              <div className="pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>Dernières demandes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentLeads.slice(0, 4).map((lead) => (
                    <button
                      key={lead.id}
                      className="flex items-center gap-2 text-left p-2 rounded-md border bg-gray-50 hover:bg-blue-50 transition-colors"
                      onClick={() => handleSelectLead(lead, true)}
                    >
                      <Avatar className="h-7 w-7 border border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {lead.firstName && lead.firstName[0] || ""}{lead.lastName && lead.lastName[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {lead.referenceNumber || lead.email}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Liste des destinataires sélectionnés */}
            {(selectedLeads.length > 0 || customRecipients.length > 0) && (
              <div className="mt-4">
                <Separator className="mb-3" />
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Destinataires sélectionnés
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {selectedLeads.length + customRecipients.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {/* Leads sélectionnés */}
                  {selectedLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      className="flex items-center justify-between bg-blue-50 border border-blue-100 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {lead.firstName && lead.firstName[0] || ""}{lead.lastName && lead.lastName[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{lead.firstName} {lead.lastName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{lead.email}</span>
                            {lead.referenceNumber && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-primary font-medium">{lead.referenceNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveSelectedLead(lead.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Destinataires personnalisés */}
                  {customRecipients.map((email) => (
                    <div 
                      key={email}
                      className="flex items-center justify-between bg-gray-50 border p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-gray-200">
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">{email}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveCustomRecipient(email)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          
          {/* Tabs pour le contenu email et les templates */}
          <Tabs defaultValue="content" className="bg-white rounded-xl border">
            <TabsList className="w-full rounded-none border-b grid grid-cols-2">
              <TabsTrigger value="content" className="rounded-none data-[state=active]:bg-white">
                <Mail className="h-4 w-4 mr-2" />
                Contenu de l'email
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-none data-[state=active]:bg-white">
                <FileText className="h-4 w-4 mr-2" />
                Modèles d'emails
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="p-4 space-y-4 m-0 border-none">
              <div>
                <Label htmlFor="email-subject" className="text-sm font-medium">Sujet de l'email</Label>
                <Input
                  id="email-subject"
                  placeholder="Sujet de l'email"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="email-content" className="text-sm font-medium">Contenu de l'email</Label>
                <Textarea
                  id="email-content"
                  placeholder="Contenu de l'email"
                  value={emailContent}
                  onChange={(e) => {
                    setEmailContent(e.target.value);
                    
                    // Mettre à jour l'aperçu si des leads sont sélectionnés
                    if (selectedLeads && selectedLeads.length > 0) {
                      try {
                        const lead = selectedLeads[0];
                        if (!lead) {
                          setEmailPreview(e.target.value);
                          return;
                        }
                        
                        const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
                        
                        let preview = e.target.value;
                        preview = preview
                          .replace(/\{\{name\}\}/g, name)
                          .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || 'N/A')
                          .replace(/\{\{address\}\}/g, lead.address || 'N/A')
                          .replace(/\{\{postalCode\}\}/g, lead.postalCode || 'N/A')
                          .replace(/\{\{city\}\}/g, lead.city || 'N/A')
                          .replace(/\{\{phone\}\}/g, lead.phone || 'N/A')
                          .replace(/\{\{email\}\}/g, lead.email || 'N/A')
                          .replace(/\{\{status\}\}/g, lead.status || 'N/A')
                          .replace(/\{\{requestType\}\}/g, lead.requestType || 'N/A')
                          .replace(/\{\{tarif\}\}/g, '129,80€ TTC')
                          .replace(/\{\{tarifHT\}\}/g, '108,17€ HT')
                          .replace(/\{\{TVA\}\}/g, '21,63€');
                        
                        setEmailPreview(preview);
                      } catch (error) {
                        console.error("Erreur lors de la génération de l'aperçu:", error);
                        setEmailPreview(e.target.value);
                      }
                    } else {
                      setEmailPreview(e.target.value);
                    }
                  }}
                  className="mt-1.5 h-40 resize-none"
                />
              </div>
              
              <div className="pt-2">
                <div className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span>Variables disponibles</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{name}}" : "{{name}}")}
                    title="Nom du client"
                  >
                    {`{{name}}`}
                  </div>
                  
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{referenceNumber}}" : "{{referenceNumber}}")}
                    title="Numéro de référence"
                  >
                    {`{{referenceNumber}}`}
                  </div>
                  
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{address}}" : "{{address}}")}
                    title="Adresse"
                  >
                    {`{{address}}`}
                  </div>
                  
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{postalCode}}" : "{{postalCode}}")}
                    title="Code postal"
                  >
                    {`{{postalCode}}`}
                  </div>
                  
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{city}}" : "{{city}}")}
                    title="Ville"
                  >
                    {`{{city}}`}
                  </div>
                  
                  <div 
                    className="bg-blue-50 text-blue-600 p-1.5 rounded text-xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setEmailContent((prev) => prev ? prev + "{{tarif}}" : "{{tarif}}")}
                    title="Tarif TTC (129,80€)"
                  >
                    {`{{tarif}}`}
                  </div>
                </div>
              </div>
              
              {/* Aperçu de l'email */}
              {emailPreview && (
                <div className="pt-4">
                  <div className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Aperçu personnalisé</span>
                  </div>
                  <div className="border rounded-md p-4 bg-gray-50 whitespace-pre-line">
                    {emailPreview}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="p-0 m-0 border-none space-y-4">
              <div className="p-4">
                <div className="text-sm font-medium flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Modèles disponibles</span>
                  <Badge variant="outline" className="ml-auto font-normal">
                    {Array.isArray(templates) ? templates.length : 0} modèles
                  </Badge>
                </div>
                
                {isLoadingTemplates ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  </div>
                ) : !Array.isArray(templates) || templates.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-muted-foreground">Aucun modèle disponible</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {Array.isArray(templates) && templates.map((template: EmailTemplate) => (
                        <div 
                          key={template.id}
                          className={cn(
                            "border rounded-md p-3 hover:border-primary/50 cursor-pointer transition-colors",
                            selectedTemplate?.id === template.id ? "border-primary bg-primary/5" : ""
                          )}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-1.5">
                                {template.name}
                                {template.active ? (
                                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                                    Actif
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Inactif
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                {template.subject}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-7 w-7 p-0 rounded-full",
                                selectedTemplate?.id === template.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white" : "text-primary hover:bg-primary/10"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                            >
                              {selectedTemplate?.id === template.id ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="p-4 bg-white border-t sticky bottom-0 z-10 flex-row justify-between">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
          >
            Annuler
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={sendEmailMutation.isPending || (
                (selectedLeads.length === 0 && customRecipients.length === 0) ||
                !emailSubject ||
                !emailContent
              )}
              onClick={handleSendEmail}
              className="bg-primary hover:bg-primary/90"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer l'email
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
