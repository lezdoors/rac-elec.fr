import { useEffect } from "react";
import { useLocation, Route, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/auth";
    }
  }, [isLoading, user]);
  
  // Rediriger vers le tableau de bord si l'onboarding est déjà complété
  useEffect(() => {
    if (!isLoading && user?.onboardingCompleted) {
      window.location.href = "/admin";
    }
  }, [isLoading, user?.onboardingCompleted]);
  
  return (
    <div className="bg-background min-h-screen">
      {!isLoading && user && <OnboardingWizard />}
      
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}