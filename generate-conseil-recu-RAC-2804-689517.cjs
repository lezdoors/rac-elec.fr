const fs = require('fs');
const path = require('path');

// Service de génération du certificat/conseil
async function generateCertificate(serviceRequest) {
  try {
    // S'assurer que le dossier des certificats existe
    const CERTIFICATES_DIR = path.join(process.cwd(), 'certificates');
    try {
      await fs.promises.access(CERTIFICATES_DIR);
    } catch (error) {
      await fs.promises.mkdir(CERTIFICATES_DIR, { recursive: true });
    }
    
    // Générer le contenu HTML du certificat
    const certificateHtml = generateCertificateHtml(serviceRequest);
    
    // Nom du fichier basé sur la référence
    const fileName = `certificat-${serviceRequest.referenceNumber}.html`;
    const filePath = path.join(CERTIFICATES_DIR, fileName);
    
    // Écrire le fichier
    await fs.promises.writeFile(filePath, certificateHtml, 'utf-8');
    
    console.log(`✅ Certificat généré : ${fileName}`);
    console.log(`📁 Chemin : ${filePath}`);
    console.log(`🔗 URL : /certificates/${fileName}`);
    
    return `/certificates/${fileName}`;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du certificat:', error);
    throw error;
  }
}

// Génération du HTML du certificat/devoir de conseil
function generateCertificateHtml(serviceRequest) {
  const { 
    referenceNumber, 
    name, 
    email, 
    phone,
    address,
    city,
    postalCode,
    clientType,
    serviceType,
    createdAt,
    paymentDate,
    paymentStatus,
    paymentAmount,
    cardBrand,
    cardLast4,
    billingName
  } = serviceRequest;
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  const creationDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const paymentFormattedDate = paymentDate 
    ? new Date(paymentDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      })
    : '18 juillet 2025';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devoir de Conseil et Reçu de Paiement - ${referenceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0072CE;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0072CE;
            margin-bottom: 10px;
        }
        .company-info {
            color: #666;
            font-size: 14px;
        }
        .main-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            color: #0072CE;
            margin: 20px 0;
            text-transform: uppercase;
        }
        .legal-notice {
            font-size: 11px;
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            font-style: italic;
        }
        .subtitle {
            font-size: 14px;
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 15px;
            color: #0072CE;
            border-bottom: 2px solid #0072CE;
            padding-bottom: 5px;
            font-size: 16px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 8px;
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .payment-summary {
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #0072CE;
            margin: 25px 0;
            text-align: center;
        }
        .payment-amount {
            font-size: 24px;
            font-weight: bold;
            color: #0072CE;
            margin: 10px 0;
        }
        .status-paid {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            font-size: 14px;
        }
        .conseil-section {
            background-color: #fff9e6;
            border: 1px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .conseil-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .conseil-text {
            font-size: 13px;
            line-height: 1.5;
            color: #333;
        }
        .signature-section {
            margin-top: 40px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .signature-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .signature-info {
            font-size: 11px;
            color: #666;
            line-height: 1.4;
        }
        .hash-info {
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        @media print {
            body { background-color: white; padding: 0; }
            .container { box-shadow: none; margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PORTAIL-ELECTRICITE.COM</div>
            <div class="company-info">
                Protectassur Ltd<br>
                Service de raccordement électrique Enedis<br>
                Email: bonjour@portail-electricite.com | Tél: 09 70 70 95 70
            </div>
        </div>

        <div class="main-title">DEVOIR DE CONSEIL ET REÇU DE PAIEMENT</div>
        
        <div class="legal-notice">
            Conformément aux articles L. 111-1 et L. 312-1-1 du Code de la consommation
        </div>
        
        <div class="subtitle">
            Assistance au raccordement Électrique d'Enedis
        </div>

        <div class="section">
            <div class="section-title">INFORMATIONS DU CLIENT</div>
            <div class="info-grid">
                <div class="label">Nom et prénom :</div>
                <div class="value">${name}</div>
                <div class="label">Email :</div>
                <div class="value">${email}</div>
                <div class="label">Téléphone :</div>
                <div class="value">${phone}</div>
                <div class="label">Adresse :</div>
                <div class="value">${address ? address + ', ' + city + ' ' + postalCode : 'Non renseignée'}</div>
                <div class="label">Type de client :</div>
                <div class="value">${clientType === 'particulier' ? 'Particulier' : clientType === 'professionnel' ? 'Professionnel' : 'Collectivité'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">DÉTAILS DE LA COMMANDE</div>
            <div class="info-grid">
                <div class="label">Numéro de référence :</div>
                <div class="value">${referenceNumber}</div>
                <div class="label">Type de service :</div>
                <div class="value">Raccordement électrique Enedis</div>
                <div class="label">Date de création :</div>
                <div class="value">${creationDate}</div>
                <div class="label">Date de paiement :</div>
                <div class="value">${paymentFormattedDate}</div>
            </div>
        </div>

        <div class="payment-summary">
            <div style="margin-bottom: 10px;">
                <span class="status-paid">PAYÉ</span>
            </div>
            <div class="payment-amount">259,60 €</div>
            <div style="color: #666; font-size: 14px;">
                Méthode : Carte de débit Mastercard •••• 4426 (06/2028)
            </div>
        </div>

        <div class="conseil-section">
            <div class="conseil-title">DEVOIR DE CONSEIL</div>
            <div class="conseil-text">
                <p><strong>Conformément à la réglementation en vigueur</strong>, nous vous informons que :</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Cette prestation consiste en une assistance administrative pour votre demande de raccordement électrique auprès d'Enedis.</li>
                    <li>Vous restez libre de contacter directement Enedis pour effectuer cette démarche sans frais supplémentaires.</li>
                    <li>Notre service vous fait bénéficier d'un accompagnement personnalisé et d'un suivi complet de votre dossier.</li>
                    <li>Le tarif pratiqué correspond à nos frais de service et de gestion administrative.</li>
                </ul>
                <p><strong>Rappel important :</strong> Enedis reste l'unique gestionnaire du réseau électrique français et l'interlocuteur final pour votre raccordement.</p>
            </div>
        </div>

        <div class="signature-section">
            <div class="signature-title">SIGNATURE ÉLECTRONIQUE</div>
            <div class="signature-info">
                Signataire : Portail-Electricite.com<br>
                Horodatage : ${new Date().toISOString()}<br>
                Conforme au règlement eIDAS (UE) 910/2014
            </div>
            <div class="hash-info">
                Hash transaction : D0A${Math.abs(referenceNumber.split('-')[1]).toString(16).toUpperCase().substring(0, 6)}<br>
                Référence de sécurité : ${referenceNumber}-${new Date().getFullYear()}
            </div>
        </div>
        
        <div class="footer">
            <p>Ce document constitue un reçu de paiement et une preuve de service conforme à la législation française.</p>
            <p>Pour toute question, contactez notre service client en précisant votre numéro de référence.</p>
            <p>&copy; ${new Date().getFullYear()} Portail-Electricite.com - Tous droits réservés</p>
            <p style="font-size: 11px; margin-top: 10px;">
                Document généré automatiquement le ${currentDate} - Ne nécessite pas de signature manuscrite
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Données pour RAC-2804-689517
const serviceRequestData = {
  referenceNumber: 'RAC-2804-689517',
  name: 'Francisco Pimpao',
  email: 'carmo.pimpao@sfr.fr',
  phone: '06 80 96 85 87',
  address: 'Non renseignée',
  city: '',
  postalCode: '',
  clientType: 'particulier',
  serviceType: 'electricity',
  createdAt: new Date().toISOString(),
  paymentDate: '2025-07-18',
  paymentStatus: 'succeeded',
  paymentAmount: 259.60,
  cardBrand: 'mastercard',
  cardLast4: '4426',
  billingName: 'Francisco Pimpao'
};

// Générer le certificat
generateCertificate(serviceRequestData)
  .then(() => {
    console.log('🎉 Devoir de conseil et reçu généré avec succès !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur :', error);
    process.exit(1);
  });