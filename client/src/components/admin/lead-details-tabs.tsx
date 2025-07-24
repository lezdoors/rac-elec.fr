import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Lead } from "@shared/schema";

interface LeadDetailsTabsProps {
  leadDetails: Lead;
}

export function LeadDetailsTabs({ leadDetails }: LeadDetailsTabsProps) {
  // Formatage des dates si elles existent
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non renseigné";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch (e) {
      return dateString;
    }
  };

  // Formatage des timestamps si elles existent
  const formatTimestamp = (date: Date | null | undefined) => {
    if (!date) return "Non renseigné";
    try {
      return new Date(date).toLocaleString("fr-FR");
    } catch (e) {
      return "Date invalide";
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="step1" className="p-4">
          <TabsList className="mb-4">
            <TabsTrigger value="step1">Informations client</TabsTrigger>
            <TabsTrigger value="step2">Type de demande</TabsTrigger>
            <TabsTrigger value="step3">Adresse & technique</TabsTrigger>
            <TabsTrigger value="step4">Planning & facturation</TabsTrigger>
            <TabsTrigger value="step5">Métadonnées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="step1" className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Type de client:</span>
                  <span>{leadDetails.clientType === "particulier" ? "Particulier" :
                    leadDetails.clientType === "professionnel" ? "Professionnel" :
                    leadDetails.clientType === "collectivite" ? "Collectivité" : "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Nom complet:</span>
                  <span>
                    {(leadDetails.firstName || leadDetails.lastName) ? 
                      `${leadDetails.firstName || ''} ${leadDetails.lastName || ''}`.trim() : 
                      (leadDetails.email ? `<${leadDetails.email}>` : "Non renseigné")}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Email:</span>
                  <span>{leadDetails.email || "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Téléphone:</span>
                  <span>{leadDetails.phone || "Non renseigné"}</span>
                </div>
                {leadDetails.clientType === "professionnel" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <span className="text-slate-500">Entreprise:</span>
                      <span>{leadDetails.company || "Non renseigné"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <span className="text-slate-500">SIRET:</span>
                      <span>{leadDetails.siret || "Non renseigné"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step2" className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Type de demande</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Service:</span>
                  <span>{leadDetails.serviceType === "electricity" ? "Électricité" : leadDetails.serviceType || "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Type:</span>
                  <span>
                    {leadDetails.requestType === "new_connection" ? "Nouveau raccordement" :
                     leadDetails.requestType === "power_upgrade" ? "Modification de puissance" :
                     leadDetails.requestType === "temporary_connection" ? "Raccordement temporaire" :
                     leadDetails.requestType === "relocation" ? "Déplacement d'ouvrage" :
                     leadDetails.requestType === "technical_visit" ? "Visite technique" :
                     leadDetails.requestType === "other" ? "Autre" : "Non renseigné"}
                  </span>
                </div>
                {leadDetails.requestType === "other" && (
                  <div className="grid grid-cols-[120px_1fr] gap-1">
                    <span className="text-slate-500">Description:</span>
                    <span>{leadDetails.otherRequestTypeDesc || "Non renseigné"}</span>
                  </div>
                )}
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Bâtiment:</span>
                  <span>
                    {leadDetails.buildingType === "individual_house" ? "Maison individuelle" :
                     leadDetails.buildingType === "apartment_building" ? "Immeuble" :
                     leadDetails.buildingType === "commercial" ? "Local commercial" :
                     leadDetails.buildingType === "industrial" ? "Bâtiment industriel" :
                     leadDetails.buildingType === "agricultural" ? "Exploitation agricole" :
                     leadDetails.buildingType === "public" ? "Bâtiment public" :
                     leadDetails.buildingType === "terrain" ? "Terrain" : "Non renseigné"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[135px_1fr] gap-1">
                  <span className="text-slate-500">Terrain:</span>
                  <span>
                    {leadDetails.terrainViabilise === "viabilise" ? "Terrain viabilisé" :
                     leadDetails.terrainViabilise === "non_viabilise" ? "Terrain non viabilisé" : "Non renseigné"}
                  </span>
                </div>
                <div className="grid grid-cols-[135px_1fr] gap-1">
                  <span className="text-slate-500">État projet:</span>
                  <span>
                    {leadDetails.projectStatus === "planning" ? "En phase de projet" :
                     leadDetails.projectStatus === "permit_pending" ? "Permis déposé" :
                     leadDetails.projectStatus === "permit_approved" ? "Permis approuvé" :
                     leadDetails.projectStatus === "construction_started" ? "Construction démarrée" :
                     leadDetails.projectStatus === "construction_completed" ? "Construction terminée" : "Non renseigné"}
                  </span>
                </div>
                <div className="grid grid-cols-[135px_1fr] gap-1">
                  <span className="text-slate-500">Permis n°:</span>
                  <span>{leadDetails.permitNumber || "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[135px_1fr] gap-1">
                  <span className="text-slate-500">Date permis:</span>
                  <span>{formatDate(leadDetails.permitDeliveryDate)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step3" className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Adresse & Détails techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Adresse:</span>
                  <span>{leadDetails.address || "Non renseigné"}</span>
                </div>
                {leadDetails.addressComplement && (
                  <div className="grid grid-cols-[120px_1fr] gap-1">
                    <span className="text-slate-500">Complément:</span>
                    <span>{leadDetails.addressComplement}</span>
                  </div>
                )}
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Ville:</span>
                  <span>{leadDetails.city || "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Code postal:</span>
                  <span>{leadDetails.postalCode || "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Réf. cadastrale:</span>
                  <span>{leadDetails.cadastralReference || "Non renseigné"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Puissance:</span>
                  <span>{leadDetails.powerRequired ? `${leadDetails.powerRequired} kVA` : "Non renseigné"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <span className="text-slate-500">Phase:</span>
                  <span>{leadDetails.phaseType === "monophase" ? "Monophasé" : leadDetails.phaseType === "triphase" ? "Triphasé" : "Non renseigné"}</span>
                </div>

                {leadDetails.hasArchitect && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-1 mt-4">
                      <span className="text-slate-500 font-medium">Architecte:</span>
                      <span></span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <span className="text-slate-500">Nom:</span>
                      <span>{leadDetails.architectName || "Non renseigné"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <span className="text-slate-500">Téléphone:</span>
                      <span>{leadDetails.architectPhone || "Non renseigné"}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <span className="text-slate-500">Email:</span>
                      <span>{leadDetails.architectEmail || "Non renseigné"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step4" className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Planning et facturation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Date souhaitée:</span>
                  <span>{formatDate(leadDetails.desiredCompletionDate)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Délai connexion:</span>
                  <span>{leadDetails.connectionDelay || "Non spécifié"}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Achat immédiat:</span>
                  <span>{leadDetails.immediatePurchaseAccepted ? "Oui" : "Non"}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">CGV acceptées:</span>
                  <span>{leadDetails.termsAccepted ? "Oui" : "Non"}</span>
                </div>
              </div>
              <div className="space-y-2">
                {(leadDetails.billingAddress || leadDetails.billingCity || leadDetails.billingPostalCode) && (
                  <>
                    <div className="grid grid-cols-[150px_1fr] gap-1 mt-1">
                      <span className="text-slate-500 font-medium">Adresse de facturation:</span>
                      <span></span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-1">
                      <span className="text-slate-500">Adresse:</span>
                      <span>{leadDetails.billingAddress || "Identique à l'adresse du projet"}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-1">
                      <span className="text-slate-500">Ville:</span>
                      <span>{leadDetails.billingCity || "Non renseigné"}</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-1">
                      <span className="text-slate-500">Code postal:</span>
                      <span>{leadDetails.billingPostalCode || "Non renseigné"}</span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-[150px_1fr] gap-1 mt-4">
                  <span className="text-slate-500">Commentaires:</span>
                  <span className="whitespace-pre-line">{leadDetails.comments || "Aucun commentaire"}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="step5" className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Métadonnées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[140px_1fr] gap-1">
                  <span className="text-slate-500">Référence:</span>
                  <span className="font-medium">{leadDetails.referenceNumber || "Non générée"}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-1">
                  <span className="text-slate-500">Prix standard:</span>
                  <span className="font-medium">129,80 € TTC</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-1">
                  <span className="text-slate-500">TVA:</span>
                  <span className="font-medium">{leadDetails.vatRate || "20%"}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-1">
                  <span className="text-slate-500">Statut:</span>
                  <span className="font-medium">
                    {leadDetails.isCompleted ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Complété
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> En progression
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Créé le:</span>
                  <span>{formatTimestamp(leadDetails.createdAt)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Mis à jour le:</span>
                  <span>{formatTimestamp(leadDetails.updatedAt)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Dernière activité:</span>
                  <span>{formatTimestamp(leadDetails.lastTouchedAt)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Progression:</span>
                  <span>{leadDetails.completedSteps}/5 étapes</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-1">
                  <span className="text-slate-500">Converti en demande:</span>
                  <span>{leadDetails.convertedToRequest ? "Oui" : "Non"}</span>
                </div>
                {leadDetails.ipAddress && (
                  <div className="grid grid-cols-[150px_1fr] gap-1">
                    <span className="text-slate-500">IP:</span>
                    <span className="font-mono text-xs">{leadDetails.ipAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}