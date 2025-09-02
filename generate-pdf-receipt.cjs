const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDFFromHTML() {
  try {
    console.log('🚀 Génération du PDF depuis le fichier HTML...');
    
    // Lire le fichier HTML existant
    const htmlPath = path.join(process.cwd(), 'certificates', 'recu-paiement-RAC-2804-689517.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Charger le contenu HTML
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Chemin de sortie pour le PDF
    const pdfPath = path.join(process.cwd(), 'certificates', 'recu-paiement-RAC-2804-689517.pdf');
    
    // Générer le PDF
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
    
    console.log('✅ PDF généré avec succès !');
    console.log('📁 Chemin :', pdfPath);
    console.log('🔗 URL de téléchargement : /certificates/recu-paiement-RAC-2804-689517.pdf');
    
    return pdfPath;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération PDF :', error);
    
    // En cas d'échec, le fichier HTML reste disponible
    console.log('📄 Le reçu HTML est disponible à : /certificates/recu-paiement-RAC-2804-689517.html');
    
    throw error;
  }
}

generatePDFFromHTML()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));