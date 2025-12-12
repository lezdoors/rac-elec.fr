import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateGclidSetup, testGclidConversion, generateGclidDiagnostic, startGclidMonitoring, type GclidValidationResult } from "@/lib/gclid-validator";
import { getCurrentGclid, getStoredGclid, initializeGclidTracking } from "@/lib/gclid-tracking";

export default function GclidTestingPage() {
  const { toast } = useToast();
  const [validation, setValidation] = useState<GclidValidationResult | null>(null);
  const [isTestingConversion, setIsTestingConversion] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string>("");
  const [monitoringActive, setMonitoringActive] = useState(false);

  useEffect(() => {
    runValidation();
    setDiagnostic(generateGclidDiagnostic());
  }, []);

  const runValidation = () => {
    const result = validateGclidSetup();
    setValidation(result);
  };

  const testConversion = async () => {
    setIsTestingConversion(true);
    try {
      const success = await testGclidConversion('AW-16683623620/test-conversion');
      toast({
        title: success ? "Test réussi" : "Test échoué",
        description: success ? "La conversion test a été envoyée avec succès" : "Erreur lors du test de conversion",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erreur de test",
        description: "Impossible de tester la conversion",
        variant: "destructive"
      });
    } finally {
      setIsTestingConversion(false);
    }
  };

  const copyDiagnostic = () => {
    navigator.clipboard.writeText(diagnostic);
    toast({
      title: "Copié",
      description: "Rapport de diagnostic copié dans le presse-papier"
    });
  };

  const startMonitoring = () => {
    startGclidMonitoring();
    setMonitoringActive(true);
    toast({
      title: "Monitoring activé",
      description: "Surveillance GCLID démarrée - vérifiez la console"
    });
  };

  const reinitializeTracking = () => {
    initializeGclidTracking();
    runValidation();
    setDiagnostic(generateGclidDiagnostic());
    toast({
      title: "Tracking réinitialisé",
      description: "Le système GCLID a été réinitialisé"
    });
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (isValid: boolean) => {
    return isValid ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test GCLID & Attribution</h1>
            <p className="text-gray-600">
              Validation et test du système de tracking Google Ads
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={runValidation} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={reinitializeTracking}>
              Réinitialiser
            </Button>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status">État GCLID</TabsTrigger>
            <TabsTrigger value="testing">Tests</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {validation && getStatusIcon(validation.isValid)}
                    <span>Statut Général</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validation && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Statut:</span>
                        <Badge className={getStatusColor(validation.isValid)}>
                          {validation.isValid ? 'Valide' : 'Invalide'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>GCLID actuel:</span>
                        <span className="font-mono text-sm">{validation.gclid || 'Aucun'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <Badge variant="outline">{validation.source}</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Données Stockées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>GCLID stocké:</span>
                      <span className="font-mono text-sm">{getStoredGclid() || 'Aucun'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>URL actuelle:</span>
                      <span className="text-sm truncate max-w-[200px]">{getCurrentGclid() || 'Aucun'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {validation && (
              <>
                {validation.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Erreurs détectées:</div>
                        {validation.errors.map((error, index) => (
                          <div key={index} className="text-sm">• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Avertissements:</div>
                        {validation.warnings.map((warning, index) => (
                          <div key={index} className="text-sm">• {warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.recommendations.length > 0 && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-500" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Recommandations:</div>
                        {validation.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm">• {rec}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Tests de Conversion</CardTitle>
                <CardDescription>
                  Testez les conversions Google Ads avec attribution GCLID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Test de Conversion</div>
                    <div className="text-sm text-gray-600">
                      Envoie une conversion test avec GCLID si disponible
                    </div>
                  </div>
                  <Button 
                    onClick={testConversion} 
                    disabled={isTestingConversion}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>{isTestingConversion ? 'Test en cours...' : 'Tester'}</span>
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Instructions de test:</div>
                      <div className="text-sm space-y-1">
                        <div>1. Visitez la page avec un paramètre GCLID test: <code>?gclid=test123456789</code></div>
                        <div>2. Cliquez sur "Tester" pour envoyer une conversion</div>
                        <div>3. Vérifiez la console pour les logs de confirmation</div>
                        <div>4. Consultez Google Ads pour vérifier la réception</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rapport de Diagnostic</span>
                  <Button onClick={copyDiagnostic} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </CardTitle>
                <CardDescription>
                  Rapport technique complet du système GCLID
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {diagnostic}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring en Temps Réel</CardTitle>
                <CardDescription>
                  Surveillance continue du système GCLID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Monitoring GCLID</div>
                    <div className="text-sm text-gray-600">
                      {monitoringActive ? 'Surveillance active - vérifiez la console' : 'Surveillance inactive'}
                    </div>
                  </div>
                  <Button 
                    onClick={startMonitoring} 
                    disabled={monitoringActive}
                    variant={monitoringActive ? "outline" : "default"}
                  >
                    {monitoringActive ? 'Actif' : 'Démarrer'}
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Fonctionnalités de monitoring:</div>
                      <div className="text-sm space-y-1">
                        <div>• Validation continue du GCLID</div>
                        <div>• Détection des changements d'URL</div>
                        <div>• Alertes d'expiration du GCLID</div>
                        <div>• Logs détaillés dans la console</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}