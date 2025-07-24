import fs from 'fs/promises';
import path from 'path';
import { Lead } from '@shared/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Dossier où les contrats seront stockés
const CONTRACTS_DIR = path.join(process.cwd(), 'public/contracts');

/**
 * Génère un contrat pour un lead
 * Ce contrat servira de support pour les étapes suivantes de la commande
 */
export async function generateContract(lead: Lead): Promise<string> {
  try {
    // S'assurer que le dossier des contrats existe
    await ensureContractsDirectory();
    
    // Générer le contenu HTML du contrat
    const contractHtml = generateContractHtml(lead);
    
    // Nom du fichier basé sur l'ID du lead
    const fileName = `contrat-lead-${lead.id}.html`;
    const filePath = path.join(CONTRACTS_DIR, fileName);
    
    // Écrire le fichier
    await fs.writeFile(filePath, contractHtml, 'utf-8');
    
    // Retourner l'URL relative du contrat
    return `/api/contracts/file/${lead.id}`;
  } catch (error) {
    console.error('Erreur lors de la génération du contrat:', error);
    throw new Error('Impossible de générer le contrat');
  }
}

/**
 * Vérifie si un contrat existe déjà pour un lead donné
 */
export async function contractExists(leadId: number): Promise<boolean> {
  try {
    await ensureContractsDirectory();
    const fileName = `contrat-lead-${leadId}.html`;
    const filePath = path.join(CONTRACTS_DIR, fileName);
    
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Récupère l'URL d'un contrat existant
 */
export async function getContractUrl(leadId: number): Promise<string | null> {
  const exists = await contractExists(leadId);
  if (!exists) {
    return null;
  }
  
  return `/api/contracts/file/${leadId}`;
}

/**
 * S'assure que le répertoire de stockage des contrats existe
 */
async function ensureContractsDirectory(): Promise<void> {
  try {
    await fs.access(CONTRACTS_DIR);
  } catch (error) {
    await fs.mkdir(CONTRACTS_DIR, { recursive: true });
  }
}

/**
 * Génère le contenu HTML du contrat
 */
function generateContractHtml(lead: Lead): string {
  const { 
    id,
    firstName,
    lastName,
    email, 
    phone,
    address,
    serviceType,
    clientType,
    createdAt,
    // Utilisation des propriétés disponibles dans le modèle lead
    // Si currentElectricSupplier, constructionYear, housingType n'existent pas,
    // nous utiliserons des valeurs alternatives
    company,
    buildingType
  } = lead;
  
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Non spécifié';
  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  const creationDate = format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat de Prestation - Lead ${id}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #2563eb;
        }
        .contract-number {
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #2563eb;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .info-row {
            display: flex;
            margin-bottom: 5px;
        }
        .label {
            font-weight: bold;
            width: 210px;
            flex-shrink: 0;
        }
        .value {
            flex-grow: 1;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .disclaimer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .signature {
            margin-top: 40px;
            font-style: italic;
        }
        .signature-area {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            border-top: 1px solid #ddd;
            width: 45%;
            padding-top: 10px;
            text-align: center;
        }
        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            .container {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">RaccordementElec</div>
            <div>Service de raccordement électrique</div>
        </div>
        
        <h1>CONTRAT DE PRESTATION DE SERVICES</h1>
        
        <div class="contract-number">Référence du dossier : LEAD-${id}</div>
        
        <div class="section">
            <div class="section-title">1. PARTIES CONTRACTANTES</div>
            <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
            <p>
                <strong>RaccordementElec</strong>, société spécialisée dans l'accompagnement aux demandes de raccordement électrique, représentée par Marina Alves en qualité de Responsable Client, ci-après dénommée « le Prestataire »,
            </p>
            <p><strong>ET</strong></p>
            <p>
                <strong>${fullName}</strong>, ci-après dénommé(e) « le Client »,
            </p>
            <div class="info-row">
                <div class="label">Email :</div>
                <div class="value">${email || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="label">Téléphone :</div>
                <div class="value">${phone || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="label">Adresse :</div>
                <div class="value">${address || 'Non spécifiée'}</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">2. OBJET DU CONTRAT</div>
            <p>
                Le présent contrat a pour objet la réalisation par le Prestataire, au bénéfice du Client, d'une prestation d'accompagnement à la demande de raccordement électrique pour le bien immobilier situé à l'adresse mentionnée ci-dessus.
            </p>
            <p>
                La mission comprend notamment :
            </p>
            <ul>
                <li>La constitution et le dépôt du dossier de demande de raccordement auprès d'Enedis</li>
                <li>Le suivi du dossier jusqu'à la proposition technique et financière d'Enedis</li>
                <li>L'assistance et le conseil technique pendant toute la durée du processus</li>
            </ul>
        </div>
        
        <div class="section">
            <div class="section-title">3. INFORMATIONS TECHNIQUES</div>
            <div class="info-row">
                <div class="label">Type de client :</div>
                <div class="value">${clientType || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="label">Type de service :</div>
                <div class="value">${serviceType || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="label">Type de bâtiment :</div>
                <div class="value">${buildingType || 'Non spécifié'}</div>
            </div>
            <div class="info-row">
                <div class="label">Société :</div>
                <div class="value">${company || 'Non applicable'}</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">4. CONDITIONS FINANCIÈRES</div>
            <p>
                En contrepartie de la prestation fournie, le Client s'engage à verser au Prestataire la somme forfaitaire de <strong>129,80 € TTC</strong> (cent vingt-neuf euros et quatre-vingts centimes toutes taxes comprises), correspondant à 108,17 € HT plus 21,63 € de TVA (20%).
            </p>
            <p>
                Ce montant est payable intégralement à la signature du présent contrat par carte bancaire via notre plateforme sécurisée de paiement.
            </p>
        </div>
        
        <div class="section">
            <div class="section-title">5. DURÉE ET RÉSILIATION</div>
            <p>
                Le présent contrat prend effet à compter de sa date de signature et se poursuit jusqu'à la réception de la proposition technique et financière d'Enedis, ou pendant une durée maximale de six (6) mois.
            </p>
            <p>
                Le Client dispose d'un droit de rétractation de 14 jours à compter de la signature du contrat. Toutefois, en cas de commencement d'exécution de la prestation avant l'expiration de ce délai, ce droit de rétractation ne pourra plus être exercé.
            </p>
        </div>
        
        <div class="section">
            <div class="section-title">6. OBLIGATIONS DES PARTIES</div>
            <p><strong>Le Prestataire s'engage à :</strong></p>
            <ul>
                <li>Exécuter la prestation avec diligence et professionnalisme</li>
                <li>Tenir le Client informé de l'avancement du dossier</li>
                <li>Respecter la confidentialité des informations communiquées par le Client</li>
            </ul>
            <p><strong>Le Client s'engage à :</strong></p>
            <ul>
                <li>Fournir au Prestataire tous les documents et informations nécessaires à la bonne exécution de la mission</li>
                <li>Répondre aux demandes d'informations complémentaires dans les meilleurs délais</li>
                <li>Régler le montant convenu selon les modalités prévues au contrat</li>
            </ul>
        </div>
        
        <div class="section">
            <div class="section-title">7. LIMITATION DE RESPONSABILITÉ</div>
            <p>
                Le Prestataire n'est tenu qu'à une obligation de moyens dans l'exécution de sa mission. Sa responsabilité ne saurait être engagée en cas de refus ou de retard de la part d'Enedis dans le traitement de la demande de raccordement.
            </p>
        </div>
        
        <div class="section">
            <div class="section-title">8. PROTECTION DES DONNÉES PERSONNELLES</div>
            <p>
                Les données personnelles du Client sont collectées et traitées dans le strict respect des dispositions du Règlement Général sur la Protection des Données (RGPD). Ces données sont utilisées exclusivement dans le cadre de l'exécution du présent contrat.
            </p>
        </div>
        
        <div class="signature-area">
            <div class="signature-box">
                <p>Pour le Prestataire :</p>
                <p>Marina Alves</p>
                <p>Responsable Client</p>
            </div>
            <div class="signature-box">
                <p>Pour le Client :</p>
                <p>${fullName}</p>
                <p>Date: _______________</p>
            </div>
        </div>
        
        <div class="signature">
            Document généré le ${currentDate} à partir de la demande créée le ${creationDate}
        </div>
        
        <div class="footer">
            <div>RaccordementElec - Service de raccordement électrique</div>
            <div>Tél: +33 (0)1 23 45 67 89 - Email: contact@raccordementelec.fr</div>
            <div class="disclaimer">
                Ce document est émis électroniquement et constitue un contrat de prestation de services.
                Il peut être signé électroniquement ou imprimé et signé manuellement.
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Récupère le contenu d'un contrat existant
 */
export async function getContractContent(leadId: number): Promise<string | null> {
  try {
    const fileName = `contrat-lead-${leadId}.html`;
    const filePath = path.join(CONTRACTS_DIR, fileName);
    
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu du contrat:', error);
    return null;
  }
}