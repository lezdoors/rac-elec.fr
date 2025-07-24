import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, Power, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function NotFound() {
  
  // Envoi du code d'état HTTP 404 pour que les moteurs de recherche comprennent que c'est une page d'erreur
  useEffect(() => {
    // Ajouter une balise meta pour indiquer aux robots que c'est une page d'erreur
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    // Ajouter un titre spécifique pour la page d'erreur
    document.title = 'Page non trouvée | Raccordement.net';
    
    // On peut également envoyer un événement d'erreur au navigateur
    if (window.history) {
      const stateObj = { title: 'Page non trouvée', code: 404 };
      window.history.replaceState(stateObj, 'Page non trouvée', window.location.pathname);
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* Effet de halo en arrière-plan */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-50/50 blur-[100px] opacity-70"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-green-50/30 blur-[80px] opacity-60"></div>
      
      {/* Carte principale avec effet d'ombre subtil */}
      <motion.div 
        className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icône d'alerte en haut */}
        <motion.div 
          className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center z-10 shadow-md border border-red-100"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </motion.div>
        </motion.div>
        
        {/* Contenu principal */}
        <div className="px-6 py-8 pt-12 text-center">
          {/* Numéro 404 stylisé avec effet de profondeur */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.span 
              className="text-8xl font-bold text-[#2e3d96] drop-shadow-md"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >4</motion.span>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-[#33b060] opacity-30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Power className="h-10 w-10 text-[#33b060] drop-shadow-lg" />
              </motion.div>
            </div>
            <motion.span 
              className="text-8xl font-bold text-[#2e3d96] drop-shadow-md"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            >4</motion.span>
          </motion.div>
          
          {/* Titre et sous-titre avec meilleur contraste et typographie améliorée */}
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Cette page n'est pas raccordée à notre réseau
          </motion.h1>
          
          <motion.div
            className="space-y-3 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
              L'adresse que vous avez demandée n'existe pas ou a été déplacée.
            </p>
            <p className="text-gray-700 font-medium max-w-lg mx-auto">
              Nous vous invitons à revenir à la page d'accueil ou à faire une demande de raccordement.
            </p>
          </motion.div>
          
          {/* Boutons d'action améliorés */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            {/* Bouton Retour à l'accueil */}
            <Link href="/" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full border-[#2e3d96] text-[#2e3d96] hover:bg-[#2e3d96]/5 hover:border-[#2e3d96]/80 shadow-sm hover:shadow transition-all px-6"
                >
                  <Home className="mr-2 h-5 w-5" />
                  <span className="font-medium">Retour à l'accueil</span>
                </Button>
              </motion.div>
            </Link>
            
            {/* Bouton Faire ma demande */}
            <Link href="/raccordement-enedis" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#2e3d96] to-[#2e3d96]/90 hover:from-[#33b060] hover:to-[#33b060]/90 text-white shadow-md hover:shadow-lg transition-all px-6"
                >
                  <Power className="mr-2 h-5 w-5" />
                  <span className="font-medium">Faire ma demande</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          

        </div>
        
        {/* Section d'assistance */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-blue-50/70 py-5 px-6 mt-6 border-t border-blue-100 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-700">
              <motion.span 
                className="font-semibold text-[#2e3d96] mr-1"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >Besoin d'assistance pour votre raccordement ?</motion.span>
            </div>
            <div className="flex flex-col sm:flex-row items-center text-sm max-w-md">
              <span className="text-gray-600 mb-2 sm:mb-0 sm:mr-2 text-center sm:text-right">Si vous recherchez une information spécifique, n'hésitez pas à contacter notre service client au :</span>
              <motion.button 
                onClick={() => {
                  // On ouvre une modale d'appel téléphonique
                  const modalOverlay = document.createElement('div');
                  modalOverlay.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
                  modalOverlay.id = 'phone-modal';
                  
                  // Création de la modale
                  const modalContent = document.createElement('div');
                  modalContent.className = 'bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative';
                  
                  // Animation d'entrée
                  modalContent.style.animation = 'modalFadeIn 0.3s ease-out forwards';
                  
                  // Définir le contenu HTML de la modale
                  modalContent.innerHTML = `
                    <style>
                      @keyframes modalFadeIn {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                      }
                      @keyframes phoneRing {
                        0%, 100% { transform: rotate(0deg); }
                        10% { transform: rotate(-5deg); }
                        20% { transform: rotate(5deg); }
                        30% { transform: rotate(-5deg); }
                        40% { transform: rotate(5deg); }
                        50% { transform: rotate(0deg); }
                      }
                      .phone-ring {
                        animation: phoneRing 2s ease-in-out infinite;
                      }
                    </style>
                    <button id="close-modal" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div class="text-center mb-6">
                      <div class="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 phone-ring">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#2e3d96]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <h3 class="text-xl font-bold text-gray-800">Contacter notre service client</h3>
                      <p class="text-gray-600 mt-2 mb-4">Appelez-nous au :</p>
                      <p class="text-[#2e3d96] text-2xl font-bold">+33 (0) 9 70 70 16 43</p>
                    </div>
                    <div class="flex flex-col gap-3">
                      <a href="tel:0970701643" class="w-full py-2.5 px-4 bg-[#2e3d96] hover:bg-[#2e3d96]/90 text-white rounded-lg flex items-center justify-center font-medium shadow-sm hover:shadow transition-all">
                        <span>Appeler maintenant</span>
                      </a>
                      <div class="flex gap-3">
                        <a href="/" class="flex-1 py-2.5 px-4 border border-[#2e3d96] text-[#2e3d96] rounded-lg flex items-center justify-center font-medium hover:bg-[#2e3d96]/5 transition-all">
                          <span>Accueil</span>
                        </a>
                        <a href="/raccordement-enedis" class="flex-1 py-2.5 px-4 bg-[#33b060] hover:bg-[#33b060]/90 text-white rounded-lg flex items-center justify-center font-medium shadow-sm hover:shadow transition-all">
                          <span>Demande</span>
                        </a>
                      </div>
                    </div>
                  `;
                  
                  // Ajouter le contenu à l'overlay
                  modalOverlay.appendChild(modalContent);
                  
                  // Ajouter l'overlay au body
                  document.body.appendChild(modalOverlay);
                  
                  // Fermer la modale quand on clique sur le bouton de fermeture
                  document.getElementById('close-modal')?.addEventListener('click', () => {
                    modalOverlay.style.opacity = '0';
                    setTimeout(() => {
                      document.body.removeChild(modalOverlay);
                    }, 300);
                  });
                  
                  // Fermer la modale quand on clique en dehors du contenu
                  modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                      modalOverlay.style.opacity = '0';
                      setTimeout(() => {
                        document.body.removeChild(modalOverlay);
                      }, 300);
                    }
                  });
                }}
                className="flex items-center px-3 py-1.5 bg-white rounded-full shadow-sm text-[#2e3d96] font-bold hover:text-[#33b060] hover:bg-white hover:shadow-md transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>09 70 70 16 43</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
