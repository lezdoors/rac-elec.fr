import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Fonction pour générer le HTML du reçu
function generateReceiptHTML(paymentData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu de Paiement - ${paymentData.referenceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .container {
      background-color: white;
      padding: 40px;
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
    .receipt-title {
      font-size: 28px;
      font-weight: bold;
      color: #0072CE;
      text-align: center;
      margin: 30px 0;
    }
    .receipt-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: #0072CE;
      font-size: 16px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .info-item {
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .payment-summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #0072CE;
      margin: 30px 0;
    }
    .payment-amount {
      font-size: 24px;
      font-weight: bold;
      color: #0072CE;
      text-align: center;
      margin: 15px 0;
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
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .security-note {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
    @media print {
      body { background-color: white; }
      .container { box-shadow: none; }
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

    <div class="receipt-title">REÇU DE PAIEMENT</div>

    <div class="receipt-info">
      <div class="info-section">
        <h3>Informations du client</h3>
        <div class="info-item">
          <span class="info-label">Nom :</span>
          <span class="info-value">${paymentData.clientName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email :</span>
          <span class="info-value">${paymentData.clientEmail}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Téléphone :</span>
          <span class="info-value">${paymentData.clientPhone}</span>
        </div>
      </div>

      <div class="info-section">
        <h3>Détails de la commande</h3>
        <div class="info-item">
          <span class="info-label">Référence :</span>
          <span class="info-value">${paymentData.referenceNumber}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date de paiement :</span>
          <span class="info-value">${paymentData.paymentDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Méthode :</span>
          <span class="info-value">${paymentData.paymentMethod}</span>
        </div>
      </div>
    </div>

    <div class="payment-summary">
      <div style="text-align: center;">
        <span class="status-paid">PAYÉ</span>
      </div>
      <div class="payment-amount">${paymentData.amount}</div>
      <div style="text-align: center; color: #666;">
        Service de raccordement électrique Enedis
      </div>
    </div>

    <div class="security-note">
      <strong>Informations de sécurité :</strong><br>
      Ce reçu officiel atteste que le paiement a bien été reçu et enregistré. Il peut être utilisé comme preuve de paiement.
      Conformément à la réglementation en vigueur, les informations personnelles sont protégées et ne seront pas divulguées à des tiers sans votre consentement explicite.
    </div>
    
    <div class="footer">
      <p>Pour toute question concernant ce reçu, veuillez contacter notre service client en précisant votre numéro de référence.</p>
      <p>&copy; ${new Date().getFullYear()} Portail-Electricite.com - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>`;
}

// Données du paiement
const paymentData = {
  referenceNumber: 'RAC-2804-689517',
  clientName: 'Francisco Pimpao',
  clientEmail: 'carmo.pimpao@sfr.fr',
  clientPhone: '06 80 96 85 87',
  amount: '259,60 €',
  paymentDate: '18 juillet 2025',
  paymentMethod: 'Carte de débit Mastercard •••• 4426 06/2028'
};

async function generatePDFReceipt() {
  try {
    console.log('🔧 Génération du reçu PDF pour', paymentData.referenceNumber);
    
    // Générer le HTML
    const htmlContent = generateReceiptHTML(paymentData);
    
    // Créer le fichier HTML temporaire
    const tempHtmlPath = path.join(process.cwd(), 'certificates', `temp-receipt-${paymentData.referenceNumber}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Chemin de sortie pour le PDF
    const pdfPath = path.join(process.cwd(), 'certificates', `recu-paiement-${paymentData.referenceNumber}.pdf`);
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    console.log('✅ Reçu PDF généré avec succès :', pdfPath);
    console.log('📁 Fichier disponible à :', `/certificates/recu-paiement-${paymentData.referenceNumber}.pdf`);
    
    // Nettoyer le fichier HTML temporaire
    fs.unlinkSync(tempHtmlPath);
    
    return pdfPath;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du reçu :', error);
    throw error;
  }
}

// Exécuter la génération
generatePDFReceipt()
  .then(path => {
    console.log('🎉 Reçu généré avec succès !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Échec de la génération :', error);
    process.exit(1);
  });