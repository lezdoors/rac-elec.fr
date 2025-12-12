import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CalendarIcon,
  CreditCard,
  Users,
  FileText,
  TrendingUp,
  Euro,
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

  useEffect(() => {
    const syncStripePayments = async () => {
      try {
        setIsSyncing(true);
        await apiRequest('GET', '/api/stripe/sync-today');
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      } catch (error) {
        console.log('Sync Stripe silencieux:', error);
      } finally {
        setIsSyncing(false);
      }
    };
    
    syncStripePayments();
  }, []);

  const getDateRange = () => {
    const now = new Date();
    
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = formatLocalDate(now);
    
    switch (dateFilter.type) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatLocalDate(yesterday);
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return { startDate: formatLocalDate(weekStart), endDate: today };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: formatLocalDate(monthStart), endDate: today };
      case 'custom':
        return {
          startDate: customStartDate ? formatLocalDate(customStartDate) : today,
          endDate: customEndDate ? formatLocalDate(customEndDate) : today
        };
      default:
        return { startDate: today, endDate: today };
    }
  };

  const { startDate, endDate } = getDateRange();

  const { data: statsData, isLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/dashboard/stats?startDate=${startDate}&endDate=${endDate}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!startDate && !!endDate
  });

  const getPeriodLabel = () => {
    switch (dateFilter.type) {
      case 'today': return "Aujourd'hui";
      case 'yesterday': return "Hier";
      case 'week': return "Cette semaine";
      case 'month': return "Ce mois";
      case 'custom': return "Période personnalisée";
      default: return "Aujourd'hui";
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-1">{getPeriodLabel()} - Données RAC-</p>
          </div>
          
          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <Select
              value={dateFilter.type}
              onValueChange={(value) => setDateFilter({ type: value as DateFilter['type'] })}
            >
              <SelectTrigger className="w-[160px] bg-white border-gray-200">
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
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white border-gray-200">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {customStartDate ? customStartDate.toLocaleDateString('fr-FR') : "Début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <span className="text-gray-400">—</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white border-gray-200">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {customEndDate ? customEndDate.toLocaleDateString('fr-FR') : "Fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {isSyncing && (
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chiffre d'affaires</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Euro className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {formatAmount(statsData?.payments?.revenue || 0)}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Paiements réussis</p>
            </CardContent>
          </Card>

          {/* Payments Card */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paiements</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {statsData?.payments?.count || 0}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {statsData?.payments?.successRate || 0}% de réussite
              </p>
            </CardContent>
          </Card>

          {/* Leads Card */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Leads</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {statsData?.leads?.count || 0}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Nouveaux prospects</p>
            </CardContent>
          </Card>

          {/* Requests Card */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Demandes</CardTitle>
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {statsData?.requests?.count || 0}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Demandes de service</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              Résumé de la période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {statsData?.payments?.count || 0} paiements
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatAmount(statsData?.payments?.revenue || 0)} de revenus
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {statsData?.leads?.count || 0} leads
                  </p>
                  <p className="text-xs text-gray-500">Nouveaux prospects</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {statsData?.requests?.count || 0} demandes
                  </p>
                  <p className="text-xs text-gray-500">Demandes de service</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
