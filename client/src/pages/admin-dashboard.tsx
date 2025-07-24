import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceRequest, User, USER_ROLES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  LogOut, 
  Search, 
  RefreshCw, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ListFilter,
  Calendar,
  MapPin,
  Bolt,
  Users,
  UserPlus,
  Edit,
  Trash,
  UserCheck,
  ShieldAlert,
  Briefcase,
  UserCog
} from "lucide-react";

// Type pour les rôles utilisateurs
type UserRole = "admin" | "manager" | "traiteur";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Statuses with their colors
const statusMap: Record<string, { label: string, color: string }> = {
  pending: { 
    label: "En attente", 
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" 
  },
  in_progress: { 
    label: "En cours", 
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200" 
  },
  completed: { 
    label: "Terminé", 
    color: "bg-green-100 text-green-800 hover:bg-green-200" 
  },
  cancelled: { 
    label: "Annulé", 
    color: "bg-red-100 text-red-800 hover:bg-red-200" 
  }
};

// Format date function
function formatDate(dateString: string | Date) {
  if (!dateString) return "N/A";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Composant de carte d'analyse
interface AnalyseCardProps {
  title: string;
  description: string;
  action: string;
}

function AnalyseCard({ title, description, action }: AnalyseCardProps) {
  const { toast } = useToast();
  const [selectedRef, setSelectedRef] = useState("");
  
  // Mutation pour exécuter l'analyse
  const analyseMutation = useMutation({
    mutationFn: async () => {
      if (action === "generateResponse" && !selectedRef) {
        throw new Error("Veuillez sélectionner une référence de demande");
      }
      
      const endpoint = action === "analyzeRecent" 
        ? "/api/admin/analyze-requests"
        : action === "categorize"
          ? "/api/admin/categorize-requests"
          : `/api/admin/generate-response/${selectedRef}`;
          
      const response = await apiRequest("POST", endpoint);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opération réussie",
        description: "L'analyse a été effectuée avec succès",
        variant: "default",
      });
      
      // Actualiser les données
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Échec de l'opération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        {action === "generateResponse" && (
          <Input
            placeholder="Référence de la demande"
            className="mb-2"
            value={selectedRef}
            onChange={(e) => setSelectedRef(e.target.value)}
          />
        )}
        
        <Button 
          onClick={() => analyseMutation.mutate()}
          disabled={analyseMutation.isPending}
          variant="default"
          size="sm"
          className="w-full"
        >
          {analyseMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            "Exécuter"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: USER_ROLES.AGENT as "admin" | "manager" | "agent"
  });
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      toast({
        title: "Accès refusé",
        description: "Veuillez vous connecter pour accéder au tableau de bord",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);
  
  // Get service requests
  // Get service requests
  const { 
    data: serviceRequests, 
    isLoading, 
    error,
    refetch
  } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
  });
  
  // Get users for the users tab
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
  });
  
  // Mutation pour désactiver un utilisateur
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur désactivé",
        description: "L'utilisateur a été désactivé avec succès",
        variant: "default",
      });
      
      // Actualiser la liste des utilisateurs
      refetchUsers();
      
      // Réinitialiser l'utilisateur sélectionné
      setUserToDeactivate(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la désactivation de l'utilisateur",
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number, userData: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès",
        variant: "default",
      });
      
      // Actualiser la liste des utilisateurs
      refetchUsers();
      
      // Réinitialiser l'utilisateur sélectionné
      setUserToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour de l'utilisateur",
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour créer un nouvel utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été créé avec succès",
        variant: "default",
      });
      
      // Actualiser la liste des utilisateurs
      refetchUsers();
      
      // Réinitialiser le formulaire
      setNewUser({
        username: "",
        password: "",
        fullName: "",
        email: "",
        role: USER_ROLES.AGENT as "admin" | "manager" | "agent"
      });
      
      // Fermer la modal
      setShowNewUserDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'utilisateur",
        variant: "destructive",
      });
    },
  });
  
  // Fonction pour réactiver un utilisateur
  const handleReactivateUser = (user: User) => {
    updateUserMutation.mutate({ 
      id: user.id, 
      userData: { active: true } 
    });
  };
  
  // Fonction pour désactiver un utilisateur
  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user);
  };
  
  // Fonction pour confirmer la désactivation
  const confirmDeactivateUser = () => {
    if (userToDeactivate) {
      deactivateUserMutation.mutate(userToDeactivate.id);
    }
  };
  
  // Fonction pour éditer un utilisateur
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
  };

  // Filter service requests when search term changes
  useEffect(() => {
    if (!serviceRequests) return;
    
    if (!searchTerm) {
      setFilteredRequests(serviceRequests);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = serviceRequests.filter(req => 
      req.name.toLowerCase().includes(lowerSearchTerm) || 
      req.referenceNumber.toLowerCase().includes(lowerSearchTerm) || 
      req.email.toLowerCase().includes(lowerSearchTerm) || 
      req.phone.toLowerCase().includes(lowerSearchTerm) || 
      req.address.toLowerCase().includes(lowerSearchTerm) || 
      req.city.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredRequests(filtered);
  }, [searchTerm, serviceRequests]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      variant: "default",
    });
  };

  // Stats data
  const stats = {
    total: filteredRequests?.length || 0,
    pending: filteredRequests?.filter(req => req.status === "pending").length || 0,
    inProgress: filteredRequests?.filter(req => req.status === "in_progress").length || 0,
    completed: filteredRequests?.filter(req => req.status === "completed").length || 0,
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Bolt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Tableau de bord administrateur
                </h1>
                <p className="text-slate-600 mt-1">Gestion des demandes de raccordement électrique Enedis</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => window.open("/", "_blank")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Bolt className="h-4 w-4 mr-2" />
                Voir le site client
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/logout")}
                className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total des demandes</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-slate-500">Toutes demandes confondues</div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">En attente</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-amber-500">Nécessitent une action</div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">En cours</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-blue-500">En cours de traitement</div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Terminées</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.completed}</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-emerald-500">Demandes résolues</div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      
        {/* Search & Filter */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, référence, email, téléphone..."
                  className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => refetch()}
                  className="h-12 px-6 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-12 px-6 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <ListFilter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      
      {/* Modales de dialogue */}
      {/* Dialogue de confirmation de désactivation */}
      <Dialog 
        open={userToDeactivate !== null} 
        onOpenChange={(open) => !open && setUserToDeactivate(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Désactiver l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désactiver cet utilisateur ? Il ne pourra plus se connecter à l'application.
            </DialogDescription>
          </DialogHeader>
          
          {userToDeactivate && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium">{userToDeactivate.fullName}</p>
              <p className="text-sm text-gray-600">{userToDeactivate.email}</p>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDeactivateUser}
              disabled={deactivateUserMutation.isPending}
            >
              {deactivateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Désactivation...
                </>
              ) : (
                "Désactiver"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de création d'un nouvel utilisateur */}
      <Dialog
        open={showNewUserDialog}
        onOpenChange={setShowNewUserDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouvel utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                autoComplete="off"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "manager" | "agent") => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_ROLES.ADMIN}>Administrateur</SelectItem>
                  <SelectItem value={USER_ROLES.MANAGER}>Manager</SelectItem>
                  <SelectItem value={USER_ROLES.AGENT}>Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button 
              type="button"
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={createUserMutation.isPending || 
                !newUser.username || 
                !newUser.password || 
                !newUser.fullName || 
                !newUser.email
              }
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'édition d'utilisateur */}
      <Dialog 
        open={userToEdit !== null} 
        onOpenChange={(open) => !open && setUserToEdit(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          {userToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  defaultValue={userToEdit.fullName}
                  onChange={(e) => {
                    setUserToEdit({
                      ...userToEdit,
                      fullName: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userToEdit.email}
                  onChange={(e) => {
                    setUserToEdit({
                      ...userToEdit,
                      email: e.target.value
                    });
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  defaultValue={userToEdit.role}
                  onValueChange={(value: "admin" | "manager" | "traiteur") => {
                    setUserToEdit({
                      ...userToEdit,
                      role: value
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.ADMIN}>Administrateur</SelectItem>
                    <SelectItem value={USER_ROLES.MANAGER}>Manager</SelectItem>
                    <SelectItem value={USER_ROLES.AGENT}>Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button 
              type="button"
              onClick={() => {
                if (userToEdit) {
                  updateUserMutation.mutate({
                    id: userToEdit.id,
                    userData: {
                      fullName: userToEdit.fullName,
                      email: userToEdit.email,
                      role: userToEdit.role
                    }
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tabs and Data */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle>Gestion des demandes</CardTitle>
          <CardDescription>
            Gérez les demandes de raccordement électrique et exécutez des analyses intelligentes
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="demandes" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-2 mx-4">
            <TabsTrigger value="demandes">Liste des demandes</TabsTrigger>
            <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
            <TabsTrigger value="analyses">Analyses Claude</TabsTrigger>
            <TabsTrigger value="automatisation">Automatisation</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demandes" className="border-none p-0 pt-2">
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-8 text-center">
                  <div>
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-600">Une erreur est survenue lors du chargement des données</p>
                    <Button variant="outline" className="mt-2" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : filteredRequests?.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-center">
                  <div>
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Aucune demande à afficher</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto max-h-[calc(100vh-22rem)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests?.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.referenceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.name}</p>
                              <p className="text-sm text-gray-500">{request.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm">
                                {formatDistanceToNow(new Date(request.createdAt), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm">{request.city} ({request.postalCode})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.requestType === "new_connection" && "Nouveau"}
                              {request.requestType === "power_upgrade" && "Augmentation"}
                              {request.requestType === "temporary_connection" && "Temporaire"}
                              {request.requestType === "relocation" && "Déplacement"}
                              {request.requestType === "technical_visit" && "Visite"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusMap[request.status]?.color || "bg-gray-100"}>
                              {statusMap[request.status]?.label || request.status}
                            </Badge>
                            {request.category && (
                              <Badge variant="outline" className="ml-2">
                                {request.category === 'high_priority' && 'Priorité haute'}
                                {request.category === 'urgent' && 'Urgent'}
                                {request.category === 'complex' && 'Complexe'}
                                {request.category === 'standard' && 'Standard'}
                                {!['high_priority', 'urgent', 'complex', 'standard'].includes(request.category) && request.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    Détails
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Détails de la demande</DialogTitle>
                                    <DialogDescription>
                                      Référence: {request.referenceNumber}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-base font-semibold mb-2 text-primary">Informations du client</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Nom:</p>
                                            <p className="text-sm font-medium">{request.name}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Email:</p>
                                            <p className="text-sm">{request.email}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Téléphone:</p>
                                            <p className="text-sm">{request.phone}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Client:</p>
                                            <p className="text-sm">{request.clientType === "particulier" ? "Particulier" : request.clientType === "professionnel" ? "Professionnel" : "Collectivité"}</p>
                                          </div>
                                          {request.company && (
                                            <div className="grid grid-cols-2">
                                              <p className="text-sm text-gray-500">Société:</p>
                                              <p className="text-sm">{request.company}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-base font-semibold mb-2 text-primary">Adresse du projet</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Adresse:</p>
                                            <p className="text-sm">{request.address}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Code postal:</p>
                                            <p className="text-sm">{request.postalCode}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Ville:</p>
                                            <p className="text-sm">{request.city}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-base font-semibold mb-2 text-primary">Détails techniques</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Type de demande:</p>
                                            <p className="text-sm">{
                                              request.requestType === "new_connection" ? "Nouveau raccordement" :
                                              request.requestType === "power_upgrade" ? "Augmentation de puissance" :
                                              request.requestType === "temporary_connection" ? "Raccordement temporaire" :
                                              request.requestType === "relocation" ? "Déplacement d'ouvrage" :
                                              "Visite technique"
                                            }</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Type de branchement:</p>
                                            <p className="text-sm">{
                                              request.buildingType === "individual_house" ? "Maison individuelle" :
                                              request.buildingType === "apartment_building" ? "Immeuble collectif" :
                                              request.buildingType === "office_building" ? "Immeuble de bureaux" :
                                              request.buildingType === "commercial" ? "Local commercial" :
                                              "Autre"
                                            }</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Puissance:</p>
                                            <p className="text-sm">{request.powerRequired} kVA ({request.phaseType === "monophase" ? "Monophasée" : "Triphasée"})</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Délai souhaité:</p>
                                            <p className="text-sm">{request.desiredCompletionDate || "Non spécifié"}</p>
                                          </div>
                                          <div className="grid grid-cols-2">
                                            <p className="text-sm text-gray-500">Statut du projet:</p>
                                            <p className="text-sm">{
                                              request.projectStatus === "planning" ? "En phase de planification" :
                                              request.projectStatus === "permit_pending" ? "Permis déposé" :
                                              request.projectStatus === "permit_approved" ? "Permis approuvé" :
                                              request.projectStatus === "construction_started" ? "Construction démarrée" :
                                              request.projectStatus === "construction_completed" ? "Construction terminée" :
                                              "Non spécifié"
                                            }</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-base font-semibold mb-2 text-primary">Commentaires</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                          <p className="text-sm whitespace-pre-wrap">{request.comments || "Aucun commentaire"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter className="mt-6">
                                    <DialogClose asChild>
                                      <Button variant="outline">Fermer</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Traiter
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          {/* Onglet Utilisateurs */}
          <TabsContent value="utilisateurs" className="border-none p-0 pt-2">
            <CardContent>
              <div className="space-y-6 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Gestion des utilisateurs</h3>
                  <Button onClick={() => setShowNewUserDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouvel utilisateur
                  </Button>
                </div>
                
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : usersError ? (
                  <div className="flex justify-center items-center py-8 text-center">
                    <div>
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-gray-600">Une erreur est survenue lors du chargement des utilisateurs</p>
                      <Button variant="outline" className="mt-2" onClick={() => refetchUsers()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Réessayer
                      </Button>
                    </div>
                  </div>
                ) : !users || users.length === 0 ? (
                  <div className="flex justify-center items-center py-8 text-center">
                    <div>
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Aucun utilisateur à afficher</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[calc(100vh-22rem)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {users.map((user) => (
                        <Card key={user.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                {user.role === USER_ROLES.ADMIN && (
                                  <div className="p-2 rounded-full bg-red-100">
                                    <ShieldAlert className="h-5 w-5 text-red-600" />
                                  </div>
                                )}
                                {user.role === USER_ROLES.MANAGER && (
                                  <div className="p-2 rounded-full bg-blue-100">
                                    <UserCog className="h-5 w-5 text-blue-600" />
                                  </div>
                                )}
                                {user.role === USER_ROLES.AGENT && (
                                  <div className="p-2 rounded-full bg-green-100">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                  </div>
                                )}
                                <div>
                                  <CardTitle className="text-base">{user.fullName}</CardTitle>
                                  <p className="text-sm text-gray-500">{user.username}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={
                                user.role === USER_ROLES.ADMIN 
                                  ? "bg-red-50 text-red-700"
                                  : user.role === USER_ROLES.MANAGER
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-green-50 text-green-700"
                              }>
                                {user.role === USER_ROLES.ADMIN && "Admin"}
                                {user.role === USER_ROLES.MANAGER && "Manager"}
                                {user.role === USER_ROLES.AGENT && "Agent"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Email:</span>
                                <span className="text-sm">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Status:</span>
                                <Badge variant={user.active ? "default" : "destructive"} className="text-xs">
                                  {user.active ? "Actif" : "Inactif"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Éditer
                              </Button>
                              {user.active && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeactivateUser(user)}
                                >
                                  <Trash className="h-3.5 w-3.5 mr-1" />
                                  Désactiver
                                </Button>
                              )}
                              {!user.active && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => handleReactivateUser(user)}
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  Réactiver
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Onglet Analyses */}
          <TabsContent value="analyses" className="border-none p-0 pt-2">
            <CardContent>
              <div className="space-y-6 p-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Analyses avec Claude IA</h3>
                  <p className="text-gray-600 mb-4">
                    Utilisez l'intelligence artificielle Claude pour analyser les demandes de raccordement
                    et obtenir des insights précieux sur vos clients et leurs besoins.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnalyseCard 
                      title="Analyse des demandes récentes" 
                      description="Analyse les dernières demandes reçues pour en extraire des insights." 
                      action="analyzeRecent"
                    />
                    <AnalyseCard 
                      title="Catégorisation automatique" 
                      description="Catégorise les demandes par priorité et complexité." 
                      action="categorize"
                    />
                    <AnalyseCard 
                      title="Génération de réponses" 
                      description="Génère des réponses personnalisées pour les clients." 
                      action="generateResponse"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Demandes analysées</h3>
                  
                  <div className="overflow-auto max-h-[calc(100vh-38rem)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Analyse</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests?.filter(req => req.aiAnalysis || req.customerResponse || req.priceEstimate).map((request) => (
                          <TableRow key={`analysis-${request.id}`}>
                            <TableCell className="font-medium">
                              {request.referenceNumber}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.name}</p>
                                <p className="text-sm text-gray-500">{request.clientType}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.category ? (
                                <Badge variant="outline">
                                  {request.category === 'high_priority' && 'Priorité haute'}
                                  {request.category === 'urgent' && 'Urgent'}
                                  {request.category === 'complex' && 'Complexe'}
                                  {request.category === 'standard' && 'Standard'}
                                  {!['high_priority', 'urgent', 'complex', 'standard'].includes(request.category) && request.category}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">Non catégorisé</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {request.aiAnalysis && (
                                  <Badge variant="secondary" className="bg-blue-50 hover:bg-blue-100 text-blue-700">
                                    Analyse
                                  </Badge>
                                )}
                                {request.priceEstimate && (
                                  <Badge variant="secondary" className="bg-green-50 hover:bg-green-100 text-green-700">
                                    Prix
                                  </Badge>
                                )}
                                {request.customerResponse && (
                                  <Badge variant="secondary" className="bg-purple-50 hover:bg-purple-100 text-purple-700">
                                    Réponse
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Voir l'analyse
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {(!filteredRequests || !filteredRequests.some(req => req.aiAnalysis || req.customerResponse || req.priceEstimate)) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              Aucune demande analysée pour le moment
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="automatisation" className="border-none p-0 pt-2">
            <CardContent>
              <div className="space-y-6 p-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Automatisation des traitements</h3>
                  <p className="text-gray-600 mb-4">
                    Configurez l'automatisation des analyses Claude pour traiter automatiquement les nouvelles demandes.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Analyse automatique</CardTitle>
                      <CardDescription>
                        Analyser automatiquement les nouvelles demandes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Activer l'analyse automatique</span>
                        <Button variant="outline" size="sm">
                          Activer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configuration avancée</CardTitle>
                      <CardDescription>
                        Paramètres d'automatisation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span>Analyser les demandes en attente</span>
                        <Button variant="outline" size="sm">
                          Exécuter maintenant
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fréquence d'analyse</span>
                        <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                          <option value="hourly">Toutes les heures</option>
                          <option value="daily">Tous les jours</option>
                          <option value="weekly">Toutes les semaines</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Journal des automatisations</CardTitle>
                    <CardDescription>
                      Historique des traitements automatiques
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-gray-500">
                      Aucune activité d'automatisation pour le moment
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Onglet Configuration */}
          <TabsContent value="configuration" className="border-none p-0 pt-2">
            <CardContent>
              <div className="space-y-6 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Configuration du système</h3>
                </div>

                {/* Sous-navigation pour la configuration */}
                <Tabs defaultValue="stripe" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-4">
                    <TabsTrigger value="stripe">Stripe</TabsTrigger>
                    <TabsTrigger value="email">Email/SMTP</TabsTrigger>
                    <TabsTrigger value="templates">Templates Email</TabsTrigger>
                    <TabsTrigger value="general">Général</TabsTrigger>
                  </TabsList>
                  
                  {/* Configuration Stripe */}
                  <TabsContent value="stripe" className="p-0">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                        <div className="text-blue-500 p-1 bg-blue-100 rounded-full mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Configuration de Stripe</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            Configurez vos clés API Stripe pour activer les paiements en ligne. Une fois configuré, vous pourrez
                            proposer des liens de paiement à vos clients.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stripe_secret_key">Clé Secrète Stripe</Label>
                          <div className="flex">
                            <Input
                              id="stripe_secret_key"
                              type="password"
                              placeholder="sk_test_..."
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon" className="ml-2 px-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 5H7V1H17V5Z"/><path d="M17 14V19H7V14"/><path d="M7 10V5H17V10"/><path d="M7 10H7.01"/><path d="M10 10H10.01"/><path d="M13 10H13.01"/><path d="M16 10H16.01"/></svg>
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">La clé secrète commence par sk_. Elle sera stockée de manière sécurisée.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="stripe_public_key">Clé Publique Stripe</Label>
                          <div className="flex">
                            <Input
                              id="stripe_public_key"
                              placeholder="pk_test_..."
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon" className="ml-2 px-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 5H7V1H17V5Z"/><path d="M17 14V19H7V14"/><path d="M7 10V5H17V10"/><path d="M7 10H7.01"/><path d="M10 10H10.01"/><path d="M13 10H13.01"/><path d="M16 10H16.01"/></svg>
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">La clé publique commence par pk_.</p>
                        </div>
                        
                        <div className="pt-4">
                          <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            Enregistrer les paramètres Stripe
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Configuration SMTP */}
                  <TabsContent value="email" className="p-0">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                        <div className="text-blue-500 p-1 bg-blue-100 rounded-full mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Configuration Email (SMTP)</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            Configurez vos paramètres SMTP pour envoyer des emails automatisés aux clients.
                            Vous pourrez choisir d'utiliser SendGrid ou votre propre serveur SMTP.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Type de service email</Label>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="email_type_smtp" name="email_type" value="smtp" className="h-4 w-4" defaultChecked />
                              <Label htmlFor="email_type_smtp" className="text-sm font-normal cursor-pointer">Serveur SMTP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="radio" id="email_type_sendgrid" name="email_type" value="sendgrid" className="h-4 w-4" />
                              <Label htmlFor="email_type_sendgrid" className="text-sm font-normal cursor-pointer">SendGrid</Label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Configuration SMTP */}
                        <div className="space-y-4 pt-2">
                          <h4 className="text-sm font-medium">Paramètres SMTP</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="smtp_host">Serveur SMTP</Label>
                              <Input id="smtp_host" placeholder="smtp.example.com" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="smtp_port">Port SMTP</Label>
                              <Input id="smtp_port" placeholder="587" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="smtp_user">Utilisateur SMTP</Label>
                              <Input id="smtp_user" placeholder="utilisateur@example.com" />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="smtp_pass">Mot de passe SMTP</Label>
                              <div className="flex">
                                <Input
                                  id="smtp_pass"
                                  type="password"
                                  placeholder="Mot de passe"
                                  className="flex-1"
                                />
                                <Button variant="outline" size="icon" className="ml-2 px-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 5H7V1H17V5Z"/><path d="M17 14V19H7V14"/><path d="M7 10V5H17V10"/><path d="M7 10H7.01"/><path d="M10 10H10.01"/><path d="M13 10H13.01"/><path d="M16 10H16.01"/></svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="smtp_secure">Sécurité</Label>
                            <Select>
                              <SelectTrigger id="smtp_secure">
                                <SelectValue placeholder="Choisir une option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tls">TLS</SelectItem>
                                <SelectItem value="ssl">SSL</SelectItem>
                                <SelectItem value="none">Aucun</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sender_email">Email de l'expéditeur</Label>
                            <Input id="sender_email" placeholder="contact@example.com" />
                            <p className="text-xs text-gray-500">Adresse email qui apparaîtra comme expéditeur des emails envoyés</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sender_name">Nom de l'expéditeur</Label>
                            <Input id="sender_name" placeholder="Service Raccordement" />
                            <p className="text-xs text-gray-500">Nom qui apparaîtra comme expéditeur des emails envoyés</p>
                          </div>
                        </div>
                        
                        {/* Configuration SendGrid */}
                        <div className="space-y-4 pt-2">
                          <h4 className="text-sm font-medium">Paramètres SendGrid</h4>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sendgrid_api_key">Clé API SendGrid</Label>
                            <div className="flex">
                              <Input
                                id="sendgrid_api_key"
                                type="password"
                                placeholder="SG.xxxxx..."
                                className="flex-1"
                              />
                              <Button variant="outline" size="icon" className="ml-2 px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 5H7V1H17V5Z"/><path d="M17 14V19H7V14"/><path d="M7 10V5H17V10"/><path d="M7 10H7.01"/><path d="M10 10H10.01"/><path d="M13 10H13.01"/><path d="M16 10H16.01"/></svg>
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">La clé API SendGrid commence par SG.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sendgrid_sender_email">Email de l'expéditeur (SendGrid)</Label>
                            <Input id="sendgrid_sender_email" placeholder="contact@example.com" />
                            <p className="text-xs text-gray-500">Adresse email vérifiée dans votre compte SendGrid</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sendgrid_sender_name">Nom de l'expéditeur (SendGrid)</Label>
                            <Input id="sendgrid_sender_name" placeholder="Service Raccordement" />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            Enregistrer les paramètres Email
                          </Button>
                          <Button variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15 6a2.83 2.83 0 0 1 4 4l-2 2m-9-5L4 3l14 14-4 4-14-14Z"/></svg>
                            Tester la connexion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Templates Email */}
                  <TabsContent value="templates" className="p-0">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                        <div className="text-blue-500 p-1 bg-blue-100 rounded-full mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Templates d'emails</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            Configurez les modèles d'emails automatisés envoyés aux clients à différentes étapes du processus.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Modèles disponibles</h4>
                          <Button variant="default" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                            Nouveau modèle
                          </Button>
                        </div>
                        
                        <div className="divide-y">
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Confirmation de demande</p>
                              <p className="text-sm text-gray-500">Envoyé après soumission du formulaire</p>
                            </div>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </div>
                          
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Lien de paiement</p>
                              <p className="text-sm text-gray-500">Email avec le lien de paiement</p>
                            </div>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </div>
                          
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Confirmation de paiement</p>
                              <p className="text-sm text-gray-500">Envoyé après paiement réussi</p>
                            </div>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </div>
                          
                          <div className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Rendez-vous planifié</p>
                              <p className="text-sm text-gray-500">Confirmation du rendez-vous avec Enedis</p>
                            </div>
                            <Button variant="outline" size="sm">Éditer</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Configuration Générale */}
                  <TabsContent value="general" className="p-0">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start gap-3">
                        <div className="text-blue-500 p-1 bg-blue-100 rounded-full mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Configuration générale</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            Paramètres généraux de l'application et options par défaut.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="site_name">Nom du site</Label>
                          <Input id="site_name" placeholder="Raccordement Électrique en Ligne" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="default_price">Prix par défaut (€)</Label>
                          <Input id="default_price" placeholder="129.80" />
                          <p className="text-xs text-gray-500">Montant par défaut pour les paiements (en euros)</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="claude_api_key">Clé API Claude (Anthropic)</Label>
                          <div className="flex">
                            <Input
                              id="claude_api_key"
                              type="password"
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon" className="ml-2 px-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 5H7V1H17V5Z"/><path d="M17 14V19H7V14"/><path d="M7 10V5H17V10"/><path d="M7 10H7.01"/><path d="M10 10H10.01"/><path d="M13 10H13.01"/><path d="M16 10H16.01"/></svg>
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Nécessaire pour les analyses IA et les fonctionnalités d'automatisation</p>
                        </div>
                        
                        <div className="pt-4">
                          <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            Enregistrer les paramètres généraux
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  </div>
  );
}