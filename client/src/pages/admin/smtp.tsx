import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  RefreshCw,
  Save,
  Send,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
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

// Composant pour gérer la configuration SMTP d'un utilisateur
export interface UserSmtpConfigProps {
  user: {
    id: number;
    username: string;
    email?: string;
  };
}

export interface UserSmtpConfigData {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
}

export function UserSmtpConfig({ user }: UserSmtpConfigProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<UserSmtpConfigData>({
    enabled: false,
    host: "",
    port: 587,
    secure: true,
    auth: {
      user: "",
      pass: ""
    },
    fromEmail: user.email || ""
  });
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "Test de configuration SMTP personnalisée",
    message: "Ceci est un email de test pour vérifier votre configuration SMTP personnalisée."
  });

  // Charger la configuration SMTP de l'utilisateur
  useEffect(() => {
    if (expanded && !isLoading) {
      setIsLoading(true);
      fetch(`/api/users/${user.id}/smtp-config`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setConfig({
              enabled: data.data.enabled || false,
              host: data.data.host || "",
              port: data.data.port || 587,
              secure: data.data.secure !== false,
              auth: {
                user: data.data.auth?.user || "",
                pass: data.data.auth?.pass || ""
              },
              fromEmail: data.data.fromEmail || user.email || ""
            });
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération de la configuration SMTP de l'utilisateur:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer la configuration SMTP de l'utilisateur",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [expanded, user.id, user.email, toast]);

  // Sauvegarder la configuration SMTP de l'utilisateur
  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/smtp-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Configuration sauvegardée",
          description: "La configuration SMTP de l'utilisateur a été mise à jour avec succès"
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de sauvegarder la configuration SMTP",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la configuration SMTP:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde de la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tester la configuration SMTP de l'utilisateur
  const handleTestConfig = async () => {
    if (!testEmail.to) {
      toast({
        title: "Adresse email requise",
        description: "Veuillez entrer une adresse email pour le test",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    try {
      const response = await fetch(`/api/users/${user.id}/test-smtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testEmail)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Test réussi",
          description: "L'email de test a été envoyé avec succès"
        });
      } else {
        toast({
          title: "Échec du test",
          description: data.message || data.error || "Impossible d'envoyer l'email de test",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du test de la configuration SMTP:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du test de la configuration",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">{user.username}</h3>
          <p className="text-sm text-muted-foreground">{user.email || 'Email non défini'}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Masquer" : "Configurer SMTP"}
        </Button>
      </div>
      
      {expanded && (
        <div className="space-y-4 mt-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id={`smtp-enabled-${user.id}`}
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
            />
            <Label htmlFor={`smtp-enabled-${user.id}`}>
              {config.enabled ? "Configuration SMTP activée" : "Configuration SMTP désactivée"}
            </Label>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`smtp-host-${user.id}`}>Serveur SMTP</Label>
                <Input 
                  id={`smtp-host-${user.id}`}
                  placeholder="smtp.example.com"
                  value={config.host}
                  onChange={(e) => setConfig({...config, host: e.target.value})}
                  disabled={!config.enabled || isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`smtp-port-${user.id}`}>Port</Label>
                <Input 
                  id={`smtp-port-${user.id}`}
                  type="number"
                  placeholder="587"
                  value={config.port.toString()}
                  onChange={(e) => setConfig({...config, port: parseInt(e.target.value) || 587})}
                  disabled={!config.enabled || isLoading}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`smtp-secure-${user.id}`}
                checked={config.secure}
                onCheckedChange={(checked) => setConfig({...config, secure: checked === true})}
                disabled={!config.enabled || isLoading}
              />
              <Label htmlFor={`smtp-secure-${user.id}`}>Utiliser une connexion sécurisée (SSL/TLS)</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`smtp-user-${user.id}`}>Nom d'utilisateur SMTP</Label>
                <Input 
                  id={`smtp-user-${user.id}`}
                  placeholder="user@example.com"
                  value={config.auth.user}
                  onChange={(e) => setConfig({...config, auth: {...config.auth, user: e.target.value}})}
                  disabled={!config.enabled || isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`smtp-pass-${user.id}`}>Mot de passe SMTP</Label>
                <Input 
                  id={`smtp-pass-${user.id}`}
                  type="password"
                  placeholder="••••••••"
                  value={config.auth.pass}
                  onChange={(e) => setConfig({...config, auth: {...config.auth, pass: e.target.value}})}
                  disabled={!config.enabled || isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`smtp-from-${user.id}`}>Adresse d'expédition</Label>
              <Input 
                id={`smtp-from-${user.id}`}
                placeholder="expediteur@example.com"
                value={config.fromEmail}
                onChange={(e) => setConfig({...config, fromEmail: e.target.value})}
                disabled={!config.enabled || isLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                disabled={isLoading}
                onClick={() => setExpanded(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="default"
                disabled={isLoading}
                onClick={handleSaveConfig}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {config.enabled && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Tester la configuration</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`test-email-${user.id}`}>Adresse email de test</Label>
                  <Input 
                    id={`test-email-${user.id}`}
                    placeholder="destinataire@example.com"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                    disabled={isTesting}
                  />
                </div>
                <Button 
                  variant="outline"
                  disabled={isTesting || !testEmail.to}
                  onClick={handleTestConfig}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer un email de test
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SmtpConfig() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [testEmail, setTestEmail] = useState<TestEmailData>({
    to: "",
    subject: "Test de configuration SMTP",
    message: "Ceci est un email de test pour vérifier la configuration SMTP."
  });
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [isLoadingNotificationEmail, setIsLoadingNotificationEmail] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  // Récupérer la configuration SMTP
  const { data: smtpConfigResponse, isLoading, error, refetch } = useQuery({
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

  // Récupérer les utilisateurs pour l'envoi de tests et configuration SMTP
  const { data: usersResponse = [], isLoading: isLoadingUsers } = useQuery<{id: number, email: string, username: string}[]>({ 
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "returnNull" }),
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

  // Mise à jour du state local lorsque les données sont chargées
  useEffect(() => {
    if (smtpConfigResponse?.success && smtpConfigResponse?.data) {
      setConfig(smtpConfigResponse.data);
    }
  }, [smtpConfigResponse]);

  // Récupérer les emails de notification
  useEffect(() => {
    const fetchNotificationEmails = async () => {
      setIsLoadingNotificationEmail(true);
      try {
        const response = await apiRequest("GET", "/api/admin/notification-email");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Si des emails multiples sont disponibles, les utiliser
            if (data.data && data.data.emails && Array.isArray(data.data.emails)) {
              // S'assurer que nous avons toujours les emails Namecheap
              let emailsList = [...data.data.emails];
              const primaryEmails = [
                "bonjour@portail-electricite.com",
                "contact@portail-electricite.com", 
                "notification@portail-electricite.com"
              ];
              
              // Ajouter les emails Namecheap manquants
              primaryEmails.forEach(email => {
                if (!emailsList.includes(email)) {
                  emailsList.push(email);
                }
              });
              
              setNotificationEmails(emailsList);
              
              // Identifie l'email principal (marina.alves@portail-electricite.com si présent, sinon le premier)
              const marinaEmail = "marina.alves@portail-electricite.com";
              if (emailsList.includes(marinaEmail)) {
                setNotificationEmail(marinaEmail);
              } else if (emailsList.length > 0 && emailsList[0] !== contactEmail) {
                setNotificationEmail(emailsList[0]);
              } else if (emailsList.length > 1) {
                // Si le premier email est contact@portail-electricite.com, prendre le deuxième
                setNotificationEmail(emailsList[1]);
              }
            } 
            // Ancienne API retrocompatible (un seul email)
            else if (data.data && data.data.email) {
              const mainEmail = data.data.email;
              const contactEmail = "contact@portail-electricite.com";
              
              // Créer une liste avec les deux emails
              let emailsList = [mainEmail];
              if (mainEmail !== contactEmail) {
                emailsList.push(contactEmail);
              }
              
              setNotificationEmail(mainEmail);
              setNotificationEmails(emailsList);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des emails de notification:", error);
      } finally {
        setIsLoadingNotificationEmail(false);
      }
    };

    fetchNotificationEmails();
  }, []);

  // Mutation pour sauvegarder la configuration SMTP
  const saveMutation = useMutation({
    mutationFn: async (config: SmtpConfig) => {
      const response = await apiRequest("POST", "/api/admin/smtp-config", config);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la sauvegarde de la configuration SMTP");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration SMTP a été mise à jour avec succès.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/smtp-config"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la sauvegarde de la configuration.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour sauvegarder les emails de notification
  const saveNotificationEmailMutation = useMutation({
    mutationFn: async (emails: string | string[]) => {
      const emailData = Array.isArray(emails) ? { emails } : { email: emails };
      const response = await apiRequest("POST", "/api/admin/notification-email", emailData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la sauvegarde des emails de notification");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emails de notification mis à jour",
        description: "Les adresses email pour les notifications ont été mises à jour avec succès.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la sauvegarde des emails de notification.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour tester la configuration SMTP
  const testSmtpMutation = useMutation({
    mutationFn: async (data: TestEmailData) => {
      const response = await apiRequest("POST", "/api/admin/test-smtp", data);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors du test de la configuration SMTP");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult({
        success: true,
        message: "Test réussi ! L'email a été envoyé avec succès."
      });
      toast({
        title: "Test réussi",
        description: "L'email de test a été envoyé avec succès.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      setTestResult({
        success: false,
        message: error.message || "Échec du test. Vérifiez vos paramètres SMTP."
      });
      toast({
        title: "Échec du test",
        description: error.message || "Une erreur est survenue lors de l'envoi de l'email de test.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTesting(false);
    }
  });

  // Handler pour la sauvegarde de la configuration
  const handleSaveConfig = () => {
    saveMutation.mutate(config);
  };

  // Handler pour la sauvegarde de l'email de notification
  const handleSaveNotificationEmail = () => {
    if (notificationEmail.trim()) {
      saveNotificationEmailMutation.mutate(notificationEmail.trim());
    }
  };

  // Handler pour le test de la configuration
  const handleTestSmtp = () => {
    if (testEmail.to.trim()) {
      setIsTesting(true);
      setTestResult(null);
      testSmtpMutation.mutate(testEmail);
    } else {
      toast({
        title: "Adresse email requise",
        description: "Veuillez entrer une adresse email pour le test.",
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>
          
          {/* Onglet de configuration */}
          <TabsContent value="configuration" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Paramètres du serveur SMTP</CardTitle>
                    <CardDescription>
                      Configurez les informations de connexion au serveur SMTP
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="enabled">Activer le service d'email</Label>
                    <Switch 
                      id="enabled"
                      checked={config.enabled}
                      onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Serveur SMTP</Label>
                    <Input 
                      id="host" 
                      placeholder="smtp.example.com"
                      value={config.host}
                      onChange={(e) => setConfig({...config, host: e.target.value})}
                      disabled={!config.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port SMTP</Label>
                    <Input 
                      id="port" 
                      type="number"
                      placeholder="587"
                      value={config.port.toString()}
                      onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
                      disabled={!config.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="secure" 
                      checked={config.secure}
                      onCheckedChange={(checked) => setConfig({...config, secure: checked === true})}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor="secure">Utiliser une connexion sécurisée (SSL/TLS)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input 
                      id="username" 
                      placeholder="user@example.com"
                      value={config.auth.user}
                      onChange={(e) => setConfig({...config, auth: {...config.auth, user: e.target.value}})}
                      disabled={!config.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••"
                      value={config.auth.pass}
                      onChange={(e) => setConfig({...config, auth: {...config.auth, pass: e.target.value}})}
                      disabled={!config.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultFrom">Adresse d'expédition par défaut</Label>
                  <Input 
                    id="defaultFrom" 
                    placeholder="contact@portail-electricite.com"
                    value={config.defaultFrom}
                    onChange={(e) => setConfig({...config, defaultFrom: e.target.value})}
                    disabled={!config.enabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cette adresse sera utilisée comme expéditeur pour tous les emails envoyés par le système.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={() => refetch()}>Réinitialiser</Button>
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet de test */}
          <TabsContent value="test" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tester l'envoi d'emails</CardTitle>
                <CardDescription>
                  Envoyez un email de test pour vérifier votre configuration SMTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!config.enabled && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Service désactivé</AlertTitle>
                    <AlertDescription>
                      Le service d'envoi d'emails est actuellement désactivé. Activez-le dans l'onglet Configuration.
                    </AlertDescription>
                  </Alert>
                )}
                
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"} className="mb-4">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{testResult.success ? "Test réussi" : "Échec du test"}</AlertTitle>
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="test-email">Adresse email du destinataire</Label>
                  <Input 
                    id="test-email" 
                    placeholder="destinataire@example.com"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                    disabled={!config.enabled || isTesting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-subject">Sujet de l'email</Label>
                  <Input 
                    id="test-subject" 
                    placeholder="Test de configuration SMTP"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                    disabled={!config.enabled || isTesting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-message">Message</Label>
                  <textarea 
                    id="test-message" 
                    className="w-full min-h-32 p-2 border rounded-md"
                    placeholder="Contenu de l'email de test..."
                    value={testEmail.message}
                    onChange={(e) => setTestEmail({...testEmail, message: e.target.value})}
                    disabled={!config.enabled || isTesting}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button 
                  onClick={handleTestSmtp} 
                  disabled={!config.enabled || isTesting || !testEmail.to.trim()}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer un email de test
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet des notifications */}
          <TabsContent value="notifications" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des notifications</CardTitle>
                <CardDescription>
                  Paramétrez les adresses email pour les notifications système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email principal - marina.alves@portail-electricite.com */}
                  <div className="space-y-2">
                    <Label htmlFor="notification-email">Email de notification principal</Label>
                    <Input 
                      id="notification-email" 
                      placeholder="marina.alves@portail-electricite.com"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      disabled={isLoadingNotificationEmail || saveNotificationEmailMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Cette adresse recevra toutes les notifications importantes du système, 
                      comme les nouvelles demandes, les paiements, etc.
                    </p>
                  </div>

                  {/* Email de contact spécifique - contact@portail-electricite.com */}
                  <div className="space-y-2 border-t pt-4 mt-4">
                    <Label htmlFor="contact-notification-email" className="flex items-center">
                      <span>Email de contact dédié</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Standard</span>
                    </Label>
                    <Input 
                      id="contact-notification-email" 
                      placeholder="notification@portail-electricite.com"
                      value={notificationEmails.includes("notification@portail-electricite.com") ? "notification@portail-electricite.com" : ""}
                      onChange={(e) => {
                        // Si l'email est vide, retirer notification@portail-electricite.com de la liste
                        if (!e.target.value.trim()) {
                          setNotificationEmails(notificationEmails.filter(email => email !== "notification@portail-electricite.com"));
                        } 
                        // Si l'email est différent de l'actuel, remplacer/ajouter notification@portail-electricite.com
                        else if (e.target.value.trim() === "notification@portail-electricite.com" && !notificationEmails.includes("notification@portail-electricite.com")) {
                          setNotificationEmails([...notificationEmails, "notification@portail-electricite.com"]);
                        }
                      }}
                      disabled={isLoadingNotificationEmail || saveNotificationEmailMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Cet email est l'adresse principale de contact qui recevra également toutes les notifications.
                    </p>
                  </div>
                  
                  {/* Liste des emails de notification additionnels */}
                  <div className="space-y-2 border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notification-emails">Autres emails de notification</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (notificationEmail.trim() && 
                              !notificationEmails.includes(notificationEmail.trim()) && 
                              notificationEmail.trim() !== "contact@portail-electricite.com") {
                            setNotificationEmails([...notificationEmails, notificationEmail.trim()]);
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    
                    <div className="rounded-md border p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                      {notificationEmails.length > 0 ? (
                        <div className="space-y-2">
                          {notificationEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                              <span className="text-sm">{email}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  const newEmails = [...notificationEmails];
                                  newEmails.splice(index, 1);
                                  setNotificationEmails(newEmails);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm text-muted-foreground">Aucun email additionnel configuré</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vous pouvez ajouter plusieurs adresses email qui recevront également les notifications.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button 
                  onClick={() => {
                    // S'assurer que l'email principal et l'email de contact sont inclus dans la liste
                    let allEmails = [...notificationEmails];
                    const mainEmail = notificationEmail.trim();
                    const contactEmail = "contact@portail-electricite.com";
                    
                    // Ajouter l'email principal s'il n'est pas déjà inclus
                    if (mainEmail && !allEmails.includes(mainEmail)) {
                      allEmails = [mainEmail, ...allEmails];
                    }
                    
                    // S'assurer que Bonjour@portail-electricite.com est toujours inclus
                    if (!allEmails.includes(contactEmail)) {
                      allEmails = [...allEmails, contactEmail];
                    }
                    
                    // Vérifier qu'il y a au moins un email
                    if (allEmails.length > 0) {
                      toast({
                        title: "Configuration en cours...",
                        description: "Les notifications seront envoyées à: " + allEmails.join(", "),
                      });
                      
                      saveNotificationEmailMutation.mutate(allEmails);
                    } else if (mainEmail) {
                      // Cas improbable mais garder pour sécurité
                      const emails = [mainEmail, contactEmail];
                      saveNotificationEmailMutation.mutate(emails);
                    } else {
                      toast({
                        title: "Email requis",
                        description: "Veuillez entrer au moins une adresse email.",
                        variant: "destructive"
                      });
                    }
                  }} 
                  disabled={isLoadingNotificationEmail || saveNotificationEmailMutation.isPending}
                >
                  {saveNotificationEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet des utilisateurs */}
          <TabsContent value="users" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration SMTP par utilisateur</CardTitle>
                <CardDescription>
                  Permettez à chaque utilisateur d'utiliser sa propre configuration SMTP
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : usersResponse && usersResponse.length > 0 ? (
                  <div className="space-y-6">
                    {usersResponse.map((user) => (
                      <UserSmtpConfig key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}