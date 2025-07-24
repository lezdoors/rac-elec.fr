import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LEAD_STATUS } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schéma de validation pour le formulaire de rendez-vous
const appointmentSchema = z.object({
  callbackDate: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  callbackTime: z.string().min(1, "Veuillez sélectionner une heure"),
  callbackNotes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number | null;
  leadInfo?: { 
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  onAppointmentCreated?: (appointmentData: {
    id: number;
    customerName: string;
    appointmentDate: Date;
    timeSlot: string;
    referenceNumber?: string;
  }) => void;
}

export function AppointmentModal({ isOpen, onClose, leadId, leadInfo, onAppointmentCreated }: AppointmentModalProps) {
  const { toast } = useToast();

  const defaultValues: Partial<AppointmentFormValues> = {
    callbackDate: new Date(),
    callbackTime: "09:00",
    callbackNotes: "",
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues,
  });

  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      if (!leadId) throw new Error("ID du lead manquant");
      
      // Combiner la date et l'heure pour créer un horodatage complet
      const [hours, minutes] = data.callbackTime.split(':').map(Number);
      const callbackDateTime = new Date(data.callbackDate);
      callbackDateTime.setHours(hours, minutes, 0, 0);

      const payload = {
        leadId,
        callbackDate: callbackDateTime.toISOString(),
        callbackNotes: data.callbackNotes,
        status: LEAD_STATUS.CALLBACK_SCHEDULED // Mettre à jour le statut du lead
      };

      const response = await apiRequest("POST", "/api/leads/schedule-callback", payload);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rendez-vous programmé",
        description: "Le rappel a été correctement planifié",
        variant: "default",
      });
      
      // Invalider les requêtes pour mettre à jour les données
      queryClient.invalidateQueries({ queryKey: ["/api/leads/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/incomplete"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/new"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      
      // Invalider les détails du lead spécifique
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}`] });
      }
      
      // Notifier le parent avec les données du rendez-vous si le callback existe
      if (onAppointmentCreated && data) {
        const [hours, minutes] = data.callbackTime.split(':').map(Number);
        const appointmentDate = new Date(data.callbackDate);
        appointmentDate.setHours(hours, minutes, 0, 0);
        
        onAppointmentCreated({
          id: data.id || leadId,
          customerName: leadInfo ? `${leadInfo.firstName || ''} ${leadInfo.lastName || ''}`.trim() : 'Client',
          appointmentDate: appointmentDate,
          timeSlot: data.callbackTime,
          referenceNumber: data.referenceNumber
        });
      }
      
      onClose();
      form.reset(defaultValues);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de programmer le rendez-vous: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    appointmentMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Programmer un rappel
          </DialogTitle>
          <DialogDescription>
            {leadInfo && (
              <div className="mt-2 bg-blue-50 p-3 rounded-md text-sm">
                <p className="font-semibold">
                  Client: {leadInfo.firstName || ""} {leadInfo.lastName || ""}
                </p>
                {leadInfo.phone && (
                  <p>Téléphone: {leadInfo.phone}</p>
                )}
                {leadInfo.email && (
                  <p>Email: {leadInfo.email}</p>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="callbackDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date du rappel</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={"w-full pl-3 text-left font-normal"}
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy", { locale: fr })
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="callbackTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure du rappel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                          <React.Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {hour.toString().padStart(2, '0')}:30
                            </SelectItem>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="callbackNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes pour le rappel</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires pour le rappel..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ajoutez ici des informations importantes à rappeler lors du contact avec le client.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={appointmentMutation.isPending} className="w-full sm:w-auto">
                {appointmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planification...
                  </>
                ) : (
                  "Programmer le rappel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
