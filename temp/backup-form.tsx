import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { 
  ChevronRight, MapPin, Mail, Phone, User, Send, X, MessageSquare, Info, Clock,
  Home, Briefcase, Building, Bolt, FileText, Calendar, CheckCircle, InfoIcon, Loader2, Zap, Check
} from "lucide-react";
import { ToggleIconButton } from "@/components/ui/toggle-icon-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ContactModal } from "@/components/contact-modal";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { FormLabelWithIcon } from "@/components/form-label-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AdaptiveCheckbox } from "@/components/ui/adaptive-checkbox";
import { MobileToggle } from "@/components/ui/mobile-toggle";
import { useIsMobile } from "@/lib/mobile-optimizations";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { GoogleSnippetsInitializer } from "@/components/google-snippets-initializer";
import { GoogleSnippetButton } from "@/components/google-snippet-button";

// Import des styles CSS pour l'interface responsive
import "../styles/form-mobile-optimizations.css";
import "../styles/mobile-fixes-v2.css";
import "../styles/mobile-form-improvements.css";
import "../styles/sidebar-mobile-summary.css";


// Schéma de validation pour le formulaire
const requestFormSchema = z.object({
  // Informations personnelles
  clientType: z.enum(["particulier", "professionnel", "collectivite"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de client" }),
  }),
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  societe: z.string()
    .optional()
    .superRefine((val, ctx) => {
      // Vérification du contexte (data) disponible
      const data = ctx.path ? ctx.path[0] ? (ctx as any).data : null : null;
      
      if (data && data.clientType) {
        const clientType = data.clientType;
        
        // Vérifier si le champ est requis pour professionnels et collectivités
        if ((clientType === 'professionnel' || clientType === 'collectivite') && 
            (!val || val.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ce champ est requis pour les professionnels et collectivités"
          });
        }
      }
    }),
  siren: z.string().regex(/^[0-9]{9}$/, "Le SIREN doit contenir exactement 9 chiffres").optional().or(z.literal("")),
  
  // Détails techniques
  typeRaccordement: z.enum([
    "new_connection", 
    "power_upgrade", 
    "temporary_connection", 
    "meter_relocation",
    "other"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de raccordement" }),
  }),
  dateDebutRaccordementProvisoire: z.string().optional(),
  dateFinRaccordementProvisoire: z.string().optional(),
  numeroPDL: z.string().optional(),
  pdlInconnu: z.boolean().optional(),
  autreTypeDescription: z.string().optional(),
  typeBatiment: z.enum([
    "individual_house", 
    "apartment_building", 
    "commercial", 
    "industrial",
    "terrain"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de projet" }),
  }),
  terrainViabilise: z.enum(["viabilise", "non_viabilise"]).optional(),
  etatProjet: z.enum([
    "planning", 
    "construction_started"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner l'état du projet" }),
  }),
  numeroPermis: z.string().optional(),
  datePermis: z.string().optional(),
  ignorerPermisConstruction: z.boolean().optional(),
  puissanceDemandee: z.string().optional().or(z.literal("")),
  typePhase: z.enum(["monophase", "triphase", "je_ne_sais_pas"]).optional(),
  delaiRaccordement: z.enum(["less-1.5m", "1.5m", "1.5-3m", "3-6m", "6m+"]),
  
  // Adresse et facturation
  adresse: z.string().min(5, "L'adresse est requise"),
  complementAdresse: z.string().optional(),
  codePostal: z.string().min(5, "Code postal invalide"),
  ville: z.string().min(2, "La ville est requise"),
  // referenceCadastrale: z.string().optional(), // Champ supprimé selon les besoins du client
  adresseFacturationDifferente: z.boolean().optional(),
  adresseFacturation: z.string().optional(),
  villeFacturation: z.string().optional(),
  codePostalFacturation: z.string().optional(),
  
  // Autres informations
  avezVousArchitecte: z.boolean().optional(),
  nomArchitecte: z.string().optional(),
  telephoneArchitecte: z.string().optional(),
  emailArchitecte: z.string().email("Email de l'architecte invalide").optional().or(z.literal("")),
  commentaires: z.string().optional(),
  accepteConditions: z.boolean().default(false)
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function RaccordementEnedisPage() {
  
  const topRef = useRef<HTMLDivElement>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État du formulaire à étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(33);
  const [cityList, setCityList] = useState<Array<{nom: string, code: string}>>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  
  // État pour la saisie manuelle des villes
  const [isSaisingVilleManually, setIsSaisingVilleManually] = useState(false);
  
  // Style uniforme pour tous les labels de formulaire
  const formLabelStyle = "flex items-center gap-2 font-medium";
  const [isFacturationVilleManually, setIsFacturationVilleManually] = useState(false);
  
  // État pour la recherche SIREN
  const [companyInfo, setCompanyInfo] = useState<{name: string, address: string} | null>(null);
  const [isLoadingSiren, setIsLoadingSiren] = useState(false);
  const [sirenError, setSirenError] = useState<string | null>(null);
  const [isSearchingCompanySiren, setIsSearchingCompanySiren] = useState(false);
  
  // Référence pour stocker le timer de recherche SIREN
  const sirenSearchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Récupération des données sauvegardées localement - désactivée
  const getSavedFormData = () => {
    // La récupération des données utilisateur a été désactivée
    return null;
  };
  
  // Fonction pour sauvegarder les données du formulaire - désactivée
  const saveFormData = (data: any) => {
    // La sauvegarde des données utilisateur a été désactivée
    return;
  };
  
  const savedFormData = getSavedFormData();

  // Initialisation du formulaire
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: savedFormData || {
      // Informations personnelles
      clientType: "particulier",
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      societe: "",
      siren: "",
      
      // Détails techniques
      typeRaccordement: "new_connection",
      dateDebutRaccordementProvisoire: "",
      dateFinRaccordementProvisoire: "",
      numeroPDL: "",
      pdlInconnu: false,
      autreTypeDescription: "",
      typeBatiment: "individual_house",
      terrainViabilise: "viabilise",
      etatProjet: "planning",
      numeroPermis: "",
      datePermis: "",
      ignorerPermisConstruction: false,
      puissanceDemandee: "9",
      typePhase: "je_ne_sais_pas",
      delaiRaccordement: "1.5-3m",
      
      // Adresse et facturation
      adresse: "",
      complementAdresse: "",
      codePostal: "",
      ville: "",
      // referenceCadastrale: "", // Champ supprimé
      adresseFacturationDifferente: false,
      adresseFacturation: "",
      villeFacturation: "",
      codePostalFacturation: "",
      
      // Autres informations
      avezVousArchitecte: false,
      nomArchitecte: "",
      telephoneArchitecte: "",
      emailArchitecte: "",
      commentaires: "",
      accepteConditions: false
    },
  });
  
  // Si des données ont été récupérées, on affiche un toast pour informer l'utilisateur
  useEffect(() => {
    if (savedFormData) {
      toast({
        title: "Formulaire restauré",
        description: "Vos données précédemment saisies ont été restaurées",
        duration: 3000,
      });
    }
  }, []);
  
  // Auto-sauvegarde des champs importants
  const importantFields = [
    'clientType', 'nom', 'prenom', 'email', 'telephone', 
    'societe', 'siren', 'typeRaccordement', 'adresse',
    'codePostal', 'ville'
  ];
  
  // Écouter les changements de champs importants et sauvegarder
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // On vérifie si le champ modifié fait partie des champs importants
      if (type === 'change' && name && importantFields.includes(name)) {
        // On ajoute un délai pour ne pas sauvegarder à chaque frappe
        const timeoutId = setTimeout(() => {
          saveFormData(form.getValues());
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Fonction pour passer à l'étape suivante
  const goToNextStep = async () => {
    const currentFields = getCurrentStepFields();
    const result = await form.trigger(currentFields as any);
    
    if (result) {
      // Sauvegarde automatique des données 
      const tempData = form.getValues();
      saveFormData(tempData);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Calcul de la progression
      if (nextStep === 2) {
        setFormProgress(66);
      } else if (nextStep === 3) {
        setFormProgress(100);
      }
      
      // Si les champs de l'étape 1 sont remplis, on crée le lead en arrière-plan
      if (currentStep === 1) {
        try {
          const formData = form.getValues();
          
          // Préparation des données à envoyer
          const leadData: any = {
            firstName: formData.prenom,
            lastName: formData.nom,
            email: formData.email,
            phone: formData.telephone,
            clientType: formData.clientType,
            company: formData.societe || "",
            siren: formData.siren || "",
            serviceType: "electricity",
            requestType: formData.typeRaccordement || "new_connection"
          };
          
          // Si on a déjà sélectionné des informations techniques à l'étape 1, les ajouter au lead
          if (formData.typePhase) {
            leadData.phaseType = formData.typePhase;
          }
          
          if (formData.puissanceDemandee) {
            // Si c'est le tarif jaune, ajouter une note spécifique
            if (formData.puissanceDemandee === "36-jaune") {
              leadData.powerRequired = "36";
              leadData.notes = leadData.notes 
                ? `${leadData.notes}\n[TARIF JAUNE] Option tarifaire jaune sélectionnée.` 
                : "[TARIF JAUNE] Option tarifaire jaune sélectionnée.";
            } else {
              leadData.powerRequired = formData.puissanceDemandee;
            }
          }
          
          const response = await apiRequest('POST', '/api/leads/create', leadData);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Lead créé avec succès, token:", data.token);
            
            // La notification de sauvegarde des données a été désactivée
            // Nous continuons à sauvegarder silencieusement les données
            // sans afficher de notification pour ne pas perturber l'utilisateur
          }
        } catch (error) {
          console.error("Erreur lors de la création du lead:", error);
          // Pas d'alerte à l'utilisateur pour ne pas perturber l'expérience
        }
      }
    } else {
      // On notifie l'utilisateur qu'il y a des erreurs
      toast({
        title: "Champs incomplets",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Recherche d'informations d'entreprise à partir du SIREN
  const searchSirenInfo = async (siren: string) => {
    if (siren.length !== 9) {
      setSirenError("Le SIREN doit contenir exactement 9 chiffres");
      setCompanyInfo(null);
      return;
    }
    
    setIsLoadingSiren(true);
    setSirenError(null);
    
    try {
      // Appel à l'API open-data française pour les entreprises
      const response = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siren/${siren}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Si l'API n'est pas accessible (cas courant), nous simulons une réponse
      if (!response.ok) {
        // Simulation de réponse après échec de l'API
        if (siren === "123456789") {
          setCompanyInfo({
            name: "ENTREPRISE EXEMPLE SARL",
            address: "18 AVENUE DES CHAMPS ELYSÉES 75008 PARIS"
          });
        } else {
          // Vérifier si c'est juste un problème d'API ou si le SIREN n'existe pas
          setSirenError("Impossible de vérifier ce SIREN. Veuillez vérifier le numéro ou continuer manuellement.");
          setCompanyInfo(null);
        }
      } else {
        const data = await response.json();
        setCompanyInfo({
          name: data.uniteLegale.denominationUniteLegale || data.uniteLegale.denominationUsuelle1UniteLegale || '',
          address: data.adressePostale || 'Adresse non disponible'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche SIREN:", error);
      setSirenError("Service temporairement indisponible. Veuillez continuer manuellement.");
      setCompanyInfo(null);
    } finally {
      setIsLoadingSiren(false);
    }
  };
  
  // Recherche du SIREN à partir du nom de l'entreprise
  const searchCompanyForSiren = async (companyName: string) => {
    if (!companyName || companyName.length < 3) {
      return;
    }
    
    setIsSearchingCompanySiren(true);
    setSirenError(null);
    
    try {
      // Appel à l'API open-data française pour les entreprises
      const response = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret?q=denominationUniteLegale:"${encodeURIComponent(companyName)}"`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        // API indisponible ou erreur
        setSirenError("Service de recherche SIREN momentanément indisponible. Veuillez saisir le numéro SIREN manuellement.");
      } else {
        const data = await response.json();
        
        if (data.etablissements && data.etablissements.length > 0) {
          const siren = data.etablissements[0].siren;
          form.setValue('siren', siren);
          
          // Récupérer les informations détaillées
          searchSirenInfo(siren);
        } else {
          setSirenError("Aucune entreprise trouvée avec ce nom. Veuillez saisir le SIREN manuellement.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la recherche d'entreprise:", error);
      setSirenError("Service temporairement indisponible. Veuillez saisir le SIREN manuellement.");
    } finally {
      setIsSearchingCompanySiren(false);
    }
  };
  
  // Fonction pour revenir à l'étape précédente
  const goToPrevStep = () => {
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);
    
    // Mise à jour de la progression
    if (prevStep === 1) {
      setFormProgress(33);
    } else if (prevStep === 2) {
      setFormProgress(66);
    }
  };
  
  // Fonction pour obtenir les champs de l'étape courante
  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        // Étape 1: Informations personnelles
        const step1Fields = ['clientType', 'nom', 'prenom', 'email', 'telephone'];
        
        // Ajout des champs spécifiques aux professionnels et collectivités
        if (form.watch('clientType') !== 'particulier') {
          step1Fields.push('societe', 'siren');
        }
        
        return step1Fields;
      
      case 2:
        // Étape 2: Adresse du projet et détails techniques
        const step2Fields = ['adresse', 'complementAdresse', 'codePostal', 'ville', 'referenceCadastrale'];
        
        // Ajout des champs spécifiques en fonction du type de demande
        step2Fields.push('typeRaccordement', 'typeBatiment');
        
        if (form.watch('typeBatiment') === 'terrain') {
          step2Fields.push('terrainViabilise');
        }
        
        if (form.watch('typeRaccordement') === 'temporary_connection') {
          step2Fields.push('dateDebutRaccordementProvisoire', 'dateFinRaccordementProvisoire');
        }
        
        if (form.watch('typeRaccordement') === 'meter_relocation') {
          step2Fields.push('numeroPDL', 'pdlInconnu');
        }
        
        if (form.watch('typeRaccordement') === 'other') {
          step2Fields.push('autreTypeDescription');
        }
        
        // Informations techniques supplémentaires
        step2Fields.push('puissanceDemandee', 'typePhase');
        
        return step2Fields;
      
      case 3:
        // Étape 3: Validation et informations complémentaires
        const step3Fields = ['etatProjet', 'accepteConditions'];
        
        // Ajout des champs relatifs au permis de construire
        if (form.watch('etatProjet') && ['construction_started'].includes(form.watch('etatProjet') || '')) {
          step3Fields.push('numeroPermis', 'datePermis');
        }
        
        // Ajout des champs d'architecte si nécessaire
        if (form.watch('avezVousArchitecte') === true) {
          step3Fields.push('nomArchitecte', 'telephoneArchitecte', 'emailArchitecte');
        }
        
        // Ajouter le délai de raccordement à l'étape 3
        step3Fields.push('delaiRaccordement');
        
        // Ajout des champs d'adresse de facturation si différente
        if (form.watch('adresseFacturationDifferente')) {
          step3Fields.push('adresseFacturation', 'villeFacturation', 'codePostalFacturation');
        }
        
        step3Fields.push('commentaires');
        
        return step3Fields;
      
      default:
        return [];
    }
  };
  
  // Fonction de soumission finale du formulaire
  // Fonction pour rechercher les villes à partir d'un code postal
  const fetchCities = async (postalCode: string, isFacturation: boolean = false) => {
    if (postalCode.length !== 5) return;
    
    setIsLoadingCity(true);
    // Réinitialiser la ville quand on change le code postal
    if (isFacturation) {
      form.setValue('villeFacturation', '');
    } else {
      form.setValue('ville', '');
    }
    
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom,code`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des villes');
      
      const cities = await response.json();
      
      if (cities.length === 0) {
        toast({
          title: "Aucune ville trouvée",
          description: "Aucune ville n'a été trouvée avec ce code postal",
          variant: "destructive",
        });
        setCityList([]);
        return;
      }
      
      // Si c'est pour l'adresse de facturation, on ne modifie pas la liste des villes principales
      if (!isFacturation) {
        setCityList(cities);
      }
      
      // Si une seule ville est trouvée, on la sélectionne automatiquement
      if (cities.length === 1) {
        if (isFacturation) {
          form.setValue('villeFacturation', cities[0].nom);
        } else {
          form.setValue('ville', cities[0].nom);
        }
        
        toast({
          title: "Ville trouvée",
          description: `La ville ${cities[0].nom} a été automatiquement sélectionnée`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Erreur API:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les villes pour ce code postal",
        variant: "destructive",
      });
      setCityList([]);
    } finally {
      setIsLoadingCity(false);
    }
  };
  
  const onSubmit = async (data: RequestFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Afficher un toast pour indiquer que la demande est en cours
      toast({
        title: "Envoi en cours",
        description: "Veuillez patienter pendant le traitement de votre demande...",
        duration: 10000, // Long duration to show it's loading
      });
      
      // Conversion des données pour l'API
      const requestData = {
        // Informations personnelles
        name: `${data.prenom} ${data.nom}`, // Concaténation du prénom et du nom pour respecter le schéma
        email: data.email,
        phone: data.telephone,
        clientType: data.clientType,
        company: data.societe || "",
        siret: data.siren || "",
        
        // Adresse
        address: data.adresse,
        addressComplement: data.complementAdresse || "",
        postalCode: data.codePostal,
        city: data.ville,
        // cadastralReference supprimé
        
        // Type de service
        serviceType: "electricity",
        requestType: data.typeRaccordement,
        temporaryConnectionStartDate: data.dateDebutRaccordementProvisoire || "",
        temporaryConnectionEndDate: data.dateFinRaccordementProvisoire || "",
        pdlNumber: data.numeroPDL || "",
        pdlUnknown: data.pdlInconnu || false,
        otherRequestTypeDesc: data.autreTypeDescription || "",
        
        // Détails du bâtiment
        buildingType: data.typeBatiment,
        terrainViabilise: data.terrainViabilise || "",
        projectStatus: data.etatProjet,
        permitNumber: data.ignorerPermisConstruction ? "Non spécifié" : (data.numeroPermis || ""),
        permitDeliveryDate: data.ignorerPermisConstruction ? "Non spécifiée" : (data.datePermis || ""),
        ignorePermitInfo: data.ignorerPermisConstruction,
        
        // Puissance et phase
        powerRequired: data.puissanceDemandee,
        phaseType: data.typePhase,
        
        // Planning
        connectionDelay: data.delaiRaccordement,
        
        // Facturation
        useDifferentBillingAddress: data.adresseFacturationDifferente,
        billingAddress: data.adresseFacturation || "",
        billingCity: data.villeFacturation || "",
        billingPostalCode: data.codePostalFacturation || "",
        
        // Architecte
        hasArchitect: data.avezVousArchitecte,
        architectName: data.nomArchitecte || "",
        architectPhone: data.telephoneArchitecte || "",
        architectEmail: data.emailArchitecte || "",
        
        // Commentaires
        comments: data.commentaires || "",
        
        // Termes et conditions
        termsAccepted: data.accepteConditions,
      };
      
      // Envoi des données à l'API
      let response;
      try {
        // On utilise fetch directement ici pour avoir un contrôle complet sur la gestion d'erreur
        response = await fetch('/api/service-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        // Gestion des erreurs HTTP
        if (!response.ok) {
          let errorMessage = "Erreur lors de la soumission du formulaire";
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // Si la réponse n'est pas du JSON valide, on garde le message d'erreur par défaut
          }
          throw new Error(errorMessage);
        }
        
      } catch (networkError) {
        console.error("Erreur réseau:", networkError);
        throw new Error("Impossible de connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.");
      }
      
      // Traitement de la réponse
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Erreur de parsing JSON:", jsonError);
        throw new Error("Format de réponse invalide du serveur");
      }
      
      // Pas besoin de supprimer le toast de chargement, il disparaîtra automatiquement
      
      // Afficher un toast de succès
      toast({
        title: "Demande envoyée avec succès!",
        description: "Votre numéro de référence: " + result.referenceNumber,
        variant: "default",
        duration: 5000,
      });
      
      // La sauvegarde des données utilisateur a été désactivée
      // Aucune donnée à effacer
      
      // Redirection vers la page de confirmation avec la référence
      // Essayons une redirection simple en forçant la navigation
      console.log("Référence générée:", result.referenceNumber);
      
      // Utiliser une redirection simple et directe
      window.location.href = `/confirmation/${result.referenceNumber}`;
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Les fonctionnalités de gestion du formulaire de contact
  // sont maintenant gérées par le composant ContactModal

  return (
    <div ref={topRef} className="min-h-screen bg-gray-50">
      {/* Initialisation des snippets Google au chargement de la page du formulaire */}
      <GoogleSnippetsInitializer page="/raccordement-enedis-new" triggerEvent="load" />
      <Helmet>
        <title>Portail en ligne de demande de raccordement Enedis</title>
        <meta name="description" content="Votre demande de raccordement Enedis en 3 étapes simples. Branchement électrique, mise en service compteur, augmentation de puissance, raccordement provisoire. Service rapide et sécurisé à 129,80€ TTC." />
        <meta name="keywords" content="raccordement Enedis, branchement électrique, mise en service compteur Linky, raccordement provisoire chantier, augmentation puissance électrique, raccordement maison neuve, démarche Enedis" />
        <meta property="og:title" content="Raccordement Enedis En Ligne | Procédure Simplifiée" />
        <meta property="og:description" content="Effectuez votre demande de raccordement Enedis en quelques minutes. Service complet d'assistance pour particuliers, professionnels et collectivités. Paiement sécurisé 129,80€ TTC." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Raccordement Enedis - Solution Simple et Rapide" />
        <meta name="twitter:description" content="Formulaire en ligne pour votre raccordement au réseau électrique Enedis. Accompagnement personnalisé à chaque étape pour particuliers et professionnels." />
        <link rel="canonical" href="https://www.raccordement.net/raccordement-enedis" />
        
        {/* Métadonnées supplémentaires pour cibler les recherches spécifiques */}
        <meta name="keywords" content="raccordement Enedis paiement, tarif raccordement électrique, prix branchement Enedis, formulaire raccordement Enedis, service raccordement électrique en ligne, paiement raccordement 129.80, démarches Enedis raccordement" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Services Enedis - Raccordement Électrique" />
        <meta name="dc.language" content="fr" />
        <meta name="dc.subject" content="Raccordement électrique, Enedis, branchement électricité, raccordement provisoire et définitif" />
        <meta name="dc.publisher" content="Services Enedis" />
        
        {/* Données structurées pour l'organisation */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Services Enedis - Raccordement Électrique",
          "url": "https://www.raccordement-elec.fr",
          "logo": "https://www.raccordement-elec.fr/logo.png",
          "description": "Service d'accompagnement pour vos démarches de raccordement au réseau électrique Enedis, mise en service et installation de compteur.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "FR"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+33-XX-XX-XX-XX",
            "contactType": "customer service",
            "availableLanguage": "French"
          },
          "potentialAction": {
            "@type": "Action",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.raccordement-elec.fr/raccordement-enedis"
            },
            "name": "Demande de raccordement électrique"
          },
          "offers": {
            "@type": "Offer",
            "price": "129.80",
            "priceCurrency": "EUR",
            "priceValidUntil": "2026-12-31",
            "itemOffered": {
              "@type": "Service",
              "name": "Service de raccordement Enedis",
              "description": "Service complet d'accompagnement pour votre raccordement au réseau électrique Enedis"
            }
          }
        }) }}
        />
        
        {/* Données structurées pour la page de service */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Raccordement Électrique Enedis",
          "provider": {
            "@type": "Organization",
            "name": "Services Enedis - Raccordement Électrique",
            "url": "https://www.raccordement.net"
          },
          "serviceType": "Raccordement électrique",
          "description": "Service d'accompagnement complet pour votre raccordement au réseau Enedis - définitif ou provisoire, pour particuliers et professionnels.",
          "offers": {
            "@type": "Offer",
            "price": "129.80",
            "priceCurrency": "EUR"
          },
          "termsOfService": "https://www.raccordement.net/conditions-generales",
          "serviceOutput": "Dossier de raccordement électrique complet et soumis à Enedis",
          "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": "https://www.raccordement.net/raccordement-enedis",
            "servicePhone": "+33-XX-XX-XX-XX",
            "servicePostalAddress": {
              "@type": "PostalAddress",
              "addressCountry": "FR"
            }
          }
        }) }}
        />
      </Helmet>
      
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[0.5cm] bg-blue-600 shadow-md"></div>
            <div className="pt-10">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" className="mr-3 text-[#2e3d96]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10"></path>
                  <path d="M12 20V4"></path>
                  <path d="M6 20v-6"></path>
                </svg>
                Demande de Raccordement Enedis
              </h1>

              <div className="bg-blue-50 border-l-4 border-[#33b060] p-4 mb-8 rounded-r-md w-full max-w-[calc(100%-2px)]">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Service de raccordement Enedis</h2>
                <p className="text-gray-700">
                  Notre service traite toutes les <strong>demandes de branchement électrique</strong> d'Enedis : raccordement définitif, 
                  raccordement provisoire de chantier, augmentation de puissance, déplacement de compteur Linky et mise en service. 
                  Nous gérons votre dossier administratif complet auprès du gestionnaire de réseau Enedis.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row mb-8">
              <div className="w-full lg:w-2/3 pr-0 lg:pr-6 transition-all duration-300 ease-in-out">
                <Form {...form}>
                  <form id="formulaire-raccordement" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Affichage conditionnel des étapes du formulaire */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="clientType"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="flex items-center gap-2 font-medium">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                  Type de client *
                                </FormLabel>
                                <FormControl>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                    {/* Carte Particulier - Layout horizontal selon la capture d'écran */}
                                    <div 
                                      className={`
                                        border rounded-lg p-2.5 flex items-center cursor-pointer transition-all duration-200 ease-in-out
                                        ${field.value === 'particulier' 
                                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm hover:scale-[1.01]'}
                                      `}
                                      onClick={() => field.onChange('particulier')}
                                    >
                                      {/* Icône à gauche dans un cercle */}
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2.5 transition-colors duration-200 ease-in-out ${field.value === 'particulier' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <User 
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      
                                      {/* Texte à droite */}
                                      <div className="flex flex-col space-y-0">
                                        <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'particulier' ? 'text-blue-700' : 'text-gray-700'}`}>Particulier</span>
                                        <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Raccordement électrique résidentiel</span>
                                      </div>
                                    </div>
                                    
                                    {/* Carte Professionnel - Layout horizontal selon la capture d'écran */}
                                    <div 
                                      className={`
                                        border rounded-lg p-2.5 flex items-center cursor-pointer transition-all duration-200 ease-in-out
                                        ${field.value === 'professionnel' 
                                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm hover:scale-[1.01]'}
                                      `}
                                      onClick={() => field.onChange('professionnel')}
                                    >
                                      {/* Icône à gauche dans un cercle */}
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2.5 transition-colors duration-200 ease-in-out ${field.value === 'professionnel' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Briefcase 
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      
                                      {/* Texte à droite */}
                                      <div className="flex flex-col space-y-0">
                                        <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'professionnel' ? 'text-blue-700' : 'text-gray-700'}`}>Professionnel</span>
                                        <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Raccordement pour entreprises</span>
                                      </div>
                                    </div>
                                    
                                    {/* Carte Collectivité - Layout horizontal selon la capture d'écran */}
                                    <div 
                                      className={`
                                        border rounded-lg p-2.5 flex items-center cursor-pointer transition-all duration-200 ease-in-out
                                        ${field.value === 'collectivite' 
                                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm hover:scale-[1.01]'}
                                      `}
                                      onClick={() => field.onChange('collectivite')}
                                    >
                                      {/* Icône à gauche dans un cercle */}
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2.5 transition-colors duration-200 ease-in-out ${field.value === 'collectivite' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Building 
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      
                                      {/* Texte à droite */}
                                      <div className="flex flex-col space-y-0">
                                        <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'collectivite' ? 'text-blue-700' : 'text-gray-700'}`}>Collectivité</span>
                                        <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Raccordement collectivités locales</span>
                                      </div>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="nom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<User className="h-4 w-4 text-blue-500" />}
                                  text="Nom"
                                  required={true}
                                  tooltip="Nom de la personne responsable de la gestion du raccordement"
                                />
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Votre nom" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 font-medium text-sm animate-fadeIn" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="prenom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<User className="h-4 w-4 text-blue-500" />}
                                  text="Prénom"
                                  required={true}
                                />
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Votre prénom" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 font-medium text-sm animate-fadeIn" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<Mail className="h-4 w-4 text-blue-500" />}
                                  text="Email"
                                  required={true}
                                />
                                <FormControl>
                                  <Input 
                                    placeholder="votre@email.com" 
                                    type="email"
                                    {...field} 
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    autoComplete="email"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 font-medium text-sm animate-fadeIn" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="telephone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<Phone className="h-4 w-4 text-blue-500" />}
                                  text="Téléphone"
                                  required={true}
                                />
                                <FormControl>
                                  <Input 
                                    placeholder="0123456789" 
                                    {...field} 
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    type="tel"
                                    autoComplete="tel"
                                    onChange={(e) => {
                                      // Format le numéro de téléphone
                                      const value = e.target.value.replace(/\D/g, '');
                                      field.onChange(value);
                                    }}
                                    maxLength={10}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 font-medium text-sm animate-fadeIn" />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('clientType') !== 'particulier' && (
                            <div className="animate-fadeIn space-y-4 p-4 border border-blue-100 rounded-lg bg-blue-50/50 col-span-2 w-full">
                              <div className="text-sm text-blue-800 mb-4 bg-blue-100 p-3 rounded-md shadow-sm">
                                <p className="font-medium text-blue-800">{form.watch('clientType') === 'professionnel' ? 'Informations professionnelles' : 'Informations de la collectivité'}</p>
                                <p className="text-xs mt-1">
                                  {form.watch('clientType') === 'professionnel' 
                                    ? "Ces informations nous permettront d'identifier votre entreprise et d'adapter notre service à vos besoins professionnels." 
                                    : "Ces informations nous permettront d'identifier votre collectivité locale et d'adapter notre service aux besoins spécifiques des établissements publics."}
                                </p>
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="societe"
                                render={({ field }) => (
                                  <FormItem className="relative">
                                    <FormLabel className={formLabelStyle}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                      </svg>
                                      {form.watch('clientType') === 'professionnel' ? 'Raison sociale ' : 'Nom de la collectivité '}
                                      <span className="text-red-500">*</span>
                                      <span className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150" 
                                        title={form.watch('clientType') === 'professionnel' 
                                          ? "Nom légal complet de votre entreprise tel qu'il apparaît sur votre KBIS"
                                          : "Nom officiel de votre collectivité (mairie, conseil départemental, etc.)"}>
                                        ?
                                      </span>
                                      {isSearchingCompanySiren && (
                                        <span className="ml-2 flex items-center">
                                          <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        </span>
                                      )}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <div className="flex">
                                          <Input 
                                            placeholder={form.watch('clientType') === 'professionnel' 
                                              ? "Nom de votre entreprise" 
                                              : "Nom de votre collectivité"}
                                            className="transition-all focus:ring-2 focus:ring-blue-100"
                                            {...field} 
                                            onChange={(e) => {
                                              field.onChange(e);
                                              // Réinitialiser les informations de l'entreprise lors de la modification
                                              if (companyInfo) {
                                                setCompanyInfo(null);
                                              }
                                              if (sirenError) {
                                                setSirenError(null);
                                              }
                                              
                                              // Recherche automatique après un délai pour éviter trop de requêtes
                                              if (e.target.value && e.target.value.length >= 3) {
                                                // Annuler le timer précédent s'il existe
                                                if (sirenSearchTimerRef.current) {
                                                  clearTimeout(sirenSearchTimerRef.current);
                                                }
                                                
                                                // Créer un nouveau timer
                                                sirenSearchTimerRef.current = setTimeout(() => {
                                                  searchCompanyForSiren(e.target.value);
                                                  sirenSearchTimerRef.current = null;
                                                }, 800);
                                              }
                                            }}
                                            onBlur={(e) => {
                                              // Rechercher automatiquement quand l'utilisateur quitte le champ
                                              if (e.target.value && e.target.value.length >= 3 && !isSearchingCompanySiren && !companyInfo) {
                                                searchCompanyForSiren(e.target.value);
                                              }
                                            }}
                                          />
                                          {isSearchingCompanySiren && (
                                            <div className="rounded-l-none border-l-0 bg-gray-50 border border-gray-200 flex items-center px-3">
                                              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            </div>
                                          )}
                                        </div>

                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="siren"
                                render={({ field }) => (
                                  <FormItem className="relative">
                                    <FormLabel>
                                      {form.watch('clientType') === 'professionnel' ? 'SIREN' : 'SIREN de la collectivité'}
                                      <span className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150" 
                                        title={form.watch('clientType') === 'professionnel' 
                                          ? "Le numéro SIREN est composé de 9 chiffres et correspond aux 9 premiers chiffres du SIRET. Vous pouvez le trouver sur votre KBIS." 
                                          : "Le numéro SIREN est composé de 9 chiffres. Pour les collectivités, vous pouvez le trouver sur vos documents officiels."}>
                                        ?
                                      </span>
                                    </FormLabel>
                                    {companyInfo && (
                                      <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-2 text-xs text-green-700">
                                        <p className="font-medium flex items-center">
                                          <svg className="mr-1 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                          </svg>
                                          Entreprise vérifiée
                                        </p>
                                        <p>{companyInfo.name}</p>
                                        <p className="text-green-600">{companyInfo.address}</p>
                                        <p className="mt-1 font-medium text-blue-600">SIREN complété automatiquement</p>
                                      </div>
                                    )}
                                    {sirenError && (
                                      <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2 text-xs text-red-700">
                                        <p className="font-medium">Erreur de vérification</p>
                                        <p>{sirenError}</p>
                                      </div>
                                    )}
                                    <FormControl>
                                      <div className="relative">
                                        <div className="flex">
                                          <Input 
                                            placeholder={form.watch('clientType') === 'professionnel' 
                                              ? "Numéro SIREN (9 chiffres)" 
                                              : "SIREN de la collectivité (9 chiffres)"}
                                            className="pl-8 transition-all focus:ring-2 focus:ring-blue-100"
                                            maxLength={9}
                                            onKeyPress={(e) => {
                                              if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                              }
                                            }}
                                            {...field} 
                                            onChange={(e) => {
                                              field.onChange(e);
                                              // Réinitialiser les informations de l'entreprise lors de la modification
                                              if (companyInfo) {
                                                setCompanyInfo(null);
                                              }
                                              if (sirenError) {
                                                setSirenError(null);
                                              }
                                              
                                              // Recherche automatique quand SIREN a 9 chiffres
                                              if (e.target.value.length === 9) {
                                                searchSirenInfo(e.target.value);
                                              }
                                            }}
                                          />
                                          {isLoadingSiren && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 9h16"/>
                                            <path d="M4 15h16"/>
                                            <path d="M10 3v18"/>
                                            <path d="M14 3v18"/>
                                          </svg>
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormDescription className="text-xs text-gray-500">
                                      <span>
                                        {(() => {
                                          const sirenValue = form.watch('siren');
                                          if (sirenValue && sirenValue.length > 0 && sirenValue.length < 9) {
                                            return (
                                              <span className="text-amber-600 font-medium">
                                                Il manque {9 - sirenValue.length} chiffres
                                              </span>
                                            );
                                          }
                                          return "Le SIREN est composé de 9 chiffres (les 9 premiers chiffres du SIRET)";
                                        })()}
                                      </span>
                                    </FormDescription>
                                    
                                    {/* Affichage des erreurs SIREN */}
                                    {sirenError && (
                                      <div className="mt-2 text-sm text-red-500 animate-fadeIn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                          <circle cx="12" cy="12" r="10"/>
                                          <line x1="12" y1="8" x2="12" y2="12"/>
                                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        {sirenError}
                                      </div>
                                    )}
                                    
                                    {/* Affichage des informations de l'entreprise si récupérées */}
                                    {companyInfo && (
                                      <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-md animate-fadeIn">
                                        <div className="flex items-start gap-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mt-0.5">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                          </svg>
                                          <div>
                                            <p className="text-sm font-medium text-green-700">{companyInfo.name}</p>
                                            <p className="text-xs text-green-600">{companyInfo.address}</p>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 mt-1 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 p-0"
                                              onClick={() => {
                                                form.setValue('societe', companyInfo.name);
                                                toast({
                                                  title: "Informations importées",
                                                  description: "Le nom de la société a été automatiquement rempli.",
                                                  duration: 3000,
                                                });
                                              }}
                                            >
                                              Utiliser ces informations
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-blue-600">Adresse du projet</h3>
                          <FormField
                            control={form.control}
                            name="adresse"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<MapPin className="h-4 w-4 text-blue-500" />}
                                  text="Adresse"
                                  required={true}
                                  tooltip="Indiquez l'adresse complète du raccordement (numéro, rue, code postal, ville). Cette adresse sera utilisée pour localiser votre projet."
                                />
                                <FormControl>
                                  <Input placeholder="Saisissez une adresse..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="complementAdresse"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complément d'adresse</FormLabel>
                                <FormControl>
                                  <Input placeholder="Étage, bâtiment, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="codePostal"
                              render={({ field }) => (
                                <FormItem className="relative">
                                  <FormLabel className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                    Code postal *
                                    <span className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150" title="Le code postal permet de rechercher automatiquement votre ville">
                                      ?
                                    </span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        placeholder="Exemple: 75001" 
                                        maxLength={5}
                                        onKeyPress={(e) => {
                                          if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                          }
                                        }}
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          if (e.target.value.length === 5) {
                                            fetchCities(e.target.value);
                                          }
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {field.value && field.value.length > 0 && field.value.length < 5 ? (
                                        <span className="text-amber-600 font-medium">
                                          Il manque {5 - field.value.length} chiffres
                                        </span>
                                      ) : (
                                        <span>Entrez votre code postal à 5 chiffres</span>
                                      )}
                                    </span>
                                    

                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="ville"
                              render={({ field }) => (
                                <FormItem className="relative">
                                  <FormLabel className={formLabelStyle}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                                      <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    Ville <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      {isLoadingCity ? (
                                        <div className="w-full h-10 border rounded-md flex items-center bg-gray-50 px-3">
                                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full inline-block"></span>
                                          <span className="text-gray-500">Recherche des villes...</span>
                                        </div>
                                      ) : isSaisingVilleManually ? (
                                        <Input 
                                          placeholder="Saisissez manuellement votre ville"
                                          {...field} 
                                        />
                                      ) : cityList.length > 1 ? (
                                        <Select
                                          onValueChange={(value) => field.onChange(value)}
                                          value={field.value}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionnez votre ville" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {cityList.map((city) => (
                                              <SelectItem key={city.code} value={city.nom}>
                                                {city.nom}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input 
                                          placeholder={form.watch('codePostal')?.length === 5 ? "Aucune ville trouvée" : "Saisissez d'abord un code postal"}
                                          {...field} 
                                          disabled={!isSaisingVilleManually && form.watch('codePostal')?.length !== 5}
                                        />
                                      )}
                                      {isLoadingCity && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </FormControl>
                                  
                                  {/* Version mobile du bouton de saisie manuelle - taille réduite au minimum */}
                                  <div className="block md:hidden mt-0.5">
                                    <button
                                      type="button"
                                      style={{ fontSize: '8px', lineHeight: '10px', padding: '2px 4px' }}
                                      className={`w-full flex items-center justify-center gap-0.5 rounded ${
                                        isSaisingVilleManually 
                                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                                      }`}
                                      onClick={() => {
                                        const newState = !isSaisingVilleManually;
                                        setIsSaisingVilleManually(newState);
                                        if (!newState && cityList.length === 1) {
                                          form.setValue('ville', cityList[0].nom);
                                        }
                                      }}
                                    >
                                      {isSaisingVilleManually ? (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                          <span className="font-medium">Saisie manuelle activée</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                          </svg>
                                          <span className="font-medium">Ville non trouvée ? Saisie manuelle</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  
                                  {/* Version desktop avec toggle professionnel comme dans la capture d'écran */}
                                  <div className="hidden md:block mt-0.5">
                                    <div 
                                      className="flex items-center justify-between py-1 px-2 border rounded border-gray-200 bg-white cursor-pointer"
                                      onClick={() => {
                                        const newState = !isSaisingVilleManually;
                                        setIsSaisingVilleManually(newState);
                                        if (!newState && cityList.length === 1) {
                                          form.setValue('ville', cityList[0].nom);
                                        }
                                      }}
                                    >
                                      <span className="text-xs font-medium flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Saisie manuelle de la ville
                                      </span>
                                      <div className="relative inline-block w-10 h-5">
                                        <div 
                                          className={`w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${
                                            isSaisingVilleManually ? 'bg-blue-500' : 'bg-gray-300'
                                          }`}
                                        ></div>
                                        <div 
                                          className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                                            isSaisingVilleManually ? 'translate-x-5' : ''
                                          }`}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {cityList.length > 0 && (
                                    <FormDescription className="text-xs text-green-600 font-medium mt-1.5">
                                      {cityList.length === 1 
                                        ? "Ville trouvée automatiquement" 
                                        : `${cityList.length} villes trouvées pour ce code postal`}
                                    </FormDescription>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Champ référence cadastrale supprimé comme demandé */}
                        </div>
                        
                        <div className="space-y-4 mt-4 sm:mt-8">
                          <h3 className="text-lg font-medium text-blue-600 mb-2 sm:mb-4">Détails techniques</h3>
                          
                          <FormField
                            control={form.control}
                            name="typeRaccordement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabelWithIcon
                                  icon={<Home className="h-4 w-4 text-blue-500" />}
                                  text="Type de raccordement"
                                  required={true}
                                  tooltip="Choisissez le type de raccordement qui correspond à votre besoin"
                                />
                                <FormControl>
                                  <div className="type-options-container">
                                    {/* Style unifié pour toutes tailles d'écran */}
                                    <div className="block">
                                      <div className="flex flex-col space-y-0 divide-y divide-gray-100 max-w-md border border-gray-200 rounded-lg overflow-hidden">
                                        {[
                                          { id: 'new_connection', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                              <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                              <circle cx="8" cy="18" r="1"></circle>
                                              <circle cx="16" cy="18" r="1"></circle>
                                            </svg>
                                          ), label: 'Nouveau raccordement', description: 'Première installation électrique pour un bâtiment neuf' },
                                          { id: 'power_upgrade', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M12 17V3"></path>
                                              <path d="m6 11 6-6 6 6"></path>
                                              <path d="M19 21H5"></path>
                                            </svg>
                                          ), label: 'Augmentation de puissance', description: 'Modifier la puissance disponible d\'une installation existante' },
                                          { id: 'temporary_connection', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect width="18" height="12" x="3" y="8" rx="2"></rect>
                                              <path d="M12 8v12"></path>
                                              <path d="M3 14h18"></path>
                                              <path d="M14 4a2 2 0 0 0-2-2H8.5a2.5 2.5 0 0 0 0 5H10"></path>
                                              <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                                            </svg>
                                          ), label: 'Raccordement provisoire', description: 'Installation temporaire pour chantier ou événement' },
                                          { id: 'meter_relocation', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M8 21h8"></path>
                                              <path d="M12 21v-5"></path>
                                              <path d="M12 3v5"></path>
                                              <path d="M20.5 9.5 16 16"></path>
                                              <path d="m4 16 4.5-6.5"></path>
                                              <path d="M20.5 14.5 16 8"></path>
                                              <path d="m4 8 4.5 6.5"></path>
                                            </svg>
                                          ), label: 'Déplacement de compteur', description: 'Modifier l\'emplacement de votre compteur existant' },
                                          { id: 'other', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <circle cx="12" cy="12" r="10"></circle>
                                              <path d="M12 16v-4"></path>
                                              <path d="M12 8h.01"></path>
                                            </svg>
                                          ), label: 'Autre demande', description: 'Demande spécifique non listée ci-dessus' }
                                        ].map(option => (
                                          <div
                                            key={option.id}
                                            className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === option.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => field.onChange(option.id)}
                                          >
                                            <div className="flex items-start">
                                              <div className="flex-shrink-0 mr-3">
                                                <div className={`w-5 h-5 ${field.value === option.id ? 'text-blue-500' : 'text-gray-500'}`}>
                                                  {option.icon}
                                                </div>
                                              </div>
                                              <div className="flex-1">
                                                <div className="font-medium">{option.label}</div>
                                                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                              </div>
                                              {field.value === option.id && (
                                                <div className="ml-auto">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                                    <path d="M20 6 9 17l-5-5" />
                                                  </svg>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Tablettes et Desktop: Même style que mobile */}
                                    <div className="hidden sm:block">
                                      <div className="flex flex-col space-y-0 divide-y divide-gray-100 max-w-2xl border border-gray-200 rounded-lg overflow-hidden">
                                        {[
                                          { id: 'new_connection', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                              <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                              <circle cx="8" cy="18" r="1"></circle>
                                              <circle cx="16" cy="18" r="1"></circle>
                                            </svg>
                                          ), label: 'Nouveau raccordement', description: 'Première installation électrique pour un bâtiment neuf' },
                                          { id: 'power_upgrade', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M12 17V3"></path>
                                              <path d="m6 11 6-6 6 6"></path>
                                              <path d="M19 21H5"></path>
                                            </svg>
                                          ), label: 'Augmentation de puissance', description: 'Modifier la puissance disponible d\'une installation existante' },
                                          { id: 'temporary_connection', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect width="18" height="12" x="3" y="8" rx="2"></rect>
                                              <path d="M12 8v12"></path>
                                              <path d="M3 14h18"></path>
                                              <path d="M14 4a2 2 0 0 0-2-2H8.5a2.5 2.5 0 0 0 0 5H10"></path>
                                              <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                                            </svg>
                                          ), label: 'Raccordement provisoire', description: 'Installation temporaire pour chantier ou événement' },
                                          { id: 'meter_relocation', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M8 21h8"></path>
                                              <path d="M12 21v-5"></path>
                                              <path d="M12 3v5"></path>
                                              <path d="M20.5 9.5 16 16"></path>
                                              <path d="m4 16 4.5-6.5"></path>
                                              <path d="M20.5 14.5 16 8"></path>
                                              <path d="m4 8 4.5 6.5"></path>
                                            </svg>
                                          ), label: 'Déplacement de compteur', description: 'Modifier l\'emplacement de votre compteur existant' },
                                          { id: 'other', icon: (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <circle cx="12" cy="12" r="10"></circle>
                                              <path d="M12 16v-4"></path>
                                              <path d="M12 8h.01"></path>
                                            </svg>
                                          ), label: 'Autre demande', description: 'Demande spécifique non listée ci-dessus' }
                                        ].map(option => (
                                          <div
                                            key={option.id}
                                            className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === option.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => field.onChange(option.id)}
                                          >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'new_connection' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                            <circle cx="8" cy="18" r="1"></circle>
                                            <circle cx="16" cy="18" r="1"></circle>
                                          </svg>
                                        </div>
                                        <div className="text-center text-sm font-medium">Nouveau raccordement</div>
                                        <p className="text-center text-[10px] text-gray-500 mt-1">Première installation électrique pour un bâtiment neuf</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'power_upgrade' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('power_upgrade')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'power_upgrade' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M12 17V3"></path>
                                            <path d="m6 11 6-6 6 6"></path>
                                            <path d="M19 21H5"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center text-sm font-medium">Augmentation de puissance</div>
                                        <p className="text-center text-[10px] text-gray-500 mt-1">Modifier la puissance disponible d'une installation existante</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'temporary_connection' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('temporary_connection')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'temporary_connection' ? 'text-blue-500' : 'text-gray-500'}>
                                            <rect width="18" height="12" x="3" y="8" rx="2"></rect>
                                            <path d="M12 8v12"></path>
                                            <path d="M3 14h18"></path>
                                            <path d="M14 4a2 2 0 0 0-2-2H8.5a2.5 2.5 0 0 0 0 5H10"></path>
                                            <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center text-sm font-medium">Raccordement provisoire</div>
                                        <p className="text-center text-[10px] text-gray-500 mt-1">Installation temporaire pour chantier ou événement</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'meter_relocation' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('meter_relocation')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'meter_relocation' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M8 21h8"></path>
                                            <path d="M12 21v-5"></path>
                                            <path d="M12 3v5"></path>
                                            <path d="M20.5 9.5 16 16"></path>
                                            <path d="m4 16 4.5-6.5"></path>
                                            <path d="M20.5 14.5 16 8"></path>
                                            <path d="m4 8 4.5 6.5"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center text-sm font-medium">Déplacement de compteur</div>
                                        <p className="text-center text-[10px] text-gray-500 mt-1">Modifier l'emplacement de votre compteur existant</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'other' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('other')}
                                        style={{ gridColumn: "1 / span 2" }}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'other' ? 'text-blue-500' : 'text-gray-500'}>
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center text-sm font-medium">Autre demande</div>
                                        <p className="text-center text-[10px] text-gray-500 mt-1">Demande spécifique non listée ci-dessus</p>
                                      </div>
                                    </div>
                                    
                                    {/* Desktop: Mode grille 3 colonnes avec icônes plus grandes */}
                                    <div className="hidden md:grid grid-cols-3 gap-3">
                                      <div
                                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'new_connection' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('new_connection')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'new_connection' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                            <circle cx="8" cy="18" r="1"></circle>
                                            <circle cx="16" cy="18" r="1"></circle>
                                          </svg>
                                        </div>
                                        <div className="text-center font-medium">Nouveau raccordement</div>
                                        <p className="text-center text-xs text-gray-500 mt-1 px-2">Première installation électrique pour un bâtiment neuf</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'power_upgrade' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('power_upgrade')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'power_upgrade' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M12 17V3"></path>
                                            <path d="m6 11 6-6 6 6"></path>
                                            <path d="M19 21H5"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center font-medium">Augmentation de puissance</div>
                                        <p className="text-center text-xs text-gray-500 mt-1 px-2">Modifier la puissance disponible d'une installation existante</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'temporary_connection' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('temporary_connection')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'temporary_connection' ? 'text-blue-500' : 'text-gray-500'}>
                                            <rect width="18" height="12" x="3" y="8" rx="2"></rect>
                                            <path d="M12 8v12"></path>
                                            <path d="M3 14h18"></path>
                                            <path d="M14 4a2 2 0 0 0-2-2H8.5a2.5 2.5 0 0 0 0 5H10"></path>
                                            <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center font-medium">Raccordement provisoire</div>
                                        <p className="text-center text-xs text-gray-500 mt-1 px-2">Installation temporaire pour chantier ou événement</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'meter_relocation' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('meter_relocation')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'meter_relocation' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M8 21h8"></path>
                                            <path d="M12 21v-5"></path>
                                            <path d="M12 3v5"></path>
                                            <path d="M20.5 9.5 16 16"></path>
                                            <path d="m4 16 4.5-6.5"></path>
                                            <path d="M20.5 14.5 16 8"></path>
                                            <path d="m4 8 4.5 6.5"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center font-medium">Déplacement de compteur</div>
                                        <p className="text-center text-xs text-gray-500 mt-1 px-2">Modifier l'emplacement de votre compteur existant</p>
                                      </div>
                                      
                                      <div
                                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow flex flex-col items-center type-option-item ${field.value === 'other' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => field.onChange('other')}
                                      >
                                        <div className="flex justify-center mb-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'other' ? 'text-blue-500' : 'text-gray-500'}>
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M12 16v-4"></path>
                                            <path d="M12 8h.01"></path>
                                          </svg>
                                        </div>
                                        <div className="text-center font-medium">Autre demande</div>
                                        <p className="text-center text-xs text-gray-500 mt-1 px-2">Demande spécifique non listée ci-dessus</p>
                                      </div>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('typeRaccordement') === 'temporary_connection' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="dateDebutRaccordementProvisoire"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date de début souhaitée *</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="dateFinRaccordementProvisoire"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date de fin souhaitée *</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          
                          {form.watch('typeRaccordement') === 'meter_relocation' && (
                            <>
                              <FormField
                                control={form.control}
                                name="numeroPDL"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Numéro PDL actuel</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Point de livraison à 14 chiffres" {...field} disabled={form.watch('pdlInconnu')} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="pdlInconnu"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-2">
                                    <FormControl>
                                      <AdaptiveCheckbox
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                        id="pdl-inconnu"
                                        className="mt-0.5" 
                                      />
                                    </FormControl>
                                    <div className="leading-tight">
                                      <FormLabel htmlFor="pdl-inconnu" className="text-sm">
                                        Je ne connais pas mon numéro PDL
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                          
                          {form.watch('typeRaccordement') === 'other' && (
                            <FormField
                              control={form.control}
                              name="autreTypeDescription"
                              render={({ field }) => (
                                <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn">
                                  <FormLabel className="flex items-center gap-2 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500">
                                      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path>
                                      <path d="M9 9h1"></path>
                                      <path d="M9 13h6"></path>
                                      <path d="M9 17h6"></path>
                                    </svg>
                                    Description de votre demande <span className="text-red-500">*</span>
                                    <span 
                                      className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
                                      title="Décrivez précisément votre demande spécifique pour que nous puissions vous accompagner au mieux"
                                    >
                                      ?
                                    </span>
                                  </FormLabel>
                                  <div className="text-sm text-blue-700 mb-4">
                                    Merci de détailler votre demande particulière afin que nous puissions l'étudier avec attention et vous proposer la solution la plus adaptée à votre situation.
                                  </div>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Veuillez décrire votre demande spécifique (puissance, contraintes techniques, délais souhaités...)" 
                                      {...field} 
                                      rows={4}
                                      className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-100"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <FormField
                            control={form.control}
                            name="typeBatiment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={formLabelStyle}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                    <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
                                    <path d="M2 10h20"></path>
                                    <path d="M8 2v6"></path>
                                    <path d="M16 2v6"></path>
                                  </svg>
                                  Type de projet <span className="text-red-500">*</span>
                                  <span 
                                    className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
                                    title="Le type de projet permet de déterminer les caractéristiques techniques du raccordement"
                                  >
                                    ?
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <div className="flex flex-col space-y-0 divide-y divide-gray-100 max-w-md border border-gray-200 rounded-lg overflow-hidden">
                                    <div
                                      className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === 'individual_house' ? 'bg-blue-50' : ''}`}
                                      onClick={() => field.onChange('individual_house')}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'individual_house' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Maison individuelle</div>
                                          <p className="text-xs text-gray-500 mt-1">Logement familial</p>
                                        </div>
                                        {field.value === 'individual_house' && (
                                          <div className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div
                                      className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === 'apartment_building' ? 'bg-blue-50' : ''}`}
                                      onClick={() => field.onChange('apartment_building')}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'apartment_building' ? 'text-blue-500' : 'text-gray-500'}>
                                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                            <path d="M9 22v-4h6v4"></path>
                                            <path d="M8 6h.01"></path>
                                            <path d="M16 6h.01"></path>
                                            <path d="M8 10h.01"></path>
                                            <path d="M16 10h.01"></path>
                                            <path d="M8 14h.01"></path>
                                            <path d="M16 14h.01"></path>
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Immeuble collectif</div>
                                          <p className="text-xs text-gray-500 mt-1">Plusieurs logements</p>
                                        </div>
                                        {field.value === 'apartment_building' && (
                                          <div className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div
                                      className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === 'commercial' ? 'bg-blue-50' : ''}`}
                                      onClick={() => field.onChange('commercial')}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'commercial' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M3 3v18h18"></path>
                                            <path d="M7 17V9"></path>
                                            <path d="M11 17V6"></path>
                                            <path d="M15 17v-5"></path>
                                            <path d="M19 17v-2"></path>
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Local commercial</div>
                                          <p className="text-xs text-gray-500 mt-1">Commerce/Bureau</p>
                                        </div>
                                        {field.value === 'commercial' && (
                                          <div className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div
                                      className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === 'industrial' ? 'bg-blue-50' : ''}`}
                                      onClick={() => field.onChange('industrial')}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'industrial' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"></path>
                                            <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"></path>
                                            <path d="M18 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path>
                                            <path d="M18 12h4"></path>
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Bâtiment industriel</div>
                                          <p className="text-xs text-gray-500 mt-1">Forte puissance</p>
                                        </div>
                                        {field.value === 'industrial' && (
                                          <div className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div
                                      className={`bg-white cursor-pointer transition-all hover:bg-gray-50 p-3 ${field.value === 'terrain' ? 'bg-blue-50' : ''}`}
                                      onClick={() => field.onChange('terrain')}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-3">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={field.value === 'terrain' ? 'text-blue-500' : 'text-gray-500'}>
                                            <path d="M2 22l14-14"></path>
                                            <path d="M8 22l14-14"></path>
                                            <path d="M17 22l5-5"></path>
                                            <path d="M2 8l10 10"></path>
                                            <path d="M2 2l20 20"></path>
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium">Terrain nu</div>
                                          <p className="text-xs text-gray-500 mt-1">Sans construction</p>
                                        </div>
                                        {field.value === 'terrain' && (
                                          <div className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('typeBatiment') === 'terrain' && (
                            <FormField
                              control={form.control}
                              name="terrainViabilise"
                              render={({ field }) => (
                                <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn">
                                  <FormLabel className={formLabelStyle}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                                      <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                                      <path d="M12 12v3"></path>
                                      <path d="M10 7h4"></path>
                                      <path d="M2 21h20"></path>
                                      <path d="M19 21v-1a2 2 0 0 0-2-2h-3"></path>
                                      <path d="M5 21v-1a2 2 0 0 1 2-2h3"></path>
                                    </svg>
                                    Le terrain est-il viabilisé ? <span className="text-red-500">*</span>
                                    <span 
                                      className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
                                      title="Un terrain viabilisé dispose déjà des accès aux différents réseaux (eau, électricité, etc.)"
                                    >
                                      ?
                                    </span>
                                  </FormLabel>
                                  <div className="text-sm text-blue-700 mb-4">
                                    Un terrain viabilisé est déjà relié aux réseaux d'eau, d'électricité et d'assainissement. Cela impacte grandement le coût et le délai de votre raccordement.
                                  </div>
                                  <FormControl>
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 type-options-container">
                                      <div
                                        className={`flex gap-2 items-center p-2.5 border rounded-lg cursor-pointer transition-all ${field.value === 'viabilise' ? 'bg-green-50 border-green-300 shadow' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                        onClick={() => field.onChange('viabilise')}
                                      >
                                        <div className={`rounded-full w-4 h-4 flex items-center justify-center ${field.value === 'viabilise' ? 'bg-green-500' : 'border border-gray-300'}`}>
                                          {field.value === 'viabilise' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">Oui</div>
                                          <div className="text-xs text-gray-500 leading-tight">Le terrain est déjà viabilisé</div>
                                        </div>
                                      </div>
                                      
                                      <div
                                        className={`flex gap-2 items-center p-2.5 border rounded-lg cursor-pointer transition-all ${field.value === 'non_viabilise' ? 'bg-amber-50 border-amber-300 shadow' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                        onClick={() => field.onChange('non_viabilise')}
                                      >
                                        <div className={`rounded-full w-4 h-4 flex items-center justify-center ${field.value === 'non_viabilise' ? 'bg-amber-500' : 'border border-gray-300'}`}>
                                          {field.value === 'non_viabilise' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">Non</div>
                                          <div className="text-xs text-gray-500 leading-tight">Le terrain n'est pas encore viabilisé</div>
                                        </div>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          

                          
                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="typePhase"
                              render={({ field }) => (
                                <FormItem className="mb-4">
                                  <FormLabel className={formLabelStyle}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                    <path d="M18 16.6V19a2 2 0 0 1-2 2h-3.2a2 2 0 0 1-2-2v-2"></path>
                                    <path d="M18 8V5a2 2 0 0 0-2-2h-3.2a2 2 0 0 0-2 2v2"></path>
                                    <path d="M5 8h11a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"></path>
                                  </svg>
                                  Type d'alimentation <span className="text-red-500">*</span>
                                </FormLabel>
                                  <FormControl>
                                    <RadioGroup 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        // Réinitialiser la puissance si on change de phase
                                        if (value === 'monophase') {
                                          form.setValue('puissanceDemandee', '9');
                                        } else if (value === 'triphase') {
                                          form.setValue('puissanceDemandee', '12');
                                        } else {
                                          form.setValue('puissanceDemandee', '');
                                        }
                                      }}
                                      defaultValue={field.value}
                                      className="flex flex-col xs:flex-row flex-wrap gap-2 w-full type-options-container"
                                    >
                                      <Label htmlFor="monophase" className="w-full xs:flex-1 min-w-0 xs:min-w-[160px] type-alimentation-option">
                                        <div className={`relative flex items-center border rounded-md p-2 py-3 cursor-pointer transition-all duration-200 ease-in-out ${field.value === 'monophase' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm hover:scale-[1.01]'}`}>
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors duration-200 ease-in-out ${field.value === 'monophase' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Zap className="h-3.5 w-3.5" />
                                          </div>
                                          <div className="flex flex-col space-y-0">
                                            <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'monophase' ? 'text-blue-700' : 'text-gray-700'}`}>Monophasé</span>
                                            <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Habitations standard (3-9 kVA)</span>
                                          </div>
                                          <RadioGroupItem value="monophase" id="monophase" className="sr-only" />
                                        </div>
                                      </Label>
                                      <Label htmlFor="triphase" className="w-full xs:flex-1 min-w-0 xs:min-w-[160px] type-alimentation-option">
                                        <div className={`relative flex items-center border rounded-md p-2 py-3 cursor-pointer transition-all duration-200 ease-in-out ${field.value === 'triphase' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm hover:scale-[1.01]'}`}>
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors duration-200 ease-in-out ${field.value === 'triphase' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Bolt className="h-3.5 w-3.5" />
                                          </div>
                                          <div className="flex flex-col space-y-0">
                                            <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'triphase' ? 'text-blue-700' : 'text-gray-700'}`}>Triphasé</span>
                                            <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Puissances élevées (12-36 kVA)</span>
                                          </div>
                                          <RadioGroupItem value="triphase" id="triphase" className="sr-only" />
                                        </div>
                                      </Label>
                                      <Label htmlFor="je_ne_sais_pas" className="w-full xs:flex-1 min-w-0 xs:min-w-[160px] type-alimentation-option">
                                        <div className={`relative flex items-center border rounded-md p-2 py-3 cursor-pointer transition-all duration-200 ease-in-out ${field.value === 'je_ne_sais_pas' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 hover:shadow-sm hover:scale-[1.01]'}`}>
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors duration-200 ease-in-out ${field.value === 'je_ne_sais_pas' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Info className="h-3.5 w-3.5" />
                                          </div>
                                          <div className="flex flex-col space-y-0">
                                            <span className={`font-medium text-sm transition-colors duration-200 ease-in-out ${field.value === 'je_ne_sais_pas' ? 'text-orange-700' : 'text-gray-700'}`}>Je ne sais pas</span>
                                            <span className="text-xs text-gray-500 transition-opacity duration-200 ease-in-out">Un expert vous conseillera</span>
                                          </div>
                                          <RadioGroupItem value="je_ne_sais_pas" id="je_ne_sais_pas" className="sr-only" />
                                        </div>
                                      </Label>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Affichage conditionnel du champ puissance */}
                            {form.watch('typePhase') && ['monophase', 'triphase'].includes(form.watch('typePhase') || '') && (
                              <FormField
                                control={form.control}
                                name="puissanceDemandee"
                                render={({ field }) => (
                                  <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn mt-4">
                                    <FormLabel className="flex items-center gap-2 font-medium">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500">
                                        <path d="M12 13V2l8 4-8 4"></path>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <path d="M12 22v-3"></path>
                                        <path d="M8 22v-7"></path>
                                        <path d="M16 22v-7"></path>
                                      </svg>
                                      Puissance demandée (kVA) <span className="text-red-500">*</span>
                                      <span 
                                        className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
                                        title="Puissance électrique nécessaire à votre installation. Dépend de vos équipements et usages."
                                      >
                                        ?
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="bg-white">
                                          <SelectValue placeholder="Sélectionnez la puissance" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {form.watch('typePhase') === 'monophase' ? (
                                            <>
                                              <SelectItem value="3">3 kVA</SelectItem>
                                              <SelectItem value="6">6 kVA</SelectItem>
                                              <SelectItem value="9">9 kVA</SelectItem>
                                              <SelectItem value="12">12 kVA</SelectItem>
                                            </>
                                          ) : (
                                            <>
                                              <SelectItem value="12">12 kVA</SelectItem>
                                              <SelectItem value="18">18 kVA</SelectItem>
                                              <SelectItem value="24">24 kVA</SelectItem>
                                              <SelectItem value="36">36 kVA</SelectItem>
                                              <SelectItem value="36-jaune" className="bg-yellow-50 text-yellow-800 border-t border-yellow-200 pt-1 mt-1">
                                                <div className="flex items-center">
                                                  <span className="font-medium">36 kVA - Tarif Jaune</span>
                                                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-yellow-200 text-yellow-800">PRO</span>
                                                </div>
                                              </SelectItem>
                                            </>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          

                        </div>
                      </div>
                    )}
                    
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Récapitulatif des informations saisies */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm mb-6">
                          <h3 className="text-lg font-medium text-blue-700 flex items-center gap-2 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                              <path d="m9 14 2 2 4-4"></path>
                            </svg>
                            Récapitulatif de votre demande
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Informations personnelles */}
                            <div className="space-y-3 md:border-r md:border-blue-200 md:pr-4">
                              <h4 className="font-medium text-blue-600 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Vos coordonnées
                              </h4>
                              <div className="text-sm space-y-1.5">
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Nom:</span> 
                                  <span className="font-medium">{form.watch('nom')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Prénom:</span> 
                                  <span className="font-medium">{form.watch('prenom')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Email:</span> 
                                  <span className="font-medium">{form.watch('email')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Téléphone:</span> 
                                  <span className="font-medium">{form.watch('telephone')}</span>
                                </p>
                                {form.watch('clientType') !== 'particulier' && (
                                  <>
                                    <p className="flex justify-between">
                                      <span className="text-gray-600">Société:</span> 
                                      <span className="font-medium">{form.watch('societe')}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span className="text-gray-600">SIREN:</span> 
                                      <span className="font-medium">{form.watch('siren')}</span>
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Détails du projet */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-blue-600 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 3h20"></path>
                                  <path d="M20 3v18"></path>
                                  <path d="M4 3v18"></path>
                                  <path d="M4 7h16"></path>
                                </svg>
                                Détails du projet
                              </h4>
                              <div className="text-sm space-y-1.5">
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Adresse:</span> 
                                  <span className="font-medium truncate max-w-[180px]">{form.watch('adresse')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Code postal:</span> 
                                  <span className="font-medium">{form.watch('codePostal')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Ville:</span> 
                                  <span className="font-medium">{form.watch('ville')}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-gray-600">Type:</span> 
                                  <span className="font-medium">{
                                    form.watch('typeRaccordement') === 'new_connection' ? 'Nouveau raccordement' :
                                    form.watch('typeRaccordement') === 'power_upgrade' ? 'Augmentation de puissance' :
                                    form.watch('typeRaccordement') === 'temporary_connection' ? 'Raccordement provisoire' :
                                    form.watch('typeRaccordement') === 'meter_relocation' ? 'Déplacement de compteur' : 'Autre'
                                  }</span>
                                </p>
                                {form.watch('typePhase') !== 'je_ne_sais_pas' && (
                                  <p className="flex justify-between">
                                    <span className="text-gray-600">Alimentation:</span> 
                                    <span className="font-medium">{
                                      form.watch('typePhase') === 'monophase' ? 'Monophasé' :
                                      form.watch('typePhase') === 'triphase' ? 'Triphasé' : ''
                                    }</span>
                                  </p>
                                )}
                                {form.watch('puissanceDemandee') && form.watch('typePhase') !== 'je_ne_sais_pas' && (
                                  <p className="flex justify-between">
                                    <span className="text-gray-600">Puissance:</span> 
                                    <span className="font-medium">{form.watch('puissanceDemandee')} kVA</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-blue-200 text-center">
                            <button 
                              type="button"
                              onClick={() => setCurrentStep(1)}
                              className="text-blue-600 text-sm font-medium hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              Modifier mes informations
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-blue-600">Informations complémentaires</h3>
                          
                          <FormField
                            control={form.control}
                            name="etatProjet"
                            render={({ field }) => (
                              <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn mb-6">
                                <FormLabel className="flex items-center gap-2 font-medium">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                    <line x1="9" y1="21" x2="9" y2="9"></line>
                                  </svg>
                                  État du projet <span className="text-red-500">*</span>
                                  <span 
                                    className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs cursor-help hover:bg-blue-200 transition-colors duration-150"
                                    title="Indiquez où en est le projet actuellement (planification, permis en cours, construction démarrée, etc.)"
                                  >
                                    ?
                                  </span>
                                </FormLabel>
                                <p className="text-xs text-blue-700 mb-3">
                                  Cette information nous permettra d'adapter nos démarches à l'avancement de votre projet.
                                </p>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Sélectionnez l'état de votre projet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="planning">En phase de planification</SelectItem>
                                      <SelectItem value="construction_started">En cours de réalisation</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('etatProjet') && ['construction_started'].includes(form.watch('etatProjet') || '') && (
                            <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg border border-blue-100 mb-5 sm:mb-6 animate-fadeIn">
                              <h4 className="text-blue-700 font-medium mb-2 sm:mb-3 flex items-center gap-1.5 text-sm sm:text-base">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                  <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                                </svg>
                                Informations du permis de construire
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="numeroPermis"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Numéro de permis de construire</FormLabel>
                                        <FormControl>
                                          <Input placeholder="PC 123456789" {...field} className="bg-white" disabled={form.watch('ignorerPermisConstruction')} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="datePermis"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date de délivrance</FormLabel>
                                        <FormControl>
                                          <Input type="date" {...field} className="bg-white" disabled={form.watch('ignorerPermisConstruction')} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="ignorerPermisConstruction"
                                  render={({ field }) => (
                                    <FormItem className="mt-1">
                                      <div 
                                        className={`flex flex-row items-start space-x-2 space-y-0 p-2 ${field.value ? 'bg-blue-100/50' : 'bg-white'} border border-blue-100 rounded-lg cursor-pointer transition-all duration-200 ease-in-out`}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value} 
                                            onCheckedChange={(checked) => field.onChange(checked === true)}
                                            id="ignorer-permis" 
                                            className="mt-0.5"
                                          />
                                        </FormControl>
                                        <div 
                                          className="leading-tight w-full cursor-pointer"
                                          onClick={() => {
                                            field.onChange(!field.value);
                                          }}
                                        >
                                          <span className="text-xs sm:text-sm font-medium">
                                            Je ne connais pas les informations du permis de construire
                                          </span>
                                        </div>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          <FormField
                            control={form.control}
                            name="delaiRaccordement"
                            render={({ field }) => (
                              <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn mb-6">
                                <FormLabel className="text-blue-600 font-medium">Délai de raccordement souhaité *</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Sélectionnez un délai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="less-1.5m">Moins d'un mois</SelectItem>
                                      <SelectItem value="1.5m">1 mois et demi</SelectItem>
                                      <SelectItem value="1.5-3m">Entre 1 et 3 mois</SelectItem>
                                      <SelectItem value="3-6m">Entre 3 et 6 mois</SelectItem>
                                      <SelectItem value="6m+">Plus de 6 mois</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="avezVousArchitecte"
                            render={({ field }) => (
                              <FormItem className="mb-6">
                                <div 
                                  className={`flex flex-row items-center justify-between py-3 px-4 border ${field.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'} rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-150`}
                                  onClick={() => field.onChange(!field.value)}
                                >
                                  <span className="text-xs sm:text-sm font-medium">
                                    J'ai un architecte pour ce projet
                                  </span>
                                  <FormControl>
                                    <ToggleIconButton
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      colorScheme="blue"
                                      size="sm"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('avezVousArchitecte') === true && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50/40 animate-fadeIn">
                              <div className="col-span-1 md:col-span-2 flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-blue-500">
                                  <path d="M2 3h20"></path>
                                  <path d="M21 3v18H3V3"></path>
                                  <path d="M7 3v18"></path>
                                  <path d="M17 9h-4"></path>
                                  <path d="M17 14h-4"></path>
                                </svg>
                                <h3 className="text-sm font-medium text-blue-700">Informations de votre architecte</h3>
                              </div>
                            
                              <FormField
                                control={form.control}
                                name="nomArchitecte"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-blue-700 text-xs font-medium">Nom de l'architecte ou de la société</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Nom et prénom ou nom de société" 
                                        {...field} 
                                        className="border-blue-200 focus:border-blue-400 bg-white"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="telephoneArchitecte"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-blue-700 text-xs font-medium">Téléphone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="0123456789" 
                                        {...field} 
                                        className="border-blue-200 focus:border-blue-400 bg-white"
                                        type="tel"
                                        autoComplete="tel"
                                        onChange={(e) => {
                                          // Format le numéro de téléphone
                                          const value = e.target.value.replace(/\D/g, '');
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="emailArchitecte"
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel className="text-blue-700 text-xs font-medium">Email</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="architecte@exemple.com" 
                                        {...field} 
                                        className="border-blue-200 focus:border-blue-400 bg-white"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          
                          <FormField
                            control={form.control}
                            name="adresseFacturationDifferente"
                            render={({ field }) => (
                              <FormItem className="mb-6">
                                <div 
                                  className={`flex flex-row items-center justify-between py-3 px-4 border ${field.value ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'} rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-all duration-150`}
                                  onClick={() => field.onChange(!field.value)}
                                >
                                  <span className="text-xs sm:text-sm font-medium">
                                    Utiliser une adresse de facturation différente
                                  </span>
                                  <FormControl>
                                    <ToggleIconButton
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => field.onChange(checked)}
                                      colorScheme="green"
                                      size="sm"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {form.watch('adresseFacturationDifferente') === true && (
                            <div className="grid grid-cols-1 gap-4 p-4 mb-4 border border-green-200 rounded-lg bg-green-50/40 animate-fadeIn">
                              <div className="col-span-1 flex items-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-green-600">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <h3 className="text-sm font-medium text-green-700">Adresse de facturation</h3>
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="adresseFacturation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-green-700 text-xs font-medium">Adresse</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Adresse" 
                                        {...field} 
                                        className="border-green-200 focus:border-green-400 bg-white"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="codePostalFacturation"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-green-700 text-xs font-medium">Code postal</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="75000" 
                                          {...field} 
                                          className="border-green-200 focus:border-green-400 bg-white"
                                          onChange={(e) => {
                                            field.onChange(e);
                                            if (e.target.value.length === 5) {
                                              fetchCities(e.target.value, true);
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="villeFacturation"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-green-700 text-xs font-medium">Ville</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Ville" 
                                          {...field} 
                                          className="border-green-200 focus:border-green-400 bg-white"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          
                          <FormField
                            control={form.control}
                            name="commentaires"
                            render={({ field }) => (
                              <FormItem className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                                <FormLabel className="flex items-center gap-2 font-medium mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-500">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  Commentaires additionnels
                                </FormLabel>
                                <p className="text-xs text-blue-700 mb-3">
                                  Ces informations nous aideront à mieux comprendre votre projet et à vous proposer la solution la plus adaptée.
                                </p>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Précisez ici toute information complémentaire utile à votre demande (ex: contraintes du terrain, détails techniques spécifiques, etc.)" 
                                    {...field} 
                                    rows={5}
                                    className="focus:ring-blue-400 border-blue-200"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="accepteConditions"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <div 
                                  className={`flex flex-row items-start space-x-2 space-y-0 p-3 ${field.value ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-100'} border rounded-lg cursor-pointer transition-all duration-200 ease-in-out`}
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value} 
                                      onCheckedChange={(checked) => field.onChange(checked === true)}
                                      id="conditions" 
                                      className={`mt-0.5 ${!field.value ? "border-red-400" : ""}`}
                                    />
                                  </FormControl>
                                  <div 
                                    className="leading-tight w-full cursor-pointer"
                                    onClick={() => {
                                      field.onChange(!field.value);
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm font-medium flex items-center">
                                      J'accepte les conditions générales de vente
                                      <span className="text-red-500 ml-1">*</span>
                                    </span>
                                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 leading-tight">Je souhaite que la prestation débute avant l'expiration du délai de rétractation légale. Si celle-ci était totalement exécutée avant l'expiration de ce délai, je ne pourrai plus me rétracter.</p>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-8 form-navigation-buttons">
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPrevStep}
                          className="flex items-center gap-2 px-5 py-2.5 transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 border-gray-300 nav-button nav-button-prev"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                          Précédent
                        </Button>
                      ) : (
                        <div className="invisible">Espace</div>
                      )}
                      
                      {currentStep < 3 ? (
                        currentStep === 1 ? (
                          <GoogleSnippetButton
                            page="/raccordement-enedis-new"
                            selector=".next-step-button"
                            onClick={() => {
                              // La sauvegarde des données utilisateur a été désactivée
                              // Passer à l'étape suivante
                              goToNextStep();
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center gap-2 px-6 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 font-medium nav-button nav-button-next next-step-button"
                          >
                            Suivant
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </GoogleSnippetButton>
                        ) : (
                          <Button 
                            type="button"
                            onClick={() => {
                              // La sauvegarde des données utilisateur a été désactivée
                              // Passer à l'étape suivante
                              goToNextStep();
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center gap-2 px-6 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 font-medium nav-button nav-button-next"
                          >
                            Suivant
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </Button>
                        )
                      ) : (
                        <GoogleSnippetButton 
                          page="/raccordement-enedis-new"
                          selector=".submit-form-button"
                          type="submit"
                          disabled={isSubmitting || !form.watch('accepteConditions')}
                          onClick={(e) => {
                            if (!form.watch('accepteConditions')) {
                              e.preventDefault();
                              toast({
                                title: "Veuillez accepter les conditions",
                                description: "Vous devez accepter les conditions générales pour continuer",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            // Nous allons d'abord valider tous les champs du formulaire
                            e.preventDefault(); // Empêche la soumission par défaut
                            
                            // Déclencher la validation sur tous les champs
                            const allFields = [...getCurrentStepFields()];
                            
                            console.log("Validation des champs:", allFields);
                            
                            // Valider tous les champs du formulaire
                            form.trigger().then(isValid => {
                              console.log("Résultat validation:", isValid, form.formState.errors);
                              
                              if (isValid) {
                                // Le formulaire est valide, on peut soumettre
                                console.log("Formulaire valide, soumission en cours...");
                                // Insérer un délai court pour permettre au snippet Google de se charger correctement
                                setTimeout(() => {
                                  form.handleSubmit(onSubmit)();
                                }, 300); 
                              } else {
                                // Afficher les erreurs du formulaire et indiquer à l'utilisateur
                                console.log("Erreurs formulaire:", form.formState.errors);
                                toast({
                                  title: "Formulaire incomplet",
                                  description: "Veuillez vérifier les champs obligatoires",
                                  variant: "destructive",
                                });
                              }
                            });
                          }}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-white font-medium nav-button nav-button-submit submit-form-button
                            ${!form.watch('accepteConditions') 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                            }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              Envoyer ma demande
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-[18px] sm:h-[18px]">
                                <path d="m22 2-7 20-4-9-9-4Z"/>
                                <path d="M22 2 11 13"/>
                              </svg>
                            </>
                          )}
                        </GoogleSnippetButton>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
              
              <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100 progress-sidebar sticky top-4">
                  <h3 className="text-lg font-medium mb-6 flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M2 3h20"></path>
                      <path d="M20 3v18"></path>
                      <path d="M4 3v18"></path>
                      <path d="M4 7h16"></path>
                      <path d="M4 11h16"></path>
                      <path d="M4 15h16"></path>
                    </svg>
                    Étapes à suivre
                  </h3>
                  
                  <div className="space-y-8">
                    <div className={`relative pl-10 ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                      <div className={`absolute left-0 top-0 rounded-full flex items-center justify-center w-7 h-7 transition-all duration-300 progress-step
                        ${currentStep === 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                           currentStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {currentStep > 1 ? 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg> : "1"}
                      </div>
                      <div>
                        <h4 className="font-medium text-base">Étape 1 : Informations personnelles</h4>
                        <p className="text-sm text-gray-500 mt-1">Veuillez renseigner vos coordonnées personnelles pour commencer votre demande.</p>
                      </div>
                    </div>
                    
                    <div className={`relative pl-10 ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                      <div className={`absolute left-0 top-0 rounded-full flex items-center justify-center w-7 h-7 transition-all duration-300 progress-step
                        ${currentStep === 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                           currentStep > 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {currentStep > 2 ? 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg> : "2"}
                      </div>
                      <div>
                        <h4 className="font-medium text-base">Étape 2 : Détails du projet</h4>
                        <p className="text-sm text-gray-500 mt-1">Spécifications techniques et détails du raccordement.</p>
                      </div>
                    </div>
                    
                    <div className={`relative pl-10 ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                      <div className={`absolute left-0 top-0 rounded-full flex items-center justify-center w-7 h-7 transition-all duration-300 progress-step
                        ${currentStep === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                           currentStep > 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {currentStep > 3 ? 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg> : "3"}
                      </div>
                      <div>
                        <h4 className="font-medium text-base">Étape 3 : Validation et finalisation</h4>
                        <p className="text-sm text-gray-500 mt-1">Validation finale de votre demande avant envoi.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 mb-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <div className="flex items-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-1">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        <span className="text-blue-700 font-medium progress-label">Progression de votre demande</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-bold">{Math.floor(formProgress)}</span>
                        <span className="text-gray-400">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="progress-container progress-bar-container mobile-progress-container">
                      <div 
                        className="progress-bar mobile-progress-bar"
                        style={{ 
                          width: `${formProgress}%`,
                          backgroundSize: '200% 100%',
                          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%), linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #2563eb 100%)'
                        }}
                      >
                        <div className="progress-bar-shine"></div>
                      </div>
                      <div className="progress-indicator progress-connector" style={{ right: `${100 - formProgress}%` }}></div>
                    </div>
                    
                    <div className="flex justify-end text-sm text-gray-600 mt-2 font-medium">
                      <div className="flex items-center">
                        <span className="text-blue-700">
                          {formProgress < 34 && "Informations personnelles"}
                          {formProgress >= 34 && formProgress < 67 && "Détails techniques"}
                          {formProgress >= 67 && formProgress < 100 && "Finalisation"}
                          {formProgress === 100 && "Terminé !"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 mb-6 mt-6 shadow-sm border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-700">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  Besoin d'aide pour votre raccordement ?
                </h2>
                <p className="text-blue-800 mb-4 text-base">
                  Notre équipe de spécialistes est disponible pour répondre à vos questions et vous accompagner tout au long de votre démarche de raccordement électrique.
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <Button
                  onClick={() => {
                    console.log("Clicking contact trigger");
                    // Déclencher le click sur le trigger du dialog
                    document.getElementById('contact-modal-trigger')?.click();
                  }}
                  variant="outline"
                  className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 shadow-sm px-5 py-2 flex items-center gap-2 transition-all duration-200"
                >
                  <MessageSquare className="h-5 w-5" />
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Les données structurées Schema.org pour le SEO sont conservées mais invisibles */}
      <div className="hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Service de Raccordement Enedis",
          "description": "Service d'accompagnement pour les démarches de raccordement au réseau électrique Enedis pour particuliers, professionnels et collectivités.",
          "provider": {
            "@type": "Organization",
            "name": "Services Enedis"
          },
          "areaServed": "France",
          "serviceType": "Raccordement électrique"
        }) }} />
      </div>
      
      {/* Utilisation du composant ContactModal optimisé avec trigger */}
      <ContactModal 
        trigger={
          <div className="hidden" id="contact-modal-trigger">
            Contact trigger
          </div>
        }
        defaultOpen={contactModalOpen}
        onOpenChange={setContactModalOpen}
        source="raccordement_form"
      />
    </div>
  );
}