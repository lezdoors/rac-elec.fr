import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircle, XCircle, AlertTriangle, Save, Copy, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Types pour les snippets Google
interface GoogleSnippet {
  id: string;
  name: string;
  description: string;
  code: string;
  enabled: boolean;
  triggerPage: string;
  triggerEvent: string;
  triggerSelector?: string;
  lastUpdated: string;
  createdBy: string;
}

// Page d'administration des snippets Google
export default function GoogleSnippetsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("step1");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State pour les snippets par étape
  const [step1Snippet, setStep1Snippet] = useState<GoogleSnippet>({
    id: "form-init-snippet",
    name: "Initialisation Formulaire",
    description: "Snippet déclenché lorsque l'utilisateur commence le formulaire (étape 1/3)",
    code: "<!-- Google snippet pour l'étape 1 - Ajoutez votre code ici -->",
    enabled: true,
    triggerPage: "/raccordement-enedis",
    triggerEvent: "click",
    triggerSelector: ".next-step-btn, .btn-start-form",
    lastUpdated: new Date().toISOString(),
    createdBy: "Admin"
  });
  
  const [step2Snippet, setStep2Snippet] = useState<GoogleSnippet>({
    id: "form-submit-snippet",
    name: "Soumission Formulaire",
    description: "Snippet déclenché lorsque l'utilisateur soumet le formulaire complet",
    code: "<!-- Google snippet pour l'étape 2 - Ajoutez votre code ici -->",
    enabled: true,
    triggerPage: "/raccordement-enedis",
    triggerEvent: "click",
    triggerSelector: ".submit-form-btn, .btn-submit",
    lastUpdated: new Date().toISOString(),
    createdBy: "Admin"
  });
  
  const [step3Snippet, setStep3Snippet] = useState<GoogleSnippet>({
    id: "payment-success-snippet",
    name: "Paiement Réussi",
    description: "Snippet déclenché lorsque le paiement est confirmé avec succès",
    code: "<!-- Google snippet pour l'étape 3 - Ajoutez votre code ici -->",
    enabled: true,
    triggerPage: "/paiement-confirmation",
    triggerEvent: "load",
    lastUpdated: new Date().toISOString(),
    createdBy: "Admin"
  });
  
  // Charger les snippets depuis l'API
  useEffect(() => {
    const loadSnippets = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("GET", "/api/admin/google-snippets");
        if (response.ok) {
          const data = await response.json();
          
          // Mettre à jour les états avec les données du serveur
          data.snippets.forEach((snippet: GoogleSnippet) => {
            if (snippet.id === "form-init-snippet") {
              setStep1Snippet(snippet);
            } else if (snippet.id === "form-submit-snippet") {
              setStep2Snippet(snippet);
            } else if (snippet.id === "payment-success-snippet") {
              setStep3Snippet(snippet);
            }
          });
          
          toast({
            title: "Snippets chargés",
            description: "Les snippets Google ont été chargés avec succès."
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des snippets:", error);
        // Utiliser les valeurs par défaut définies dans le state initial
        toast({
          title: "Erreur",
          description: "Impossible de charger les snippets Google. Utilisation des valeurs par défaut.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSnippets();
  }, [toast]);
  
  // Sauvegarder un snippet
  const saveSnippet = async (snippet: GoogleSnippet) => {
    setSaving(true);
    try {
      const response = await apiRequest("POST", "/api/admin/google-snippets", {
        snippet
      });
      
      if (response.ok) {
        toast({
          title: "Snippet sauvegardé",
          description: `Le snippet "${snippet.name}" a été sauvegardé avec succès.`
        });
      } else {
        throw new Error("Erreur lors de la sauvegarde du snippet");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du snippet:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le snippet Google.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Copier le code du snippet
  const copySnippetCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié",
      description: "Le code du snippet a été copié dans le presse-papier."
    });
  };
  
  // Mettre à jour les états des snippets
  const updateSnippet = (id: string, field: keyof GoogleSnippet, value: any) => {
    if (id === "form-init-snippet") {
      setStep1Snippet(prev => ({ ...prev, [field]: value, lastUpdated: new Date().toISOString() }));
    } else if (id === "form-submit-snippet") {
      setStep2Snippet(prev => ({ ...prev, [field]: value, lastUpdated: new Date().toISOString() }));
    } else if (id === "payment-success-snippet") {
      setStep3Snippet(prev => ({ ...prev, [field]: value, lastUpdated: new Date().toISOString() }));
    }
  };
  
  // Tester le snippet
  const testSnippet = (snippet: GoogleSnippet) => {
    if (!snippet.code.trim()) {
      toast({
        title: "Test impossible",
        description: "Le code du snippet est vide.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Vérification simple de la syntaxe
      const codeWithoutComments = snippet.code.replace(/<!--[\s\S]*?-->/g, "").trim();
      if (codeWithoutComments && !codeWithoutComments.includes("<script") && !codeWithoutComments.includes("gtag")) {
        toast({
          title: "Avertissement",
          description: "Le code ne semble pas contenir de script Google Analytics."
        });
        return;
      }
      
      toast({
        title: "Test réussi",
        description: "Le snippet Google semble valide."
      });
    } catch (error) {
      toast({
        title: "Erreur de syntaxe",
        description: "Le code du snippet contient des erreurs.",
        variant: "destructive"
      });
    }
  };
  
  // Rendu du composant de snippet
  const renderSnippetCard = (snippet: GoogleSnippet, setter: (value: React.SetStateAction<GoogleSnippet>) => void) => {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{snippet.name}</CardTitle>
              <CardDescription>{snippet.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id={`${snippet.id}-toggle`} 
                checked={snippet.enabled}
                onCheckedChange={(checked) => updateSnippet(snippet.id, "enabled", checked)}
              />
              <Label htmlFor={`${snippet.id}-toggle`} className="text-sm">
                {snippet.enabled ? "Activé" : "Désactivé"}
              </Label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Page: {snippet.triggerPage}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Événement: {snippet.triggerEvent}
            </Badge>
            {snippet.triggerSelector && (
              <Badge variant="outline" className="text-xs">
                Sélecteur: {snippet.triggerSelector}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <Label htmlFor={`${snippet.id}-trigger-selector`} className="mb-1 block">
              Sélecteur CSS (déclencheur)
            </Label>
            <Input 
              id={`${snippet.id}-trigger-selector`}
              value={snippet.triggerSelector || ''}
              onChange={(e) => updateSnippet(snippet.id, "triggerSelector", e.target.value)}
              placeholder="ex: .btn-submit, #submit-button"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sélecteur CSS pour l'élément qui déclenche le snippet (séparés par des virgules pour plusieurs)
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor={`${snippet.id}-code`}>Code du Snippet</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copySnippetCode(snippet.code)}
                className="h-6 px-2 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copier
              </Button>
            </div>
            <Textarea 
              id={`${snippet.id}-code`}
              value={snippet.code}
              onChange={(e) => updateSnippet(snippet.id, "code", e.target.value)}
              className="font-mono h-[200px] text-sm"
              placeholder="<!-- Insérez le code du snippet Google ici -->"
            />
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Où ce snippet sera-t-il déclenché :</strong>
                <p className="mt-1">
                  {snippet.id === "form-init-snippet" && 
                    "Ce snippet se déclenchera lorsqu'un utilisateur commence le formulaire de raccordement (étape 1/3)."}
                  {snippet.id === "form-submit-snippet" && 
                    "Ce snippet se déclenchera lorsqu'un utilisateur soumet le formulaire de raccordement complet."}
                  {snippet.id === "payment-success-snippet" && 
                    "Ce snippet se déclenchera lorsque le paiement est confirmé comme réussi."}
                </p>
                <p className="mt-1">
                  <strong>Condition technique :</strong>{" "}
                  {snippet.triggerEvent === "click" 
                    ? `Clic sur l'élément "${snippet.triggerSelector}" sur la page ${snippet.triggerPage}`
                    : `Chargement de la page ${snippet.triggerPage} avec paramètre de succès`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => testSnippet(snippet)}
            disabled={saving}
          >
            <Code className="h-4 w-4 mr-2" />
            Tester le code
          </Button>
          <Button 
            onClick={() => saveSnippet(snippet)}
            disabled={saving}
          >
            {saving ? (
              <>Sauvegarde...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <AdminLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Snippets Google</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les snippets de code Google Analytics pour le suivi des conversions
            </p>
          </div>
        </div>
        
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Les snippets configurés ici seront injectés aux points clés du parcours utilisateur.
            Assurez-vous que le code est correct et testé avant de l'activer.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="step1" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid grid-cols-3 w-full">
            <TabsTrigger value="step1">
              Étape 1: Initialisation Formulaire
              {step1Snippet.enabled ? 
                <CheckCircle className="h-3 w-3 ml-2 text-green-500" /> : 
                <XCircle className="h-3 w-3 ml-2 text-red-500" />
              }
            </TabsTrigger>
            <TabsTrigger value="step2">
              Étape 2: Soumission Formulaire
              {step2Snippet.enabled ? 
                <CheckCircle className="h-3 w-3 ml-2 text-green-500" /> : 
                <XCircle className="h-3 w-3 ml-2 text-red-500" />
              }
            </TabsTrigger>
            <TabsTrigger value="step3">
              Étape 3: Paiement Réussi
              {step3Snippet.enabled ? 
                <CheckCircle className="h-3 w-3 ml-2 text-green-500" /> : 
                <XCircle className="h-3 w-3 ml-2 text-red-500" />
              }
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="step1">
            {renderSnippetCard(step1Snippet, setStep1Snippet)}
            <Card>
              <CardHeader>
                <CardTitle>Comment implémenter ce snippet (Étape 1)</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Ce snippet sera déclenché lorsque l'utilisateur passe à l'étape 1 du formulaire.</li>
                  <li>Il doit être configuré pour s'activer lorsque le bouton "Commencer" ou "Suivant" est cliqué.</li>
                  <li>Assurez-vous que le sélecteur CSS correspond aux éléments du formulaire qui déclenchent le passage à l'étape suivante.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="step2">
            {renderSnippetCard(step2Snippet, setStep2Snippet)}
            <Card>
              <CardHeader>
                <CardTitle>Comment implémenter ce snippet (Étape 2)</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Ce snippet sera déclenché lorsque l'utilisateur soumet le formulaire complet.</li>
                  <li>Il doit être configuré pour s'activer lorsque le bouton final "Soumettre" est cliqué.</li>
                  <li>Ce moment correspond à la génération d'un lead qualifié qui peut passer au paiement.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="step3">
            {renderSnippetCard(step3Snippet, setStep3Snippet)}
            <Card>
              <CardHeader>
                <CardTitle>Comment implémenter ce snippet (Étape 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Ce snippet sera déclenché sur la page de confirmation de paiement réussi.</li>
                  <li>Il s'active automatiquement au chargement de la page lorsque le paiement est validé.</li>
                  <li>C'est le moment idéal pour enregistrer une conversion complète dans Google Analytics.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}