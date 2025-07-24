import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Clock, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

// Type pour les tâches
interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  userId: number;
  remindAt: string | null;
  reminderSent: boolean;
  relatedType: string | null;
  relatedId: number | null;
}

// Schéma de validation pour le formulaire de création/modification de tâches
const taskFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional().nullable(),
  priority: z.enum(["high", "medium", "normal", "low"], {
    errorMap: () => ({ message: "Priorité invalide" }),
  }).default("normal"),
  dueDate: z.date().optional().nullable(),
  remindAt: z.date().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Composant principal pour la gestion des tâches personnelles
interface AgentTasksProps {
  teamView?: boolean;
}

export default function AgentTasks({ teamView = false }: AgentTasksProps) {
  // Récupérer le role de l'utilisateur au début du composant
  const { user } = useAuth();
  const isManager = user?.role?.toLowerCase() === 'manager';
  
  const [selectedTab, setSelectedTab] = useState<string>("pending");
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les tâches (personnelles ou d'équipe selon le mode)
  const { data, isLoading, error } = useQuery({ 
    queryKey: teamView ? ["/api/team/tasks"] : ["/api/tasks"],
  });

  // Récupérer les tâches dues aujourd'hui
  const { data: dueTasks, isLoading: isDueTasksLoading, error: dueTasksError } = useQuery({ 
    queryKey: teamView ? ["/api/team/tasks/due"] : ["/api/tasks/due"],
    retry: 1,
  });

  // Configuration du formulaire de création de tâche
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
      dueDate: null,
      remindAt: null,
    },
  });

  // Gérer la soumission du formulaire
  function onSubmit(values: TaskFormValues) {
    createTaskMutation.mutate(values);
  }

  // Mutation pour marquer une tâche comme terminée
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/due"] });
      toast({
        title: "Tâche terminée",
        description: "La tâche a été marquée comme terminée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de terminer la tâche: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour créer une nouvelle tâche
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/due"] });
      setIsNewTaskDialogOpen(false);
      form.reset();
      toast({
        title: "Tâche créée",
        description: "La nouvelle tâche a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la tâche: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une tâche
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/due"] });
      toast({
        description: "La tâche a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la tâche: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filtrer les tâches en fonction de l'onglet sélectionné
  const filteredTasks = (data && Array.isArray(data.tasks) ? data.tasks.filter((task: Task) => {
    if (selectedTab === "all") return true;
    return task.status === selectedTab;
  }) : []);

  // Formater la date au format français
  const formatTaskDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  // Obtenir le style de la priorité
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Haute</Badge>;
      case "medium":
        return <Badge className="bg-amber-400 hover:bg-amber-500">Moyenne</Badge>;
      case "normal":
        return <Badge variant="outline">Normale</Badge>;
      case "low":
        return <Badge variant="secondary">Basse</Badge>;
      default:
        return <Badge variant="outline">Normale</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes tâches</CardTitle>
          <CardDescription>Chargement des tâches...</CardDescription>
        </CardHeader>
        <CardContent className="h-52 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes tâches</CardTitle>
          <CardDescription>Une erreur est survenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>Impossible de charger les tâches.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Mes tâches</CardTitle>
          <CardDescription>
            {isManager ? "Gérez vos tâches et celles de votre équipe" : "Gérez vos tâches quotidiennes"}
          </CardDescription>
        </div>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle tâche à votre liste. Les champs marqués d'un * sont obligatoires.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de la tâche" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée de la tâche" 
                          className="min-h-[100px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">Haute</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="normal">Normale</SelectItem>
                            <SelectItem value="low">Basse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date d'échéance</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="remindAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rappel</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Choisir une date de rappel</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Vous recevrez une notification à cette date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewTaskDialogOpen(false)}
                    disabled={createTaskMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Création..." : "Créer la tâche"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 pb-4 border-b">
          <Button 
            variant={selectedTab === "pending" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("pending")}
          >
            En attente
          </Button>
          <Button 
            variant={selectedTab === "in_progress" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("in_progress")}
          >
            En cours
          </Button>
          <Button 
            variant={selectedTab === "completed" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("completed")}
          >
            Terminées
          </Button>
          <Button 
            variant={selectedTab === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("all")}
          >
            Toutes
          </Button>
        </div>

        {/* Section des tâches dues */}
        {isDueTasksLoading ? (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
            Chargement des tâches à échéance...
          </div>
        ) : dueTasksError ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              Erreur de chargement des tâches à échéance
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Impossible de récupérer les tâches à échéance aujourd'hui. Veuillez réessayer ultérieurement.
            </p>
          </div>
        ) : dueTasks && Array.isArray(dueTasks.tasks) && dueTasks.tasks.length > 0 ? (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium flex items-center gap-2 text-amber-800">
              <Clock className="h-4 w-4" />
              Tâches à échéance aujourd'hui ({dueTasks.tasks.length})
            </h3>
            <ul className="mt-2 space-y-2">
              {dueTasks.tasks.map((task: Task) => (
                <li key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`complete-${task.id}`}
                      checked={task.status === "completed"}
                      onCheckedChange={() => completeTaskMutation.mutate(task.id)}
                    />
                    <label 
                      htmlFor={`complete-${task.id}`}
                      className="text-sm text-amber-900 cursor-pointer"
                    >
                      {task.title}
                    </label>
                  </div>
                  {getPriorityBadge(task.priority)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              Aucune tâche à échéance aujourd'hui
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Vous n'avez pas de tâches en attente avec une échéance aujourd'hui ou en retard.
            </p>
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Aucune tâche {selectedTab === "all" ? "" : selectedTab === "pending" ? "en attente" : selectedTab === "in_progress" ? "en cours" : "terminée"}
          </div>
        ) : (
          <ul className="divide-y mt-4">
            {filteredTasks.map((task: Task) => (
              <li key={task.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {task.status !== "completed" && (
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.status === "completed"}
                        onCheckedChange={() => completeTaskMutation.mutate(task.id)}
                        className="mt-1"
                      />
                    )}
                    {task.status === "completed" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    <div>
                      <h3 className={cn(
                        "font-medium", 
                        task.status === "completed" && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getPriorityBadge(task.priority)}
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTaskDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {task.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredTasks.length} tâche{filteredTasks.length !== 1 ? "s" : ""} 
          {selectedTab === "all" ? "" : selectedTab === "pending" ? " en attente" : selectedTab === "in_progress" ? " en cours" : " terminées"}
        </p>
        {/* Espace pour pagination future */}
      </CardFooter>
    </Card>
  );
}