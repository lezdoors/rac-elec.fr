/**
 * Script simplifié d'analyse des performances web
 * Utilise curl et des mesures basiques pour analyser les sites
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    url: 'https://raccordement-connect.com/',
    isCompetitor: true
  }
];

// Dossier pour stocker les rapports
const REPORTS_DIR = path.join(__dirname, '../analysis-reports');

/**
 * Exécute une commande shell et retourne le résultat
 */
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`);
    console.error(error.message);
    return '';
  }
}

/**
 * Mesure les performances basiques d'un site avec curl
 */
function measureSitePerformance(site) {
  console.log(`Analyse de ${site.name} (${site.url})...`);
  
  try {
    // Mesurer le temps de réponse avec curl
    const curlOutput = runCommand(`curl -o /dev/null -s -w 'time_namelookup: %{time_namelookup}\\ntime_connect: %{time_connect}\\ntime_appconnect: %{time_appconnect}\\ntime_pretransfer: %{time_pretransfer}\\ntime_redirect: %{time_redirect}\\ntime_starttransfer: %{time_starttransfer}\\ntime_total: %{time_total}\\nsize_download: %{size_download}\\nspeed_download: %{speed_download}\\n' ${site.url}`);
    
    // Extraire les métriques
    const metrics = {};
    curlOutput.split('\n').forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        metrics[key] = parseFloat(value);
      }
    });
    
    // Télécharger la page pour analyse
    const htmlContent = runCommand(`curl -s ${site.url}`);
    
    // Analyser le contenu HTML basique
    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Titre non trouvé';
    
    const metaDescriptionMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1] : 'Meta description non trouvée';
    
    const h1Count = (htmlContent.match(/<h1[^>]*>/gi) || []).length;
    const imgCount = (htmlContent.match(/<img[^>]*>/gi) || []).length;
    const linkCount = (htmlContent.match(/<a[^>]*>/gi) || []).length;
    const scriptCount = (htmlContent.match(/<script[^>]*>/gi) || []).length;
    
    // Compter les images sans attribut alt
    const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
    let imagesWithoutAlt = 0;
    
    imgTags.forEach(imgTag => {
      if (!imgTag.match(/alt=["'][^"']*["']/i)) {
        imagesWithoutAlt++;
      }
    });
    
    // Analyser les CSS et JS externes
    const cssLinks = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    const jsScripts = htmlContent.match(/<script[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
    
    return {
      name: site.name,
      url: site.url,
      metrics,
      htmlSize: Buffer.from(htmlContent).length,
      pageInfo: {
        title,
        metaDescription,
        h1Count,
        imgCount,
        linkCount,
        scriptCount,
        imagesWithoutAlt,
        cssLinks: cssLinks.length,
        jsScripts: jsScripts.length
      }
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${site.name}:`, error);
    return null;
  }
}

/**
 * Génère un rapport HTML basé sur les résultats
 */
function generateReport(results) {
  // Créer le dossier de rapports s'il n'existe pas
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Générer le tableau comparatif
  let tableRows = '';
  results.forEach(result => {
    if (!result) return; // Ignorer les sites qui n'ont pas pu être analysés
    
    tableRows += `
      <tr>
        <td>${result.name}</td>
        <td>${(result.metrics.time_total * 1000).toFixed(0)} ms</td>
        <td>${(result.metrics.time_starttransfer * 1000).toFixed(0)} ms</td>
        <td>${(result.htmlSize / 1024).toFixed(2)} KB</td>
        <td>${result.pageInfo.cssLinks}</td>
        <td>${result.pageInfo.jsScripts}</td>
        <td>${result.pageInfo.imgCount}</td>
        <td>${result.pageInfo.h1Count}</td>
        <td>${result.pageInfo.metaDescription ? 'Oui' : 'Non'}</td>
      </tr>
    `;
  });
  
  // Générer les sections détaillées pour chaque site
  let detailedSections = '';
  results.forEach(result => {
    if (!result) return; // Ignorer les sites qui n'ont pas pu être analysés
    
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
                <td>Temps de résolution DNS</td>
                <td>${(result.metrics.time_namelookup * 1000).toFixed(0)} ms</td>
              </tr>
              <tr>
                <td>Temps de connexion</td>
                <td>${(result.metrics.time_connect * 1000).toFixed(0)} ms</td>
              </tr>
              <tr>
                <td>Temps avant premier octet</td>
                <td>${(result.metrics.time_starttransfer * 1000).toFixed(0)} ms</td>
              </tr>
              <tr>
                <td>Temps de chargement total</td>
                <td>${(result.metrics.time_total * 1000).toFixed(0)} ms</td>
              </tr>
              <tr>
                <td>Vitesse de téléchargement</td>
                <td>${(result.metrics.speed_download / 1024).toFixed(2)} KB/s</td>
              </tr>
              <tr>
                <td>Taille de la page HTML</td>
                <td>${(result.htmlSize / 1024).toFixed(2)} KB</td>
              </tr>
            </table>
          </div>
          
          <div class="metrics-column">
            <h3>Contenu de la page</h3>
            <table>
              <tr>
                <th>Élément</th>
                <th>Valeur</th>
              </tr>
              <tr>
                <td>Titre</td>
                <td>${result.pageInfo.title}</td>
              </tr>
              <tr>
                <td>Meta Description</td>
                <td>${result.pageInfo.metaDescription}</td>
              </tr>
              <tr>
                <td>Nombre de H1</td>
                <td>${result.pageInfo.h1Count}</td>
              </tr>
              <tr>
                <td>Nombre de liens</td>
                <td>${result.pageInfo.linkCount}</td>
              </tr>
              <tr>
                <td>Nombre d'images</td>
                <td>${result.pageInfo.imgCount}</td>
              </tr>
              <tr>
                <td>Images sans attribut alt</td>
                <td>${result.pageInfo.imagesWithoutAlt}</td>
              </tr>
              <tr>
                <td>Fichiers CSS externes</td>
                <td>${result.pageInfo.cssLinks}</td>
              </tr>
              <tr>
                <td>Fichiers JavaScript externes</td>
                <td>${result.pageInfo.jsScripts}</td>
              </tr>
            </table>
          </div>
        </div>
      </section>
    `;
  });
  
  // Générer des recommandations pour notre site
  const ourSite = results.find(result => result && result.url.includes('raccordement.net'));
  const recommendationSection = ourSite ? `
    <section class="recommendations">
      <h2>Recommandations pour Raccordement.net</h2>
      
      <h3>Performance</h3>
      <ul>
        ${ourSite.metrics.time_total > 1 ? '<li>⚠️ Le temps de chargement total dépasse 1 seconde. Optimisez davantage la performance.</li>' : ''}
        ${ourSite.metrics.time_namelookup > 0.1 ? '<li>⚠️ Le temps de résolution DNS est élevé. Vérifiez la configuration DNS.</li>' : ''}
        ${ourSite.pageInfo.jsScripts > 10 ? '<li>⚠️ Nombre élevé de fichiers JavaScript ('+ourSite.pageInfo.jsScripts+'). Envisagez de les regrouper.</li>' : ''}
        ${ourSite.pageInfo.cssLinks > 5 ? '<li>⚠️ Nombre élevé de fichiers CSS ('+ourSite.pageInfo.cssLinks+'). Envisagez de les regrouper.</li>' : ''}
        <li>✅ Minifiez et compressez davantage les ressources JavaScript et CSS.</li>
        <li>✅ Utilisez un service de CDN pour les ressources statiques.</li>
        <li>✅ Implémentez un système de mise en cache efficace.</li>
      </ul>
      
      <h3>SEO</h3>
      <ul>
        ${!ourSite.pageInfo.metaDescription ? '<li>⚠️ Meta description manquante. Ajoutez une description concise et pertinente.</li>' : ''}
        ${ourSite.pageInfo.h1Count !== 1 ? '<li>⚠️ Problème avec le nombre de H1 ('+ourSite.pageInfo.h1Count+'). Assurez-vous d\'avoir exactement un H1 par page.</li>' : ''}
        <li>✅ Structurez votre contenu avec des balises d\'en-tête hiérarchiques (H1, H2, H3...).</li>
        <li>✅ Ajoutez des données structurées (Schema.org) pour améliorer les résultats de recherche.</li>
        <li>✅ Optimisez les URLs pour qu'elles soient descriptives et contiennent des mots-clés.</li>
      </ul>
      
      <h3>Accessibilité</h3>
      <ul>
        ${ourSite.pageInfo.imagesWithoutAlt > 0 ? '<li>⚠️ '+ourSite.pageInfo.imagesWithoutAlt+' images sans attribut alt. Ajoutez des descriptions alternatives pour améliorer l\'accessibilité.</li>' : ''}
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
      <th>Temps total</th>
      <th>TTFB</th>
      <th>Taille HTML</th>
      <th>CSS</th>
      <th>JS</th>
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
  fs.writeFileSync(reportPath, htmlContent);
  
  console.log(`Rapport généré: ${reportPath}`);
  return reportPath;
}

/**
 * Fonction principale
 */
function main() {
  console.log("Démarrage de l'analyse des performances web...");
  
  try {
    // Mesurer les performances de chaque site
    const results = [];
    for (const site of SITES) {
      try {
        const result = measureSitePerformance(site);
        if (result) {
          results.push(result);
          console.log(`Analyse de ${site.name} terminée ✅`);
        }
      } catch (error) {
        console.error(`Erreur lors de l'analyse de ${site.name}:`, error);
        console.log(`Passage au site suivant...`);
      }
    }
    
    // Générer le rapport
    if (results.length > 0) {
      const reportPath = generateReport(results);
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