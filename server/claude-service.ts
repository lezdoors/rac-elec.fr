import Anthropic from '@anthropic-ai/sdk';
import { ServiceRequest } from '@shared/schema';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

export class ClaudeService {
  // Analyze a service request and provide insights
  async analyzeServiceRequest(serviceRequest: ServiceRequest): Promise<string> {
    try {
      const prompt = `
Analyse détaillée d'une demande de raccordement électrique :

Référence: ${serviceRequest.referenceNumber}
Client: ${serviceRequest.name} (${serviceRequest.clientType})
Type de demande: ${serviceRequest.requestType}
Type de bâtiment: ${serviceRequest.buildingType}
Statut du projet: ${serviceRequest.projectStatus}
Adresse: ${serviceRequest.address}, ${serviceRequest.postalCode} ${serviceRequest.city}
Puissance demandée: ${serviceRequest.powerRequired} kVA
Type d'alimentation: ${serviceRequest.phaseType || "Non spécifié"}
Date souhaitée: ${serviceRequest.desiredCompletionDate || "Non spécifiée"}

Commentaires du client: ${serviceRequest.comments || "Aucun commentaire fourni"}

En tant qu'expert en raccordement électrique, analyse cette demande et fournis les informations suivantes :
1. Évaluation générale de la demande
2. Points d'attention particuliers
3. Estimation approximative du coût total (basée sur les données fournies)
4. Délai estimé pour ce type de raccordement
5. Recommandations pour le traitement de cette demande

Utilise un format structuré et concis pour ta réponse.
`;

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle the response content correctly
      if (message.content && message.content[0] && message.content[0].type === 'text') {
        return message.content[0].text;
      }
      
      return "Une erreur est survenue lors de l'analyse. Contenu de réponse inattendu.";
    } catch (error) {
      console.error('Error analyzing service request with Claude:', error);
      return "Une erreur est survenue lors de l'analyse de la demande. Veuillez réessayer ultérieurement.";
    }
  }

  // Generate a personalized response to a customer
  async generateCustomerResponse(serviceRequest: ServiceRequest): Promise<string> {
    try {
      const prompt = `
Tu es un assistant du service client spécialisé dans les raccordements électriques pour Enedis. Génère un email de réponse personnalisé pour ce client qui a fait une demande de raccordement.

Informations du client et de sa demande :
- Nom: ${serviceRequest.name}
- Email: ${serviceRequest.email}
- Type de client: ${serviceRequest.clientType}
- Type de demande: ${serviceRequest.requestType}
- Type de bâtiment: ${serviceRequest.buildingType}
- Puissance demandée: ${serviceRequest.powerRequired} kVA
- Référence: ${serviceRequest.referenceNumber}
- Date de création: ${new Date(serviceRequest.createdAt).toLocaleDateString('fr-FR')}

L'email doit :
1. Remercier le client pour sa demande
2. Confirmer la réception de sa demande avec le numéro de référence
3. Expliquer brièvement les prochaines étapes
4. Donner une estimation générale des délais
5. Proposer un moyen de contact pour toute question supplémentaire

L'email doit être professionnel, chaleureux, et écrit en français. N'inclus pas les formules d'appel et de politesse (Cher, Cordialement, etc.), juste le corps de l'email.
`;

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle the response content correctly
      if (message.content && message.content[0] && message.content[0].type === 'text') {
        return message.content[0].text;
      }
      
      return "Une erreur est survenue lors de la génération de la réponse. Contenu de réponse inattendu.";
    } catch (error) {
      console.error('Error generating customer response with Claude:', error);
      return "Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer ultérieurement.";
    }
  }

  // Estimate the price based on service request details
  async estimatePrice(serviceRequest: ServiceRequest): Promise<string> {
    try {
      const prompt = `
En tant qu'expert en raccordement électrique, estime le coût approximatif de ce raccordement en euros basé sur les informations suivantes:

Type de client: ${serviceRequest.clientType}
Type de demande: ${serviceRequest.requestType}
Type de bâtiment: ${serviceRequest.buildingType}
Statut du projet: ${serviceRequest.projectStatus}
Puissance demandée: ${serviceRequest.powerRequired} kVA
Type d'alimentation: ${serviceRequest.phaseType || "Non spécifié"}

Fournis une fourchette de prix (minimum-maximum) en euros et une brève explication des facteurs qui influencent cette estimation. Ton estimation doit être réaliste et basée sur les tarifs actuels d'Enedis.
`;

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle the response content correctly
      if (message.content && message.content[0] && message.content[0].type === 'text') {
        return message.content[0].text;
      }
      
      return "Une erreur est survenue lors de l'estimation du prix. Contenu de réponse inattendu.";
    } catch (error) {
      console.error('Error estimating price with Claude:', error);
      return "Une erreur est survenue lors de l'estimation du prix. Veuillez réessayer ultérieurement.";
    }
  }

  // Answer a specific question about service requests
  async answerQuestion(question: string, context?: string): Promise<string> {
    try {
      const prompt = `
Tu es un assistant spécialisé dans les raccordements électriques en France. Réponds à la question suivante de manière précise, professionnelle et utile.

Question: ${question}

${context ? `Contexte supplémentaire: ${context}` : ''}

Ta réponse doit être factuelle, informative et adaptée au contexte du raccordement électrique en France. Si tu ne connais pas la réponse avec certitude, indique-le clairement.
`;

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      // Handle the response content correctly
      if (message.content && message.content[0] && message.content[0].type === 'text') {
        return message.content[0].text;
      }
      
      return "Une erreur est survenue lors du traitement de votre question. Contenu de réponse inattendu.";
    } catch (error) {
      console.error('Error answering question with Claude:', error);
      return "Une erreur est survenue lors du traitement de votre question. Veuillez réessayer ultérieurement.";
    }
  }
}