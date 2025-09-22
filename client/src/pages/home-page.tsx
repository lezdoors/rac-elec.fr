import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Form } from "@/components/ui/form";
import { FormStep1 } from "@/components/form-step-1";
import { CheckCircle2, ChevronLeft, ChevronRight, Menu, Phone, X, Zap, Building, Users, Mail } from "lucide-react";
import { FloatingCtaButton } from "@/components/floating-cta-button";
import { SupportWidget } from "@/components/support-widget";
import { ContactModal } from "@/components/contact-modal";

// Form schema for FormStep1
const heroFormSchema = z.object({
  clientType: z.enum(["particulier", "professionnel", "collectivite"]),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(10, "Le numéro de téléphone est requis"),
  raisonSociale: z.string().optional(),
  siren: z.string().optional(),
  nomCollectivite: z.string().optional(),
  sirenCollectivite: z.string().optional(),
});

type HeroFormData = z.infer<typeof heroFormSchema>;

export default function HomePage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [, navigate] = useLocation();

  const heroForm = useForm<HeroFormData>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      clientType: "particulier",
      nom: "",
      prenom: "",
      email: "",
      phone: "",
    },
  });

  const handleHeroSubmit = async (data: HeroFormData) => {
    try {
      setShowSuccessMessage(true);
      
      // Store form data in sessionStorage
      sessionStorage.setItem("heroFormStep1Data", JSON.stringify(data));
      
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate("/raccordement-enedis?step=2&hero=true");
      }, 1500);
    } catch (error) {
      console.error("Error submitting hero form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <main>
        <section id="hero" className="bg-[#0046a2] text-white py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Raccordement électrique Enedis, simplifié.
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Un seul formulaire, un accompagnement complet.
            </p>
            <div className="text-center mt-8">
              <a href="#formulaire-raccordement">
                <button 
                  className="bg-yellow-400 text-black font-bold px-12 py-6 rounded-xl text-xl md:text-2xl hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-2xl border-4 border-yellow-300"
                  data-testid="button-commencer-demande"
                >
                  Commencer ma demande
                </button>
              </a>
              <p className="text-white/80 text-sm mt-6">145 raccordements traités ce mois-ci</p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-white" id="formulaire-raccordement">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Votre demande de raccordement Enedis
                </h2>
                <p className="text-lg text-gray-600">
                  Particuliers et professionnels. Un seul formulaire pour tous types de raccordements.
                </p>
              </div>

              {/* Hero Form */}
              <Form {...heroForm}>
                <form onSubmit={heroForm.handleSubmit(handleHeroSubmit)} className="space-y-4">
                  <FormStep1 form={heroForm} />
                  
                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-400 rounded-lg font-medium cursor-not-allowed opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-medium rounded-lg"
                      data-testid="button-submit-hero-form"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </Form>

              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-green-800 font-semibold">Informations enregistrées !</p>
                      <p className="text-green-700 text-sm mt-1">
                        Redirection vers l'étape 2 pour finaliser votre demande...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quel type de raccordement vous correspond ? */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Quel type de raccordement vous correspond ?
                </h2>
                <p className="text-gray-600 mb-2">Choisir un projet de raccordement. Découvrez la solution électrique adaptée à vos besoins spécifiques.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Raccordement Définitif */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Définitif</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Pour maisons individuelles, appartements et locaux professionnels
                  </p>
                  <p className="text-xs text-gray-500 mb-4">À partir de 1 300 €</p>
                  <a href="#formulaire-raccordement" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>

                {/* Raccordement Provisoire */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Provisoire</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Solution temporaire pour chantiers et installations temporaires
                  </p>
                  <p className="text-xs text-gray-500 mb-4">À partir de 800 €</p>
                  <a href="#formulaire-raccordement" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>

                {/* Viabilisation */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Menu className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Viabilisation</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Préparation et équipement électrique de votre terrain
                  </p>
                  <p className="text-xs text-gray-500 mb-4">À partir de 2 200 €</p>
                  <a href="#formulaire-raccordement" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>

                {/* Modification */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Modification</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Association et mise à niveau de votre installation existante
                  </p>
                  <p className="text-xs text-gray-500 mb-4">À partir de 900 €</p>
                  <a href="#formulaire-raccordement" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>

                {/* Raccordement Collectif */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raccordement Collectif</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Solutions pour promoteurs, équipementiers et entreprises
                  </p>
                  <p className="text-xs text-gray-500 mb-4">Sur devis personnalisé</p>
                  <a href="#formulaire-raccordement" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>

                {/* Production Électrique */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow bg-green-50">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Production Électrique</h3>
                  <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium mb-2">
                    Nouveau
                  </span>
                  <p className="text-gray-600 text-sm mb-4">
                    Raccordement pour panneaux solaires et production d'énergie verte
                  </p>
                  <p className="text-xs text-gray-500 mb-4">À partir de 1 800 €</p>
                  <a href="#formulaire-raccordement" className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors">
                    En savoir plus →
                  </a>
                </div>
              </div>

              {/* Question d'aide */}
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-4">
                  <strong>Besoin d'aide pour choisir ?</strong>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Nos experts vous accompagnent dans le choix de la solution la plus adaptée à votre projet.
                </p>
                <a href="tel:0970709570" className="text-blue-600 font-medium hover:text-blue-700">
                  ☎ 09 70 70 95 70
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Service de raccordement électrique Enedis en ligne - Processus détaillé */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Service de raccordement électrique Enedis en ligne
                </h2>
                <p className="text-gray-600">Étapes du processus de raccordement électrique Enedis</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Demande en ligne</h3>
                  <p className="text-gray-600 text-sm">Formulaire sécurisé depuis cette plateforme</p>
                  <p className="text-xs text-gray-500 mt-2">Délai : instantané</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Étude et devis</h3>
                  <p className="text-gray-600 text-sm">Analyse technique et proposition économique</p>
                  <p className="text-xs text-gray-500 mt-2">Délai : 7 à 15 jours</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Travaux de raccordement</h3>
                  <p className="text-gray-600 text-sm">Réalisation des travaux par nos équipes qualifiées</p>
                  <p className="text-xs text-gray-500 mt-2">Délai : 4 à 6 semaines</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mise en service</h3>
                  <p className="text-gray-600 text-sm">Finalisation et activation de votre raccordement</p>
                  <p className="text-xs text-gray-500 mt-2">Délai : 1 à 2 jours</p>
                </div>
              </div>


              <div className="text-center">
                <a href="#formulaire-raccordement">
                  <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                    Commencer votre raccordement Enedis
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* Performance Indicators */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Indicateurs de performance du service de raccordement Enedis
                </h2>
                <p className="text-gray-600">
                  Quelques chiffres clés pour illustrer nos engagements de raccordement électrique Enedis. L'objectif de l'ensemble de nos équipes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center bg-white p-8 rounded-lg border">
                  <div className="text-4xl font-bold text-blue-600 mb-2">99.2%</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction globale raccordement</h3>
                  <p className="text-sm text-gray-600">
                    Chaque semaine, nous collectons la qualité de service de nos conseillers dédiés aux raccordements électriques.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Étude : 140 raccordements Enedis</p>
                </div>

                <div className="text-center bg-white p-8 rounded-lg border">
                  <div className="text-4xl font-bold text-blue-600 mb-2">97.8%</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Délais raccordements Enedis</h3>
                  <p className="text-sm text-gray-600">
                    Raccordements électriques dans plus de 97% des demandes sont dans les délais annoncés au devis dans la durée.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Étude annuelle : 40 raccordements à l'étude</p>
                </div>

                <div className="text-center bg-white p-8 rounded-lg border">
                  <div className="text-4xl font-bold text-blue-600 mb-2">98.5%</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualité installations et suivi</h3>
                  <p className="text-sm text-gray-600">
                    Conseils sur la maîtrise des consommations et installations électriques aux normes les plus récentes.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Vérifications externes : 15 installations au hasard</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  <strong>Besoin d'un raccordement électrique Enedis ?</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Nous vous accompagnons dans le choix de la solution la plus adaptée à vos projets
                </p>
                <a href="#formulaire-raccordement">
                  <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Demander mon raccordement Enedis dès aujourd'hui
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Retours clients sur le service de raccordement Enedis
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Construction neuve</div>
                      <div className="text-sm text-gray-500">Particulier</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    "Le raccordement Enedis digital proposé par le site a permis d'accélérer les démarches administratives."
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>Pierre L. - Annecy</div>
                    <div>Délai : 6 semaines</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Local commercial</div>
                      <div className="text-sm text-gray-500">Artisan carreleur</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    "Service professionnel accompagné d'explications techniques adaptées aux travaux en cours et à notre activité."
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>Thomas M. - Grenoble</div>
                    <div>Puissance : 36 kVA</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Installation solaire</div>
                      <div className="text-sm text-gray-500">Éco-construction</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    "Raccordement solaire pour une maison autonome en énergie. Conseils précieux pour optimiser l'installation."
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>Marie D. - Chambéry</div>
                    <div>Production : 9 kWc</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Votre projet de raccordement électrique
                </h2>
                <p className="text-gray-600">
                  Les réponses aux questions les plus fréquemment posées sur les raccordements électriques Enedis. Des réponses pour vous aider à y voir plus clair.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Combien coûte un raccordement électrique Enedis ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Le coût dépend de plusieurs facteurs : type de raccordement, puissance souscrite, distance au réseau existant et travaux nécessaires. 
                    Nos experts établissent un devis personnalisé gratuit adapté à votre projet spécifique.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quels sont les délais pour un raccordement électrique ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Les délais varient selon la complexité du projet. Comptez généralement 6 à 10 semaines pour un raccordement standard, 
                    mais cela peut être plus court pour des projets simples ou plus long pour des installations complexes.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Quelle puissance électrique choisir pour mon raccordement ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Le choix dépend de vos besoins : 6 kVA pour un studio, 9-12 kVA pour une maison, 15-36 kVA pour des locaux professionnels. 
                    Nos conseillers vous aident à déterminer la puissance optimale selon votre usage.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ai-je besoin d'un électricien pour mon raccordement ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Oui, l'intervention d'un électricien qualifié est obligatoire pour réaliser l'installation électrique intérieure 
                    selon les normes en vigueur. Nous pouvons vous mettre en relation avec des professionnels certifiés.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Comment suivre l'avancement de ma demande ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Vous recevez un numéro de référence unique lors de votre demande. Nos équipes vous tiennent informé 
                    à chaque étape par email et téléphone, de l'étude technique jusqu'à la mise en service.
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  Une question spécifique sur votre projet ?
                </p>
                <a href="tel:0970709570">
                  <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Appelez nos experts au 09 70 70 95 70
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Contact Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50" id="contact">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Une question sur votre projet ?
                </h2>
                <p className="text-gray-600 text-lg">
                  Nos conseillers spécialisés vous accompagnent dans toutes vos démarches
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Conseil personnalisé</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Parlez directement à un expert raccordement Enedis
                      </p>
                      <div className="space-y-2">
                        <a href="tel:0970709570" className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          <Phone className="w-4 h-4" />
                          <span>09 70 70 95 70</span>
                        </a>
                        <p className="text-xs text-gray-500">Lun-Ven 9h-18h • Appel non surtaxé</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Support écrit</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Posez vos questions par email, nous vous répondons rapidement
                      </p>
                      <div className="space-y-2">
                        <a href="mailto:contact@portail-electricite.com" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          <Mail className="w-4 h-4" />
                          <span>Nous contacter</span>
                        </a>
                        <p className="text-xs text-gray-500">Réponse garantie sous 24h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="mt-12 bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Questions fréquentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Délai moyen</p>
                    <p className="text-gray-600">4-6 semaines</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Prix à partir de</p>
                    <p className="text-gray-600">800€</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Zone couverte</p>
                    <p className="text-gray-600">France entière</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Support and Modal Components */}
      <SupportWidget />
      <ContactModal />
      
      {/* Essential Components */}
      <FloatingCtaButton />
    </div>
  );
}