import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Check, 
  X,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CookieSettings {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // La bannière de cookies est désactivée
    setShowBanner(false);
    
    // Définir automatiquement les cookies comme acceptés
    // pour que les fonctionnalités du site continuent de fonctionner
    if (!localStorage.getItem("cookie-consent")) {
      const defaultSettings = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("cookie-consent", JSON.stringify(defaultSettings));
    }
  }, []);

  // Gérer l'acceptation de tous les cookies
  const handleAcceptAll = () => {
    const newSettings = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    setSettings(newSettings);
    
    // Stocker localement
    localStorage.setItem("cookie-consent", JSON.stringify({
      ...newSettings,
      timestamp: new Date().toISOString(),
    }));
    
    // Envoyer au serveur si possible
    try {
      // Créer un ID de session unique si on n'en a pas déjà
      let sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("session-id", sessionId);
      }
      
      // Envoyer les préférences au serveur
      fetch("/api/store-cookie-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          preferences: newSettings
        }),
      }).catch(err => console.error("Erreur lors de l'enregistrement des préférences de cookies:", err));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences de cookies:", error);
    }
    
    setShowBanner(false);
  };

  // Gérer le refus de tous les cookies non essentiels
  const handleRejectAll = () => {
    setSettings({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    
    // Stocker localement
    localStorage.setItem("cookie-consent", JSON.stringify({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    
    // Envoyer au serveur si possible
    try {
      // Créer un ID de session unique si on n'en a pas déjà
      let sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("session-id", sessionId);
      }
      
      // Envoyer les préférences au serveur
      fetch("/api/store-cookie-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          preferences: {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
          }
        }),
      }).catch(err => console.error("Erreur lors de l'enregistrement des préférences de cookies:", err));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences de cookies:", error);
    }
    
    // Afficher le message de refus temporaire
    const rejectMessage = document.createElement("div");
    rejectMessage.className = "fixed top-0 left-0 right-0 bg-red-100 text-red-800 p-4 text-center";
    rejectMessage.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <p class="font-semibold">Cookies refusés</p>
        <p>Ce site a besoin des cookies pour fonctionner correctement. Veuillez quitter le site.</p>
      </div>
    `;
    document.body.appendChild(rejectMessage);
    
    // Supprimer le message après 2 secondes
    setTimeout(() => {
      if (rejectMessage.parentNode) {
        rejectMessage.parentNode.removeChild(rejectMessage);
      }
    }, 2000);
    
    setShowBanner(false);
  };

  // Gérer l'enregistrement des préférences personnalisées
  const handleSavePreferences = () => {
    // Stocker localement
    localStorage.setItem("cookie-consent", JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString(),
    }));
    
    // Envoyer au serveur si possible
    try {
      // Créer un ID de session unique si on n'en a pas déjà
      let sessionId = localStorage.getItem("session-id");
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("session-id", sessionId);
      }
      
      // Envoyer les préférences au serveur
      fetch("/api/store-cookie-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          preferences: settings
        }),
      }).catch(err => console.error("Erreur lors de l'enregistrement des préférences de cookies:", err));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences de cookies:", error);
    }
    
    // Afficher un message temporaire de confirmation
    const confirmMessage = document.createElement("div");
    confirmMessage.className = "fixed top-0 left-0 right-0 bg-green-100 text-green-800 p-4 text-center";
    confirmMessage.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <p class="font-semibold">Préférences enregistrées</p>
        <p>Vos préférences de cookies ont été enregistrées.</p>
      </div>
    `;
    document.body.appendChild(confirmMessage);
    
    // Supprimer le message après 2 secondes
    setTimeout(() => {
      if (confirmMessage.parentNode) {
        confirmMessage.parentNode.removeChild(confirmMessage);
      }
    }, 2000);
    
    setOpen(false);
    setShowBanner(false);
  };

  // Si la bannière ne doit pas être affichée, ne rien rendre
  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Gestion des cookies</h2>
                <p className="text-sm text-gray-600 max-w-3xl">
                  Notre site utilise des cookies pour améliorer votre expérience. Nous utilisons des cookies nécessaires au fonctionnement du site, ainsi que d'autres qui nous aident à comprendre comment vous interagissez avec notre site. Vous pouvez accepter tous les cookies, les refuser ou personnaliser vos préférences.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 ml-0 md:ml-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setOpen(true);
                  setShowBanner(false);
                }}
                className="text-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gérer les préférences
              </Button>
              <Button 
                variant="outline"
                onClick={handleRejectAll}
                className="text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Refuser
              </Button>
              <Button 
                onClick={handleAcceptAll}
                className="bg-[#32b34a] hover:bg-[#2a9e40]"
              >
                <Check className="h-4 w-4 mr-2" />
                Tout accepter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Préférences de cookies</DialogTitle>
            <DialogDescription>
              Personnalisez vos préférences de cookies en sélectionnant les catégories que vous acceptez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-4">
              <Checkbox 
                id="necessary" 
                checked={settings.necessary} 
                disabled 
              />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="necessary" 
                  className="font-medium text-sm"
                >
                  Cookies nécessaires
                </Label>
                <p className="text-sm text-gray-500">
                  Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Checkbox 
                id="functional" 
                checked={settings.functional}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, functional: checked === true }))
                }
              />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="functional" 
                  className="font-medium text-sm"
                >
                  Cookies fonctionnels
                </Label>
                <p className="text-sm text-gray-500">
                  Ces cookies permettent de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Checkbox 
                id="analytics" 
                checked={settings.analytics}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, analytics: checked === true }))
                }
              />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="analytics" 
                  className="font-medium text-sm"
                >
                  Cookies analytiques
                </Label>
                <p className="text-sm text-gray-500">
                  Ces cookies nous aident à comprendre comment vous interagissez avec notre site et à l'améliorer.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Checkbox 
                id="marketing" 
                checked={settings.marketing}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, marketing: checked === true }))
                }
              />
              <div className="grid gap-1.5">
                <Label 
                  htmlFor="marketing" 
                  className="font-medium text-sm"
                >
                  Cookies marketing
                </Label>
                <p className="text-sm text-gray-500">
                  Ces cookies permettent d'afficher des publicités personnalisées et pertinentes pour vous.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSavePreferences}
              className="bg-[#32b34a] hover:bg-[#2a9e40]"
            >
              Enregistrer les préférences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}