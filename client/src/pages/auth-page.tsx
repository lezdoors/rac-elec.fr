import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bolt, Lock, LogIn, Loader2 } from "lucide-react";

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isMatched] = useRoute("/admin");
  
  // Vérification du statut de connexion
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Clear any existing authentication data on page load
  useEffect(() => {
    // Clear localStorage to start fresh
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }, []);
  
  // Create form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Handle login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      // Validation de la réponse du serveur
      console.log("Réponse du serveur après connexion:", data);
      
      // Vérification que les données sont valides
      // Le serveur retourne directement { success: true, user: {...} }
      if (!data.success || !data.user || !data.user.role) {
        console.error("Données d'authentification invalides:", data);
        toast({
          title: "Erreur d'authentification",
          description: "Format de réponse invalide du serveur.",
          variant: "destructive",
        });
        return;
      }
      
      // Store auth data - génération d'un token temporaire côté client
      const tempToken = `admin-session-${Date.now()}`;
      localStorage.setItem("adminToken", tempToken);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      
      console.log("Token généré:", tempToken);
      console.log("Utilisateur stocké:", data.user);
      
      // Show success message
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à l'interface d'administration.",
        variant: "default",
      });
      
      // Redirect to dashboard using window.location for immediate redirect
      window.location.href = "/admin/dashboard";
    },
    onError: (error) => {
      toast({
        title: "Échec de la connexion",
        description: error instanceof Error ? error.message : "Nom d'utilisateur ou mot de passe incorrect.",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(data: LoginFormData) {
    loginMutation.mutate(data);
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Administration</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder au tableau de bord d'administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-gray-500">
              Accès administrateur réservé au personnel autorisé
            </p>
          </CardFooter>
        </Card>
        
        {/* Info Section */}
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg flex flex-col p-8 text-white">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bolt className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Services Enedis</h2>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Interface d'administration</h3>
          <p className="text-white/80 mb-6">
            Cette interface est réservée aux administrateurs et permet de gérer les demandes de raccordement,
            suivre leur avancement, et communiquer avec les clients.
          </p>
          
          <div className="mt-auto">
            <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Accès sécurisé</h4>
                <p className="text-sm text-white/70">
                  Toutes les informations et données client sont protégées et chiffrées 
                  conformément au RGPD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}