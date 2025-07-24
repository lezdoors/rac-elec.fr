import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, Goal, Award, TrendingUp, AlertCircle, BarChart, FileText, Users, Euro } from "lucide-react";

interface PerformanceMetrics {
  leadConversionRate: number;
  completedTasks: number;
  totalTasks: number;
  leadsGenerated: number;
  paymentsProcessed: number;
  targetCompletion: number;
  totalCommission: number;
  averageResponseTime: number;
  clientSatisfaction: number;
}

export default function AgentPerformanceMetrics() {
  const { data, isLoading, error } = useQuery<{ metrics: PerformanceMetrics }>({
    queryKey: ["/api/user/performance/metrics"],
  });

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 40) return "bg-red-500";
    if (percentage < 70) return "bg-amber-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques de Performance</CardTitle>
          <CardDescription>Vos indicateurs clés de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques de Performance</CardTitle>
          <CardDescription>Vos indicateurs clés de performance</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-muted-foreground text-center">
            Impossible de charger les métriques de performance.
            <br />
            Veuillez réessayer plus tard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = data.metrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          <span>Métriques de Performance</span>
        </CardTitle>
        <CardDescription>Vos indicateurs clés de performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Taux de conversion des leads */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Taux de conversion
              </span>
              <span className="text-sm font-bold">{formatPercentage(metrics.leadConversionRate)}</span>
            </div>
            <Progress value={metrics.leadConversionRate} className={`h-2 ${getProgressColor(metrics.leadConversionRate)}`} />
            <p className="text-xs text-muted-foreground">
              {metrics.leadConversionRate >= 50 ? "Excellent taux de conversion" : "En progression"}
            </p>
          </div>
          
          {/* Progression vers l'objectif */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Goal className="h-4 w-4 text-indigo-500" />
                Progression vers l'objectif
              </span>
              <span className="text-sm font-bold">{formatPercentage(metrics.targetCompletion)}</span>
            </div>
            <Progress value={metrics.targetCompletion} className={`h-2 ${getProgressColor(metrics.targetCompletion)}`} />
            <p className="text-xs text-muted-foreground">
              {metrics.targetCompletion >= 80 ? "Objectif presque atteint !" : "Continuez vos efforts"}
            </p>
          </div>
          
          {/* Tâches complétées */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-green-500" />
                Tâches complétées
              </span>
              <span className="text-sm font-bold">{metrics.completedTasks} / {metrics.totalTasks}</span>
            </div>
            <Progress 
              value={metrics.totalTasks ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0} 
              className={`h-2 ${getProgressColor(metrics.totalTasks ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0)}`}
            />
            <p className="text-xs text-muted-foreground">
              {metrics.totalTasks - metrics.completedTasks} tâches en attente
            </p>
          </div>
          
          {/* Commission totale */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Euro className="h-4 w-4 text-blue-500" />
                Commission totale
              </span>
              <span className="text-sm font-bold">{formatCurrency(metrics.totalCommission)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Basé sur {metrics.paymentsProcessed} paiements traités</span>
              <span className="text-xs text-blue-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                En hausse
              </span>
            </div>
          </div>
          
          {/* Leads générés */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-purple-500" />
                Leads générés
              </span>
              <span className="text-sm font-bold">{metrics.leadsGenerated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Suivi et conversion en cours</span>
              <span className="text-xs text-purple-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{Math.round(metrics.leadsGenerated * 0.12)} cette semaine
              </span>
            </div>
          </div>
          
          {/* Satisfaction client */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                Satisfaction client
              </span>
              <span className="text-sm font-bold">{formatPercentage(metrics.clientSatisfaction)}</span>
            </div>
            <Progress value={metrics.clientSatisfaction} className={`h-2 ${getProgressColor(metrics.clientSatisfaction)}`} />
            <p className="text-xs text-muted-foreground">
              {metrics.clientSatisfaction >= 85 ? "Excellente satisfaction client" : "Peut être améliorée"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}