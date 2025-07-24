import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChevronDown, ChevronUp, BarChart3, Database, Activity, ArrowRight, RefreshCcw, Cpu, HardDrive, Network, AlertCircle, Clock, FileCheck, Server, Boxes, Disc, Wrench, Archive } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Styles de couleur pour les indicateurs de performance
const performanceColors = {
  excellent: "bg-green-500",
  good: "bg-emerald-500",
  average: "bg-yellow-500",
  slow: "bg-orange-500",
  poor: "bg-red-500"
};

// Fonction utilitaire pour évaluer la performance
const getPerformanceLevel = (loadTime: number) => {
  if (loadTime < 100) return { level: "excellent", color: performanceColors.excellent, label: "Excellent" };
  if (loadTime < 200) return { level: "good", color: performanceColors.good, label: "Bon" };
  if (loadTime < 500) return { level: "average", color: performanceColors.average, label: "Moyen" };
  if (loadTime < 1000) return { level: "slow", color: performanceColors.slow, label: "Lent" };
  return { level: "poor", color: performanceColors.poor, label: "Critique" };
};

// Composant pour afficher un indicateur de statut
const StatusIndicator = ({ status, label, className = "" }: { status: "success" | "warning" | "error" | "info", label: string, className?: string }) => {
  const statusColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-3 w-3 rounded-full ${statusColors[status]}`}></div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

const PerformanceMonitor = () => {
  const { toast } = useToast();
  const [isMetricsEnabled, setIsMetricsEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState("recent");

  // Récupérer les métriques récentes
  const { data: recentMetrics, isLoading: isLoadingRecent, refetch: refetchRecent } = useQuery<any>({
    queryKey: ["/api/performance/recent"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/performance/recent");
      const data = await response.json();
      return data.metrics || [];
    },
    // Toujours activé, peu importe l'onglet sélectionné
    enabled: true,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  // Récupérer les statistiques globales
  const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useQuery<any>({
    queryKey: ["/api/performance/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/performance/stats");
      const data = await response.json();
      return data.stats || { routeStats: [], statusCodeStats: [], hourlyStats: [] };
    },
    // Toujours activé, peu importe l'onglet sélectionné
    enabled: true,
    refetchInterval: 60000 // Rafraîchir toutes les minutes
  });

  // Récupérer les informations sur la base de données
  const { data: dbInfo, isLoading: isLoadingDbInfo, refetch: refetchDbInfo } = useQuery<any>({
    queryKey: ["/api/performance/database-info"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/performance/database-info");
      const data = await response.json();
      return data.dbInfo || { dbSize: {}, tableSizes: [], recordCounts: {} };
    },
    // Toujours activé, peu importe l'onglet sélectionné
    enabled: true,
    refetchInterval: 300000 // Rafraîchir toutes les 5 minutes
  });
  
  // Effectuer une actualisation des données lorsque l'onglet change
  useEffect(() => {
    // Recharger les données en fonction de l'onglet sélectionné
    if (selectedTab === "recent") {
      refetchRecent();
    } else if (selectedTab === "stats") {
      refetchStats();
    } else if (selectedTab === "database") {
      refetchDbInfo();
    }
  }, [selectedTab, refetchRecent, refetchStats, refetchDbInfo]);

  // Toggle la collecte de métriques
  const toggleMetricsCollection = async () => {
    try {
      const response = await apiRequest("POST", "/api/performance/toggle", { 
        enabled: !isMetricsEnabled 
      });
      const data = await response.json();
      
      if (data.success) {
        setIsMetricsEnabled(data.enabled);
        toast({
          title: "Collecte de métriques " + (data.enabled ? "activée" : "désactivée"),
          description: data.message,
          duration: 3000
        });
      } else {
        throw new Error(data.message || "Erreur inconnue");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Fonction d'actualisation des données en fonction de l'onglet actif
  const refreshData = () => {
    if (selectedTab === "recent") {
      refetchRecent();
    } else if (selectedTab === "stats") {
      refetchStats();
    } else if (selectedTab === "database") {
      refetchDbInfo();
    }
  };

  return (
    <AdminLayout title="Monitoring de performance">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Monitoring de performance</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="metrics-switch" 
              checked={isMetricsEnabled} 
              onCheckedChange={toggleMetricsCollection} 
            />
            <Label htmlFor="metrics-switch">
              {isMetricsEnabled ? "Collecte activée" : "Collecte désactivée"}
            </Label>
          </div>
          <Button onClick={refreshData} size="sm" variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="recent">
            <Activity className="mr-2 h-4 w-4" />
            Activité récente
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Base de données
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          {/* Aperçu système - ajouté pour montrer l'état global */}
          <Card className="border-l-4 border-l-blue-500 mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold mb-1">État du système</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitoring actif depuis {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <StatusIndicator status="success" label="API" />
                  <StatusIndicator status="success" label="Base de données" />
                  <StatusIndicator status="success" label="Mail" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Requêtes récentes</CardTitle>
              <CardDescription>
                Liste des {recentMetrics?.length || 0} dernières requêtes traitées par le serveur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
                  <p>Chargement des données...</p>
                </div>
              ) : recentMetrics?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date/Heure</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Temps (ms)</TableHead>
                        <TableHead>Mémoire (MB)</TableHead>
                        <TableHead>Code HTTP</TableHead>
                        <TableHead>Taille (octets)</TableHead>
                        <TableHead>Utilisateur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMetrics.map((metric: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(metric.timestamp)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <span title={metric.route}>{metric.route}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={metric.load_time > 500 ? "destructive" : 
                                         metric.load_time > 200 ? "outline" : "secondary"}>
                              {metric.load_time} ms
                            </Badge>
                          </TableCell>
                          <TableCell>{metric.memory_usage || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={metric.status_code >= 400 ? "destructive" : 
                                         metric.status_code >= 300 ? "outline" : "secondary"}>
                              {metric.status_code}
                            </Badge>
                          </TableCell>
                          <TableCell>{metric.response_size}</TableCell>
                          <TableCell>{metric.user_id || "Anonyme"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune métrique disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          {isLoadingStats ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
              <p>Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              {/* Statistiques par route */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance par route</CardTitle>
                  <CardDescription>Temps moyen de chargement des routes les plus utilisées</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsData?.routeStats?.length > 0 ? (
                    <div className="space-y-4">
                      {statsData.routeStats.map((route: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium truncate max-w-[60%]" title={route.route}>
                              {route.route}
                            </span>
                            <span>
                              {Math.round(route.avg_load_time)} ms (min: {route.min_load_time}, max: {route.max_load_time})
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(100, (route.avg_load_time / 1000) * 100)} 
                            className="h-2" 
                          />
                          <div className="text-xs text-right text-muted-foreground">
                            {route.request_count} requête(s)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Codes de statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Codes HTTP</CardTitle>
                    <CardDescription>Distribution des codes de statut HTTP</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statsData?.statusCodeStats?.length > 0 ? (
                      <div className="space-y-2">
                        {statsData.statusCodeStats.map((status: any, index: number) => {
                          // Déterminer la variante en fonction du code
                          const variant = status.status_code >= 400 ? "destructive" : 
                                         status.status_code >= 300 ? "outline" : "secondary";
                          
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Badge variant={variant as "destructive" | "outline" | "secondary"} className="mr-2">
                                  {status.status_code}
                                </Badge>
                                <span className="text-sm">
                                  {status.status_code >= 200 && status.status_code < 300 && "Succès"}
                                  {status.status_code >= 300 && status.status_code < 400 && "Redirection"}
                                  {status.status_code >= 400 && status.status_code < 500 && "Erreur client"}
                                  {status.status_code >= 500 && "Erreur serveur"}
                                </span>
                              </div>
                              <span className="font-semibold">{status.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Aucune donnée disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Métriques horaires */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité des dernières 24h</CardTitle>
                    <CardDescription>Nombre de requêtes et temps moyen par heure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statsData?.hourlyStats?.length > 0 ? (
                      <div className="space-y-3">
                        {statsData.hourlyStats.map((hour: any, index: number) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span>{new Date(hour.hour).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                              <span>{hour.request_count} req. / {Math.round(hour.avg_load_time)} ms</span>
                            </div>
                            <Progress value={(hour.request_count / 100) * 100} className="h-1" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Aucune donnée disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="database" className="space-y-6">
          {isLoadingDbInfo ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
              <p>Chargement des informations de la base de données...</p>
            </div>
          ) : (
            <>
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <HardDrive className="h-5 w-5 mr-2 text-blue-500" />
                      Taille totale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dbInfo?.dbSize?.size || "N/A"}</div>
                    <p className="text-sm text-muted-foreground">Espace disque utilisé</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Boxes className="h-5 w-5 mr-2 text-blue-500" />
                      Tables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dbInfo?.tableSizes?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Nombre total de tables</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Server className="h-5 w-5 mr-2 text-blue-500" />
                      État
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusIndicator 
                      status={dbInfo ? "success" : "error"} 
                      label={dbInfo ? "Connecté" : "Déconnecté"} 
                      className="my-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      {dbInfo ? "Base de données opérationnelle" : "Problème de connexion"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Détails des performances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                    Santé du système
                  </CardTitle>
                  <CardDescription>Indicateurs de performance de la base de données</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Connexions actives</div>
                      <div className="text-2xl font-bold">{dbInfo?.connectionStats?.active || 0}</div>
                      <div className="text-xs text-muted-foreground">Max: {dbInfo?.connectionStats?.max || '--'}</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Temps de réponse</div>
                      <div className="text-2xl font-bold">{dbInfo?.responseTime || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Milliseconds</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Cache hits</div>
                      <div className="text-2xl font-bold">{dbInfo?.cacheStats?.hitRate || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Taux d'utilisation du cache</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Requêtes/min</div>
                      <div className="text-2xl font-bold">{dbInfo?.queryStats?.per_minute || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Total: {dbInfo?.queryStats?.total || '--'}</div>
                    </div>
                  </div>
                  
                  {dbInfo?.healthAlerts && dbInfo.healthAlerts.length > 0 && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Points d'attention</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                          {dbInfo.healthAlerts.map((alert: string, i: number) => (
                            <li key={i}>{alert}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
              
              {/* Taille des tables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-500" />
                    Occupation des tables
                  </CardTitle>
                  <CardDescription>Taille et nombre d'enregistrements par table</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table</TableHead>
                          <TableHead>Nb enregistrements</TableHead>
                          <TableHead>Taille totale</TableHead>
                          <TableHead>Taille interne</TableHead>
                          <TableHead>Taille index</TableHead>
                          <TableHead>Croissance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbInfo?.tableSizes?.map((table: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{table.table_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-between">
                                <span>{dbInfo.recordCounts[table.table_name] || 0}</span>
                                {table.growth && (
                                  <Badge variant="outline" className="ml-2">
                                    {table.growth > 0 ? '+' : ''}{table.growth}%
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{table.size}</TableCell>
                            <TableCell>{table.internal_size}</TableCell>
                            <TableCell>{table.external_size}</TableCell>
                            <TableCell>
                              {table.growth_indicator ? (
                                <div className="flex items-center space-x-1">
                                  <div className={`w-3 h-3 rounded-full ${table.growth_indicator === 'high' ? 'bg-red-500' : table.growth_indicator === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                  <span className="text-xs">
                                    {table.growth_indicator === 'high' ? 'Élevée' : table.growth_indicator === 'medium' ? 'Moyenne' : 'Faible'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Stable</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="outline" size="sm" onClick={refreshData}>
                    <RefreshCcw className="h-3 w-3 mr-1" /> Actualiser
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Opérations de maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-blue-500" />
                    Optimisation
                  </CardTitle>
                  <CardDescription>Actions de maintenance disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center">
                      <FileCheck className="h-6 w-6 mb-2" />
                      <span className="font-medium">Analyse des tables</span>
                      <span className="text-xs text-muted-foreground mt-1">Vérifier l'intégrité</span>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center">
                      <Disc className="h-6 w-6 mb-2" />
                      <span className="font-medium">Optimiser les tables</span>
                      <span className="text-xs text-muted-foreground mt-1">Défragmentation des indexes</span>
                    </Button>
                    
                    <Button variant="outline" className="p-6 h-auto flex flex-col items-center justify-center">
                      <Clock className="h-6 w-6 mb-2" />
                      <span className="font-medium">Archivage</span>
                      <span className="text-xs text-muted-foreground mt-1">Données obsolètes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default PerformanceMonitor;