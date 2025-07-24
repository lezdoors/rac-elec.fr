import { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ConfirmationPage() {
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Récupérer le numéro de référence depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('reference');
    if (ref) {
      setReferenceNumber(ref);
    } else {
      // Rediriger vers la page d'accueil si pas de référence
      setLocation('/');
    }
  }, [setLocation]);

  if (!referenceNumber) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-xl p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowLeft className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-center">Redirection en cours...</h1>
              <p className="text-gray-500 text-center">
                Vous allez être redirigé vers la page d'accueil.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Confirmation de paiement - Raccordement Enedis</title>
        <meta name="description" content="Votre paiement a été confirmé. Votre demande de raccordement Enedis est en cours de traitement." />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Google tag loaded once in index.html */}
        
        {/* Purchase conversion tracking */}
        <script>{`
          if (typeof window !== 'undefined' && window.gtag) {
            gtag('event', 'conversion', {
              'send_to': 'AW-16698052873/IFUxCJLHtMUaEtmioJo-',
              'transaction_id': '${referenceNumber || ''}'
            });
          }
        `}</script>
      </Helmet>
      <div className="container max-w-5xl py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <Card className="p-8 shadow-xl border-blue-100 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-1 h-20 bg-blue-300 animate-pulse opacity-50" style={{ animationDelay: "150ms" }}></div>
            <div className="absolute top-20 right-20 w-1 h-12 bg-blue-400 animate-pulse opacity-60" style={{ animationDelay: "300ms" }}></div>
            <div className="absolute bottom-10 left-1/4 w-1 h-10 bg-blue-500 animate-pulse opacity-50" style={{ animationDelay: "450ms" }}></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-16 bg-blue-300 animate-pulse opacity-60" style={{ animationDelay: "600ms" }}></div>
          </div>
          
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <div className="bg-white p-4 rounded-full mb-6 shadow-md ring-4 ring-blue-100 animate-pulse">
              <div className="bg-gradient-to-r from-blue-400 to-primary p-3 rounded-full">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4 animate-fadeIn">Paiement confirmé</h1>
            <p className="text-xl text-gray-600 max-w-2xl animate-fadeIn" style={{ animationDelay: "200ms" }}>
              Votre demande de raccordement électrique a été enregistrée avec succès et le paiement a été traité.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8 shadow-sm border border-blue-100 animate-fadeIn" style={{ animationDelay: "300ms" }}>
            <h2 className="text-xl font-semibold mb-4 text-primary">Détails de votre demande</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-blue-100/50 transition-colors">
                <span className="text-gray-600">Numéro de référence</span>
                <span className="font-mono font-semibold text-primary">{referenceNumber}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-blue-100/50 transition-colors">
                <span className="text-gray-600">Montant payé</span>
                <span className="font-semibold text-primary">129,80 €</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-blue-100/50 transition-colors">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-blue-100/50 transition-colors">
                <span className="text-gray-600">Statut</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary">
                  Confirmé
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-fadeIn" style={{ animationDelay: "400ms" }}>
            <h2 className="text-xl font-semibold text-primary">Prochaines étapes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-primary">Étude de votre dossier</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Nos experts vont analyser votre demande et préparer un dossier personnalisé pour votre raccordement électrique.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 relative">
                <div className="absolute -top-2 -right-2 bg-blue-400 text-white text-xs py-1 px-2 rounded-full">
                  Prioritaire
                </div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-primary">Contact par nos équipes</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Un chargé de clientèle vous contactera sous 48h pour planifier les prochaines étapes et vous accompagner.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-primary">Suivi en ligne</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Suivez l'avancement de votre dossier en temps réel sur votre espace client personnalisé.
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-blue-100" />

          <div className="flex flex-col items-center text-center animate-fadeIn" style={{ animationDelay: "500ms" }}>
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 mb-6 max-w-2xl">
              <p className="text-blue-700 font-medium">
                Un email récapitulatif a été envoyé à l'adresse fournie lors de votre inscription.
              </p>
              <p className="text-blue-600 mt-2">
                Pour toute question, notre service client est disponible au <span className="font-semibold">01 23 45 67 89</span> du lundi au vendredi de 9h à 18h.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <Button variant="outline">
                  Retour à l'accueil
                  <ArrowLeft className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/espace-client">
                <Button className="bg-primary hover:bg-blue-700 transition-all duration-300 shadow-md">
                  Accéder à mon espace client
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}