import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Users, BarChart2, Calendar, MessageSquare, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Règles importantes à communiquer aux responsables
const managerRules = [
  {
    id: 'team_management',
    title: 'Gestion d\'équipe',
    description: 'Vous pouvez gérer et superviser votre équipe d\'agents, assigner des tâches et suivre leur progression.',
    icon: <Users className="h-5 w-5 text-green-600" />
  },
  {
    id: 'performance',
    title: 'Suivi des performances',
    description: 'Accédez aux tableaux de bord détaillés pour analyser les performances de votre équipe.',
    icon: <BarChart2 className="h-5 w-5 text-blue-600" />
  },
  {
    id: 'planning',
    title: 'Planification',
    description: 'Organisez les rendez-vous et les tâches pour optimiser le travail de votre équipe.',
    icon: <Calendar className="h-5 w-5 text-purple-600" />
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Supervisez et gérez les communications avec les clients pour assurer un service de qualité.',
    icon: <MessageSquare className="h-5 w-5 text-indigo-600" />
  },
  {
    id: 'leads',
    title: 'Gestion des demandes',
    description: 'Attribuez des demandes aux agents appropriés et suivez leur progression.',
    icon: <Layers className="h-5 w-5 text-orange-600" />
  }
];

// Limitations des responsables (manager)
const managerLimitations = [
  {
    id: 'admin_access',
    title: 'Pas d\'accès à l\'administration',
    description: 'Vous n\'avez aucun accès aux paramètres système, à la configuration ou à la gestion des utilisateurs.',
  },
  {
    id: 'system_settings',
    title: 'Pas de configuration système',
    description: 'La configuration du système est réservée aux administrateurs.',
  }
];

export const ManagerWelcomeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  
  // Vérifier si l'utilisateur a déjà complété l'onboarding
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/users/current/settings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/current/settings');
      return await res.json();
    },
    enabled: !!user && user.role === 'manager'
  });
  
  // Mutation pour marquer l'onboarding comme complété
  const markOnboardingCompletedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/users/current/complete-onboarding');
      return res.ok;
    },
    onSuccess: () => {
      // Invalider le cache pour recharger les données utilisateur
      queryClient.invalidateQueries({ queryKey: ['/api/users/current/settings'] });
    }
  });
  
  // Fermer le banner et marquer l'onboarding comme complété
  const handleDismiss = () => {
    setIsVisible(false);
    markOnboardingCompletedMutation.mutate();
  };
  
  // Si l'utilisateur a déjà complété l'onboarding, ne pas afficher le banner
  useEffect(() => {
    if (userData?.onboardingCompleted) {
      setIsVisible(false);
    }
  }, [userData]);
  
  // Ne pas afficher pour les non-responsables ou pendant le chargement
  if (!user || user.role !== 'manager' || isLoading || !isVisible) {
    return null;
  }
  
  return (
    <Card className="border-l-4 border-l-green-500 mb-8 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Bienvenue dans votre espace Responsable
            </h2>
            <p className="text-gray-600 mt-1">
              Découvrez vos fonctions et permissions en tant que responsable d'équipe
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Vos fonctionnalités clés
            </h3>
            <ul className="space-y-3">
              {managerRules.map((rule) => (
                <li key={rule.id} className="flex items-start">
                  <div className="mr-3 mt-0.5">{rule.icon}</div>
                  <div>
                    <p className="font-medium text-gray-700">{rule.title}</p>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              Limitations de votre rôle
            </h3>
            <ul className="space-y-3">
              {managerLimitations.map((limitation) => (
                <li key={limitation.id} className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{limitation.title}</p>
                    <p className="text-sm text-gray-600">{limitation.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
              <p className="text-sm text-amber-800">
                <strong>Important :</strong> Votre profil de responsable est conçu pour vous permettre de vous concentrer sur la gestion de votre équipe. Si vous avez besoin d'accéder à des fonctionnalités d'administration, veuillez contacter un administrateur.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleDismiss}
          >
            J'ai compris
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ManagerWelcomeBanner;