import { useState } from "react";
import { Helmet } from "react-helmet";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionCard } from "@/components/ui/action-card";
import { 
  BarChart2, 
  FileText, 
  Users, 
  AlertCircle, 
  Settings, 
  Download, 
  Filter, 
  Plus, 
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Page d'exemple pour démontrer les CTA optimisés et l'interface administrative
 */
export default function AdminExamplePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Simuler un chargement de données
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Données actualisées",
        description: "Les demandes de raccordement ont été mises à jour",
        variant: "default"
      });
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Tableau de bord administratif | Enedis Partenaire</title>
        <meta name="description" content="Gérez vos demandes de raccordement Enedis et suivez leur progression" />
      </Helmet>
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* En-tête de la page */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Demandes de raccordement Enedis</h1>
              <p className="text-gray-600">Gérez et suivez les demandes de raccordement électrique</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <AdminButton 
                variant="secondary" 
                size="default"
                iconPosition="left"
                onClick={handleRefresh}
                loading={loading}
              >
                Actualiser
              </AdminButton>
              
              <AdminButton 
                variant="primary" 
                size="default"
                iconPosition="left"
              >
                Nouvelle demande
              </AdminButton>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Demandes en cours</p>
                  <p className="text-2xl font-semibold text-gray-900">28</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Demandes traitées</p>
                  <p className="text-2xl font-semibold text-gray-900">152</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Demandes du mois</p>
                  <p className="text-2xl font-semibold text-gray-900">42</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Demandes en attente</p>
                  <p className="text-2xl font-semibold text-gray-900">7</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtres et actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <AdminButton variant="secondary" size="sm" iconPosition="left">
                <Filter className="h-4 w-4" />
                Filtrer
              </AdminButton>
              
              <AdminButton variant="secondary" size="sm" iconPosition="left">
                <Settings className="h-4 w-4" />
                Paramètres
              </AdminButton>
              
              <AdminButton variant="export" size="sm" iconPosition="left">
                <Download className="h-4 w-4" />
                Exporter
              </AdminButton>
            </div>
            
            <div className="flex gap-2">
              <StatusBadge status="pending" label="En attente (7)" />
              <StatusBadge status="processing" label="En cours (15)" />
              <StatusBadge status="completed" label="Terminé (152)" />
            </div>
          </div>
          
          {/* Liste des demandes */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <ActionCard 
              title="Raccordement définitif - Paris 15e"
              description="Raccordement d'une maison neuve pour le branchement électrique."
              icon={<FileText className="h-5 w-5 text-blue-600" />}
              status="processing"
              metadata={[
                { label: "Client", value: "Martin Dupont" },
                { label: "Référence", value: "REF-2025-0456" },
                { label: "Date", value: "15/05/2025" }
              ]}
              actions={[
                { label: "Voir détails", variant: "primary" },
                { label: "Mettre à jour", variant: "secondary" }
              ]}
              elevation="medium"
              variant="outlined"
              highlight={true}
            />
            
            <ActionCard 
              title="Déplacement compteur Linky - Lyon"
              description="Déplacement d'un compteur existant vers nouvel emplacement."
              icon={<FileText className="h-5 w-5 text-blue-600" />}
              status="pending"
              metadata={[
                { label: "Client", value: "Sophie Martin" },
                { label: "Référence", value: "REF-2025-0422" },
                { label: "Date", value: "10/05/2025" }
              ]}
              actions={[
                { label: "Voir détails", variant: "primary" },
                { label: "Valider dossier", variant: "success" }
              ]}
              elevation="medium"
              variant="outlined"
            />
            
            <ActionCard 
              title="Augmentation puissance - Marseille"
              description="Passage de 6 à 9 kVA pour installation pompe à chaleur."
              icon={<FileText className="h-5 w-5 text-blue-600" />}
              status="completed"
              metadata={[
                { label: "Client", value: "Jean Durand" },
                { label: "Référence", value: "REF-2025-0389" },
                { label: "Date", value: "28/04/2025" }
              ]}
              actions={[
                { label: "Voir détails", variant: "info" },
                { label: "Exporter PDF", variant: "export" }
              ]}
              elevation="low"
              variant="outlined"
            />
            
            <ActionCard 
              title="Raccordement provisoire - Bordeaux"
              description="Chantier construction d'une durée de 6 mois."
              icon={<FileText className="h-5 w-5 text-blue-600" />}
              status="warning"
              metadata={[
                { label: "Client", value: "Entreprise BTP Sud" },
                { label: "Référence", value: "REF-2025-0412" },
                { label: "Date", value: "05/05/2025" }
              ]}
              actions={[
                { label: "Voir détails", variant: "primary" },
                { label: "Compléter dossier", variant: "warning" }
              ]}
              elevation="medium"
              variant="outlined"
            />
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Affichage de 1 à 4 sur 28 demandes
            </div>
            
            <div className="flex gap-2">
              <AdminButton variant="secondary" size="sm" disabled>Précédent</AdminButton>
              <AdminButton variant="primary" size="sm">Suivant</AdminButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}