import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceRequestSchema, type ServiceRequestFormData } from "@/lib/validators";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  HardHat,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SuccessResponseData {
  success: boolean;
  message: string;
  referenceNumber: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Collapsible section component for form organization
function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden",
      )}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ServiceRequestForm() {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  
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
      name: "",
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
  
  // Get form values to conditionally show fields
  const watchedValues = form.watch();
  const clientType = watchedValues.clientType;
  const projectStatus = watchedValues.projectStatus;
  const hasArchitect = watchedValues.hasArchitect;
  const useDifferentBillingAddress = Boolean(watchedValues.useDifferentBillingAddress);
  
  // NOTE: form_start tracking REMOVED - legacy /home path
  // ALL tracking is centralized in /raccordement-enedis via analytics.ts
  
  // Handle API submission
  const submitMutation = useMutation({
    mutationFn: async (data: ServiceRequestFormData) => {
      // Remove any fields we don't want to send to the API
      const { useDifferentBillingAddress, ...formData } = data as any;
      const response = await apiRequest('POST', '/api/service-requests', formData);
      return await response.json() as SuccessResponseData;
    },
    onSuccess: (data) => {
      setReferenceNumber(data.referenceNumber);
      toast({
        title: "Demande envoyée avec succès!",
        description: `Votre numéro de référence: ${data.referenceNumber}`,
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Une erreur est survenue",
        description: error instanceof Error ? error.message : "Veuillez vérifier votre connexion internet et réessayer.",
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  // État pour gérer l'affichage du récapitulatif
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState<ServiceRequestFormData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  function onSubmit(data: ServiceRequestFormData) {
    // Stocker les données du formulaire pour affichage récapitulatif
    setFormData(data);
    setShowSummary(true);
    
    // Défilement vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Fonction pour confirmer la demande et passer au paiement
  function confirmAndSubmit() {
    if (!formData) return;
    
    // Afficher animation de transition
    setIsAnimating(true);
    
    // Soumettre le formulaire après une courte pause pour voir l'animation
    setTimeout(() => {
      // Envoyer les données à l'API
      submitMutation.mutate(formData, {
        onSuccess: (data) => {
          // NOTE: form_submit tracking REMOVED from this legacy path
          // ALL tracking is centralized in /raccordement-enedis via analytics.ts
          
          // Redirect to confirmation page
          setTimeout(() => {
            const ref = data.referenceNumber || '';
            const nom = formData.name || '';
            const refFormatted = ref.startsWith('REF-') ? ref : `REF-${ref}`;
            const redirectUrl = `/confirmation/${refFormatted}?nom=${encodeURIComponent(nom)}`;
            window.location.href = redirectUrl;
          }, 200);
        }
      });
    }, 800);
  }
  
  // Animation de transition vers paiement
  if (isAnimating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#32b34a] border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800">Redirection vers le paiement...</h3>
          <p className="text-gray-600 mt-2">Veuillez patienter pendant que nous préparons votre paiement</p>
        </div>
      </div>
    );
  }

  // Si nous avons un numéro de référence, afficher la page de succès
  if (referenceNumber) {
    return (
      <div className="bg-green-50 p-8 rounded-lg border border-green-200 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h3 className="font-bold text-success text-xl mb-3">Demande envoyée avec succès!</h3>
          <div className="text-green-700 mb-5">
            <p>Votre demande a été reçue et enregistrée. Veuillez conserver votre numéro de référence:</p>
            <div className="bg-white px-5 py-3 rounded-lg border border-green-300 my-4 inline-block">
              <p className="font-mono font-bold text-xl tracking-wide">{referenceNumber}</p>
            </div>
            <p className="text-sm mb-2">Cet identifiant vous permettra de suivre l'état de votre demande.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 mb-6 text-blue-800">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5 mr-2" />
                <p className="font-semibold">Frais de service: 129,80 €</p>
              </div>
              <p className="text-sm">Pour finaliser votre demande, veuillez procéder au paiement des frais de service qui incluent la gestion administrative complète et l'accompagnement personnalisé.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="px-6"
              onClick={() => setReferenceNumber(null)}
            >
              Faire une nouvelle demande
            </Button>
            
            <Button 
              className="px-6 bg-[#32b34a] hover:bg-[#2a9e40]"
              onClick={() => {
                const ref = referenceNumber || '';
                const nom = form.getValues('name') || '';
                
                // Ajout de logs pour débogage
                console.log('Redirection bouton - Référence:', ref);
                // S'assurer que la référence est correctement formatée
                const refFormatted = ref.startsWith('RAC-') || ref.startsWith('REF-') ? ref : `RAC-${ref}`;
                const redirectUrl = `/confirmation/${refFormatted}?nom=${encodeURIComponent(nom)}`;
                console.log('Redirection vers:', redirectUrl);
                
                // Utilisation d'un timeout de sécurité pour s'assurer que le navigateur a le temps de traiter
                setTimeout(() => {
                  window.location.href = redirectUrl;
                }, 50);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Procéder au paiement
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Page de récapitulation après soumission du formulaire
  if (showSummary && formData) {
    // Traduire les valeurs en français pour l'affichage
    const typeRaccordement = {
      "new_connection": "Nouveau raccordement",
      "power_upgrade": "Augmentation de puissance",
      "temporary_connection": "Raccordement provisoire",
      "relocation": "Déplacement d'ouvrage",
      "technical_visit": "Visite technique"
    };
    
    const typeBatiment = {
      "individual_house": "Maison individuelle",
      "apartment_building": "Immeuble collectif",
      "commercial": "Local commercial",
      "industrial": "Site industriel",
      "agricultural": "Exploitation agricole",
      "public": "Bâtiment public"
    };
    
    const etatProjet = {
      "planning": "En projet",
      "permit_pending": "Permis déposé",
      "permit_approved": "Permis accordé",
      "construction_started": "Construction commencée",
      "construction_completed": "Construction terminée"
    };
    
    const puissances = {
      "3": "3 kVA",
      "6": "6 kVA",
      "9": "9 kVA",
      "12": "12 kVA",
      "15": "15 kVA",
      "18": "18 kVA",
      "24": "24 kVA",
      "36": "36 kVA"
    };
    
    const phases = {
      "monophase": "Monophasé",
      "triphase": "Triphasé"
    };
    
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Récapitulatif de votre demande</h2>
            <p className="text-gray-600">Veuillez vérifier les informations ci-dessous avant de confirmer votre demande</p>
          </div>
          
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 text-primary mr-2" />
                Informations du demandeur
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type de client</p>
                  <p className="font-medium">
                    {formData.clientType === "particulier" ? "Particulier" : 
                     formData.clientType === "professionnel" ? "Professionnel" : "Collectivité"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
                
                {formData.company && (
                  <div>
                    <p className="text-sm text-gray-500">Entreprise</p>
                    <p className="font-medium">{formData.company}</p>
                  </div>
                )}
                
                {formData.siret && (
                  <div>
                    <p className="text-sm text-gray-500">SIRET</p>
                    <p className="font-medium">{formData.siret}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Projet */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                Informations du projet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type de raccordement</p>
                  <p className="font-medium">{typeRaccordement[formData.requestType as keyof typeof typeRaccordement]}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Type de bâtiment</p>
                  <p className="font-medium">{typeBatiment[formData.buildingType as keyof typeof typeBatiment]}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">État du projet</p>
                  <p className="font-medium">{etatProjet[formData.projectStatus as keyof typeof etatProjet]}</p>
                </div>
                
                {formData.permitNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Numéro de permis</p>
                    <p className="font-medium">{formData.permitNumber}</p>
                  </div>
                )}
                
                {formData.permitDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Date de délivrance du permis</p>
                    <p className="font-medium">{formData.permitDeliveryDate}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Adresse */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                Adresse du projet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{formData.address}</p>
                </div>
                
                {formData.addressComplement && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Complément d'adresse</p>
                    <p className="font-medium">{formData.addressComplement}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Ville</p>
                  <p className="font-medium">{formData.city}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Code postal</p>
                  <p className="font-medium">{formData.postalCode}</p>
                </div>
                
                {formData.cadastralReference && (
                  <div>
                    <p className="text-sm text-gray-500">Référence cadastrale</p>
                    <p className="font-medium">{formData.cadastralReference}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Spécifications techniques */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Bolt className="h-5 w-5 text-primary mr-2" />
                Spécifications techniques
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Puissance requise</p>
                  <p className="font-medium">{puissances[formData.powerRequired as keyof typeof puissances]}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Type de phase</p>
                  <p className="font-medium">{phases[formData.phaseType as keyof typeof phases]}</p>
                </div>
              </div>
            </div>
            
            {/* Facturation */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                Facturation
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Frais de service</h4>
                    <p className="text-sm text-blue-700">Gestion administrative complète</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-900">129,80 €</p>
                  <p className="text-xs text-blue-700">TVA incluse</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.billingAddress && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Adresse de facturation</p>
                    <p className="font-medium">{formData.billingAddress}</p>
                  </div>
                )}
                
                {formData.billingCity && (
                  <div>
                    <p className="text-sm text-gray-500">Ville (facturation)</p>
                    <p className="font-medium">{formData.billingCity}</p>
                  </div>
                )}
                
                {formData.billingPostalCode && (
                  <div>
                    <p className="text-sm text-gray-500">Code postal (facturation)</p>
                    <p className="font-medium">{formData.billingPostalCode}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Commentaires */}
            {formData.comments && (
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Commentaires
                </h3>
                
                <p className="text-gray-700 whitespace-pre-line">{formData.comments}</p>
              </div>
            )}
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button 
                variant="outline" 
                className="px-6"
                onClick={() => setShowSummary(false)}
              >
                Modifier ma demande
              </Button>
              
              <Button 
                className="bg-[#32b34a] hover:bg-[#2a9e40] px-6"
                onClick={confirmAndSubmit}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer et procéder au paiement
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations du demandeur */}
        <Section 
          title="Informations du demandeur" 
          icon={<User className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                    Vous êtes
                  </FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="particulier">Un particulier</SelectItem>
                        <SelectItem value="professionnel">Un professionnel</SelectItem>
                        <SelectItem value="collectivite">Une collectivité</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      {clientType === "particulier" ? "Nom et prénom" : "Nom du représentant légal"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jean Dupont" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Adresse Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="exemple@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Numéro de Téléphone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(clientType === "professionnel" || clientType === "collectivite") && (
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                        Raison Sociale
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Entreprise SAS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {clientType === "professionnel" && (
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5 md:col-span-2">
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                        Numéro SIRET
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901234" {...field} />
                      </FormControl>
                      <FormDescription>
                        14 chiffres sans espaces
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex h-10 w-full md:col-span-2 rounded-md border border-input bg-gray-50 px-3 py-2 text-sm items-center">
                <input type="hidden" name="serviceType" value="electricity" />
                <Bolt className="h-4 w-4 text-primary mr-2" />
                <span>Type de service : <span className="font-medium">Raccordement électrique</span></span>
              </div>
            </div>
          </div>
        </Section>
        
        {/* Type de demande */}
        <Section 
          title="Type de projet" 
          icon={<FileText className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Type de raccordement
                    </FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de raccordement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_connection">Nouveau raccordement</SelectItem>
                          <SelectItem value="power_upgrade">Augmentation de puissance</SelectItem>
                          <SelectItem value="temporary_connection">Raccordement provisoire</SelectItem>
                          <SelectItem value="relocation">Déplacement d'ouvrage</SelectItem>
                          <SelectItem value="technical_visit">Visite technique</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buildingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Type de bâtiment
                    </FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de bâtiment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual_house">Maison individuelle</SelectItem>
                          <SelectItem value="apartment_building">Immeuble collectif</SelectItem>
                          <SelectItem value="commercial">Local commercial</SelectItem>
                          <SelectItem value="industrial">Site industriel</SelectItem>
                          <SelectItem value="agricultural">Exploitation agricole</SelectItem>
                          <SelectItem value="public">Bâtiment public</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      État du projet
                    </FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez l'état du projet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">En projet</SelectItem>
                          <SelectItem value="permit_pending">Permis déposé</SelectItem>
                          <SelectItem value="permit_approved">Permis accordé</SelectItem>
                          <SelectItem value="construction_started">Construction commencée</SelectItem>
                          <SelectItem value="construction_completed">Construction terminée</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(projectStatus === "permit_pending" || projectStatus === "permit_approved") && (
                <>
                  <FormField
                    control={form.control}
                    name="permitNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Numéro de permis
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="PC 075 19 20 0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="permitDeliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Date de délivrance
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>
        </Section>
        
        {/* Adresse du projet */}
        <Section 
          title="Adresse du projet" 
          icon={<MapPin className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                    Adresse
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rue Exemple" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="addressComplement"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>
                    Complément d'adresse
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Appartement, étage, bâtiment, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Ville
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Code Postal
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="75001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cadastralReference"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5 md:col-span-2">
                    <FormLabel>
                      Référence cadastrale (si connue)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Section AB, Parcelle 123" {...field} />
                    </FormControl>
                    <FormDescription>
                      La référence cadastrale permet de localiser précisément votre terrain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Section>
        
        {/* Caractéristiques techniques */}
        <Section 
          title="Caractéristiques techniques" 
          icon={<Bolt className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="powerRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                      Puissance demandée (kVA)
                    </FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value?.toString() || ''} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la puissance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 kVA</SelectItem>
                          <SelectItem value="6">6 kVA</SelectItem>
                          <SelectItem value="9">9 kVA</SelectItem>
                          <SelectItem value="12">12 kVA</SelectItem>
                          <SelectItem value="15">15 kVA</SelectItem>
                          <SelectItem value="18">18 kVA</SelectItem>
                          <SelectItem value="24">24 kVA</SelectItem>
                          <SelectItem value="36">36 kVA</SelectItem>
                          <SelectItem value="42">42 kVA</SelectItem>
                          <SelectItem value="250">250 kVA et plus</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      La puissance standard pour une maison est de 9 kVA
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type d'alimentation
                    </FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monophase">Monophasé</SelectItem>
                          <SelectItem value="triphase">Triphasé</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Le monophasé convient aux habitations classiques
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Section>
        
        {/* Données sur le planning */}
        <Section 
          title="Planning des travaux" 
          icon={<Calendar className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="desiredCompletionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>
                    Date souhaitée de mise en service
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      min={tomorrowFormatted}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>
        
        {/* Informations de facturation */}
        <Section 
          title="Informations de facturation" 
          icon={<CreditCard className="h-5 w-5 text-primary" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="useDifferentBillingAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 w-full border rounded-lg p-3 mb-3">
                  <FormLabel className="cursor-pointer text-sm font-medium">
                    Utiliser une adresse de facturation différente
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {useDifferentBillingAddress && (
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                        Adresse de facturation
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Rue Exemple" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField
                    control={form.control}
                    name="billingCity"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Ville
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingPostalCode"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Code Postal
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
        
        {/* Informations sur l'architecte */}
        <Section 
          title="Informations sur l'architecte" 
          icon={<HardHat className="h-5 w-5 text-primary" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-4">
              <FormField
                control={form.control}
                name="hasArchitect"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 w-full border rounded-lg p-3">
                    <FormLabel className="cursor-pointer text-sm font-medium">
                      Mon projet est suivi par un architecte
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {hasArchitect && (
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField
                    control={form.control}
                    name="architectName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Nom de l'architecte
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Martin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="architectPhone"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="architectEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5 md:col-span-2">
                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-error">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="architecte@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
        
        {/* Commentaires */}
        <Section
          title="Commentaires"
          icon={<FileText className="h-5 w-5 text-primary" />}
          defaultOpen={false}
        >
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>
                  Commentaires supplémentaires
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Précisez ici toute information complémentaire concernant votre demande..."
                    className="min-h-[150px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>
        
        {/* Informations légales et RGPD */}
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 text-sm text-gray-600">
          <p>
            En soumettant ce formulaire, vous acceptez que les informations saisies soient utilisées pour le traitement
            de votre demande de raccordement. Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée,
            vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
          </p>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8">
          <Button 
            type="submit" 
            className="w-full py-6 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Soumettre ma demande de raccordement"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
