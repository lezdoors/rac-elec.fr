import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";

// Lazy load heavy components for better performance
const SupportWidget = lazy(() => import("@/components/support-widget").then(module => ({ default: module.SupportWidget })));
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, CheckCircle, MessageCircle, X, Clock, Shield, Star, Phone, Mail, ArrowRight, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGclid } from "@/lib/clean-gclid";
import { EnhancedMobileFormOptimizer } from "@/components/enhanced-mobile-form-optimizer";
import { FormStep1 } from "@/components/form-step-1";
import "../styles/conversion-critical.css";

// Hook pour optimiser les performances mobiles
const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Marquer la page comme chargée après le premier rendu critique
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  return { isMobile, isPageLoaded };
};


// Professional validation schema
const formSchema = z.object({
  clientType: z.enum(["particulier", "professionnel", "collectivite"]),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email doit être valide"),
  phone: z.string().refine((value) => {
    // Supprimer tous les espaces, points et tirets pour la validation
    const cleanPhone = value.replace(/[\s\.\-]/g, '');
    // Vérifier le format français : 10 chiffres commençant par 0[1-9] ou +33[1-9]
    return /^(0[1-9]\d{8}|\+33[1-9]\d{8})$/.test(cleanPhone);
  }, "Format téléphone invalide (ex: 06 12 34 56 78)"),
  raisonSociale: z.string().optional(),
  siren: z.string().optional(),
  nomCollectivite: z.string().optional(),
  sirenCollectivite: z.string().optional(),
  adresse: z.string().optional(),
  complementAdresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  adresseProjet: z.string().min(5, "L'adresse du projet doit être complète"),
  complementAdresseProjet: z.string().optional(),
  codePostalProjet: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  villeProjet: z.string().min(2, "La ville est requise"),
  typeRaccordement: z.enum(["nouveau", "provisoire", "augmentation", "deplacement", "autre"]),
  autreTypeRaccordement: z.string().optional(),
  typeProjet: z.enum(["maison", "immeuble", "commercial", "industriel", "terrain"]),
  terrainViabilise: z.boolean().optional(),
  typeAlimentation: z.enum(["monophase", "triphase", "inconnu"]),
  puissance: z.string().optional(),
  adresseFacturationDifferente: z.boolean().optional(),
  adresseFacturation: z.string().optional(),
  facturationDifferente: z.boolean().optional(),
  newsletterOptIn: z.boolean().optional(),
  consentementTraitement: z.boolean(),
}).refine((data) => {
  // Si le toggle de facturation différente est activé, l'adresse de facturation devient obligatoire
  if (data.facturationDifferente && !data.adresseFacturation?.trim()) {
    return false;
  }
  return true;
}, {
  message: "L'adresse de facturation est obligatoire quand cette option est activée",
  path: ["adresseFacturation"],
});

type FormData = z.infer<typeof formSchema>;

export default function RaccordementEnedisPage() {
  const { isMobile, isPageLoaded } = useMobileOptimization();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', message: '' });
  
  // État pour l'animation de recherche
  const [isSearchingVille, setIsSearchingVille] = useState(false);
  const [isSearchingVilleProjet, setIsSearchingVilleProjet] = useState(false);

  // PERFORMANCE: Debounced API calls for INP optimization
  const handleCodePostalChange = useCallback(async (codePostal: string, isFacturation: boolean = false) => {
    if (codePostal.length === 5) {
      try {
        // Activer l'animation de recherche
        if (isFacturation) {
          setIsSearchingVille(true);
        } else {
          setIsSearchingVilleProjet(true);
        }

        // Utilisation de l'API officielle française geo.api.gouv.fr
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,codesPostaux&format=json&geometry=centre`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const ville = data[0].nom;
            // Petit délai pour montrer l'animation
            setTimeout(() => {
              if (isFacturation) {
                form.setValue("ville", ville);
                setIsSearchingVille(false);
              } else {
                form.setValue("villeProjet", ville);
                setIsSearchingVilleProjet(false);
              }
            }, 300);
          }
        }
      } catch (error) {
        console.log('Erreur lors de la récupération de la ville:', error);
        // Arrêter l'animation en cas d'erreur
        if (isFacturation) {
          setIsSearchingVille(false);
        } else {
          setIsSearchingVilleProjet(false);
        }
      }
    }
  }, []); // PERFORMANCE: Memoized callback to prevent re-renders

  // Fonction pour défiler vers le haut de la page
  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  // Défiler vers le haut automatiquement lors du changement d'étape
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: "particulier",
      nom: "",
      prenom: "",
      email: "",
      phone: "",
      raisonSociale: "",
      siren: "",
      nomCollectivite: "",
      sirenCollectivite: "",
      adresse: "",
      complementAdresse: "",
      codePostal: "",
      ville: "",
      typeRaccordement: undefined,
      autreTypeRaccordement: "",
      typeProjet: undefined,
      terrainViabilise: false,
      typeAlimentation: "inconnu", // Valeur par défaut : "Je ne connais pas ma puissance"
      puissance: "",
      adresseFacturationDifferente: false,
      adresseFacturation: "",
      adresseProjet: "",
      complementAdresseProjet: "",
      codePostalProjet: "",
      villeProjet: "",
      facturationDifferente: false,
      newsletterOptIn: false,
      consentementTraitement: false,
    },
  });

  const clientType = form.watch("clientType");
  const codePostal = form.watch("codePostal");
  const typeRaccordement = form.watch("typeRaccordement");

  // French city auto-fill from postal codes using official API
  useEffect(() => {
    if (codePostal && codePostal.length === 5) {
      const fetchVille = async () => {
        try {
          const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom&format=json&geometry=centre`);
          const data = await response.json();
          
          if (data && data.length > 0) {
            form.setValue("ville", data[0].nom);
          }
        } catch (error) {
          console.log("Erreur lors de la récupération de la ville:", error);
          const villesParCP: { [key: string]: string } = {
            "75001": "Paris", "75002": "Paris", "75003": "Paris", "75004": "Paris", "75005": "Paris",
            "69001": "Lyon", "69002": "Lyon", "69003": "Lyon", "69004": "Lyon", "69005": "Lyon",
            "13001": "Marseille", "13002": "Marseille", "13003": "Marseille", "13004": "Marseille",
            "31000": "Toulouse", "31100": "Toulouse", "31200": "Toulouse", "31300": "Toulouse",
            "59000": "Lille", "59160": "Lille", "59260": "Lille", "59777": "Lille",
            "44000": "Nantes", "44100": "Nantes", "44200": "Nantes", "44300": "Nantes",
            "67000": "Strasbourg", "67100": "Strasbourg", "67200": "Strasbourg",
            "34000": "Montpellier", "34070": "Montpellier", "34080": "Montpellier",
            "33000": "Bordeaux", "33100": "Bordeaux", "33200": "Bordeaux", "33300": "Bordeaux",
            "35000": "Rennes", "35200": "Rennes", "35700": "Rennes",
          };
          
          const ville = villesParCP[codePostal];
          if (ville) {
            form.setValue("ville", ville);
          }
        }
      };
      
      fetchVille();
    }
  }, [codePostal, form]);

  // Send notification
  const sendNotification = async (type: string, data?: any) => {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(`Notification ${type} envoyée`);
    } catch (error) {
      console.error("Erreur notification:", error);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["clientType", "nom", "prenom", "email", "phone"];
      
      // Store user data in localStorage for Enhanced Conversions
      const formData = form.getValues();
      if (formData.email) localStorage.setItem('user_email', formData.email);
      if (formData.phone) localStorage.setItem('user_phone', formData.phone);
      if (formData.prenom) localStorage.setItem('user_first_name', formData.prenom);
      if (formData.nom) localStorage.setItem('user_last_name', formData.nom);
      
      if (clientType === "professionnel") {
        fieldsToValidate.push("raisonSociale", "siren");
      } else if (clientType === "collectivite") {
        fieldsToValidate.push("nomCollectivite", "sirenCollectivite");
      }

      const isStepValid = await form.trigger(fieldsToValidate);
      
      if (isStepValid) {
        // Form Start Conversion Tracking - CRITICAL FOR GOOGLE ADS
        setTimeout(() => {
          console.log('🎯 Attempting form start conversion...');
          
          // Try multiple methods to ensure conversion fires
          let conversionSent = false;
          
          // Method 1: Global trigger function
          if (typeof window !== 'undefined' && (window as any).triggerFormStartConversion) {
            try {
              (window as any).triggerFormStartConversion();
              console.log('✅ Form start conversion via global trigger');
              conversionSent = true;
            } catch (e) {
              console.warn('Global trigger failed:', e);
            }
          }
          
          // Method 2: Direct backup function
          if (!conversionSent && typeof window !== 'undefined' && (window as any).directFormStartConversion) {
            try {
              conversionSent = (window as any).directFormStartConversion();
              console.log('✅ Form start conversion via direct function');
            } catch (e) {
              console.warn('Direct function failed:', e);
            }
          }
          
          // Method 3: Raw gtag call
          if (!conversionSent && typeof window !== 'undefined' && (window as any).gtag) {
            try {
              (window as any).gtag('event', 'conversion', {
                'send_to': 'AW-16698052873/5o3ICMLjpMUaEImioJo-'
              });
              console.log('✅ Form start conversion via raw gtag');
              conversionSent = true;
            } catch (e) {
              console.warn('Raw gtag failed:', e);
            }
          }
          
          if (!conversionSent) {
            console.error('❌ All form start conversion methods failed');
          }
        }, 300);
        
        // Immediate transition to step 2
        setCurrentStep(currentStep + 1);
        
        // Background prelead creation
        createPreLeadOptimized();
      }
    } else if (currentStep === 2) {
      fieldsToValidate = ["adresseProjet", "codePostalProjet", "villeProjet", "typeRaccordement", "typeProjet", "typeAlimentation"];
      
      // Add power if needed (except for "I don't know my power")
      if (form.watch("typeAlimentation") !== "inconnu") {
        fieldsToValidate.push("puissance");
      }
      
      const isStepValid = await form.trigger(fieldsToValidate);
      
      if (isStepValid) {
        await completeLeadStep2();
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // 🚀 FONCTION OPTIMISÉE - Création rapide du prelead
  const createPreLeadOptimized = async () => {
    try {
      const formData = form.getValues();
      
      // 🚀 UN SEUL APPEL API - Combine prelead + notification
      const response = await fetch("/api/leads/prelead-with-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientType: formData.clientType,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          phone: formData.phone,
          raisonSociale: formData.raisonSociale,
          siren: formData.siren,
          nomCollectivite: formData.nomCollectivite,
          sirenCollectivite: formData.sirenCollectivite,
          sendNotification: true, // Flag pour envoyer la notification
        }),
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('preleadId', result.leadId);
        console.log('✅ Prelead créé avec succès:', result.referenceNumber);
      } else {
        console.error("Erreur API prelead optimisé:", response.status);
      }
    } catch (error) {
      console.error("Erreur création prelead optimisé:", error);
    }
  };

  // Create prelead with step 1 info (ancienne version conservée pour compatibilité)
  const createPreLead = async () => {
    try {
      const formData = form.getValues();
      const response = await fetch("/api/leads/prelead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientType: formData.clientType,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          phone: formData.phone,
          raisonSociale: formData.raisonSociale,
          siren: formData.siren,
          nomCollectivite: formData.nomCollectivite,
          sirenCollectivite: formData.sirenCollectivite,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('preleadId', result.leadId);
        
        // 🚨 NOTIFICATION LEAD - Étape 1 complétée - Envoyer avec vraies données
        await fetch("/api/notifications/lead-created", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.phone,
            clientType: formData.clientType,
            raisonSociale: formData.raisonSociale,
            siren: formData.siren,
            nomCollectivite: formData.nomCollectivite,
            sirenCollectivite: formData.sirenCollectivite,
            referenceNumber: result.referenceNumber || 'En cours...',
            timestamp: new Date().toISOString()
          }),
        });
        
        await sendNotification("prelead_created", result);
      } else {
        console.error("Erreur API prelead:", response.status);
      }
    } catch (error) {
      console.error("Erreur création prelead:", error);
    }
  };

  // Complete lead with step 2 info
  const completeLeadStep2 = async () => {
    try {
      const formData = form.getValues();
      const preleadId = sessionStorage.getItem('preleadId');
      
      const response = await fetch("/api/leads/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preleadId,
          adresse: formData.adresse,
          complementAdresse: formData.complementAdresse,
          codePostal: formData.codePostal,
          ville: formData.ville,
          typeRaccordement: formData.typeRaccordement,
          typeProjet: formData.typeProjet,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        await sendNotification("lead_completed", result);
      }
    } catch (error) {
      console.error("Erreur completion lead:", error);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("🚀 Début de soumission du formulaire", data);
    setIsSubmitting(true);
    
    try {
      const reference = `RAC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;
      console.log("📝 Référence générée:", reference);
      
      // Map frontend field names to backend field names
      // Capture GCLID for Google Ads attribution
      const gclid = getGclid();
      
      const mappedData = {
        name: `${data.prenom || ''} ${data.nom || ''}`.trim(), // Concaténation correcte du prénom et nom
        email: data.email,
        phone: data.phone,
        address: data.adresseProjet,
        city: data.villeProjet,
        postalCode: data.codePostalProjet,
        serviceType: "electricity",
        requestType: data.typeRaccordement === "provisoire" ? "temporary_connection" : "new_connection",
        buildingType: data.typeProjet === "immeuble" ? "apartment_building" : "individual_house",
        projectStatus: "planning",
        powerRequired: data.puissance || "12",
        reference,
        gclid: gclid || undefined, // Include GCLID if available
        // Pass through other fields that match
        clientType: data.clientType,
        prenom: data.prenom,
        complementAdresse: data.complementAdresse,
        typeAlimentation: data.typeAlimentation,
        adresseFacturationDifferente: data.adresseFacturationDifferente,
        newsletterOptIn: data.newsletterOptIn,
        consentementTraitement: data.consentementTraitement,
      };

      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la demande");
      }

      const result = await response.json();
      
      // Form Submit Conversion Tracking (before Stripe redirect) - CRITICAL FOR GOOGLE ADS
      setTimeout(() => {
        console.log('🎯 Attempting form submit conversion...');
        
        let conversionSent = false;
        
        // Method 1: Global trigger function
        if (typeof window !== 'undefined' && (window as any).triggerFormSubmitConversion) {
          try {
            (window as any).triggerFormSubmitConversion();
            console.log('✅ Form submit conversion via global trigger');
            conversionSent = true;
          } catch (e) {
            console.warn('Global submit trigger failed:', e);
          }
        }
        
        // Method 2: Direct backup function
        if (!conversionSent && typeof window !== 'undefined' && (window as any).directFormSubmitConversion) {
          try {
            conversionSent = (window as any).directFormSubmitConversion();
            console.log('✅ Form submit conversion via direct function');
          } catch (e) {
            console.warn('Direct submit function failed:', e);
          }
        }
        
        // Method 3: Raw gtag call
        if (!conversionSent && typeof window !== 'undefined' && (window as any).gtag) {
          try {
            (window as any).gtag('event', 'conversion', {
              'send_to': 'AW-16698052873/PqZMCJW-tMUaEImioJo-'
            });
            console.log('✅ Form submit conversion via raw gtag');
            conversionSent = true;
          } catch (e) {
            console.warn('Raw gtag submit failed:', e);
          }
        }
        
        if (!conversionSent) {
          console.error('❌ All form submit conversion methods failed');
        }
      }, 100);
      
      // Notification demande complète via nouvelle route
      await fetch("/api/notifications/request-completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Données complètes du formulaire avec TOUTES les vraies valeurs
          name: mappedData.name,
          email: mappedData.email,
          phone: mappedData.phone,
          referenceNumber: reference,
          address: mappedData.address,
          city: mappedData.city,
          postalCode: mappedData.postalCode,
          requestType: mappedData.requestType,
          buildingType: mappedData.buildingType,
          powerRequired: mappedData.powerRequired,
          company: data.raisonSociale || '',
          // Données supplémentaires du formulaire français
          clientType: data.clientType,
          prenom: data.prenom,
          nom: data.nom,
          typeRaccordement: data.typeRaccordement,
          typeProjet: data.typeProjet,
          typeAlimentation: data.typeAlimentation,
          puissance: data.puissance,
          complementAdresse: data.complementAdresse,
          complementAdresseProjet: data.complementAdresseProjet,
          raisonSociale: data.raisonSociale,
          siren: data.siren,
          nomCollectivite: data.nomCollectivite,
          sirenCollectivite: data.sirenCollectivite,
          // Adresse de facturation si différente
          adresseFacturationDifferente: data.adresseFacturationDifferente,
          adresseFacturation: data.adresseFacturation || '',
          terrainViabilise: data.terrainViabilise,
          autreTypeRaccordement: data.autreTypeRaccordement || '',
          // Données complètes de l'adresse
          adresseComplete: data.adresse || '',
          codePostalComplete: data.codePostal || '',
          villeComplete: data.ville || '',
          timestamp: new Date().toISOString()
        }),
      });
      
      // Final Form Submit Conversion Tracking - CRITICAL FOR GOOGLE ADS
      console.log('🎯 Attempting final form submit conversion...');
      
      // Primary: Use global trigger function
      if (typeof window !== 'undefined' && window.triggerFormSubmitConversion) {
        window.triggerFormSubmitConversion();
        console.log('✅ Final form submit conversion triggered via global function');
      } else if (typeof window !== 'undefined' && window.gtag) {
        // Fallback: Direct gtag call
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16698052873/PqZMCJW-tMUaEtmioJo-'
        });
        console.log('✅ Final form submit conversion sent via direct gtag call');
      } else {
        console.error('❌ Final form submit conversion failed - no tracking method available');
      }
      
      // Redirection vers la page de confirmation/paiement
      window.location.href = `/confirmation/${reference}`;
      
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep2 = () => (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
      {/* En-tête optimisé mobile-first */}
      <div className="mb-3 md:mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
          Détails du projet
        </h2>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Informations sur votre projet de raccordement électrique
        </p>
      </div>
      
      <div className="space-y-0 md:space-y-3">
        {/* Adresse du projet - Section principale */}
        <div className="space-y-1 md:space-y-3">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Adresse du projet
          </h3>
          
          <FormField
            control={form.control}
            name="adresseProjet"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                  <span className="text-blue-600">Adresse complète du projet</span> <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="12 avenue de la République" 
                    autoComplete="street-address"
                    className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 touch-manipulation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="complementAdresseProjet"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                  Complément d'adresse du projet
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Précisions sur l'emplacement du projet..." 
                    autoComplete="address-line2"
                    className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 touch-manipulation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />

          {/* Code postal et Ville du projet */}
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 mt-6">
            <FormField
              control={form.control}
              name="codePostalProjet"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    <span className="text-blue-600">Code postal du projet</span> <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="75001" 
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 touch-manipulation" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleCodePostalChange(e.target.value, false);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="villeProjet"
              render={({ field }) => (
                <FormItem className="space-y-2 mb-4 md:mb-auto">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    <span className="text-blue-600">Ville du projet</span> <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Ville du projet" 
                        autoComplete="address-level2"
                        className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 placeholder-gray-500 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 touch-manipulation" 
                        {...field} 
                      />
                      {isSearchingVilleProjet && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-4 h-4 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-600 mb-0" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Adresse de facturation - Toggle moderne et visible */}
        <div className="mt-6 mb-6 md:mt-6 md:mb-6" data-testid="facturation-toggle">
          <FormField
            control={form.control}
            name="facturationDifferente"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div 
                  onClick={() => field.onChange(!field.value)}
                  className={`
                    flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 touch-manipulation
                    ${field.value 
                      ? 'bg-green-50 border-green-500 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-50 border-gray-300 hover:bg-green-50/30 hover:border-green-400 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-300 ${field.value ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <span className={`text-base font-semibold transition-colors duration-300 ${field.value ? 'text-green-800' : 'text-gray-700'}`}>
                        Utiliser une adresse de facturation différente
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {field.value ? 'Adresse de facturation personnalisée activée' : 'Cliquez pour utiliser une adresse différente'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle moderne */}
                  <div className={`
                    relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0
                    ${field.value ? 'bg-green-500' : 'bg-gray-400'}
                  `}>
                    <div className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300
                      ${field.value ? 'transform translate-x-6' : 'transform translate-x-1'}
                    `}></div>
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* Champs d'adresse de facturation conditionnels */}
          {form.watch("facturationDifferente") && (
            <div className="space-y-1 p-3 bg-blue-50/50 rounded-lg border border-blue-200/60">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Adresse de facturation</h4>
              
              <FormField
                control={form.control}
                name="adresseFacturation"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                      <span className="text-blue-600">Adresse complète de facturation</span> <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 rue de la République" 
                        autoComplete="billing-address-line1"
                        className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 touch-manipulation" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="complementAdresse"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                      Complément d'adresse
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bâtiment, étage, appartement..." 
                        autoComplete="billing-address-line2"
                        className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 touch-manipulation" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <div className="space-y-1 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                <FormField
                  control={form.control}
                  name="codePostal"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                        <span className="text-blue-600">Code postal</span> <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="75001" 
                          autoComplete="billing-postal-code"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 touch-manipulation" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCodePostalChange(e.target.value, true);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ville"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium text-gray-700 mb-1 block">
                        <span className="text-blue-600">Ville</span> <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Ville" 
                            autoComplete="billing-address-level2"
                            className="h-12 text-base bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 placeholder-gray-500 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 touch-manipulation" 
                            {...field} 
                          />
                          {isSearchingVille && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>





        {/* Détails techniques - Section avec espacement professionnel */}
        <div className="space-y-6 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 mt-6 md:mt-6">
          <FormField
            control={form.control}
            name="typeRaccordement"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm md:text-base font-semibold text-gray-800 mb-2">
                  <span className="text-blue-600">Type de raccordement</span> <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-colors text-base font-medium">
                      <SelectValue placeholder="Type de raccordement" className="text-gray-700" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                    <SelectItem value="nouveau" className="h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Nouveau raccordement</div>
                        <div className="text-sm text-gray-600">Première installation électrique</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="provisoire" className="h-14 px-4 py-3 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Raccordement provisoire</div>
                        <div className="text-sm text-gray-600">Installation temporaire (chantier, événement)</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="augmentation" className="h-14 px-4 py-3 hover:bg-green-50 focus:bg-green-50 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Augmentation de puissance</div>
                        <div className="text-sm text-gray-600">Modifier la puissance existante</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="deplacement" className="h-14 px-4 py-3 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Déplacement de compteur</div>
                        <div className="text-sm text-gray-600">Changer l'emplacement du compteur</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="autre" className="h-14 px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Autre demande</div>
                        <div className="text-sm text-gray-600">Situation particulière à préciser</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Champ conditionnel pour "autre" type de raccordement */}
          {typeRaccordement === "autre" && (
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="autreTypeRaccordement"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-blue-600">Précisez le type de raccordement</span> <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <textarea 
                        placeholder="Décrivez précisément votre type de raccordement, vos besoins spécifiques et toute information complémentaire..."
                        rows={3}
                        className="
                          min-h-[80px] text-base resize-none
                          bg-white border border-orange-300 rounded-lg 
                          px-3 md:px-4 py-2.5 md:py-3
                          placeholder-gray-500
                          hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                          transition-all duration-200
                          touch-manipulation
                          w-full
                        " 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                    <p className="text-xs text-gray-500 mt-1">
                      Exemple: raccordement temporaire pour chantier, raccordement pour borne de recharge, etc.
                    </p>
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="typeProjet"
            render={({ field }) => (
              <FormItem className="space-y-2 mb-4 md:mb-auto">
                <FormLabel className="text-sm md:text-base font-semibold text-gray-800 mb-2">
                  <span className="text-blue-600">Type de projet</span> <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-colors text-base font-medium">
                      <SelectValue placeholder="Type de projet" className="text-gray-700" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                    <SelectItem value="maison" className="h-16 md:h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Maison individuelle</div>
                          <div className="text-xs text-gray-600">Habitation unifamiliale, villa</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="immeuble" className="h-16 md:h-14 px-4 py-3 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Immeuble collectif</div>
                          <div className="text-xs text-gray-600">Appartements, résidence, copropriété</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="commercial" className="h-16 md:h-14 px-4 py-3 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Local commercial</div>
                          <div className="text-xs text-gray-600">Magasin, bureau, restaurant</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="industriel" className="h-16 md:h-14 px-4 py-3 hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Site industriel</div>
                          <div className="text-xs text-gray-600">Usine, entrepôt, atelier</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="terrain" className="h-16 md:h-14 px-4 py-3 hover:bg-green-50 focus:bg-green-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 21v-7a1 1 0 00-1-1h-4a1 1 0 00-1 1v7"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1m0 0h1m-1 0v1m0-1V8"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">Terrain nu</div>
                          <div className="text-xs text-gray-600">Terrain à bâtir, construction future</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="mb-0" />
              </FormItem>
            )}
          />

          {/* Question conditionnelle pour terrain viabilisé */}
          {form.watch("typeProjet") === "terrain" && (
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="terrainViabilise"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Le terrain est-il viabilisé ? *
                    </FormLabel>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                      <p className="text-sm text-green-800">
                        Un terrain viabilisé dispose déjà des accès aux réseaux (eau, électricité, assainissement). 
                        Cela impacte le coût et le délai de raccordement.
                      </p>
                    </div>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => field.onChange(true)}
                          className={`
                            relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 
                            ${field.value === true 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-300 bg-white hover:border-green-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                              {field.value === true && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">Oui, viabilisé</div>
                              <div className="text-xs text-gray-600">Réseaux déjà présents</div>
                            </div>
                          </div>
                        </div>
                        
                        <div
                          onClick={() => field.onChange(false)}
                          className={`
                            relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 
                            ${field.value === false 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-300 bg-white hover:border-orange-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                              {field.value === false && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">Non viabilisé</div>
                              <div className="text-xs text-gray-600">Aucun réseau présent</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Section Type d'alimentation - Mobile dropdown, Desktop cards */}
          <FormField
            control={form.control}
            name="typeAlimentation"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm md:text-base font-semibold text-gray-800 mb-1.5">
                  <span className="text-blue-600">Type d'alimentation</span> <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3">
                  {/* Option Monophasé */}
                  <div
                    onClick={() => field.onChange("monophase")}
                    className={`
                      relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 
                      ${field.value === "monophase" 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        {field.value === "monophase" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Monophasé</div>
                        <div className="text-sm text-gray-600">Habitations standard (3-12 kVA)</div>
                      </div>
                    </div>
                  </div>

                  {/* Option Triphasé */}
                  <div
                    onClick={() => field.onChange("triphase")}
                    className={`
                      relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 
                      ${field.value === "triphase" 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        {field.value === "triphase" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Triphasé</div>
                        <div className="text-sm text-gray-600">Puissances élevées (12-36 kVA)</div>

                      </div>
                    </div>
                  </div>

                  {/* Option par défaut - Je ne sais pas (dernière position) */}
                  <div
                    onClick={() => field.onChange("inconnu")}
                    className={`
                      relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 
                      ${field.value === "inconnu" || !field.value
                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                        : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-25'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                        {(field.value === "inconnu" || !field.value) && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">Je ne connais pas ma puissance</div>
                        <div className="text-sm text-gray-600">Nous vous conseillerons selon votre projet</div>
                      </div>
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Section Puissance demandée - Affichage conditionnel selon le type d'alimentation, masqué si "inconnu" */}
          {form.watch("typeAlimentation") && form.watch("typeAlimentation") !== "inconnu" && (
            <FormField
              control={form.control}
              name="puissance"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    Puissance demandée (kVA) *
                    <div className="ml-2 w-6 h-6 md:w-5 md:h-5 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-all duration-200 cursor-help touch-manipulation" title="Aide pour choisir la puissance selon votre logement">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-600">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </FormLabel>

                  {/* Dropdown pour Monophasé */}
                  {form.watch("typeAlimentation") === "monophase" && (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 md:h-12 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-700 font-medium touch-manipulation">
                          <SelectValue placeholder="Choisissez votre puissance" className="text-gray-500" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                        <SelectItem value="3" className="h-16 md:h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">3 kVA</div>
                              <div className="text-xs text-gray-600">Studio/T1</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="6" className="h-16 md:h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">6 kVA</div>
                              <div className="text-xs text-gray-600">Appartement T2/T3</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="9" className="h-16 md:h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">9 kVA</div>
                              <div className="text-xs text-gray-600">Maison T4/T5</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="12" className="h-16 md:h-14 px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">12 kVA</div>
                              <div className="text-xs text-gray-600">Grande maison</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Dropdown pour Triphasé */}
                  {form.watch("typeAlimentation") === "triphase" && (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 md:h-12 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-700 font-medium touch-manipulation">
                          <SelectValue placeholder="Choisissez votre puissance" className="text-gray-500" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                        <SelectItem value="12" className="h-16 md:h-14 px-4 py-3 hover:bg-green-50 focus:bg-green-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">12 kVA</div>
                              <div className="text-xs text-gray-600">Grande maison</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="18" className="h-16 md:h-14 px-4 py-3 hover:bg-green-50 focus:bg-green-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">18 kVA</div>
                              <div className="text-xs text-gray-600">Très grande maison</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="24" className="h-16 md:h-14 px-4 py-3 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">24 kVA</div>
                              <div className="text-xs text-gray-600">Usage intensif</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="36" className="h-16 md:h-14 px-4 py-3 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">36 kVA</div>
                              <div className="text-xs text-gray-600">Usage professionnel</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="36-tarif-jaune" className="h-16 md:h-14 px-4 py-3 hover:bg-yellow-50 focus:bg-yellow-50 cursor-pointer border-l-4 border-yellow-400">
                          <div className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">36 kVA - Tarif jaune</div>
                              <div className="text-xs text-gray-600">Usage professionnel intensif</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">
                              JAUNE
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
      {/* En-tête optimisé mobile-first */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          Validation de votre Raccordement Enedis
        </h2>
        <p className="text-sm md:text-base text-gray-600">Vérifiez vos informations avant envoi de la demande</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-red-600 mt-2 rounded-full"></div>
      </div>

      {/* Récapitulatif complet */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Récapitulatif de votre demande</h3>
        </div>
        
        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Informations personnelles
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nom complet:</span>
                <span className="text-sm font-medium text-gray-800">
                  {form.getValues("prenom")} {form.getValues("nom")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type de client:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {form.getValues("clientType")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-800">{form.getValues("email")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Téléphone:</span>
                <span className="text-sm font-medium text-gray-800">{form.getValues("phone")}</span>
              </div>
              {form.getValues("raisonSociale") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entreprise:</span>
                  <span className="text-sm font-medium text-gray-800">{form.getValues("raisonSociale")}</span>
                </div>
              )}
              {form.getValues("siren") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SIREN:</span>
                  <span className="text-sm font-medium text-gray-800">{form.getValues("siren")}</span>
                </div>
              )}
              {form.getValues("nomCollectivite") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Collectivité:</span>
                  <span className="text-sm font-medium text-gray-800">{form.getValues("nomCollectivite")}</span>
                </div>
              )}
              {form.getValues("sirenCollectivite") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SIREN Collectivité:</span>
                  <span className="text-sm font-medium text-gray-800">{form.getValues("sirenCollectivite")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Adresse du projet */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Adresse du projet
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Adresse:</span>
                <span className="text-sm font-medium text-gray-800">{form.getValues("adresseProjet")}</span>
              </div>
              {form.getValues("complementAdresseProjet") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Complément:</span>
                  <span className="text-sm font-medium text-gray-800">{form.getValues("complementAdresseProjet")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Code postal:</span>
                <span className="text-sm font-medium text-gray-800">{form.getValues("codePostalProjet")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ville:</span>
                <span className="text-sm font-medium text-gray-800">{form.getValues("villeProjet")}</span>
              </div>
            </div>
          </div>

          {/* Détails du raccordement */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Détails du raccordement
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type de raccordement:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {form.getValues("typeRaccordement") === "autre" ? 
                    form.getValues("autreTypeRaccordement") || "Autre" : 
                    form.getValues("typeRaccordement")
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type de projet:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{form.getValues("typeProjet")}</span>
              </div>
              {form.getValues("typeAlimentation") !== "inconnu" && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type d'alimentation:</span>
                  <span className="text-sm font-medium text-gray-800 capitalize">
                    {form.getValues("typeAlimentation")}
                  </span>
                </div>
              )}
              {form.getValues("typeAlimentation") !== "inconnu" && form.getValues("puissance") && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Puissance demandée:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {form.getValues("puissance")} kVA
                  </span>
                </div>
              )}
              {form.getValues("typeProjet") === "terrain" && form.getValues("terrainViabilise") !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Terrain viabilisé:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {form.getValues("terrainViabilise") ? "Oui" : "Non"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Adresse de facturation si différente */}
          {form.getValues("adresseFacturationDifferente") && form.getValues("adresseFacturation") && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-orange-200/30 shadow-sm">
              <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                💳 Adresse de facturation
              </h4>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-bold text-purple-900">{form.getValues("adresseFacturation")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consentement RGPD - Version simplifiée */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="consentementTraitement"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg bg-blue-50/30">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    className="mt-1 h-5 w-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </FormControl>
                <div className="flex-1">
                  <FormLabel className="text-sm font-semibold text-gray-900 leading-relaxed">
                    <span className="text-blue-600">J'accepte les conditions générales et la politique de confidentialité</span>
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <p className="text-xs text-gray-600 mt-1">
                    Je souhaite que la prestation débute avant l'expiration du délai de rétractation légale.
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>


    </div>
  );

  return (
    <div className={`min-h-screen py-8 sm:py-12 px-4 main-form-container ${
      isMobile 
        ? 'bg-slate-50' // Couleur solide pour mobile (performance)
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/20' // Dégradé pour desktop
    }`}>
      <EnhancedMobileFormOptimizer />
      <div className="max-w-4xl mx-auto critical-content">
        
        {/* Indicateur de progression français compact - Optimisé mobile */}
        <div className={`bg-white/80 rounded-2xl border border-white/50 p-4 sm:p-6 mb-6 relative overflow-hidden ${
          isMobile 
            ? 'shadow-sm' // Ombre réduite sur mobile
            : 'backdrop-blur-sm shadow-lg' // Effets complets sur desktop
        }`}>
          {/* Effet de fond français subtil */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-white/5 to-red-600/5 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Barre de progression principale avec tricolore intégrée */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner relative">
                <div 
                  className="bg-gradient-to-r from-blue-600 via-white to-red-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm relative"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
                {/* Points d'étapes optimisés mobile-first avec check marks plus petits */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  {/* Étape 1 - Responsive check mark */}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep >= 1 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {currentStep > 1 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '1'}
                  </div>
                  
                  {/* Étape 2 - Responsive check mark */}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep >= 2 
                      ? 'bg-gray-600 text-white shadow-md border border-white sm:border-2' 
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {currentStep > 2 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '2'}
                  </div>
                  
                  {/* Étape 3 - Responsive check mark */}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep >= 3 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Labels des étapes */}
            <div className="flex justify-between text-xs text-gray-600">
              <span className={`transition-colors duration-300 ${currentStep >= 1 ? 'text-blue-700 font-medium' : ''}`}>
                Informations personnelles
              </span>
              <span className={`transition-colors duration-300 ${currentStep >= 2 ? 'text-gray-700 font-medium' : ''}`}>
                Détails du projet
              </span>
              <span className={`transition-colors duration-300 ${currentStep >= 3 ? 'text-red-700 font-medium' : ''}`}>
                Validation et envoi
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 md:space-y-4">
            {currentStep === 1 && <FormStep1 form={form} />}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Boutons de navigation */}
            <div className="flex justify-between items-center pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 font-medium disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-medium"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.watch("consentementTraitement")}
                  onClick={async (e) => {
                    console.log("🔥 Bouton cliqué!", {
                      isSubmitting,
                      consentement: form.watch("consentementTraitement"),
                      formValid: form.formState.isValid,
                      errors: form.formState.errors,
                      allValues: form.getValues()
                    });
                    
                    // Forcer la validation du formulaire
                    const isValid = await form.trigger();
                    console.log("📝 Validation forcée:", isValid, form.formState.errors);
                    
                    if (!isValid) {
                      console.error("❌ Formulaire invalide:", form.formState.errors);
                      return;
                    }
                    
                    // Si la validation est OK, déclencher manuellement la soumission
                    if (isValid && form.watch("consentementTraitement")) {
                      console.log("✅ Déclenchement manuel de la soumission");
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  className={`flex items-center gap-2 px-10 py-3 font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    isSubmitting || !form.watch("consentementTraitement")
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
        
        {/* Section d'assistance en bas du formulaire - Design vert UI */}
        <div className="mt-8 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Difficultés avec le formulaire ?
                </h3>
                <p className="text-green-700 text-sm leading-relaxed mb-4">
                  Si vous rencontrez des difficultés pour remplir ce formulaire ou avez des questions sur votre raccordement électrique, notre équipe d'experts est joignable pour vous assister gratuitement. Nous sommes là pour vous accompagner dans votre démarche.
                </p>
                <div className="flex justify-start">
                  <a
                    href="tel:0970709570"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'phone_call', {
                          event_category: 'engagement',
                          event_label: 'contact_phone_form_assistance'
                        });
                      }
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors gap-2 min-h-[44px] touch-manipulation shadow-md hover:shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    09 70 70 95 70 - Assistance gratuite
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'aide élégant - Design mobile-first responsive */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec effet de flou moderne */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowSupportModal(false)}
          />
          
          {/* Modal responsive avec animations fluides */}
          <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
            {/* En-tête avec gradient professionnel */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Centre d'Aide Raccordement</h3>
                    <p className="text-gray-200 text-sm">Réponse sous 24h garantie</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu du formulaire optimisé mobile */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-orange-600 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Suivi personnalisé garanti</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Notre équipe technique vous accompagne dans votre projet de raccordement. 
                  Posez votre question, nous vous répondrons rapidement.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  // Envoyer la demande support
                  console.log('Support request:', supportForm);
                  setShowSupportModal(false);
                  // Toast confirmation
                  alert('Votre message a été envoyé ! Nous vous répondrons sous 24h.');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    required
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    placeholder="votre@email.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre question
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre question ou problème concernant votre raccordement..."
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Support Widget - Lazy loaded for better performance */}
      {isPageLoaded && (
        <Suspense fallback={null}>
          <div className="non-critical-content">
            <SupportWidget />
          </div>
        </Suspense>
      )}
    </div>
  );
}