import React from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Download, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, Share, FileText } from "lucide-react";
import { LEAD_STATUS } from "@shared/schema";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LeadActionsMenuProps {
  leadId: number;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  currentStatus?: string;
  hasContract?: boolean;
  onRequestAppointment?: () => void;
  onExportPDF?: () => void;
}

export function LeadActionsMenu({ leadId, phone, email, firstName, lastName, currentStatus, hasContract, onRequestAppointment, onExportPDF }: LeadActionsMenuProps) {
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}/status`, { status });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      const statusLabels: Record<string, string> = {
        [LEAD_STATUS.INTERESTED]: "Intéressé (OK)",
        [LEAD_STATUS.NOT_INTERESTED]: "Pas intéressé",
        [LEAD_STATUS.NO_RESPONSE]: "Pas de réponse (NRP)",
        [LEAD_STATUS.CALLBACK_SCHEDULED]: "Rappel programmé",
      };

      toast({
        title: "Statut mis à jour",
        description: `Le lead a été marqué comme : ${statusLabels[variables.status] || variables.status}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/incomplete"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (status: string) => {
    updateStatusMutation.mutate({ leadId, status });
  };

  const openWhatsApp = () => {
    if (!phone) {
      toast({
        title: "Aucun numéro de téléphone",
        description: "Ce lead n'a pas de numéro de téléphone renseigné.",
        variant: "destructive",
      });
      return;
    }
    
    // Nettoyer le numéro de téléphone (enlever espaces, parenthèses, etc.)
    let formattedPhone = phone.replace(/[\s()\-+]/g, "");
    
    // S'assurer que le numéro commence par le code pays
    if (!formattedPhone.startsWith("33") && formattedPhone.startsWith("0")) {
      formattedPhone = "33" + formattedPhone.substring(1);
    }
    
    // Ouvrir WhatsApp avec le numéro formaté
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Share className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Statuts */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Statut</DropdownMenuLabel>
        
        <DropdownMenuItem 
          className={currentStatus === LEAD_STATUS.INTERESTED ? "bg-blue-50" : ""}
          onClick={() => handleUpdateStatus(LEAD_STATUS.INTERESTED)}
        >
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Intéressé (OK)
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className={currentStatus === LEAD_STATUS.NOT_INTERESTED ? "bg-blue-50" : ""}
          onClick={() => handleUpdateStatus(LEAD_STATUS.NOT_INTERESTED)}
        >
          <XCircle className="mr-2 h-4 w-4 text-red-500" /> Pas intéressé
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className={currentStatus === LEAD_STATUS.NO_RESPONSE ? "bg-blue-50" : ""}
          onClick={() => handleUpdateStatus(LEAD_STATUS.NO_RESPONSE)}
        >
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> Pas de réponse (NRP)
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className={currentStatus === LEAD_STATUS.CALLBACK_SCHEDULED ? "bg-blue-50" : ""}
          onClick={onRequestAppointment}
        >
          <Clock className="mr-2 h-4 w-4 text-blue-500" /> Programmer rappel
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className={currentStatus === LEAD_STATUS.PROCESS_COMPLETE ? "bg-green-50" : ""}
          onClick={() => handleUpdateStatus(LEAD_STATUS.PROCESS_COMPLETE)}
        >
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> 5/5 vert (complet)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Communication */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Communication</DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={openWhatsApp}>
            <MessageSquare className="mr-2 h-4 w-4 text-green-600" /> WhatsApp
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              if (!email) {
                toast({
                  title: "Aucune adresse email",
                  description: "Ce lead n'a pas d'adresse email renseignée.",
                  variant: "destructive",
                });
                return;
              }
              
              // Préparer le message pré-rédigé
              const subject = "Votre demande de raccordement";
              const body = `Bonjour ${firstName || ''} ${lastName || ''},\n\nNous avons bien reçu votre demande de raccordement. \n\nCordialement,\nL'équipe Raccordement`;
              
              // Ouvrir le client de messagerie par défaut
              window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }}
          >
            <Mail className="mr-2 h-4 w-4 text-blue-600" /> Email
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled>
            <Phone className="mr-2 h-4 w-4" /> Appeler
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Actions sur les documents */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Documents</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={onExportPDF}
          disabled={!onExportPDF}
        >
          <Download className="mr-2 h-4 w-4" /> Exporter PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem
          className={hasContract ? "bg-green-50" : ""}
          onClick={() => {
            if (hasContract) {
              // Si le contrat existe déjà, on récupère l'URL et on l'ouvre
              apiRequest("GET", `/api/contracts/${leadId}`)
                .then(res => res.json())
                .then(data => {
                  if (data.success && data.url) {
                    window.open(data.url, "_blank");
                  } else {
                    throw new Error(data.message || "Erreur lors de la récupération du contrat");
                  }
                })
                .catch(error => {
                  toast({
                    title: "Erreur",
                    description: `Impossible d'ouvrir le contrat: ${error.message}`,
                    variant: "destructive",
                  });
                });
            } else {
              // Si le contrat n'existe pas, on en génère un nouveau
              apiRequest("POST", `/api/contracts/${leadId}/generate`)
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    toast({
                      title: "Contrat généré",
                      description: data.message,
                    });
                    // Ouverture du contrat dans un nouvel onglet
                    if (data.url) {
                      window.open(data.url, "_blank");
                    }
                    // Rafraîchir les données des leads
                    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
                  } else {
                    throw new Error(data.message || "Erreur inconnue");
                  }
                })
                .catch(error => {
                  toast({
                    title: "Erreur",
                    description: `Impossible de générer le contrat: ${error.message}`,
                    variant: "destructive",
                  });
                });
            }
          }}
        >
          <FileText className={`mr-2 h-4 w-4 ${hasContract ? "text-green-600" : ""}`} />
          {hasContract ? "Voir contrat" : "Générer contrat"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
