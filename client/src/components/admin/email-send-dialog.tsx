import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send, Check, User, Mail, X } from "lucide-react";

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

interface EmailSendDialogProps {
  open: boolean;
  onClose: () => void;
  templatesData: { templates: EmailTemplate[] };
  searchResults: Lead[];
  isSearching: boolean;
  showSearchResults: boolean;
  leadSearchTerm: string;
  setLeadSearchTerm: (term: string) => void;
  setShowSearchResults: (show: boolean) => void;
  selectedLeads: Lead[];
  setSelectedLeads: (leads: Lead[]) => void;
  handleSelectLead: (lead: Lead, selected: boolean) => void;
}

export function EmailSendDialog({
  open,
  onClose,
  templatesData,
  searchResults,
  isSearching,
  showSearchResults,
  leadSearchTerm,
  setLeadSearchTerm,
  setShowSearchResults,
  selectedLeads,
  setSelectedLeads,
  handleSelectLead
}: EmailSendDialogProps) {
  const { toast } = useToast();

  // États locaux pour le dialogue
  const [customRecipient, setCustomRecipient] = useState<string>("");
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<string>("");

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
      onClose();
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

  // Fonction pour appliquer un modèle d'email
  const handleApplyTemplate = (template: EmailTemplate) => {
    if (!template) return;
    
    setSelectedTemplate(template);
    setEmailSubject(template.subject);
    setEmailContent(template.body);
    setEmailPreview(template.body);
  };

  // Fonction pour envoyer des emails
  const handleSendEmails = () => {
    if (selectedLeads.length === 0 && customRecipients.length === 0) {
      toast({
        title: "Aucun destinataire sélectionné",
        description: "Veuillez sélectionner au moins un destinataire avant d'envoyer l'email.",
        variant: "destructive"
      });
      return;
    }

    if (!emailSubject || !emailContent) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le sujet et le contenu de l'email.",
        variant: "destructive"
      });
      return;
    }

    // Préparation des données pour l'envoi
    const recipients = [
      ...selectedLeads.map(lead => ({
        id: lead.id,
        email: lead.email,
        name: `${lead.firstName} ${lead.lastName}`,
        referenceNumber: lead.referenceNumber
      })),
      ...customRecipients.map((email, index) => ({
        id: -1 - index, // ID négatif pour les destinataires personnalisés
        email,
        name: email.split('@')[0],
        referenceNumber: undefined
      }))
    ];

    const emailData: EmailWithLeadData = {
      templateId: selectedTemplate?.id || "custom-email",
      to: recipients[0].email, // Premier destinataire dans le champ "to"
      subject: emailSubject,
      body: emailContent,
      recipients: recipients
    };

    sendEmailMutation.mutate(emailData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Envoyer un email</DialogTitle>
          <DialogDescription>
            Recherchez un destinataire, choisissez un modèle et personnalisez votre email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recherche de lead avec autocomplétion */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-lead-search" className="text-base font-medium">Destinataires</Label>
              <div className="flex gap-2 mt-1.5">
                <div className="relative flex-1">
                  <Input 
                    id="email-lead-search" 
                    placeholder="Rechercher par référence, nom ou email..." 
                    value={leadSearchTerm} 
                    onChange={e => setLeadSearchTerm(e.target.value)}
                    className="pr-8"
                  />
                  {isSearching && (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  )}
                  
                  {/* Résultats de recherche avancée avec design amélioré */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background rounded-md border shadow-lg max-h-[250px] overflow-y-auto">
                      <div className="p-1">
                        {searchResults.map(lead => (
                          <button
                            key={lead.id}
                            className="w-full text-left hover:bg-blue-50 px-3 py-2 rounded-sm flex items-start gap-2"
                            onClick={() => {
                              // Vérifier si le lead est déjà sélectionné
                              const isAlreadySelected = selectedLeads.some(l => l.id === lead.id);
                              if (!isAlreadySelected) {
                                setSelectedLeads([...selectedLeads, lead]);
                              }
                              setLeadSearchTerm("");
                              setShowSearchResults(false);
                            }}
                          >
                            <Check className={cn(
                              "h-4 w-4 mt-0.5", 
                              selectedLeads.some(l => l.id === lead.id) ? "opacity-100 text-blue-600" : "opacity-0"
                            )} />
                            <div>
                              <p className="text-sm font-medium">{lead.firstName} {lead.lastName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {lead.referenceNumber && (
                                  <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">{lead.referenceNumber}</Badge>
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
                <Button 
                  variant="secondary"
                  className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                  onClick={() => {
                    if (leadSearchTerm.trim() && leadSearchTerm.includes('@')) {
                      setCustomRecipients([...customRecipients, leadSearchTerm.trim()]);
                      setLeadSearchTerm('');
                    } else if (leadSearchTerm.trim()) {
                      toast({
                        title: "Format d'email invalide",
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
            
            {/* Liste des destinataires sélectionnés */}
            {(selectedLeads.length > 0 || customRecipients.length > 0) && (
              <div>
                <h4 className="text-sm font-medium mb-2">Destinataires sélectionnés ({selectedLeads.length + customRecipients.length})</h4>
                <div className="border rounded-md p-2 max-h-[150px] overflow-y-auto">
                  <div className="space-y-1">
                    {selectedLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                            {lead.referenceNumber && (
                              <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">{lead.referenceNumber}</Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-red-50 hover:text-red-600" 
                          onClick={() => handleSelectLead(lead, false)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    
                    {customRecipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                          <span>{email}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-red-50 hover:text-red-600" 
                          onClick={() => {
                            setCustomRecipients(customRecipients.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Choix du modèle et du contenu de l'email */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-template" className="text-sm font-medium">Modèle d'email</Label>
              <Select 
                value={selectedTemplate?.id || ""} 
                onValueChange={(value) => {
                  const template = templatesData?.templates?.find((t: EmailTemplate) => t.id === value);
                  if (template) handleApplyTemplate(template);
                }}
              >
                <SelectTrigger id="email-template" className="mt-1.5">
                  <SelectValue placeholder="Choisir un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {templatesData && templatesData.templates && templatesData.templates.map((template: EmailTemplate) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                className="min-h-[200px] font-mono text-sm mt-1.5"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-xs text-blue-700 mb-2 font-medium">Variables disponibles:</p>
              <div className="grid grid-cols-3 gap-2">
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{name}}`}</code>
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{referenceNumber}}`}</code>
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{address}}`}</code>
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{postalCode}}`}</code>
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{city}}`}</code>
                <code className="bg-white p-1 rounded text-xs whitespace-nowrap text-blue-700 border border-blue-100">{`{{email}}`}</code>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button 
            type="button" 
            onClick={onClose}
            variant="outline"
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleSendEmails}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={(selectedLeads.length === 0 && customRecipients.length === 0) || !emailSubject || !emailContent || sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
