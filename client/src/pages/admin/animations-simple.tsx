import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, ZapOff, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AnimationsSimplePage() {
  const { toast } = useToast();
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage for animation preference - default to disabled for performance
    const stored = localStorage.getItem('crm_animations_enabled');
    const enabled = stored === 'true';
    setAnimationsEnabled(enabled);
    
    // Apply CSS classes immediately on load
    if (enabled) {
      document.body.classList.add('animations-enabled');
      document.body.classList.remove('animations-disabled');
    } else {
      document.body.classList.add('animations-disabled');
      document.body.classList.remove('animations-enabled');
    }
  }, []);

  const handleToggleAnimations = () => {
    const newState = !animationsEnabled;
    setAnimationsEnabled(newState);
    localStorage.setItem('crm_animations_enabled', newState.toString());
    
    // Apply CSS class to body for global animation control
    if (newState) {
      document.body.classList.add('animations-enabled');
      document.body.classList.remove('animations-disabled');
    } else {
      document.body.classList.add('animations-disabled');
      document.body.classList.remove('animations-enabled');
    }
    
    toast({
      title: newState ? "Animations activées" : "Animations désactivées",
      description: newState 
        ? "Interface avec animations d'interface" 
        : "Interface optimisée pour les performances",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${animationsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {animationsEnabled ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration des Animations</h1>
            <p className="text-gray-600">
              Contrôle global des animations pour optimiser les performances du CRM
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Mode Performance CRM</span>
            </CardTitle>
            <CardDescription>
              Le CRM est optimisé pour un usage professionnel intensif. Les animations peuvent être désactivées pour améliorer les performances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="animations-toggle" className="text-base font-medium">
                  Animations d'interface
                </Label>
                <p className="text-sm text-gray-600">
                  {animationsEnabled 
                    ? "Les animations sont activées (peut ralentir l'interface)" 
                    : "Les animations sont désactivées (performances optimales)"}
                </p>
              </div>
              <Switch
                id="animations-toggle"
                checked={animationsEnabled}
                onCheckedChange={handleToggleAnimations}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Recommandations :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Désactivé</strong> : Idéal pour un usage intensif du CRM</li>
                <li>• <strong>Activé</strong> : Uniquement si les performances ne sont pas critiques</li>
                <li>• Les changements prennent effet immédiatement</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <div className="flex space-x-3">
                <Button 
                  variant={animationsEnabled ? "destructive" : "default"}
                  onClick={() => setAnimationsEnabled(false)}
                  disabled={!animationsEnabled}
                >
                  <ZapOff className="h-4 w-4 mr-2" />
                  Mode Performance
                </Button>
                <Button 
                  variant={animationsEnabled ? "default" : "outline"}
                  onClick={() => setAnimationsEnabled(true)}
                  disabled={animationsEnabled}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Mode Animations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Animations :</span>
                <span className={`font-medium ${animationsEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {animationsEnabled ? 'Activées' : 'Désactivées'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Performance :</span>
                <span className={`font-medium ${animationsEnabled ? 'text-yellow-600' : 'text-green-600'}`}>
                  {animationsEnabled ? 'Standard' : 'Optimale'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mode CRM :</span>
                <span className="font-medium text-blue-600">
                  {animationsEnabled ? 'Interface enrichie' : 'Performance maximale'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}