import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { StripePaymentSync } from "@/components/admin/stripe-payment-sync";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Clock, 
  Bolt, 
  Calendar, 
  FileCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown,
  Download,
  Loader2,
  RefreshCw,
  ClipboardCheck, 
  Ban,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  CircleDashed
} from "lucide-react";
import { ServiceRequest, User } from "@shared/schema";
import { cn } from "@/lib/utils";

// Types pour le dashboard amélioré
interface Lead {
  id: number;
  referenceNumber: string;
  customerName: string;
  serviceType: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  amount: number;
  email: string;
  phone: string;
}

interface LeadStatistics {
  totalLeads: number;
  newLeadsToday: number;
  newLeadsWeek: number;
  newLeadsMonth: number;
  totalRevenue: number;
  averageValue: number;
  conversionRate: number;
  statusBreakdown: Array<{name: string, value: number}>;
  revenueByDay: Array<{name: string, value: number}>;
  leadsByService: Array<{name: string, value: number}>;
}

interface PaymentInfo {
  id: string;
  status: string;
  amount: number;
  customerId: string;
  description: string;
  created: number;
  metadata: {
    referenceNumber: string;
  };
}

// Fonction de formatage pour les montants
function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Fonction pour formater les dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Couleurs pour les statuts
const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  validated: "bg-green-100 text-green-800", 
  scheduled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

// Couleurs pour les statuts de paiement
const paymentStatusColors: Record<string, string> = {
  succeeded: "bg-green-100 text-green-800",
  processing: "bg-amber-100 text-amber-800",
  pending: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800"
};

// Composants pour les différentes sections du dashboard
function LeadStatisticsCards({ stats }: { stats: LeadStatistics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total des demandes</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalLeads}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm mt-3">
            <div className="flex items-center text-green-600 mr-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{stats.newLeadsMonth}</span>
            </div>
            <span className="text-muted-foreground">ce mois</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenus totaux</p>
              <h3 className="text-2xl font-bold mt-1">{formatAmount(stats.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm mt-3">
            <div className="flex items-center text-green-600 mr-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>{formatAmount(stats.averageValue)}</span>
            </div>
            <span className="text-muted-foreground">valeur moyenne</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nouvelles demandes</p>
              <h3 className="text-2xl font-bold mt-1">{stats.newLeadsToday}</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm mt-3">
            <div className="flex items-center text-amber-600 mr-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{stats.newLeadsWeek}</span>
            </div>
            <span className="text-muted-foreground">cette semaine</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
              <h3 className="text-2xl font-bold mt-1">{stats.conversionRate}%</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-full">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center text-sm mt-3">
            <div className={`flex items-center ${stats.conversionRate > 70 ? 'text-green-600' : 'text-amber-600'} mr-2`}>
              {stats.conversionRate > 70 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              <span>{stats.conversionRate > 70 ? 'Excellent' : 'À améliorer'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadStatusChart({ stats }: { stats: LeadStatistics }) {
  const COLORS = ['#3b82f6', '#f59e0b', '#6366f1', '#10b981', '#8b5cf6', '#ef4444'];
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Répartition par statut</CardTitle>
        <CardDescription>Distribution des demandes par état actuel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Nombre de demandes']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ stats }: { stats: LeadStatistics }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Revenus journaliers</CardTitle>
        <CardDescription>Suivi des revenus au cours des 7 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `${value}€`}
                width={60}
              />
              <Tooltip 
                formatter={(value) => [`${value}€`, 'Revenus']}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceTypeChart({ stats }: { stats: LeadStatistics }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Demandes par service</CardTitle>
        <CardDescription>Distribution des demandes par type de service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.leadsByService} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => [value, 'Nombre de demandes']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentLeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Dernières demandes</CardTitle>
            <CardDescription>Liste des demandes les plus récentes</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Tout voir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Réf.</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Client</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Service</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Statut</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Paiement</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Montant</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 text-blue-600 font-medium">{lead.referenceNumber}</td>
                  <td className="py-3 px-2">{lead.customerName}</td>
                  <td className="py-3 px-2">{lead.serviceType}</td>
                  <td className="py-3 px-2">{formatDate(lead.createdAt)}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={cn("rounded-full", statusColors[lead.status] || "bg-gray-100")}>
                      {lead.status === "new" && "Nouveau"}
                      {lead.status === "pending" && "En attente"}
                      {lead.status === "in_progress" && "En cours"}
                      {lead.status === "validated" && "Validé"}
                      {lead.status === "scheduled" && "Planifié"}
                      {lead.status === "completed" && "Terminé"}
                      {lead.status === "cancelled" && "Annulé"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={cn("rounded-full", paymentStatusColors[lead.paymentStatus] || "bg-gray-100")}>
                      {lead.paymentStatus === "succeeded" && "Réussi"}
                      {lead.paymentStatus === "processing" && "En cours"}
                      {lead.paymentStatus === "pending" && "En attente"}
                      {lead.paymentStatus === "failed" && "Échoué"}
                      {lead.paymentStatus === "refunded" && "Remboursé"}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right font-medium">{formatAmount(lead.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedDashboard() {
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState<string>("30d");
  const [syncingWithStripe, setSyncingWithStripe] = useState<boolean>(false);
  const [stripeConnected, setStripeConnected] = useState<boolean>(false);
  
  // Récupération des demandes de service depuis l'API
  const { 
    data: serviceRequests, 
    isLoading: serviceRequestsLoading, 
    error: serviceRequestsError, 
    refetch: refetchServiceRequests 
  } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Récupération des paiements Stripe depuis l'API
  const { 
    data: stripePayments, 
    isLoading: stripePaymentsLoading, 
    error: stripePaymentsError, 
    refetch: refetchPayments 
  } = useQuery<PaymentInfo[]>({
    queryKey: ['/api/stripe/payments'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Vérification de la configuration Stripe
  const {
    data: stripeConfig,
    isLoading: stripeConfigLoading
  } = useQuery<{configured: boolean, version: string | null}>({
    queryKey: ['/api/stripe/config'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Mettre à jour l'état de connexion Stripe lorsque les données changent
  useEffect(() => {
    if (stripeConfig) {
      setStripeConnected(stripeConfig.configured);
    }
  }, [stripeConfig]);
  
  // Conversion des données pour l'affichage
  const leads: Lead[] = serviceRequests?.map(req => {
    const payment = stripePayments?.find(p => p.metadata?.referenceNumber === req.referenceNumber);
    return {
      id: req.id,
      referenceNumber: req.referenceNumber,
      customerName: req.name || "Client",
      serviceType: req.requestType,
      status: req.status,
      paymentStatus: payment?.status || "pending",
      createdAt: new Date(req.createdAt).toISOString(), // Conversion en string pour éviter l'erreur de type
      amount: 129.80, // Montant fixe selon les spécifications
      email: req.email,
      phone: req.phone
    };
  }) || [];
  
  // Construction des statistiques
  const currentDate = new Date();
  const todayStart = new Date(currentDate);
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  
  const monthStart = new Date(currentDate);
  monthStart.setDate(currentDate.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);
  
  const newLeadsToday = leads.filter(lead => new Date(lead.createdAt) >= todayStart).length;
  const newLeadsWeek = leads.filter(lead => new Date(lead.createdAt) >= weekStart).length;
  const newLeadsMonth = leads.filter(lead => new Date(lead.createdAt) >= monthStart).length;
  
  const totalRevenue = leads.reduce((sum, lead) => sum + lead.amount, 0);
  
  // Statistiques pour les graphiques
  const statusCounts: Record<string, number> = {};
  leads.forEach(lead => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });
  
  const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({
    name: name === "new" ? "Nouveau" :
          name === "pending" ? "En attente" :
          name === "in_progress" ? "En cours" :
          name === "validated" ? "Validé" :
          name === "scheduled" ? "Planifié" :
          name === "completed" ? "Terminé" :
          name === "cancelled" ? "Annulé" : name,
    value
  }));
  
  // Revenus par jour (7 derniers jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();
  
  const revenueByDay = last7Days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    
    const dayLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= day && leadDate < nextDay;
    });
    
    const dayRevenue = dayLeads.reduce((sum, lead) => sum + lead.amount, 0);
    
    return {
      name: day.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: dayRevenue
    };
  });
  
  // Demandes par type de service
  const serviceTypeCounts: Record<string, number> = {};
  leads.forEach(lead => {
    serviceTypeCounts[lead.serviceType] = (serviceTypeCounts[lead.serviceType] || 0) + 1;
  });
  
  const leadsByService = Object.entries(serviceTypeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Statistiques complètes pour les graphiques
  const statistics: LeadStatistics = {
    totalLeads: leads.length,
    newLeadsToday,
    newLeadsWeek,
    newLeadsMonth,
    totalRevenue,
    averageValue: leads.length > 0 ? totalRevenue / leads.length : 0,
    conversionRate: 76.5, // Valeur fictive pour l'exemple
    statusBreakdown,
    revenueByDay,
    leadsByService
  };

  // Fonction pour synchroniser les paiements Stripe
  const syncStripePayments = async () => {
    setSyncingWithStripe(true);
    
    try {
      await apiRequest('POST', '/api/stripe/sync-payments');
      
      // Actualiser les données de paiement
      await refetchPayments();
      await refetchServiceRequests();
      
      toast({
        title: "Synchronisation réussie",
        description: "Les données de paiement ont été mises à jour depuis Stripe.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec Stripe:", error);
      toast({
        title: "Erreur de synchronisation",
        description: "Un problème est survenu lors de la synchronisation avec Stripe.",
        variant: "destructive",
      });
    } finally {
      setSyncingWithStripe(false);
    }
  };

  return (
    <AdminLayout 
      title="Tableau de bord" 
      description="Vue d'ensemble de l'activité et des performances"
    >
      <div className="space-y-6">
        {/* Contrôles et filtres */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Analyse d'activité et suivi des demandes client
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                refetchServiceRequests();
                refetchPayments();
                toast({
                  title: "Actualisé",
                  description: "Les données ont été actualisées.",
                });
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={syncStripePayments}
              disabled={syncingWithStripe}
              className={syncingWithStripe ? "opacity-80" : ""}
            >
              {syncingWithStripe ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Sync Stripe
                </>
              )}
            </Button>
          </div>
        </div>
        
        {serviceRequestsLoading || stripePaymentsLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        ) : serviceRequestsError || stripePaymentsError ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">Erreur lors du chargement des données</p>
              <Button onClick={() => {
                refetchServiceRequests();
                refetchPayments();
              }}>
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <LeadStatisticsCards stats={statistics} />
            
            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <LeadStatusChart stats={statistics} />
              <RevenueChart stats={statistics} />
              <ServiceTypeChart stats={statistics} />
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Statuts de paiement</CardTitle>
                  <CardDescription>Suivi des statuts de paiement des demandes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>Paiements réussis</span>
                      </div>
                      <span className="font-medium">{leads.filter(l => l.paymentStatus === "succeeded").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleDashed className="h-4 w-4 text-yellow-500 mr-2" />
                        <span>En traitement</span>
                      </div>
                      <span className="font-medium">{leads.filter(l => l.paymentStatus === "processing").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleHelp className="h-4 w-4 text-blue-500 mr-2" />
                        <span>En attente</span>
                      </div>
                      <span className="font-medium">{leads.filter(l => l.paymentStatus === "pending").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span>Échoués</span>
                      </div>
                      <span className="font-medium">{leads.filter(l => l.paymentStatus === "failed").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Ban className="h-4 w-4 text-purple-500 mr-2" />
                        <span>Remboursés</span>
                      </div>
                      <span className="font-medium">{leads.filter(l => l.paymentStatus === "refunded").length}</span>
                    </div>
                  </div>
                  
                  <div className="relative pt-4">
                    <div className="flex space-x-1 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${leads.filter(l => l.paymentStatus === "succeeded").length / leads.length * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${leads.filter(l => l.paymentStatus === "processing").length / leads.length * 100}%` }}
                      ></div>
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${leads.filter(l => l.paymentStatus === "pending").length / leads.length * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${leads.filter(l => l.paymentStatus === "failed").length / leads.length * 100}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500 h-full" 
                        style={{ width: `${leads.filter(l => l.paymentStatus === "refunded").length / leads.length * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tableau des dernières demandes */}
            <RecentLeadsTable leads={leads} />
            
            {/* Module de synchronisation Stripe */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Intégration Stripe</h2>
                {stripeConnected ? (
                  <Badge className="bg-green-500 text-white">API connectée</Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">API non connectée</Badge>
                )}
              </div>
              {stripeConnected ? (
                <StripePaymentSync />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-red-50 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="font-medium">Configuration Stripe requise</h3>
                      <p className="text-sm text-muted-foreground">
                        La clé API Stripe n'est pas configurée. Les fonctionnalités de paiement sont limitées.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Actions rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Créer une demande</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajouter manuellement une nouvelle demande de service
                    </p>
                    <Button variant="outline" className="w-full mt-2">
                      Créer une demande
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Exporter les données</h3>
                    <p className="text-sm text-muted-foreground">
                      Télécharger les données des demandes au format CSV
                    </p>
                    <Button variant="outline" className="w-full mt-2">
                      Exporter
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Planifier des rendez-vous</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérer les rendez-vous pour les raccordements
                    </p>
                    <Button variant="outline" className="w-full mt-2">
                      Calendrier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}