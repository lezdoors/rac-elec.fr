import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
// Suppression de l'import RealtimeStatusBadge qui est maintenant géré par AdminLayout
import { getSenderName, getSenderInitial, getEmailSubject } from "@/lib/email-helpers";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailFolderTabs } from "@/components/admin/email-folder-tabs";
import { INBOX_FOLDER, SENT_FOLDER, SPAM_FOLDER, TRASH_FOLDER } from "@/lib/constants";
import { EmailComposer } from "@/components/admin/email-composer";
import { LeadFinder } from "@/components/admin/lead-finder";

import { 
  Loader2,
  Search,
  Plus,
  Edit,
  ArrowLeft,
  ArrowRight,
  User,
  FileText,
  Send,
  Paperclip,
  Clock,
  Trash,
  Inbox,
  MailCheck,
  MailX,
  Mail,
  Search as SearchIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  ShieldAlert, // Nouveau pour le dossier spam
  Info,
  RefreshCw,
  PenLine,
  Reply,
  ChevronUp,
  ChevronDown,
  Check,
  Eye,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { EmailPagination } from "@/components/admin/email-pagination";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helpers d'email sont maintenant importés depuis @/lib/email-helpers

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
  body?: string;
  content?: string; // Ajouter la propriété content comme alternative à body
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

// Les constantes pour les noms de dossiers sont maintenant importées depuis @/lib/constants

export default function EmailPage() {
  return (
    <AdminLayout title="Mail" description="Gestion de votre messagerie">
      <EmailPageContent />
    </AdminLayout>
  );
}

function EmailPageContent() {
  const { toast } = useToast();

  // States pour la recherche intégrée de leads et de demandes
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [serviceRequestResults, setServiceRequestResults] = useState<ServiceRequest[]>([]);
  const [showServiceRequestResults, setShowServiceRequestResults] = useState<boolean>(false);
  const [isSearchingServiceRequests, setIsSearchingServiceRequests] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [isTestEmailDialog, setIsTestEmailDialog] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>("");
  // Ancienne interface (désactivée) - gardée pour compatibilité
  const [isSendingDialog, setIsSendingDialog] = useState<boolean>(false);
  const [isAdvancedEmailDialog, setIsAdvancedEmailDialog] = useState<boolean>(false);
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

  // État pour le nouveau composant EmailComposer
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState<boolean>(false);
  const [emailComposerInitialRecipient, setEmailComposerInitialRecipient] = useState<string>("");
  const [emailComposerInitialSubject, setEmailComposerInitialSubject] = useState<string>("");
  const [emailComposerInitialBody, setEmailComposerInitialBody] = useState<string>("");
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [selectedServiceRequestForEmail, setSelectedServiceRequestForEmail] = useState<ServiceRequest | null>(null);

  // Fonction pour rechercher des leads par référence, nom ou email
  // Fonction pour rechercher des leads par référence, nom ou email
  const handleSearchLeads = async () => {
    if (!leadSearchTerm) return;

    setIsSearching(true);
    setShowSearchResults(true);
    setShowServiceRequestResults(false); // Cacher les résultats de demandes

    try {
      // Obtenir les leads directement depuis l'API
      const response = await apiRequest(
        "GET", 
        `/api/leads`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des leads");
      }

      const data = await response.json();

      if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
        const filteredResults = data.leads.filter((lead: Lead) => {
          const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
          const email = lead.email.toLowerCase();
          const searchTermLower = leadSearchTerm.toLowerCase();
          return fullName.includes(searchTermLower) || 
                email.includes(searchTermLower) || 
                (lead.referenceNumber && lead.referenceNumber.toLowerCase().includes(searchTermLower));
        });

        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche des leads:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les résultats de recherche",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction pour rechercher des demandes de service par référence
  const handleSearchServiceRequests = async () => {
    if (!leadSearchTerm) return;

    setIsSearchingServiceRequests(true);
    setShowServiceRequestResults(true);
    setShowSearchResults(false); // Cacher les résultats de leads

    try {
      // On cherche parmi les demandes déjà chargées
      const response = await apiRequest(
        "GET", 
        `/api/service-requests`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des demandes");
      }

      const serviceRequests = await response.json();

      if (serviceRequests && Array.isArray(serviceRequests)) {
        const filteredResults = serviceRequests.filter((request: ServiceRequest) => {
          const searchTermLower = leadSearchTerm.toLowerCase();
          return request.referenceNumber.toLowerCase().includes(searchTermLower) || 
                 request.clientName.toLowerCase().includes(searchTermLower) || 
                 request.clientEmail.toLowerCase().includes(searchTermLower);
        });

        setServiceRequestResults(filteredResults);
      } else {
        setServiceRequestResults([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche des demandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les résultats de recherche",
        variant: "destructive",
      });
      setServiceRequestResults([]);
    } finally {
      setIsSearchingServiceRequests(false);
    }
  };

  // Utiliser useAuth pour obtenir l'utilisateur connecté
  const { user: currentUser } = useAuth();

  // États pour la gestion des boîtes mail utilisateurs
  // Initialiser avec l'utilisateur connecté plutôt qu'admin par défaut
  const [selectedUser, setSelectedUser] = useState<number>(0); // La valeur sera mise à jour dans useEffect
  const [selectedMailbox, setSelectedMailbox] = useState<string>(INBOX_FOLDER);

  // Mettre à jour selectedUser quand currentUser change
  useEffect(() => {
    if (currentUser && currentUser.id) {
      setSelectedUser(currentUser.id);
    }
  }, [currentUser]);
  
  // Gestion des paramètres d'URL et des actions différées
  useEffect(() => {
    // Vérifier si on a un id de lead dans l'URL pour ouvrir directement le composeur
    const searchParams = new URLSearchParams(window.location.search);
    const leadId = searchParams.get('leadId');
    const viewEmailId = searchParams.get('view');
    
    if (leadId) {
      const id = parseInt(leadId, 10);
      if (!isNaN(id)) {
        // Ouvrir directement le composeur d'emails pour ce lead
        setSelectedLeadForEmail({ id });
        setIsEmailComposerOpen(true);
      }
    }

    // Vérifier s'il y a un email à répondre dans sessionStorage
    try {
      const replyToEmailStr = sessionStorage.getItem('reply_to_email');
      if (replyToEmailStr) {
        // Désérialiser l'email
        const replyToEmail = JSON.parse(replyToEmailStr);
        
        // Déclencher la réponse
        if (replyToEmail) {
          // Attendre que l'interface soit complètement chargée
          setTimeout(() => {
            handleReplyToEmail(replyToEmail);
            // Supprimer l'email de la session après l'avoir utilisé
            sessionStorage.removeItem('reply_to_email');
          }, 500);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'email à répondre:", error);
    }
  }, []);
  const [selectedEmail, setSelectedEmail] = useState<UserEmail | null>(null);
  const [isViewingEmail, setIsViewingEmail] = useState<boolean>(false);

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20; // 20 emails par page

  // Fonction pour valider un email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  // Utiliser l'ID de l'email spécifié dans l'URL pour l'ouvrir automatiquement
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewEmailId = searchParams.get('view');
    
    // Vérifier si on a un email à afficher/ouvrir spécifié dans l'URL
    if (viewEmailId && userEmails && typeof userEmails === 'object' && 'emails' in userEmails) {
      const emailToView = userEmails.emails.find((email: any) => email.id === viewEmailId);
      if (emailToView) {
        handleViewEmail(emailToView);
      }
    }
  }, [userEmails]);

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
      const response = await apiRequest(
        "POST", 
        `/api/mark-email`, 
        { userId, messageId, isRead, mailbox }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du marquage de l'email");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      toast({
        title: "Email mis à jour",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la mise à jour de l'email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour déplacer un email vers un autre dossier
  const moveEmailMutation = useMutation({
    mutationFn: async ({ userId, messageId, destinationMailbox, sourceMailbox }: { userId: number, messageId: string, destinationMailbox: string, sourceMailbox: string }) => {
      const response = await apiRequest(
        "POST", 
        `/api/move-email`, 
        { userId, messageId, destinationMailbox, sourceMailbox }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du déplacement de l'email");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      setSelectedEmail(null);
      setIsViewingEmail(false);
      toast({
        title: "Email déplacé",
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
      const response = await apiRequest(
        "DELETE", 
        `/api/delete-email`, 
        { userId, messageId, mailbox }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression de l'email");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-emails", selectedUser, selectedMailbox] });
      setSelectedEmail(null);
      setIsViewingEmail(false);
      toast({
        title: "Email supprimé",
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
      // S'assurer que les propriétés correspondent à ce qu'attend l'API
      const formattedData = {
        ...emailData,
        // Renommer content en body si nécessaire pour l'API
        body: emailData.content,
        content: emailData.content
      };
      const res = await apiRequest("POST", "/api/send-email", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé avec succès",
        variant: "default",
      });
      setIsAdvancedEmailDialog(false);
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

  // Fonction pour répondre à un email
  const handleReplyToEmail = (email: UserEmail | null) => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Impossible de répondre à cet email",
        variant: "destructive",
      });
      return;
    }

    // Initialiser le sujet avec "Re: " + sujet original s'il n'a pas déjà ce préfixe
    const originalSubject = getEmailSubject(email);
    const subject = originalSubject.startsWith("Re: ") ? originalSubject : `Re: ${originalSubject}`;

    // Déterminer le destinataire (l'expéditeur de l'email auquel on répond)
    let to = "";
    
    // Gestion robuste de l'adresse de l'expéditeur
    if (email.from) {
      // Si from est un tableau d'objets
      if (Array.isArray(email.from) && email.from.length > 0) {
        if (email.from[0].address) {
          to = email.from[0].address;
        } else if (typeof email.from[0] === 'string') {
          to = email.from[0];
        }
      } 
      // Si from est un objet unique
      else if (typeof email.from === 'object' && email.from !== null) {
        if ('address' in email.from && email.from.address) {
          to = email.from.address;
        } else if ('text' in email.from && email.from.text) {
          // Tentative d'extraction d'email à partir du format "Nom <email@example.com>"
          const match = String(email.from.text).match(/<([^>]+)>/);
          to = match ? match[1] : email.from.text;
        }
      } 
      // Si from est une chaîne simple
      else if (typeof email.from === 'string') {
        // Tentative d'extraction d'email à partir du format "Nom <email@example.com>"
        const match = email.from.match(/<([^>]+)>/);
        to = match ? match[1] : email.from;
      }
    }

    if (!to) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer l'adresse de l'expéditeur",
        variant: "destructive",
      });
      return;
    }

    // Préparer le corps du message avec citation du message original
    const originalDate = email.date ? new Date(email.date).toLocaleString("fr-FR") : "Date inconnue";
    const from = getSenderName(email);

    // Citation formatée du message original
    const quoteHeader = `\n\n--------- Message original ---------\nDe: ${from}\nDate: ${originalDate}\nObjet: ${originalSubject}\n\n`;
    const quoteBody = email.text || "";
    
    console.log("Réponse à l'email - Destinataire:", to);

    // Utiliser le nouveau composeur d'emails au lieu de l'ancien
    setEmailComposerInitialRecipient(to);
    setEmailComposerInitialSubject(subject);
    setEmailComposerInitialBody(quoteHeader + quoteBody);
    setSelectedLeadForEmail(null);
    setSelectedServiceRequestForEmail(null);
    setIsEmailComposerOpen(true);
  };

  // Fonction pour gérer le changement d'utilisateur
  const handleUserChange = (userId: string) => {
    if (userId === "no-user" || !userId) {
      // Si l'utilisateur est connecté, utiliser son ID, sinon utiliser admin (1) comme minimum
      if (currentUser && currentUser.id) {
        setSelectedUser(currentUser.id);
      } else {
        setSelectedUser(1);
      }
    } else {
      setSelectedUser(parseInt(userId));
      setSelectedMailbox(INBOX_FOLDER); // Réinitialiser à la boîte de réception par défaut
    }
    setSelectedEmail(null);
    setIsViewingEmail(false);
  };

  // Fonction pour gérer le changement d'onglet
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);

    // Réinitialiser la pagination quand on change d'onglet
    setCurrentPage(1);

    // Si c'est un dossier d'email, synchroniser selectedMailbox
    if (tabValue === INBOX_FOLDER.toLowerCase() ||
        tabValue === SENT_FOLDER.toLowerCase() ||
        tabValue === SPAM_FOLDER.toLowerCase() ||
        tabValue === TRASH_FOLDER.toLowerCase()) {
      // Utilisez directement les constantes plutôt que de convertir
      if (tabValue === INBOX_FOLDER.toLowerCase()) {
        setSelectedMailbox(INBOX_FOLDER);
      } else if (tabValue === SENT_FOLDER.toLowerCase()) {
        setSelectedMailbox(SENT_FOLDER);
      } else if (tabValue === SPAM_FOLDER.toLowerCase()) {
        setSelectedMailbox(SPAM_FOLDER);
      } else if (tabValue === TRASH_FOLDER.toLowerCase()) {
        setSelectedMailbox(TRASH_FOLDER);
      }

      // Réinitialiser la visualisation d'email
      setSelectedEmail(null);
      setIsViewingEmail(false);

      // Rafraîchir les emails après changement de dossier
      refetchUserEmails();
    }
  };

  // Fonction pour gérer le changement de boîte mail (dépréciée - utiliser handleTabChange)
  const handleMailboxChange = (mailboxName: string) => {
    setSelectedMailbox(mailboxName);
    setActiveTab(mailboxName.toLowerCase()); // Synchroniser l'onglet actif
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

  // Fonction pour ouvrir le dialogue de confirmation de suppression
  const [emailToDelete, setEmailToDelete] = useState<{ userId: number, messageId: string, mailbox: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const openDeleteConfirmation = (userId: number, messageId: string, mailbox: string) => {
    setEmailToDelete({ userId, messageId, mailbox });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmail = () => {
    if (emailToDelete) {
      deleteEmailMutation.mutate(emailToDelete);
    }
    setIsDeleteDialogOpen(false);
  };

  // Fonction pour manipuler les leads dans la liste de destinataires
  const handleSelectLead = (lead: Lead, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, lead]);
    } else {
      setSelectedLeads(prev => prev.filter(l => l.id !== lead.id));
    }
  };

  // Fonction pour ouvrir la boîte de dialogue d'envoi d'email avec un modèle
  const handleOpenSendDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailContent(template.body);
    setIsAdvancedEmailDialog(true);
  };

  // Fonction pour appliquer un modèle à tous les leads sélectionnés et envoyer
  const handleApplyTemplate = (template: EmailTemplate) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Aucun lead sélectionné",
        description: "Veuillez sélectionner au moins un lead avant d'envoyer.",
        variant: "destructive",
      });
      return;
    }

    // Pour chaque lead sélectionné, envoyer un email avec le modèle
    selectedLeads.forEach(lead => {
      const emailData: EmailWithLeadData = {
        leadId: lead.id,
        templateId: template.id,
        to: lead.email,
        subject: template.subject,
        content: template.body,
        recipients: [{ id: lead.id, email: lead.email, name: `${lead.firstName} ${lead.lastName}`, referenceNumber: lead.referenceNumber }]
      };

      sendEmailMutation.mutate(emailData);
    });
  };

  // Fonction pour sélectionner tous les leads filtrés
  useEffect(() => {
    if (selectAllLeads) {
      const filteredLeads = leadsData && 'leads' in leadsData ? 
        leadsData.leads.filter((lead: Lead) => {
          const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
          const email = lead.email.toLowerCase();
          const searchTermLower = leadSearchTerm.toLowerCase();
          const matchesSearch = fullName.includes(searchTermLower) || 
                               email.includes(searchTermLower) || 
                               (lead.referenceNumber && lead.referenceNumber.toLowerCase().includes(searchTermLower));

          const matchesStatus = !filterStatus || (lead.status && lead.status === filterStatus);

          return matchesSearch && matchesStatus;
        }) : [];

      setSelectedLeads(filteredLeads);
    } else {
      // Si on désélectionne "tous", ne rien faire (laisser les sélections manuelles)
    }
  }, [selectAllLeads, leadsData, leadSearchTerm, filterStatus]);

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

  // Gestion de la pagination (20 emails par page)
  const totalEmails = sortedUserEmails.length;
  const totalPages = Math.ceil(totalEmails / itemsPerPage);
  const indexOfLastEmail = currentPage * itemsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - itemsPerPage;
  const currentEmails = sortedUserEmails.slice(indexOfFirstEmail, indexOfLastEmail);

  // Fonction pour changer de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Revenir en haut de la liste
    window.scrollTo(0, 0);
  };

  // Filtrer les leads en fonction du terme de recherche et du statut
  const filteredLeads = leadsData && typeof leadsData === 'object' && 'leads' in leadsData && Array.isArray(leadsData.leads) ? 
    leadsData.leads.filter((lead: Lead) => {
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      const email = lead.email.toLowerCase();
      const searchTermLower = leadSearchTerm.toLowerCase();
      const matchesSearch = fullName.includes(searchTermLower) || 
                            email.includes(searchTermLower) || 
                            (lead.referenceNumber && lead.referenceNumber.toLowerCase().includes(searchTermLower));

      const matchesStatus = !filterStatus || (lead.status && lead.status === filterStatus);

      return matchesSearch && matchesStatus;
    }) : [];

  // Filtrer les logs d'emails pour la recherche
  const filteredLogs = Array.isArray(emailLogs) ? emailLogs.filter((log: EmailLogEntry) => {
    // filtres à implémenter selon les besoins
    return true;
  }) : [];

  // Trier les logs d'emails
  const sortedLogs = Array.isArray(filteredLogs) ? [...filteredLogs].sort((a: EmailLogEntry, b: EmailLogEntry) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  }) : [];

  // Envoyer un email à partir du formulaire avancé
  const handleSendAdvancedEmail = () => {
    if (!customRecipient && customRecipients.length === 0) {
      toast({
        title: "Aucun destinataire spécifié",
        description: "Veuillez ajouter au moins un destinataire.",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject) {
      toast({
        title: "Sujet vide",
        description: "Veuillez ajouter un sujet à votre email.",
        variant: "destructive",
      });
      return;
    }

    if (!emailContent) {
      toast({
        title: "Contenu vide",
        description: "Veuillez ajouter du contenu à votre email.",
        variant: "destructive",
      });
      return;
    }

    // Créer la liste finale des destinataires
    const allRecipients = [...customRecipients];
    if (customRecipient && !allRecipients.includes(customRecipient)) {
      allRecipients.push(customRecipient);
    }

    // Envoyer l'email
    const emailData: EmailWithLeadData = {
      templateId: selectedTemplate?.id || "",
      to: allRecipients.join(","),
      subject: emailSubject,
      content: emailContent,
    };

    sendEmailMutation.mutate(emailData);
  };

  // Ajouter un destinataire à la liste
  const handleAddRecipient = () => {
    if (customRecipient && isValidEmail(customRecipient) && !customRecipients.includes(customRecipient)) {
      setCustomRecipients(prev => [...prev, customRecipient]);
      setCustomRecipient("");
    } else if (customRecipient && !isValidEmail(customRecipient)) {
      toast({
        title: "Format d'email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
    } else if (customRecipients.includes(customRecipient)) {
      toast({
        title: "Destinataire déjà ajouté",
        description: "Ce destinataire est déjà dans la liste.",
        variant: "default",
      });
      setCustomRecipient("");
    }
  };

  // Retirer un destinataire de la liste
  const handleRemoveRecipient = (email: string) => {
    setCustomRecipients(prev => prev.filter(e => e !== email));
  };

  // Créer la référence à l'interface utilisateur
  const [location, navigate] = useLocation(); // Utilisation de useLocation au lieu de useRouter
  const [userId, setUserId] = useState<number>(0); // État pour l'ID de l'utilisateur

  // Fonction pour charger les boîtes mail d'un utilisateur
  const fetchMailboxes = async (userId: number) => {
    const response = await apiRequest("GET", `/api/mailboxes?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des boîtes mail");
    }
    const data = await response.json();
    // Mettre à jour l'état des boîtes mail si nécessaire
  };

  // Fonction pour charger les emails d'un utilisateur dans une boîte mail spécifique
  const fetchEmails = async (userId: number, mailbox: string) => {
    const response = await apiRequest("GET", `/api/user-emails?userId=${userId}&selectedMailbox=${mailbox}`);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des emails");
    }
    const data = await response.json();
    // Mettre à jour l'état des emails si nécessaire
  };


  useEffect(() => {
    if (currentUser) {
      // Avec wouter, on peut analyser les paramètres de requête à partir de location
      const params = new URLSearchParams(location.split('?')[1] || '');
      const defaultUser = params.get('defaultUser');

      // Si on vient de la route mail avec defaultUser=contact@portail-electricite.com, s'assurer que c'est bien l'utilisateur admin qu'on utilise
      if (defaultUser === "contact@portail-electricite.com" && currentUser.username === "admin") {
        setSelectedUser(currentUser.id);
        // Forcer le chargement des emails
        fetchMailboxes(currentUser.id);
        fetchEmails(currentUser.id, "INBOX");
      } else {
        setSelectedUser(currentUser.id);
      }
    }
  }, [location, currentUser]);


  return (
    <div className="pb-10">
      <div className="flex flex-col gap-8">
        {/* En-tête principal et statistiques */}
        <div className="space-y-4 xl:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Mail</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedUser.toString()} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    usersData && 'users' in usersData && Array.isArray(usersData.users) && 
                    usersData.users.map((user: User) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetchUserEmails()}
                disabled={isLoadingUserEmails}
              >
                {isLoadingUserEmails ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // Réinitialiser les valeurs du composeur d'emails moderne
                  setEmailComposerInitialRecipient("");
                  setEmailComposerInitialSubject("");
                  setEmailComposerInitialBody("");
                  setSelectedLeadForEmail(null);
                  setSelectedServiceRequestForEmail(null);
                  setIsEmailComposerOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Messages non lus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sortedUserEmails.filter(e => !e.isRead).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{sortedUserEmails.filter(e => !e.isRead && new Date(e.date) > new Date(Date.now() - 24*60*60*1000)).length} aujourd'hui
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Modèles disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalTemplates}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeTemplates} modèles actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Emails envoyés (30j)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sentLastMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taux de délivrance: {deliveryRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Dossiers disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  4 {/* Seulement 4 dossiers standards : Boîte de réception, Messages envoyés, Spam, Corbeille */}
                </div>
                <p className="text-xs text-muted-foreground">
                  Boîte active: {selectedMailbox}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interface principale */}
        <div className="flex-1 space-y-4 lg:space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-between items-center">
              {/* Section des dossiers d'emails */}
              <div className="flex-1">
                <EmailFolderTabs 
                  currentFolder={selectedMailbox} 
                  onFolderChange={folder => {
                    // Utiliser la même logique que handleTabChange pour plus de cohérence
                    setSelectedMailbox(folder);
                    setActiveTab(folder.toLowerCase());
                    setCurrentPage(1);
                    setSelectedEmail(null);
                    setIsViewingEmail(false);
                    refetchUserEmails();
                  }}
                  userId={selectedUser}
                />
              </div>

              {/* Section des onglets administratifs */}
              <TabsList className="mb-4 ml-2">
                <TabsTrigger value="templates" className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Modèles</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Historique</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <TabsContent value="inbox" className="mt-0">
                {isLoadingUserEmails ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isViewingEmail && selectedEmail ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmail(null);
                          setIsViewingEmail(false);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplyToEmail(selectedEmail)}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Répondre
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            openDeleteConfirmation(
                              selectedUser,
                              selectedEmail.id,
                              selectedMailbox
                            );
                          }}
                          disabled={deleteEmailMutation.isPending}
                        >
                          <Trash className="h-4 w-4 mr-2 text-red-500" />
                          Supprimer
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
                ) : currentEmails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Boîte de réception vide</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Aucun email trouvé dans cette boîte. Les nouveaux messages apparaîtront ici.
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
                      {currentEmails.map((email: UserEmail) => (
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
                            <div className="flex items-center gap-1.5">
                              {/* Action principale: Voir l'email */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-primary hover:bg-primary/10" 
                                onClick={() => handleViewEmail(email)}
                                title="Voir"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              {/* Action principale: Répondre */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                                onClick={() => handleReplyToEmail(email)}
                                title="Répondre"
                              >
                                <Reply className="h-3.5 w-3.5" />
                              </Button>

                              {/* Marquer comme lu/non lu */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 hover:bg-gray-100" 
                                onClick={() => {
                                  markEmailMutation.mutate({
                                    userId: selectedUser,
                                    messageId: email.id,
                                    isRead: !email.isRead,
                                    mailbox: selectedMailbox
                                  });
                                }}
                                title={email.isRead ? "Marquer comme non lu" : "Marquer comme lu"}
                              >
                                {email.isRead ? 
                                  <MailX className="h-3.5 w-3.5 text-gray-500" /> : 
                                  <MailCheck className="h-3.5 w-3.5 text-green-500" />
                                }
                              </Button>

                              {/* Supprimer */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                onClick={() => {
                                  openDeleteConfirmation(
                                    selectedUser,
                                    email.id,
                                    selectedMailbox
                                  );
                                }}
                                title="Supprimer"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Ajout de la pagination des emails */}
                {!isLoadingUserEmails && !isViewingEmail && sortedUserEmails.length > 0 && (
                  <EmailPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalEmails={totalEmails}
                    indexOfFirstEmail={indexOfFirstEmail}
                    indexOfLastEmail={indexOfLastEmail}
                    onPageChange={handlePageChange}
                  />
                )}
              </TabsContent>

              <TabsContent value={SENT_FOLDER.toLowerCase()} className="mt-0">
                {isLoadingUserEmails ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isViewingEmail && selectedEmail ? (
                  <div className="space-y-6">
                    {/* Contenu similaire à l'onglet inbox pour l'affichage d'un email */}
                  </div>
                ) : currentEmails.length === 0 ? (
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
                      {currentEmails.map((email: UserEmail) => (
                        <TableRow key={email.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {email.hasAttachments && (
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {email.from && email.from.length > 0 ? 
                                    (email.from[0]?.name?.[0] || email.from[0]?.address?.[0])
                                    : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="truncate max-w-[120px] md:max-w-[180px]">
                                {email.from && email.from.length > 0 ? 
                                  (email.from.map(f => f.name || f.address).join(", ") || 'Expéditeur inconnu')
                                  : 'Expéditeur inconnu'}
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
                            <div className="flex items-center gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-primary hover:bg-primary/10" 
                                onClick={() => handleViewEmail(email)}
                                title="Voir"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                onClick={() => {
                                  openDeleteConfirmation(
                                    selectedUser,
                                    email.id,
                                    selectedMailbox
                                  );
                                }}
                                title="Supprimer"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Pagination pour les emails envoyés */}
                {!isLoadingUserEmails && !isViewingEmail && sortedUserEmails.length > 0 && (
                  <EmailPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalEmails={totalEmails}
                    indexOfFirstEmail={indexOfFirstEmail}
                    indexOfLastEmail={indexOfLastEmail}
                    onPageChange={handlePageChange}
                  />
                )}
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
                            <Badge variant={log.status === 'delivered' || log.status === 'opened' || log.status === 'clicked' ? "outline" : 
                              log.status === 'bounced' || log.status === 'failed' ? "destructive" : "secondary"}
                              className={cn(
                                "capitalize",
                                log.status === 'delivered' && "bg-green-50 text-green-700 hover:bg-green-50 border-green-200",
                                log.status === 'opened' && "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
                                log.status === 'clicked' && "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300",
                                log.status === 'queued' && "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
                              )}
                            >
                              {{                                
                                'delivered': 'Livré',
                                'opened': 'Ouvert',
                                'clicked': 'Cliqué',
                                'bounced': 'Échec',
                                'failed': 'Échec',
                                'spam': 'Spam',
                                'queued': 'En attente'
                              }[log.status] || log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value={SPAM_FOLDER.toLowerCase()} className="mt-0">
                {/* Contenu pour l'onglet spam */}
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Dossier spam</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Les emails détectés comme indésirables apparaîtront ici.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value={TRASH_FOLDER.toLowerCase()} className="mt-0">
                {isLoadingUserEmails ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isViewingEmail && selectedEmail ? (
                  <div className="space-y-6">
                    {/* Afficher le contenu de l'email sélectionné - identique à l'onglet inbox */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmail(null);
                          setIsViewingEmail(false);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            moveEmailMutation.mutate({
                              userId: selectedUser,
                              messageId: selectedEmail.id,
                              destinationMailbox: INBOX_FOLDER,
                              sourceMailbox: selectedMailbox
                            });
                          }}
                          disabled={moveEmailMutation.isPending}
                        >
                          <Inbox className="h-4 w-4 mr-2" />
                          Restaurer
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
                ) : currentEmails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trash className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Corbeille vide</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Aucun email dans la corbeille.
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
                      {currentEmails.map((email: UserEmail) => (
                        <TableRow key={email.id}>
                          <TableCell>
                            <div className="flex items-center">
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
                            <div className="flex items-center gap-1.5">
                              {/* Action principale: Voir l'email */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-primary hover:bg-primary/10" 
                                onClick={() => handleViewEmail(email)}
                                title="Voir"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              {/* Restaurer l'email */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                                onClick={() => {
                                  moveEmailMutation.mutate({
                                    userId: selectedUser,
                                    messageId: email.id,
                                    destinationMailbox: INBOX_FOLDER,
                                    sourceMailbox: selectedMailbox
                                  });
                                }}
                                title="Restaurer"
                              >
                                <Inbox className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Pagination pour la corbeille */}
                {!isLoadingUserEmails && !isViewingEmail && sortedUserEmails.length > 0 && (
                  <EmailPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalEmails={totalEmails}
                    indexOfFirstEmail={indexOfFirstEmail}
                    indexOfLastEmail={indexOfLastEmail}
                    onPageChange={handlePageChange}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Boîte de dialogue pour l'édition des modèles */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Modifier le modèle" : "Nouveau modèle d'email"}</DialogTitle>
            <DialogDescription>
              Créez ou modifiez un modèle d'email pour une utilisation rapide.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Nom
              </Label>
              <Input
                id="template-name"
                placeholder="Nom du modèle"
                className="col-span-3"
                value={editingTemplate?.name || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : {id: "", name: e.target.value, subject: "", body: "", trigger: "", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-trigger" className="text-right">
                Déclencheur
              </Label>
              <Input
                id="template-trigger"
                placeholder="Ex: nouveau-client, suivi-commande"
                className="col-span-3"
                value={editingTemplate?.trigger || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, trigger: e.target.value} : {id: "", name: "", subject: "", body: "", trigger: e.target.value, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-subject" className="text-right">
                Sujet
              </Label>
              <Input
                id="template-subject"
                placeholder="Sujet de l'email"
                className="col-span-3"
                value={editingTemplate?.subject || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, subject: e.target.value} : {id: "", name: "", subject: e.target.value, body: "", trigger: "", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="template-body" className="text-right pt-2">
                Contenu
              </Label>
              <Textarea
                id="template-body"
                placeholder="Contenu de l'email..."
                className="col-span-3 min-h-[200px]"
                value={editingTemplate?.body || ""}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, body: e.target.value} : {id: "", name: "", subject: "", body: e.target.value, trigger: "", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="template-active" className="mr-2">
                  Actif
                </Label>
              </div>
              <div className="col-span-3">
                <Checkbox
                  id="template-active"
                  checked={editingTemplate?.active || false}
                  onCheckedChange={(checked) => setEditingTemplate(prev => prev ? {...prev, active: checked as boolean} : {id: "", name: "", subject: "", body: "", trigger: "", active: checked as boolean, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>Annuler</Button>
            <Button>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour tester un modèle d'email */}
      <Dialog open={isTestEmailDialog} onOpenChange={setIsTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tester le modèle</DialogTitle>
            <DialogDescription>
              Envoyez un email de test pour vérifier l'apparence du modèle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-email" className="text-right">
                Destinataire
              </Label>
              <Input
                id="test-email"
                placeholder="Email de test"
                className="col-span-3"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Modèle
              </Label>
              <div className="col-span-3">
                <Badge variant="outline" className="bg-gray-50 border-gray-200">
                  {editingTemplate?.name || "Modèle non sélectionné"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestEmailDialog(false)}>Annuler</Button>
            <Button disabled={!isValidEmail(testEmailAddress) || !editingTemplate}>
              Envoyer le test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour l'envoi d'email avancé */}
      <Dialog open={isAdvancedEmailDialog} onOpenChange={setIsAdvancedEmailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
            <DialogDescription>
              Rédigez un email personnalisé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-to" className="text-right">
                Destinataire
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="email-to"
                  placeholder="Email du destinataire"
                  className="flex-1"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddRecipient} 
                  disabled={!customRecipient || !isValidEmail(customRecipient)}
                >
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Rechercher par référence
              </Label>
              <div className="col-span-3">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Ex: RAC-2025-0602-143045-742"
                      className="flex-1"
                      value={leadSearchTerm}
                      onChange={(e) => setLeadSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchLeads()}
                    />
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSearchLeads}
                        disabled={isSearching}
                        title="Rechercher un lead"
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <User className="h-4 w-4 mr-1" />
                        )}
                        Leads
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSearchServiceRequests}
                        disabled={isSearchingServiceRequests}
                        title="Rechercher une demande de service"
                      >
                        {isSearchingServiceRequests ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <FileText className="h-4 w-4 mr-1" />
                        )}
                        Demandes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Résultats de recherche pour les leads */}
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <div></div>
              <div className="col-span-3">
                {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-[200px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Nom</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                              <TableCell>{lead.referenceNumber || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setCustomRecipient(lead.email);
                                    setShowSearchResults(false);
                                    toast({
                                      title: "Lead sélectionné",
                                      description: `${lead.firstName} ${lead.lastName} ajouté comme destinataire`
                                    });
                                  }}
                                >
                                  Sélectionner
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {showSearchResults && searchResults.length === 0 && (
                    <div className="mt-2 p-4 text-center text-muted-foreground border rounded-md">
                      Aucun lead trouvé
                    </div>
                  )}

                  {/* Résultats de recherche pour les demandes de service */}
                  {showServiceRequestResults && serviceRequestResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-[200px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead className="w-[200px]">Client</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceRequestResults.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.referenceNumber}</TableCell>
                              <TableCell>{request.clientName}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setCustomRecipient(request.clientEmail);
                                    setShowServiceRequestResults(false);
                                    toast({
                                      title: "Demande sélectionnée",
                                      description: `${request.referenceNumber} ajoutée comme destinataire`
                                    });
                                  }}
                                >
                                  Sélectionner
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {showServiceRequestResults && serviceRequestResults.length === 0 && (
                    <div className="mt-2 p-4 text-center text-muted-foreground border rounded-md">
                      Aucune demande trouvée
                    </div>
                  )}
              </div>
            </div>
            {customRecipients.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div></div>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {customRecipients.map((email) => (
                    <Badge 
                      key={email} 
                      variant="secondary" 
                      className="flex items-center gap-1.5 py-1.5 pl-2 pr-1.5"
                    >
                      <span>{email}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full hover:bg-gray-200 p-0" 
                        onClick={() => handleRemoveRecipient(email)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-subject" className="text-right">
                Sujet
              </Label>
              <Input
                id="email-subject"
                placeholder="Sujet de l'email"
                className="col-span-3"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            {selectedTemplate && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Modèle
                </Label>
                <div className="col-span-3">
                  <Badge variant="outline" className="bg-gray-50 border-gray-200">
                    {selectedTemplate.name}
                  </Badge>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="email-content" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="email-content"
                placeholder="Contenu de l'email..."
                className="col-span-3 min-h-[200px]"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdvancedEmailDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleSendAdvancedEmail} 
              disabled={(!customRecipient && customRecipients.length === 0) || !emailSubject || !emailContent || sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue pour l'envoi d'emails aux leads */}
      <Dialog open={isSendingDialog} onOpenChange={setIsSendingDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Envoyer un email aux leads</DialogTitle>
            <DialogDescription>
              Sélectionnez les leads auxquels vous souhaitez envoyer un email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectAllLeads} 
                  onCheckedChange={(checked) => setSelectAllLeads(checked as boolean)}
                />
                <Label htmlFor="select-all">Tous sélectionner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Rechercher un lead..."
                  value={leadSearchTerm}
                  onChange={(e) => setLeadSearchTerm(e.target.value)}
                  className="w-48 h-8 text-xs"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {isLoadingLeads ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>Aucun lead correspondant aux critères.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedLeads.some(l => l.id === lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.referenceNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            lead.status === "nouveau" && "bg-blue-50 text-blue-700 border-blue-200", 
                            lead.status === "en_cours" && "bg-amber-50 text-amber-700 border-amber-200",
                            lead.status === "termine" && "bg-green-50 text-green-700 border-green-200",
                            lead.status === "annule" && "bg-red-50 text-red-700 border-red-200",
                          )}>
                            {{
                              "nouveau": "Nouveau",
                              "en_cours": "En cours",
                              "termine": "Terminé",
                              "annule": "Annulé"
                            }[lead.status || ""] || "Non défini"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="mt-2 mb-4">
              <h4 className="text-sm font-medium mb-2">Destinataires sélectionnés:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun destinataire sélectionné</p>
                ) : (
                  selectedLeads.map((lead) => (
                    <Badge 
                      key={`lead-${lead.id}`} 
                      variant="secondary" 
                      className="flex items-center gap-1.5 py-1.5 pl-2 pr-1.5 bg-white border shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span>{lead.firstName} {lead.lastName}</span>
                        {lead.referenceNumber && (
                          <span className="text-xs text-primary font-normal">{lead.referenceNumber}</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full hover:bg-gray-200 ml-1.5" 
                        onClick={() => handleSelectLead(lead, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Sélectionnez un modèle:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isLoadingTemplates ? (
                  <div className="col-span-full flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    <p>Aucun modèle disponible.</p>
                  </div>
                ) : (
                  templates.map((template: EmailTemplate) => (
                    <Card key={template.id} className={cn(
                      "cursor-pointer transition-all hover:border-primary hover:shadow-md",
                      selectedTemplate?.id === template.id && "border-primary ring-1 ring-primary"
                    )} onClick={() => setSelectedTemplate(template)}>
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="truncate">{template.name}</span>
                          {template.active ? (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50 border-green-200 text-xs py-0">
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 hover:bg-gray-50 border-gray-200 text-xs py-0">
                              Inactif
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-1.5">
                        <div className="text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Sujet:</span> {template.subject}
                          </div>
                          <div className="mt-1 truncate">
                            <span className="font-medium">Contenu:</span> {template.body.substring(0, 50)}...
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {selectedTemplate && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Aperçu du modèle:</h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="font-medium text-sm">Sujet:</span> {selectedTemplate.subject}
                    </div>
                    <Separator className="my-2" />
                    <div className="whitespace-pre-line text-sm">
                      {selectedTemplate.body}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendingDialog(false)}>Annuler</Button>
            <Button 
              onClick={() => handleApplyTemplate(selectedTemplate!)} 
              disabled={selectedLeads.length === 0 || !selectedTemplate}
            >
              Envoyer à {selectedLeads.length} destinataire{selectedLeads.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nouveau composant EmailComposer amélioré */}
      <EmailComposer 
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        initialRecipient={emailComposerInitialRecipient}
        initialSubject={emailComposerInitialSubject}
        initialBody={emailComposerInitialBody}
        selectedLead={selectedLeadForEmail}
        selectedServiceRequest={selectedServiceRequestForEmail}
      />

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet email ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmail} className="bg-red-600 hover:bg-red-700">
              {deleteEmailMutation.isPending ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </div>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}