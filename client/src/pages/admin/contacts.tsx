import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MoreVertical,
  Check,
  Archive,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  ArchiveIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaginationNavigation } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: string;
  readAt: string | null;
  readBy: number | null;
  repliedAt: string | null;
  repliedBy: number | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "unread":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Non lu
        </Badge>
      );
    case "read":
      return (
        <Badge variant="secondary" className="gap-1">
          <Eye className="h-3 w-3" />
          Lu
        </Badge>
      );
    case "replied":
      return (
        <Badge variant="outline" className="gap-1 bg-green-100 text-green-800 hover:bg-green-100/80">
          <CheckCircle className="h-3 w-3" />
          Répondu
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="gap-1">
          <ArchiveIcon className="h-3 w-3" />
          Archivé
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
}

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const { toast } = useToast();
  
  // Variable isConnected supprimée car plus nécessaire
  
  // Charger les contacts avec mise en cache et staleTime pour réduire les requêtes API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/contacts", page],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/contacts?page=${page}&limit=20`);
      return res.json();
    },
    staleTime: 30000, // Considérer les données valides pendant 30 secondes
    retry: 1, // Limiter les tentatives de nouvelle requête en cas d'échec
  });
  
  // Mutation pour mettre à jour le statut d'un contact
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/contacts/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      // Invalider uniquement les données nécessaires
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/unread-count"] });
    },
  });
  
  // Mémoisation pour éviter la recréation de la fonction à chaque rendu
  const openContactDetails = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setContactDetailsOpen(true);
    
    // Si le contact est non lu, le marquer comme lu
    if (contact.status === "unread") {
      updateStatusMutation.mutate({ id: contact.id, status: "read" });
    }
  }, [updateStatusMutation]);
  
  // Mettre à jour le statut d'un contact (mémoisation)
  const updateContactStatus = useCallback((id: number, status: string) => {
    updateStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          const statusTexts: Record<string, string> = {
            read: "marqué comme lu",
            replied: "marqué comme répondu",
            archived: "archivé",
          };
          
          toast({
            title: "Statut mis à jour",
            description: `Le contact a été ${statusTexts[status] || status}`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le statut du contact",
            variant: "destructive",
          });
        },
      }
    );
  }, [updateStatusMutation, toast]);
  
  // Gérer la pagination (mémoisation)
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 text-center text-red-500">
          Une erreur est survenue lors du chargement des contacts.
        </div>
      </AdminLayout>
    );
  }
  
  const contactsList = data?.contacts || [];
  const totalPages = data?.pagination?.totalPages || 1;
  
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Contacts</h1>
            <p className="text-muted-foreground">
              Gérez les messages envoyés via le formulaire de contact
            </p>
          </div>
          {/* Badge WebSocket supprimé pour éviter les doublons avec celui d'AdminLayout */}
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Messages reçus</CardTitle>
            <CardDescription>
              {data?.pagination?.total || 0} message(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contactsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun message de contact reçu pour le moment.
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Expéditeur</TableHead>
                        <TableHead className="max-w-[350px]">Message</TableHead>
                        <TableHead className="w-[100px]">Statut</TableHead>
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsList.map((contact: Contact) => (
                        <TableRow 
                          key={contact.id} 
                          className={contact.status === "unread" ? "font-medium bg-blue-50/40" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 bg-primary/10">
                                <AvatarFallback className="text-primary">
                                  {contact.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="grid gap-0.5">
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {contact.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="line-clamp-2 text-sm">
                              {contact.message}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(contact.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true, locale: fr })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openContactDetails(contact)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </DropdownMenuItem>
                                {contact.status !== "read" && (
                                  <DropdownMenuItem onClick={() => updateContactStatus(contact.id, "read")}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Marquer comme lu
                                  </DropdownMenuItem>
                                )}
                                {contact.status !== "replied" && (
                                  <DropdownMenuItem onClick={() => updateContactStatus(contact.id, "replied")}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Marquer comme répondu
                                  </DropdownMenuItem>
                                )}
                                {contact.status !== "archived" && (
                                  <DropdownMenuItem onClick={() => updateContactStatus(contact.id, "archived")}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archiver
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <PaginationNavigation 
                      currentPage={page} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange} 
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de détails du contact */}
      <Dialog open={contactDetailsOpen} onOpenChange={setContactDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du message</DialogTitle>
            <DialogDescription>
              Message envoyé le {selectedContact && new Date(selectedContact.createdAt).toLocaleDateString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 pb-3 border-b">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary text-lg">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{selectedContact.name}</h3>
                  <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline">
                      {selectedContact.email}
                    </a>
                    {selectedContact.phone && (
                      <a href={`tel:${selectedContact.phone}`} className="hover:underline">
                        {selectedContact.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedContact.status)}
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Message</h4>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                <div>
                  <span className="font-medium">Source:</span> {selectedContact.source || 'Formulaire de contact'}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(selectedContact.createdAt).toLocaleDateString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
                <div>
                  <span className="font-medium">IP:</span> {selectedContact.ipAddress || 'Non disponible'}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedContact.status !== "replied" && (
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => updateContactStatus(selectedContact.id, "replied")}
                  >
                    <Mail className="h-4 w-4" />
                    Marquer comme répondu
                  </Button>
                )}
                {selectedContact.status !== "archived" && (
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => updateContactStatus(selectedContact.id, "archived")}
                  >
                    <Archive className="h-4 w-4" />
                    Archiver
                  </Button>
                )}
                <Button 
                  variant="default" 
                  className="gap-1"
                  onClick={() => {
                    window.location.href = `mailto:${selectedContact.email}?subject=Re: Message depuis le site`;
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Répondre par email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
