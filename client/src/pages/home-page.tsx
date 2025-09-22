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

      {/* Modern Hero Section - 2025 Design */}
      <main>
        <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.08),transparent_50%)]"></div>
          
          <div className="relative container mx-auto px-4 max-w-6xl py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Content Side */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  Service Enedis certifié
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-gray-900">Raccordement</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    électrique
                  </span>
                  <span className="text-gray-900">simplifié</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl lg:max-w-none leading-relaxed">
                  Une solution moderne pour votre raccordement Enedis. 
                  <span className="block mt-2 font-medium text-gray-800">Un seul formulaire, un accompagnement complet.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="#formulaire-raccordement">
                    <button 
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                      data-testid="button-commencer-demande"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Commencer ma demande
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
                    </button>
                  </a>
                  
                  <a href="tel:0970709570">
                    <button className="inline-flex items-center justify-center px-6 py-4 text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
                      <Phone className="w-5 h-5 mr-3 text-green-600" />
                      09 70 70 95 70
                    </button>
                  </a>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-700">145 raccordements</span> traités ce mois-ci
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">99.2%</span> de satisfaction
                  </div>
                </div>
              </div>
              
              {/* Visual Side */}
              <div className="relative lg:block">
                <div className="relative">
                  {/* Main Illustration Container */}
                  <div className="relative mx-auto max-w-md lg:max-w-lg xl:max-w-xl">
                    
                    {/* Electric Grid Illustration */}
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                      
                      {/* House Icon */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                          <Building className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      
                      {/* Connection Lines */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">Étude technique</span>
                          </div>
                          <span className="text-xs text-gray-500">7-15 jours</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-1000"></div>
                            <span className="text-sm font-medium text-gray-700">Travaux raccordement</span>
                          </div>
                          <span className="text-xs text-gray-500">4-6 semaines</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-2000"></div>
                            <span className="text-sm font-medium text-gray-700">Mise en service</span>
                          </div>
                          <span className="text-xs text-gray-500">1-2 jours</span>
                        </div>
                      </div>
                      
                      {/* Bottom CTA */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-3">Processus 100% dématérialisé</p>
                          <div className="flex justify-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center animate-bounce animation-delay-500">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* Modern Form Section */}
        <section className="py-20 bg-gradient-to-b from-white via-gray-50/30 to-white" id="formulaire-raccordement">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                  <CheckCircle2 className="w-4 h-4" />
                  Processus simplifié
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  <span className="block">Votre demande de</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    raccordement Enedis
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Particuliers et professionnels. Un seul formulaire intelligent pour tous types de raccordements électriques.
                </p>
              </div>

              {/* Modern Form Container */}
              <div className="relative">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-indigo-50/50 rounded-3xl"></div>
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl"></div>
                
                <div className="relative p-8 lg:p-12">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          1
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Informations</span>
                      </div>
                      <div className="w-12 h-0.5 bg-gray-200"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <span className="ml-3 text-sm text-gray-500">Projet</span>
                      </div>
                      <div className="w-12 h-0.5 bg-gray-200"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <span className="ml-3 text-sm text-gray-500">Validation</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Form */}
                  <Form {...heroForm}>
                    <form onSubmit={heroForm.handleSubmit(handleHeroSubmit)} className="space-y-6">
                      <FormStep1 form={heroForm} />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-400 rounded-2xl font-medium cursor-not-allowed opacity-50 bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Précédent
                        </button>

                        <button
                          type="submit"
                          className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 rounded-2xl"
                          data-testid="button-submit-hero-form"
                        >
                          <span className="relative z-10">Continuer ma demande</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
                        </button>
                      </div>
                    </form>
                  </Form>
                  
                  {/* Trust Elements */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Gratuit et sans engagement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span>Traitement en 2 minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-purple-500" />
                      <span>Suivi par email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Message Modal */}
        {showSuccessMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations enregistrées !</h3>
                <p className="text-gray-600">
                  Redirection vers l'étape 2 pour finaliser votre demande...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Services Section - 2025 Design */}
        <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
                  <Building className="w-4 h-4" />
                  Solutions adaptées
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  <span className="block">Quel type de raccordement</span>
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    vous correspond ?
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Choisissez votre projet de raccordement. Découvrez la solution électrique parfaitement adaptée à vos besoins spécifiques.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                
                {/* Raccordement Définitif - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Raccordement Définitif</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Solution permanente pour maisons individuelles, appartements et locaux professionnels avec garantie complète.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">À partir de</p>
                        <p className="text-3xl font-bold text-gray-900">1 300 €</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Étude incluse</p>
                        <p>• Installation certifiée</p>
                        <p>• SAV garanti</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Raccordement Provisoire - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Raccordement Provisoire</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Solution temporaire idéale pour chantiers, événements et installations temporaires avec mise en service rapide.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">À partir de</p>
                        <p className="text-3xl font-bold text-gray-900">800 €</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Installation rapide</p>
                        <p>• Flexible</p>
                        <p>• Économique</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Viabilisation - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Viabilisation</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Préparation et équipement électrique complet de votre terrain avec infrastructure moderne et évolutive.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-green-600">À partir de</p>
                        <p className="text-3xl font-bold text-gray-900">2 200 €</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Étude terrain</p>
                        <p>• Infrastructure</p>
                        <p>• Évolutif</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Modification - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Modification</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Association et mise à niveau de votre installation électrique existante avec technologies modernes.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">À partir de</p>
                        <p className="text-3xl font-bold text-gray-900">900 €</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Audit inclus</p>
                        <p>• Mise aux normes</p>
                        <p>• Modernisation</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Raccordement Collectif - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Raccordement Collectif</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Solutions professionnelles sur-mesure pour promoteurs, équipementiers et grandes entreprises.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">Devis</p>
                        <p className="text-3xl font-bold text-gray-900">Personnalisé</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Étude complète</p>
                        <p>• Gestion projet</p>
                        <p>• Support dédié</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Production Électrique - Modern Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm p-8 rounded-2xl border border-emerald-200/30 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Production Électrique</h3>
                      <span className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        NOUVEAU
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Raccordement spécialisé pour panneaux solaires, éoliennes et production d'énergie verte avec revente possible.
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">À partir de</p>
                        <p className="text-3xl font-bold text-gray-900">1 800 €</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>• Énergies vertes</p>
                        <p>• Revente réseau</p>
                        <p>• Éco-responsable</p>
                      </div>
                    </div>
                    
                    <a href="#formulaire-raccordement" className="group/btn inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                      <span>Choisir cette solution</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Modern Help Section */}
              <div className="relative mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-indigo-50/50 rounded-3xl"></div>
                <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8 text-center">
                  
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Besoin d'aide pour choisir ?
                    </span>
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    Nos experts vous accompagnent dans le choix de la solution la plus adaptée à votre projet électrique.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="tel:0970709570" className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                      <Phone className="w-5 h-5" />
                      <span>09 70 70 95 70</span>
                    </a>
                    
                    <div className="text-sm text-gray-500">
                      <p>Lundi à Vendredi : 9h - 18h</p>
                      <p>Service & appel gratuits</p>
                    </div>
                  </div>
                </div>
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
      
      {/* Performance Components */}
      <PerformanceOptimizer />
      <FloatingCtaButton />
      <MobileFormOptimizer />
    </div>
  );
}