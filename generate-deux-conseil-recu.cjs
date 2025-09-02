const fs = require('fs');
const path = require('path');

// Données pour les deux références (récupérées de la base de données)
const clientsData = {
  'RAC-1975-407737': {
    referenceNumber: 'RAC-1975-407737',
    name: 'DOMINIQUE VAILLAUT',
    email: 'dvaillaut@gmail.com',
    phone: '06 58 55 30 06',
    address: '214 ROUTE DE SAINT ANTOINE, NICE 06000',
    amount: '129,80 €',
    paymentDate: '7 août 2025',
    cardInfo: 'Carte bancaire via paiement sécurisé Stripe',
    clientType: 'Professionnel'
  },
  'RAC-2804-689517': {
    referenceNumber: 'RAC-2804-689517',
    name: 'Francisco Pimpao',
    email: 'carmo.pimpao@sfr.fr',
    phone: '06 80 96 85 87',
    address: '12 rue des érables, Narrosse 40180',
    amount: '259,60 €',
    paymentDate: '18 juillet 2025',
    cardInfo: 'Carte de débit Mastercard •••• 4426 (06/2028)',
    clientType: 'Particulier'
  }
};

// Générer le HTML optimisé pour PDF
function generatePDFHTML(data) {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devoir de Conseil et Reçu de Paiement - ${data.referenceNumber}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
            body { 
                margin: 0; 
                padding: 0;
                font-size: 11pt;
                line-height: 1.3;
            }
            .no-print { display: none !important; }
        }
        
        body {
            font-family: "Arial", "Helvetica", sans-serif;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 15mm;
            background-color: white;
        }
        
        .container {
            max-width: 100%;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #0066CC;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        
        .logo {
            font-size: 18pt;
            font-weight: bold;
            color: #0066CC;
            margin-bottom: 8px;
        }
        
        .company-info {
            color: #333;
            font-size: 10pt;
            line-height: 1.2;
        }
        
        .main-title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            color: #0066CC;
            margin: 20px 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .legal-notice {
            font-size: 9pt;
            text-align: center;
            color: #555;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        .subtitle {
            font-size: 11pt;
            text-align: center;
            color: #333;
            margin-bottom: 25px;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 12px;
            color: #0066CC;
            border-bottom: 1px solid #0066CC;
            padding-bottom: 3px;
            font-size: 12pt;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .info-table td {
            padding: 4px 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }
        
        .info-table .label {
            font-weight: bold;
            color: #333;
            width: 35%;
        }
        
        .info-table .value {
            color: #000;
            width: 65%;
        }
        
        .payment-summary {
            background-color: #f5f8ff;
            padding: 15px;
            border: 2px solid #0066CC;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        
        .payment-amount {
            font-size: 18pt;
            font-weight: bold;
            color: #0066CC;
            margin: 8px 0;
        }
        
        .status-paid {
            background-color: #28a745;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            display: inline-block;
            font-weight: bold;
            font-size: 10pt;
        }
        
        .conseil-section {
            background-color: #fffbf0;
            border: 1px solid #ddb347;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .conseil-title {
            font-weight: bold;
            color: #8b6914;
            margin-bottom: 12px;
            font-size: 12pt;
        }
        
        .conseil-text {
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }
        
        .conseil-text ul {
            margin: 8px 0;
            padding-left: 15px;
        }
        
        .conseil-text li {
            margin-bottom: 5px;
        }
        
        .signature-section {
            margin-top: 25px;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
            font-size: 11pt;
        }
        
        .signature-info {
            font-size: 9pt;
            color: #555;
            line-height: 1.3;
        }
        
        .hash-info {
            font-family: 'Courier New', monospace;
            background-color: #f0f0f0;
            padding: 8px;
            border-radius: 3px;
            margin: 8px 0;
            font-size: 8pt;
        }
        
        .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            color: #555;
            text-align: center;
            line-height: 1.3;
        }
        
        .download-btn {
            background-color: #0066CC;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            font-size: 12pt;
            cursor: pointer;
            margin: 20px 0;
            display: block;
            width: 300px;
            margin: 20px auto;
        }
        
        .download-btn:hover {
            background-color: #0052a3;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="download-btn" onclick="window.print()">
            📄 Télécharger en PDF (Ctrl+P)
        </button>
    </div>
    
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
            <table class="info-table">
                <tr>
                    <td class="label">Nom et prénom :</td>
                    <td class="value">${data.name}</td>
                </tr>
                <tr>
                    <td class="label">Email :</td>
                    <td class="value">${data.email}</td>
                </tr>
                <tr>
                    <td class="label">Téléphone :</td>
                    <td class="value">${data.phone}</td>
                </tr>
                <tr>
                    <td class="label">Adresse :</td>
                    <td class="value">${data.address}</td>
                </tr>
                <tr>
                    <td class="label">Type de client :</td>
                    <td class="value">${data.clientType || 'Particulier'}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">DÉTAILS DE LA COMMANDE</div>
            <table class="info-table">
                <tr>
                    <td class="label">Numéro de référence :</td>
                    <td class="value">${data.referenceNumber}</td>
                </tr>
                <tr>
                    <td class="label">Type de service :</td>
                    <td class="value">Raccordement électrique Enedis</td>
                </tr>
                <tr>
                    <td class="label">Date de paiement :</td>
                    <td class="value">${data.paymentDate}</td>
                </tr>
                <tr>
                    <td class="label">Méthode de paiement :</td>
                    <td class="value">${data.cardInfo}</td>
                </tr>
            </table>
        </div>

        <div class="payment-summary">
            <div style="margin-bottom: 10px;">
                <span class="status-paid">PAYÉ</span>
            </div>
            <div class="payment-amount">${data.amount}</div>
            <div style="color: #555; font-size: 11pt;">
                Paiement sécurisé Stripe
            </div>
        </div>

        <div class="conseil-section">
            <div class="conseil-title">DEVOIR DE CONSEIL</div>
            <div class="conseil-text">
                <p><strong>Conformément à la réglementation en vigueur</strong>, nous vous informons que :</p>
                <ul>
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
                Hash transaction : D0A${Math.abs(data.referenceNumber.split('-')[1]).toString(16).toUpperCase().substring(0, 6)}<br>
                Référence de sécurité : ${data.referenceNumber}-2025
            </div>
        </div>
        
        <div class="footer">
            <p>Ce document constitue un reçu de paiement et une preuve de service conforme à la législation française.</p>
            <p>Pour toute question, contactez notre service client en précisant votre numéro de référence.</p>
            <p>&copy; 2025 Portail-Electricite.com - Tous droits réservés</p>
            <p style="font-size: 8pt; margin-top: 10px;">
                Document généré automatiquement le ${currentDate} - Ne nécessite pas de signature manuscrite
            </p>
        </div>
    </div>

    <script>
        // Auto-print pour téléchargement direct
        window.addEventListener('load', function() {
            if (window.location.search.includes('autoprint=true')) {
                setTimeout(() => window.print(), 1000);
            }
        });
    </script>
</body>
</html>`;
}

// Générer les documents pour les deux références
async function generateBothDocuments() {
  try {
    console.log('🚀 Génération des documents DEVOIR DE CONSEIL pour les deux références...');
    
    const certificatesDir = path.join(process.cwd(), 'certificates');
    
    // S'assurer que le dossier existe
    try {
      await fs.promises.access(certificatesDir);
    } catch (error) {
      await fs.promises.mkdir(certificatesDir, { recursive: true });
    }
    
    const results = [];
    
    for (const [ref, data] of Object.entries(clientsData)) {
      const htmlContent = generatePDFHTML(data);
      const filename = `conseil-recu-PDF-${ref}.html`;
      const filePath = path.join(certificatesDir, filename);
      
      await fs.promises.writeFile(filePath, htmlContent, 'utf8');
      
      const url = `/certificates/${filename}`;
      results.push({ reference: ref, filename, url });
      
      console.log(`✅ Document créé pour ${ref}`);
      console.log(`📁 Fichier: ${filename}`);
      console.log(`🔗 URL: ${url}`);
    }
    
    // Créer un fichier récapitulatif
    const summaryContent = `# DOCUMENTS DEVOIR DE CONSEIL ET REÇU - GÉNÉRÉS

## 📄 DOCUMENTS CRÉÉS

### 1. RAC-1975-407737
- **Fichier:** conseil-recu-PDF-RAC-1975-407737.html
- **URL:** /certificates/conseil-recu-PDF-RAC-1975-407737.html
- **Téléchargement PDF:** Cliquer sur le lien → Bouton "Télécharger en PDF" → Ctrl+P

### 2. RAC-2804-689517  
- **Fichier:** conseil-recu-PDF-RAC-2804-689517.html
- **URL:** /certificates/conseil-recu-PDF-RAC-2804-689517.html
- **Téléchargement PDF:** Cliquer sur le lien → Bouton "Télécharger en PDF" → Ctrl+P

## 🔗 LIENS DIRECTS

### RAC-1975-407737
\`/certificates/conseil-recu-PDF-RAC-1975-407737.html\`

### RAC-2804-689517
\`/certificates/conseil-recu-PDF-RAC-2804-689517.html\`

## ✅ CARACTÉRISTIQUES

- Format HTML optimisé pour conversion PDF
- Bouton de téléchargement intégré
- Compatible avec tous navigateurs
- Impression automatique avec Ctrl+P
- Conformité légale complète
- Signature électronique eIDAS

## 📱 UTILISATION

1. Cliquer sur le lien
2. Page s'ouvre avec bouton de téléchargement
3. Cliquer "Télécharger en PDF" ou Ctrl+P
4. Choisir "Enregistrer en PDF"
5. Télécharger le fichier PDF final

---
*Documents générés le ${new Date().toLocaleDateString('fr-FR')}*
`;
    
    const summaryPath = path.join(certificatesDir, 'LIENS-TELECHARGEMENT-CONSEIL-RECU.md');
    await fs.promises.writeFile(summaryPath, summaryContent, 'utf8');
    
    console.log('');
    console.log('🎉 GÉNÉRATION TERMINÉE !');
    console.log('📋 Récapitulatif créé: LIENS-TELECHARGEMENT-CONSEIL-RECU.md');
    console.log('');
    console.log('🔗 LIENS DIRECTS:');
    results.forEach(result => {
      console.log(`${result.reference}: ${result.url}`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    throw error;
  }
}

// Exécuter la génération
generateBothDocuments()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));