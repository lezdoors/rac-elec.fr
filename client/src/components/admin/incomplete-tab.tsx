import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface IncompleteLeadsTabProps {
  leadsLoading: boolean;
  incompleteLeadsData: {
    success: boolean;
    leads: any[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  } | undefined;
  currentPage: number;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  openDetailsDialog: (leadId: number) => void;
  openAssignDialog: (leadId: number) => void;
  title?: string;
  description?: string;
}

export function IncompleteLeadsTab({
  leadsLoading,
  incompleteLeadsData,
  currentPage,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  openDetailsDialog,
  openAssignDialog,
  title = "Leads incomplets",
  description = "Formulaires partiellement remplis par les utilisateurs"
}: IncompleteLeadsTabProps) {
  const { toast } = useToast();
  return (
    <>
      {leadsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !incompleteLeadsData?.leads || incompleteLeadsData.leads.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Aucun {title.toLowerCase()} trouvé.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Référence</th>
                    <th className="text-left py-3 px-2 font-medium">Client</th>
                    <th className="text-left py-3 px-2 font-medium">Source</th>
                    <th className="text-left py-3 px-2 font-medium">Étape</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-right py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incompleteLeadsData.leads.map((lead: any) => {
                    const createdDate = new Date(lead.createdAt);
                    const formattedDate = createdDate.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    });
                    
                    return (
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="font-mono text-xs text-blue-600">
                            {lead.referenceNumber || lead.reference_number || `#${lead.id}`}
                          </div>
                          {lead.sessionToken && (
                            <div className="text-xs text-gray-500 mt-1">
                              Session: {lead.sessionToken.substring(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {/* Priorité : firstName + lastName, puis name, puis email */}
                            {(lead.firstName || lead.lastName) ? 
                              `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : 
                              (lead.name ? lead.name : 
                              (lead.email ? `<${lead.email}>` : "Non renseigné"))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.email || "Email non fourni"}
                            {lead.phone && (
                              <span className="ml-2 text-blue-600">• {lead.phone}</span>
                            )}
                          </div>
                          {/* Afficher le type de client si disponible */}
                          {lead.clientType && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {lead.clientType === 'particulier' ? 'Particulier' : 
                                 lead.clientType === 'professionnel' ? 'Professionnel' : 
                                 lead.clientType}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {/* Colonne Source - Email vs Web */}
                          {lead.referenceNumber && lead.referenceNumber.includes('LEAD-') ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              📧 Email
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                              🌐 Web
                            </Badge>
                          )}
                          {/* Afficher le service demandé si disponible */}
                          {lead.serviceType && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {lead.serviceType === 'electricity' ? 'Électricité' : 
                               lead.serviceType === 'photovoltaic' ? 'Photovoltaïque' : 
                               lead.serviceType}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {lead.completedSteps === 3 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Complet ✓</Badge>
                          ) : (
                            <Badge variant="outline">Étape {Math.max(1, lead.completedSteps || 1)}/3</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {lead.status ? (
                            <Badge variant="secondary" className={`
                              ${lead.status === LEAD_STATUS.INTERESTED ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                              ${lead.status === LEAD_STATUS.NOT_INTERESTED ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                              ${lead.status === LEAD_STATUS.NO_RESPONSE ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}
                              ${lead.status === LEAD_STATUS.CALLBACK_SCHEDULED ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                              ${lead.status === LEAD_STATUS.NEW || !lead.status ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
                            `}>
                              {lead.status === LEAD_STATUS.INTERESTED && 'Intéressé'}
                              {lead.status === LEAD_STATUS.NOT_INTERESTED && 'Non intéressé'}
                              {lead.status === LEAD_STATUS.NO_RESPONSE && 'Sans réponse'}
                              {lead.status === LEAD_STATUS.CALLBACK_SCHEDULED && 'Rappel programmé'}
                              {(lead.status === LEAD_STATUS.NEW || !lead.status) && 'Nouveau'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Nouveau</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            {lead.phone && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="WhatsApp"
                                onClick={() => {
                                  // Formatter le numéro de téléphone en supprimant les espaces et en ajoutant le préfixe +33 si nécessaire
                                  let phoneNumber = lead.phone.replace(/\s+/g, '');
                                  if (phoneNumber.startsWith('0')) {
                                    phoneNumber = '+33' + phoneNumber.substring(1);
                                  } else if (!phoneNumber.startsWith('+')) {
                                    phoneNumber = '+33' + phoneNumber;
                                  }
                                  
                                  // Préparer le message pré-rédigé avec les bonnes données
                                  const clientName = (lead.firstName || lead.lastName) ? 
                                    `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : 
                                    (lead.name || 'Client');
                                  const message = `Bonjour ${clientName}, nous avons bien reçu votre demande de raccordement électrique. L'équipe demande-raccordement.fr souhaite vous contacter pour finaliser votre dossier.`;
                                  
                                  // Ouvrir WhatsApp dans un nouvel onglet
                                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.6 6.32A7.85 7.85 0 0 0 12.025 4c-4.4 0-7.975 3.58-7.975 7.98a8.06 8.06 0 0 0 1.065 4.02L4 20l4.1-1.08a7.88 7.88 0 0 0 3.775.965h.004c4.4 0 7.975-3.58 7.975-7.98a8.05 8.05 0 0 0-2.254-5.585zM12.025 18.37h-.003a6.58 6.58 0 0 1-3.335-.92l-.24-.144-2.48.652.66-2.425-.156-.25a6.56 6.56 0 0 1-1.01-3.505 6.48 6.48 0 0 1 6.565-6.56c1.75 0 3.4.685 4.65 1.925a6.565 6.565 0 0 1 1.935 4.66c-.005 3.64-2.965 6.565-6.585 6.565zm3.595-4.92c-.2-.1-1.175-.58-1.36-.65-.18-.065-.315-.1-.445.1-.13.195-.51.645-.62.775-.115.13-.23.145-.43.05-.2-.1-.845-.31-1.605-.995-.595-.535-.995-1.2-1.115-1.4-.115-.2-.01-.31.09-.41.09-.09.2-.235.3-.355.1-.115.135-.2.2-.33.065-.135.035-.25-.015-.35-.05-.1-.445-1.075-.61-1.47-.16-.39-.32-.335-.445-.34-.115-.01-.245-.01-.375-.01s-.345.05-.525.25c-.18.2-.685.67-.685 1.64 0 .97.705 1.905.8 2.035.095.135 1.36 2.075 3.295 2.915 1.94.84 1.94.56 2.29.525.35-.035 1.125-.46 1.285-.91.16-.44.16-.82.115-.9-.05-.075-.18-.12-.38-.21z"/>
                                </svg>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Voir les détails"
                              onClick={() => openDetailsDialog(lead.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Assigner"
                              onClick={() => openAssignDialog(lead.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
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
              Affichage de {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, incompleteLeadsData.pagination.total)}
              sur {incompleteLeadsData.pagination.total} {title.toLowerCase()}{incompleteLeadsData.pagination.total !== 1 ? "s" : ""}
            </div>

            {incompleteLeadsData.pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(incompleteLeadsData.pagination.totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (incompleteLeadsData.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= incompleteLeadsData.pagination.totalPages - 2) {
                      pageNum = incompleteLeadsData.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= incompleteLeadsData.pagination.totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </>
  );
}
