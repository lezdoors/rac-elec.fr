import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bolt as BoltIcon, Building as BuildingIcon, Home as HomeIcon, Info as InfoIcon, MessageSquare as MessageSquareIcon, PhoneCall as PhoneCallIcon, Search as SearchIcon, Clock as ClockIcon, CreditCard as CreditCardIcon, ChevronRight as ChevronRightIcon, ArrowRight, Send as SendIcon, User as UserIcon, AtSign as AtSignIcon, FileText as FileTextIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { ElectricTransition } from "@/components/ui/electric-transition";

export default function FaqPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [activeItems, setActiveItems] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Array<{category: string, question: string, answer: string}>>([]);
  const [isCallAnimationPlaying, setIsCallAnimationPlaying] = useState(false);
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Insert FAQPage schema into head
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Quel est le coût d'un raccordement électrique Enedis ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le coût d'un raccordement électrique Enedis varie entre 1000€ et 3000€ selon la complexité du projet. Pour une maison neuve, comptez environ 1300-1800€. Les raccordements provisoires sont généralement moins coûteux (800-1500€). Le tarif dépend de la distance au réseau, de la puissance demandée et des travaux nécessaires. Notre service vous accompagne pour obtenir un devis détaillé et transparent d'Enedis."
          }
        },
        {
          "@type": "Question", 
          "name": "Combien de temps prend un raccordement électrique Enedis ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les délais de raccordement électrique Enedis varient entre 6 et 10 semaines pour un raccordement définitif standard. Pour les raccordements complexes nécessitant des travaux d'extension de réseau, comptez 3 à 6 mois. Les délais dépendent de la charge de travail d'Enedis, de la complexité technique et de la saison. Notre service d'accompagnement optimise ces délais en préparant parfaitement votre dossier."
          }
        },
        {
          "@type": "Question",
          "name": "Comment demander un raccordement électrique chez Enedis ?", 
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour demander un raccordement électrique Enedis, remplissez notre formulaire en ligne en indiquant vos coordonnées complètes, l'adresse précise du projet, la puissance électrique souhaitée et vos besoins spécifiques. Joignez les documents requis : permis de construire, plan de situation, plan de masse. Notre équipe d'experts vérifie votre dossier et le transmet à Enedis pour traitement prioritaire."
          }
        },
        {
          "@type": "Question",
          "name": "Quel est le délai moyen pour un raccordement provisoire Enedis ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le délai moyen pour un raccordement provisoire Enedis est de 3 à 5 semaines, nettement plus rapide qu'un raccordement définitif. Ce type de raccordement temporaire est idéal pour les chantiers, événements ou installations temporaires. La demande est simplifiée et les travaux moins complexes. Cependant, la puissance est limitée (généralement 36 kVA maximum) et la durée d'utilisation ne peut excéder 24 mois. Notre service accélère ces démarches."
          }
        },
        {
          "@type": "Question",
          "name": "Comment fonctionne un raccordement collectif pour immeuble ou lotissement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un raccordement collectif Enedis pour immeuble ou lotissement nécessite une approche coordonnée. Le promoteur ou syndic doit déposer une demande globale incluant tous les logements. Enedis étudie l'alimentation générale du bâtiment et dimensionne le poste de livraison. Chaque logement bénéficie ensuite d'un branchement individuel depuis ce poste. Les délais sont généralement de 3 à 6 mois selon la taille du projet. Notre expertise facilite ces démarches complexes."
          }
        },
        {
          "@type": "Question",
          "name": "Que faire si Enedis refuse mon dossier de raccordement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Si Enedis refuse votre dossier de raccordement, analysez d'abord les motifs du refus : documents manquants, non-conformité technique, contraintes réglementaires. Vous pouvez compléter votre dossier et reformuler la demande. En cas de désaccord persistant, saisissez le médiateur national de l'énergie. Notre service d'accompagnement expert analyse les refus, corrige les dossiers et maximise vos chances d'acceptation grâce à notre connaissance approfondie des exigences Enedis."
          }
        },
        {
          "@type": "Question",
          "name": "Faut-il un certificat Consuel pour le raccordement ? Quand l'obtenir ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le certificat Consuel est obligatoire pour tout raccordement électrique avant la mise en service par Enedis. Ce document atteste de la conformité de votre installation électrique aux normes de sécurité. Obtenez-le après la fin des travaux électriques mais avant la demande de mise en service. Un contrôleur Consuel agréé vérifie votre installation (comptez 80-120€). Sans ce certificat, Enedis refuse la mise en service. Notre service vous guide dans ces démarches obligatoires."
          }
        },
        {
          "@type": "Question",
          "name": "Comment gérer le droit de passage et les servitudes pour un raccordement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le droit de passage pour raccordement électrique permet à Enedis de faire passer les câbles sur des terrains privés. Si votre raccordement traverse une propriété tierce, une servitude légale s'applique automatiquement. Le propriétaire ne peut s'opposer mais a droit à une indemnisation pour les dommages. En cas de conflit, Enedis peut saisir le tribunal. Notre expertise juridique vous accompagne dans ces négociations délicates et optimise les accords amiables."
          }
        },
        {
          "@type": "Question",
          "name": "Quel est le lien entre compteur Linky et raccordement électrique ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le compteur Linky est automatiquement installé lors de tout nouveau raccordement électrique Enedis depuis 2015. Ce compteur communicant remplace les anciens modèles et permet la télé-relève, la gestion à distance et le suivi de consommation en temps réel. Pour les raccordements existants, Enedis procède progressivement au remplacement gratuit. Le Linky facilite les changements de puissance et les mises en service à distance, réduisant les délais et interventions physiques."
          }
        },
        {
          "@type": "Question",
          "name": "Comment annuler une demande de raccordement Enedis ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour annuler une demande de raccordement Enedis, contactez rapidement le service client en précisant votre numéro de dossier. Si les travaux n'ont pas commencé, l'annulation est généralement gratuite. Une fois les travaux débutés, des frais peuvent s'appliquer selon l'avancement. Enedis rembourse les sommes versées déduction faite des coûts engagés. Notre service vous aide à gérer ces annulations et négocier les meilleures conditions de remboursement."
          }
        },
        {
          "@type": "Question",
          "name": "Quels documents fournir pour un dossier de raccordement complet ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un dossier de raccordement Enedis complet nécessite : permis de construire ou déclaration préalable, plan de situation au 1/25000e, plan de masse côté détaillé, attestation d'assurance dommages-ouvrage, justificatifs d'identité et de propriété, formulaire Cerfa complété. Pour les professionnels, ajoutez le Kbis et l'attestation RT2012. Ces documents permettent à Enedis d'étudier la faisabilité technique. Notre service vérifie l'exhaustivité de votre dossier avant transmission pour éviter les retards."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles aides financières existent pour un raccordement électrique ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Plusieurs aides financières peuvent réduire le coût de votre raccordement électrique : subventions ANAH pour la rénovation énergétique, aides régionales et départementales, crédit d'impôt transition énergétique dans certains cas, éco-prêt à taux zéro pour travaux globaux. Les zones rurales bénéficient parfois de tarifs préférentiels. Pour les entreprises, consultez les aides à l'investissement productif. Notre service vous oriente vers les dispositifs applicables à votre situation."
          }
        },
        {
          "@type": "Question",
          "name": "Peut-on raccorder un abri de jardin au réseau électrique ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, il est possible de raccorder un abri de jardin au réseau électrique Enedis sous certaines conditions. L'abri doit être considéré comme une annexe habitée (atelier, bureau, local technique) et respecter les distances réglementaires. Un raccordement séparé nécessite un nouveau contrat et compteur dédié. Alternativement, reliez l'abri au tableau électrique principal via un câble souterrain conforme aux normes. Notre expertise technique vous conseille sur la solution optimale selon votre configuration."
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  // Fonction pour gérer la redirection directe sans animation vers la page de demande
  const handleRequestButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigation SPA instantanée
    setLocation("/raccordement-enedis#formulaire-raccordement");
  };

  // Fonction pour gérer l'appel téléphonique avec animation
  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCallAnimationPlaying(true);
    
    // Simuler un délai avant de passer l'appel
    setTimeout(() => {
      setIsCallAnimationPlaying(false);
      window.location.href = "tel:0970701643";
    }, 1500);
  };

  // Fonction pour soumettre le formulaire de contact
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les champs obligatoires
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive"
      });
      return;
    }

    // Soumettre le formulaire
    setIsSubmitting(true);
    
    try {
      // Envoi du formulaire via l'API
      const response = await apiRequest("POST", "/api/support/message", contactForm);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi du message");
      }
      
      // Réinitialiser le formulaire
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Afficher un toast de succès avec une animation
      toast({
        title: "✅ Message envoyé avec succès",
        description: data.message || "Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      
      // Fermer automatiquement la modale avec un léger délai pour une meilleure UX
      setTimeout(() => {
        document.querySelector<HTMLButtonElement>('[data-close-modal-contact]')?.click();
      }, 1500);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      
      // Message d'erreur personnalisé en fonction du type d'erreur
      let errorMessage = "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.";
      
      if (error.message.includes("SMTP")) {
        errorMessage = "Problème avec le serveur d'email. Veuillez nous contacter par téléphone ou réessayer plus tard.";
      } else if (error.message.includes("validation")) {
        errorMessage = "Vérifiez que tous les champs sont correctement remplis.";
      }
      
      toast({
        title: "❌ Échec de l'envoi",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Effet pour l'historique de consultation
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("faq_history");
      if (savedHistory) {
        setRecentlyViewed(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      // Réinitialiser l'historique en cas d'erreur
      localStorage.removeItem("faq_history");
    }
  }, []);

  // Fonction pour ajouter une question à l'historique
  const addToHistory = (question: string) => {
    try {
      setRecentlyViewed(prev => {
        const newHistory = [question, ...prev.filter(q => q !== question)].slice(0, 5);
        localStorage.setItem("faq_history", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout à l'historique:", error);
    }
  };

  // Gestion du clic sur une question
  const handleQuestionClick = (value: string, question: string) => {
    setActiveItems(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
    if (!activeItems.includes(value)) {
      addToHistory(question);
    }
  };

  // Traitement de la recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQuestions([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const results: Array<{category: string, question: string, answer: string}> = [];

    // Parcourir toutes les catégories et questions pour la recherche
    Object.entries(faqContent).forEach(([category, questions]) => {
      questions.forEach(({ question, answer }) => {
        if (
          question.toLowerCase().includes(searchTermLower) ||
          answer.toLowerCase().includes(searchTermLower)
        ) {
          results.push({ category, question, answer });
        }
      });
    });

    setFilteredQuestions(results);
  }, [searchTerm]);

  // Fonction pour vider la recherche
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredQuestions([]);
  };

  // Définir les catégories de FAQ
  const categories = [
    { id: "general", label: "Informations générales", icon: <InfoIcon className="h-4 w-4 mr-2" /> },
    { id: "raccordement", label: "Raccordement", icon: <BoltIcon className="h-4 w-4 mr-2" /> },
    { id: "miseenservice", label: "Mise en service", icon: <HomeIcon className="h-4 w-4 mr-2" /> },
    { id: "tarifs", label: "Tarifs et délais", icon: <BuildingIcon className="h-4 w-4 mr-2" /> },
    { id: "contact", label: "Contact et assistance", icon: <PhoneCallIcon className="h-4 w-4 mr-2" /> },
  ];

  // Contenu de la FAQ par catégorie
  const faqContent: Record<string, Array<{question: string, answer: string}>> = {
    general: [
      {
        question: "Qu'est-ce que le raccordement électrique ?",
        answer: "Le raccordement électrique est l'opération qui consiste à relier physiquement une installation électrique privée au réseau public de distribution d'électricité. Cette opération comprend la création d'une liaison entre le réseau existant et votre point de livraison, ainsi que l'installation d'un compteur électrique."
      },
      {
        question: "Qui est responsable du raccordement électrique en France ?",
        answer: "En France, c'est Enedis (anciennement ERDF) qui est le gestionnaire du réseau de distribution d'électricité pour environ 95% du territoire métropolitain. Enedis est responsable de la construction, de l'exploitation et de la maintenance du réseau public de distribution d'électricité. Dans certaines zones, ce sont des Entreprises Locales de Distribution (ELD) qui assurent cette mission."
      },
      {
        question: "Quelle est la différence entre le raccordement et la mise en service ?",
        answer: "Le raccordement est l'opération technique qui consiste à relier physiquement votre installation au réseau électrique. La mise en service est l'étape qui suit le raccordement et qui consiste à activer l'alimentation électrique de votre installation et à mettre en place un contrat avec un fournisseur d'électricité pour commencer à être approvisionné en électricité."
      },
      {
        question: "Pourquoi utiliser notre service de demande de raccordement ?",
        answer: "Notre service simplifie considérablement vos démarches de raccordement en prenant en charge la constitution de votre dossier et en vous guidant tout au long du processus. Nous vous faisons profiter de notre expertise pour éviter les erreurs courantes, réduire les délais et optimiser votre budget. De plus, nous assurons un suivi personnalisé de votre dossier auprès d'Enedis."
      },
      {
        question: "Combien de temps prend une procédure de raccordement ?",
        answer: "Les délais varient en fonction de la complexité de votre raccordement. Pour un raccordement simple (logement individuel en zone urbaine), comptez environ 6 à 8 semaines après validation de votre dossier. Pour des raccordements plus complexes (zone rurale, puissance élevée, etc.), les délais peuvent s'étendre jusqu'à plusieurs mois. Notre service vous permet d'optimiser ces délais en évitant les erreurs et les allers-retours administratifs."
      },
      {
        question: "Quelles sont les étapes d'un raccordement électrique ?",
        answer: "Le processus de raccordement comprend plusieurs étapes : 1) Dépôt de la demande de raccordement auprès d'Enedis, 2) Étude technique réalisée par Enedis, 3) Proposition technique et financière (devis), 4) Acceptation du devis et paiement, 5) Planification et réalisation des travaux de raccordement, 6) Installation du compteur, 7) Mise en service par un fournisseur d'électricité. Notre service vous accompagne à chaque étape pour faciliter ce parcours."
      },
      {
        question: "Est-ce que je peux gérer ma demande de raccordement moi-même ?",
        answer: "Oui, vous pouvez effectuer vous-même votre demande de raccordement directement auprès d'Enedis. Cependant, le processus peut s'avérer complexe, notamment en termes de documentation technique requise et de compréhension des normes électriques. Notre service d'accompagnement vous permet d'éviter les erreurs courantes, d'optimiser votre demande et de gagner du temps en vous libérant des démarches administratives."
      },
      {
        question: "Que dois-je faire avant de demander un raccordement électrique ?",
        answer: "Avant de demander un raccordement, vous devez : 1) Obtenir un permis de construire ou une autorisation d'urbanisme si nécessaire, 2) Définir vos besoins en électricité (puissance nécessaire), 3) Faire réaliser les plans de votre installation par un professionnel, 4) Choisir l'emplacement du compteur et du disjoncteur, 5) Préparer les documents techniques requis pour la demande. Notre formulaire en ligne vous guide pas à pas pour rassembler ces éléments."
      }
    ],
    raccordement: [
      {
        question: "Quel est le délai moyen pour un raccordement provisoire Enedis ?",
        answer: "Le délai moyen pour un raccordement provisoire Enedis est de 3 à 5 semaines, nettement plus rapide qu'un raccordement définitif. Ce type de raccordement temporaire est idéal pour les chantiers, événements ou installations temporaires. La demande est simplifiée et les travaux moins complexes. Cependant, la puissance est limitée (généralement 36 kVA maximum) et la durée d'utilisation ne peut excéder 24 mois. Notre service accélère ces démarches."
      },
      {
        question: "Comment fonctionne un raccordement collectif pour immeuble ou lotissement ?",
        answer: "Un raccordement collectif Enedis pour immeuble ou lotissement nécessite une approche coordonnée. Le promoteur ou syndic doit déposer une demande globale incluant tous les logements. Enedis étudie l'alimentation générale du bâtiment et dimensionne le poste de livraison. Chaque logement bénéficie ensuite d'un branchement individuel depuis ce poste. Les délais sont généralement de 3 à 6 mois selon la taille du projet. Notre expertise facilite ces démarches complexes."
      },
      {
        question: "Que faire si Enedis refuse mon dossier de raccordement ?",
        answer: "Si Enedis refuse votre dossier de raccordement, analysez d'abord les motifs du refus : documents manquants, non-conformité technique, contraintes réglementaires. Vous pouvez compléter votre dossier et reformuler la demande. En cas de désaccord persistant, saisissez le médiateur national de l'énergie. Notre service d'accompagnement expert analyse les refus, corrige les dossiers et maximise vos chances d'acceptation grâce à notre connaissance approfondie des exigences Enedis."
      },
      {
        question: "Comment gérer le droit de passage et les servitudes pour un raccordement ?",
        answer: "Le droit de passage pour raccordement électrique permet à Enedis de faire passer les câbles sur des terrains privés. Si votre raccordement traverse une propriété tierce, une servitude légale s'applique automatiquement. Le propriétaire ne peut s'opposer mais a droit à une indemnisation pour les dommages. En cas de conflit, Enedis peut saisir le tribunal. Notre expertise juridique vous accompagne dans ces négociations délicates et optimise les accords amiables."
      },
      {
        question: "Peut-on raccorder un abri de jardin au réseau électrique ?",
        answer: "Oui, il est possible de raccorder un abri de jardin au réseau électrique Enedis sous certaines conditions. L'abri doit être considéré comme une annexe habitée (atelier, bureau, local technique) et respecter les distances réglementaires. Un raccordement séparé nécessite un nouveau contrat et compteur dédié. Alternativement, reliez l'abri au tableau électrique principal via un câble souterrain conforme aux normes. Notre expertise technique vous conseille sur la solution optimale selon votre configuration."
      },
      {
        question: "Quels sont les types de raccordement proposés par Enedis ?",
        answer: "Enedis propose plusieurs types de raccordement selon vos besoins : le raccordement individuel (pour un logement individuel), le raccordement collectif (pour un immeuble), le raccordement d'un lotissement, le raccordement provisoire (pour un chantier ou un événement temporaire), et le raccordement pour une installation de production d'électricité (panneaux photovoltaïques, éoliennes, etc.)."
      },
      {
        question: "Quels documents sont nécessaires pour faire une demande de raccordement ?",
        answer: "Pour une demande de raccordement, vous aurez besoin des documents suivants : un plan de situation (carte IGN ou extrait du cadastre), un plan de masse indiquant l'emplacement souhaité du coffret en limite de propriété, le permis de construire ou l'autorisation d'urbanisme, et selon les cas, une attestation de conformité délivrée par le Consuel, les caractéristiques techniques de votre installation électrique, et un mandat si vous faites appel à un tiers pour vos démarches."
      },
      {
        question: "Comment savoir quelle puissance de raccordement demander ?",
        answer: "La puissance de raccordement dépend de vos équipements électriques et de votre consommation. Pour une maison standard (100-150m²), une puissance de 9 kVA est généralement suffisante. Pour une maison plus grande ou équipée de nombreux appareils énergivores (chauffage électrique, climatisation, spa, etc.), une puissance de 12 kVA ou plus peut être nécessaire. Notre formulaire vous guide dans cette estimation en fonction des informations que vous nous fournissez sur votre logement et vos équipements."
      },
      {
        question: "Peut-on modifier la puissance de son raccordement après l'installation ?",
        answer: "Oui, il est possible de modifier la puissance de votre raccordement après l'installation. Si vous souhaitez augmenter la puissance, cela peut nécessiter des travaux d'adaptation de votre installation électrique et éventuellement du réseau. Si vous souhaitez la diminuer, cela est généralement plus simple. Dans tous les cas, une demande doit être adressée à Enedis via votre fournisseur d'électricité."
      },
      {
        question: "Qu'est-ce que le branchement en souterrain et en aérien ?",
        answer: "Le branchement souterrain consiste à faire passer les câbles électriques sous terre entre le réseau public et votre installation. C'est la solution privilégiée en zone urbaine et pour les constructions neuves. Le branchement aérien consiste à faire passer les câbles en hauteur, suspendus à des poteaux ou fixés en façade. Le choix entre ces deux types de branchement dépend de la configuration du terrain, des réglementations locales et de l'esthétique souhaitée."
      },
      {
        question: "Qu'est-ce que le Consuel et quand est-il nécessaire ?",
        answer: "Le Consuel (Comité National pour la Sécurité des Usagers de l'Électricité) est un organisme qui délivre une attestation de conformité de votre installation électrique aux normes de sécurité en vigueur. Cette attestation est obligatoire pour toute nouvelle installation électrique avant sa mise en service, ainsi que pour les installations ayant fait l'objet de modifications substantielles. Le Consuel intervient après la réalisation des travaux par votre électricien et avant la mise en service par Enedis."
      },
      {
        question: "Comment se passe la viabilisation d'un terrain non construit ?",
        answer: "La viabilisation d'un terrain consiste à le raccorder aux différents réseaux (électricité, eau, gaz, télécommunications). Pour le raccordement électrique, il faut d'abord vérifier la proximité du réseau existant, puis déposer une demande de raccordement anticipé auprès d'Enedis. Cette démarche peut être réalisée avant la construction pour préparer le terrain. Les travaux comprennent généralement l'installation d'un coffret en limite de propriété qui servira ultérieurement au raccordement définitif de la construction."
      }
    ],
    miseenservice: [
      {
        question: "Faut-il un certificat Consuel pour le raccordement ? Quand l'obtenir ?",
        answer: "Le certificat Consuel est obligatoire pour tout raccordement électrique avant la mise en service par Enedis. Ce document atteste de la conformité de votre installation électrique aux normes de sécurité. Obtenez-le après la fin des travaux électriques mais avant la demande de mise en service. Un contrôleur Consuel agréé vérifie votre installation (comptez 80-120€). Sans ce certificat, Enedis refuse la mise en service. Notre service vous guide dans ces démarches obligatoires."
      },
      {
        question: "Quel est le lien entre compteur Linky et raccordement électrique ?",
        answer: "Le compteur Linky est automatiquement installé lors de tout nouveau raccordement électrique Enedis depuis 2015. Ce compteur communicant remplace les anciens modèles et permet la télé-relève, la gestion à distance et le suivi de consommation en temps réel. Pour les raccordements existants, Enedis procède progressivement au remplacement gratuit. Le Linky facilite les changements de puissance et les mises en service à distance, réduisant les délais et interventions physiques."
      },
      {
        question: "Comment annuler une demande de raccordement Enedis ?",
        answer: "Pour annuler une demande de raccordement Enedis, contactez rapidement le service client en précisant votre numéro de dossier. Si les travaux n'ont pas commencé, l'annulation est généralement gratuite. Une fois les travaux débutés, des frais peuvent s'appliquer selon l'avancement. Enedis rembourse les sommes versées déduction faite des coûts engagés. Notre service vous aide à gérer ces annulations et négocier les meilleures conditions de remboursement."
      },
      {
        question: "Comment demander la mise en service de mon compteur électrique ?",
        answer: "Pour demander la mise en service de votre compteur électrique, vous devez d'abord souscrire un contrat auprès du fournisseur d'électricité de votre choix. C'est ce fournisseur qui se chargera ensuite de contacter Enedis pour programmer la mise en service. Si votre compteur est déjà installé et que l'installation est conforme (attestation Consuel), la mise en service peut généralement être effectuée dans les 5 jours ouvrés."
      },
      {
        question: "Dois-je être présent lors de la mise en service ?",
        answer: "Pour la mise en service d'un compteur Linky, votre présence n'est pas nécessaire car l'opération peut être réalisée à distance. Pour les autres types de compteurs, la présence d'une personne majeure est généralement requise pour accéder au compteur. Si votre compteur est accessible depuis l'extérieur de votre logement, votre présence peut ne pas être nécessaire. Dans tous les cas, Enedis ou votre fournisseur vous informera des modalités précises."
      },
      {
        question: "Qu'est-ce que le compteur Linky et quels sont ses avantages ?",
        answer: "Le compteur Linky est un compteur électrique communicant déployé par Enedis depuis 2015. Ses principaux avantages sont : la relève automatique des consommations (sans déplacement d'un technicien), la facturation basée sur la consommation réelle (et non estimée), la possibilité de suivre sa consommation en temps réel via un espace client en ligne, la réalisation de certaines opérations à distance (mise en service, changement de puissance), et une meilleure détection des pannes sur le réseau."
      },
      {
        question: "Que faire en cas de dysfonctionnement après la mise en service ?",
        answer: "En cas de dysfonctionnement après la mise en service (coupure de courant, disjoncteur qui saute fréquemment, etc.), vérifiez d'abord votre tableau électrique et le disjoncteur général. Si le problème persiste, contactez Enedis au 09 72 67 50 XX (XX étant le numéro de votre département) pour signaler une panne. Si le problème concerne votre installation intérieure, faites appel à un électricien. Si le problème concerne votre contrat ou votre facturation, contactez directement votre fournisseur d'électricité."
      },
      {
        question: "Comment choisir mon fournisseur d'électricité ?",
        answer: "Le choix du fournisseur d'électricité dépend de vos priorités : tarifs, services client, engagement environnemental, etc. Pour comparer les offres, vous pouvez utiliser le comparateur officiel du médiateur national de l'énergie (energie-info.fr). Notez que quel que soit votre fournisseur, c'est toujours Enedis qui gère le réseau et assure la qualité de la distribution d'électricité jusqu'à votre compteur. Vous pouvez changer de fournisseur à tout moment, sans frais et sans coupure d'électricité."
      }
    ],
    tarifs: [
      {
        question: "Quels documents fournir pour un dossier de raccordement complet ?",
        answer: "Un dossier de raccordement Enedis complet nécessite : permis de construire ou déclaration préalable, plan de situation au 1/25000e, plan de masse côté détaillé, attestation d'assurance dommages-ouvrage, justificatifs d'identité et de propriété, formulaire Cerfa complété. Pour les professionnels, ajoutez le Kbis et l'attestation RT2012. Ces documents permettent à Enedis d'étudier la faisabilité technique. Notre service vérifie l'exhaustivité de votre dossier avant transmission pour éviter les retards."
      },
      {
        question: "Quelles aides financières existent pour un raccordement électrique ?",
        answer: "Plusieurs aides financières peuvent réduire le coût de votre raccordement électrique : subventions ANAH pour la rénovation énergétique, aides régionales et départementales, crédit d'impôt transition énergétique dans certains cas, éco-prêt à taux zéro pour travaux globaux. Les zones rurales bénéficient parfois de tarifs préférentiels. Pour les entreprises, consultez les aides à l'investissement productif. Notre service vous oriente vers les dispositifs applicables à votre situation."
      },
      {
        question: "Combien coûte un raccordement électrique ?",
        answer: "Le coût d'un raccordement électrique varie selon plusieurs facteurs : la distance entre votre installation et le réseau existant, la puissance demandée, le type de branchement (souterrain ou aérien), et les éventuels travaux d'extension du réseau nécessaires. Pour un raccordement standard en zone urbaine, comptez entre 1000€ et 2000€. Pour des situations plus complexes (zone rurale, forte puissance), le coût peut atteindre plusieurs milliers d'euros. Un devis précis vous sera fourni par Enedis après étude de votre dossier."
      },
      {
        question: "Quels sont les délais pour obtenir un raccordement électrique ?",
        answer: "Les délais pour obtenir un raccordement électrique varient selon la complexité de votre projet. Pour un raccordement simple sans extension de réseau, comptez environ 6 semaines après acceptation du devis. Pour un raccordement nécessitant des travaux d'extension du réseau, les délais peuvent s'étendre à 4-6 mois. Ces délais peuvent être prolongés en cas de contraintes techniques particulières ou de nécessité d'obtenir des autorisations administratives (travaux sur la voie publique, etc.)."
      },
      {
        question: "Existe-t-il des aides financières pour le raccordement électrique ?",
        answer: "Oui, plusieurs aides peuvent réduire le coût de votre raccordement électrique. Dans certaines communes, une prise en charge partielle peut être assurée par la collectivité. Pour les projets d'énergies renouvelables, des subventions spécifiques existent. Si le raccordement concerne une résidence principale et s'inscrit dans une rénovation énergétique, vous pourriez bénéficier de certaines aides comme MaPrimeRénov'. Enfin, certains coûts peuvent être éligibles à une TVA réduite (5,5% ou 10% selon les cas)."
      },
      {
        question: "Comment sont calculés les tarifs de mise en service ?",
        answer: "Les tarifs de mise en service sont fixés par la Commission de Régulation de l'Énergie (CRE) et varient selon le type d'intervention nécessaire. Pour une mise en service simple avec un compteur communicant Linky, le tarif est d'environ 15€. Pour une mise en service nécessitant le déplacement d'un technicien, le tarif est d'environ 50€. Ces frais sont généralement inclus dans votre première facture d'électricité après la souscription de votre contrat auprès d'un fournisseur."
      },
      {
        question: "Quel est le coût de notre service d'accompagnement ?",
        answer: "Notre service d'accompagnement pour votre demande de raccordement est proposé au tarif fixe de 129,80€ TTC. Ce montant couvre l'analyse complète de votre projet, la constitution et le dépôt de votre dossier auprès d'Enedis, ainsi qu'un suivi personnalisé tout au long de la procédure. Grâce à notre expertise, vous évitez les erreurs courantes qui peuvent entraîner des retards et des coûts supplémentaires, ce qui rend notre service particulièrement avantageux d'un point de vue économique."
      }
    ],
    contact: [
      {
        question: "Comment contacter Enedis en cas de problème ?",
        answer: "Pour contacter Enedis, plusieurs options s'offrent à vous selon la nature de votre demande. En cas de panne ou d'urgence, appelez le 09 72 67 50 XX (XX étant le numéro de votre département), disponible 24h/24 et 7j/7. Pour suivre votre dossier de raccordement, connectez-vous à votre espace client sur le site d'Enedis ou appelez le 09 70 83 19 70. Pour toute autre demande, vous pouvez utiliser le formulaire de contact sur le site enedis.fr ou l'application mobile Enedis à mes côtés."
      },
      {
        question: "Comment suivre l'avancement de ma demande de raccordement ?",
        answer: "Lorsque vous passez par notre service, nous vous fournissons un accès à un espace client personnalisé où vous pouvez suivre en temps réel l'avancement de votre dossier. Vous recevez également des notifications à chaque étape clé (validation du dossier, proposition technique et financière, planification des travaux, etc.). Si vous avez des questions spécifiques, notre équipe de conseillers est disponible par téléphone ou par email pour vous apporter des réponses précises sur votre situation."
      },
      {
        question: "Qui contacter en cas de coupure d'électricité ?",
        answer: "En cas de coupure d'électricité, vérifiez d'abord votre disjoncteur et ceux de vos voisins pour déterminer si le problème est localisé ou général. Si le problème est sur votre installation, contactez un électricien. Si le problème semble venir du réseau, contactez Enedis au 09 72 67 50 XX (XX étant le numéro de votre département). Ce service est disponible 24h/24 et 7j/7. Vous pouvez également consulter la carte des coupures sur le site d'Enedis ou l'application 'Enedis à mes côtés' pour savoir si une coupure est déjà signalée dans votre secteur."
      },
      {
        question: "Comment porter réclamation auprès d'Enedis ?",
        answer: "Pour porter réclamation auprès d'Enedis, plusieurs canaux sont disponibles : par courrier à l'adresse de votre direction régionale (disponible sur enedis.fr), via le formulaire de réclamation en ligne sur le site d'Enedis, par téléphone au 09 70 83 19 70, ou en vous rendant dans un point d'accueil Enedis. Précisez votre référence client et détaillez clairement l'objet de votre réclamation. Si vous n'obtenez pas de réponse satisfaisante dans un délai de deux mois, vous pouvez saisir le Médiateur National de l'Énergie (energie-mediateur.fr)."
      },
      {
        question: "Comment nous contacter pour plus d'informations ?",
        answer: "Pour obtenir plus d'informations sur nos services ou pour toute question relative à votre projet de raccordement, vous pouvez nous contacter par téléphone au numéro affiché en haut de page, par email via notre formulaire de contact accessible en cliquant sur l'adresse email dans le pied de page, ou en utilisant le formulaire de contact disponible sur notre site. Notre équipe de conseillers experts est disponible du lundi au vendredi de 9h à 18h pour vous accompagner et répondre à toutes vos questions."
      }
    ]
  };

  return (
    <Layout>
      <div id="top" className="container max-w-7xl mx-auto px-4 py-8 sm:py-16 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-700 mb-4">
              <MessageSquareIcon className="inline-block mr-3 h-8 w-8 text-blue-600" />
              Foire Aux Questions
            </h1>
            <p className="text-lg text-gray-600 mt-2 mb-6">
              Retrouvez les réponses aux questions les plus fréquemment posées sur le raccordement électrique et la mise en service en France
            </p>
            
            {/* Navigation par catégories - Design amélioré */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-8 max-w-4xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchTerm("");
                    // Navigation fluide vers la section de contenu FAQ
                    setTimeout(() => {
                      // Chercher l'élément de contenu de FAQ actif
                      const contentSection = document.querySelector('.faq-content-section') || 
                                           document.querySelector('[role="tabpanel"]') ||
                                           document.getElementById(`faq-section-${category.id}`);
                      
                      if (contentSection) {
                        const offset = 120; // Offset pour le header fixe
                        const elementPosition = contentSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }, 150);
                  }}
                  className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl"
                      : "bg-white text-blue-700 border border-blue-100 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {/* Effet de brillance au survol */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                    selectedCategory === category.id 
                      ? "bg-gradient-to-r from-white/20 to-transparent" 
                      : "bg-gradient-to-r from-blue-500/10 to-transparent"
                  }`}></div>
                  
                  <div className="relative flex flex-col items-center text-center">
                    {/* Icône avec animation */}
                    <div className={`mb-2 p-2 rounded-full transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                    }`}>
                      {React.cloneElement(category.icon, { 
                        className: "h-5 w-5 transition-transform duration-300 group-hover:scale-110" 
                      })}
                    </div>
                    
                    {/* Label avec typographie améliorée */}
                    <span className="text-sm font-semibold leading-tight">
                      {category.label}
                    </span>
                    
                    {/* Indicateur du nombre de questions */}
                    <span className={`mt-1 text-xs opacity-75 ${
                      selectedCategory === category.id ? "text-blue-100" : "text-blue-500"
                    }`}>
                      {faqContent[category.id].length} questions
                    </span>
                  </div>
                  
                  {/* Indicateur de sélection */}
                  {selectedCategory === category.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-8">
            <div className="flex items-center border-2 border-blue-100 rounded-lg focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500 bg-white">
              <SearchIcon className="h-5 w-5 text-gray-400 ml-3" />
              <Input
                type="text"
                placeholder="Rechercher une question ou un mot clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Questions récemment consultées - Masquée sur mobile pour éviter la redondance */}
          {recentlyViewed.length > 0 && !searchTerm && !isMobile && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center text-blue-700 mb-3">
                <ClockIcon className="h-4 w-4 mr-2" />
                <h3 className="font-medium">Questions récemment consultées</h3>
              </div>
              <ul className="space-y-2">
                {recentlyViewed.map((question, index) => (
                  <li key={index} className="text-sm">
                    <button 
                      className="flex items-center text-left hover:text-blue-600 text-gray-700"
                      onClick={() => {
                        // Trouver la question correspondante
                        setSearchTerm(question);
                      }}
                    >
                      <ChevronRightIcon className="h-3 w-3 mr-2 flex-shrink-0 text-blue-400" />
                      <span>{question}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Résultats de recherche */}
          {searchTerm && filteredQuestions.length > 0 && (
            <div className="mb-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-blue-700 mb-3 flex items-center">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Résultats de recherche pour "{searchTerm}"
                  <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {filteredQuestions.length} résultat{filteredQuestions.length > 1 ? 's' : ''}
                  </Badge>
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {filteredQuestions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`search-${index}`}
                      className="border-b border-blue-100 last:border-0"
                    >
                      <AccordionTrigger 
                        className="text-left font-medium hover:text-blue-600"
                        onClick={() => handleQuestionClick(`search-${index}`, faq.question)}
                      >
                        <div className="flex items-start">
                          <Badge className="mt-0.5 mr-2 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100">
                            {categories.find(c => c.id === faq.category)?.label}
                          </Badge>
                          <span dangerouslySetInnerHTML={{ 
                            __html: faq.question.replace(
                              new RegExp(searchTerm, 'gi'), 
                              match => `<span class="bg-yellow-100">${match}</span>`
                            )
                          }} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700 pt-2 pb-1 px-1" dangerouslySetInnerHTML={{ 
                          __html: faq.answer.replace(
                            new RegExp(searchTerm, 'gi'), 
                            match => `<span class="bg-yellow-100 font-medium">${match}</span>`
                          )
                        }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <button 
                  onClick={clearSearch}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Revenir à toutes les questions</span>
                </button>
              </div>
            </div>
          )}

          {/* Aucun résultat de recherche */}
          {searchTerm && filteredQuestions.length === 0 && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-gray-500 mb-4">
                <SearchIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">Aucun résultat trouvé</h3>
                <p className="text-gray-500">
                  Aucune question correspondant à "{searchTerm}" n'a été trouvée.
                </p>
              </div>
              <button 
                onClick={clearSearch}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir toutes les questions
              </button>
            </div>
          )}

          {/* Navigation par onglets - visible seulement si pas de recherche */}
          {!searchTerm && (
            <Card className="mb-8 overflow-hidden shadow-md faq-content-section">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 py-4">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <CardTitle className="text-blue-700 flex items-center text-xl">
                      <BoltIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Informations sur le raccordement Enedis
                    </CardTitle>
                    <CardDescription className="text-sm text-blue-600/70">
                      Comprendre les processus de raccordement et de mise en service électrique en France
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-2 px-4">
                <Tabs 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  className="w-full"
                >

                  {categories.map((category) => (
                    <TabsContent 
                      key={category.id} 
                      value={category.id}
                      id={`faq-section-${category.id}`}
                      className="data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-50 data-[state=active]:fade-in-50 transition-all scroll-mt-24"
                    >
                      {/* En-tête de section amélioré */}
                      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-600 rounded-lg mr-3">
                            {React.cloneElement(categories.find(c => c.id === category.id)?.icon || <InfoIcon className="h-5 w-5" />, { 
                              className: "h-5 w-5 text-white" 
                            })}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-blue-800">{category.label}</h3>
                            <p className="text-sm text-blue-600">Réponses détaillées à vos questions</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm font-medium">
                          {faqContent[category.id].length} questions
                        </Badge>
                      </div>
                      <Accordion 
                        type="single" 
                        collapsible 
                        className="w-full"
                      >
                        {faqContent[category.id].map((faq: {question: string, answer: string}, index: number) => {
                          const itemValue = `${category.id}-${index}`;
                          return (
                            <AccordionItem 
                              key={itemValue} 
                              value={itemValue}
                              className={cn(
                                "mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300", 
                                activeItems.includes(itemValue) && "border-blue-300 shadow-lg ring-2 ring-blue-100"
                              )}
                            >
                              <AccordionTrigger 
                                className="text-left font-medium text-gray-900 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-blue-100 transition-all duration-300 group"
                                onClick={() => handleQuestionClick(itemValue, faq.question)}
                              >
                                <div className="flex items-center space-x-4 w-full">
                                  {/* Numéro de question stylisé */}
                                  <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                                    activeItems.includes(itemValue)
                                      ? "bg-blue-600 text-white shadow-md" 
                                      : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                                  )}>
                                    {index + 1}
                                  </div>
                                  
                                  {/* Question avec prévisualisation */}
                                  <div className="flex-1 text-left">
                                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 leading-tight mb-1">
                                      {faq.question}
                                    </h4>
                                    {!activeItems.includes(itemValue) && (
                                      <p className="text-sm text-gray-500 line-clamp-1">
                                        {faq.answer.substring(0, 100)}...
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Icône d'expansion améliorée */}
                                  <div className="flex-shrink-0">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                      activeItems.includes(itemValue)
                                        ? "bg-blue-600 text-white rotate-90" 
                                        : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                    )}>
                                      <ChevronRightIcon className="h-4 w-4 transition-transform duration-300" />
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              
                              <AccordionContent className="px-6 pb-6">
                                <div className="pt-4 border-t border-gray-100">
                                  {/* Contenu de la réponse avec typographie améliorée */}
                                  <div className="prose prose-blue max-w-none">
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                                      {faq.answer}
                                    </div>
                                  </div>
                                  
                                  {/* Actions et feedback */}
                                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm text-gray-500">Cette réponse vous a-t-elle été utile ?</span>
                                      <div className="flex space-x-2">
                                        <button className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200">
                                          <span className="mr-1">👍</span>
                                          Oui
                                        </button>
                                        <button className="flex items-center px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200">
                                          <span className="mr-1">👎</span>
                                          Non
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Tag de catégorie */}
                                    <Badge variant="secondary" className="text-xs">
                                      {categories.find(c => c.id === category.id)?.label}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Lien rapide de demande */}
          <div className="mb-8 max-w-xl mx-auto">
            <a 
              href="/raccordement-enedis" 
              className="flex items-center p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              onClick={handleRequestButtonClick}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 text-lg">Demande de raccordement Enedis</h3>
                <p className="text-gray-600">Remplissez notre formulaire pour démarrer votre demande</p>
              </div>
              <div className="ml-auto">
                <span className="flex h-8 w-8 rounded-full bg-blue-100 text-blue-600 items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mt-8 text-center shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-3">
              Besoin d'une réponse personnalisée ?
            </h2>
            <p className="text-blue-100 mb-4">
              Notre équipe d'experts est disponible pour répondre à toutes vos questions spécifiques concernant votre projet de raccordement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              {/* Bouton d'appel avec animation */}
              <button
                onClick={handleCallClick}
                className="inline-flex items-center justify-center px-5 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm relative overflow-hidden"
                disabled={isCallAnimationPlaying}
              >
                <div className={`absolute inset-0 bg-blue-100 transition-transform duration-1000 rounded-lg ${
                  isCallAnimationPlaying 
                    ? "scale-x-100" 
                    : "scale-x-0 origin-left"
                }`}></div>
                
                <span className="relative flex items-center">
                  <span className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                    isCallAnimationPlaying ? "animate-ping bg-green-400" : "bg-blue-500"
                  }`}>
                    <PhoneCallIcon className="h-3 w-3 text-white" />
                  </span>
                  {isCallAnimationPlaying ? "Appel en cours..." : "Nous appeler"}
                </span>
              </button>
              
              {/* Bouton pour ouvrir la modale de contact */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center px-5 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Nous contacter
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[500px] p-0 overflow-hidden">
                  <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <DialogTitle className="text-white flex items-center">
                      <MessageSquareIcon className="h-5 w-5 mr-2" />
                      Contactez notre équipe d'experts
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1">
                      Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleContactSubmit} className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium flex items-center">
                            <UserIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            Votre nom
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Prénom et nom"
                            value={contactForm.name}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium flex items-center">
                            <AtSignIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            Votre email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="exemple@domaine.com"
                            value={contactForm.email}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-sm font-medium flex items-center">
                            <FileTextIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            Sujet
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Objet de votre message"
                            value={contactForm.subject}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-sm font-medium flex items-center">
                            <MessageSquareIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            Votre message
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Décrivez votre demande en détail..."
                            rows={5}
                            value={contactForm.message}
                            onChange={handleInputChange}
                            className="w-full resize-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                      <DialogClose asChild>
                        <Button variant="outline" data-close-modal-contact>
                          Annuler
                        </Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={cn(
                          "relative overflow-hidden transition-all duration-300",
                          isSubmitting 
                            ? "bg-blue-500 hover:bg-blue-500" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {isSubmitting && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-90">
                            <div className="flex items-center space-x-1">
                              <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                              <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                              <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                          </div>
                        )}
                        <span className="flex items-center min-w-[120px] justify-center">
                          {isSubmitting ? (
                            <>
                              <span className="opacity-0">
                                <SendIcon className="h-4 w-4 mr-2" />
                                Envoi en cours...
                              </span>
                            </>
                          ) : (
                            <>
                              <SendIcon className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                              Envoyer
                            </>
                          )}
                        </span>
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      {/* Composant de transition électrique */}
      <ElectricTransition 
        isActive={isTransitionActive} 
        destination="/raccordement-enedis"
      />
    </Layout>
  );
}