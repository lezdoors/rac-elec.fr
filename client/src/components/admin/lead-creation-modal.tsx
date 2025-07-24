import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Schéma de validation pour la création de lead
const leadCreationSchema = z.object({
  clientType: z.enum(["particulier", "professionnel", "collectivite"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de client" }),
  }),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(/^[0-9]{10}$/, "Le numéro doit contenir exactement 10 chiffres"),
  company: z.string().optional().or(z.literal("")),
  siret: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  addressComplement: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  serviceType: z.enum(["electricity"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de service" }),
  }),
  requestType: z.enum([
    "new_connection", 
    "power_upgrade", 
    "temporary_connection", 
    "relocation",
    "technical_visit",
    "other"
  ]),
  buildingType: z.enum([
    "individual_house", 
    "apartment_building", 
    "commercial", 
    "industrial",
    "agricultural",
    "public",
    "terrain"
  ]).optional(),
  terrainViabilise: z.enum(["viabilise", "non_viabilise"]).optional(),
  powerRequired: z.string().optional(),
  phaseType: z.enum(["monophase", "triphase"]).optional(),
  comments: z.string().optional().or(z.literal(""))
}).refine((data) => {
  // Validation pour les professionnels
  if (data.clientType === "professionnel" && (!data.company || !data.siret)) {
    return false;
  }
  return true;
}, {
  message: "La raison sociale et le numéro SIRET sont requis pour les professionnels",
  path: ["siret"]
});

type LeadCreationData = z.infer<typeof leadCreationSchema>;

interface LeadCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

export function LeadCreationModal({ isOpen, onClose, onLeadCreated }: LeadCreationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Définir le formulaire avec les valeurs par défaut
  const form = useForm<LeadCreationData>({
    resolver: zodResolver(leadCreationSchema),
    defaultValues: {
      clientType: "particulier",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      siret: "",
      address: "",
      addressComplement: "",
      postalCode: "",
      city: "",
      serviceType: "electricity",
      requestType: "new_connection",
      buildingType: "individual_house",
      terrainViabilise: "viabilise",
      powerRequired: "9",
      phaseType: "monophase",
      comments: ""
    }
  });

  // Observer le changement de type de client pour validation conditionnelle
  const clientType = form.watch("clientType");
  
  // Mutation pour créer un lead
  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadCreationData) => {
      const response = await apiRequest("POST", "/api/leads/admin-create", data);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Lead créé avec succès",
          description: `Référence: ${data.referenceNumber}`,
        });
        onLeadCreated();
        onClose();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la création du lead",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du lead",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Fonction de soumission du formulaire
  const onSubmit = async (data: LeadCreationData) => {
    setIsSubmitting(true);
    createLeadMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Créer un nouveau lead</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations du client</h3>
              
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Type de client</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="particulier" id="particulier" />
                          <Label htmlFor="particulier">Particulier</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="professionnel" id="professionnel" />
                          <Label htmlFor="professionnel">Professionnel</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="collectivite" id="collectivite" />
                          <Label htmlFor="collectivite">Collectivité</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="0600000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {clientType === "professionnel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raison sociale</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="siret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SIRET</FormLabel>
                        <FormControl>
                          <Input placeholder="SIRET" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Adresse</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro et nom de rue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressComplement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complément d'adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Appartement, bâtiment, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Détails techniques</h3>
              
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de demande</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de demande" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new_connection">Nouveau raccordement</SelectItem>
                        <SelectItem value="power_upgrade">Augmentation de puissance</SelectItem>
                        <SelectItem value="temporary_connection">Raccordement provisoire</SelectItem>
                        <SelectItem value="relocation">Déplacement d'ouvrage</SelectItem>
                        <SelectItem value="technical_visit">Visite technique</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="buildingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de bâtiment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de bâtiment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual_house">Maison individuelle</SelectItem>
                        <SelectItem value="apartment_building">Immeuble collectif</SelectItem>
                        <SelectItem value="commercial">Local commercial</SelectItem>
                        <SelectItem value="industrial">Site industriel</SelectItem>
                        <SelectItem value="agricultural">Exploitation agricole</SelectItem>
                        <SelectItem value="public">Établissement public</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="powerRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puissance demandée (kVA)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une puissance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 kVA</SelectItem>
                          <SelectItem value="6">6 kVA</SelectItem>
                          <SelectItem value="9">9 kVA</SelectItem>
                          <SelectItem value="12">12 kVA</SelectItem>
                          <SelectItem value="15">15 kVA</SelectItem>
                          <SelectItem value="18">18 kVA</SelectItem>
                          <SelectItem value="24">24 kVA</SelectItem>
                          <SelectItem value="30">30 kVA</SelectItem>
                          <SelectItem value="36">36 kVA</SelectItem>
                          <SelectItem value="beyond">Plus de 36 kVA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phaseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de phase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un type de phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monophase">Monophasé</SelectItem>
                          <SelectItem value="triphase">Triphasé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaires</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informations complémentaires sur la demande"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose} type="button">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le lead"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
