import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO, addDays, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { RealtimeIndicator } from "../../components/admin/real-time-indicator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  RefreshCw,
  Search,
  User,
  Users,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Timer,
  Info,
  ChevronDown,
  ChevronUp,
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

interface UserStatHistory {
  id: number;
  userId: number;
  periodStart: string;
  periodEnd: string;
  leadsReceived: number;
  leadsConverted: number;
  paymentsProcessed: number;
  paymentsAmount: string;
  commissionsEarned: string;
  createdAt: string;
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
  const [historyTab, setHistoryTab] = useState("15days");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [nextResetDate, setNextResetDate] = useState<string>("");
  const [nextResetCountdown, setNextResetCountdown] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Détecter si l'utilisateur actuel a des permissions d'admin
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === "admin" || user.role === "manager";
      setShowAdminView(isAdmin);
      
      // Si l'utilisateur n'est pas admin, définir automatiquement sur ses propres stats
      if (!isAdmin && user.id) {
        setSelectedUserId(user.id);
      }
    }
  }, [user]);

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

  // Récupérer l'historique des statistiques
  const { data: statsHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/user-stats/history", selectedUserId, activeTab === "history"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        selectedUserId ? `/api/user-stats/history/${selectedUserId}` : "/api/user-stats/history"
      );
      return await response.json();
    },
    enabled: !!user && activeTab === "history",
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

  // Récupérer la liste des utilisateurs (pour le filtrage)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return await response.json();
    },
    enabled: !!user && showAdminView,
  });

  // Configurer le compte à rebours pour la prochaine réinitialisation
  useEffect(() => {
    if (currentStats && currentStats.periodEnd) {
      try {
        const resetDate = parseISO(currentStats.periodEnd);
        setNextResetDate(format(resetDate, "d MMMM yyyy à HH:mm", { locale: fr }));
        
        // Mettre à jour le compte à rebours chaque seconde
        const updateCountdown = () => {
          const now = new Date();
          const timeLeft = resetDate.getTime() - now.getTime();
          
          if (timeLeft <= 0) {
            setNextResetCountdown("En cours de réinitialisation...");
            // Rafraîchir les données après l'heure de réinitialisation
            queryClient.invalidateQueries({ queryKey: ["/api/user-stats/current"] });
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
          }
          
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          let countdownText = "";
          if (days > 0) countdownText += `${days}j `;
          countdownText += `${hours}h ${minutes}m`;
          
          setNextResetCountdown(countdownText);
        };
        
        // Initialiser le compte à rebours
        updateCountdown();
        
        // Nettoyer l'intervalle précédent s'il existe
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Configurer le nouvel intervalle
        intervalRef.current = setInterval(updateCountdown, 60000); // Mise à jour toutes les minutes
        
        // Nettoyage à la destruction du composant
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      } catch (error) {
        console.error("Erreur lors de la création du compte à rebours:", error);
      }
    }
  }, [currentStats]);

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

  // Préparer les données pour les graphiques
  const prepareHistoryChartData = () => {
    if (!statsHistory || !statsHistory.history) return [];
    
    // Trier par date (du plus ancien au plus récent)
    const sortedHistory = [...statsHistory.history].sort((a, b) => 
      parseISO(a.periodStart).getTime() - parseISO(b.periodStart).getTime()
    );
    
    return sortedHistory.map((period: UserStatHistory) => {
      // Format de date court pour l'affichage sur l'axe X
      const shortDate = format(parseISO(period.periodStart), "dd/MM", { locale: fr });
      const convRate = period.leadsReceived > 0 
        ? (period.leadsConverted / period.leadsReceived) * 100 
        : 0;
        
      return {
        periode: shortDate,
        leads: period.leadsReceived,
        conversions: period.leadsConverted,
        paiements: period.paymentsProcessed,
        montant: parseFloat(period.paymentsAmount) / 100,
        commissions: parseFloat(period.commissionsEarned) / 100,
        tauxConversion: parseFloat(convRate.toFixed(1))
      };
    });
  };
  
  // Filtrer l'historique en fonction de la période sélectionnée
  const filteredHistory = useMemo(() => {
    if (!statsHistory || !statsHistory.history) return [];
    
    // Nombre de périodes à afficher
    const periodsToShow = historyTab === "15days" ? 2 : // Environ 1 mois (2 périodes de 15 jours)
                         historyTab === "3months" ? 6 : // Environ 3 mois (6 périodes de 15 jours)
                         historyTab === "6months" ? 12 : // Environ 6 mois (12 périodes de 15 jours)
                         statsHistory.history.length; // Toutes les périodes
                         
    return statsHistory.history.slice(0, periodsToShow);
  }, [statsHistory, historyTab]);

  // Obtenir le nombre de jours restants jusqu'à la réinitialisation
  const getDaysUntilReset = () => {
    if (!currentStats || !currentStats.periodEnd) return 0;
    
    try {
      const resetDate = parseISO(currentStats.periodEnd);
      const now = new Date();
      const diffTime = resetDate.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };
  
  // Calculer si la date de réinitialisation est proche (moins de 3 jours)
  const isResetSoon = getDaysUntilReset() <= 3;

  return (
    <AdminLayout title="Statistiques" description="Suivi des performances et des commissions">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Statistiques de performance</h1>
            <p className="text-muted-foreground">
              Suivi des leads, conversions et commissions par période
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            {isResetSoon && (
              <div className="flex items-center text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-md border border-amber-200 mr-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Réinitialisation dans {getDaysUntilReset()} jours</span>
              </div>
            )}

            <RealtimeIndicator />
            
            {showAdminView && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Réinitialiser les statistiques</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va réinitialiser toutes les statistiques actuelles pour tous les utilisateurs.
                      Les données seront archivées et accessibles dans l'historique, mais les compteurs seront remis à zéro.
                      <br /><br />
                      <strong>Cette action est irréversible.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      toast({
                        title: "Réinitialisation en cours",
                        description: "Les statistiques sont en cours de réinitialisation...",
                      });
                      
                      apiRequest("POST", "/api/user-stats/reset")
                        .then(response => response.json())
                        .then(data => {
                          if (data.success) {
                            toast({
                              title: "Statistiques réinitialisées",
                              description: "Les données ont été archivées et remises à zéro.",
                            });
                            
                            // Rafraîchir toutes les données
                            queryClient.invalidateQueries({ queryKey: ["/api/user-stats/current"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/user-stats/overview"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/user-stats/history"] });
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
                    }}>
                      Réinitialiser maintenant
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <TabsList className="md:w-auto w-full">
              <TabsTrigger value="current" className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span>Période actuelle</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" />
                <span>Historique</span>
              </TabsTrigger>
              {showAdminView && (
                <TabsTrigger value="overview" className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>Vue globale</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            {showAdminView && (
              <div className="flex gap-3">
                <Select 
                  value={selectedUserId ? selectedUserId.toString() : "all"} 
                  onValueChange={val => setSelectedUserId(val === "all" ? null : parseInt(val))}
                >
                  <SelectTrigger className="w-full md:w-[220px]">
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
              </div>
            )}
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
                  <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
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
                        <div className="bg-blue-100 px-3 py-1.5 rounded-md flex flex-col items-center">
                          <div className="text-xs text-blue-800 font-medium mb-1">Réinitialisation</div>
                          <div className="text-sm font-medium text-blue-900">{nextResetCountdown}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-2xl font-bold">{currentStats.leadsReceived}</p>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {currentStats.leadsConverted} convertis
                          </span>
                        </div>
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Taux de conversion</span>
                            <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={conversionRate} 
                            className="h-1.5" 
                            indicatorClassName={`${
                              conversionRate >= 70 ? "bg-green-500" : 
                              conversionRate >= 40 ? "bg-amber-500" : 
                              "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                        Paiements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-2xl font-bold">{currentStats.paymentsProcessed}</p>
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Montant total</p>
                            <p className="text-base font-semibold text-green-600">{formatAmount(currentStats.paymentsAmount)}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs text-gray-500">Commissions</p>
                            <p className="text-base font-semibold text-blue-600">{formatAmount(currentStats.commissionsEarned)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-500" />
                      Informations sur la période
                    </CardTitle>
                    <CardDescription>
                      Les statistiques sont automatiquement remises à zéro le 15 et le 30/31 de chaque mois à minuit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium">Période actuelle</span>
                          <span className="text-sm">Du {formatDate(currentStats.periodStart)} au {formatDate(currentStats.periodEnd)}</span>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium">Prochaine réinitialisation</span>
                          <span className="text-sm">{nextResetDate}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-4">
                          Toutes les statistiques sont réinitialisées automatiquement deux fois par mois :
                          <ul className="list-disc list-inside mt-1 ml-2">
                            <li>Le 15 du mois à minuit</li>
                            <li>Le dernier jour du mois à minuit</li>
                          </ul>
                        </p>
                      </div>
                      
                      <div className="flex flex-col justify-center items-center bg-gray-50 p-4 rounded-lg">
                        <Timer className="h-8 w-8 text-blue-500 mb-2" />
                        <p className="text-center text-sm font-medium mb-1">Temps restant avant réinitialisation</p>
                        <p className="text-2xl font-bold text-blue-600">{nextResetCountdown}</p>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          L'historique complet reste accessible dans l'onglet "Historique"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Historique des périodes</h2>
              <div className="flex gap-2">
                <Select 
                  value={historyTab} 
                  onValueChange={setHistoryTab}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15days">Dernier mois</SelectItem>
                    <SelectItem value="3months">3 derniers mois</SelectItem>
                    <SelectItem value="6months">6 derniers mois</SelectItem>
                    <SelectItem value="all">Historique complet</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
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
                    <BarChart2 className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun historique disponible</h3>
                    <p className="text-muted-foreground">
                      L'historique sera disponible après la première réinitialisation des statistiques.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique des leads et conversions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Leads et conversions</CardTitle>
                      <CardDescription>
                        Évolution des leads reçus et convertis par période
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareHistoryChartData()}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="periode" />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, ""]} />
                          <Legend />
                          <Bar dataKey="leads" name="Leads reçus" fill="#3b82f6" />
                          <Bar dataKey="conversions" name="Leads convertis" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Graphique des paiements et commissions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Paiements et commissions</CardTitle>
                      <CardDescription>
                        Montants des paiements traités et commissions générées (en €)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={prepareHistoryChartData()}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="periode" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} €`, ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="montant" name="Montant (€)" stroke="#16a34a" strokeWidth={2} />
                          <Line type="monotone" dataKey="commissions" name="Commissions (€)" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Tableau de l'historique */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Détail des périodes précédentes</CardTitle>
                    <CardDescription>
                      Historique complet des statistiques par période
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Période</TableHead>
                            <TableHead className="text-right">Leads</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Taux</TableHead>
                            <TableHead className="text-right">Paiements</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Commissions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistory.map((period: UserStatHistory) => {
                            const convRate = period.leadsReceived > 0 
                              ? (period.leadsConverted / period.leadsReceived) * 100 
                              : 0;
                            
                            return (
                              <TableRow key={period.id}>
                                <TableCell className="font-medium">
                                  {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                                </TableCell>
                                <TableCell className="text-right">{period.leadsReceived}</TableCell>
                                <TableCell className="text-right">{period.leadsConverted}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={
                                    convRate >= 70 ? 'success' : 
                                    convRate >= 40 ? 'warning' : 
                                    'destructive'
                                  }>
                                    {convRate.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{period.paymentsProcessed}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatAmount(period.paymentsAmount)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-blue-600">
                                  {formatAmount(period.commissionsEarned)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Vue globale (admin uniquement) */}
          {showAdminView && (
            <TabsContent value="overview" className="space-y-6">
              {isLoadingOverview ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array(3).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
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
                        Aucune statistique globale n'est disponible actuellement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Performance globale</CardTitle>
                      <CardDescription>
                        Vue d'ensemble de tous les utilisateurs pour la période actuelle
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Total des leads</p>
                              <p className="text-2xl font-bold">{statsOverview.overview.totalLeads}</p>
                            </div>
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Conversions</p>
                              <p className="text-2xl font-bold">{statsOverview.overview.totalConversions}</p>
                              <p className="text-xs text-muted-foreground">
                                {statsOverview.overview.totalLeads > 0 
                                  ? (statsOverview.overview.totalConversions / statsOverview.overview.totalLeads * 100).toFixed(1) 
                                  : 0}% de taux
                              </p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Paiements</p>
                              <p className="text-2xl font-bold">{statsOverview.overview.totalPayments}</p>
                            </div>
                            <CreditCard className="h-6 w-6 text-purple-500" />
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Montant total</p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatAmount(statsOverview.overview.totalAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                dont {formatAmount(statsOverview.overview.totalCommissions)} de commissions
                              </p>
                            </div>
                            <Euro className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-base font-medium">Performance par utilisateur</CardTitle>
                        <CardDescription>
                          Détail des performances individuelles pour la période en cours
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Utilisateur</TableHead>
                              <TableHead className="w-[100px]">Rôle</TableHead>
                              <TableHead className="text-right">Leads</TableHead>
                              <TableHead className="text-right">Conversions</TableHead>
                              <TableHead className="text-right">Taux</TableHead>
                              <TableHead className="text-right">Paiements</TableHead>
                              <TableHead className="text-right">Montant</TableHead>
                              <TableHead className="text-right">Commissions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.values(statsOverview.overview.byUser).map((userStat: any) => {
                              const convRate = userStat.leadsReceived > 0 
                                ? (userStat.leadsConverted / userStat.leadsReceived) * 100 
                                : 0;
                              
                              return (
                                <TableRow key={userStat.userId}>
                                  <TableCell className="font-medium">
                                    {userStat.fullName || userStat.username}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      userStat.role === 'admin' ? 'default' : 
                                      userStat.role === 'manager' ? 'secondary' : 
                                      'outline'
                                    }>
                                      {userStat.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{userStat.leadsReceived}</TableCell>
                                  <TableCell className="text-right">{userStat.leadsConverted}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={
                                      convRate >= 70 ? 'success' : 
                                      convRate >= 40 ? 'warning' : 
                                      'destructive'
                                    }>
                                      {convRate.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{userStat.paymentsProcessed}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatAmount(userStat.paymentsAmount)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-blue-600">
                                    {formatAmount(userStat.commissionsEarned)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            
                            {Object.keys(statsOverview.overview.byUser).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                  Aucune donnée disponible pour cette période
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
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