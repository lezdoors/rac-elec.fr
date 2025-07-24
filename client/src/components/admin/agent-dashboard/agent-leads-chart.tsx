import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, BarChart3, LineChart, Loader2 } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LeadsChartData {
  date: string;
  leads: number;
  demands: number;
}

interface LeadsChartProps {
  period?: "15days" | "30days" | "90days";
}

export default function AgentLeadsChart({ period = "15days" }: LeadsChartProps) {
  // Fetch lead and demand data for the specified period
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/user/performance/leads-chart", { period }],
  });

  // Generate sample data if no data is returned
  const generateChartData = (): LeadsChartData[] => {
    const chartData: LeadsChartData[] = [];
    const days = period === "15days" ? 15 : period === "30days" ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      chartData.push({
        date: format(date, "dd/MM", { locale: fr }),
        leads: 0,
        demands: 0
      });
    }
    
    // Merge with actual data if available
    if (data?.chartData && Array.isArray(data.chartData)) {
      // Create a map of dates to data points from the actual data
      const dateMap = new Map<string, { leads: number; demands: number }>();
      data.chartData.forEach((item: any) => {
        if (item.date) {
          const formattedDate = format(new Date(item.date), "dd/MM", { locale: fr });
          dateMap.set(formattedDate, {
            leads: item.leads || 0,
            demands: item.demands || 0
          });
        }
      });
      
      // Update the chart data with actual values where available
      chartData.forEach((item, index) => {
        if (dateMap.has(item.date)) {
          const actualData = dateMap.get(item.date);
          if (actualData) {
            chartData[index].leads = actualData.leads;
            chartData[index].demands = actualData.demands;
          }
        }
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Leads et Demandes</CardTitle>
          <CardDescription>
            Suivi sur les {period === "15days" ? "15 derniers" : period === "30days" ? "30 derniers" : "90 derniers"} jours
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Leads et Demandes</CardTitle>
          <CardDescription>
            Suivi sur les {period === "15days" ? "15 derniers" : period === "30days" ? "30 derniers" : "90 derniers"} jours
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-muted-foreground">Impossible de charger les données.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Leads et Demandes</CardTitle>
        <CardDescription>
          Suivi sur les {period === "15days" ? "15 derniers" : period === "30days" ? "30 derniers" : "90 derniers"} jours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="line" className="flex items-center gap-1">
                <LineChart className="h-4 w-4" />
                <span>Ligne</span>
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Barres</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="line" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value,
                    name === "leads" ? "Leads" : "Demandes"
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  formatter={(value) => value === "leads" ? "Leads" : "Demandes"} 
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="demands"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="bar" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value,
                    name === "leads" ? "Leads" : "Demandes"
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  formatter={(value) => value === "leads" ? "Leads" : "Demandes"} 
                />
                <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                <Bar dataKey="demands" fill="#10b981" name="Demandes" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}