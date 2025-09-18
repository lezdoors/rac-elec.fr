import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  CalendarPlus,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  CalendarClock,
  MessageCircle,
  Mail
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AppointmentModal } from "@/components/admin/appointment-modal";

interface Appointment {
  id: number;
  referenceNumber: string;
  customerName: string;
  appointmentDate: Date | null;
  timeSlot: string | null;
  status: string;
  enedisRef: string | null;
  createdAt: string;
  updatedAt?: string;
  address: string;
  postalCode: string;
  city: string;
  email?: string;
  phone?: string;
  hasReminderSent?: boolean;
}

export default function RendezVousPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  
  // État pour le mode vue (calendrier ou liste)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  
  // Gestionnaire de fermeture de la modale
  const handleCloseModal = () => {
    setShowNewAppointmentModal(false);
    setSelectedLeadId(null);
  };
  
  // Fonction pour annuler un rendez-vous
  const handleCancelAppointment = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelDialog(true);
  };
  
  // Confirmer l'annulation du rendez-vous
  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      // La raison d'annulation est obligatoire selon l'API
      await apiRequest("POST", `/api/service-requests/${appointmentToCancel}/cancel`, {
        reason: "Annulé par l'administrateur via l'interface des rendez-vous"
      });
      
      toast({
        title: "Rendez-vous annulé",
        description: "Le rendez-vous a été annulé avec succès.",
      });
      
      // Invalider les données pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setShowCancelDialog(false);
      setAppointmentToCancel(null);
    }
  };
  
  // État pour la modale de confirmation d'envoi de rappel
  const [appointmentToRemind, setAppointmentToRemind] = useState<Appointment | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  
  // Fonction pour envoyer un rappel de rendez-vous
  const handleSendReminder = (appointment: Appointment) => {
    setAppointmentToRemind(appointment);
    setShowReminderDialog(true);
  };
  
  // Confirmer l'envoi du rappel
  const confirmSendReminder = async () => {
    if (!appointmentToRemind) return;
    
    try {
      await apiRequest("POST", `/api/service-requests/${appointmentToRemind.id}/send-reminder`, {
        type: "appointment_reminder",
        includeCalendarInvite: true
      });
      
      toast({
        title: "Rappel envoyé",
        description: `Un rappel a été envoyé à ${appointmentToRemind.customerName}.`,
      });
      
      // Invalider les données pour rafraîchir la liste avec le statut de rappel mis à jour
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setShowReminderDialog(false);
      setAppointmentToRemind(null);
    }
  };
  
  // Récupérer les demandes de service (qui contiennent les données de rendez-vous)
  const { data: serviceRequests, isLoading, error } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/service-requests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Convertir les demandes de service en rendez-vous
  const appointments: Appointment[] = serviceRequests 
    ? serviceRequests
        .map(req => ({
          id: req.id,
          referenceNumber: req.referenceNumber,
          customerName: req.name || "Client sans nom",
          appointmentDate: req.scheduledDate ? new Date(req.scheduledDate) : null,
          timeSlot: req.scheduledTime || null,
          status: req.status,
          enedisRef: req.enedisReferenceNumber || null,
          createdAt: new Date(req.createdAt).toISOString(),
          updatedAt: req.updatedAt ? new Date(req.updatedAt).toISOString() : undefined,
          address: req.address || "",
          postalCode: req.postalCode || "",
          city: req.city || "",
          email: req.email,
          phone: req.phone,
          hasReminderSent: req.hasReminderSent
        }))
        .filter(appt => appt.status === "scheduled" || appt.status === "validated" || appt.status === "in_progress" || appt.status === "canceled")
    : [];
  
  // Filtrer les rendez-vous en fonction des critères sélectionnés
  const filteredAppointments = appointments.filter(appointment => {
    // Filtre par recherche
    const matchesSearch = searchTerm === "" || 
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.enedisRef && appointment.enedisRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par onglet
    const now = new Date();
    
    if (activeTab === "upcoming" && appointment.appointmentDate) {
      return matchesSearch && appointment.appointmentDate >= now;
    } else if (activeTab === "past" && appointment.appointmentDate) {
      return matchesSearch && appointment.appointmentDate < now;
    } else if (activeTab === "pending") {
      return matchesSearch && !appointment.appointmentDate;
    }
    
    return matchesSearch;
  });

  // Fonctions pour naviguer dans le calendrier
  const nextMonth = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
  };

  const prevMonth = () => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
  };

  // Fonction pour formater l'adresse complète
  const formatAddress = (appointment: Appointment) => {
    return `${appointment.address}, ${appointment.postalCode} ${appointment.city}`;
  };

  // Générer les jours du mois pour l'affichage du calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i + 1),
        isCurrentMonth: false
      });
    }
    
    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines x 7 jours = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentDate);
  
  // Obtenir les rendez-vous pour une date spécifique
  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appt => 
      appt.appointmentDate && 
      appt.appointmentDate.getDate() === date.getDate() &&
      appt.appointmentDate.getMonth() === date.getMonth() &&
      appt.appointmentDate.getFullYear() === date.getFullYear()
    );
  };
  
  // Formatage des dates
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };
  
  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <AdminLayout title="Rendez-vous" description="Gestion des rendez-vous clients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Rendez-vous</h1>
            </div>
            <p className="text-muted-foreground">
              Gestion des rendez-vous et planification
            </p>
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un rendez-vous..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setViewMode(viewMode === "calendar" ? "list" : "calendar")}>
              {viewMode === "calendar" ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Vue liste
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Vue calendrier
                </>
              )}
            </Button>
            <Button onClick={() => setShowNewAppointmentModal(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Nouveau RDV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
            <TabsTrigger value="canceled">Annulés</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Une erreur est survenue lors du chargement des rendez-vous.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <CalendarClock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun rendez-vous trouvé.</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "list" ? (
              // Vue en liste
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle>Liste des rendez-vous à venir</CardTitle>
                  <CardDescription>
                    Consultez et gérez les rendez-vous planifiés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">
                            <div className="flex items-center">
                              <Checkbox id="selectAll" className="mr-2" />
                              <label htmlFor="selectAll">Client</label>
                            </div>
                          </th>
                          <th className="text-left py-3 px-2 font-medium">Date</th>
                          <th className="text-left py-3 px-2 font-medium">Référence</th>
                          <th className="text-left py-3 px-2 font-medium">Adresse</th>
                          <th className="text-left py-3 px-2 font-medium">Statut</th>
                          <th className="text-right py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => {
                          // Déterminer le statut du rendez-vous
                          let statusBadge;
                          switch (appointment.status) {
                            case "scheduled":
                              statusBadge = <Badge className="bg-blue-500">Planifié</Badge>;
                              break;
                            case "validated":
                              statusBadge = <Badge className="bg-green-500">Validé</Badge>;
                              break;
                            case "in_progress":
                              statusBadge = <Badge variant="secondary">En cours</Badge>;
                              break;
                            default:
                              statusBadge = <Badge variant="outline">{appointment.status}</Badge>;
                          }
                          
                          return (
                            <tr key={appointment.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <div className="flex items-center">
                                  <Checkbox id={`select-${appointment.id}`} className="mr-2" />
                                  <div>
                                    <div className="font-medium">{appointment.customerName}</div>
                                    {appointment.enedisRef && (
                                      <div className="text-xs text-muted-foreground">
                                        Ref. Enedis: {appointment.enedisRef}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {appointment.appointmentDate ? (
                                  <div>
                                    <div>{formatDateFull(appointment.appointmentDate)}</div>
                                    {appointment.timeSlot && (
                                      <div className="text-xs text-muted-foreground">
                                        {appointment.timeSlot}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">
                                    En attente de planification
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-mono text-xs">{appointment.referenceNumber}</div>
                              </td>
                              <td className="py-3 px-2 max-w-xs truncate">
                                {formatAddress(appointment)}
                              </td>
                              <td className="py-3 px-2">
                                {statusBadge}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    title="Détails"
                                    onClick={() => {
                                      toast({
                                        title: "Détails du rendez-vous",
                                        description: (
                                          <div className="mt-2 text-sm">
                                            <p><strong>Client:</strong> {appointment.customerName}</p>
                                            <p><strong>Référence:</strong> {appointment.referenceNumber}</p>
                                            <p><strong>Date:</strong> {appointment.appointmentDate ? formatDateFull(appointment.appointmentDate) : "Non planifié"}</p>
                                            <p><strong>Heure:</strong> {appointment.timeSlot || "Non précisée"}</p>
                                            <p><strong>Adresse:</strong> {formatAddress(appointment)}</p>
                                            {appointment.enedisRef && (
                                              <p><strong>Réf. Enedis:</strong> {appointment.enedisRef}</p>
                                            )}
                                            {appointment.email && (
                                              <p><strong>Email:</strong> {appointment.email}</p>
                                            )}
                                            {appointment.phone && (
                                              <p><strong>Téléphone:</strong> {appointment.phone}</p>
                                            )}
                                          </div>
                                        ),
                                        duration: 6000,
                                      });
                                    }}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                  {appointment.email && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      title={appointment.hasReminderSent ? "Rappel déjà envoyé" : "Envoyer un rappel"}
                                      onClick={() => handleSendReminder(appointment)}
                                      disabled={appointment.hasReminderSent}
                                      className={appointment.hasReminderSent ? "text-green-500" : ""}
                                    >
                                      {appointment.hasReminderSent ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <Mail className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    title="Modifier le rendez-vous"
                                    onClick={() => {
                                      // Extraire l'ID du lead à partir de la référence du rendez-vous ou utiliser l'ID du rendez-vous
                                      const apptId = appointment.id;
                                      setSelectedLeadId(apptId);
                                      setShowNewAppointmentModal(true);
                                    }}
                                  >
                                    <CalendarClock className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    title="Annuler le rendez-vous"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    <CalendarX className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {filteredAppointments.length} rendez-vous
                  </div>
                </CardFooter>
              </Card>
            ) : (
              // Vue en calendrier
              <Card>
                <CardHeader className="pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendrier des rendez-vous</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">{formatMonthYear(currentDate)}</span>
                      <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Vue mensuelle des rendez-vous planifiés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
                      <div key={day} className="text-center text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}
                    
                    {days.map((day, index) => {
                      const dayAppointments = getAppointmentsForDate(day.date);
                      const isToday = 
                        new Date().getDate() === day.date.getDate() &&
                        new Date().getMonth() === day.date.getMonth() &&
                        new Date().getFullYear() === day.date.getFullYear();
                      
                      return (
                        <div 
                          key={index}
                          className={`min-h-24 border rounded-md p-1 ${
                            day.isCurrentMonth ? "bg-background" : "bg-muted opacity-50"
                          } ${isToday ? "border-blue-500 border-2" : "border-border"}`}
                        >
                          <div className="text-right p-1 text-sm">
                            {day.date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.map(appt => (
                              <div 
                                key={appt.id} 
                                className="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer truncate"
                                onClick={() => {
                                  // Ouvrir la modale d'édition pour ce rendez-vous
                                  setSelectedLeadId(appt.id);
                                  setShowNewAppointmentModal(true);
                                }}
                              >
                                {appt.timeSlot ? appt.timeSlot : "—"} • {appt.customerName}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Une erreur est survenue lors du chargement des rendez-vous.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <CalendarClock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun rendez-vous en attente trouvé.</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle>Demandes en attente de planification</CardTitle>
                  <CardDescription>
                    Rendez-vous qui nécessitent une date et une heure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Client</th>
                          <th className="text-left py-3 px-2 font-medium">Référence</th>
                          <th className="text-left py-3 px-2 font-medium">Adresse</th>
                          <th className="text-left py-3 px-2 font-medium">Créé le</th>
                          <th className="text-right py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div>
                                <div className="font-medium">{appointment.customerName}</div>
                                {appointment.enedisRef && (
                                  <div className="text-xs text-muted-foreground">
                                    Ref. Enedis: {appointment.enedisRef}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-mono text-xs">{appointment.referenceNumber}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-sm truncate max-w-[200px]">
                                {formatAddress(appointment)}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div>
                                {new Date(appointment.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button
                                size="sm" 
                                variant="default"
                                onClick={() => {
                                  setSelectedLeadId(appointment.id);
                                  setShowNewAppointmentModal(true);
                                }}
                              >
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Planifier
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Une erreur est survenue lors du chargement des rendez-vous.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <CalendarClock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun rendez-vous passé trouvé.</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle>Historique des rendez-vous</CardTitle>
                  <CardDescription>
                    Rendez-vous passés et terminés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Client</th>
                          <th className="text-left py-3 px-2 font-medium">Date</th>
                          <th className="text-left py-3 px-2 font-medium">Référence</th>
                          <th className="text-left py-3 px-2 font-medium">Adresse</th>
                          <th className="text-left py-3 px-2 font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => {
                          // Déterminer le statut du rendez-vous
                          let statusBadge;
                          switch (appointment.status) {
                            case "scheduled":
                              statusBadge = <Badge className="bg-blue-500">Planifié</Badge>;
                              break;
                            case "validated":
                              statusBadge = <Badge className="bg-green-500">Validé</Badge>;
                              break;
                            case "in_progress":
                              statusBadge = <Badge variant="secondary">En cours</Badge>;
                              break;
                            default:
                              statusBadge = <Badge variant="outline">{appointment.status}</Badge>;
                          }
                          
                          return (
                            <tr key={appointment.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <div className="font-medium">{appointment.customerName}</div>
                                {appointment.enedisRef && (
                                  <div className="text-xs text-muted-foreground">
                                    Ref. Enedis: {appointment.enedisRef}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                {appointment.appointmentDate ? (
                                  <div>
                                    <div>{formatDateFull(appointment.appointmentDate)}</div>
                                    {appointment.timeSlot && (
                                      <div className="text-xs text-muted-foreground">
                                        {appointment.timeSlot}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">
                                    Non planifié
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-mono text-xs">{appointment.referenceNumber}</div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="text-sm truncate max-w-[200px]">
                                  {formatAddress(appointment)}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {statusBadge}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="canceled" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Une erreur est survenue lors du chargement des rendez-vous.</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <CalendarX className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun rendez-vous annulé trouvé.</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle>Rendez-vous annulés</CardTitle>
                  <CardDescription>
                    Historique des rendez-vous annulés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Client</th>
                          <th className="text-left py-3 px-2 font-medium">Date prévue</th>
                          <th className="text-left py-3 px-2 font-medium">Référence</th>
                          <th className="text-left py-3 px-2 font-medium">Adresse</th>
                          <th className="text-left py-3 px-2 font-medium">Date d'annulation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="font-medium">{appointment.customerName}</div>
                              {appointment.enedisRef && (
                                <div className="text-xs text-muted-foreground">
                                  Ref. Enedis: {appointment.enedisRef}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {appointment.appointmentDate ? (
                                <div>
                                  <div>{formatDateFull(appointment.appointmentDate)}</div>
                                  {appointment.timeSlot && (
                                    <div className="text-xs text-muted-foreground">
                                      {appointment.timeSlot}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">
                                  Non planifié
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-mono text-xs">{appointment.referenceNumber}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-sm truncate max-w-[200px]">
                                {formatAddress(appointment)}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-sm">
                                {new Date(appointment.updatedAt || appointment.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Modale de création/édition de rendez-vous */}
        <AppointmentModal 
          isOpen={showNewAppointmentModal}
          onClose={handleCloseModal}
          leadId={selectedLeadId}
          onAppointmentCreated={(appointmentData) => {
            toast({
              title: "Rendez-vous créé",
              description: `Le rendez-vous a été créé avec succès pour ${appointmentData.customerName}.`,
            });
            handleCloseModal();
          }}
        />
        
        {/* Dialogue de confirmation pour l'annulation d'un rendez-vous */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer l'annulation</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Annuler</Button>
              <Button variant="destructive" onClick={confirmCancelAppointment}>
                {appointmentToCancel ? "Confirmer l'annulation" : "Fermer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialogue de confirmation pour l'envoi de rappel */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer un rappel</DialogTitle>
              <DialogDescription>
                {appointmentToRemind && (
                  <>
                    <p className="my-2">
                      Un email de rappel sera envoyé à <strong>{appointmentToRemind.customerName}</strong> pour le rendez-vous 
                      prévu le <strong>{appointmentToRemind.appointmentDate ? formatDateFull(appointmentToRemind.appointmentDate) : "Non planifié"}</strong>
                      {appointmentToRemind.timeSlot ? ` à ${appointmentToRemind.timeSlot}` : ""}.
                    </p>
                    <p className="my-2">
                      Email: <strong>{appointmentToRemind.email}</strong>
                    </p>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Annuler</Button>
              <Button variant="default" onClick={confirmSendReminder}>
                Envoyer le rappel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}