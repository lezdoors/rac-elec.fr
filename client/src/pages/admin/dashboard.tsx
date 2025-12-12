import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  CalendarIcon,
  CreditCard,
  Clock,
  Users,
  FileText,
  CheckCircle,
  RefreshCw
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
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronisation automatique avec Stripe au chargement (références RAC- uniquement)
  useEffect(() => {
    const syncStripePayments = async () => {
      try {
        setIsSyncing(true);
        await apiRequest('GET', '/api/stripe/sync-today');
        // Rafraîchir les données après synchronisation
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      } catch (error) {
        console.log('Sync Stripe silencieux:', error);
      } finally {
        setIsSyncing(false);
      }
    };
    
    syncStripePayments();
  }, []);

  // Calculate date range based on filter - Fixed timezone issues
  const getDateRange = () => {
    const now = new Date();
    
    // Force local date calculation to avoid timezone issues
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = formatLocalDate(now);
    
    switch (dateFilter.type) {
      case 'today':
        return {
          startDate: today,
          endDate: today
        };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatLocalDate(yesterday);
        return {
          startDate: yesterdayStr,
          endDate: yesterdayStr
        };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return {
          startDate: formatLocalDate(weekStart),
          endDate: today
        };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: formatLocalDate(monthStart),
          endDate: today
        };
      case 'custom':
        return {
          startDate: customStartDate ? formatLocalDate(customStartDate) : today,
          endDate: customEndDate ? formatLocalDate(customEndDate) : today
        };
      default:
        return {
          startDate: today,
          endDate: today
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
              Données RAC- en temps réel
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

        {/* Enhanced Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 border-0 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-emerald-200/20 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/15 to-pink-200/15 rounded-full translate-y-16 -translate-x-16"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl shadow-md border border-white/50"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FileText className="h-6 w-6 text-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                      Résumé Intelligent
                    </CardTitle>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </motion.div>
                  </div>
                  <CardDescription className="text-slate-600 flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    Données {getPeriodLabel()} - Références RAC- authentiques
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border border-white/60 shadow-sm">
                <p className="text-slate-800 font-semibold leading-relaxed">
                  {generateSummary()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Enhanced Payments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700">Paiements RAC-</CardTitle>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-2 bg-blue-100 rounded-lg"
                >
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-blue-200 h-8 w-8 rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      {statsData?.payments?.count || 0}
                    </motion.span>
                  )}
                </div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  {formatAmount(statsData?.payments?.revenue || 0)}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-slate-600">{statsData?.payments?.successRate || 0}% réussis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Leads Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700">Leads</CardTitle>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-2 bg-purple-100 rounded-lg"
                >
                  <Users className="h-5 w-5 text-purple-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-purple-200 h-8 w-8 rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      {statsData?.leads?.count || 0}
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-purple-600 font-medium">Nouveaux prospects</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Requests Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-orange-700">Demandes</CardTitle>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-2 bg-orange-100 rounded-lg"
                >
                  <FileText className="h-5 w-5 text-orange-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-orange-200 h-8 w-8 rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    >
                      {statsData?.requests?.count || 0}
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-orange-600 font-medium">Demandes de service</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Success Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700">Taux de réussite</CardTitle>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-2 bg-green-100 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 mb-1">
                  {isLoading ? (
                    <div className="animate-pulse bg-green-200 h-8 w-8 rounded"></div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    >
                      {statsData?.payments?.successRate || 0}%
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium">Paiements réussis</p>
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
                  Aperçu des dernières activités RAC- sur votre plateforme
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