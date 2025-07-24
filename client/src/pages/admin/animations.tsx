import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  Sparkles,
  Search, 
  Save, 
  PencilLine,
  Play,
  Pause,
  HelpCircle, 
  Trash2,
  Eye,
  Zap,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Info
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type UiAnimation = {
  id: number;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  cssClass: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number | null;
};

type NewAnimation = Omit<UiAnimation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

export default function AnimationsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAnimation, setSelectedAnimation] = useState<UiAnimation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEnedisDialogOpen, setIsEnedisDialogOpen] = useState(false);
  const [newAnimation, setNewAnimation] = useState<NewAnimation>({
    name: "",
    category: "form",
    description: "",
    enabled: true,
    cssClass: "",
    duration: 1000
  });
  
  // Récupérer les animations UI
  const { 
    data: animations, 
    isLoading, 
    error,
    refetch 
  } = useQuery<UiAnimation[]>({
    queryKey: ['/api/ui-animations'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Mutation pour activer/désactiver une animation
  const toggleAnimationMutation = useMutation({
    mutationFn: async (animationId: number) => {
      const response = await apiRequest('POST', `/api/ui-animations/${animationId}/toggle`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-animations'] });
      toast({
        title: "Animation mise à jour",
        description: "Le statut de l'animation a été modifié avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour créer une nouvelle animation
  const createAnimationMutation = useMutation({
    mutationFn: async (data: NewAnimation) => {
      const response = await apiRequest('POST', '/api/ui-animations', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-animations'] });
      setIsCreating(false);
      setNewAnimation({
        name: "",
        category: "form",
        description: "",
        enabled: true,
        cssClass: "",
        duration: 1000
      });
      toast({
        title: "Animation créée",
        description: "La nouvelle animation a été créée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour une animation
  const updateAnimationMutation = useMutation({
    mutationFn: async (data: UiAnimation) => {
      const response = await apiRequest('PUT', `/api/ui-animations/${data.id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-animations'] });
      setSelectedAnimation(null);
      toast({
        title: "Animation mise à jour",
        description: "L'animation a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une animation
  const deleteAnimationMutation = useMutation({
    mutationFn: async (animationId: number) => {
      const response = await apiRequest('DELETE', `/api/ui-animations/${animationId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-animations'] });
      setSelectedAnimation(null);
      toast({
        title: "Animation supprimée",
        description: "L'animation a été supprimée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour réinitialiser toutes les animations
  const resetAnimationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ui-animations/reset');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la réinitialisation");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Animations réinitialisées",
        description: data.message || "Les animations ont été réinitialisées avec succès. Redémarrez l'application pour appliquer les changements.",
      });
      // Ne pas invalider la requête car nous devons redémarrer le serveur
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour appliquer l'animation Enedis améliorée
  const applyEnedisAnimationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ui-animations/apply-enedis');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'application de l'animation Enedis");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ui-animations'] });
      toast({
        title: "Animation Enedis appliquée",
        description: data.message || "L'animation Enedis améliorée a été appliquée avec succès sur tout le site.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fonction pour basculer l'état activé/désactivé d'une animation
  const toggleAnimation = (animationId: number) => {
    toggleAnimationMutation.mutate(animationId);
  };

  // Fonction pour créer une nouvelle animation
  const handleCreateAnimation = () => {
    createAnimationMutation.mutate(newAnimation);
  };

  // Fonction pour mettre à jour une animation
  const handleUpdateAnimation = () => {
    if (selectedAnimation) {
      updateAnimationMutation.mutate(selectedAnimation);
    }
  };

  // Fonction pour supprimer une animation
  const handleDeleteAnimation = (animationId: number) => {
    deleteAnimationMutation.mutate(animationId);
  };

  // Fonction pour prévisualiser une animation
  const previewAnimation = (animation: UiAnimation | string) => {
    const targetElement = document.getElementById('animation-preview-target');
    if (targetElement) {
      // Si animation est une chaîne de caractères, on l'applique directement comme classe CSS
      if (typeof animation === 'string') {
        // Réinitialiser les animations en retirant et réappliquant la classe
        targetElement.className = 'h-6 w-6 bg-blue-500 rounded-full';
        setTimeout(() => {
          targetElement.className = `h-6 w-6 bg-blue-500 rounded-full ${animation}`;
        }, 50);
        return;
      }
      
      // Si c'est un objet animation avec une classe CSS, on l'applique directement
      if (animation.cssClass) {
        // Réinitialiser les animations en retirant et réappliquant la classe
        targetElement.className = 'h-6 w-6 bg-blue-500 rounded-full';
        setTimeout(() => {
          targetElement.className = `h-6 w-6 bg-blue-500 rounded-full ${animation.cssClass}`;
        }, 50);
      } 
      // Sinon, on va rediriger vers la page de prévisualisation avec l'ID de l'animation
      else {
        window.open(`/admin/animation-preview?id=${animation.id}`, '_blank');
      }
    }
  };

  // Filtrer les animations en fonction des critères sélectionnés
  const filteredAnimations = animations 
    ? animations.filter(animation => {
        // Filtre par recherche
        const matchesSearch = searchTerm === "" || 
          animation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animation.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtre par catégorie
        const matchesCategory = activeCategory === "all" || animation.category === activeCategory;
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Liste des catégories d'animations
  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "form", label: "Formulaire" },
    { value: "loading", label: "Chargement" },
    { value: "payment", label: "Paiement" },
    { value: "transition", label: "Transition" },
    { value: "startup", label: "Démarrage" },
    { value: "button", label: "Bouton" },
    { value: "notification", label: "Notification" },
  ];

  return (
    <AdminLayout title="Animations" description="Configuration des animations de l'interface">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Animations de l'interface</h1>
            <p className="text-muted-foreground">
              Gérez les animations de l'interface utilisateur
            </p>
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une animation..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Link href="/admin/animation-preview">
              <Button variant="outline" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Prévisualiser</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            
            {/* Dialogue de réinitialisation des animations */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Réinitialiser toutes les animations</DialogTitle>
                  <DialogDescription>
                    Cette action va supprimer toutes les animations personnalisées et recréer les animations par défaut au prochain redémarrage de l'application.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center p-3 space-x-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">Cette action est irréversible et nécessite un redémarrage du serveur.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Annuler</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => resetAnimationsMutation.mutate()}
                    disabled={resetAnimationsMutation.isPending}
                  >
                    {resetAnimationsMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Dialogue pour appliquer l'animation Enedis améliorée */}
            <Dialog open={isEnedisDialogOpen} onOpenChange={setIsEnedisDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200">
                  <Zap className="h-4 w-4 mr-2" />
                  Animation Enedis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Appliquer l'animation Enedis améliorée</DialogTitle>
                  <DialogDescription>
                    Cette action va configurer l'animation Enedis améliorée avec logo, certifications et badges de confiance sur l'ensemble du site.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center p-3 space-x-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">L'animation Enedis améliorée inclut :</p>
                      <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
                        <li>Logo officiel Enedis</li>
                        <li>Certifications (ISO 9001, 24/7, RGPD)</li>
                        <li>Badges de confiance</li>
                        <li>Messages rassurants sur les services Enedis</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      applyEnedisAnimationMutation.mutate();
                      setIsEnedisDialogOpen(false);
                    }}
                    disabled={applyEnedisAnimationMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {applyEnedisAnimationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Application en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Appliquer sur tout le site
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle animation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle animation</DialogTitle>
                  <DialogDescription>
                    Configurez les détails de la nouvelle animation pour l'interface utilisateur.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Nom de l'animation</Label>
                      <Input 
                        id="new-name" 
                        value={newAnimation.name}
                        onChange={(e) => setNewAnimation({...newAnimation, name: e.target.value})}
                        placeholder="Ex: Bouton électrique"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-category">Catégorie</Label>
                      <Select 
                        value={newAnimation.category}
                        onValueChange={(value) => setNewAnimation({...newAnimation, category: value})}
                      >
                        <SelectTrigger id="new-category">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="form">Formulaire</SelectItem>
                          <SelectItem value="loading">Chargement</SelectItem>
                          <SelectItem value="payment">Paiement</SelectItem>
                          <SelectItem value="transition">Transition</SelectItem>
                          <SelectItem value="startup">Démarrage</SelectItem>
                          <SelectItem value="button">Bouton</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Input 
                      id="new-description" 
                      value={newAnimation.description}
                      onChange={(e) => setNewAnimation({...newAnimation, description: e.target.value})}
                      placeholder="Décrivez brièvement l'animation et son utilisation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-css-class">Classe CSS</Label>
                    <Input 
                      id="new-css-class" 
                      value={newAnimation.cssClass}
                      onChange={(e) => setNewAnimation({...newAnimation, cssClass: e.target.value})}
                      placeholder="Ex: animate-pulse"
                    />
                    <p className="text-sm text-muted-foreground">
                      Entrez la classe CSS de l'animation (classes Tailwind ou personnalisées)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-duration">Durée (ms)</Label>
                      <Input 
                        id="new-duration" 
                        type="number"
                        value={newAnimation.duration}
                        onChange={(e) => setNewAnimation({...newAnimation, duration: parseInt(e.target.value) || 0})}
                        placeholder="1000"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch 
                        id="new-enabled" 
                        checked={newAnimation.enabled}
                        onCheckedChange={(checked) => setNewAnimation({...newAnimation, enabled: checked})}
                      />
                      <Label htmlFor="new-enabled">Activer cette animation</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateAnimation}
                    disabled={!newAnimation.name || !newAnimation.cssClass || createAnimationMutation.isPending}
                  >
                    {createAnimationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Créer l'animation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">Liste des animations</TabsTrigger>
              <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
            </TabsList>
            
            <Select
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="list" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Une erreur est survenue lors du chargement des animations.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAnimations.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">Aucune animation trouvée.</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnimations.map((animation) => (
                  <Card key={animation.id} className={animation.enabled ? "" : "opacity-60"}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{animation.name}</CardTitle>
                          <CardDescription>
                            {animation.description}
                          </CardDescription>
                        </div>
                        <Switch 
                          checked={animation.enabled}
                          onCheckedChange={() => toggleAnimation(animation.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Catégorie:</span>
                          <Badge variant="outline">
                            {categories.find(c => c.value === animation.category)?.label || animation.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Classe CSS:</span>
                          <code className="bg-muted px-1 rounded text-xs font-mono">{animation.cssClass}</code>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Durée:</span>
                          <span>{animation.duration}ms</span>
                        </div>
                        
                        <div className="flex justify-center mt-4">
                          <div className={`h-6 w-6 bg-blue-500 rounded-full ${animation.enabled ? animation.cssClass : ""}`} />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t pt-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => previewAnimation(animation)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAnimation(animation)}
                        >
                          <PencilLine className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteAnimation(animation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Prévisualisation des animations</CardTitle>
                <CardDescription>
                  Testez les différentes animations pour voir leur rendu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid place-items-center min-h-[200px]">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div id="animation-preview-target" className="h-6 w-6 bg-blue-500 rounded-full" />
                      <p className="text-center text-sm text-muted-foreground">
                        Cliquez sur "Prévisualiser" pour une animation spécifique dans l'onglet Liste,<br />
                        ou essayez les exemples ci-dessous.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewAnimation("animate-ping")}
                      >
                        Ping
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewAnimation("animate-pulse")}
                      >
                        Pulse
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewAnimation("animate-bounce")}
                      >
                        Bounce
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewAnimation("animate-spin")}
                      >
                        Spin
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewAnimation("animate-[wiggle_1s_ease-in-out_infinite]")}
                      >
                        Wiggle
                      </Button>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Link href="/admin/animation-preview">
                        <Button variant="default" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Voir toutes les animations
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Documentation des animations</CardTitle>
                <CardDescription>
                  Guide d'utilisation et référence des classes d'animation disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Comment utiliser les animations ?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Les animations peuvent être activées ou désactivées depuis cette interface. Lorsqu'une animation est désactivée,
                        elle ne sera pas appliquée dans l'interface utilisateur, même si le code tente de l'utiliser.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pour ajouter une nouvelle animation, vous pouvez utiliser des classes CSS Tailwind existantes ou créer vos propres 
                        animations personnalisées en CSS.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Animations Tailwind préinstallées</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li><code className="bg-muted px-1 rounded">animate-spin</code> - Rotation continue (360°)</li>
                        <li><code className="bg-muted px-1 rounded">animate-ping</code> - Effet d'impulsion qui grandit et s'estompe</li>
                        <li><code className="bg-muted px-1 rounded">animate-pulse</code> - Pulsation douce (changement d'opacité)</li>
                        <li><code className="bg-muted px-1 rounded">animate-bounce</code> - Effet de rebond vertical</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Animations personnalisées</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Vous pouvez créer des animations personnalisées en utilisant la syntaxe suivante :
                      </p>
                      <code className="bg-muted p-2 block rounded text-xs font-mono mb-2">
                        animate-[nom_durée_timing-function_itération]
                      </code>
                      <p className="text-sm text-muted-foreground">
                        Exemple : <code className="bg-muted px-1 rounded">animate-[wiggle_1s_ease-in-out_infinite]</code>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Catégories d'animations</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li><strong>Formulaire</strong> - Animations pour les champs et soumissions de formulaires</li>
                        <li><strong>Chargement</strong> - Indicateurs de chargement et attente</li>
                        <li><strong>Paiement</strong> - Animations spécifiques au processus de paiement</li>
                        <li><strong>Transition</strong> - Effets de transition entre les pages</li>
                        <li><strong>Démarrage</strong> - Animations lors du démarrage de l'application</li>
                        <li><strong>Bouton</strong> - Effets pour les boutons et contrôles interactifs</li>
                        <li><strong>Notification</strong> - Animations pour les alertes et notifications</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogue de modification d'animation */}
      {selectedAnimation && (
        <Dialog open={!!selectedAnimation} onOpenChange={(open) => !open && setSelectedAnimation(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'animation</DialogTitle>
              <DialogDescription>
                Mettez à jour les détails de l'animation "{selectedAnimation.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l'animation</Label>
                  <Input 
                    id="edit-name" 
                    value={selectedAnimation.name}
                    onChange={(e) => setSelectedAnimation({...selectedAnimation, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Catégorie</Label>
                  <Select 
                    value={selectedAnimation.category}
                    onValueChange={(value) => setSelectedAnimation({...selectedAnimation, category: value})}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">Formulaire</SelectItem>
                      <SelectItem value="loading">Chargement</SelectItem>
                      <SelectItem value="payment">Paiement</SelectItem>
                      <SelectItem value="transition">Transition</SelectItem>
                      <SelectItem value="startup">Démarrage</SelectItem>
                      <SelectItem value="button">Bouton</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={selectedAnimation.description}
                  onChange={(e) => setSelectedAnimation({...selectedAnimation, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-css-class">Classe CSS</Label>
                <Input 
                  id="edit-css-class" 
                  value={selectedAnimation.cssClass}
                  onChange={(e) => setSelectedAnimation({...selectedAnimation, cssClass: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Durée (ms)</Label>
                  <Input 
                    id="edit-duration" 
                    type="number"
                    value={selectedAnimation.duration}
                    onChange={(e) => setSelectedAnimation({...selectedAnimation, duration: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch 
                    id="edit-enabled" 
                    checked={selectedAnimation.enabled}
                    onCheckedChange={(checked) => setSelectedAnimation({...selectedAnimation, enabled: checked})}
                  />
                  <Label htmlFor="edit-enabled">Activer cette animation</Label>
                </div>
              </div>
              <div className="pt-4 flex justify-center">
                <div className="p-4 border rounded-md bg-muted/50">
                  <p className="text-sm text-center mb-2">Prévisualisation</p>
                  <div className="flex justify-center">
                    <div className={`h-6 w-6 bg-blue-500 rounded-full ${selectedAnimation.cssClass}`} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedAnimation(null)}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteAnimation(selectedAnimation.id)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button 
                onClick={handleUpdateAnimation}
                disabled={!selectedAnimation.name || !selectedAnimation.cssClass || updateAnimationMutation.isPending}
              >
                {updateAnimationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}