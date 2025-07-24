import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceRequestSchema, type ServiceRequestFormData } from "@/lib/validators";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { gtag_report_conversion } from "@/lib/gtm-conversion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  Calendar, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  Bolt,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  HomeIcon,
  LayoutDashboard,
  Workflow,
  Pencil,
  ArrowRightCircle,
  Info as InfoIcon,
  Compass,
  ReceiptText,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SuccessResponseData {
  success: boolean;
  message: string;
  referenceNumber: string;
}

export function MultiStepForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ServiceRequestFormData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [completeManuallyCity, setCompleteManuallyCity] = useState(false);
  const [power, setPower] = useState<string>("monophase");
  const [autoCompleteCity, setAutoCompleteCity] = useState("");
  const [projectType, setProjectType] = useState<string>("maison");
  const [otherProjectType, setOtherProjectType] = useState("");
  // Token pour la sauvegarde progressive du formulaire
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Tabs pour les étapes du formulaire
  const steps = [
    {
      id: "step-1",
      name: "Vos coordonnées",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "step-2",
      name: "Détails techniques",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "step-3",
      name: "Adresse et TVA",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: "step-4",
      name: "Validation finale",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];
  
  // Get tomorrow's date for min date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
  
  // Define the form
  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      // Informations du demandeur
      clientType: "particulier",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      siret: "",
      
      // Type de demande
      serviceType: "electricity",
      requestType: "new_connection",
      buildingType: "individual_house",
      projectStatus: "planning",
      permitNumber: "",
      permitDeliveryDate: "",
      
      // Adresse
      address: "",
      addressComplement: "",
      city: "",
      postalCode: "",
      cadastralReference: "",
      
      // Puissance
      powerRequired: "9",
      phaseType: "monophase",
      
      // Planning
      desiredCompletionDate: "",
      
      // Facturation
      billingAddress: "",
      billingCity: "",
      billingPostalCode: "",
      
      // Architecte
      hasArchitect: false,
      architectName: "",
      architectPhone: "",
      architectEmail: "",
      
      // Commentaires
      comments: ""
    }
  });
  
  // Mutations pour la sauvegarde progressive
  const createLeadMutation = useMutation({
    mutationFn: async (data: Partial<ServiceRequestFormData>) => {
      const response = await apiRequest('POST', '/api/leads/create', data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Sauvegarder le token dans le state et localStorage
        setSessionToken(data.token);
        localStorage.setItem('formSessionToken', data.token);
        
        toast({
          title: "Progression sauvegardée",
          description: "Vos informations sont automatiquement sauvegardées pendant que vous complétez le formulaire.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la création du lead:", error);
      // Ne pas afficher d'erreur à l'utilisateur pour ne pas perturber l'expérience
    }
  });
  
  const updateLeadMutation = useMutation({
    mutationFn: async ({token, data, step}: {token: string, data: Partial<ServiceRequestFormData>, step: number}) => {
      const response = await apiRequest('PUT', `/api/leads/${token}`, {data, step});
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Mise à jour silencieuse
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du lead:", error);
      // Ne pas afficher d'erreur à l'utilisateur pour ne pas perturber l'expérience
    }
  });
  
  const completeStepMutation = useMutation({
    mutationFn: async ({token, step}: {token: string, step: number}) => {
      const response = await apiRequest('POST', `/api/leads/${token}/complete-step`, {step});
      return await response.json();
    },
    onError: (error) => {
      console.error("Erreur lors de la complétion de l'étape:", error);
    }
  });
  
  // Vérifier si un formulaire est déjà en cours au chargement
  useEffect(() => {
    // Récupérer le token depuis localStorage
    const savedToken = localStorage.getItem('formSessionToken');
    
    if (savedToken) {
      setSessionToken(savedToken);
      
      // Récupérer les données du formulaire précédemment sauvegardées
      const fetchLeadData = async () => {
        try {
          const response = await apiRequest('GET', `/api/leads/${savedToken}`);
          const data = await response.json();
          
          if (data.success && data.lead) {
            // Remplir le formulaire avec les données sauvegardées
            const lead = data.lead;
            
            // Décomposer le nom en prénom et nom de famille si disponible
            if (lead.name) {
              const nameParts = lead.name.split(' ');
              if (nameParts.length >= 2) {
                form.setValue('firstName', nameParts[0]);
                form.setValue('lastName', nameParts.slice(1).join(' '));
              } else {
                form.setValue('firstName', lead.name);
              }
            }
            
            // Remplir les autres champs
            Object.keys(lead).forEach((key) => {
              // Ignorer certains champs techniques
              if (['id', 'sessionToken', 'completedSteps', 'ipAddress', 'userAgent', 'createdAt', 'updatedAt', 'completedAt', 'assignedTo'].includes(key)) return;
              
              if (lead[key] !== null && lead[key] !== undefined) {
                // @ts-ignore
                form.setValue(key, lead[key]);
              }
            });
            
            // Définir l'étape en fonction des étapes complétées
            // Si l'utilisateur a complété l'étape 3, on le place à l'étape 4 (récapitulatif)
            // Sinon, on le place à l'étape qu'il était en train de compléter
            const completedSteps = lead.completedSteps || 0;
            if (completedSteps > 0 && completedSteps <= steps.length) {
              setCurrentStep(completedSteps >= steps.length ? steps.length - 1 : completedSteps);
            }
            
            toast({
              title: "Formulaire récupéré",
              description: "Vos informations précédentes ont été récupérées. Vous pouvez continuer là où vous en étiez.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données du lead:", error);
          // Si erreur, on supprime le token pour repartir de zéro
          localStorage.removeItem('formSessionToken');
          setSessionToken(null);
        }
      };
      
      fetchLeadData();
    }
  }, []);

  // Get form values to conditionally show fields
  const clientType = form.watch("clientType");
  const buildingType = form.watch("buildingType");
  const projectStatus = form.watch("projectStatus");
  const hasArchitect = form.watch("hasArchitect");
  
  // Fonction pour la complétion automatique des villes françaises
  async function lookupCity(postalCode: string) {
    if (postalCode.length === 5) {
      try {
        // Cette API gratuite permet de récupérer les communes françaises par code postal
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom&format=json`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Si une seule ville correspond, on l'utilise automatiquement
          if (data.length === 1 && !completeManuallyCity) {
            form.setValue("city", data[0].nom);
            setAutoCompleteCity(data[0].nom);
          } 
          // Si plusieurs villes correspondent, on peut proposer un choix
          else if (data.length > 1) {
            setAutoCompleteCity(data.map((c: any) => c.nom).join(", "));
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la ville:", error);
      }
    }
  }
  
  // Observer pour le code postal
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "postalCode" && value.postalCode && !completeManuallyCity) {
        lookupCity(value.postalCode);
      }
      
      // Faire la même chose pour l'adresse de facturation
      if (name === "billingPostalCode" && value.billingPostalCode) {
        try {
          fetch(`https://geo.api.gouv.fr/communes?codePostal=${value.billingPostalCode}&fields=nom&format=json`)
            .then(response => response.json())
            .then(data => {
              if (data && data.length === 1) {
                form.setValue("billingCity", data[0].nom);
              }
            });
        } catch (error) {
          console.error("Erreur lors de la récupération de la ville de facturation:", error);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, completeManuallyCity]);
  
  // Fonction pour passer à l'étape suivante du formulaire
  const nextStep = () => {
    // Valider seulement les champs de l'étape courante
    let fieldsToValidate: string[] = [];
    
    if (currentStep === 0) {
      fieldsToValidate = [
        "clientType", "firstName", "lastName", "email", "phone", 
        "billingAddress", "billingPostalCode", "billingCity"
      ];
      
      if (clientType === "professionnel") {
        fieldsToValidate.push("company", "siret");
      }
    } else if (currentStep === 1) {
      fieldsToValidate = [
        "requestType", "buildingType", "projectStatus", 
        "powerRequired", "phaseType", "comments"
      ];
      
      if (projectStatus === "permit_approved" || projectStatus === "permit_pending") {
        fieldsToValidate.push("permitNumber");
      }
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "address", "city", "postalCode",
        "connectionDelay", "vatRate", "termsAccepted", "immediatePurchaseAccepted"
      ];
    }
    
    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        // Récupérer toutes les données actuelles du formulaire
        const currentFormData = form.getValues();
        
        // Adapter le format pour la sauvegarde
        // Transformer firstName et lastName en name pour la sauvegarde
        const { firstName, lastName, ...restData } = currentFormData as any;
        const dataToSave = {
          ...restData,
          name: `${firstName} ${lastName}`.trim()
        };
        
        // Si première étape, créer un nouveau lead
        if (currentStep === 0 && !sessionToken) {
          createLeadMutation.mutate(dataToSave);
        } 
        // Si le token existe déjà, mettre à jour le lead
        else if (sessionToken) {
          updateLeadMutation.mutate({
            token: sessionToken,
            data: dataToSave,
            step: currentStep + 1
          });
          
          // Marquer l'étape comme complétée
          completeStepMutation.mutate({
            token: sessionToken,
            step: currentStep + 1
          });
        }
        
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Si c'est la dernière étape et que nous avons un token de session
          if (sessionToken) {
            // Finaliser le lead et convertir en demande de service
            apiRequest('POST', `/api/leads/${sessionToken}/finalize`)
              .then(response => response.json())
              .then(data => {
                if (data.success && data.referenceNumber) {
                  // Rediriger vers la page de paiement avec la référence générée
                  const referenceFormatted = data.referenceNumber.startsWith('REF-') ? 
                    data.referenceNumber : `RAC-${data.referenceNumber}`;
                    
                  toast({
                    title: "Demande envoyée avec succès!",
                    description: `Redirection vers la page de paiement...`,
                    variant: "default",
                  });
                  
                  // Nettoyer le localStorage car le formulaire est terminé
                  localStorage.removeItem('formSessionToken');
                  
                  // Rediriger vers la page de confirmation
                  window.location.href = `/confirmation/${referenceFormatted}?nom=${encodeURIComponent(firstName + ' ' + lastName)}`;
                  
                  // Afficher l'animation de chargement
                  setIsAnimating(true);
                } else {
                  // En cas d'erreur, utiliser l'ancienne méthode (soumission directe)
                  submitForm();
                }
              })
              .catch(error => {
                console.error("Erreur lors de la finalisation du lead:", error);
                // En cas d'erreur, utiliser l'ancienne méthode (soumission directe)
                submitForm();
              });
          } else {
            // Si pas de token de session (cas où la sauvegarde progressive a échoué)
            // Utiliser l'ancienne méthode de soumission directe
            submitForm();
          }
        }
      } else {
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Fonction auxiliaire pour soumettre le formulaire directement (fallback)
  const submitForm = () => {
    const formValues = form.getValues();
    setFormData(formValues);
    // Soumettre le formulaire
    submitMutation.mutate(formValues);
    // Afficher l'animation de chargement
    setIsAnimating(true);
  };
  
  // Fonction pour revenir à l'étape précédente du formulaire
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Mutation pour envoyer le formulaire
  const submitMutation = useMutation({
    mutationFn: async (data: ServiceRequestFormData) => {
      // Ajouter les types de projet personnalisés au commentaire si nécessaire
      if (projectType === "autre" && otherProjectType) {
        data.comments = `Type de projet: ${otherProjectType}\n\n${data.comments || ''}`;
      }
      
      // Adapter le format pour la compatibilité avec le backend
      // Combiner firstName et lastName en un seul champ name
      const { firstName, lastName, useDifferentBillingAddress, ...restData } = data as any;
      const formData = {
        ...restData,
        name: `${firstName} ${lastName}`.trim()
      };
      
      const response = await apiRequest('POST', '/api/service-requests', formData);
      return await response.json() as SuccessResponseData;
    },
    onSuccess: (data) => {
      // Rediriger directement vers la page de paiement
      const amount = form.getValues().vatRate === "5.5" ? "136.94" : 
                     form.getValues().vatRate === "10" ? "142.78" : "155.76";
      
      toast({
        title: "Demande envoyée avec succès!",
        description: `Redirection vers la page de paiement...`,
        variant: "default",
      });
      
      // Rediriger immédiatement vers la page de paiement
      // Rediriger immédiatement vers la page de paiement avec le format de référence demandé
      const referenceFormatted = data.referenceNumber.startsWith('REF-') ? data.referenceNumber : `REF-${data.referenceNumber}`;
      window.location.href = `/confirmation/${referenceFormatted}?nom=${encodeURIComponent(form.getValues().firstName + ' ' + form.getValues().lastName)}`;
      
      // On ne reset pas le formulaire car l'utilisateur va être redirigé
    },
    onError: (error) => {
      setIsAnimating(false);
      toast({
        title: "Une erreur est survenue",
        description: error instanceof Error ? error.message : "Veuillez vérifier votre connexion internet et réessayer.",
        variant: "destructive",
      });
    }
  });
  
  // Animation de transition vers paiement
  if (isAnimating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center animate-pulse">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">Redirection vers le paiement...</h3>
          <p className="text-blue-700 mt-2">Veuillez patienter pendant la préparation de votre transaction sécurisée</p>
          <div className="mt-6 flex justify-center items-center space-x-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            <span className="w-2 h-2 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: "450ms" }}></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Indicateur d'étape - Design moderne et élégant */}
      <div className="mb-10">
        <div className="flex items-center justify-between px-4 md:px-10">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center justify-center relative",
                {
                  "text-primary font-medium": currentStep === index,
                  "text-gray-500": currentStep !== index && currentStep < index,
                  "text-green-600 font-medium": currentStep > index,
                }
              )}
            >
              {/* Ligne de connexion entre les étapes */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute h-1 top-5 -left-full w-full -z-10 transition-all duration-500",
                    currentStep > index ? "bg-gradient-to-r from-green-400 to-green-600" : 
                    currentStep === index ? "bg-gradient-to-r from-blue-400 to-primary" : "bg-gray-200"
                  )}
                />
              )}
              
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-300",
                  {
                    "bg-gradient-to-r from-blue-400 to-primary text-white scale-110": currentStep === index,
                    "bg-white border-2 border-gray-200": currentStep !== index && currentStep < index,
                    "bg-gradient-to-r from-green-400 to-green-600 text-white": currentStep > index,
                  }
                )}
              >
                {currentStep > index ? (
                  <CheckCircle className="h-5 w-5 animate-pulse" />
                ) : (
                  <div className="flex items-center justify-center">
                    {step.icon}
                  </div>
                )}
              </div>
              <span className={cn(
                "mt-3 text-sm transition-all duration-300",
                {
                  "font-semibold scale-105": currentStep === index,
                  "font-medium": currentStep > index,
                  "hidden md:block": true
                }
              )}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-blue-100 shadow-lg">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
          {currentStep === 0 && (
            <>
              <User className="h-6 w-6 mr-3 text-blue-500" />
              Vos informations personnelles
            </>
          )}
          {currentStep === 1 && (
            <>
              <FileText className="h-6 w-6 mr-3 text-blue-500" />
              Détails techniques de votre projet
            </>
          )}
          {currentStep === 2 && (
            <>
              <MapPin className="h-6 w-6 mr-3 text-blue-500" />
              Adresse et informations complémentaires
            </>
          )}
          {currentStep === 3 && (
            <>
              <CheckCircle className="h-6 w-6 mr-3 text-blue-500" />
              Récapitulatif de votre demande
            </>
          )}
        </h2>
        
        <Form {...form}>
          <form className="space-y-2 md:space-y-6">
            {/* ÉTAPE 1: INFORMATIONS PERSONNELLES */}
            {currentStep === 0 && (
              <div className="space-y-2 md:space-y-6">
                <div className="space-y-3 md:space-y-5">
                  {/* Type de client */}
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold text-primary">Type de client <span className="text-red-500">*</span></FormLabel>
                        <FormDescription>
                          Sélectionnez le type de client pour votre demande de raccordement
                        </FormDescription>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all">
                            <FormControl>
                              <RadioGroupItem value="particulier" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <User className="h-4 w-4 mr-2 text-primary" />
                              Particulier
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all">
                            <FormControl>
                              <RadioGroupItem value="professionnel" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <Building className="h-4 w-4 mr-2 text-primary" />
                              Professionnel
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all">
                            <FormControl>
                              <RadioGroupItem value="collectivite" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <LayoutDashboard className="h-4 w-4 mr-2 text-primary" />
                              Collectivité
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  {/* Informations de contact */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-medium text-primary flex items-center mt-6">
                      <User className="h-5 w-5 mr-2 text-blue-500" />
                      Vos coordonnées <span className="text-red-500 ml-1">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Prénom */}
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Nom */}
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="votreemail@exemple.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Nous utiliserons cette adresse pour vous tenir informé de l'avancement de votre demande.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Téléphone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="0601020304" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Entreprise pour les professionnels */}
                    {clientType === "professionnel" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 p-4 bg-blue-50/50 rounded-md border border-blue-100">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'entreprise</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom de votre entreprise" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="siret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numéro SIRET</FormLabel>
                              <FormControl>
                                <Input placeholder="12345678901234" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Collectivité pour les collectivités territoriales */}
                    {clientType === "collectivite" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 p-4 bg-blue-50/50 rounded-md border border-blue-100">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de la collectivité</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom de votre collectivité" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="siret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numéro SIRET</FormLabel>
                              <FormControl>
                                <Input placeholder="12345678901234" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Adresse de facturation */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-primary flex items-center mb-5">
                    <ReceiptText className="h-5 w-5 mr-2 text-blue-500" />
                    Adresse de facturation <span className="text-red-500 ml-1">*</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre adresse de facturation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="billingPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="Code postal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="billingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input placeholder="Ville" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ÉTAPE 2: DÉTAILS TECHNIQUES */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  {/* Type de demande */}
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-base font-semibold text-primary">
                          Type de demande <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormDescription>
                          Sélectionnez le type de raccordement électrique dont vous avez besoin
                        </FormDescription>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          <FormItem className="flex flex-col space-y-3 space-x-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="new_connection" />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  Nouveau raccordement
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Pour un bâtiment neuf ou une première installation électrique
                                </p>
                              </div>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-3 space-x-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="power_upgrade" />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  Augmentation de puissance
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Pour renforcer une installation électrique existante
                                </p>
                              </div>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-3 space-x-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="temporary_connection" />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  Raccordement temporaire
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Pour un chantier ou un événement de courte durée
                                </p>
                              </div>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-3 space-x-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="relocation" />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  Déplacement d'ouvrage
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Pour déplacer un compteur ou une ligne existante
                                </p>
                              </div>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-3 space-x-0 border border-input bg-transparent p-4 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="technical_visit" />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <FormLabel className="font-medium cursor-pointer">
                                  Visite technique
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Pour une étude préalable ou un conseil technique
                                </p>
                              </div>
                            </div>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Type de bâtiment */}
                  <div className="space-y-4 mt-8">
                    <FormField
                      control={form.control}
                      name="buildingType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-base font-semibold text-primary">
                            Type de bâtiment <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormDescription>
                            Sélectionnez le type de bâtiment concerné par la demande
                          </FormDescription>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez le type de bâtiment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual_house">Maison individuelle</SelectItem>
                              <SelectItem value="apartment_building">Immeuble collectif</SelectItem>
                              <SelectItem value="commercial">Local commercial</SelectItem>
                              <SelectItem value="industrial">Bâtiment industriel</SelectItem>
                              <SelectItem value="agricultural">Exploitation agricole</SelectItem>
                              <SelectItem value="public">Bâtiment public</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Puissance souhaitée */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <FormField
                        control={form.control}
                        name="powerRequired"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base">
                              Puissance souhaitée (kVA) <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormDescription>
                              Indiquez la puissance électrique nécessaire
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez la puissance" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="3">3 kVA</SelectItem>
                                <SelectItem value="6">6 kVA</SelectItem>
                                <SelectItem value="9">9 kVA</SelectItem>
                                <SelectItem value="12">12 kVA</SelectItem>
                                <SelectItem value="15">15 kVA</SelectItem>
                                <SelectItem value="18">18 kVA</SelectItem>
                                <SelectItem value="24">24 kVA</SelectItem>
                                <SelectItem value="30">30 kVA</SelectItem>
                                <SelectItem value="36">36 kVA</SelectItem>
                                <SelectItem value="other">Plus de 36 kVA (sur devis)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phaseType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base">
                              Type d'alimentation <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormDescription>
                              Choisissez entre monophasé (standard) ou triphasé (forte puissance)
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez le type de phase" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monophase">Monophasé (230V)</SelectItem>
                                <SelectItem value="triphase">Triphasé (400V)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Avancement du projet */}
                  <FormField
                    control={form.control}
                    name="projectStatus"
                    render={({ field }) => (
                      <FormItem className="space-y-4 mt-8">
                        <FormLabel className="text-base font-semibold text-primary">État d'avancement du projet <span className="text-red-500">*</span></FormLabel>
                        <FormDescription>
                          Indiquez l'état actuel de votre projet de construction ou d'aménagement
                        </FormDescription>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                          <FormItem className="flex flex-col space-y-1 border border-input bg-transparent p-3 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="planning" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                En phase de planification
                              </FormLabel>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-1 border border-input bg-transparent p-3 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="permit_pending" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Permis de construire en cours
                              </FormLabel>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-1 border border-input bg-transparent p-3 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="permit_approved" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Permis de construire accordé
                              </FormLabel>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-1 border border-input bg-transparent p-3 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="construction_started" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Construction démarrée
                              </FormLabel>
                            </div>
                          </FormItem>
                          <FormItem className="flex flex-col space-y-1 border border-input bg-transparent p-3 rounded-md cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-blue-50 shadow-sm transition-all h-full">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value="construction_completed" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                Construction terminée
                              </FormLabel>
                            </div>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Numéro de permis si applicable */}
                  {(projectStatus === "permit_pending" || projectStatus === "permit_approved") && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-md border border-blue-100">
                      <FormField
                        control={form.control}
                        name="permitNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de permis de construire <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="PC 00000 00 0000" {...field} />
                            </FormControl>
                            <FormDescription>
                              Format: PC 00000 00 0000 (sans espaces)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {/* Commentaires additionnels */}
                  <div className="mt-8">
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Commentaires additionnels</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ajoutez toute information complémentaire qui pourrait nous aider à traiter votre demande"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Précisez tout détail supplémentaire concernant votre projet ou vos besoins spécifiques
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* ÉTAPE 3: ADRESSE ET INFORMATIONS COMPLÉMENTAIRES */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-lg font-medium text-primary flex items-center mb-5">
                    <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                    Adresse du projet <span className="text-red-500 ml-1">*</span>
                  </h3>
                  
                  {/* Adresse du chantier */}
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="Adresse du projet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="addressComplement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complément d'adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="Étage, bâtiment, etc. (optionnel)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="Code postal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Ville</FormLabel>
                              {autoCompleteCity && !completeManuallyCity && (
                                <button
                                  type="button"
                                  className="text-xs text-blue-600 hover:underline"
                                  onClick={() => setCompleteManuallyCity(true)}
                                >
                                  Modifier manuellement
                                </button>
                              )}
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="Ville" 
                                {...field} 
                                disabled={!!autoCompleteCity && !completeManuallyCity}
                              />
                            </FormControl>
                            {autoCompleteCity && !completeManuallyCity && (
                              <p className="text-xs text-muted-foreground">
                                Ville complétée automatiquement. {autoCompleteCity.includes(", ") && "Plusieurs communes correspondent à ce code postal."}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cadastralReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence cadastrale (optionnelle)</FormLabel>
                          <FormControl>
                            <Input placeholder="Exemple: AB 123" {...field} />
                          </FormControl>
                          <FormDescription>
                            La référence cadastrale peut accélérer le traitement de votre demande
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Délai et taux de TVA */}
                  <div className="pt-6 border-t border-gray-200 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="connectionDelay"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-medium">
                              Délai souhaité <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormDescription>
                              Quand souhaitez-vous que le raccordement soit réalisé?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir un délai" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1.5m">1,5 mois (express, +30%)</SelectItem>
                                <SelectItem value="1.5-3m">Entre 1,5 et 3 mois</SelectItem>
                                <SelectItem value="3-6m">Entre 3 et 6 mois</SelectItem>
                                <SelectItem value="6m+">Plus de 6 mois</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="vatRate"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-medium">
                              Taux de TVA applicable <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormDescription>
                              Sélectionnez le taux de TVA applicable à votre situation
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir un taux de TVA" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="20">TVA normale (20%)</SelectItem>
                                <SelectItem value="10">TVA réduite (10%)</SelectItem>
                                <SelectItem value="5.5">TVA réduite (5,5%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Conditions générales */}
                  <div className="pt-6 border-t border-gray-200 mt-8">
                    <h3 className="text-lg font-medium text-primary flex items-center mb-5">
                      <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Conditions générales
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                J'accepte les <a href="#" className="text-primary underline">conditions générales</a> et la <a href="#" className="text-primary underline">politique de confidentialité</a> <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormDescription>
                                En cochant cette case, vous acceptez nos conditions générales de service et notre politique de traitement des données personnelles.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="immediatePurchaseAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Je comprends que je vais procéder à un paiement immédiat pour l'étude de ma demande <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormDescription>
                                L'étude de votre dossier nécessite un paiement immédiat. Après validation de cette étape, vous serez redirigé vers notre plateforme de paiement sécurisée.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ÉTAPE 4: RÉCAPITULATIF ET VALIDATION */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    Récapitulatif de votre demande
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Informations personnelles */}
                    <Card>
                      <CardHeader className="pb-2 bg-blue-50/80">
                        <CardTitle className="text-base font-medium flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          Informations personnelles
                        </CardTitle>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs p-0 h-auto absolute top-3 right-3 text-primary"
                          onClick={() => setCurrentStep(0)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="md:col-span-2 pb-2">
                            <dt className="text-muted-foreground">Type de client</dt>
                            <dd className="font-medium">
                              {clientType === "particulier" ? "Particulier" : 
                               clientType === "professionnel" ? "Professionnel" : "Collectivité"}
                            </dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Prénom</dt>
                            <dd className="font-medium">{form.watch("firstName")}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Nom</dt>
                            <dd className="font-medium">{form.watch("lastName")}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Email</dt>
                            <dd className="font-medium">{form.watch("email")}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Téléphone</dt>
                            <dd className="font-medium">{form.watch("phone")}</dd>
                          </div>
                          
                          {clientType !== "particulier" && (
                            <>
                              <div>
                                <dt className="text-muted-foreground">
                                  {clientType === "professionnel" ? "Entreprise" : "Collectivité"}
                                </dt>
                                <dd className="font-medium">{form.watch("company")}</dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">SIRET</dt>
                                <dd className="font-medium">{form.watch("siret")}</dd>
                              </div>
                            </>
                          )}
                          
                          <div className="md:col-span-2 pt-2 border-t mt-2">
                            <dt className="text-muted-foreground">Adresse de facturation</dt>
                            <dd className="font-medium">
                              {form.watch("billingAddress")}, {form.watch("billingPostalCode")} {form.watch("billingCity")}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    {/* Informations sur la demande */}
                    <Card>
                      <CardHeader className="pb-2 bg-blue-50/80">
                        <CardTitle className="text-base font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Détails de la demande
                        </CardTitle>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs p-0 h-auto absolute top-3 right-3 text-primary"
                          onClick={() => setCurrentStep(1)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Type de demande</dt>
                            <dd className="font-medium">
                              {form.watch("requestType") === "new_connection" ? "Nouveau raccordement" :
                               form.watch("requestType") === "power_upgrade" ? "Augmentation de puissance" :
                               form.watch("requestType") === "temporary_connection" ? "Raccordement temporaire" :
                               form.watch("requestType") === "relocation" ? "Déplacement d'ouvrage" :
                               "Visite technique"}
                            </dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Type de bâtiment</dt>
                            <dd className="font-medium">
                              {form.watch("buildingType") === "individual_house" ? "Maison individuelle" :
                               form.watch("buildingType") === "apartment_building" ? "Immeuble collectif" :
                               form.watch("buildingType") === "commercial" ? "Local commercial" :
                               form.watch("buildingType") === "industrial" ? "Bâtiment industriel" :
                               form.watch("buildingType") === "agricultural" ? "Exploitation agricole" :
                               "Bâtiment public"}
                            </dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Puissance souhaitée</dt>
                            <dd className="font-medium">{form.watch("powerRequired")} kVA</dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Type d'alimentation</dt>
                            <dd className="font-medium">
                              {form.watch("phaseType") === "monophase" ? "Monophasé" : "Triphasé"}
                            </dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">État du projet</dt>
                            <dd className="font-medium">
                              {form.watch("projectStatus") === "planning" ? "En phase de planification" : 
                               form.watch("projectStatus") === "permit_pending" ? "Permis de construire en cours" :
                               form.watch("projectStatus") === "permit_approved" ? "Permis de construire accordé" :
                               form.watch("projectStatus") === "construction_started" ? "Construction démarrée" :
                               "Construction terminée"}
                            </dd>
                          </div>
                          
                          {(form.watch("projectStatus") === "permit_pending" || form.watch("projectStatus") === "permit_approved") && (
                            <div>
                              <dt className="text-muted-foreground">Numéro de permis</dt>
                              <dd className="font-medium">{form.watch("permitNumber")}</dd>
                            </div>
                          )}
                          
                          {form.watch("comments") && (
                            <div className="md:col-span-2 border-t pt-2 mt-2">
                              <dt className="text-muted-foreground">Commentaires additionnels</dt>
                              <dd className="font-medium bg-white p-2 rounded mt-1 text-sm border border-blue-100">
                                {form.watch("comments")}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                    </Card>
                    
                    {/* Adresse du projet */}
                    <Card>
                      <CardHeader className="pb-2 bg-blue-50/80">
                        <CardTitle className="text-base font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          Adresse du projet
                        </CardTitle>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs p-0 h-auto absolute top-3 right-3 text-primary"
                          onClick={() => setCurrentStep(2)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="md:col-span-2">
                            <dt className="text-muted-foreground">Adresse</dt>
                            <dd className="font-medium">{form.watch("address")}</dd>
                          </div>
                          
                          {form.watch("addressComplement") && (
                            <div className="md:col-span-2">
                              <dt className="text-muted-foreground">Complément d'adresse</dt>
                              <dd className="font-medium">{form.watch("addressComplement")}</dd>
                            </div>
                          )}
                          
                          <div>
                            <dt className="text-muted-foreground">Code postal</dt>
                            <dd className="font-medium">{form.watch("postalCode")}</dd>
                          </div>
                          
                          <div>
                            <dt className="text-muted-foreground">Ville</dt>
                            <dd className="font-medium">{form.watch("city")}</dd>
                          </div>
                          
                          {form.watch("cadastralReference") && (
                            <div>
                              <dt className="text-muted-foreground">Référence cadastrale</dt>
                              <dd className="font-medium">{form.watch("cadastralReference")}</dd>
                            </div>
                          )}
                          
                          <div className="md:col-span-2 pt-2 mt-2 border-t">
                            <dt className="text-muted-foreground">Délai souhaité</dt>
                            <dd className="font-medium">
                              {form.watch("connectionDelay") === "1.5m" ? "1,5 mois" :
                              form.watch("connectionDelay") === "1.5-3m" ? "Entre 1,5 et 3 mois" :
                              form.watch("connectionDelay") === "3-6m" ? "Entre 3 et 6 mois" :
                              "Plus de 6 mois"}
                            </dd>
                          </div>
                          
                          <div className="md:col-span-2">
                            <dt className="text-muted-foreground">Taux de TVA</dt>
                            <dd className="font-medium">
                              {form.watch("vatRate") === "20" ? "TVA normale (20%)" :
                              form.watch("vatRate") === "10" ? "TVA réduite (10%)" :
                              "TVA réduite (5,5%)"}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    {/* Section des coûts */}
                    <Card>
                      <CardHeader className="pb-2 bg-blue-50/80">
                        <CardTitle className="text-base font-medium flex items-center">
                          <ReceiptText className="h-4 w-4 mr-2 text-primary" />
                          Détail des coûts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 text-sm">
                            <span className="text-muted-foreground">Frais de dossier</span>
                            <span className="font-medium">89,80 € HT</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-sm">
                            <span className="text-muted-foreground">Frais d'étude technique</span>
                            <span className="font-medium">40,00 € HT</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-sm border-t pt-2 mt-1">
                            <span className="text-muted-foreground">Total HT</span>
                            <span className="font-medium">129,80 € HT</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-sm">
                            <span className="text-muted-foreground">TVA ({form.watch("vatRate")}%)</span>
                            <span className="font-medium">
                              {form.watch("vatRate") === "5.5" ? "7,14" : 
                               form.watch("vatRate") === "10" ? "12,98" : "25,96"} €
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 text-base border-t pt-2 mt-1">
                            <span className="font-semibold text-primary">Total TTC</span>
                            <span className="font-bold text-primary">
                              {form.watch("vatRate") === "5.5" ? "136,94" : 
                               form.watch("vatRate") === "10" ? "142,78" : "155,76"} € TTC
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Étapes suivantes */}
                <div className="bg-blue-50/30 p-6 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-primary text-lg flex items-center mb-4">
                    <ArrowRightCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Prochaines étapes
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Après paiement, notre équipe technique analysera votre demande dans les plus brefs délais</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Vous recevrez un e-mail de confirmation avec les détails de votre demande</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">Un conseiller Enedis vous contactera pour planifier les prochaines étapes de votre raccordement</span>
                    </li>
                  </ul>
                </div>
                
                {/* Bouton d'action */}
                <div className="flex justify-center">
                  <Button 
                    type="button"
                    size="lg"
                    className="px-10 py-6 h-auto bg-gradient-to-r from-blue-500 to-primary hover:from-primary hover:to-blue-700 shadow-md text-lg"
                    onClick={() => {
                      // Soumettre le formulaire
                      const formValues = form.getValues();
                      submitMutation.mutate(formValues);
                      // Afficher l'animation de chargement
                      setIsAnimating(true);
                    }}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Procéder au paiement ({form.watch("vatRate") === "5.5" ? "136,94" : 
                                          form.watch("vatRate") === "10" ? "142,78" : "155,76"} € TTC)
                  </Button>
                </div>
              </div>
            )}
            
            {/* Boutons de navigation */}
            <div className={cn("flex justify-between mt-10 pt-6 border-t border-gray-200", {
              "hidden": currentStep === 3
            })}>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`${currentStep === 0 ? 'opacity-0' : ''}`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              
              <Button type="button" onClick={nextStep}>
                {currentStep === steps.length - 2 ? (
                  "Vérifier ma demande"
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}