/**
 * Page de test pour la section de sécurité bancaire
 * Permet de voir le composant isolé sans dépendances backend
 */

import Layout from "@/components/layout";
import BankingSecuritySection from "@/components/banking-security-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function TestBankingSecurityPage() {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* En-tête de test */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Test - Section Sécurité Bancaire</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Aperçu de la section d'informations de sécurité bancaire
          </p>
        </div>
        
        {/* Simulation d'une page de paiement */}
        <Card className="mb-8 shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Simulation - Formulaire de paiement
            </CardTitle>
            <CardDescription>
              Contenu de paiement simulé pour démonstration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                [Ici se trouverait le formulaire de paiement Stripe]
              </p>
              <p className="text-sm text-gray-500 mt-2">
                La section de sécurité bancaire apparaît ci-dessous
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Section d'informations de sécurité bancaire */}
      <BankingSecuritySection />
    </Layout>
  );
}