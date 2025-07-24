import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Info, Percent } from 'lucide-react';
import AdminLayout from "@/components/admin/admin-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle,
  XCircle, 
  Plus, 
  UserCog, 
  UserPlus, 
  Trash2, 
  Pencil,
  PenSquare, 
  Edit,
  User, 
  Users,
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Settings,
  Search,
  SlidersHorizontal,
  Check,
  X,
  RefreshCw,
  Loader2,
  AtSign,
  Send,
  KeyRound,
  AlertCircle,
  Minus,
  ChevronDown,
} from "lucide-react";

interface UserPermission {
  page: string;
  canView: boolean;
  canEdit: boolean;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: UserPermission[];
  // SMTP settings
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  // Commission settings
  commissionEnabled?: boolean;
  commissionRate?: number;
}

interface NewUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: string;
  active?: boolean;
  permissions?: UserPermission[];
  // SMTP settings
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpEnabled?: boolean;
  // Commission settings
  commissionEnabled?: boolean;
  commissionRate?: number;
  onboardingCompleted?: boolean;
}

// Interface pour une permission par défaut
interface DefaultPermission {
  page: string;
  canView: boolean;
  canEdit: boolean;
}

// Définition des permissions par défaut basées sur le rôle
const defaultPermissions: Record<string, DefaultPermission[]> = {
  admin: [
    { page: "dashboard", canView: true, canEdit: true },
    { page: "leads", canView: true, canEdit: true },
    { page: "tasks", canView: true, canEdit: true },
    { page: "calendar", canView: true, canEdit: true },
    { page: "communications", canView: true, canEdit: true },
    { page: "contacts", canView: true, canEdit: true },
    { page: "stats", canView: true, canEdit: true },
    { page: "configuration", canView: true, canEdit: true },
    { page: "users", canView: true, canEdit: true },
    { page: "payments", canView: true, canEdit: true },
  ],
  manager: [
    { page: "dashboard", canView: true, canEdit: true },
    { page: "leads", canView: true, canEdit: true },
    { page: "tasks", canView: true, canEdit: true },
    { page: "calendar", canView: true, canEdit: true },
    { page: "communications", canView: true, canEdit: true },
    { page: "contacts", canView: true, canEdit: true },
    { page: "stats", canView: true, canEdit: true },
    { page: "payments", canView: true, canEdit: true },
    // Aucun accès aux sections d'administration
    { page: "configuration", canView: false, canEdit: false },
    { page: "users", canView: false, canEdit: false },
    { page: "animations", canView: false, canEdit: false },
    { page: "settings", canView: false, canEdit: false },
  ],
  agent: [
    { page: "dashboard", canView: true, canEdit: false },
    { page: "leads", canView: true, canEdit: true },
    { page: "tasks", canView: true, canEdit: true },
    { page: "calendar", canView: true, canEdit: true },
    { page: "communications", canView: true, canEdit: true },
    { page: "contacts", canView: true, canEdit: true },
    { page: "stats", canView: true, canEdit: false },
    { page: "configuration", canView: false, canEdit: false },
    { page: "users", canView: false, canEdit: false },
    { page: "payments", canView: false, canEdit: false },
  ],
};

function getDefaultPermissions(role: string): UserPermission[] {
  return defaultPermissions[role] || defaultPermissions.agent;
}

// Schéma Zod pour la validation du formulaire de création d'utilisateur
const userSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().optional(),
  role: z.string(),
  active: z.boolean().optional(),
  permissions: z.array(z.object({
    page: z.string(),
    canView: z.boolean(),
    canEdit: z.boolean()
  })).optional(),
  // Paramètres SMTP
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFromEmail: z.string().email("Format d'email invalide").optional(),
  smtpEnabled: z.boolean().optional(),
  // Paramètres de commission
  commissionEnabled: z.boolean().optional(),
  commissionRate: z.number().optional(),
  onboardingCompleted: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Composant SimpleTooltip pour les tooltips
function SimpleTooltip({ content, children }: { content: string, children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white text-xs p-2 rounded">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Composant pour éditer les permissions d'un utilisateur
function PermissionsEditor({ 
  permissions, 
  onChange 
}: { 
  permissions: UserPermission[], 
  onChange: (permissions: UserPermission[]) => void 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((permission, index) => (
          <div key={permission.page} className="flex flex-col p-3 bg-white border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700 capitalize">
                {permission.page === "leads" ? "Demandes" : 
                permission.page === "tasks" ? "Tâches" :
                permission.page === "calendar" ? "Calendrier" :
                permission.page === "communications" ? "Communications" :
                permission.page === "contacts" ? "Contacts" :
                permission.page === "stats" ? "Statistiques" :
                permission.page === "payments" ? "Paiements" :
                permission.page === "configuration" ? "Configuration" :
                permission.page === "users" ? "Utilisateurs" : permission.page}
              </span>
              {permission.canView && permission.canEdit ? (
                <Badge className="bg-blue-500 hover:bg-blue-600">Tous droits</Badge>
              ) : permission.canView ? (
                <Badge className="bg-green-500 hover:bg-green-600">Lecture</Badge>
              ) : (
                <Badge variant="outline">Aucun accès</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`view-${index}`} 
                  checked={permission.canView}
                  onCheckedChange={(checked) => {
                    const updatedPermissions = [...permissions];
                    updatedPermissions[index] = {
                      ...permission,
                      canView: checked as boolean,
                      // Si on désactive la vue, on désactive aussi l'édition
                      canEdit: checked ? permission.canEdit : false,
                    };
                    onChange(updatedPermissions);
                  }}
                />
                <Label htmlFor={`view-${index}`} className="text-gray-600">
                  Afficher
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`edit-${index}`}
                  checked={permission.canEdit}
                  disabled={!permission.canView}
                  onCheckedChange={(checked) => {
                    const updatedPermissions = [...permissions];
                    updatedPermissions[index] = {
                      ...permission,
                      canEdit: checked as boolean,
                    };
                    onChange(updatedPermissions);
                  }}
                />
                <Label htmlFor={`edit-${index}`} className="text-gray-600">
                  Modifier
                </Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [tab, setTab] = useState("all");
  const [sortConfig, setSortConfig] = useState({ column: "createdAt", direction: "desc" });
  const [filterText, setFilterText] = useState("");
  
  const defaultSortConfig = { column: "createdAt", direction: "desc" };
  
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "manager":
        return "Responsable";
      case "agent":
        return "Agent commercial";
      default:
        return role;
    }
  };

  const createForm = useForm<NewUserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "agent",
      active: true,
      permissions: getDefaultPermissions("agent"),
      // Paramètres SMTP
      smtpEnabled: true,
      smtpHost: "s4015.fra1.stableserver.net",
      smtpPort: 465,
      smtpSecure: true,
      smtpFromEmail: "",
      // Paramètres de commission
      commissionEnabled: false,
      commissionRate: 0,
      onboardingCompleted: false,
    },
  });

  const editForm = useForm<NewUserData>({
    resolver: zodResolver(userSchema.partial({ password: true })),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "agent",
      active: true,
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Requête pour récupérer la liste des utilisateurs
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return await res.json();
    },
  });

  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUserData) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      setIsCreating(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<NewUserData> & { id: number }) => {
      const { id, ...rest } = userData;
      const res = await apiRequest("PUT", `/api/users/${id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      setSelectedUser(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      setIsDeleteConfirmOpen(false);
      setDeleteUserId(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour réinitialiser le mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const res = await apiRequest("POST", `/api/users/${userId}/reset-password`, { password });
      return res.ok;
    },
    onSuccess: () => {
      setIsResetPasswordOpen(false);
      resetPasswordForm.reset();
      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe a été réinitialisé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la réinitialisation du mot de passe: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Gestion de la soumission du formulaire de création
  const onCreateSubmit = (data: NewUserData) => {
    // Si l'email n'est pas défini pour le SMTP, on utilise l'email de l'utilisateur
    if (data.smtpEnabled && !data.smtpUser) {
      data.smtpUser = data.email;
    }
    
    // Si l'email d'expédition n'est pas défini, on utilise l'email de l'utilisateur
    if (data.smtpEnabled && !data.smtpFromEmail) {
      data.smtpFromEmail = data.email;
    }
    
    createUserMutation.mutate(data);
  };

  // Gestion de l'édition d'un utilisateur
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      role: user.role,
      active: user.active,
      permissions: user.permissions || getDefaultPermissions(user.role),
      // SMTP
      smtpEnabled: user.smtpEnabled,
      smtpHost: user.smtpHost,
      smtpPort: user.smtpPort,
      smtpSecure: user.smtpSecure,
      smtpUser: user.smtpUser,
      smtpPassword: "", // On ne récupère pas le mot de passe
      smtpFromEmail: user.smtpFromEmail,
      // Commission
      commissionEnabled: user.commissionEnabled,
      commissionRate: user.commissionRate,
    });
    setIsEditing(true);
  };

  // Gestion de la soumission du formulaire d'édition
  const onEditSubmit = (data: NewUserData) => {
    if (!selectedUser) return;
    
    // Si l'email n'est pas défini pour le SMTP, on utilise l'email de l'utilisateur
    if (data.smtpEnabled && !data.smtpUser) {
      data.smtpUser = data.email;
    }
    
    // Si l'email d'expédition n'est pas défini, on utilise l'email de l'utilisateur
    if (data.smtpEnabled && !data.smtpFromEmail) {
      data.smtpFromEmail = data.email;
    }
    
    // Si le mot de passe est vide, on le retire pour ne pas l'écraser
    if (!data.password) {
      const { password, ...rest } = data;
      updateUserMutation.mutate({ id: selectedUser.id, ...rest });
    } else {
      updateUserMutation.mutate({ id: selectedUser.id, ...data });
    }
  };

  // Gestion de la réinitialisation du mot de passe
  const handleResetPasswordClick = (user: UserData) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
    resetPasswordForm.reset({
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Gestion de la soumission du formulaire de réinitialisation du mot de passe
  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    if (!selectedUser) return;
    resetPasswordMutation.mutate({
      userId: selectedUser.id,
      password: data.newPassword,
    });
  };

  // Filtre des utilisateurs par rôle et texte de recherche
  const filteredUsers = users
    ? users
        .filter((user: UserData) => {
          if (tab === "all") return true;
          return user.role === tab;
        })
        .filter((user: UserData) => {
          if (!filterText) return true;
          const searchText = filterText.toLowerCase();
          return (
            user.username.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText) ||
            (user.fullName || "").toLowerCase().includes(searchText)
          );
        })
    : [];

  // Tri des utilisateurs
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const { column, direction } = sortConfig;
    
    let valueA = (a as any)[column];
    let valueB = (b as any)[column];
    
    // Conversions au besoin
    if (column === "createdAt" || column === "lastLogin") {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }
    
    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Fonction pour changer le tri
  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Génère les initiales d'un utilisateur pour l'avatar
  const getInitials = (user: UserData): string => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(name => name.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Mise à jour des permissions par défaut lors du changement de rôle
  useEffect(() => {
    const role = createForm.watch("role");
    if (role) {
      createForm.setValue("permissions", getDefaultPermissions(role));
    }
  }, [createForm.watch("role")]);

  // Filtre des utilisateurs en fonction de l'onglet sélectionné
  useEffect(() => {
    setSortConfig(defaultSortConfig);
  }, [tab]);

  return (
    <AdminLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Créez et gérez les utilisateurs du système
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={() => { 
                  setIsCreating(true);
                  createForm.reset({ 
                    username: "",
                    email: "",
                    password: "",
                    fullName: "",
                    role: "agent",
                    active: true,
                    permissions: getDefaultPermissions("agent"),
                    // SMTP
                    smtpEnabled: true,
                    smtpHost: "s4015.fra1.stableserver.net",
                    smtpPort: 465,
                    smtpSecure: true,
                    // Commission
                    commissionEnabled: false,
                    commissionRate: 0,
                    onboardingCompleted: false,
                  });
                }} 
                className="flex items-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                Créer un utilisateur
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-9"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
                  <TabsList className="w-full grid-cols-4">
                    <TabsTrigger value="all" className="gap-2">
                      <Users className="h-4 w-4" />
                      Tous
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger value="manager" className="gap-2">
                      <UserCog className="h-4 w-4" />
                      Responsables
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="gap-2">
                      <User className="h-4 w-4" />
                      Agents
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => handleSort("username")}
                        >
                          <div className="flex items-center gap-1">
                            Utilisateur
                            {sortConfig.column === "username" && (
                              sortConfig.direction === "asc" ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4 transform rotate-180" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => handleSort("role")}
                        >
                          <div className="flex items-center gap-1">
                            Rôle
                            {sortConfig.column === "role" && (
                              sortConfig.direction === "asc" ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4 transform rotate-180" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-blue-600 hidden md:table-cell"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center gap-1">
                            Email
                            {sortConfig.column === "email" && (
                              sortConfig.direction === "asc" ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4 transform rotate-180" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-blue-600 hidden md:table-cell"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Création
                            {sortConfig.column === "createdAt" && (
                              sortConfig.direction === "asc" ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4 transform rotate-180" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-blue-600 hidden lg:table-cell"
                          onClick={() => handleSort("lastLogin")}
                        >
                          <div className="flex items-center gap-1">
                            Dernière connexion
                            {sortConfig.column === "lastLogin" && (
                              sortConfig.direction === "asc" ? 
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronDown className="h-4 w-4 transform rotate-180" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedUsers.map((user: UserData) => (
                          <TableRow key={user.id} className={!user.active ? "opacity-60" : ""}>
                            <TableCell className="py-2">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className={`${
                                  user.role === "admin" 
                                    ? "bg-purple-100 text-purple-800" 
                                    : user.role === "manager"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {getInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="text-gray-900">{user.fullName || user.username}</span>
                                {user.fullName && <span className="text-xs text-gray-500">@{user.username}</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                user.role === "admin" 
                                  ? "purple" 
                                  : user.role === "manager"
                                  ? "blue"
                                  : "default"
                              } className="rounded-md">
                                {user.role === "admin" 
                                  ? "Administrateur" 
                                  : user.role === "manager"
                                  ? "Responsable"
                                  : "Agent commercial"
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1.5">
                                <AtSign className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-600">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 hidden md:table-cell">
                              {user.createdAt ? (
                                <div className="flex flex-col">
                                  <span>{format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr })}</span>
                                  <span className="text-xs">{format(new Date(user.createdAt), "HH:mm", { locale: fr })}</span>
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-gray-500 hidden lg:table-cell">
                              {user.lastLogin ? (
                                <div title={format(new Date(user.lastLogin), "dd/MM/yyyy HH:mm", { locale: fr })}>
                                  {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true, locale: fr })}
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <SimpleTooltip content="Modifier">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </SimpleTooltip>
                                
                                <SimpleTooltip content="Réinitialiser le mot de passe">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleResetPasswordClick(user)}
                                  >
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                </SimpleTooltip>
                                
                                <SimpleTooltip content="Supprimer">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setDeleteUserId(user.id);
                                      setIsDeleteConfirmOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </SimpleTooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de création d'utilisateur */}
      <Dialog open={isCreating} onOpenChange={(open) => !createUserMutation.isPending && setIsCreating(open)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Créer un nouvel utilisateur
            </DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur et configurez ses accès au système.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Notification d'arrivée
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Le nouvel utilisateur recevra un email de bienvenue avec ses informations de connexion et 
                      la configuration de sa boîte mail personnelle.
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1 mb-2">
                      <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 mt-0.5 text-blue-700" />
                        <span>Informations d'accès à la plateforme</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 mt-0.5 text-blue-700" />
                        <span>Configuration de messagerie automatique</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 mt-0.5 text-blue-700" />
                        <span>Informations du rôle et des permissions</span>
                      </li>
                    </ul>
                  </div>

                  <FormField
                    control={createForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Nom et prénom"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-1">
                            Nom d'utilisateur
                            <SimpleTooltip content="Identifiant unique utilisé pour la connexion">
                              <Info className="h-3.5 w-3.5 text-gray-500" />
                            </SimpleTooltip>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Nom d'utilisateur"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-1">
                            Email
                            <SimpleTooltip content="Adresse email utilisée pour les notifications et la récupération du compte">
                              <Info className="h-3.5 w-3.5 text-gray-500" />
                            </SimpleTooltip>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="email"
                              placeholder="utilisateur@exemple.com"
                              className="pl-9"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // En changeant l'email, on met à jour aussi l'email SMTP si activé
                                if (createForm.watch("smtpEnabled")) {
                                  createForm.setValue("smtpFromEmail", e.target.value);
                                  createForm.setValue("smtpUser", e.target.value);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-1">
                            Mot de passe
                            <SimpleTooltip content="Minimum 6 caractères. Un mot de passe fort est recommandé.">
                              <Info className="h-3.5 w-3.5 text-gray-500" />
                            </SimpleTooltip>
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="password"
                              placeholder="Mot de passe"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-1">
                            Rôle
                            <SimpleTooltip content="Détermine le niveau d'accès et les permissions de l'utilisateur">
                              <Info className="h-3.5 w-3.5 text-gray-500" />
                            </SimpleTooltip>
                          </span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            createForm.setValue("permissions", getDefaultPermissions(value));
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-purple-600" />
                                <span>Administrateur</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="manager">
                              <span className="flex items-center gap-2">
                                <UserCog className="h-4 w-4 text-blue-600" />
                                <span>Responsable</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="agent">
                              <span className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-600" />
                                <span>Agent commercial</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Définit les droits d'accès de l'utilisateur dans le système.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Compte actif</FormLabel>
                          <FormDescription>
                            Détermine si l'utilisateur peut se connecter au système.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Tabs defaultValue="permissions">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="permissions">Permissions</TabsTrigger>
                      <TabsTrigger value="smtp">Config SMTP</TabsTrigger>
                      <TabsTrigger value="email-preview" className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        Aperçu email
                      </TabsTrigger>
                      <TabsTrigger value="commission">Commission</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email-preview" className="py-4">
                      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Aperçu de l'email de bienvenue</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-5 overflow-auto max-h-[500px]">
                          <div className="mx-auto max-w-[550px]">
                            <div className="text-center mb-5">
                              <div className="inline-block bg-blue-600 text-white p-3 rounded-full mb-3">
                                <Mail className="h-6 w-6" />
                              </div>
                              <h2 className="text-xl font-bold text-blue-800">Bienvenue chez Raccordement Électrique</h2>
                              <p className="text-gray-600 mt-1">Votre compte a été créé avec succès</p>
                            </div>
                            
                            <div className="bg-gray-50 border rounded-lg p-5 mb-5">
                              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-1.5">
                                <User className="h-4 w-4 text-blue-600" />
                                Vos informations de connexion
                              </h3>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white rounded border">
                                  <span className="text-gray-600">Nom d'utilisateur :</span>
                                  <span className="font-medium">{createForm.watch("username") || "[nom d'utilisateur]"}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white rounded border">
                                  <span className="text-gray-600">Email :</span>
                                  <span className="font-medium">{createForm.watch("email") || "[email]"}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white rounded border">
                                  <span className="text-gray-600">Rôle :</span>
                                  <span className="font-medium">{getRoleLabel(createForm.watch("role") || "agent")}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-5">
                              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-1.5">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Configuration de messagerie
                              </h3>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white/80 rounded border border-blue-100">
                                  <span className="text-gray-600">Serveur :</span>
                                  <span className="font-medium font-mono text-blue-700">s4015.fra1.stableserver.net</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white/80 rounded border border-blue-100">
                                  <span className="text-gray-600">Email :</span>
                                  <span className="font-medium font-mono text-blue-700">{createForm.watch("email") || "[email]"}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 items-center text-sm p-2 bg-white/80 rounded border border-blue-100">
                                  <span className="text-gray-600">Mot de passe :</span>
                                  <span className="font-medium font-mono text-blue-700">Kamaka00.</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 text-xs text-blue-700">
                                Vous pouvez accéder à votre messagerie via un client mail (Outlook, Thunderbird, Gmail, etc.) 
                                ou directement depuis l'interface du CRM.
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <Button className="bg-blue-600 hover:bg-blue-700">Accéder au CRM</Button>
                              <p className="mt-4 text-xs text-gray-500">
                                En cas de problème, contactez l'administrateur du système à&nbsp;
                                <a href="mailto:admin@raccordement-elec.fr" className="text-blue-600 underline">
                                  admin@raccordement-elec.fr
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="permissions" className="py-4">
                      <Tabs defaultValue="default">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="default">Permissions par défaut</TabsTrigger>
                          <TabsTrigger value="custom">Permissions personnalisées</TabsTrigger>
                        </TabsList>
                        <TabsContent value="default" className="py-4">
                          <div className="text-sm text-muted-foreground mb-4">
                            Les permissions seront attribuées automatiquement en fonction du rôle de l'utilisateur.
                          </div>
                          <PermissionsEditor 
                            permissions={getDefaultPermissions(createForm.watch("role") || "agent")} 
                            onChange={() => {}} 
                          />
                        </TabsContent>
                        <TabsContent value="custom" className="py-4">
                          <div className="text-sm text-muted-foreground mb-4">
                            Personnalisez les permissions de l'utilisateur.
                          </div>
                          <FormField
                            control={createForm.control}
                            name="permissions"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <PermissionsEditor 
                                    permissions={field.value || []} 
                                    onChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>

                    <TabsContent value="smtp" className="py-4">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-5 mb-6 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-500 p-2 rounded-full text-white mt-1">
                              <Mail className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-800 mb-2">
                                Configuration automatique de la messagerie
                              </h4>
                              <p className="text-sm text-blue-700 mb-3">
                                L'utilisateur recevra un email de bienvenue contenant ses identifiants et informations de connexion.
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2 text-sm bg-white/75 p-3 rounded-md border border-blue-100 mb-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-800">Serveur SMTP:</span>
                                  <span className="font-mono">s4015.fra1.stableserver.net</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-800">Port:</span>
                                  <span className="font-mono">465</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-800">Sécurité:</span>
                                  <span className="font-mono">SSL/TLS</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-800">Mot de passe:</span>
                                  <span className="font-mono">Kamaka00.</span>
                                </div>
                              </div>
                              
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                                <div className="flex gap-2 items-center">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                  <p>
                                    Cette configuration permet à l'utilisateur d'envoyer des emails depuis le système et d'utiliser sa boîte email personnalisée.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={createForm.control}
                          name="smtpEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Activer la configuration SMTP</FormLabel>
                                <FormDescription>
                                  Permet à l'utilisateur d'envoyer des emails depuis le système.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {createForm.watch("smtpEnabled") && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={createForm.control}
                                name="smtpHost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Serveur SMTP</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="smtp.example.com"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={createForm.control}
                                name="smtpPort"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Port</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="465"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={createForm.control}
                              name="smtpSecure"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Connexion sécurisée</FormLabel>
                                    <FormDescription>
                                      Utiliser SSL/TLS pour la connexion au serveur SMTP.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={createForm.control}
                              name="smtpUser"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nom d'utilisateur SMTP</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="user@example.com"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Généralement identique à l'adresse email.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={createForm.control}
                              name="smtpPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mot de passe SMTP</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="********"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Laissez vide pour conserver le mot de passe actuel.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={createForm.control}
                              name="smtpFromEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email d'expédition</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="noreply@example.com"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Adresse utilisée comme expéditeur des emails.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="commission" className="py-4">
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-5 mb-6 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="bg-amber-500 p-2 rounded-full text-white mt-1">
                              <Percent className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-amber-800 mb-2">
                                Commissions sur paiements
                              </h4>
                              <p className="text-sm text-amber-700 mb-3">
                                Activez et configurez les commissions pour cet utilisateur sur les paiements reçus.
                              </p>
                              
                              <div className="bg-white/75 p-3 rounded-md border border-amber-100 text-sm">
                                <p className="text-amber-800 mb-2">
                                  Le système permettra de suivre et calculer automatiquement les commissions de l'utilisateur
                                  sur les paiements des demandes qu'il a traitées.
                                </p>
                                <p className="text-amber-800 font-medium">
                                  Ces informations sont visibles uniquement par les administrateurs.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={createForm.control}
                          name="commissionEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Activer les commissions</FormLabel>
                                <FormDescription>
                                  L'utilisateur recevra des commissions sur les paiements.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {createForm.watch("commissionEnabled") && (
                          <FormField
                            control={createForm.control}
                            name="commissionRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Taux de commission (€ par paiement)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="14.00"
                                      className="pl-9"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Montant fixe en euros par paiement traité. Par défaut: 14€.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => !createUserMutation.isPending && setIsCreating(false)}
                  disabled={createUserMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="gap-1"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Créer l'utilisateur
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition d'utilisateur */}
      <Dialog open={isEditing} onOpenChange={(open) => !updateUserMutation.isPending && setIsEditing(open)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenSquare className="h-5 w-5" />
              Modifier l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations et les accès de cet utilisateur.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Nom et prénom"
                              className="pl-9"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Nom d'utilisateur"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="email"
                              placeholder="utilisateur@exemple.com"
                              className="pl-9"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // En changeant l'email, on met à jour aussi l'email SMTP si activé
                                if (editForm.watch("smtpEnabled")) {
                                  if (!editForm.getValues("smtpFromEmail") || 
                                      editForm.getValues("smtpFromEmail") === selectedUser?.email) {
                                    editForm.setValue("smtpFromEmail", e.target.value);
                                  }
                                  if (!editForm.getValues("smtpUser") || 
                                      editForm.getValues("smtpUser") === selectedUser?.email) {
                                    editForm.setValue("smtpUser", e.target.value);
                                  }
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="password"
                              placeholder="Laisser vide pour ne pas modifier"
                              className="pl-9"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Laissez vide pour conserver le mot de passe actuel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (!editForm.getValues("permissions") || 
                                JSON.stringify(editForm.getValues("permissions")) === 
                                JSON.stringify(getDefaultPermissions(selectedUser?.role || ""))) {
                              editForm.setValue("permissions", getDefaultPermissions(value));
                            }
                          }}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-purple-600" />
                                <span>Administrateur</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="manager">
                              <span className="flex items-center gap-2">
                                <UserCog className="h-4 w-4 text-blue-600" />
                                <span>Responsable</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="agent">
                              <span className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-600" />
                                <span>Agent commercial</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Définit les droits d'accès de l'utilisateur dans le système.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Compte actif</FormLabel>
                          <FormDescription>
                            Détermine si l'utilisateur peut se connecter au système.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Tabs defaultValue="permissions">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="default">Permissions par défaut</TabsTrigger>
                      <TabsTrigger value="custom">Permissions personnalisées</TabsTrigger>
                    </TabsList>
                    <TabsContent value="default" className="py-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Les permissions seront attribuées automatiquement en fonction du rôle de l'utilisateur.
                      </div>
                      <PermissionsEditor 
                        permissions={getDefaultPermissions(editForm.watch("role") || "agent")} 
                        onChange={() => {}} 
                      />
                    </TabsContent>
                    <TabsContent value="custom" className="py-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Personnalisez les permissions de l'utilisateur.
                      </div>
                      <FormField
                        control={editForm.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <PermissionsEditor 
                                permissions={field.value || []} 
                                onChange={field.onChange} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => !updateUserMutation.isPending && setIsEditing(false)}
                  disabled={updateUserMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                  className="gap-1"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de réinitialisation du mot de passe */}
      <Dialog open={isResetPasswordOpen} onOpenChange={(open) => !resetPasswordMutation.isPending && setIsResetPasswordOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Réinitialiser le mot de passe
            </DialogTitle>
            <DialogDescription>
              Définissez un nouveau mot de passe pour l'utilisateur {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>

          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => !resetPasswordMutation.isPending && setIsResetPasswordOpen(false)}
                  disabled={resetPasswordMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={resetPasswordMutation.isPending}
                  className="gap-1"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Réinitialiser
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={(open) => !deleteUserMutation.isPending && setIsDeleteConfirmOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600 text-sm">
              La suppression d'un utilisateur entraînera la perte de toutes ses données associées, y compris :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Son compte et ses informations personnelles</li>
              <li>Ses statistiques et son historique</li>
              <li>Ses configurations et préférences</li>
            </ul>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => !deleteUserMutation.isPending && setIsDeleteConfirmOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              disabled={deleteUserMutation.isPending}
              className="gap-1"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}