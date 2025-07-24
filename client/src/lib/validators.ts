import { z } from "zod";

export const serviceRequestSchema = z.object({
  // Informations du demandeur
  clientType: z.enum(["particulier", "professionnel", "collectivite"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de client" }),
  }),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  // Le champ name est géré automatiquement en combinant firstName et lastName
  name: z.string().optional(),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(/^[0-9]{10}$/, "Le numéro doit contenir exactement 10 chiffres, sans espaces ni caractères spéciaux"),
  company: z.string().optional().or(z.literal("")),
  siret: z.string().optional().or(z.literal("")),

  // Type de demande
  serviceType: z.literal("electricity"),
  requestType: z.enum([
    "new_connection", 
    "power_upgrade", 
    "temporary_connection", 
    "meter_relocation",
    "other"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de demande" }),
  }),
  // Nouveaux champs pour raccordement provisoire et PDL
  temporaryConnectionDate: z.string().optional().or(z.literal("")),
  pdlNumber: z.string().optional().or(z.literal("")),
  pdlUnknown: z.boolean().optional().default(false),
  otherRequestTypeDesc: z.string().optional().or(z.literal("")),
  buildingType: z.enum([
    "individual_house", 
    "apartment_building", 
    "commercial", 
    "industrial",
    "agricultural",
    "public",
    "terrain"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de bâtiment" }),
  }),
  terrainViabilise: z.enum(["viabilise", "non_viabilise"]).optional().or(z.literal("")),
  projectStatus: z.enum([
    "planning", 
    "permit_pending", 
    "permit_approved", 
    "construction_started",
    "construction_completed"
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner l'état du projet" }),
  }),
  permitNumber: z.string().optional().or(z.literal("")),
  permitDeliveryDate: z.string().optional().or(z.literal("")),

  // Adresse
  address: z.string().min(1, "L'adresse est requise"),
  addressComplement: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)"),
  cadastralReference: z.string().optional().or(z.literal("")),

  // Puissance
  powerRequired: z.string().optional().or(z.literal("")),
  phaseType: z.enum(["monophase", "triphase", "je_ne_sais_pas"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de phase" }),
  }).optional().or(z.literal("")),

  // Planning
  desiredCompletionDate: z.string().optional().or(z.literal("")),

  // Facturation
  useDifferentBillingAddress: z.boolean().optional().default(false),
  billingAddress: z.string().optional().or(z.literal("")),
  billingCity: z.string().optional().or(z.literal("")),
  billingPostalCode: z.string().optional().or(z.literal("")).or(
    z.string().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)").optional()
  ),

  // Architecte
  hasArchitect: z.boolean().optional().default(false),
  architectName: z.string().optional().or(z.literal("")),
  architectPhone: z.string().optional().or(z.literal("")),
  architectEmail: z.string().email("Adresse email invalide").optional().or(z.literal("")),

  // Commentaires
  comments: z.string().optional().or(z.literal("")),
  
  // Délais et TVA
  connectionDelay: z.enum(["less-1.5m", "1.5m", "1.5-3m", "3-6m", "6m+"], {
    errorMap: () => ({ message: "Veuillez sélectionner un délai" }),
  }).optional(),
  vatRate: z.enum(["20", "10", "5.5"], {
    errorMap: () => ({ message: "Veuillez sélectionner un taux de TVA" }),
  }).optional(),
  
  // Termes et conditions
  termsAccepted: z.boolean().optional(),
  immediatePurchaseAccepted: z.boolean().optional(),
}).refine((data) => {
  // Validation pour les professionnels (SIREN est optionnel)
  if (data.clientType === "professionnel" && !data.company) {
    return false;
  }
  return true;
}, {
  message: "La raison sociale est requise pour les professionnels",
  path: ["company"]
}).refine((data) => {
  // Validation pour les permis
  if ((data.projectStatus === "permit_pending" || data.projectStatus === "permit_approved") 
      && (!data.permitNumber || !data.permitDeliveryDate)) {
    return false;
  }
  return true;
}, {
  message: "Le numéro de permis et sa date de délivrance sont requis",
  path: ["permitNumber"]
}).refine((data) => {
  // Validation pour l'adresse de facturation
  if (data.useDifferentBillingAddress && (!data.billingAddress || !data.billingCity || !data.billingPostalCode)) {
    return false;
  }
  return true;
}, {
  message: "L'adresse de facturation complète est requise",
  path: ["billingAddress"]
}).refine((data) => {
  // Validation pour l'architecte
  if (data.hasArchitect && (!data.architectName || !data.architectPhone || !data.architectEmail)) {
    return false;
  }
  return true;
}, {
  message: "Les informations de l'architecte sont requises",
  path: ["architectName"]
}).refine((data) => {
  // Validation pour les termes et conditions à l'étape finale
  // Uniquement obligatoire à la soumission finale, pas pendant la navigation
  if (data.termsAccepted === false) {
    return false;
  }
  return true;
}, {
  message: "Vous devez accepter les conditions générales d'utilisation",
  path: ["termsAccepted"]
}).refine((data) => {
  // Validation pour la réalisation immédiate du service
  // Uniquement obligatoire à la soumission finale, pas pendant la navigation
  if (data.immediatePurchaseAccepted === false) {
    return false;
  }
  return true;
}, {
  message: "Vous devez accepter que le service s'exécute immédiatement après le paiement",
  path: ["immediatePurchaseAccepted"]
});

export type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;
