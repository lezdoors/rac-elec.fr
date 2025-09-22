import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "wouter";
import { Form } from "@/components/ui/form";
import { FormStep1 } from "@/components/form-step-1";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

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

export function HomePage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [, navigate] = useNavigate();

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
        navigate("/raccordement-enedis?step=2");
      }, 1500);
    } catch (error) {
      console.error("Error submitting hero form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main>
        <section className="bg-[#0046a2] text-white py-16">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Raccordement électrique Enedis, simplifié.
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Un seul formulaire, un accompagnement complet.
            </p>
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
      </main>
    </div>
  );
}