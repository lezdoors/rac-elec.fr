/**
 * Script d'analyse des performances Web simplifiée
 * 
 * Ce script utilise puppeteer pour mesurer les performances de base
 * de notre site et des sites concurrents
 */

import fs from 'fs-extra';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des sites à analyser
const SITES = [
  {
    name: 'Raccordement.net',
    url: 'https://raccordement.net/',
    isMainSite: true
  },
  {
    name: 'Mon-Raccordement-Electricite',
    url: 'https://mon-raccordement-electricite.fr/',
    isCompetitor: true
  },
  {
    name: 'Raccordement-Connect',
    url: 'https://demande-raccordement.fr/',
    isCompetitor: true
  }
];

// Dossier pour stocker les rapports
const REPORTS_DIR = path.join(__dirname, '../analysis-reports');

/**
 * Mesure les performances de chargement d'un site
 */
async function measurePerformance(site) {
  console.log(`Analyse de ${site.name} (${site.url})...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Activer les CDP pour collecter les métriques de performance
    await page.setRequestInterception(true);
    
    // Collecter les ressources et leur taille
    const resourceData = {
      totalRequests: 0,
      cssCount: 0,
      jsCount: 0,
      imageCount: 0,
      fontCount: 0,
      otherCount: 0,
      totalSize: 0
    };
    
    page.on('request', request => {
      resourceData.totalRequests++;
      request.continue();
    });
    
    page.on('response', async response => {
      const contentType = response.headers()['content-type'] || '';
      const contentLength = parseInt(response.headers()['content-length'] || '0', 10);
      
      resourceData.totalSize += contentLength;
      
      if (contentType.includes('text/css')) {
        resourceData.cssCount++;
      } else if (contentType.includes('javascript')) {
        resourceData.jsCount++;
      } else if (contentType.includes('image/')) {
        resourceData.imageCount++;
      } else if (contentType.includes('font/') || contentType.includes('application/font')) {
        resourceData.fontCount++;
      } else {
        resourceData.otherCount++;
      }
    });
    
    // Mesurer le temps de chargement
    const startTime = Date.now();
    
    // Collecter les métriques de performance
    await page.goto(site.url, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    const loadTime = Date.now() - startTime;
    
    // Prendre une capture d'écran
    await fs.ensureDir(REPORTS_DIR);
    const screenshotPath = path.join(REPORTS_DIR, `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-screenshot.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Exécuter des mesures directes dans la page
    const performanceMetrics = await page.evaluate(() => {
      const performance = window.performance;
      const timing = performance.timing;
      
      return {
        // Temps de chargement du DOM
        domLoading: timing.domLoading - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        
        // Temps réseau
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnect: timing.connectEnd - timing.connectStart,
        requestStart: timing.requestStart - timing.navigationStart,
        responseStart: timing.responseStart - timing.navigationStart,
        responseEnd: timing.responseEnd - timing.navigationStart,
        
        // Performance totale
        loadTime: timing.loadEventEnd - timing.navigationStart,
        
        // Ressources
        resourceCount: performance.getEntriesByType('resource').length,
      };
    });
    
    // Mesurer l'accessibilité, les balises meta, etc.
    const seoData = await page.evaluate(() => {
      // Vérifier la présence des balises meta essentielles
      const metaTags = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        viewport: document.querySelector('meta[name="viewport"]')?.content,
        robots: document.querySelector('meta[name="robots"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
      };
      
      // Vérifier l'accessibilité de base
      const accessibilityIssues = [];
      
      // Images sans attribut alt
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;
      if (imagesWithoutAlt > 0) {
        accessibilityIssues.push(`${imagesWithoutAlt} images sans attribut alt`);
      }
      
      // Liens sans texte
      const emptyLinks = Array.from(document.querySelectorAll('a')).filter(a => !a.textContent.trim()).length;
      if (emptyLinks > 0) {
        accessibilityIssues.push(`${emptyLinks} liens sans texte`);
      }
      
      // Vérifier structure des en-têtes
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.tagName);
      const h1Count = headings.filter(h => h === 'H1').length;
      if (h1Count === 0) {
        accessibilityIssues.push('Pas de H1 sur la page');
      } else if (h1Count > 1) {
        accessibilityIssues.push(`${h1Count} balises H1 (devrait être unique)`);
      }
      
      return {
        metaTags,
        accessibilityIssues,
        headingsCount: headings.length,
        h1Count,
        linkCount: document.querySelectorAll('a').length,
        buttonCount: document.querySelectorAll('button').length,
        formCount: document.querySelectorAll('form').length,
      };
    });
    
    return {
      name: site.name,
      url: site.url,
      loadTime,
      screenshotPath,
      performanceMetrics,
      resourceData,
      seoData
    };
  } finally {
    await browser.close();
  }
}

/**
 * Génère un rapport HTML avec les résultats
 */
async function generateReport(results) {
  // Créer le dossier de rapports s'il n'existe pas
  await fs.ensureDir(REPORTS_DIR);
  
  // Générer une table comparative
  let tableRows = '';
  results.forEach(result => {
    tableRows += `
      <tr>
        <td>${result.name}</td>
        <td>${result.loadTime} ms</td>
        <td>${result.performanceMetrics.domComplete} ms</td>
        <td>${result.resourceData.totalRequests}</td>
        <td>${Math.round(result.resourceData.totalSize / 1024)} KB</td>
        <td>${result.resourceData.jsCount}</td>
        <td>${result.resourceData.cssCount}</td>
        <td>${result.resourceData.imageCount}</td>
        <td>${result.seoData.h1Count}</td>
        <td>${result.seoData.metaTags.description ? 'Oui' : 'Non'}</td>
      </tr>
    `;
  });
  
  // Générer les sections détaillées pour chaque site
  let detailedSections = '';
  results.forEach(result => {
    detailedSections += `
      <section class="site-details">
        <h2>${result.name}</h2>
        <p>URL: <a href="${result.url}" target="_blank">${result.url}</a></p>
        
        <div class="metrics-container">
          <div class="metrics-column">
            <h3>Métriques de performance</h3>
            <table>
              <tr>
                <th>Métrique</th>
                <th>Valeur</th>
              </tr>
              <tr>
                <td>Temps de chargement total</td>
                <td>${result.loadTime} ms</td>
              </tr>
              <tr>
                <td>DOM interactif</td>
                <td>${result.performanceMetrics.domInteractive} ms</td>
              </tr>
              <tr>
                <td>DOM chargé</td>
                <td>${result.performanceMetrics.domContentLoaded} ms</td>
              </tr>
              <tr>
                <td>DOM complet</td>
                <td>${result.performanceMetrics.domComplete} ms</td>
              </tr>
            </table>
            
            <h3>Ressources</h3>
            <table>
              <tr>
                <th>Type</th>
                <th>Nombre</th>
              </tr>
              <tr>
                <td>JavaScript</td>
                <td>${result.resourceData.jsCount}</td>
              </tr>
              <tr>
                <td>CSS</td>
                <td>${result.resourceData.cssCount}</td>
              </tr>
              <tr>
                <td>Images</td>
                <td>${result.resourceData.imageCount}</td>
              </tr>
              <tr>
                <td>Polices</td>
                <td>${result.resourceData.fontCount}</td>
              </tr>
              <tr>
                <td>Autres</td>
                <td>${result.resourceData.otherCount}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${result.resourceData.totalRequests}</strong></td>
              </tr>
              <tr>
                <td><strong>Taille totale</strong></td>
                <td><strong>${Math.round(result.resourceData.totalSize / 1024)} KB</strong></td>
              </tr>
            </table>
          </div>
          
          <div class="metrics-column">
            <h3>SEO & Accessibilité</h3>
            <table>
              <tr>
                <th>Élément</th>
                <th>Valeur</th>
              </tr>
              <tr>
                <td>Titre</td>
                <td>${result.seoData.metaTags.title || 'Non défini'}</td>
              </tr>
              <tr>
                <td>Meta Description</td>
                <td>${result.seoData.metaTags.description || 'Non définie'}</td>
              </tr>
              <tr>
                <td>Meta Viewport</td>
                <td>${result.seoData.metaTags.viewport || 'Non défini'}</td>
              </tr>
              <tr>
                <td>Canonical URL</td>
                <td>${result.seoData.metaTags.canonical || 'Non définie'}</td>
              </tr>
              <tr>
                <td>Nombre de H1</td>
                <td>${result.seoData.h1Count}</td>
              </tr>
              <tr>
                <td>Nombre total d'en-têtes</td>
                <td>${result.seoData.headingsCount}</td>
              </tr>
              <tr>
                <td>Problèmes d'accessibilité</td>
                <td>${result.seoData.accessibilityIssues.length > 0 ? result.seoData.accessibilityIssues.join('<br>') : 'Aucun problème détecté'}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <h3>Capture d'écran</h3>
        <img src="${path.basename(result.screenshotPath)}" alt="Capture d'écran de ${result.name}" style="max-width: 100%; border: 1px solid #ccc;">
      </section>
    `;
  });
  
  // Générer des recommandations pour notre site
  const ourSite = results.find(result => result.url.includes('raccordement.net'));
  const recommendationSection = ourSite ? `
    <section class="recommendations">
      <h2>Recommandations pour Raccordement.net</h2>
      
      <h3>Performance</h3>
      <ul>
        ${ourSite.loadTime > 3000 ? '<li>⚠️ Le temps de chargement total dépasse 3 secondes. Optimisez davantage les ressources.</li>' : ''}
        ${ourSite.performanceMetrics.domInteractive > 2000 ? '<li>⚠️ Le temps avant interaction dépasse 2 secondes. Réduisez le JavaScript bloquant.</li>' : ''}
        ${ourSite.resourceData.jsCount > 15 ? '<li>⚠️ Nombre élevé de fichiers JavaScript ('+ourSite.resourceData.jsCount+'). Envisagez de les regrouper.</li>' : ''}
        ${ourSite.resourceData.cssCount > 5 ? '<li>⚠️ Nombre élevé de fichiers CSS ('+ourSite.resourceData.cssCount+'). Envisagez de les regrouper.</li>' : ''}
        ${ourSite.resourceData.imageCount > 20 ? '<li>⚠️ Nombre élevé d\'images ('+ourSite.resourceData.imageCount+'). Optimisez-les davantage.</li>' : ''}
        ${ourSite.resourceData.totalSize > 2000 * 1024 ? '<li>⚠️ Taille totale des ressources dépasse 2 MB. Réduisez la taille des ressources.</li>' : ''}
        <li>✅ Utilisez des attributs defer ou async pour les scripts non critiques.</li>
        <li>✅ Minifiez et compressez davantage les ressources JavaScript et CSS.</li>
        <li>✅ Implémentez un système de mise en cache efficace (Cache-Control, ETag).</li>
      </ul>
      
      <h3>SEO</h3>
      <ul>
        ${!ourSite.seoData.metaTags.description ? '<li>⚠️ Meta description manquante. Ajoutez une description concise et pertinente.</li>' : ''}
        ${!ourSite.seoData.metaTags.viewport ? '<li>⚠️ Meta viewport manquant. Ajoutez-le pour améliorer l\'expérience mobile.</li>' : ''}
        ${!ourSite.seoData.metaTags.canonical ? '<li>⚠️ URL canonique manquante. Ajoutez-la pour éviter le contenu dupliqué.</li>' : ''}
        ${ourSite.seoData.h1Count !== 1 ? '<li>⚠️ Problème avec le nombre de H1 ('+ourSite.seoData.h1Count+'). Assurez-vous d\'avoir exactement un H1 par page.</li>' : ''}
        <li>✅ Structurez votre contenu avec des balises d\'en-tête hiérarchiques (H1, H2, H3...).</li>
        <li>✅ Ajoutez des données structurées (Schema.org) pour améliorer les résultats de recherche.</li>
        <li>✅ Optimisez les URLs pour qu'elles soient descriptives et contiennent des mots-clés.</li>
      </ul>
      
      <h3>Accessibilité</h3>
      <ul>
        ${ourSite.seoData.accessibilityIssues.map(issue => `<li>⚠️ ${issue}. Corrigez ce problème pour améliorer l'accessibilité.</li>`).join('')}
        <li>✅ Assurez-vous que tous les éléments interactifs sont accessibles au clavier.</li>
        <li>✅ Maintenez un contraste suffisant entre le texte et l'arrière-plan.</li>
        <li>✅ Utilisez des étiquettes appropriées pour tous les champs de formulaire.</li>
      </ul>
    </section>
  ` : '';
  
  // Créer le contenu HTML du rapport
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'analyse des performances Web</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #2980b9;
      margin-top: 30px;
    }
    h3 {
      color: #3498db;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .metrics-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .metrics-column {
      flex: 1;
      min-width: 300px;
    }
    .site-details {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .recommendations {
      background-color: #e8f4fc;
      padding: 20px;
      border-radius: 5px;
      margin-top: 30px;
    }
    .recommendations ul {
      padding-left: 20px;
    }
    .recommendations li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>Rapport d'analyse des performances Web</h1>
  <p>Date de l'analyse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  
  <h2>Tableau comparatif</h2>
  <table>
    <tr>
      <th>Site</th>
      <th>Temps de chargement</th>
      <th>DOM complet</th>
      <th>Nombre de requêtes</th>
      <th>Taille totale</th>
      <th>Scripts JS</th>
      <th>Fichiers CSS</th>
      <th>Images</th>
      <th>H1</th>
      <th>Meta Description</th>
    </tr>
    ${tableRows}
  </table>
  
  ${recommendationSection}
  
  <h2>Détails par site</h2>
  ${detailedSections}
  
  <footer>
    <p>Rapport généré automatiquement. Pour plus d'informations, contactez l'équipe de développement.</p>
  </footer>
</body>
</html>
  `;
  
  // Écrire le rapport dans un fichier
  const reportPath = path.join(REPORTS_DIR, 'performance-report.html');
  await fs.writeFile(reportPath, htmlContent);
  
  // Copier les captures d'écran dans le dossier de rapports (déjà fait)
  
  console.log(`Rapport généré: ${reportPath}`);
  return reportPath;
}

/**
 * Fonction principale
 */
async function main() {
  console.log("Démarrage de l'analyse des performances web...");
  
  try {
    await fs.ensureDir(REPORTS_DIR);
    
    // Mesurer les performances de chaque site
    const results = [];
    for (const site of SITES) {
      try {
        const result = await measurePerformance(site);
        results.push(result);
        console.log(`Analyse de ${site.name} terminée ✅`);
      } catch (error) {
        console.error(`Erreur lors de l'analyse de ${site.name}:`, error);
        console.log(`Passage au site suivant...`);
      }
    }
    
    // Générer le rapport
    if (results.length > 0) {
      const reportPath = await generateReport(results);
      console.log(`Analyse terminée! Le rapport est disponible: ${reportPath}`);
    } else {
      console.error("Aucun site n'a pu être analysé correctement.");
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
  }
}

// Exécution du script
main();