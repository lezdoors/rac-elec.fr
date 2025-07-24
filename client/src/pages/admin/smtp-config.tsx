import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Send, TestTube, Mail, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  enabled: boolean;
}

interface TestEmailData {
  to: string;
  subject: string;
  message: string;
}

export default function SmtpConfig() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState<TestEmailData>({
    to: "",
    subject: "Test de configuration SMTP",
    message: "Ceci est un email de test pour vérifier la configuration SMTP."
  });

  // Récupérer la configuration SMTP
  const { data: smtpConfigResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/smtp-config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/smtp-config?hidePassword=true");
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la récupération de la configuration SMTP");
      }
      return response.json();
    },
  });

  // State local pour la configuration en cours d'édition
  const [config, setConfig] = useState<SmtpConfig>({
    host: "",
    port: 587,
    secure: false,
    auth: {
      user: "",
      pass: ""
    },
    defaultFrom: "",
    enabled: false
  });
  
  // State pour l'adresse email de notification
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isLoadingNotificationEmail, setIsLoadingNotificationEmail] = useState(false);

  // Récupérer l'adresse email de notification
  const { data: notificationEmailResponse, isLoading: isLoadingNotificationEmailData } = useQuery({
    queryKey: ["/api/admin/notification-email"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/notification-email");
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la récupération de l'adresse email de notification");
      }
      return response.json();
    },
  });

  // Mettre à jour l'état local lorsque les données sont chargées
  useEffect(() => {
    if (smtpConfigResponse?.success && smtpConfigResponse?.data) {
      setConfig(smtpConfigResponse.data);
    }
    
    if (notificationEmailResponse?.success && notificationEmailResponse?.data) {
      setNotificationEmail(notificationEmailResponse.data.email);
    }
  }, [smtpConfigResponse, notificationEmailResponse]);

  // Mutation pour enregistrer les modifications
  const updateSmtpMutation = useMutation({
    mutationFn: async (data: SmtpConfig) => {
      const response = await apiRequest("POST", "/api/admin/smtp-config", data);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la mise à jour de la configuration SMTP");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/smtp-config"] });
      toast({
        title: "Configuration enregistrée",
        description: "La configuration SMTP a été mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour tester la configuration
  const testSmtpMutation = useMutation({
    mutationFn: async (data: TestEmailData) => {
      const response = await apiRequest("POST", "/api/admin/test-smtp", data);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        const errorMsg = result.error || "Erreur lors de l'envoi de l'email de test";
        throw new Error(errorMsg);
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Email de test envoyé",
        description: "Veuillez vérifier la boîte de réception du destinataire",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'envoi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour l'adresse email de notification
  const updateNotificationEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/admin/notification-email", { email });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la mise à jour de l'adresse email de notification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notification-email"] });
      toast({
        title: "Adresse email mise à jour",
        description: "L'adresse email de notification a été mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    updateSmtpMutation.mutate(config);
  };

  const handleTestEmail = () => {
    testSmtpMutation.mutate(testEmail);
  };
  
  const handleSaveNotificationEmail = () => {
    if (notificationEmail && notificationEmail.trim().length > 0) {
      updateNotificationEmailMutation.mutate(notificationEmail);
    } else {
      toast({
        title: "Erreur",
        description: "L'adresse email ne peut pas être vide",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Configuration SMTP">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuration SMTP" description="Gérez les paramètres d'envoi d'emails">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuration SMTP</h2>
          <p className="text-muted-foreground mt-2">
            Configurez les paramètres du serveur SMTP pour l'envoi d'emails depuis l'application.
          </p>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration du serveur</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="test">Test d'envoi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du serveur SMTP</CardTitle>
                <CardDescription>
                  Configurez la connexion au serveur de messagerie pour les communications par email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="smtp-enabled" className="flex items-center space-x-2">
                    <span>Activer le service d'email</span>
                  </Label>
                  <Switch 
                    id="smtp-enabled" 
                    checked={config.enabled}
                    onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Serveur SMTP</Label>
                      <Input 
                        id="host" 
                        placeholder="smtp.example.com" 
                        value={config.host}
                        onChange={(e) => setConfig({...config, host: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input 
                        id="port" 
                        type="number" 
                        placeholder="587" 
                        value={config.port.toString()}
                        onChange={(e) => setConfig({...config, port: parseInt(e.target.value) || 587})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="secure">Connexion sécurisée (SSL/TLS)</Label>
                    <Switch 
                      id="secure" 
                      checked={config.secure}
                      onCheckedChange={(checked) => setConfig({...config, secure: checked})}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Authentification</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="auth-user">Nom d'utilisateur</Label>
                        <Input 
                          id="auth-user" 
                          placeholder="user@example.com" 
                          value={config.auth.user}
                          onChange={(e) => setConfig({
                            ...config, 
                            auth: {...config.auth, user: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-pass">Mot de passe</Label>
                        <Input 
                          id="auth-pass" 
                          type="password" 
                          placeholder="••••••••" 
                          value={config.auth.pass}
                          onChange={(e) => setConfig({
                            ...config, 
                            auth: {...config.auth, pass: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultFrom">Adresse d'expéditeur par défaut</Label>
                    <Input 
                      id="defaultFrom" 
                      placeholder="no-reply@raccordementelec.fr" 
                      value={config.defaultFrom}
                      onChange={(e) => setConfig({...config, defaultFrom: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground">
                      Cette adresse sera utilisée comme expéditeur par défaut pour tous les emails
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={updateSmtpMutation.isPending}
                >
                  {updateSmtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer la configuration
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des notifications</CardTitle>
                <CardDescription>
                  Configurez les adresses email pour les notifications du système.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email" className="flex items-center space-x-2">
                    <AtSign className="h-4 w-4 mr-1" />
                    <span>Adresse email pour les notifications de nouvelles demandes</span>
                  </Label>
                  <Input 
                    id="notification-email" 
                    placeholder="admin@raccordementelec.fr" 
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Cette adresse recevra les notifications lors de la soumission de nouvelles demandes de service.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveNotificationEmail}
                  disabled={updateNotificationEmailMutation.isPending || isLoadingNotificationEmailData}
                >
                  {updateNotificationEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer l'adresse
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Tester la configuration</CardTitle>
                <CardDescription>
                  Envoyez un email de test pour vérifier que la configuration fonctionne correctement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Envoyer un test à</Label>
                  <Input 
                    id="test-email" 
                    placeholder="destinataire@example.com" 
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-subject">Sujet</Label>
                  <Input 
                    id="test-subject" 
                    placeholder="Test de configuration SMTP" 
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-message">Message</Label>
                  <textarea 
                    id="test-message" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Contenu de l'email de test" 
                    value={testEmail.message}
                    onChange={(e) => setTestEmail({...testEmail, message: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  {!config.enabled ? (
                    "Le service d'email est désactivé. Activez-le dans l'onglet Configuration."
                  ) : ""}
                </p>
                <Button 
                  onClick={handleTestEmail}
                  disabled={testSmtpMutation.isPending || !config.enabled || !testEmail.to}
                >
                  {testSmtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer l'email de test
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}