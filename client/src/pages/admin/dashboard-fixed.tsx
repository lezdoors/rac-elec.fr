import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getQueryFn } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  CalendarIcon,
  TrendingUp, 
  TrendingDown, 
  Euro,
  CreditCard,
  Clock,
  Calendar as CalendarLucide,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";

interface DashboardStats {
  payments: {
    count: number;
    revenue: number;
    successRate: number;
    successful: number;
  };
  leads: {
    count: number;
  };
  requests: {
    count: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

interface DateFilter {
  type: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

function formatDate(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { 
    addSuffix: true, 
    locale: fr 
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'today' });
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter.type) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0]
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      case 'custom':
        return {
          startDate: customStartDate?.toISOString().split('T')[0] || today.toISOString().split('T')[0],
          endDate: customEndDate?.toISOString().split('T')[0] || today.toISOString().split('T')[0]
        };
      default:
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
    }
  };

  const { startDate, endDate } = getDateRange();

  // Fetch dashboard statistics with authentic RAC- data
  const { data: statsData, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/dashboard/stats?startDate=${startDate}&endDate=${endDate}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!startDate && !!endDate
  });

  const isLoading = statsLoading;

  // Generate intelligent summary
  const generateSummary = () => {
    if (isLoading) return "Chargement des données en cours...";
    
    const paymentCount = statsData?.payments?.count || 0;
    const paymentRevenue = statsData?.payments?.revenue || 0;
    const leadCount = statsData?.leads?.count || 0;
    const requestCount = statsData?.requests?.count || 0;
    
    let summary = "";
    
    // Payment summary with RAC- data
    if (paymentCount > 0) {
      summary += `${paymentCount} paiement${paymentCount > 1 ? 's' : ''} RAC- pour ${formatAmount(paymentRevenue)}`;
    } else {
      summary += "Aucun paiement RAC-";
    }
    
    summary += ", ";
    
    // Lead summary
    if (leadCount > 0) {
      summary += `${leadCount} nouveau${leadCount > 1 ? 'x' : ''} lead${leadCount > 1 ? 's' : ''}`;
    } else {
      summary += "aucun nouveau lead";
    }
    
    summary += ", ";
    
    // Request summary
    if (requestCount > 0) {
      summary += `${requestCount} demande${requestCount > 1 ? 's' : ''} de service`;
    } else {
      summary += "aucune nouvelle demande";
    }
    
    return summary + ` ${getPeriodLabel()}.`;
  };

  // Format period label
  const getPeriodLabel = () => {
    switch (dateFilter.type) {
      case 'today':
        return "aujourd'hui";
      case 'yesterday':
        return "hier";
      case 'week':
        return "cette semaine";
      case 'month':
        return "ce mois";
      case 'custom':
        return "sur la période sélectionnée";
      default:
        return "aujourd'hui";
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Clock className="mr-1 h-3 w-3" />
              Mises à jour en temps réel activées
            </Badge>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="date-filter">Période :</Label>
          <Select
            value={dateFilter.type}
            onValueChange={(value) => setDateFilter({ type: value as DateFilter['type'] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter.type === 'custom' && (
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[120px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? customStartDate.toLocaleDateString() : "Début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[120px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? customEndDate.toLocaleDateString() : "Fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé intelligent</CardTitle>
            <CardDescription>
              Données {getPeriodLabel()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {generateSummary()}
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Payments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paiements</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : statsData?.payments?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(statsData?.payments?.revenue || 0)}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{statsData?.payments?.successRate || 0}% réussis</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leads Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : statsData?.leads?.count || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Nouveaux prospects</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requests Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : statsData?.requests?.count || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Demandes de service</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : `${statsData?.payments?.successRate || 0}%`}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Paiements réussis</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Activité récente</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Aperçu des dernières activités sur votre plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Chargement des données...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Période: {startDate} au {endDate}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Paiements RAC-</p>
                          <p className="text-xs text-muted-foreground">
                            {statsData?.payments?.count || 0} transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Nouveaux leads</p>
                          <p className="text-xs text-muted-foreground">
                            {statsData?.leads?.count || 0} prospects
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Demandes</p>
                          <p className="text-xs text-muted-foreground">
                            {statsData?.requests?.count || 0} services
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}