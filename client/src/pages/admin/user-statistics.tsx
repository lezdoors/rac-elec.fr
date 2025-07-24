import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO, differenceInDays, addDays, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { RealtimeIndicator } from "../../components/admin/real-time-indicator";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  BarChart2,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Euro,
  FileText,
  Filter,
  History,
  LineChart,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
} from "lucide-react";

// Types
interface UserStat {
  id: number;
  userId: number;
  leadsReceived: number;
  leadsConverted: number;
  paymentsProcessed: number;
  paymentsAmount: string;
  commissionsEarned: string;
  periodStart: string;
  periodEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserWithStats extends UserStat {
  username: string;
  role: string;
  fullName?: string;
}

interface StatOverview {
  totalLeads: number;
  totalConversions: number;
  totalPayments: number;
  totalAmount: number;
  totalCommissions: number;
  byUser: Record<number, UserWithStats>;
}

// Composant principal
const UserStatistics = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAdminView, setShowAdminView] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [historyPeriod, setHistoryPeriod] = useState("current");
  const [showAutoResetInfo, setShowAutoResetInfo] = useState(false);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // État pour les vues supplémentaires des managers
  const [viewMode, setViewMode] = useState<string>("personal");
  const [isManagerRole, setIsManagerRole] = useState<boolean>(false);
  const [isAdminRole, setIsAdminRole] = useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  // État pour conserver les infos utilisateur
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Détecter le rôle de l'utilisateur et configurer les vues appropriées
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === "admin";
      const isManager = user.role === "manager";
      
      setIsAdminRole(isAdmin);
      setIsManagerRole(isManager);
      setShowAdminView(isAdmin || isManager);
      setUserInfo(user);
      
      // Si l'utilisateur est un manager, récupérer par défaut ses statistiques et celles de son équipe
      if (isManager && user.id) {
        setSelectedUserId(user.id);
        setViewMode("team"); // Les managers voient d'abord la vue d'équipe
        
        // Récupérer les membres de l'équipe pour le manager en utilisant queryClient
        queryClient.fetchQuery({
          queryKey: [`/api/users/team/${user.id}`],
          queryFn: () => apiRequest("GET", `/api/users/team/${user.id}`)
            .then(response => response.json())
            .then(data => {
              if (data.success && data.users) {
                setTeamMembers(data.users);
              }
              return data;
            })
        }).catch(error => {
          console.error("Erreur lors de la récupération des membres de l'équipe", error);
        });
      }
      // Si l'utilisateur n'est ni admin ni manager, définir automatiquement sur ses propres stats
      else if (!isAdmin && !isManager && user.id) {
        setSelectedUserId(user.id);
        setViewMode("personal");
      }
    }
  }, [user, queryClient]);

  // Configuration de la réactualisation automatique à minuit le 15 et dernier jour du mois
  useEffect(() => {
    const scheduleNextRefresh = () => {
      const now = new Date();
      const currentDay = now.getDate();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      let nextRefresh: Date;
      
      // Déterminer la prochaine date de réactualisation
      if (currentDay < 15) {
        // Prochaine réactualisation le 15 du mois
        nextRefresh = new Date(now.getFullYear(), now.getMonth(), 15, 0, 0, 0);
      } else if (currentDay < lastDayOfMonth) {
        // Prochaine réactualisation le dernier jour du mois
        nextRefresh = new Date(now.getFullYear(), now.getMonth() + 1, 0, 0, 0, 0);
      } else {
        // Prochaine réactualisation le 15 du mois prochain
        nextRefresh = new Date(now.getFullYear(), now.getMonth() + 1, 15, 0, 0, 0);
      }
      
      // Calculer le délai jusqu'à la prochaine réactualisation
      const msUntilRefresh = nextRefresh.getTime() - now.getTime();
      
      // Afficher un message informatif si la réactualisation est prévue dans les 24 heures
      if (msUntilRefresh < 24 * 60 * 60 * 1000) {
        setShowAutoResetInfo(true);
      }
      
      // Programmer la réactualisation
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
      }
      
      autoRefreshTimerRef.current = setTimeout(() => {
        // Rafraîchir les données et notifier l'utilisateur
        queryClient.invalidateQueries({ queryKey: ["/api/user-stats/current"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user-stats/overview"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user-stats/history"] });
        
        toast({
          title: "Statistiques réinitialisées",
          description: "Les statistiques ont été automatiquement réinitialisées pour la nouvelle période.",
        });
        
        // Reprogrammer pour la période suivante
        scheduleNextRefresh();
      }, msUntilRefresh);
    };
    
    // Initialiser la planification
    scheduleNextRefresh();
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
      }
    };
  }, [toast]);

  // Récupérer les statistiques actuelles de l'utilisateur
  const { data: currentStats, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["/api/user-stats/current", selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        selectedUserId ? `/api/user-stats/current/${selectedUserId}` : "/api/user-stats/current"
      );
      return await response.json();
    },
    enabled: !!user,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  // Récupérer l'aperçu des statistiques (admin uniquement)
  const { data: statsOverview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["/api/user-stats/overview"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-stats/overview");
      return await response.json();
    },
    enabled: !!user && showAdminView && activeTab === "overview",
  });

  // Récupérer l'historique des statistiques
  const { data: statsHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/user-stats/history", selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        selectedUserId ? `/api/user-stats/history/${selectedUserId}` : "/api/user-stats/history"
      );
      return await response.json();
    },
    enabled: !!user && activeTab === "history",
  });

  // Récupérer la liste des utilisateurs (pour le filtrage)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return await response.json();
    },
    enabled: !!user && showAdminView,
  });

  // Formater un montant en euros
  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (numAmount / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculer le taux de conversion
  const conversionRate = currentStats 
    ? currentStats.leadsReceived > 0 
      ? (currentStats.leadsConverted / currentStats.leadsReceived) * 100 
      : 0
    : 0;
    
  // Calculer le nombre de jours restants jusqu'à la prochaine réinitialisation
  const getDaysUntilReset = () => {
    if (!currentStats?.periodEnd) return 0;
    
    const now = new Date();
    const endDate = parseISO(currentStats.periodEnd);
    
    // S'assurer que la date de fin est dans le futur
    if (isBefore(endDate, now)) return 0;
    
    return differenceInDays(endDate, now);
  };
  
  // Calculer le pourcentage de progression dans la période actuelle
  const getProgressPercentage = () => {
    if (!currentStats?.periodStart || !currentStats?.periodEnd) return 0;
    
    const startDate = parseISO(currentStats.periodStart);
    const endDate = parseISO(currentStats.periodEnd);
    const now = new Date();
    
    // Calculer la durée totale de la période et le temps écoulé
    const totalDuration = differenceInDays(endDate, startDate);
    const elapsed = differenceInDays(now, startDate);
    
    // Calculer le pourcentage (limité entre 0 et 100)
    return Math.max(0, Math.min(100, Math.floor((elapsed / totalDuration) * 100)));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Statistiques de performance</h1>
            {!showAdminView && (
              <p className="text-sm text-muted-foreground mt-1">
                Visualisez et suivez vos statistiques personnelles et les périodes précédentes
              </p>
            )}
            {isManagerRole && (
              <div className="flex items-center mt-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mr-2">
                  {isAdminRole ? "Admin" : "Manager"}
                </Badge>
                {teamMembers.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {teamMembers.length} {teamMembers.length > 1 ? "membres" : "membre"} dans votre équipe
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RealtimeIndicator />
            {/* Bandeau de période actuelle */}
            {currentStats && (
              <Badge variant="outline" className="gap-1 py-1.5 px-2 font-normal">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Période: {formatDate(currentStats.periodStart)} - {formatDate(currentStats.periodEnd)}
              </Badge>
            )}
            {showAdminView && (
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "Réinitialisation forcée",
                    description: "Les statistiques seront réinitialisées pour tous les utilisateurs.",
                  });
                  
                  queryClient.fetchQuery({
                    queryKey: ["/api/user-stats/reset"],
                    queryFn: () => apiRequest("POST", "/api/user-stats/reset")
                      .then(response => response.json())
                  })
                  .then(data => {
                    if (data.success) {
                      toast({
                        title: "Statistiques réinitialisées",
                        description: "Les données ont été archivées et remises à zéro.",
                      });
                      
                      // Rafraîchir toutes les données
                      queryClient.invalidateQueries({ queryKey: ["/api/user-stats/current"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/user-stats/overview"] });
                    } else {
                      toast({
                        title: "Erreur",
                        description: data.message || "Une erreur est survenue lors de la réinitialisation.",
                        variant: "destructive",
                      });
                    }
                  })
                  .catch(error => {
                    toast({
                      title: "Erreur",
                      description: "Une erreur est survenue lors de la réinitialisation.",
                      variant: "destructive",
                    });
                  });
                }}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
        
        {/* Indicateurs de paiement en haut de page */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="mb-2 mt-2 rounded-full bg-green-100 p-2 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {statsOverview?.totalPayments || currentStats?.paymentsProcessed || 0}
              </div>
              <p className="text-sm text-green-600">Paiements réussis</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="mb-2 mt-2 rounded-full bg-amber-100 p-2 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="text-3xl font-bold text-amber-700">
                0
              </div>
              <p className="text-sm text-amber-600">En cours</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="mb-2 mt-2 rounded-full bg-red-100 p-2 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m15 9-6 6"></path>
                  <path d="m9 9 6 6"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-red-700">
                0
              </div>
              <p className="text-sm text-red-600">Échoués/Abandonnés</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <TabsList>
                <TabsTrigger value="current">Période actuelle</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                {showAdminView && (
                  <TabsTrigger value="overview">Vue globale</TabsTrigger>
                )}
              </TabsList>
              
              {/* Filtres spécifiques selon le rôle */}
              {isManagerRole && activeTab === "current" && (
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => {
                    if (value) {
                      setViewMode(value);
                      
                      // Si on passe en vue d'équipe, s'assurer que les données équipe sont chargées
                      if (value === "team") {
                        // Charger les données de l'équipe si ce n'est pas déjà fait
                        if (teamMembers.length === 0 && user && user.id) {
                          queryClient.fetchQuery({
                            queryKey: [`/api/users/team/${user.id}`],
                            queryFn: () => apiRequest("GET", `/api/users/team/${user.id}`)
                              .then(response => response.json())
                              .then(data => {
                                if (data.success && data.users) {
                                  setTeamMembers(data.users);
                                }
                                return data;
                              })
                          }).catch(error => {
                            console.error("Erreur lors de la récupération des membres de l'équipe", error);
                            toast({
                              title: "Erreur",
                              description: "Impossible de charger les données de l'équipe",
                              variant: "destructive"
                            });
                          });
                        }
                      }
                    }
                  }}
                  className="flex"
                >
                  <ToggleGroupItem value="personal" size="sm" className="text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Mes statistiques
                  </ToggleGroupItem>
                  <ToggleGroupItem value="team" size="sm" className="text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Équipe
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Badge de statut de la période */}
              {currentStats && (
                <Badge variant="outline" className="gap-1 py-1 px-2 font-normal">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {formatDate(currentStats.periodStart)} - {formatDate(currentStats.periodEnd)}
                </Badge>
              )}
              
              {/* Filtre par utilisateur pour admin/manager */}
              {showAdminView && (
                <Select 
                  value={selectedUserId ? selectedUserId.toString() : "all"} 
                  onValueChange={val => setSelectedUserId(val === "all" ? null : parseInt(val))}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users && users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName || user.username} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Indicateur de réinitialisation automatique */}
              {showAutoResetInfo && (
                <Badge variant="secondary" className="gap-1 py-1 animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Réinitialisation prévue bientôt
                </Badge>
              )}
            </div>
          
          </div>

          {/* Période actuelle */}
          <TabsContent value="current" className="space-y-6">
            {isLoadingCurrent ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-28" />
                      <Skeleton className="h-4 w-32 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !currentStats ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune statistique disponible</h3>
                    <p className="text-muted-foreground">
                      Les statistiques seront générées automatiquement au fur et à mesure de l'activité.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Période en cours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {formatDate(currentStats.periodStart)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            jusqu'au {formatDate(currentStats.periodEnd)}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Leads reçus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {currentStats.leadsReceived}
                          </p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Leads convertis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {currentStats.leadsConverted}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {conversionRate.toFixed(1)}% de conversion
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Paiements traités
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {currentStats.paymentsProcessed}
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Montant total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmount(currentStats.paymentsAmount)}
                          </p>
                        </div>
                        <Euro className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Commissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatAmount(currentStats.commissionsEarned)}
                          </p>
                        </div>
                        <Euro className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations sur la période</CardTitle>
                    <CardDescription>
                      Les statistiques sont remises à zéro le 1er et le 16 de chaque mois à minuit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-4">
                      <div>
                        <p>
                          <span className="font-semibold">Période actuelle:</span> du {formatDate(currentStats.periodStart)} au {formatDate(currentStats.periodEnd)}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-semibold">Prochaine réinitialisation:</span> {formatDate(currentStats.periodEnd)} à minuit 
                          <Badge variant="outline" className="ml-2 bg-blue-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg> {getDaysUntilReset()} jours restants
                          </Badge>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progression de la période</span>
                          <span>{getProgressPercentage()}%</span>
                        </div>
                        <Progress value={getProgressPercentage()} className="h-2" />
                      </div>
                      
                      {showAutoResetInfo && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                          <div className="flex gap-2 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M12 3v3m6-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11"/>
                            </svg>
                            <p className="font-medium">Réinitialisation prévue aujourd'hui</p>
                          </div>
                          <p className="text-xs mt-1">
                            Les statistiques seront automatiquement remises à zéro à minuit et l'historique sera conservé.
                          </p>
                        </div>
                      )}
                      
                      <p className="text-muted-foreground italic">
                        Toutes les statistiques sont remises à zéro automatiquement tous les 15 jours.
                        L'historique des périodes précédentes reste consultable par les administrateurs.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section spécifique aux managers - Vue d'équipe */}
                {isManagerRole && viewMode === "team" && (
                  <>
                    <div className="flex items-center gap-2 mt-6 mb-4">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h2 className="text-xl font-semibold">Performances de l'équipe</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Taux de conversion de l'équipe */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Taux de conversion moyen
                          </CardTitle>
                          <CardDescription>
                            Performance collective
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-end gap-2">
                            <div className="text-3xl font-bold">
                              {currentStats && teamMembers.length > 0 ? (
                                `${conversionRate.toFixed(1)}%`
                              ) : "0%"}
                            </div>
                            <div className="text-xs text-muted-foreground pb-1">
                              leads convertis/reçus
                            </div>
                          </div>
                          <div className="mt-4">
                            <Progress 
                              value={conversionRate} 
                              className="h-2" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Volume de l'équipe */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Volume total d'activité
                          </CardTitle>
                          <CardDescription>
                            Demandes traitées par l'équipe
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-3xl font-bold">
                                {currentStats ? currentStats.leadsReceived : 0}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                leads reçus
                              </div>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-green-600">
                                {currentStats ? currentStats.leadsConverted : 0}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                leads convertis
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Revenue de l'équipe */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Revenue de l'équipe
                          </CardTitle>
                          <CardDescription>
                            Paiements et commissions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-3xl font-bold text-green-600">
                                {currentStats ? formatAmount(currentStats.paymentsAmount) : "0 €"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                montant total
                              </div>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-blue-600">
                                {currentStats ? formatAmount(currentStats.commissionsEarned) : "0 €"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                commissions
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Graphiques de comparaison pour l'équipe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Carte des performances comparatives */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Performance comparative</CardTitle>
                          <CardDescription>
                            Comparaison des taux de conversion
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="space-y-8 w-full">
                              {teamMembers.slice(0, 5).map((member, index) => {
                                const convRate = member.stats?.leadsReceived > 0 
                                  ? ((member.stats?.leadsConverted / member.stats?.leadsReceived) * 100)
                                  : 0;
                                
                                return (
                                  <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">{member.fullName || member.username}</span>
                                      <span>{convRate.toFixed(1)}%</span>
                                    </div>
                                    <Progress 
                                      value={convRate} 
                                      className={`h-2 ${
                                        convRate > 75 ? "[--progress-foreground:theme(colors.green.500)]" :
                                        convRate > 50 ? "[--progress-foreground:theme(colors.blue.500)]" :
                                        convRate > 25 ? "[--progress-foreground:theme(colors.amber.500)]" : 
                                        "[--progress-foreground:theme(colors.red.500)]"
                                      }`}
                                    />
                                  </div>
                                );
                              })}
                              
                              {teamMembers.length === 0 && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  Aucune donnée d'équipe disponible
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Carte des paiements et commissions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Répartition des paiements</CardTitle>
                          <CardDescription>
                            Distribution par membre d'équipe
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="space-y-8 w-full">
                              {teamMembers.slice(0, 5).map((member, index) => {
                                const amount = parseFloat(member.stats?.paymentsAmount || "0");
                                const totalAmount = parseFloat(currentStats?.paymentsAmount || "0");
                                const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                                
                                return (
                                  <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">{member.fullName || member.username}</span>
                                      <span>{formatAmount(amount)}</span>
                                    </div>
                                    <Progress 
                                      value={percentage} 
                                      className="h-2 [--progress-foreground:theme(colors.green.500)]"
                                    />
                                  </div>
                                );
                              })}
                              
                              {teamMembers.length === 0 && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  Aucune donnée d'équipe disponible
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tableau des membres de l'équipe */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Détail par membre</CardTitle>
                        <CardDescription>
                          Performances individuelles des membres de l'équipe
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {teamMembers.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            Aucun membre dans l'équipe
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead className="text-right">Leads</TableHead>
                                <TableHead className="text-right">Convertis</TableHead>
                                <TableHead className="text-right">Taux</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead className="text-right">Commissions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {teamMembers.map((member) => (
                                <TableRow key={member.id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {member.fullName || member.username}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {member.role}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{member.stats?.leadsReceived || 0}</TableCell>
                                  <TableCell className="text-right">{member.stats?.leadsConverted || 0}</TableCell>
                                  <TableCell className="text-right">
                                    {member.stats?.leadsReceived > 0 
                                      ? ((member.stats?.leadsConverted / member.stats?.leadsReceived) * 100).toFixed(1) 
                                      : 0}%
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatAmount(member.stats?.paymentsAmount || 0)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatAmount(member.stats?.commissionsEarned || 0)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Historique */}
          <TabsContent value="history" className="space-y-6">
            {isLoadingHistory ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-72" />
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : !statsHistory || !statsHistory.history || statsHistory.history.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-muted-foreground mb-4">
                        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
                        <path d="M12 7v5l2 3"></path>
                    </svg>
                    <h3 className="text-lg font-medium mb-2">Aucun historique disponible</h3>
                    <p className="text-muted-foreground">
                      L'historique des statistiques sera disponible après la première réinitialisation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Historique des périodes
                    </CardTitle>
                    <CardDescription>
                      Consultez les statistiques des périodes précédentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Filtres pour l'historique */}
                      <div className="flex flex-wrap gap-4 items-center">
                        <Select 
                          value={historyPeriod} 
                          onValueChange={setHistoryPeriod}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Période" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Période actuelle</SelectItem>
                            <SelectItem value="last">Dernière période</SelectItem>
                            <SelectItem value="all">Toutes les périodes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Tableau des périodes */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Période</TableHead>
                            <TableHead className="text-right">Leads</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Tx. Conv.</TableHead>
                            <TableHead className="text-right">Paiements</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Commissions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statsHistory.history
                            .filter((period: any) => {
                              if (historyPeriod === 'last') {
                                return statsHistory.history.indexOf(period) === 0;
                              }
                              return true;
                            })
                            .map((period: any, index: number) => {
                              const convRate = period.leadsReceived > 0 
                                ? (period.leadsConverted / period.leadsReceived) * 100 
                                : 0;

                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        il y a {
                                          differenceInDays(
                                            new Date(), 
                                            parseISO(period.periodEnd)
                                          )
                                        } jours
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{period.leadsReceived}</TableCell>
                                  <TableCell className="text-right">{period.leadsConverted}</TableCell>
                                  <TableCell className="text-right">{convRate.toFixed(1)}%</TableCell>
                                  <TableCell className="text-right">{period.paymentsProcessed}</TableCell>
                                  <TableCell className="text-right">{formatAmount(period.paymentsAmount)}</TableCell>
                                  <TableCell className="text-right">{formatAmount(period.commissionsEarned)}</TableCell>
                                </TableRow>
                              );
                            })
                          }
                        </TableBody>
                      </Table>
                      
                      {/* Graphique historique (à ajouter ultérieurement) */}
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <LineChart className="h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="text-sm font-medium">Graphique comparatif</h3>
                        <p className="text-xs text-muted-foreground">
                          L'affichage graphique des données historiques sera disponible prochainement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter l'historique
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Vue globale (admin uniquement) */}
          {showAdminView && (
            <TabsContent value="overview" className="space-y-6">
              {isLoadingOverview ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-72" />
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-64 w-full" />
                    </CardContent>
                  </Card>
                </div>
              ) : !statsOverview ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <BarChart2 className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
                      <p className="text-muted-foreground">
                        Les statistiques globales seront disponibles dès que les utilisateurs auront de l'activité.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total leads
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {statsOverview.totalLeads || 0}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total conversions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {statsOverview.totalConversions || 0}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total paiements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {statsOverview.totalPayments || 0}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Montant total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                          {formatAmount(statsOverview.totalAmount || 0)}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Commissions totales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatAmount(statsOverview.totalCommissions || 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Détail par utilisateur</CardTitle>
                      <CardDescription>
                        Performance de chaque utilisateur pour la période en cours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead className="text-right">Leads</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Tx. Conv.</TableHead>
                            <TableHead className="text-right">Paiements</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Commissions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statsOverview.byUser && Object.values(statsOverview.byUser).map((userStat: any) => {
                            const convRate = userStat.leadsReceived > 0 
                              ? (userStat.leadsConverted / userStat.leadsReceived) * 100 
                              : 0;
                            
                            return (
                              <TableRow key={userStat.userId}>
                                <TableCell className="font-medium">{userStat.fullName || userStat.username}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    userStat.role === 'admin' ? 'destructive' : 
                                    userStat.role === 'manager' ? 'default' : 
                                    'secondary'
                                  }>
                                    {userStat.role === 'admin' ? 'Admin' : 
                                     userStat.role === 'manager' ? 'Manager' : 
                                     'Utilisateur'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{userStat.leadsReceived}</TableCell>
                                <TableCell className="text-right">{userStat.leadsConverted}</TableCell>
                                <TableCell className="text-right">{convRate.toFixed(1)}%</TableCell>
                                <TableCell className="text-right">{userStat.paymentsProcessed}</TableCell>
                                <TableCell className="text-right">{formatAmount(userStat.paymentsAmount)}</TableCell>
                                <TableCell className="text-right">{formatAmount(userStat.commissionsEarned)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter CSV
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UserStatistics;