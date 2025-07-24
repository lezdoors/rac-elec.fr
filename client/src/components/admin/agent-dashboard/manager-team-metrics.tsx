import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3, Award, TrendingUp, Users, FileText, Euro, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TeamMemberMetrics {
  userId: number;
  username: string;
  fullName: string;
  leadConversionRate: number;
  clientSatisfaction: number;
  totalTasks: number;
  completedTasks: number;
  totalCommission: number;
  leadsGenerated: number;
}

interface TeamPerformanceMetrics {
  teamMetrics: TeamMemberMetrics[];
  aggregateMetrics: {
    avgLeadConversion: number;
    avgClientSatisfaction: number;
    totalTasks: number;
    completedTasks: number;
    totalLeads: number;
    totalCommission: number;
  };
}

export default function ManagerTeamMetrics() {
  const { data, isLoading, error } = useQuery<{ success: boolean; teamMetrics: TeamMemberMetrics[]; aggregateMetrics: any }>({
    queryKey: ["/api/team/performance/metrics"],
  });

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
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
          <CardTitle>Métriques d'Équipe</CardTitle>
          <CardDescription>Performance collective de votre équipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
            
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métriques d'Équipe</CardTitle>
          <CardDescription>Performance collective de votre équipe</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-muted-foreground text-center">
            Impossible de charger les métriques d'équipe.
            <br />
            Veuillez réessayer plus tard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const teamMetrics = data.teamMetrics || [];
  const aggregateMetrics = data.aggregateMetrics || {
    avgLeadConversion: 0,
    avgClientSatisfaction: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalLeads: 0,
    totalCommission: 0
  };

  // Si aucune donnée d'équipe n'est disponible
  if (teamMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <span>Métriques d'Équipe</span>
          </CardTitle>
          <CardDescription>Performance collective de votre équipe</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Users className="h-12 w-12 text-blue-500 mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            Aucun membre d'équipe n'est actuellement assigné sous votre responsabilité.
          </p>
          <p className="text-sm text-center">
            Les métriques d'équipe seront disponibles lorsque des utilisateurs seront ajoutés à votre équipe.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <span>Métriques d'Équipe</span>
        </CardTitle>
        <CardDescription>Performance collective de votre équipe ({teamMetrics.length} membres)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques agrégées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Taux de conversion moyen
                </span>
                <span className="text-sm font-bold">{formatPercentage(aggregateMetrics.avgLeadConversion)}</span>
              </div>
              <Progress 
                value={aggregateMetrics.avgLeadConversion} 
                className={`h-2 ${getProgressColor(aggregateMetrics.avgLeadConversion)}`} 
                style={{ backgroundColor: "#e2e8f0" }}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  Satisfaction client moyenne
                </span>
                <span className="text-sm font-bold">{formatPercentage(aggregateMetrics.avgClientSatisfaction)}</span>
              </div>
              <Progress 
                value={aggregateMetrics.avgClientSatisfaction} 
                className={`h-2 ${getProgressColor(aggregateMetrics.avgClientSatisfaction)}`} 
                style={{ backgroundColor: "#e2e8f0" }}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-green-500" />
                  Tâches complétées
                </span>
                <span className="text-sm font-bold">
                  {aggregateMetrics.completedTasks} / {aggregateMetrics.totalTasks}
                </span>
              </div>
              <Progress 
                value={aggregateMetrics.totalTasks ? (aggregateMetrics.completedTasks / aggregateMetrics.totalTasks) * 100 : 0} 
                className={`h-2 ${getProgressColor(aggregateMetrics.totalTasks ? (aggregateMetrics.completedTasks / aggregateMetrics.totalTasks) * 100 : 0)}`} 
                style={{ backgroundColor: "#e2e8f0" }}
              />
            </div>
          </div>
          
          {/* Tableau des membres d'équipe */}
          <div className="rounded-md border">
            <Table>
              <TableCaption>Performances individuelles des membres de l'équipe</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-right">Conv. Leads</TableHead>
                  <TableHead className="text-right">Satisfaction</TableHead>
                  <TableHead className="text-right">Tâches</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMetrics.map((member) => {
                  // Calcul du score de performance global (simple moyenne des métriques clés)
                  const performanceScore = (
                    (member.leadConversionRate / 100) + 
                    (member.clientSatisfaction / 100) + 
                    (member.totalTasks ? member.completedTasks / member.totalTasks : 0)
                  ) / 3 * 100;
                  
                  // Détermination du statut de performance
                  let performanceStatus;
                  if (performanceScore >= 75) performanceStatus = "excellent";
                  else if (performanceScore >= 60) performanceStatus = "good";
                  else if (performanceScore >= 40) performanceStatus = "average";
                  else performanceStatus = "poor";
                  
                  return (
                    <TableRow key={member.userId}>
                      <TableCell className="font-medium">
                        {member.fullName || member.username}
                      </TableCell>
                      <TableCell className="text-right">{formatPercentage(member.leadConversionRate)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(member.clientSatisfaction)}</TableCell>
                      <TableCell className="text-right">
                        {member.completedTasks}/{member.totalTasks}
                      </TableCell>
                      <TableCell className="text-right">{member.leadsGenerated}</TableCell>
                      <TableCell className="text-right">{formatCurrency(member.totalCommission)}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          className={`
                            ${performanceStatus === "excellent" ? "bg-green-500 hover:bg-green-600" : ""} 
                            ${performanceStatus === "good" ? "bg-blue-500 hover:bg-blue-600" : ""} 
                            ${performanceStatus === "average" ? "bg-amber-500 hover:bg-amber-600" : ""} 
                            ${performanceStatus === "poor" ? "bg-red-500 hover:bg-red-600" : ""}
                          `}
                        >
                          {performanceStatus === "excellent" ? "Excellent" : ""}
                          {performanceStatus === "good" ? "Bon" : ""}
                          {performanceStatus === "average" ? "Moyen" : ""}
                          {performanceStatus === "poor" ? "Faible" : ""}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}