import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { CheckCircle, Download, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { getGclid } from '@/lib/clean-gclid';

interface ThankYouPageProps {}

export default function ThankYouPage({}: ThankYouPageProps) {
  const [location, setLocation] = useLocation();
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [purchaseData, setPurchaseData] = useState<any>(null);
  
  // Track if conversion already fired (prevent duplicates on re-renders or back/forward navigation)
  const conversionFired = useRef(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper function to fire purchase conversion
  const firePurchaseConversion = (ref: string, amount?: number) => {
    const storageKey = `purchase_conversion_${ref}`;
    
    // Check if already fired
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey)) {
      console.log('ℹ️ Purchase conversion already fired for', ref);
      return;
    }
    
    // Retrieve email/phone from sessionStorage for Enhanced Conversions (if available)
    let email = '';
    let phone = '';
    if (typeof sessionStorage !== 'undefined') {
      email = sessionStorage.getItem('ec_email') || '';
      phone = sessionStorage.getItem('ec_phone') || '';
      // Clean up after retrieval
      sessionStorage.removeItem('ec_email');
      sessionStorage.removeItem('ec_phone');
    }
    
    // Fire GTM Purchase event with Enhanced Conversions data
    if (typeof window !== 'undefined' && (window as any).trackPurchase) {
      (window as any).trackPurchase(ref, email, phone);
      console.log('🎯 Google Ads: purchase conversion fired for', ref);
      
      // Mark as fired in sessionStorage to prevent duplicates on refresh/back/forward
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(storageKey, 'true');
      }
    }
    
    // Prepare purchase data for display
    const purchaseInfo = {
      transaction_id: ref,
      value: amount || 129.80,
      currency: 'EUR',
      items: [{
        item_id: 'raccordement-enedis',
        item_name: 'Service de raccordement Enedis',
        category: 'Services',
        quantity: 1,
        price: amount || 129.80
      }]
    };
    setPurchaseData(purchaseInfo);
  };

  // Extract reference from URL params OR session_id and fire Purchase conversion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('ref');
    const sessionId = params.get('session_id');
    const amount = params.get('amount');
    
    // Prevent duplicate firing in this render cycle
    if (conversionFired.current) {
      return;
    }
    
    // If we have a direct reference, use it
    if (ref) {
      conversionFired.current = true;
      setReferenceNumber(ref);
      firePurchaseConversion(ref, amount ? parseFloat(amount) : undefined);
      return;
    }
    
    // If we have a session_id (from Stripe Checkout), fetch reference from API
    if (sessionId) {
      conversionFired.current = true;
      
      const fetchSessionDetails = async () => {
        try {
          console.log('🔍 Récupération des détails de la session Stripe:', sessionId);
          const response = await fetch(`/api/stripe-session/${sessionId}`);
          const data = await response.json();
          
          if (response.ok && data.success && data.referenceNumber) {
            console.log('✅ Référence trouvée via session_id:', data.referenceNumber);
            setReferenceNumber(data.referenceNumber);
            
            // Fire conversion if payment was successful
            if (data.paymentStatus === 'paid') {
              firePurchaseConversion(data.referenceNumber, data.amount);
            }
          } else {
            console.error('❌ Impossible de récupérer la référence depuis la session:', data.message);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération de la session Stripe:', error);
        }
      };
      
      fetchSessionDetails();
    }
    
  }, [location]);

  const handleDownloadReceipt = () => {
    trackEvent('download', 'receipt', referenceNumber);
    // Implementation for receipt download
    console.log('Download receipt for:', referenceNumber);
  };

  const handleContactSupport = () => {
    trackEvent('contact', 'support', 'phone');
  };

  return (
    <>
      <Helmet>
        <title>Merci pour votre commande - Raccordement Enedis confirmé</title>
        <meta name="description" content="Votre demande de raccordement Enedis a été confirmée. Suivez l'avancement de votre dossier." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Success Header - Optimisé mobile */}
            <div className="text-center mb-8 md:mb-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
                Merci pour votre commande !
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-2 px-2">
                Votre demande de raccordement Enedis a été confirmée
              </p>
              {referenceNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mx-4 md:mx-auto max-w-md">
                  <p className="text-base md:text-lg font-semibold text-blue-600">
                    Référence : {referenceNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Main Content Grid - Optimisé mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              
              {/* Next Steps */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                    Prochaines étapes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Confirmation par email</h3>
                      <p className="text-gray-600 text-sm">
                        Vous recevrez un email de confirmation dans les prochaines minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Traitement du dossier</h3>
                      <p className="text-gray-600 text-sm">
                        Notre équipe traite votre demande sous 24-48h ouvrables
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Coordination Enedis</h3>
                      <p className="text-gray-600 text-sm">
                        Nous coordonnons directement avec Enedis pour votre raccordement
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Planification des travaux</h3>
                      <p className="text-gray-600 text-sm">
                        Enedis vous contacte pour planifier l'intervention
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Phone className="w-6 h-6 mr-3 text-green-600" />
                    Contact & Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Download Receipt */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Reçu de paiement</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Téléchargez votre reçu de paiement pour vos dossiers
                    </p>
                    <Button 
                      onClick={handleDownloadReceipt}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le reçu
                    </Button>
                  </div>

                  {/* Support Contact */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Notre équipe est disponible pour répondre à vos questions
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="tel:0970709570" 
                        onClick={handleContactSupport}
                        className="flex items-center text-green-600 hover:text-green-700 font-medium"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        09 70 70 95 70
                      </a>
                      <a 
                        href="mailto:support@demande-raccordement.fr"
                        className="flex items-center text-green-600 hover:text-green-700 font-medium"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        support@demande-raccordement.fr
                      </a>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="text-center text-sm text-gray-500">
                    <p>Horaires : Lundi-Vendredi 9h-18h</p>
                    <p>Réponse garantie sous 24h</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Actions - Optimisé mobile */}
            <div className="text-center space-y-4">
              <div className="p-4 md:p-6 bg-gray-50 rounded-lg mx-2 md:mx-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vous avez d'autres projets ?
                </h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  Profitez de notre expertise pour tous vos besoins de raccordement électrique
                </p>
                
                {/* Boutons empilés sur mobile, côte à côte sur desktop */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      trackEvent('new_request', 'conversion', 'thank_you_page');
                      setLocation('/raccordement-enedis');
                    }}
                    variant="outline" 
                    className="w-full sm:w-auto"
                    data-testid="button-new-request"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Nouvelle demande
                  </Button>
                  <Button 
                    onClick={() => {
                      trackEvent('return_home', 'navigation', 'thank_you_page');
                      setLocation('/');
                    }}
                    variant="ghost"
                    className="w-full sm:w-auto"
                    data-testid="button-return-home"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}