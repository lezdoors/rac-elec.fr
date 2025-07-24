import fs from 'fs/promises';
import path from 'path';
import { ServiceRequest } from '@shared/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Dossier où les certificats seront stockés
const CERTIFICATES_DIR = path.join(process.cwd(), 'certificates');

/**
 * Génère un certificat de confirmation pour une demande de service
 * Ce certificat servira de preuve en cas de litige avec Stripe
 */
export async function generateCertificate(serviceRequest: ServiceRequest): Promise<string> {
  try {
    // S'assurer que le dossier des certificats existe
    await ensureCertificatesDirectory();
    
    // Générer le contenu HTML du certificat
    const certificateHtml = generateCertificateHtml(serviceRequest);
    
    // Nom du fichier basé sur la référence
    const fileName = `certificat-${serviceRequest.referenceNumber}.html`;
    const filePath = path.join(CERTIFICATES_DIR, fileName);
    
    // Écrire le fichier
    await fs.writeFile(filePath, certificateHtml, 'utf-8');
    
    // Retourner l'URL relative du certificat
    return `/api/certificates/file/${serviceRequest.referenceNumber}`;
  } catch (error) {
    console.error('Erreur lors de la génération du certificat:', error);
    throw new Error('Impossible de générer le certificat');
  }
}

/**
 * Vérifie si un certificat existe déjà pour une demande donnée
 */
export async function certificateExists(referenceNumber: string): Promise<boolean> {
  try {
    await ensureCertificatesDirectory();
    const fileName = `certificat-${referenceNumber}.html`;
    const filePath = path.join(CERTIFICATES_DIR, fileName);
    
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Récupère l'URL d'un certificat existant
 */
export async function getCertificateUrl(referenceNumber: string): Promise<string | null> {
  const exists = await certificateExists(referenceNumber);
  if (!exists) {
    return null;
  }
  
  return `/api/certificates/file/${referenceNumber}`;
}

/**
 * S'assure que le répertoire de stockage des certificats existe
 */
async function ensureCertificatesDirectory(): Promise<void> {
  try {
    await fs.access(CERTIFICATES_DIR);
  } catch (error) {
    await fs.mkdir(CERTIFICATES_DIR, { recursive: true });
  }
}

/**
 * Génère le contenu HTML du certificat
 */
function generateCertificateHtml(serviceRequest: ServiceRequest): string {
  const { 
    referenceNumber, 
    name, 
    email, 
    phone,
    address,
    clientType,
    serviceType,
    createdAt,
    paymentDate,
    paymentStatus,
    paymentId
  } = serviceRequest;
  
  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  const creationDate = format(new Date(createdAt), 'dd MMMM yyyy', { locale: fr });
  const paymentFormattedDate = paymentDate 
    ? format(new Date(paymentDate), 'dd MMMM yyyy', { locale: fr })
    : 'Non disponible';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat de Demande - ${referenceNumber}</title>
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
        .certificate-number {
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
            width: 180px;
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
            <div>Service de demande de raccordement électrique</div>
        </div>
        
        <h1>CERTIFICAT DE DEMANDE DE RACCORDEMENT ÉLECTRIQUE</h1>
        
        <div class="certificate-number">Référence : ${referenceNumber}</div>
        
        <div class="section">
            <div class="section-title">INFORMATIONS CLIENT</div>
            <div class="info-row">
                <div class="label">Nom :</div>
                <div class="value">${name}</div>
            </div>
            <div class="info-row">
                <div class="label">Email :</div>
                <div class="value">${email}</div>
            </div>
            <div class="info-row">
                <div class="label">Téléphone :</div>
                <div class="value">${phone}</div>
            </div>
            <div class="info-row">
                <div class="label">Type de client :</div>
                <div class="value">${clientType}</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">INFORMATIONS DE DEMANDE</div>
            <div class="info-row">
                <div class="label">Type de service :</div>
                <div class="value">${serviceType}</div>
            </div>
            <div class="info-row">
                <div class="label">Adresse du site :</div>
                <div class="value">${address}</div>
            </div>
            <div class="info-row">
                <div class="label">Date de création :</div>
                <div class="value">${creationDate}</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">INFORMATIONS DE PAIEMENT</div>
            <div class="info-row">
                <div class="label">Statut du paiement :</div>
                <div class="value">${paymentStatus || 'Non disponible'}</div>
            </div>
            <div class="info-row">
                <div class="label">ID de paiement :</div>
                <div class="value">${paymentId || 'Non disponible'}</div>
            </div>
            <div class="info-row">
                <div class="label">Date de paiement :</div>
                <div class="value">${paymentFormattedDate}</div>
            </div>
            <div class="info-row">
                <div class="label">Montant :</div>
                <div class="value">129,80 € TTC</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">DÉCLARATION</div>
            <p>
                Ce certificat atteste officiellement que la demande de raccordement électrique référencée ci-dessus a été enregistrée dans notre système et que le paiement correspondant a été traité.
            </p>
            <p>
                Ce document peut être utilisé comme preuve en cas de litige concernant le service de raccordement électrique.
            </p>
        </div>
        
        <div class="signature">
            Certificat généré automatiquement le ${currentDate}
        </div>
        
        <div class="footer">
            <div>RaccordementElec - Service de raccordement électrique</div>
            <div>Tél: +33 (0)1 23 45 67 89 - Email: contact@raccordementelec.fr</div>
            <div class="disclaimer">
                Ce document est émis électroniquement et ne nécessite pas de signature manuscrite pour être valide.
                Il contient des informations enregistrées concernant la demande ${referenceNumber}.
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Récupère le contenu d'un certificat existant
 */
export async function getCertificateContent(referenceNumber: string): Promise<string | null> {
  try {
    const fileName = `certificat-${referenceNumber}.html`;
    const filePath = path.join(CERTIFICATES_DIR, fileName);
    
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu du certificat:', error);
    return null;
  }
}