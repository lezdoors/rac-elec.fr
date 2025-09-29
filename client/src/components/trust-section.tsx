import { Shield, CheckCircle, Lock } from "lucide-react";

export function TrustSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white py-12 px-4 my-12">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          Pourquoi nous faire confiance ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              +1200 demandes traitées avec succès
            </h3>
            <p className="text-gray-600">
              Des centaines de clients satisfaits nous font confiance pour leurs projets de raccordement électrique.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Procédure conforme aux exigences Enedis
            </h3>
            <p className="text-gray-600">
              Nos processus respectent scrupuleusement les normes et exigences imposées par Enedis.
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 rounded-full">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Paiement sécurisé et accompagnement complet
            </h3>
            <p className="text-gray-600">
              Transactions protégées par Stripe et accompagnement personnalisé à chaque étape de votre projet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
