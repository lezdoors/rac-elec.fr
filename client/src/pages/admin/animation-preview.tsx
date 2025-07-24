import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleElectricLoader } from "@/components/ui/simple-electric-loader";
import { PowerElectricLoader } from "@/components/ui/power-electric-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Code, PlayCircle, Settings, Eye } from "lucide-react";

type UiAnimation = {
  id: number;
  name: string;
  type: string;
  category: string;
  component: string;
  enabled: boolean;
  default: boolean;
  config: Record<string, any>;
  pages: string[];
  lastModifiedAt: string;
  lastModifiedBy: number | null;
  createdAt: string;
};

export default function AnimationPreviewPage() {
  const [activeAnimation, setActiveAnimation] = useState<string>("simple");

  // Récupérer les animations UI
  const { 
    data: animations, 
    isLoading, 
    error 
  } = useQuery<UiAnimation[]>({
    queryKey: ['/api/ui-animations'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fonction pour déterminer quelle animation afficher
  const renderAnimation = (animationType: string, config: Record<string, any> = {}) => {
    switch (animationType) {
      case 'simple':
        return (
          <SimpleElectricLoader 
            size={config.size || "lg"} 
            showInfo={config.showInfo !== undefined ? config.showInfo : true}
            showBadges={config.showBadges !== undefined ? config.showBadges : true}
            showLogo={config.showLogo !== undefined ? config.showLogo : true}
            showCertifications={config.showCertifications !== undefined ? config.showCertifications : true}
            className={config.className}
          />
        );
      case 'electric':
        return (
          <PowerElectricLoader 
            size={config.size || "lg"}
            text={config.text || "Chargement..."}
            showText={config.showText !== undefined ? config.showText : true}
            textPosition={config.textPosition || "bottom"}
            color={config.color || "blue"}
            intensity={config.intensity || 0.8}
            className={config.className}
          />
        );
      default:
        return <SimpleElectricLoader size="md" />;
    }
  };

  // Regrouper les animations par type
  const animationsByType = animations?.reduce((acc, animation) => {
    const type = animation.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(animation);
    return acc;
  }, {} as Record<string, UiAnimation[]>) || {};
  
  return (
    <AdminLayout title="Prévisualisation des animations" description="Prévisualisez et testez les animations de l'interface">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prévisualisation des animations</h1>
          <p className="text-muted-foreground">
            Testez et prévisualisez les différentes animations disponibles sur la plateforme
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <SimpleElectricLoader size="lg" showInfo={false} />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Une erreur est survenue lors du chargement des animations.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Tabs defaultValue="library" className="w-full">
              <TabsList className="w-full mb-6 grid-cols-2">
                <TabsTrigger value="library" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Bibliothèque d'animations</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="library" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Animation SimpleElectricLoader */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Animation Simple</CardTitle>
                        <Badge>Standard</Badge>
                      </div>
                      <CardDescription>Animation de chargement simple avec informations</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                      <div className="w-full max-w-xs flex justify-center">
                        <SimpleElectricLoader size="md" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Badge variant="secondary" className="font-normal">
                          <Info className="h-3 w-3 mr-1" />
                          Instructif
                        </Badge>
                        <Badge variant="secondary" className="font-normal">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Animation douce
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Animation PowerElectricLoader */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Animation Électrique</CardTitle>
                        <Badge variant="outline">Professionnel</Badge>
                      </div>
                      <CardDescription>Animation dynamique avec effets électriques</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                      <div className="w-full max-w-xs flex justify-center">
                        <PowerElectricLoader size="md" text="Chargement..." />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Badge variant="secondary" className="font-normal">
                          <Code className="h-3 w-3 mr-1" />
                          Effects avancés
                        </Badge>
                        <Badge variant="secondary" className="font-normal">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Personnalisable
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Animations configurées */}
                  {Object.entries(animationsByType).map(([type, anims]) => 
                    anims.map((animation) => (
                      <Card key={animation.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{animation.name}</CardTitle>
                            {animation.default && <Badge>Par défaut</Badge>}
                            {!animation.enabled && <Badge variant="destructive">Désactivé</Badge>}
                          </div>
                          <CardDescription>
                            {animation.category} | Type: {animation.type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-6">
                          <div className="w-full max-w-xs flex justify-center">
                            {renderAnimation(animation.type, animation.config)}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="font-normal">
                              {animation.component}
                            </Badge>
                            {animation.pages?.includes('all') ? (
                              <Badge variant="secondary">Toutes les pages</Badge>
                            ) : (
                              <Badge variant="secondary">Pages spécifiques</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres d'animation</CardTitle>
                    <CardDescription>
                      Configurez les paramètres globaux des animations sur la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Les paramètres d'animation peuvent être configurés directement depuis la page 
                      "Animations" dans le menu d'administration.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
}