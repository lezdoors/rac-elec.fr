import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Form } from "@/components/ui/form";
import { FormStep1 } from "@/components/form-step-1";
import { CheckCircle2, ChevronLeft, ChevronRight, Menu, Phone, X, Zap, Building, Users, Mail } from "lucide-react";
import { PerformanceOptimizer } from "@/components/performance-optimizer";
import { FloatingCtaButton } from "@/components/floating-cta-button";
import { MobileFormOptimizer } from "@/components/mobile-form-optimizer";
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
        <section className="bg-[#0046a2] text-white py-16 md:py-20">
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

        {/* Service de raccordement électrique Enedis en ligne */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Service de raccordement électrique Enedis en ligne
                </h2>
                <p className="text-gray-600">Étapes du processus de raccordement électrique Enedis</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Demande en ligne</h3>
                  <p className="text-gray-600 text-sm">Formulaire sécurisé depuis cette plateforme</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Étude et devis</h3>
                  <p className="text-gray-600 text-sm">Analyse technique et proposition économique</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Travaux de raccordement</h3>
                  <p className="text-gray-600 text-sm">Réalisation des travaux par nos équipes qualifiées</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mise en service</h3>
                  <p className="text-gray-600 text-sm">Finalisation et activation de votre raccordement</p>
                </div>
              </div>

              <div className="text-center mt-12" id="services">
                <a href="#formulaire-raccordement">
                  <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">
                    Commencer maintenant
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Nos Services */}
        <section className="py-16 bg-white" id="tarifs">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Nos services de raccordement électrique
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Service spécialisé dans le raccordement au réseau électrique Enedis pour particuliers, professionnels et collectivités
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Raccordement résidentiel</h3>
                  <p className="text-gray-600 mb-4">
                    Raccordement électrique pour maisons individuelles, appartements et projets résidentiels
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Maison neuve</li>
                    <li>• Rénovation complète</li>
                    <li>• Augmentation de puissance</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Raccordement professionnel</h3>
                  <p className="text-gray-600 mb-4">
                    Solutions pour commerces, bureaux, industries et projets professionnels
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Local commercial</li>
                    <li>• Bureau et tertiaire</li>
                    <li>• Site industriel</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Raccordement provisoire</h3>
                  <p className="text-gray-600 mb-4">
                    Alimentation temporaire pour chantiers, événements et besoins ponctuels
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Chantier de construction</li>
                    <li>• Événement temporaire</li>
                    <li>• Installation mobile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-blue-600 text-white" id="contact">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Besoin d'assistance pour votre raccordement Enedis ?
              </h2>
              <p className="text-lg mb-8">Contactez-nous au 09 70 70 95 70</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Assistance téléphonique</h3>
                  <p className="text-blue-200 mb-4">Nos experts vous accompagnent</p>
                  <a href="tel:0970709570" className="text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors">
                    09 70 70 95 70
                  </a>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Support en ligne</h3>
                  <p className="text-blue-200 mb-4">Réponse sous 24h garantie</p>
                  <a href="mailto:contact@portail-electricite.com" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
                    contact@portail-electricite.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Support and Modal Components */}
      <SupportWidget />
      <ContactModal />
      
      {/* Performance Components */}
      <PerformanceOptimizer />
      <FloatingCtaButton />
      <MobileFormOptimizer />
    </div>
  );
}