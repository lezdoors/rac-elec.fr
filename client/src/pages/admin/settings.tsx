import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Save, 
  RefreshCw,
  Pencil,
  CreditCard,
  Building,
  Mail,
  Globe,
  Smartphone,
  AlertTriangle,
  Key,
  EyeOff,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SystemConfig {
  stripe: {
    publicKey: string;
    hasSecretKey: boolean;
  };
  email: {
    provider: string;
    senderEmail: string;
    senderName: string;
  };
  general: {
    siteName: string;
    defaultPrice: number;
    adminContactNumber: string;
    siteUrl: string;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    stripe: {
      publicKey: "",
      hasSecretKey: false,
    },
    email: {
      provider: "sendgrid",
      senderEmail: "",
      senderName: "",
    },
    general: {
      siteName: "",
      defaultPrice: 129.80,
      adminContactNumber: "",
      siteUrl: "",
    },
  });
  
  // État pour les valeurs masquées (clés API, etc.)
  const [showSecrets, setShowSecrets] = useState(false);
  
  // Récupérer la configuration du système
  const { data: systemConfigResponse, isLoading } = useQuery({
    queryKey: ["/api/system-config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/system-config");
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la récupération de la configuration");
      }
      return response.json();
    },
  });

  // Mettre à jour l'état local lorsque les données sont chargées
  useState(() => {
    if (systemConfigResponse?.success && systemConfigResponse?.configs) {
      setConfig(systemConfigResponse.configs);
    }
  });

  // Mutation pour enregistrer les modifications
  const updateConfigMutation = useMutation({
    mutationFn: async (data: { section: string; config: any }) => {
      const response = await apiRequest("POST", "/api/system-config", data);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erreur lors de la mise à jour de la configuration");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-config"] });
      toast({
        title: "Configuration enregistrée",
        description: "Les paramètres ont été mis à jour avec succès",
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

  // Fonction pour enregistrer une section de configuration
  const saveSection = (section: "stripe" | "email" | "general") => {
    updateConfigMutation.mutate({
      section,
      config: config[section]
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Paramètres">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Paramètres" description="Configuration générale de l'application">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground mt-2">
            Configuration générale du système et des intégrations
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="security">
              <div className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Sécurité
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration générale</CardTitle>
                <CardDescription>
                  Paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nom du site</Label>
                  <Input 
                    id="site-name"
                    value={config.general.siteName}
                    onChange={(e) => setConfig({
                      ...config,
                      general: { ...config.general, siteName: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-url">URL du site</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input 
                      id="site-url"
                      value={config.general.siteUrl}
                      onChange={(e) => setConfig({
                        ...config,
                        general: { ...config.general, siteUrl: e.target.value }
                      })}
                      placeholder="https://portail-electricite.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-number">Numéro de contact administrateur</Label>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input 
                      id="contact-number"
                      value={config.general.adminContactNumber}
                      onChange={(e) => setConfig({
                        ...config,
                        general: { ...config.general, adminContactNumber: e.target.value }
                      })}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-price">Prix par défaut (€)</Label>
                  <Input 
                    id="default-price"
                    type="number"
                    step="0.01"
                    value={config.general.defaultPrice}
                    onChange={(e) => setConfig({
                      ...config,
                      general: { ...config.general, defaultPrice: parseFloat(e.target.value) }
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Prix par défaut pour les demandes de raccordement (129.80€ TTC)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => saveSection("general")}
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Stripe</CardTitle>
                <CardDescription>
                  Paramètres pour le traitement des paiements via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Les clés API Stripe sont sensibles et ne doivent jamais être partagées.
                    Ces paramètres sont stockés de manière sécurisée dans l'environnement de l'application.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-public-key" className="flex items-center">
                      <span>Clé publique Stripe</span>
                      <Badge variant="outline" className="ml-2">
                        {config.stripe.publicKey ? "Configurée" : "Non configurée"}
                      </Badge>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input 
                        id="stripe-public-key"
                        value={showSecrets ? config.stripe.publicKey : (config.stripe.publicKey ? "pk_•••••••••••••••••••••••••••••••" : "")}
                        onChange={(e) => setConfig({
                          ...config,
                          stripe: { ...config.stripe, publicKey: e.target.value }
                        })}
                        placeholder="pk_live_..."
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Key className="h-3 w-3 mr-1" />
                      Commence par "pk_test_" ou "pk_live_"
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="stripe-secret-key">Clé secrète Stripe</Label>
                      <Badge variant={config.stripe.hasSecretKey ? "default" : "destructive"}>
                        {config.stripe.hasSecretKey ? "Configurée" : "Manquante"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      La clé secrète est stockée en tant que variable d'environnement et n'est pas
                      accessible via l'interface. Contactez l'administrateur système pour la modifier.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stripe-mode">Mode de paiement</Label>
                      <Badge variant="outline" className={config.stripe.publicKey?.includes("pk_live") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                        {config.stripe.publicKey?.includes("pk_live") ? "Production" : "Test"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Le mode est déterminé automatiquement selon la clé publique utilisée.
                      Utilisez une clé avec "pk_test_" pour le mode test, ou "pk_live_" pour le mode production.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => saveSection("stripe")}
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="emails" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des emails</CardTitle>
                <CardDescription>
                  Paramètres pour l'envoi d'emails depuis l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-sender-name">Nom d'expéditeur</Label>
                  <Input 
                    id="email-sender-name"
                    value={config.email.senderName}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, senderName: e.target.value }
                    })}
                    placeholder="Service Raccordement Électrique"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-sender-email">Email d'expéditeur</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input 
                      id="email-sender-email"
                      type="email"
                      value={config.email.senderEmail}
                      onChange={(e) => setConfig({
                        ...config,
                        email: { ...config.email, senderEmail: e.target.value }
                      })}
                      placeholder="contact@portail-electricite.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium mb-2">Configuration SMTP détaillée</p>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      La configuration SMTP avancée est disponible dans l'onglet "Config SMTP" du menu latéral.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = "/admin/smtp"}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Configurer le serveur SMTP
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => saveSection("email")}
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Sécurité du compte
                </CardTitle>
                <CardDescription>
                  Paramètres de sécurité et modification du mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Schéma de validation pour le formulaire de changement de mot de passe
const passwordFormSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Composant pour le formulaire de changement de mot de passe
function ChangePasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Définir le formulaire avec le schéma de validation
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await apiRequest("POST", "/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du changement de mot de passe");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Modifier votre mot de passe</h3>
        <p className="text-sm text-muted-foreground">
          Modifiez votre mot de passe. Pour des raisons de sécurité, choisissez un mot de passe fort
          que vous n'utilisez pas ailleurs.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe actuel</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  Le mot de passe doit contenir au moins 6 caractères.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="mt-4"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification en cours...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}