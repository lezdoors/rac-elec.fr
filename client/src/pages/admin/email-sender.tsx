import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Loader2,
  Plus,
  Save,
  Mail,
  Send,
  Users,
  FileText,
  AlertCircle,
  Check,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface Lead {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  clientType?: string;
  company?: string;
  referenceNumber?: string;
  status?: string;
  createdAt: string;
  address?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: string;
  active: boolean;
}

export default function EmailSenderPage() {
  const { toast } = useToast();
  
  // States pour les emails
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{to: string; subject: string; content: string} | null>(null);

  // Récupérer les leads
  const { data: leadsData, isLoading: leadsLoading } = useQuery<{leads: Lead[]}>({ 
    queryKey: ["/api/leads"],
    queryFn: getQueryFn({ on404: "returnNull" }),
    staleTime: 30000,
  });

  // Récupérer les templates d'email
  const { data: templatesData, isLoading: templatesLoading } = useQuery<{success: boolean; templates: EmailTemplate[]}>({
    queryKey: ["/api/email-templates"],
    queryFn: getQueryFn({ returnNullOn404: true }),
    staleTime: 30000,
  });

  // Récupérer les emails reçus
  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ["/api/emails/inbox"],
    queryFn: getQueryFn(),
    staleTime: 60000,
  });

  // Mutation pour envoyer un email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      const response = await apiRequest("POST", "/api/emails/send", emailData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'envoi de l'email");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email envoyé",
        description: "Votre email a été envoyé avec succès.",
        variant: "default",
      });
      
      // Réinitialiser le formulaire
      setSubject("");
      setEmailContent("");
      setSelectedLeads([]);
      setSelectedTemplate("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de l'email.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSending(false);
    }
  });

  // Handler pour sélectionner/désélectionner tous les leads
  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      // Sélectionner tous les leads qui ont un email
      const leadsWithEmail = leadsData?.leads?.filter(lead => lead.email) || [];
      setSelectedLeads(leadsWithEmail.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Handler pour la sélection d'un template
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (!templatesData?.templates) return;
    
    const template = templatesData.templates.find((t: EmailTemplate) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setEmailContent(template.body);
    }
  };

  // Handler pour la prévisualisation de l'email
  const handlePreviewEmail = () => {
    if (selectedLeads.length === 0 || !subject || !emailContent) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez sélectionner au moins un destinataire et compléter le sujet et le contenu de l'email.",
        variant: "destructive",
      });
      return;
    }
    
    // Récupérer le premier lead sélectionné pour la prévisualisation
    const firstSelectedLead = leadsData?.leads?.find(lead => lead.id === selectedLeads[0]);
    if (!firstSelectedLead || !firstSelectedLead.email) {
      toast({
        title: "Erreur de prévisualisation",
        description: "Impossible de prévisualiser l'email. Le lead sélectionné n'a pas d'adresse email.",
        variant: "destructive",
      });
      return;
    }
    
    // Créer l'email de prévisualisation avec remplacement des variables
    const previewContent = replaceEmailVariables(emailContent, firstSelectedLead);
    const previewSubject = replaceEmailVariables(subject, firstSelectedLead);
    
    setPreviewEmail({
      to: firstSelectedLead.email,
      subject: previewSubject,
      content: previewContent
    });
    
    setPreviewDialogOpen(true);
  };

  // Fonction pour remplacer les variables dans le template
  const replaceEmailVariables = (text: string, lead: Lead) => {
    return text
      .replace(/\{\{name\}\}/g, `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Client')
      .replace(/\{\{firstName\}\}/g, lead.firstName || '')
      .replace(/\{\{lastName\}\}/g, lead.lastName || '')
      .replace(/\{\{email\}\}/g, lead.email || '')
      .replace(/\{\{phone\}\}/g, lead.phone || '')
      .replace(/\{\{referenceNumber\}\}/g, lead.referenceNumber || '')
      .replace(/\{\{address\}\}/g, lead.address || '')
      .replace(/\{\{company\}\}/g, lead.company || '');
  };

  // Handler pour l'envoi de l'email
  const handleSendEmail = () => {
    if (selectedLeads.length === 0 || !subject || !emailContent) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez sélectionner au moins un destinataire et compléter le sujet et le contenu de l'email.",
        variant: "destructive",
      });
      return;
    }
    
    // Récupérer les leads sélectionnés
    const selectedLeadObjects = leadsData?.leads?.filter(lead => selectedLeads.includes(lead.id)) || [];
    const leadsWithoutEmail = selectedLeadObjects.filter(lead => !lead.email);
    
    if (leadsWithoutEmail.length > 0) {
      toast({
        title: "Leads sans email",
        description: `${leadsWithoutEmail.length} lead(s) sélectionné(s) n'ont pas d'adresse email et seront ignorés.`,
        variant: "destructive",
      });
    }
    
    const leadsWithEmail = selectedLeadObjects.filter(lead => lead.email);
    if (leadsWithEmail.length === 0) {
      toast({
        title: "Aucun destinataire valide",
        description: "Aucun des leads sélectionnés n'a d'adresse email valide.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    // Préparer les données d'email
    const emailData = {
      recipients: leadsWithEmail.map(lead => ({
        id: lead.id,
        email: lead.email,
        name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || undefined,
        referenceNumber: lead.referenceNumber
      })),
      subject,
      content: emailContent,
      templateId: selectedTemplate || undefined
    };
    
    // Envoyer l'email
    sendEmailMutation.mutate(emailData);
  };

  return (
    <AdminLayout title="Emails" description="Envoyez des emails à vos leads et consultez votre boîte de réception">
      <div className="space-y-6">
        <Accordion type="single" collapsible defaultValue="compose" className="w-full">
          <AccordionItem value="compose">
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="text-lg font-medium">Composer un email</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Envoyer un email</CardTitle>
                  <CardDescription>
                    Sélectionnez les destinataires et rédigez votre message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sélection des destinataires */}
                  <div className="space-y-2">
                    <Label>Destinataires ({selectedLeads.length} sélectionné(s))</Label>
                    <Card className="border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="select-all"
                            checked={selectedLeads.length > 0 && selectedLeads.length === (leadsData?.leads?.filter(lead => lead.email)?.length || 0)}
                            onCheckedChange={handleSelectAllLeads}
                          />
                          <Label htmlFor="select-all" className="cursor-pointer">
                            Sélectionner tous les leads avec email
                          </Label>
                        </div>
                        <Badge variant="outline">
                          {selectedLeads.length} sélectionné(s)
                        </Badge>
                      </div>
                      
                      <div className="max-h-[200px] overflow-y-auto mt-4">
                        {leadsLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : leadsData?.leads && leadsData.leads.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead>Statut</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {leadsData.leads.map((lead: Lead) => (
                                <TableRow key={lead.id}>
                                  <TableCell>
                                    <Checkbox 
                                      checked={selectedLeads.includes(lead.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedLeads([...selectedLeads, lead.id]);
                                        } else {
                                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                        }
                                      }}
                                      disabled={!lead.email}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {(lead.firstName || lead.lastName)
                                      ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                                      : (lead.company || 'Non spécifié')}
                                  </TableCell>
                                  <TableCell>
                                    {lead.email || (
                                      <span className="text-rose-500 text-xs">Pas d'email</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs font-mono">{lead.referenceNumber}</span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={lead.status === 'Converti' ? 'bg-green-50 text-green-700' : ''}>
                                      {lead.status || 'Nouveau'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            Aucun lead disponible
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                  
                  {/* Sélection du modèle d'email */}
                  <div className="space-y-2">
                    <Label htmlFor="template">Modèle d'email</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Sélectionner un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun (Email personnalisé)</SelectItem>
                        {!templatesLoading && templatesData?.templates ? (
                          templatesData.templates.map((template: EmailTemplate) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Chargement des modèles...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sujet de l'email */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input 
                      id="subject" 
                      placeholder="Objet de l'email"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  
                  {/* Contenu de l'email */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="content">Contenu</Label>
                      <div className="text-xs text-muted-foreground">
                        Variables disponibles: &#123;&#123;name&#125;&#125;, &#123;&#123;firstName&#125;&#125;, &#123;&#123;lastName&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;referenceNumber&#125;&#125;, &#123;&#123;address&#125;&#125;, &#123;&#123;company&#125;&#125;
                      </div>
                    </div>
                    <Textarea 
                      id="content" 
                      placeholder="Contenu de l'email"
                      rows={12}
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handlePreviewEmail}>
                    Prévisualiser
                  </Button>
                  
                  <Button 
                    onClick={handleSendEmail}
                    disabled={isSending || selectedLeads.length === 0 || !subject || !emailContent}
                  >
                    {isSending ? (
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
                </CardFooter>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="inbox">
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-lg font-medium">Boîte de réception</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Emails reçus</CardTitle>
                  <CardDescription>
                    Consultez les emails reçus sur votre adresse d'expédition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inboxLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !inboxData || inboxData.length === 0 ? (
                    <div className="py-8 text-center">
                      <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Aucun email</h3>
                      <p className="text-sm text-muted-foreground">
                        Votre boîte de réception est vide.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Expéditeur</TableHead>
                            <TableHead>Sujet</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inboxData.map((email: any) => (
                            <TableRow key={email.id}>
                              <TableCell className="font-medium">
                                {email.isSpam ? (
                                  <Badge variant="destructive">SPAM</Badge>
                                ) : (
                                  <Badge variant={email.isRead ? "outline" : "default"}>                                
                                    {email.isRead ? "Lu" : "Non lu"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{email.from}</TableCell>
                              <TableCell>{email.subject}</TableCell>
                              <TableCell>
                                {new Date(email.date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Cette fonction est en cours de développement. Les emails complets et les pièces jointes seront disponibles prochainement.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="sent">
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <span className="text-lg font-medium">Emails envoyés</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Historique des emails envoyés</CardTitle>
                  <CardDescription>
                    Consultez tous les emails envoyés et leur statut
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <Send className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Fonctionnalité en développement</h3>
                    <p className="text-sm text-muted-foreground">
                      L'historique des emails envoyés sera bientôt disponible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="spam">
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-lg font-medium">Spam</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Emails marqués comme spam</CardTitle>
                  <CardDescription>
                    Consultez les emails marqués comme indésirables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Fonctionnalité en développement</h3>
                    <p className="text-sm text-muted-foreground">
                      La gestion des emails indésirables sera bientôt disponible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Modal de prévisualisation */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'email</DialogTitle>
            <DialogDescription>
              Aperçu de l'email tel qu'il sera envoyé au destinataire
            </DialogDescription>
          </DialogHeader>
          
          {previewEmail && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium">À:</span>
                  <span className="text-sm ml-2">{previewEmail.to}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Objet:</span>
                  <span className="text-sm ml-2">{previewEmail.subject}</span>
                </div>
                <div className="pt-2 mt-2 border-t">
                  <div className="whitespace-pre-line text-sm">
                    {previewEmail.content}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer maintenant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}