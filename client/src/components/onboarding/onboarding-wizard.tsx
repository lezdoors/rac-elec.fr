import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, Mail, Settings, Sparkles, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Type pour les données de l'utilisateur
interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpEnabled?: boolean;
  onboardingCompleted?: boolean;
}

// Schéma pour le formulaire du profil
const profileSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Adresse email invalide"),
});

// Schéma pour le formulaire SMTP
const smtpSchema = z.object({
  smtpEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().positive().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().email("Email d'expédition invalide").optional(),
});

// Les étapes du wizard
const steps = [
  { id: "welcome", title: "Bienvenue", icon: <Sparkles className="h-5 w-5" /> },
  { id: "profile", title: "Profil", icon: <User className="h-5 w-5" /> },
  { id: "smtp", title: "Email", icon: <Mail className="h-5 w-5" /> },
  { id: "finish", title: "Terminer", icon: <Check className="h-5 w-5" /> },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("welcome");
  const [progress, setProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Formulaire pour le profil
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  // Formulaire pour les paramètres SMTP
  const smtpForm = useForm<z.infer<typeof smtpSchema>>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      smtpEnabled: false,
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: "",
      smtpPassword: "",
      smtpFromEmail: "",
    },
  });

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    if (user) {
      setUserProfile({
        id: user.id,
        fullName: user.fullName || "",
        email: user.email || "",
        smtpHost: user.smtpHost,
        smtpPort: user.smtpPort,
        smtpSecure: user.smtpSecure,
        smtpUser: user.smtpUser,
        smtpPassword: user.smtpPassword,
        smtpFromEmail: user.smtpFromEmail,
        smtpEnabled: user.smtpEnabled,
        onboardingCompleted: user.onboardingCompleted,
      });
    }
  }, [user]);

  // Mettre à jour la progression
  useEffect(() => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    setProgress(((currentIndex) / (steps.length - 1)) * 100);
  }, [currentStep]);

  // Rediriger si l'onboarding est déjà complété
  useEffect(() => {
    if (user?.onboardingCompleted) {
      window.location.href = "/admin";
    }
  }, [user?.onboardingCompleted]);

  // Passer à l'étape suivante
  const goToNextStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  // Passer à l'étape précédente
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  // Gérer la soumission du formulaire de profil
  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user.id}`, 
        { ...data }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }
      
      setUserProfile((prev) => prev ? { ...prev, ...data } : null);
      goToNextStep();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la soumission du formulaire SMTP
  const handleSmtpSubmit = async (data: z.infer<typeof smtpSchema>) => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      // Si SMTP est désactivé, nous envoyons uniquement l'état désactivé
      const smtpData = data.smtpEnabled
        ? data
        : { smtpEnabled: false };
      
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user.id}`, 
        { ...smtpData }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des paramètres SMTP");
      }
      
      setUserProfile((prev) => prev ? { ...prev, ...smtpData } : null);
      goToNextStep();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Terminer l'onboarding
  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user.id}`, 
        { onboardingCompleted: true }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la finalisation de l'onboarding");
      }
      
      toast({
        title: "Configuration terminée",
        description: "Votre compte a été configuré avec succès",
      });
      
      // Rediriger vers le tableau de bord
      window.location.href = "/admin";
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tester la configuration SMTP
  const testSmtpConfiguration = async () => {
    setIsLoading(true);
    try {
      const smtpData = smtpForm.getValues();
      
      if (!smtpData.smtpEnabled) {
        toast({
          title: "Information",
          description: "Veuillez d'abord activer la configuration SMTP",
        });
        return;
      }
      
      if (!user) return;
      
      const response = await apiRequest(
        "POST", 
        `/api/users/test-smtp`, 
        { 
          userId: user.id,
          ...smtpData 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du test SMTP");
      }
      
      toast({
        title: "Test réussi",
        description: "La configuration SMTP fonctionne correctement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher l'étape appropriée
  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenue dans l'assistant de configuration</CardTitle>
              <CardDescription>
                Cet assistant vous guidera dans la configuration initiale de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-muted-foreground">
                <p>Nous allons vous aider à configurer :</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Votre profil personnel</li>
                  <li>Vos paramètres d'email (SMTP)</li>
                  <li>Et bien plus encore...</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={goToNextStep}>
                Commencer <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      case "profile":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Votre profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                    >
                      Retour
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : "Continuer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "smtp":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Configuration de l'email</CardTitle>
              <CardDescription>
                Configurez vos paramètres SMTP pour l'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...smtpForm}>
                <form
                  onSubmit={smtpForm.handleSubmit(handleSmtpSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={smtpForm.control}
                    name="smtpEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Activer SMTP personnel</FormLabel>
                          <FormDescription>
                            Permettre d'envoyer des emails via votre propre serveur SMTP
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className={!smtpForm.watch("smtpEnabled") ? "opacity-50 pointer-events-none" : ""}>
                    <FormField
                      control={smtpForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serveur SMTP</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.example.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={smtpForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="587"
                                {...field}
                                value={field.value === undefined ? "" : field.value}
                                onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smtpForm.control}
                        name="smtpSecure"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Sécurisé (TLS)</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <FormField
                        control={smtpForm.control}
                        name="smtpUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur SMTP</FormLabel>
                            <FormControl>
                              <Input placeholder="user@example.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smtpForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe SMTP</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={smtpForm.control}
                        name="smtpFromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse d'expédition</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@example.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              L'adresse email qui apparaîtra comme expéditeur
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={testSmtpConfiguration}
                        disabled={isLoading || !smtpForm.watch("smtpEnabled")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Tester la configuration
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                    >
                      Retour
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enregistrement..." : "Continuer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "finish":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Configuration terminée !</CardTitle>
              <CardDescription>
                Votre compte est maintenant configuré et prêt à l'emploi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-muted-foreground">
                <p>Récapitulatif de votre configuration :</p>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    <strong>Profil</strong> : {userProfile?.fullName} ({userProfile?.email})
                  </li>
                  <li>
                    <strong>Email SMTP</strong> : {userProfile?.smtpEnabled ? "Configuré" : "Non configuré"}
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                Retour
              </Button>
              <Button onClick={completeOnboarding} disabled={isLoading}>
                {isLoading ? "Finalisation..." : "Terminer la configuration"}
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  // Indicateur de progression
  const renderProgress = () => {
    return (
      <div className="mb-8 w-full max-w-md mx-auto">
        <Progress value={progress} className="h-2" />
        <div className="mt-4 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                steps.findIndex((s) => s.id === currentStep) >= index
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  steps.findIndex((s) => s.id === currentStep) >= index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.icon}
              </div>
              <span className="text-xs">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-background py-12 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Assistant de configuration
        </h1>
        {renderProgress()}
        {renderStep()}
      </div>
    </div>
  );
}