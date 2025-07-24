import { useAuth } from "@/hooks/use-auth";
import AgentPayments from "./agent-payments";
import AgentTasks from "./agent-tasks";
import AgentPerformanceMetrics from "./agent-performance-metrics";
import AgentLeadsChart from "./agent-leads-chart";
import ManagerTeamMetrics from "./manager-team-metrics";
import PaymentIndicators from "./payment-indicators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, LineChart, ListChecks, Users, Wallet, Zap } from "lucide-react";

export default function AgentDashboard() {
  const { user } = useAuth();
  const userName = user?.fullName || user?.username || "Utilisateur";
  const isManager = user?.role?.toLowerCase() === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord Personnel</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Zap size={14} className="inline" />
            Connecté
          </span>
        </div>
      </div>
      
      <div className="p-6 bg-blue-50 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">Bienvenue, {userName} 👋</h3>
        {isManager ? (
          <p className="text-blue-700">
            Votre tableau de bord personnel vous permet de suivre vos tâches et de gérer votre équipe.
            Utilisez cet espace pour organiser vos priorités et suivre vos performances.
          </p>
        ) : (
          <p className="text-blue-700">
            Votre tableau de bord vous permet de suivre vos tâches et vos commissions.
            Utilisez cet espace pour gérer votre activité quotidienne.
          </p>
        )}
      </div>
      
      {isManager ? (
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Users size={16} />
              <span>Vue personnelle</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Building2 size={16} />
              <span>Vue d'équipe</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Vue personnelle */}
          <TabsContent value="personal" className="space-y-6">
            {/* Indicateurs de paiement en haut */}
            <PaymentIndicators />
            
            <div className="grid gap-6 grid-cols-1">
              <AgentPerformanceMetrics />
              <AgentLeadsChart period="15days" />
            </div>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <AgentTasks />
              </div>
              <div className="lg:col-span-4">
                <AgentPayments />
              </div>
            </div>
          </TabsContent>
          
          {/* Vue d'équipe */}
          <TabsContent value="team" className="space-y-6">
            {/* Indicateurs de paiement en haut */}
            <PaymentIndicators />
            
            <ManagerTeamMetrics />
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-12">
                <Tabs defaultValue="tasks" className="w-full">
                  <TabsList className="w-full max-w-md grid grid-cols-3">
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                      <ListChecks size={16} />
                      <span>Tâches d'équipe</span>
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Leads d'équipe</span>
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="flex items-center gap-2">
                      <Wallet size={16} />
                      <span>Paiements</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tasks" className="mt-4">
                    <AgentTasks teamView />
                  </TabsContent>
                  
                  <TabsContent value="leads" className="mt-4">
                    <AgentLeadsChart period="30days" />
                  </TabsContent>
                  
                  <TabsContent value="payments" className="mt-4">
                    <AgentPayments teamView />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Vue standard pour les agents
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1">
            <AgentPerformanceMetrics />
            <AgentLeadsChart period="15days" />
          </div>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <AgentTasks />
            </div>
            <div className="lg:col-span-4">
              <AgentPayments />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}