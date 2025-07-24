import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LogoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Effacer les données d'authentification du localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    
    // Afficher un message de succès
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
    
    // Rediriger automatiquement vers la page d'accueil après un court délai
    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 2000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-blue-100 rounded-full mb-4">
            <LogOut className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Déconnexion en cours</h2>
          <p className="mt-2 text-gray-600">
            Vous avez été déconnecté avec succès du système d'administration.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Vous allez être redirigé vers la page d'accueil...
          </p>
        </div>
        
        <div className="mt-5">
          <Button className="w-full" onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}