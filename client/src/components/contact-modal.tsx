import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, User, Send, Loader2, X, MessageSquare, CheckCircle, CalendarIcon } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  source?: string;
}

export function ContactModal({
  trigger,
  defaultOpen,
  onOpenChange,
  source = "contact_form",
}: ContactModalProps) {
  const [open, setOpen] = React.useState(defaultOpen || false);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  
  // Synchronize with external prop changes
  useEffect(() => {
    if (defaultOpen !== undefined) {
      setOpen(defaultOpen);
    }
  }, [defaultOpen]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", {
        ...data,
        source,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.",
      });
      form.reset();
      handleOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[550px] rounded-xl overflow-hidden p-0 max-h-[90vh] contact-modal-content dialog-content-custom">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <div className="flex items-center gap-3 pr-10">
            <div className="bg-white/20 rounded-full p-2">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Contactez-nous
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Réponse garantie sous 24h ouvrées
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            className="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium flex items-center text-blue-800">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      Nom complet <span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Votre nom" 
                          {...field}
                          className="bg-blue-50/50 border-blue-100 focus-visible:ring-blue-500 rounded-md pl-10"
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium flex items-center text-blue-800">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      Email <span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="votreadresse@email.com" 
                          type="email" 
                          {...field}
                          className="bg-blue-50/50 border-blue-100 focus-visible:ring-blue-500 rounded-md pl-10"
                        />
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
                      </div>
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
                    <FormLabel className="font-medium flex items-center text-blue-800">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      Téléphone
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="06 XX XX XX XX" 
                          type="tel" 
                          {...field}
                          className="bg-blue-50/50 border-blue-100 focus-visible:ring-blue-500 rounded-md pl-10"
                        />
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-blue-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium flex items-center text-blue-800">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                      Message <span className="text-red-500 ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez votre projet ou votre question ici..." 
                        className="resize-none h-32 bg-blue-50/50 border-blue-100 focus-visible:ring-blue-500 rounded-md" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Blocs informatifs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Informations de disponibilité */}
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 p-3 border border-blue-100">
                  <div className="flex items-center space-x-2 text-blue-700 text-sm mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    <p className="font-medium">Service client prioritaire</p>
                  </div>
                  <p className="text-xs text-blue-700 pl-6">
                    Lun-Ven: 9h - 18h<br />
                    Toutes vos questions sur le raccordement Enedis
                  </p>
                </div>
                
                {/* Badges de confiance */}
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-blue-50 p-3 border border-green-100">
                  <div className="flex items-center space-x-2 text-green-700 text-sm mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Service de qualité</p>
                  </div>
                  <p className="text-xs text-green-700 pl-6">
                    Plus de 10 000 clients satisfaits<br />
                    Délai de traitement réduit de 60%
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md py-6"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer ma demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
