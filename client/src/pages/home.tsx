import { ServiceRequestForm } from "@/components/service-request-form";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CreditCard, FileText, Clock } from "lucide-react";
import { Helmet } from "react-helmet";

// Interface pour les statistiques
interface DashboardStats {
  payments: {
    count: number;
    revenue: number;
    successRate: number;
    successful: number;
  };
  leads: {
    count: number;
  };
  requests: {
    count: number;
  };
}

// Composant de résumé intelligent avec vraies données CRM - optimisé pour LCP
function IntelligentSummary() {
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Délai de 500ms pour permettre au contenu critique de se charger d'abord
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: todayStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', { 
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: false,
    enabled: shouldLoad, // Ne charge que quand shouldLoad est true
  });

  const { data: weekStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', { 
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchOnWindowFocus: false,
    enabled: shouldLoad, // Ne charge que quand shouldLoad est true
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Chargement des données en temps réel...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayPayments = todayStats?.payments?.count || 0;
  const todayRevenue = todayStats?.payments?.revenue || 0;
  const todayLeads = todayStats?.leads?.count || 0;
  const todayRequests = todayStats?.requests?.count || 0;
  const successRate = todayStats?.payments?.successRate || 0;

  const weekPayments = weekStats?.payments?.count || 0;
  const weekRevenue = weekStats?.payments?.revenue || 0;

  return (
    <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Résumé Intelligent - Activité en Temps Réel
            </h3>
            <div className="space-y-3">
              {/* Statistiques du jour */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Aujourd'hui : {todayPayments} paiement{todayPayments > 1 ? 's' : ''} RAC- • {formatAmount(todayRevenue)}
                </Badge>
                {successRate > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {successRate.toFixed(0)}% de réussite
                  </Badge>
                )}
              </div>

              {/* Statistiques des leads et demandes */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Users className="h-3 w-3 mr-1" />
                  {todayLeads} nouveau{todayLeads > 1 ? 'x' : ''} lead{todayLeads > 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <FileText className="h-3 w-3 mr-1" />
                  {todayRequests} demande{todayRequests > 1 ? 's' : ''} de service
                </Badge>
              </div>

              {/* Tendance hebdomadaire */}
              {weekPayments > 0 && (
                <div className="pt-2 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Cette semaine :</span> {weekPayments} paiements pour {formatAmount(weekRevenue)} au total
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Raccordement Électrique Enedis – Demande en Ligne | demande-raccordement.fr</title>
        <meta name="description" content="Demande de raccordement Enedis simplifiée. Service rapide et sécurisé pour tous projets électriques." />
        <link rel="canonical" href="https://www.demande-raccordement.fr/" />
      </Helmet>
      <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
      <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <svg
                viewBox="0 0 64 64"
                className="h-16 md:h-20 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Circle background */}
                <circle cx="32" cy="32" r="28" className="stroke-primary fill-primary/5" />
                
                {/* Lightning bolt */}
                <path
                  d="M32 12 L36 32 L24 32 L32 52"
                  className="stroke-white fill-yellow-400"
                  strokeWidth="2"
                />
                
                {/* Power cord */}
                <path
                  d="M20 44 C20 50, 44 50, 44 44"
                  className="stroke-primary"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Electric plug */}
                <rect x="28" y="44" width="8" height="10" rx="1" className="fill-primary/80 stroke-primary" />
                <line x1="30" y1="54" x2="30" y2="58" className="stroke-primary" strokeWidth="3" />
                <line x1="34" y1="54" x2="34" y2="58" className="stroke-primary" strokeWidth="3" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-primary mb-4">
              Demande de Raccordement Électrique Enedis en Ligne
            </h1>
            <p className="text-gray-600 text-center max-w-xl mx-auto mb-2">
              Veuillez remplir le formulaire ci-dessous pour soumettre votre demande de raccordement électrique. 
              Les champs marqués d'un * sont obligatoires.
            </p>
          </div>

          {/* Résumé Intelligent avec vraies données CRM */}
          {/* Main Service Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 sr-only">
              Formulaire de Demande
            </h2>
            <ServiceRequestForm />
          </section>

          {/* Service Benefits Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Avantages de Notre Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Service Rapide</h3>
                <p className="text-sm text-blue-600">Traitement accéléré de votre demande</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Sécurisé</h3>
                <p className="text-sm text-green-600">Protection de vos données personnelles</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Compatible</h3>
                <p className="text-sm text-purple-600">Tous types de projets électriques</p>
              </div>
            </div>
          </section>

          {/* Statistics Dashboard Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Statistiques du Service
            </h2>
            <IntelligentSummary />
          </section>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm py-4">
          <p>&copy; {new Date().getFullYear()} demande-raccordement.fr. Tous droits réservés.</p>
        </div>
      </div>
      </div>
    </>
  );
}
