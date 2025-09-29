import { useState, useEffect } from "react";
import { MessageCircle, X, Clock, Shield, Star, Phone, Mail, ArrowRight, Send, CheckCircle } from "lucide-react";

// Hook for mobile optimization
const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Mark page as loaded after critical render
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  return { isMobile, isPageLoaded };
};

// Performance-optimized Support Widget Component
export const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'contact', 'success'
  const [formData, setFormData] = useState({ email: '', phone: '', message: '' });
  const { isMobile, isPageLoaded } = useMobileOptimization();

  // Auto-open optimized for mobile performance
  useEffect(() => {
    if (!isPageLoaded) return; // Wait for critical page load

    // Delayed auto-open for better mobile metrics (FCP/LCP)
    const delay = isMobile ? 6000 : 3000; // More delay on mobile for performance
    const timer = setTimeout(() => {
      // Only auto-open if user isn't actively filling forms
      if (!document.querySelector('input:focus, textarea:focus, select:focus')) {
        setIsOpen(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isMobile, isPageLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send lead to backend
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'support_widget',
          timestamp: new Date().toISOString()
        })
      });
      setCurrentView('success');
    } catch (error) {
      console.error('Erreur envoi lead:', error);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`group bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 ${
            isMobile ? 'animate-none' : 'animate-bounce'
          }`}
          style={{
            // Mobile optimizations to reduce repaints
            willChange: isMobile ? 'auto' : 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >
          <MessageCircle className="w-6 h-6" />
          <div className={`absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full ${
            isMobile ? 'animate-none' : 'animate-pulse'
          }`}></div>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      
      {/* Main Widget */}
      <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-500 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Support Portail Enedis</h3>
                  <p className="text-blue-100 text-sm">Notre équipe de spécialistes est disponible</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content based on current view */}
          {currentView === 'main' && (
            <div className="p-6">
              {/* Trust indicators */}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Besoin d'aide avec votre raccordement électrique ? 
                  <span className="font-semibold text-blue-600"> Assistance personnalisée.</span>
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>Réponse sous 2h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>100% Sécurisé</span>
                  </div>
                </div>

                {/* Stats to build trust */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="font-bold text-blue-700">+10,000</div>
                    <div className="text-xs text-blue-600">Clients satisfaits</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="font-bold text-green-700">98%</div>
                    <div className="text-xs text-green-600">Taux de réussite</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView('contact')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Obtenir de l'aide
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => window.open('tel:+33123456789', '_self')}
                  className="w-full bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Appeler maintenant
                </button>
              </div>

              {/* Social proof */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
                <p className="text-xs text-gray-600 italic">
                  "Support exceptionnel ! Mon raccordement a été traité rapidement et sans problème."
                  <span className="font-medium"> - Marie L.</span>
                </p>
              </div>
            </div>
          )}

          {currentView === 'contact' && (
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">Contactez nos experts</h4>
                <p className="text-sm text-gray-600">Réponse garantie sous 24h ouvrées</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="06 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                    placeholder="Décrivez votre projet ou votre question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentView('main')}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Envoyer
                  </button>
                </div>
              </form>

              {/* Trust badges */}
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-600">Sécurisé</span>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-600">Réponse rapide</span>
                </div>
              </div>
            </div>
          )}

          {currentView === 'success' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Message envoyé !</h4>
              <p className="text-gray-600 mb-4">
                Nos experts vous recontacteront sous 24h pour vous accompagner dans votre projet.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>En attendant :</strong> Consultez notre guide complet du raccordement électrique
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};