import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Loader2,
  RefreshCw,
  Plus,
  Save,
  Mail,
  Edit,
  Trash,
  Copy,
  Send,
  Info,
  Search,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  Inbox,
  ArrowLeft,
  MailX,
  MailCheck,
  User,
  Paperclip,
  FileText,
  BellRing,
  X,
  PenLine,
  Reply,
  ChevronUp,
  ChevronDown,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface EmailLogEntry {
  id: string;
  subject: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam' | 'queued' | 'failed';
  template?: string;
  sender: string;
  createdAt: string;
  readAt?: string;
  isSpam: boolean;
}

interface UserEmail {
  id: string;
  uid: number;
  date: Date;
  from: { name?: string; address: string }[];
  to: { name?: string; address: string }[];
  cc?: { name?: string; address: string }[];
  subject: string;
  text?: string;
  html?: string;
  hasAttachments: boolean;
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
  }[];
  isRead: boolean;
  flags?: string[];
  isSpam?: boolean;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  smtpEnabled?: boolean;
}

interface EmailWithLeadData {
  leadId?: number;
  templateId: string;
  to: string;
  subject: string;
  body: string;
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

const EmailTemplateCard = ({ template, onEdit, onSendTest, onDelete, onSend }: { 
  template: EmailTemplate; 
  onEdit: () => void; 
  onSendTest: () => void; 
  onDelete: () => void;
  onSend: () => void;
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-start justify-between">
          <span className="truncate mr-2">{template.name}</span>
          {template.active ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
              Actif
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-500 hover:bg-gray-50 border-gray-200">
              Inactif
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs truncate">
          Déclencheur: {template.trigger}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 text-sm">
        <div className="mb-2">
          <span className="font-semibold text-xs text-muted-foreground">Sujet:</span>
          <p className="truncate">{template.subject}</p>
        </div>
        <div>
          <span className="font-semibold text-xs text-muted-foreground">Contenu:</span>
          <p className="line-clamp-2 text-sm text-muted-foreground">{template.body}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 mr-1" />
            Éditer
          </Button>
          <Button variant="ghost" size="sm" onClick={onSendTest}>
            <Send className="h-3.5 w-3.5 mr-1" />
            Tester
          </Button>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash className="h-3.5 w-3.5 text-red-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSend}>
            <Send className="h-3.5 w-3.5 text-blue-500" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function EmailPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [isTestEmailDialog, setIsTestEmailDialog] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>("");
  const [isSendingDialog, setIsSendingDialog] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [selectAllLeads, setSelectAllLeads] = useState<boolean>(false);
  const [leadSearchTerm, setLeadSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<string>("");
  const [showSpamFolder, setShowSpamFolder] = useState<boolean>(false);
  
  // Nouvelles variables d'état pour le formulaire d'email amélioré
  const [customRecipient, setCustomRecipient] = useState<string>("");
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  
  // Variables d'état pour la recherche avancée de leads
  // États pour l'autocomplétion de recherche des leads
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  // États pour la gestion des boîtes mail utilisateurs
  // Initialiser avec l'utilisateur admin (id=1) par défaut pour avoir une interface immédiatement fonctionnelle
  const [selectedUser, setSelectedUser] = useState<number>(1);
  const [selectedMailbox, setSelectedMailbox] = useState<string>("INBOX");
  const [selectedEmail, setSelectedEmail] = useState<UserEmail | null>(null);
  const [isViewingEmail, setIsViewingEmail] = useState<boolean>(false);

  // Récupérer les leads depuis l'API
  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Récupérer les logs d'emails depuis l'API
  const { data: emailLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["/api/email-logs"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Récupérer la liste des utilisateurs
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Récupérer la liste des boîtes mails de l'utilisateur sélectionné
  const { data: mailboxes, isLoading: isLoadingMailboxes } = useQuery({
    queryKey: ["/api/mailboxes", selectedUser],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!selectedUser,
  });
  
  // Récupérer les emails pour l'utilisateur et la boîte mail sélectionnés
  const { data: userEmails, isLoading: isLoadingUserEmails, refetch: refetchUserEmails } = useQuery({
    queryKey: ["/api/user-emails", selectedUser, selectedMailbox],
    queryFn: async ({ queryKey }) => {
      const [_, userId, mailbox] = queryKey;
      if (!userId) throw new Error("ID utilisateur requis");
      const response = await apiRequest(
        "GET", 
        `/api/user-emails?userId=${userId}&selectedMailbox=${mailbox || 'INBOX'}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération des emails");
      }
      return response.json();
    },
    enabled: !!selectedUser && !!selectedMailbox,
  });
  
  // Récupérer les modèles d'email
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/email-templates"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Statistiques pour le tableau de bord
  const totalTemplates = templatesData && typeof templatesData === 'object' && 'templates' in templatesData && Array.isArray(templatesData.templates) 
    ? templatesData.templates.length 
    : 0;
  const activeTemplates = templatesData && typeof templatesData === 'object' && 'templates' in templatesData && Array.isArray(templatesData.templates) 
    ? templatesData.templates.filter((t: EmailTemplate) => t.active).length 
    : 0;
  const sentLastMonth = Array.isArray(emailLogs) ? emailLogs.length : 0;
  const deliveryRate = sentLastMonth > 0 && Array.isArray(emailLogs) ? 
    Math.round((emailLogs.filter((log: EmailLogEntry) => 
      log.status === 'delivered' || log.status === 'opened' || log.status === 'clicked'
    ).length / sentLastMonth) * 100) : 0;

  // Modèles d'email (utilisation des données simulées ou réelles)
  const templates = templatesData && typeof templatesData === 'object' && 'templates' in templatesData && Array.isArray(templatesData.templates) 
    ? templatesData.templates 
    : [];

  // Mutation pour marquer un email comme lu/non lu
  const markEmailMutation = useMutation({
    mutationFn: async ({ userId, messageId, isRead, mailbox }: { userId: number, messageId: string, isRead: boolean, mailbox: string }) => {
      const res = await apiRequest("POST", "/api/mark-email", { userId, messageId, isRead, mailbox });
      return await res.json();
    },
    onSuccess: () => {
      if (selectedEmail && isViewingEmail) {
        setSelectedEmail(prev => prev ? { ...prev, isRead: !prev.isRead } : null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      toast({
        title: "Statut de l'email mis à jour",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la mise à jour du statut",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour déplacer un email vers un autre dossier
  const moveEmailMutation = useMutation({
    mutationFn: async ({ userId, messageId, destinationMailbox, sourceMailbox }: { userId: number, messageId: string, destinationMailbox: string, sourceMailbox: string }) => {
      const res = await apiRequest("POST", "/api/move-email", { userId, messageId, destinationMailbox, sourceMailbox });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      toast({
        title: "Email déplacé avec succès",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors du déplacement de l'email",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour supprimer un email
  const deleteEmailMutation = useMutation({
    mutationFn: async ({ userId, messageId, mailbox }: { userId: number, messageId: string, mailbox: string }) => {
      const res = await apiRequest("POST", "/api/delete-email", { userId, messageId, mailbox });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      setSelectedEmail(null);
      setIsViewingEmail(false);
      toast({
        title: "Email supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la suppression de l'email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      setIsSendingDialog(false);
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
  
  // Fonction pour gérer le changement d'utilisateur
  const handleUserChange = (userId: string) => {
    if (userId === "no-user") {
      // Ne pas réinitialiser à null, garder l'utilisateur admin (1) comme minimum
      setSelectedUser(1);
    } else {
      setSelectedUser(parseInt(userId));
      setSelectedMailbox("INBOX"); // Réinitialiser à la boîte de réception par défaut
    }
    setSelectedEmail(null);
    setIsViewingEmail(false);
  };
  
  // Fonction pour gérer le changement de boîte mail
  const handleMailboxChange = (mailboxName: string) => {
    setSelectedMailbox(mailboxName);
    setSelectedEmail(null);
    setIsViewingEmail(false);
  };
  
  // Fonction pour afficher un email
  const handleViewEmail = (email: UserEmail) => {
    setSelectedEmail(email);
    setIsViewingEmail(true);
    
    // Si l'email n'est pas lu, le marquer comme lu
    if (!email.isRead) {
      markEmailMutation.mutate({
        userId: selectedUser,
        messageId: email.id,
        isRead: true,
        mailbox: selectedMailbox
      });
    }
  };

  // Recherche rapide des leads avec l'API
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (leadSearchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/leads/search?term=${encodeURIComponent(leadSearchTerm)}`);
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
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    // Debounce la recherche pour éviter trop de requêtes
    const timer = setTimeout(() => {
      if (leadSearchTerm.length >= 2) {
        fetchSearchResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [leadSearchTerm]);
  
  // Fonction pour gérer la sélection d'un lead
  const handleSelectLead = (lead: Lead, checked: boolean) => {
    if (!lead) return;

    if (checked) {
      setSelectedLeads(prev => [...prev, lead]);
    } else {
      setSelectedLeads(prev => prev.filter(l => l.id !== lead.id));
    }
    
    // Mettre à jour l'état de sélection globale
    if (!checked && selectAllLeads) {
      setSelectAllLeads(false);
    } else if (checked && filteredLeads && filteredLeads.length === selectedLeads.length + 1) {
      setSelectAllLeads(true);
    }
    
    // Fermer la recherche si nécessaire
    setShowSearchResults(false);
  };

  // Fonction pour gérer la sélection de tous les leads
  const handleSelectAllLeads = (checked: boolean) => {
    setSelectAllLeads(checked);
    if (checked && filteredLeads && filteredLeads.length > 0) {
      setSelectedLeads(filteredLeads);
    } else {
      setSelectedLeads([]);
    }
  };
  
  // Fonction pour préparer l'envoi d'emails aux leads sélectionnés
  const handleOpenSendDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsSendingDialog(true);
    
    // Générer un aperçu du premier lead sélectionné si disponible
    if (selectedLeads.length > 0) {
      const lead = selectedLeads[0];
      let preview = template.body
        .replace(/\{\{name\}\}/g, `${lead.firstName} ${lead.lastName}`)
        .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || 'N/A')
        .replace(/\{\{address\}\}/g, lead.address || 'N/A');
      
      setEmailPreview(preview);
    } else {
      setEmailPreview(template.body);
    }
  };
  
  // Fonction pour envoyer des emails aux leads sélectionnés et/ou destinataires personnalisés
  const handleSendEmails = async () => {
    // Vérifier qu'il y a au moins un destinataire (lead sélectionné ou destinataire personnalisé)
    if ((selectedLeads.length === 0 && customRecipients.length === 0) || !emailSubject || !emailContent) return;
    
    try {
      // Variables pour envoyer des emails à plusieurs destinataires
      const emailPromises: Promise<any>[] = [];
      
      // Si nous avons des leads sélectionnés
      if (selectedLeads.length > 0) {
        // Préparer les destinataires leads pour l'API
        const recipientsLeads = selectedLeads.map(lead => ({
          id: lead.id,
          email: lead.email,
          name: `${lead.firstName} ${lead.lastName}`,
          referenceNumber: lead.referenceNumber
        }));
        
        // Envoyer l'email aux leads via l'API existante
        emailPromises.push(
          apiRequest("POST", "/api/emails/send", {
            recipients: recipientsLeads,
            subject: emailSubject,
            content: emailContent,
            templateId: selectedTemplate?.id || 'custom-email'
          }).then(response => {
            if (!response.ok) {
              throw new Error("Erreur lors de l'envoi d'email aux leads");
            }
            return response.json();
          })
        );
      }
      
      // Envoyer aux destinataires personnalisés avec la nouvelle API
      if (customRecipients.length > 0) {
        // Envoyer un email à chaque destinataire personnalisé
        customRecipients.forEach(email => {
          emailPromises.push(
            apiRequest("POST", "/api/emails/send-custom", {
              to: email,
              subject: emailSubject,
              body: emailContent,
              templateId: selectedTemplate?.id || 'custom-email'
            }).then(response => {
              if (!response.ok) {
                throw new Error(`Erreur lors de l'envoi d'email à ${email}`);
              }
              return response.json();
            })
          );
        });
      }
      
      // Envoyer tous les emails et attendre la fin
      await Promise.all(emailPromises);
      
      // Réinitialiser les états après envoi réussi
      setSelectedLeads([]);
      setSelectAllLeads(false);
      setCustomRecipients([]);
      setCustomRecipient("");
      setIsSendingDialog(false);
      
      // Afficher un message de confirmation
      toast({
        title: "Emails envoyés avec succès",
        description: `${selectedLeads.length + customRecipients.length} email(s) envoyé(s)`,
        variant: "default"
      });
      
      // Invalider les requêtes pour actualiser à la fois les emails envoyés et les journaux
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, "SENT"] });
      queryClient.invalidateQueries({ queryKey: ["/api/email-logs"] });
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails", error);
      toast({
        title: "Erreur lors de l'envoi des emails",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'envoi des emails",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour envoyer un email de test
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !editingTemplate) return;
    
    try {
      // Envoyer un email de test via l'API personnalisée
      const response = await apiRequest("POST", "/api/emails/send-custom", {
        to: testEmailAddress,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        templateId: editingTemplate.id || "test-template"
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'email de test");
      }
      
      setIsTestEmailDialog(false);
      setTestEmailAddress("");
      
      toast({
        title: "Email de test envoyé",
        description: `Un email de test a été envoyé à ${testEmailAddress}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de l'email de test",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour ouvrir la boîte de dialogue "Nouveau mail"
  const handleNewEmail = () => {
    try {
      // Réinitialiser l'état du modèle sélectionné et créer un modèle vide temporaire
      const emptyTemplate = {
        id: "new-email",
        name: "Email personnalisé",
        subject: "Votre demande de raccordement électrique",
        body: "Bonjour,\n\nMerci pour votre intérêt pour nos services de raccordement électrique.\n\nCordialement,\nL'équipe de raccordement",
        trigger: "manual",
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // S'assurer que toutes les propriétés sont initialisées
      setSelectedTemplate(emptyTemplate);
      setEmailPreview(emptyTemplate.body);
      setEmailSubject(emptyTemplate.subject);
      setEmailContent(emptyTemplate.body);
      // Réinitialiser la liste des destinataires sélectionnés
      setSelectedLeads([]);
      setSelectAllLeads(false);
      setCustomRecipient("");
      setCustomRecipients([]);
      // Réinitialiser les filtres
      setFilterStatus("all");
      setLeadSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
      // Ouvrir la boîte de dialogue
      setIsSendingDialog(true);
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la boîte de dialogue", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ouverture de la boîte de dialogue.",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour appliquer un modèle d'email
  const handleApplyTemplate = (template: EmailTemplate) => {
    if (!template) return;
    
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailContent(template.body);
    setEmailPreview(template.body);
    
    if (selectedLeads.length > 0) {
      // Générer un aperçu personnalisé avec le premier lead sélectionné
      const lead = selectedLeads[0];
      let preview = template.body
        .replace(/\{\{name\}\}/g, `${lead.firstName} ${lead.lastName}`)
        .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || 'N/A')
        .replace(/\{\{address\}\}/g, lead.address || 'N/A')
        .replace(/\{\{postalCode\}\}/g, lead.postalCode || 'N/A')
        .replace(/\{\{city\}\}/g, lead.city || 'N/A')
        .replace(/\{\{phone\}\}/g, lead.phone || 'N/A')
        .replace(/\{\{email\}\}/g, lead.email || 'N/A')
        .replace(/\{\{tarif\}\}/g, '129,80€ TTC')
        .replace(/\{\{tarifHT\}\}/g, '108,17€ HT')
        .replace(/\{\{TVA\}\}/g, '21,63€');
      
      setEmailContent(preview);
      setEmailPreview(preview);
    }
  };

  // Fonction pour gérer le changement d'onglet
  const handleTabsChange = (value: string) => {
    setActiveTab(value);
    setIsViewingEmail(false);
    setSelectedEmail(null);
  };
  
  // Trier les emails en fonction de l'order et du champ sélectionné
  const sortedUserEmails = userEmails && typeof userEmails === 'object' && 'emails' in userEmails && Array.isArray(userEmails.emails) ? 
    [...userEmails.emails].sort((a: any, b: any) => {
      // Toujours mettre les non lus en premier, puis trier par date
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      
      // Ensuite, trier par date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }) : [];
  
  // Filtrer les leads en fonction du terme de recherche et du statut
  const filteredLeads = leadsData && typeof leadsData === 'object' && 'leads' in leadsData && Array.isArray(leadsData.leads) ? 
    leadsData.leads.filter((lead: Lead) => {
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      const email = lead.email.toLowerCase();
      const reference = (lead.referenceNumber || "").toLowerCase();
      const searchTermMatch = leadSearchTerm ? 
        fullName.includes(leadSearchTerm.toLowerCase()) || 
        email.includes(leadSearchTerm.toLowerCase()) || 
        reference.includes(leadSearchTerm.toLowerCase()) : true;
      
      // Si filterStatus est 'all' ou vide, on affiche tous les leads
      const statusMatch = filterStatus && filterStatus !== 'all' ? lead.status === filterStatus : true;
      
      return searchTermMatch && statusMatch;
    }) : [];
  
  // Filtrer les logs d'emails
  const filteredLogs = Array.isArray(emailLogs) ? emailLogs.filter((log: EmailLogEntry) => {
    return true; // Pas de filtrage pour l'instant
  }) : [];
  
  // Trier les logs d'emails par date
  const sortedLogs = Array.isArray(filteredLogs) ? [...filteredLogs].sort((a: EmailLogEntry, b: EmailLogEntry) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Du plus récent au plus ancien
  }) : [];
  
  // Liste des déclencheurs d'emails
  const triggers = [
    { id: 'manual', label: 'Manuel (pas de déclenchement automatique)' },
    { id: 'new_lead', label: 'Nouvelle demande' },
    { id: 'payment_success', label: 'Paiement effectué' },
    { id: 'payment_failed', label: 'Échec de paiement' },
    { id: 'appointment_scheduled', label: 'Rendez-vous programmé' },
    { id: 'appointment_reminder', label: 'Rappel de rendez-vous' },
    { id: 'service_completed', label: 'Service terminé' },
  ];

  // Notification non lues en haut de la page
  const unreadCount = userEmails && typeof userEmails === 'object' && 'emails' in userEmails && Array.isArray(userEmails.emails)
    ? userEmails.emails.filter((email: any) => !email.isRead && selectedMailbox === "INBOX").length 
    : 0;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des emails</h1>
            <p className="text-muted-foreground mt-1">
              Envoyez, consultez et gérez vos emails et modèles.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {/* Barre d'actions rapides pour les agents */}
            <div className="flex gap-1 bg-secondary rounded-md p-1">
              {/* Notification pour les nouveaux emails */}
              <DropdownMenu open={showNotificationDropdown} onOpenChange={setShowNotificationDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                  >
                    <BellRing className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="p-1 text-sm border-b flex justify-between items-center">
                    <div>Nouveaux messages ({unreadCount})</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setActiveTab("inbox");
                        setSelectedMailbox("INBOX");
                        setShowNotificationDropdown(false);
                      }}
                    >
                      Tout voir
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px]">
                    {userEmails && typeof userEmails === 'object' && 'emails' in userEmails && Array.isArray(userEmails.emails) && 
                    userEmails.emails.filter((email: any) => !email.isRead).length > 0 ? (
                      userEmails.emails.filter((email: any) => !email.isRead).map((email: any) => (
                        <div key={email.id} className="p-2 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer text-xs"
                          onClick={() => {
                            setActiveTab("inbox");
                            setSelectedMailbox("INBOX");
                            setSelectedEmail(email);
                            setIsViewingEmail(true);
                            setShowNotificationDropdown(false);
                            
                            // Marquer comme lu lorsqu'on clique dessus
                            if (!email.isRead) {
                              markEmailMutation.mutate({
                                userId: selectedUser,
                                messageId: email.id,
                                isRead: true,
                                mailbox: selectedMailbox
                              });
                            }
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {email.from[0]?.name?.[0] || email.from[0]?.address?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate text-xs">
                              {email.from[0]?.name || email.from[0]?.address || 'Inconnu'}
                            </span>
                          </div>
                          <div className="font-medium truncate text-xs">{email.subject || "(Sans objet)"}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(email.date).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground text-xs">
                        <Mail className="h-5 w-5 mb-1 text-muted" />
                        <p>Aucun nouveau message</p>
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action rapide - Nouveau mail */}
              <Button 
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewEmail}
                title="Nouveau mail"
              >
                <PenLine className="h-4 w-4" />
              </Button>
              
              {/* Action rapide - Rafraîchir */}
              <Button 
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => refetchUserEmails()}
                title="Rafraîchir"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              {/* Action rapide - Nouveau modèle */}
              <Button 
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsEditingTemplate(true);
                }}
                title="Nouveau modèle"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <CardTitle className="text-xl">Boîte de réception</CardTitle>
                <CardDescription>Gérez vos emails depuis cette interface.</CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <Select 
                  value={selectedUser ? selectedUser.toString() : "1"}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Compte administrateur</SelectItem>
                    {usersData && typeof usersData === 'object' && 'users' in usersData && Array.isArray(usersData.users) ? 
                      usersData.users.map((user: User) => (
                        user.id !== 1 ? (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} ({user.email || 'Sans email'})
                          </SelectItem>
                        ) : null
                      )) : null
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabsChange} className="mt-6">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="inbox" className="flex items-center gap-1">
                  <Inbox className="h-4 w-4" />
                  Reçus
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-1">
                  <Send className="h-4 w-4" />
                  Envoyés
                </TabsTrigger>
                <TabsTrigger value="spam" className="flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" />
                  Spam
                </TabsTrigger>
                <TabsTrigger value="trash" className="flex items-center gap-1">
                  <Trash className="h-4 w-4" />
                  Supprimés
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Modèles
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Journaux
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {activeTab !== "templates" && activeTab !== "logs" && (
                  <div className="flex items-center gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refetchUserEmails()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleNewEmail}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Nouveau mail
                    </Button>
                  </div>
                )}

                <TabsContent value="inbox" className="mt-0">
                  {isLoadingUserEmails ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : isViewingEmail && selectedEmail ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEmail(null);
                            setIsViewingEmail(false);
                          }}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Retour aux emails
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deleteEmailMutation.mutate({
                                userId: selectedUser,
                                messageId: selectedEmail.id,
                                mailbox: selectedMailbox
                              });
                            }}
                            disabled={deleteEmailMutation.isPending}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              markEmailMutation.mutate({
                                userId: selectedUser,
                                messageId: selectedEmail.id,
                                isRead: !selectedEmail.isRead,
                                mailbox: selectedMailbox
                              });
                            }}
                            disabled={markEmailMutation.isPending}
                          >
                            {selectedEmail.isRead ? (
                              <>
                                <MailX className="h-4 w-4 mr-2" />
                                Marquer comme non lu
                              </>
                            ) : (
                              <>
                                <MailCheck className="h-4 w-4 mr-2" />
                                Marquer comme lu
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <Card>
                        <CardContent className="p-6 space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold">{selectedEmail.subject || "(Sans objet)"}</h3>
                            <div className="flex flex-col md:flex-row gap-1 md:gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span className="font-medium">De:</span>
                                <span className="ml-1">
                                  {selectedEmail.from.map(f => f.name || f.address).join(", ")}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="font-medium">Date:</span>
                                <span className="ml-1">
                                  {new Date(selectedEmail.date).toLocaleString("fr-FR")}
                                </span>
                              </div>
                            </div>
                            {selectedEmail.to && selectedEmail.to.length > 0 && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <User className="h-4 w-4 mr-1" />
                                <span className="font-medium">À:</span>
                                <span className="ml-1">
                                  {selectedEmail.to.map(t => t.name || t.address).join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div>
                            {selectedEmail.hasAttachments && (
                              <div className="mb-4 border border-dashed rounded-md p-3">
                                <div className="flex items-center text-sm">
                                  <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                                  <span className="font-medium">
                                    {selectedEmail.attachments?.length || 0} pièce(s) jointe(s)
                                  </span>
                                </div>
                                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {selectedEmail.attachments.map((att, index) => (
                                      <div 
                                        key={index}
                                        className="flex items-center bg-muted p-2 rounded-md text-xs"
                                      >
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="truncate flex-1">{att.filename}</span>
                                        <span className="text-muted-foreground ml-2">
                                          {Math.round(att.size / 1024)}KB
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="email-content">
                              {selectedEmail.html ? (
                                <div className="border rounded-md p-4 bg-white" dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                              ) : (
                                <div className="border rounded-md p-4 bg-white whitespace-pre-line">
                                  {selectedEmail.text || "(Pas de contenu)"}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : sortedUserEmails.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Aucun email</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Aucun email dans le dossier {selectedMailbox === "INBOX" ? "Boîte de réception" : selectedMailbox}.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Expéditeur</TableHead>
                          <TableHead>Sujet</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedUserEmails.map((email: UserEmail) => (
                          <TableRow 
                            key={email.id} 
                            className={email.isRead ? "" : "font-medium bg-muted/30"}
                          >
                            <TableCell>
                              <div className="flex items-center">
                                {!email.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                                )}
                                {email.hasAttachments && (
                                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {email.from[0]?.name?.[0] || email.from[0]?.address?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="truncate max-w-[120px] md:max-w-[180px]">
                                  {email.from[0]?.name || email.from[0]?.address || 'Inconnu'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div 
                                className="cursor-pointer truncate max-w-[180px] md:max-w-[300px]" 
                                onClick={() => handleViewEmail(email)}
                              >
                                {email.subject || "(Sans objet)"}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {new Date(email.date).toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7" 
                                  onClick={() => handleViewEmail(email)}
                                >
                                  <Search className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7" 
                                  onClick={() => {
                                    deleteEmailMutation.mutate({
                                      userId: selectedUser,
                                      messageId: email.id,
                                      mailbox: selectedMailbox
                                    });
                                  }}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7" 
                                  onClick={() => {
                                    markEmailMutation.mutate({
                                      userId: selectedUser,
                                      messageId: email.id,
                                      isRead: !email.isRead,
                                      mailbox: selectedMailbox
                                    });
                                  }}
                                >
                                  {email.isRead ? (
                                    <MailX className="h-3.5 w-3.5" />
                                  ) : (
                                    <MailCheck className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="sent" className="mt-0">
                  {isLoadingUserEmails ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : isViewingEmail && selectedEmail ? (
                    <div className="space-y-6">
                      {/* Contenu similaire à l'onglet inbox pour l'affichage d'un email */}
                    </div>
                  ) : sortedUserEmails.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Send className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Aucun email envoyé</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Vous n'avez pas encore envoyé d'emails depuis ce compte.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Destinataire</TableHead>
                          <TableHead>Sujet</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Liste des emails envoyés */}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="spam" className="mt-0">
                  {/* Contenu pour l'onglet spam */}
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Dossier spam</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Les emails détectés comme indésirables apparaîtront ici.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="trash" className="mt-0">
                  {/* Contenu pour l'onglet corbeille */}
                  <div className="text-center py-12 text-muted-foreground">
                    <Trash className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Corbeille</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Les emails supprimés seront automatiquement effacés après 20 jours.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl font-semibold">Modèles d'emails ({templates.length})</h2>
                    <Button 
                      onClick={() => {
                        setEditingTemplate(null);
                        setIsEditingTemplate(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau modèle
                    </Button>
                  </div>

                  {isLoadingTemplates ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Aucun modèle</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        Vous n'avez pas encore créé de modèles d'emails. Les modèles vous permettent d'envoyer rapidement des messages standardisés.
                      </p>
                      <Button 
                        onClick={() => {
                          setEditingTemplate(null);
                          setIsEditingTemplate(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un modèle
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => (
                        <EmailTemplateCard 
                          key={template.id}
                          template={template}
                          onEdit={() => {
                            setEditingTemplate(template);
                            setIsEditingTemplate(true);
                          }}
                          onSendTest={() => {
                            setEditingTemplate(template);
                            setIsTestEmailDialog(true);
                          }}
                          onDelete={() => {
                            // Supprimer le modèle
                          }}
                          onSend={() => handleOpenSendDialog(template)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="mt-0">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-xl font-semibold">Historique des emails</h2>
                    <div className="flex items-center gap-2">
                      <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Plus récents d'abord</SelectItem>
                          <SelectItem value="asc">Plus anciens d'abord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isLoadingLogs ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : sortedLogs.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Aucun historique</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        L'historique des emails envoyés apparaîtra ici.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead>Destinataire</TableHead>
                          <TableHead>Sujet</TableHead>
                          <TableHead>Modèle</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="w-[100px]">
                            <div className="flex items-center gap-1">
                              Statut
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {log.status === 'delivered' || log.status === 'opened' || log.status === 'clicked' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : log.status === 'bounced' || log.status === 'failed' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {log.recipient[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="truncate max-w-[120px] md:max-w-[180px]">
                                  {log.recipient}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="truncate max-w-[180px] md:max-w-[300px]">
                                {log.subject || "(Sans objet)"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="truncate max-w-[120px]">
                                {log.template || "(Personnalisé)"}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {new Date(log.createdAt).toLocaleString("fr-FR", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={log.status === 'delivered' || log.status === 'opened' || log.status === 'clicked' 
                                  ? "outline" 
                                  : log.status === 'bounced' || log.status === 'failed' 
                                  ? "destructive" 
                                  : "secondary"}
                                className="text-xs whitespace-nowrap"
                              >
                                {log.status === 'delivered' && "Livré"}
                                {log.status === 'opened' && "Ouvert"}
                                {log.status === 'clicked' && "Cliqué"}
                                {log.status === 'bounced' && "Rebond"}
                                {log.status === 'spam' && "Spam"}
                                {log.status === 'failed' && "Échec"}
                                {log.status === 'queued' && "En attente"}
                                {log.status === 'sent' && "Envoyé"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Dialogue d'envoi d'email aux leads */}
        {isSendingDialog && (
          <Dialog open={isSendingDialog} onOpenChange={(open) => {
            if (!open) {
              setIsSendingDialog(false);
            }
          }}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Envoyer un email</DialogTitle>
                <DialogDescription>
                  Recherchez un destinataire, choisissez un modèle et personnalisez votre email.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="email-custom-recipient">Destinataire personnalisé (optionnel)</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input 
                          id="email-custom-recipient" 
                          placeholder="email@exemple.com" 
                          value={customRecipient || ""}
                          onChange={(e) => setCustomRecipient(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            if (customRecipient && customRecipient.includes('@')) {
                              setCustomRecipients([...customRecipients, customRecipient]);
                              setCustomRecipient("");
                            } else {
                              toast({
                                title: "Email invalide",
                                description: "Veuillez entrer une adresse email valide",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                    
                    {customRecipients.length > 0 && (
                      <div className="border rounded-md p-2 space-y-2">
                        <h4 className="text-sm font-medium">Destinataires personnalisés ({customRecipients.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {customRecipients.map((email, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1.5 py-1.5">
                              {email}
                              <X 
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  setCustomRecipients(customRecipients.filter((_, i) => i !== index));
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="email-subject">Sujet</Label>
                      <Input 
                        id="email-subject" 
                        placeholder="Sujet de l'email"
                        value={emailSubject || (selectedTemplate?.subject || "")}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email-content">Contenu de l'email</Label>
                      <Textarea 
                        id="email-content"
                        placeholder="Contenu de l'email..."
                        value={emailContent || (emailPreview || "")}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm mt-1.5"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Variables disponibles:</h4>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Utilisez ces variables pour personnaliser votre message:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      <code className="bg-muted p-1.5 rounded text-xs whitespace-nowrap">{`{{name}}`}</code>
                      <code className="bg-muted p-1.5 rounded text-xs whitespace-nowrap">{`{{referenceNumber}}`}</code>
                      <code className="bg-muted p-1.5 rounded text-xs whitespace-nowrap">{`{{address}}`}</code>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet des destinataires */}
                <TabsContent value="recipients" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Liste des leads</h4>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Input 
                              placeholder="Rechercher par ref, email..." 
                              value={leadSearchTerm} 
                              onChange={e => setLeadSearchTerm(e.target.value)}
                              className="h-8 text-sm w-[250px]"
                            />
                            {isSearching && (
                              <Loader2 className="h-4 w-4 animate-spin absolute right-2 top-2 text-muted-foreground" />
                            )}
                            
                            {/* Suggestions de recherche */}
                            {showSearchResults && searchResults.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-background rounded-md border shadow-md max-h-[300px] overflow-y-auto">
                                <div className="p-1">
                                  {searchResults.map(lead => (
                                    <button
                                      key={lead.id}
                                      className="w-full text-left hover:bg-accent px-2 py-1.5 rounded-sm flex items-start gap-2"
                                      onClick={() => {
                                        // Vérifier si le lead est déjà sélectionné
                                        const isAlreadySelected = selectedLeads.some(l => l.id === lead.id);
                                        if (!isAlreadySelected) {
                                          setSelectedLeads(prev => [...prev, lead]);
                                        }
                                        setLeadSearchTerm("");
                                        setShowSearchResults(false);
                                      }}
                                    >
                                      <Check className={cn(
                                        "h-4 w-4 mt-0.5", 
                                        selectedLeads.some(l => l.id === lead.id) ? "opacity-100" : "opacity-0"
                                      )} />
                                      <div>
                                        <p className="text-sm font-medium">{lead.firstName} {lead.lastName}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          {lead.referenceNumber && (
                                            <Badge variant="outline" className="text-[10px] font-normal py-0 h-4">{lead.referenceNumber}</Badge>
                                          )}
                                          <span>{lead.email}</span>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-8 text-sm w-[150px]">
                              <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="En attente de paiement">En attente de paiement</SelectItem>
                              <SelectItem value="Paiement effectué">Paiement effectué</SelectItem>
                              <SelectItem value="Rendez-vous programmé">Rendez-vous programmé</SelectItem>
                              <SelectItem value="Finalisé">Finalisé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted px-3 py-2">
                          <div className="flex items-center">
                            <Checkbox 
                              id="select-all" 
                              checked={selectAllLeads} 
                              onCheckedChange={handleSelectAllLeads}
                            />
                            <Label htmlFor="select-all" className="ml-2 text-xs font-medium">
                              Sélectionner tous les leads ({filteredLeads ? filteredLeads.length : 0})
                            </Label>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-[300px]">
                          {!filteredLeads || filteredLeads.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground">
                              <p className="text-sm">Aucun lead correspondant aux critères de recherche.</p>
                            </div>
                          ) : (
                            <div className="divide-y">
                              {filteredLeads.map(lead => (
                                <div key={lead.id} className="flex px-3 py-2 hover:bg-muted/50">
                                  <div className="flex items-center mr-2">
                                    <Checkbox 
                                      id={`lead-${lead.id}`} 
                                      checked={selectedLeads.some(l => l.id === lead.id)}
                                      onCheckedChange={checked => handleSelectLead(lead, !!checked)}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Label 
                                      htmlFor={`lead-${lead.id}`} 
                                      className="font-medium cursor-pointer text-sm"
                                    >
                                      {lead.firstName} {lead.lastName}
                                    </Label>
                                    <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground mt-0.5 gap-x-2">
                                      <span>{lead.email}</span>
                                      <span className="hidden sm:inline">•</span>
                                      <span>{lead.referenceNumber || "Sans référence"}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Badge variant="outline" className="text-xs">
                                      {lead.status || "Sans statut"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                    
                    {/* Liste des destinataires sélectionnés */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Destinataires sélectionnés</h4>
                      <div className="border rounded-md p-2 h-[350px] overflow-y-auto">
                        {selectedLeads.length === 0 && customRecipients.length === 0 ? (
                          <div className="flex flex-col gap-4 items-center justify-center h-full text-center text-muted-foreground">
                            <Users className="h-8 w-8 text-muted" />
                            <div>
                              <p className="mb-1">Aucun destinataire sélectionné</p>
                              <p className="text-sm">Sélectionnez des leads dans la liste ou ajoutez des destinataires personnalisés</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedLeads.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium mb-2">Leads ({selectedLeads.length})</h5>
                                <div className="space-y-2">
                                  {selectedLeads.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between text-sm p-1.5 border-b last:border-b-0">
                                      <div>
                                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => handleSelectLead(lead, false)}
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {customRecipients.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium mb-2">Destinataires personnalisés ({customRecipients.length})</h5>
                                <div className="space-y-2">
                                  {customRecipients.map((email, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm p-1.5 border-b last:border-b-0">
                                      <p className="text-sm">{email}</p>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => {
                                          setCustomRecipients(customRecipients.filter((_, i) => i !== index));
                                        }}
                                      >
                                        <Trash className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet des modèles */}
                <TabsContent value="template" className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-medium">Choisir un modèle</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {templatesData && typeof templatesData === 'object' && 'templates' in templatesData && Array.isArray(templatesData.templates) ? (
                        templatesData.templates.map((template: EmailTemplate) => (
                          <Card key={template.id} className={`overflow-hidden cursor-pointer hover:border-primary transition-colors ${selectedTemplate?.id === template.id ? 'border-primary' : ''}`}
                            onClick={() => handleApplyTemplate(template)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm">
                              <p className="line-clamp-3 text-xs text-muted-foreground">{template.body}</p>
                            </CardContent>
                            <CardFooter className="p-3 pt-0 flex justify-between">
                              <Badge variant="outline" className="text-xs">
                                {triggers.find(t => t.id === template.trigger)?.label || "Manuel"}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyTemplate(template);
                                }}
                              >
                                Appliquer
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full flex items-center justify-center p-8 text-muted-foreground">
                          <p>Aucun modèle disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={() => setIsSendingDialog(false)}>Annuler</Button>
                <Button 
                  onClick={handleSendEmails} 
                  disabled={(selectedLeads.length === 0 && customRecipients.length === 0) || !emailSubject || !emailContent || sendEmailMutation.isPending}
                  className="gap-x-2"
                >
                  {sendEmailMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Envoyer l'email 
                  {(selectedLeads.length > 0 || customRecipients.length > 0) && 
                    `(${selectedLeads.length + customRecipients.length} destinataire${selectedLeads.length + customRecipients.length > 1 ? 's' : ''})`
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Dialogue de test d'email */}
        <Dialog open={isTestEmailDialog} onOpenChange={setIsTestEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer un email de test</DialogTitle>
              <DialogDescription>
                Envoyez un exemple de ce modèle d'email à une adresse de test.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-email">Adresse email de test</Label>
                <Input 
                  id="test-email" 
                  placeholder="email@exemple.com" 
                  value={testEmailAddress} 
                  onChange={e => setTestEmailAddress(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Aperçu du modèle</Label>
                <div className="border rounded-md p-3 mt-1.5 space-y-2">
                  <p className="font-medium">{editingTemplate?.subject}</p>
                  <Separator />
                  <div className="max-h-[200px] overflow-y-auto">
                    <p className="whitespace-pre-line text-sm">{editingTemplate?.body}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTestEmailDialog(false)}>Annuler</Button>
              <Button 
                onClick={handleSendTestEmail}
                disabled={!testEmailAddress}
              >
                Envoyer le test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue d'édition de modèle */}
        <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Modifier le modèle" : "Créer un nouveau modèle"}</DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? "Modifiez les détails de ce modèle d'email." 
                  : "Créez un nouveau modèle d'email pour vos communications automatisées."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Nom du modèle</Label>
                <Input 
                  id="template-name" 
                  placeholder="ex: Confirmation de paiement" 
                  defaultValue={editingTemplate?.name}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-trigger">Déclencheur</Label>
                <Select defaultValue={editingTemplate?.trigger || "manual"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un déclencheur" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers && triggers.length > 0 ? triggers.map(trigger => (
                      <SelectItem key={trigger.id} value={trigger.id || "manual"}>
                        {trigger.label}
                      </SelectItem>
                    )) : <SelectItem value="manual">Manuel (pas de déclenchement automatique)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="template-subject">Sujet</Label>
                <Input 
                  id="template-subject" 
                  placeholder="ex: Votre demande de raccordement a été confirmée" 
                  defaultValue={editingTemplate?.subject}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="template-body">Contenu</Label>
                  <div className="text-xs text-muted-foreground">
                    Variables: <code>&#123;&#123;name&#125;&#125;</code>, <code>&#123;&#123;referenceNumber&#125;&#125;</code>, <code>&#123;&#123;address&#125;&#125;</code>
                  </div>
                </div>
                <Textarea 
                  id="template-body" 
                  placeholder="Cher(e) {{name}},

Nous vous confirmons la réception de votre demande de raccordement électrique référencée {{referenceNumber}}.

Cordialement,
L'équipe de raccordement"
                  className="min-h-[200px]"
                  defaultValue={editingTemplate?.body}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="template-active" 
                  defaultChecked={editingTemplate?.active ?? true}
                />
                <Label htmlFor="template-active">
                  Activer ce modèle
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>Annuler</Button>
              <Button onClick={() => {
                toast({
                  title: editingTemplate ? "Modèle mis à jour" : "Modèle créé",
                  description: editingTemplate 
                    ? "Les modifications ont été enregistrées avec succès." 
                    : "Le nouveau modèle a été créé avec succès.",
                  variant: "default"
                });
                setIsEditingTemplate(false);
              }}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}