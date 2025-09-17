import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "@/components/ui/charts-dynamic";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAnimationPreset } from "@/components/providers/animation-provider";
import { staggerListAnimation, listItemAnimation, chartAnimation } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Users, BarChart3, Percent, Timer, Mail, UserCheck2, User } from "lucide-react";

/**
 * Tableau de bord pour les agents et responsables
 * Affiche des statistiques personnalisées selon le rôle de l'utilisateur
 */
export default function AgentDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const animPreset = useAnimationPreset();
  
  const userId = user?.id;
  const userRole = user?.role?.toLowerCase() || '';
  const isManager = userRole === "manager";
  
  // Récupération des statistiques de l'agent ou de l'équipe
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [isManager ? "/api/stats/team" : `/api/stats/agent/${userId}`],
    enabled: !!userId,
  });
  
  // Récupération des tâches récentes
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks/recent"],
    enabled: !!userId,
  });
  
  // Récupération des leads récents
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: [isManager ? "/api/leads/team" : `/api/leads/agent/${userId}`],
    enabled: !!userId,
  });
  
  // Fonction pour afficher les statistiques de manière conditionnelle
  const renderStats = () => {
    if (statsLoading) {
      return <div className="h-40 flex items-center justify-center">Chargement des statistiques...</div>;
    }
    
    if (!stats) {
      return (
        <div className="h-40 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-2">Aucune statistique disponible</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Actualiser
          </Button>
        </div>
      );
    }

    return (
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerListAnimation}
        initial="hidden"
        animate="visible"
      >
        {/* Leads convertis */}
        <motion.div variants={listItemAnimation} custom={0}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isManager ? "Leads de l'équipe" : "Mes leads"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leadsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Taux de conversion: {stats.conversionRate || 0}%
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demandes gérées */}
        <motion.div variants={listItemAnimation} custom={1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isManager ? "Demandes de l'équipe" : "Mes demandes"}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requestsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stats.requestsChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {stats.requestsChange >= 0 ? "+" : ""}{stats.requestsChange || 0}%
                </span>{" "}
                par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux de réponse */}
        <motion.div variants={listItemAnimation} custom={2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de réponse</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Temps moyen: {stats.avgResponseTime || 0} min
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tâches */}
        <motion.div variants={listItemAnimation} custom={3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches en cours</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasksCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasksCount || 0} tâches terminées ce mois
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  // Fonction pour afficher le graphique des tâches
  const renderTasksChart = () => {
    if (tasksLoading) {
      return <div className="h-64 flex items-center justify-center">Chargement des tâches...</div>;
    }

    return (
      <motion.div
        variants={chartAnimation}
        initial="hidden"
        animate="visible"
        className="h-[300px]"
      >
        {tasks && tasks.length > 0 ? (
          <BarChart
            data={tasks.map((task: any) => ({
              name: task.title?.substring(0, 20) || "Tâche",
              total: task.timeSpent || 0,
              value: task.priority === "high" ? 100 : task.priority === "medium" ? 60 : 30,
            }))}
            title="Tâches récentes"
            valueFormatter={(value: number) => `${value} min`}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-2">Aucune tâche récente</p>
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = "/admin/tasks/new";
              }}
            >
              Créer une tâche
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  // Fonction pour afficher le graphique des leads
  const renderLeadsChart = () => {
    if (leadsLoading) {
      return <div className="h-64 flex items-center justify-center">Chargement des leads...</div>;
    }

    // Préparation des données pour le graphique
    const leadData = leads ? [
      { name: "Nouveaux", value: leads.filter((l: any) => l.status === "new").length },
      { name: "En cours", value: leads.filter((l: any) => l.status === "in_progress").length },
      { name: "Qualifiés", value: leads.filter((l: any) => l.status === "qualified").length },
      { name: "Convertis", value: leads.filter((l: any) => l.status === "converted").length },
      { name: "Perdus", value: leads.filter((l: any) => l.status === "lost").length },
    ] : [];

    return (
      <motion.div
        variants={chartAnimation}
        initial="hidden"
        animate="visible"
        className="h-[300px]"
      >
        {leads && leads.length > 0 ? (
          <PieChart
            data={leadData}
            title={isManager ? "Leads de l'équipe" : "Mes leads"}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-2">Aucun lead disponible</p>
            {!isManager && (
              <Button 
                variant="outline" 
                onClick={() => {
                  window.location.href = "/admin/leads";
                }}
              >
                Voir les leads
              </Button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // Fonction pour afficher les activités récentes
  const renderRecentActivities = () => {
    const activitiesLoading = statsLoading || tasksLoading || leadsLoading;
    const hasActivities = stats?.recentActivities && stats.recentActivities.length > 0;

    if (activitiesLoading) {
      return <div className="h-64 flex items-center justify-center">Chargement des activités...</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {hasActivities ? (
            <motion.ul 
              className="space-y-4"
              variants={staggerListAnimation}
              initial="hidden"
              animate="visible"
            >
              {stats.recentActivities.map((activity: any, index: number) => (
                <motion.li 
                  key={index}
                  variants={listItemAnimation}
                  custom={index}
                  className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.type === 'email' && <Mail className="h-4 w-4 text-primary" />}
                    {activity.type === 'task' && <Timer className="h-4 w-4 text-primary" />}
                    {activity.type === 'lead' && <User className="h-4 w-4 text-primary" />}
                    {activity.type === 'assignment' && <UserCheck2 className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {new Date(activity.date).toLocaleDateString('fr-FR')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-2">Aucune activité récente</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Actualiser
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {isManager ? "Tableau de bord de l'équipe" : "Mon tableau de bord"}
        </h2>
      </div>

      {/* Section des statistiques */}
      <div className="space-y-6">
        {renderStats()}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Graphique des tâches */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des tâches</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTasksChart()}
            </CardContent>
          </Card>

          {/* Graphique des leads */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des leads</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLeadsChart()}
            </CardContent>
          </Card>
        </div>

        {/* Section des activités récentes */}
        <div>
          {renderRecentActivities()}
        </div>
      </div>
    </div>
  );
}