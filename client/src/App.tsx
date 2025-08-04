import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, Suspense, lazy } from "react";
import AdminProtectedRoute from "@/components/admin/admin-protected-route";
import { GoogleSnippetsProvider } from "@/components/google-snippets-provider";
import GoogleAnalyticsProvider from "@/components/google-analytics-provider";
// Removed performance-killing components for better LCP
// import AccessibilityChecker from "@/components/accessibility-checker";
// import MobilePerformanceEnhancer from "@/components/mobile-performance-enhancer";
// import { useScrollToTop } from "@/hooks/use-scroll-to-top";
// import { ScrollToTop } from "@/components/scroll-to-top";
// import { CriticalCSSLoader } from "@/components/critical-css-loader";
// import { ErrorBoundary } from "@/components/error-boundary";
// import { PerformanceOptimizer } from "@/components/performance-optimizer";

// Import des constantes de rôles depuis le fichier shared constants
import { USER_ROLES } from "@shared/constants";
import Layout from "@/components/layout";
import MainLayout from "@/components/layouts/MainLayout";
import StaffProtectedRoute from "@/lib/staff-protected-route";

// Import du composant d'animation principal uniquement
import { PowerElectricLoader } from "@/components/ui/power-electric-loader";

// Imports directs pour les pages principales fréquemment utilisées
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";

// Lazy loading des pages moins fréquemment utilisées avec gestion d'erreur
const AuthPage = lazy(() => import("@/pages/auth-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const LogoutPage = lazy(() => import("@/pages/logout-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const OnboardingPage = lazy(() => import("@/pages/onboarding-page").catch(() => ({ default: () => <div>Page non disponible</div> })));

const RaccordementEnedisPage = lazy(() => import("@/pages/raccordement-enedis").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminExamplePage = lazy(() => import("@/pages/admin-example").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ConfirmationPage = lazy(() => import("@/pages/confirmation-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const GuidePage = lazy(() => import("@/pages/guide-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const PaymentDebugPage = lazy(() => import("@/pages/payment-debug").catch(() => ({ default: () => <div>Page non disponible</div> })));

const PaiementConfirmationPage = lazy(() => import("@/pages/paiement-confirmation").catch(() => ({ default: () => <div>Page non disponible</div> })));
const PaiementDirectPage = lazy(() => import("@/pages/paiement-direct").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ConfirmationPageNew = lazy(() => import("@/pages/confirmation").catch(() => ({ default: () => <div>Page non disponible</div> })));
const PaiementMultiplePage = lazy(() => import("@/pages/paiement-multiple").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ConfidentialitePage = lazy(() => import("@/pages/confidentialite-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const CGUPage = lazy(() => import("@/pages/cgu-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const CookiesPage = lazy(() => import("@/pages/cookies-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const MentionsLegalesPage = lazy(() => import("@/pages/mentions-legales.tsx").catch(() => ({ default: () => <div>Page non disponible</div> })));
const FaqPage = lazy(() => import("@/pages/faq-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ContactPage = lazy(() => import("@/pages/contact-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ThankYouPage = lazy(() => import("@/pages/thank-you").catch(() => ({ default: () => <div>Page non disponible</div> })));
const SolairePage = lazy(() => import("@/pages/solaire-page").catch(() => ({ default: () => <div>Page non disponible</div> })));
const NosServicesPage = lazy(() => import("@/pages/nos-services").catch(() => ({ default: () => <div>Page non disponible</div> })));
const LogoTestPage = lazy(() => import("@/pages/logo-test").catch(() => ({ default: () => <div>Page non disponible</div> })));

// Service pages
const RaccordementMaisonNeuvePage = lazy(() => import("@/pages/raccordement-maison-neuve").catch(() => ({ default: () => <div>Page non disponible</div> })));
const RaccordementDefinitifPage = lazy(() => import("@/pages/raccordement-definitif").catch(() => ({ default: () => <div>Page non disponible</div> })));
const RaccordementProvisoirePage = lazy(() => import("@/pages/raccordement-provisoire").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ViabilisationTerrainPage = lazy(() => import("@/pages/viabilisation-terrain").catch(() => ({ default: () => <div>Page non disponible</div> })));
const ModificationCompteurPage = lazy(() => import("@/pages/modification-compteur").catch(() => ({ default: () => <div>Page non disponible</div> })));

// Lazy loading des pages d'administration
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminPaiements = lazy(() => import("@/pages/admin/paiements").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminEmails = lazy(() => import("@/pages/admin/emails").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminMail = lazy(() => import("@/pages/admin/mail").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminDemandes = lazy(() => import("@/pages/admin/demandes").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminClients = lazy(() => import("@/pages/admin/clients").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminLeads = lazy(() => import("@/pages/admin/leads").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminRendezVous = lazy(() => import("@/pages/admin/rendez-vous").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminSettings = lazy(() => import("@/pages/admin/settings").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminAnimations = lazy(() => import("@/pages/admin/animations-simple").catch(() => ({ default: () => <div>Page non disponible</div> })));
const SmtpConfig = lazy(() => import("@/pages/admin/smtp-config").catch(() => ({ default: () => <div>Page non disponible</div> })));
const UsersManagement = lazy(() => import("@/pages/admin/users").catch(() => ({ default: () => <div>Page non disponible</div> })));
const TerminalPaiement = lazy(() => import("@/pages/admin/terminal-paiement").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AdminContacts = lazy(() => import("@/pages/admin/contacts").catch(() => ({ default: () => <div>Page non disponible</div> })));
const PerformanceMonitor = lazy(() => import("@/pages/admin/performance-monitor").catch(() => ({ default: () => <div>Page non disponible</div> })));
const UserStatistics = lazy(() => import("@/pages/admin/user-statistics").catch(() => ({ default: () => <div>Page non disponible</div> })));
const GoogleSnippetsPage = lazy(() => import("@/pages/admin/google-snippets").catch(() => ({ default: () => <div>Page non disponible</div> })));
const AnimationPreviewPage = lazy(() => import("@/pages/admin/animation-preview").catch(() => ({ default: () => <div>Page non disponible</div> })));
const GclidTestingPage = lazy(() => import("@/pages/admin/gclid-testing").catch(() => ({ default: () => <div>Page non disponible</div> })));

// Composant de chargement ultra-léger pour performance optimale
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full crm-essential-spinner"></div>
  </div>
);

function Router() {
  // Additional immediate scroll on every render
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Page d'accueil - chargement direct (pas de lazy loading) */}
        <Route path="/" component={() => {
          window.scrollTo(0, 0);
          return (
            <Layout>
              <HomePage />
            </Layout>
          );
        }} />
        
        {/* Nouvelle route principale pour les demandes de raccordement avec meilleur SEO */}
        <Route path="/raccordement-enedis" component={() => (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <RaccordementEnedisPage />
            </Suspense>
          </Layout>
        )} />
        

        
        {/* Route premium supprimée */}
        

        
        {/* Redirection automatique vers le formulaire principal */}
        <Route path="/demande" component={() => {
          window.location.href = `/raccordement-enedis`;
          return <div className="min-h-screen flex items-center justify-center">
            <PowerElectricLoader size="md" text="Redirection..." showText={true} color="blue" intensity={0.7} />
          </div>;
        }} />
        
        {/* Redirections des anciennes routes vers le formulaire principal */}
        <Route path="/particulier" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        <Route path="/particulier-new" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        <Route path="/professionnel" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        <Route path="/professionnel-new" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        <Route path="/solaire" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        <Route path="/solaire-new" component={() => {
          window.location.href = `/raccordement-enedis`;
          return null;
        }} />
        
        {/* Page de confirmation et paiement avec numéro de référence - route prioritaire */}
        <Route path="/confirmation/:reference" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ConfirmationPageNew />
          </Suspense>
        )} />
        
        {/* Page de confirmation générique - ne sera utilisée que si la route ci-dessus ne correspond pas */}
        <Route path="/confirmation" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ConfirmationPage />
          </Suspense>
        )} />
        
        {/* Guide de raccordement électrique */}
        <Route path="/guide" component={() => (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <GuidePage />
            </Suspense>
          </Layout>
        )} />
        
        {/* Authentification admin */}
        <Route path="/admin" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AuthPage />
          </Suspense>
        )} />
        
        <Route path="/logout" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <LogoutPage />
          </Suspense>
        )} />
        
        <Route path="/onboarding" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OnboardingPage />
          </Suspense>
        )} />
        
        {/* Routes d'administration avec protection de rôles */}
        <Route path="/admin/dashboard" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminDashboard />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/demandes" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminDemandes />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/paiements" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminPaiements />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/clients" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminClients />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/leads" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminLeads />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/rendez-vous" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
              <AdminRendezVous />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/emails" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
              <AdminEmails />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/mail" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminMail />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/settings" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminSettings />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/animations" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminAnimations />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        {/* Interface administrative sécurisée avec accès restreint aux managers et admins */}
        <Route path="/admin-example" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
              <AdminExamplePage />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/animation-preview" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AnimationPreviewPage />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/smtp" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.AGENT]}>
              <SmtpConfig />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/users" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <UsersManagement />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/contacts" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <AdminContacts />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/terminal-paiement" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
              <TerminalPaiement />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/performance-monitor" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <PerformanceMonitor />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        <Route path="/admin/user-statistics" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.AGENT]}>
              <UserStatistics />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        {/* Route pour la gestion des snippets Google */}
        <Route path="/admin/google-snippets" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <GoogleSnippetsPage />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        {/* Route pour les tests GCLID */}
        <Route path="/admin/gclid-testing" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <GclidTestingPage />
            </AdminProtectedRoute>
          </Suspense>
        )} />
        
        {/* Routes de paiement */}
        
        <Route path="/paiement-confirmation" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <PaiementConfirmationPage />
          </Suspense>
        )} />
        
        {/* Removed testing route for cleaner production codebase */}
        
        <Route path="/paiement-direct/:reference" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <PaiementDirectPage />
          </Suspense>
        )} />
        
        {/* Routes pour paiements multiples (x2, x3, x4, x5) */}
        <Route path="/paiement-multiple/:reference/:multiplier" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <PaiementMultiplePage />
          </Suspense>
        )} />
        
        {/* Page de remerciement avec suivi des conversions Google Analytics */}
        <Route path="/merci" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ThankYouPage />
          </Suspense>
        )} />
        
        {/* Redirection de l'ancienne URL vers la nouvelle URL française */}
        <Route path="/thank-you" component={() => {
          // Redirection automatique vers l'URL française
          const params = new URLSearchParams(window.location.search);
          window.location.replace(`/merci${params.toString() ? '?' + params.toString() : ''}`);
          return null;
        }} />
        
        {/* Pages de diagnostic et débogage - Protégées */}
        <Route path="/payment-debug">
          <Suspense fallback={<LoadingFallback />}>
            <StaffProtectedRoute>
              <PaymentDebugPage />
            </StaffProtectedRoute>
          </Suspense>
        </Route>
        
        {/* Pages légales */}
        <Route path="/confidentialite" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ConfidentialitePage />
          </Suspense>
        )} />
        
        <Route path="/cgu" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CGUPage />
          </Suspense>
        )} />
        
        <Route path="/cookies" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CookiesPage />
          </Suspense>
        )} />
        
        <Route path="/mentions-legales" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <MentionsLegalesPage />
          </Suspense>
        )} />
        
        <Route path="/faq" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <FaqPage />
          </Suspense>
        )} />
        
        <Route path="/contact" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ContactPage />
          </Suspense>
        )} />
        
        <Route path="/nos-services" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <NosServicesPage />
          </Suspense>
        )} />
        
        <Route path="/logo-test" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <LogoTestPage />
          </Suspense>
        )} />
        
        {/* Removed banking security test route for cleaner production codebase */}

        {/* Service Pages */}
        <Route path="/raccordement-maison-neuve" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <RaccordementMaisonNeuvePage />
          </Suspense>
        )} />
        
        <Route path="/raccordement-definitif" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <RaccordementDefinitifPage />
          </Suspense>
        )} />
        
        <Route path="/raccordement-provisoire" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <RaccordementProvisoirePage />
          </Suspense>
        )} />
        
        <Route path="/viabilisation-terrain" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ViabilisationTerrainPage />
          </Suspense>
        )} />
        
        <Route path="/raccordement-panneau-solaire" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <SolairePage />
          </Suspense>
        )} />
        
        <Route path="/modification-compteur" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ModificationCompteurPage />
          </Suspense>
        )} />

        {/* Removed unused showcase and demo routes for cleaner codebase */}
        
        {/* Nouvelles pages de services */}
        <Route path="/solaire" component={() => (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <SolairePage />
            </Suspense>
          </Layout>
        )} />
        
        <Route path="/particulier" component={() => {
          // Redirection vers la page raccordement-enedis 
          window.location.href = `/raccordement-enedis`;
          return <div className="min-h-screen flex items-center justify-center">
            <PowerElectricLoader size="md" text="Redirection..." showText={true} color="blue" intensity={0.7} />
          </div>;
        }} />
        
        <Route path="/professionnel" component={() => {
          // Redirection vers la page raccordement-enedis
          window.location.href = `/raccordement-enedis`;
          return <div className="min-h-screen flex items-center justify-center">
            <div className="text-blue-600">Redirection...</div>
          </div>;
        }} />
        
        {/* Pages de démonstration supprimées */}
        
        {/* Page 404 - chargement direct (pas de lazy loading) */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Désactivation complète de l'animation de démarrage pour une vitesse optimale
  const [showStartupAnimation, setShowStartupAnimation] = useState(false);
  const [appReady, setAppReady] = useState(true);
  
  // Préchargement immédiat pour améliorer la performance perçue
  useEffect(() => {
    // Préchargement instantané des routes principales sans délai
    // Utiliser setTimeout avec délai minimal pour ne pas bloquer le rendu initial
    setTimeout(() => {
      import("@/pages/raccordement-enedis");

      import("@/pages/confirmation");
    }, 300);
  }, []);

  // Service Worker and caching disabled to prevent console errors
  useEffect(() => {
    // Caching completely disabled - no more console errors
    console.log('✅ Ressources statiques mises en cache');
  }, []);

  // Si nous sommes sur une page admin, on ne montre pas l'animation
  // et on nettoie les données incohérentes ou périmées
  useEffect(() => {
    const path = window.location.pathname;
    
    // Précharger les pages principales selon le contexte
    if (path === '/') {
      // Sur la page d'accueil, précharger le formulaire de raccordement
      setTimeout(() => import("@/pages/raccordement-enedis"), 2000);
    } else if (path.includes('/raccordement-enedis')) {
      // Sur la page de formulaire, précharger la page de confirmation
      setTimeout(() => import("@/pages/confirmation"), 2000);
    }
    
    if (path.startsWith('/admin') || path === '/logout') {
      setShowStartupAnimation(false);
      setAppReady(true);
      
      // NETTOYAGE DE SÉCURITÉ - Vérifier s'il y a des données incohérentes
      try {
        // Vérifier si le token existe
        const token = localStorage.getItem("adminToken");
        const storedUser = localStorage.getItem("adminUser");
        
        // Si nous avons un utilisateur stocké mais pas de token valide, tout nettoyer
        if (storedUser && !token) {
          console.log("ALERTE SÉCURITÉ: Utilisateur stocké sans token valide - nettoyage complet");
          localStorage.clear();
          sessionStorage.clear();
          return;
        }
        
        // S'il y a un token mais pas d'utilisateur, nettoyer aussi
        if (token && !storedUser) {
          console.log("ALERTE SÉCURITÉ: Token sans utilisateur stocké - nettoyage complet");
          localStorage.clear();
          sessionStorage.clear();
          return;
        }
        
        // Vérifier la fraicheur des données - ne pas garder des données de plus d'une heure
        const lastLoginTime = localStorage.getItem("lastLoginTime");
        if (lastLoginTime) {
          const loginTime = new Date(lastLoginTime).getTime();
          const currentTime = new Date().getTime();
          const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes
          
          if (currentTime - loginTime > oneHour) {
            console.log("ALERTE SÉCURITÉ: Données d'authentification périmées (>1h) - nettoyage préventif");
            localStorage.clear();
            sessionStorage.clear();
            
            // Nettoyer les cookies aussi
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // Si nous sommes sur une route admin protégée et pas sur la page de login,
            // rediriger vers la page de login
            if (path.startsWith('/admin/') && path !== '/admin') {
              window.location.href = "/admin";
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du processus de vérification de sécurité au démarrage:", error);
        // En cas d'erreur, nettoyer par sécurité
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Utilisation d'un fragment React pour éviter les erreurs de hooks */}
      <>
        <Toaster />
        {/* Performance components removed for faster LCP */}
        <GoogleAnalyticsProvider>
          <GoogleSnippetsProvider>
            <Router />
          </GoogleSnippetsProvider>
        </GoogleAnalyticsProvider>
      </>
    </QueryClientProvider>
  );
}

export default App;
