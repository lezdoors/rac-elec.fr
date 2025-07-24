import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Settings,
  Users,
} from "lucide-react";

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface ClientEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail: string;
  clientName: string;
  referenceNumber: string;
}

export function ClientEmailDialog({
  isOpen,
  onClose,
  clientEmail,
  clientName,
  referenceNumber,
}: ClientEmailDialogProps) {
  const { toast } = useToast();
  
  // États locaux
  const [selectedTab, setSelectedTab] = useState<string>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [customizeTemplate, setCustomizeTemplate] = useState<boolean>(false);
  
  // Récupérer les modèles d'email
  const {
    data: emailTemplates,
    isLoading: loadingTemplates,
  } = useQuery({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-templates");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des modèles d'email");
      }
      return res.json();
    },
    enabled: isOpen,
  });
  
  // Mutation pour envoyer un email
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/send-email", {
        to: clientEmail,
        subject: emailSubject,
        content: emailContent,
        referenceNumber: referenceNumber,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de l'email");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "L'email a été envoyé avec succès au client",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Grouper les modèles par catégorie pour l'affichage
  const templateCategories = emailTemplates 
    ? Object.entries(
        (emailTemplates as EmailTemplate[]).reduce((acc: Record<string, EmailTemplate[]>, template: EmailTemplate) => {
          if (!acc[template.category]) {
            acc[template.category] = [];
          }
          acc[template.category].push(template);
          return acc;
        }, {})
      )
    : [];
  
  // Gérer la sélection d'un modèle
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCustomizeTemplate(false);
    
    if (!emailTemplates) return;
    
    const template = emailTemplates.find((t: EmailTemplate) => t.id.toString() === templateId);
    
    if (template) {
      // Remplacer les variables dans le template
      let processedContent = template.content
        .replace(/{name}/g, clientName)
        .replace(/{reference}/g, referenceNumber);
      
      setEmailSubject(template.subject);
      setEmailContent(processedContent);
    }
  };
  
  // Gérer l'envoi de l'email
  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le sujet et le contenu de l'email",
        variant: "destructive",
      });
      return;
    }
    
    sendEmailMutation.mutate();
  };
  
  // Réinitialiser le formulaire quand on ouvre la boîte de dialogue
  useEffect(() => {
    if (isOpen) {
      setSelectedTab("template");
      setSelectedTemplate("");
      setEmailSubject("");
      setEmailContent("");
      setCustomizeTemplate(false);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-blue-600" />
            Envoyer un email au client
          </DialogTitle>
          <DialogDescription>
            Envoyez un email au client à partir d'un modèle ou créez un message personnalisé.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="template">
              <FileText className="h-4 w-4 mr-2" />
              Modèles
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Mail className="h-4 w-4 mr-2" />
              Email personnalisé
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4 m-0">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-muted-foreground">Chargement des modèles...</p>
              </div>
            ) : !emailTemplates || emailTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <p className="text-muted-foreground">
                  Aucun modèle d'email disponible.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-select">Sélectionner un modèle</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={handleSelectTemplate}
                    >
                      <SelectTrigger id="template-select">
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.map(([category, templates]) => (
                          <div key={category}>
                            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                              {category}
                            </div>
                            {(templates as EmailTemplate[]).map((template: EmailTemplate) => (
                              <SelectItem 
                                key={template.id} 
                                value={template.id.toString()}
                              >
                                {template.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTemplate && (
                    <div className="border rounded-md p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="template-subject">Objet</Label>
                          {customizeTemplate ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSelectTemplate(selectedTemplate)}
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                              Réinitialiser
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCustomizeTemplate(true)}
                            >
                              <Settings className="h-3.5 w-3.5 mr-1.5" />
                              Personnaliser
                            </Button>
                          )}
                        </div>
                        <Input
                          id="template-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          disabled={!customizeTemplate}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="template-content">Contenu</Label>
                        <Textarea
                          id="template-content"
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                          rows={12}
                          disabled={!customizeTemplate}
                          className="font-sans"
                        />
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Sera envoyé à: <span className="font-medium">{clientEmail}</span>
                          </div>
                          <Button 
                            onClick={handleSendEmail}
                            disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailContent.trim()}
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
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4 m-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-to">Destinataire</Label>
                <Input
                  id="custom-to"
                  value={clientEmail}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-subject">Objet</Label>
                <Input
                  id="custom-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Objet de l'email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-content">Contenu</Label>
                <Textarea
                  id="custom-content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Saisissez votre message ici..."
                  rows={12}
                  className="font-sans"
                />
              </div>
              
              <div className="text-sm text-muted-foreground italic mb-4">
                Astuce: Vous pouvez utiliser <span className="font-mono">{"{name}"}</span> pour le nom du client et <span className="font-mono">{"{reference}"}</span> pour la référence de la demande.
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 inline-block mr-1" />
            Client: <span className="font-medium">{clientName}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailContent.trim()}
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}