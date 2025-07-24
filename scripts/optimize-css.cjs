/**
 * Script d'optimisation CSS
 * 
 * Ce script analyse et optimise les ressources CSS du site pour améliorer les Core Web Vitals
 * - Extraction du CSS critique
 * - Chargement différé du CSS non critique
 * - Minification et suppression du CSS inutilisé
 */

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const SITE_URL = 'https://raccordement.net/';
const REPORTS_DIR = path.join(__dirname, '../analysis-reports');

/**
 * Extrait le CSS critique d'une page
 */
async function extractCriticalCSS(url) {
  console.log(`Extraction du CSS critique de ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Activer la couverture CSS
    await page.coverage.startCSSCoverage();
    
    // Charger la page
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Récupérer les données de couverture CSS
    const cssData = await page.coverage.stopCSSCoverage();
    
    // Filtrer et extraire le CSS critique
    let criticalCSS = '';
    let totalBytes = 0;
    let usedBytes = 0;
    
    for (const entry of cssData) {
      totalBytes += entry.text.length;
      
      // Extraire les parties utilisées du CSS
      for (const range of entry.ranges) {
        criticalCSS += entry.text.slice(range.start, range.end) + '\n';
        usedBytes += range.end - range.start;
      }
    }
    
    // Calculer le pourcentage d'utilisation
    const usagePercentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
    
    return {
      url,
      criticalCSS,
      stats: {
        totalBytes,
        usedBytes,
        usagePercentage: usagePercentage.toFixed(2)
      }
    };
  } finally {
    await browser.close();
  }
}

/**
 * Analyse la façon dont le CSS est chargé sur la page
 */
async function analyzeCSSDependencies(url) {
  console.log(`Analyse des dépendances CSS sur ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Collecter toutes les ressources
    const cssLinks = [];
    page.on('request', request => {
      const url = request.url();
      if (request.resourceType() === 'stylesheet') {
        cssLinks.push(url);
      }
    });
    
    // Charger la page
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Trouver les balises link pour le CSS
    const linkTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => {
        return {
          href: link.href,
          media: link.media || 'all',
          disabled: link.disabled,
          async: link.hasAttribute('async'),
          defer: link.hasAttribute('defer'),
          preload: link.rel.includes('preload')
        };
      });
    });
    
    // Trouver les styles intégrés
    const inlineStyles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('style')).map(style => {
        return {
          content: style.textContent.length,
          media: style.media || 'all',
          location: style.parentNode.tagName
        };
      });
    });
    
    return {
      url,
      cssLinks,
      linkTags,
      inlineStyles
    };
  } finally {
    await browser.close();
  }
}

/**
 * Génère des recommandations d'optimisation CSS
 */
async function generateCSSOptimizationRecommendations(criticalCSSData, cssAnalysisData) {
  console.log('Génération des recommandations d\'optimisation CSS...');
  
  // Créer le dossier de rapports s'il n'existe pas
  await fs.ensureDir(REPORTS_DIR);
  
  // Analyser les données du CSS critique
  const { criticalCSS, stats } = criticalCSSData;
  const unusedCSSPercentage = 100 - parseFloat(stats.usagePercentage);
  
  // Analyser les balises de lien CSS
  const { linkTags, inlineStyles } = cssAnalysisData;
  const blockingCSS = linkTags.filter(link => !link.async && !link.defer && link.media === 'all');
  const conditionalCSS = linkTags.filter(link => link.media !== 'all');
  const preloadedCSS = linkTags.filter(link => link.preload);
  
  // Générer le contenu du rapport
  let reportContent = `# Optimisation CSS - Recommandations
Date: ${new Date().toLocaleDateString()}

## Analyse du CSS

- Total CSS: ${Math.round(stats.totalBytes / 1024)} KB
- CSS utilisé lors du chargement initial: ${Math.round(stats.usedBytes / 1024)} KB (${stats.usagePercentage}%)
- CSS inutilisé: ${Math.round((stats.totalBytes - stats.usedBytes) / 1024)} KB (${unusedCSSPercentage.toFixed(2)}%)

## Feuilles de style externes

Total: ${linkTags.length} fichiers CSS externes
- CSS bloquant: ${blockingCSS.length} fichiers
- CSS avec media queries: ${conditionalCSS.length} fichiers
- CSS préchargé: ${preloadedCSS.length} fichiers

## Styles intégrés

Total: ${inlineStyles.length} blocs de style intégrés

## CSS critique extrait

\`\`\`css
/* Premier 1 KB du CSS critique (extrait) */
${criticalCSS.substring(0, 1024)}...
\`\`\`

## Problèmes identifiés

${unusedCSSPercentage > 30 ? '- ⚠️ **Excès de CSS inutilisé**: ' + unusedCSSPercentage.toFixed(2) + '% du CSS n\'est pas utilisé lors du chargement initial\n' : ''}
${blockingCSS.length > 2 ? '- ⚠️ **Trop de CSS bloquant**: ' + blockingCSS.length + ' fichiers CSS bloquent le rendu\n' : ''}
${inlineStyles.length === 0 ? '- ⚠️ **Pas de CSS critique inliné**: Aucun style n\'est directement intégré dans le HTML\n' : ''}
${preloadedCSS.length === 0 ? '- ⚠️ **Pas de préchargement CSS**: Aucune feuille de style n\'est préchargée\n' : ''}

## Recommandations d'optimisation

1. **Extraire et injecter le CSS critique**:
   - Injecter le CSS critique dans une balise \`<style>\` dans l'en-tête de la page
   - Cela améliore le First Contentful Paint (FCP) en permettant un rendu rapide des éléments visibles

2. **Charger de manière asynchrone le CSS non critique**:
   - Utiliser \`rel="preload" as="style"\` avec \`onload\` pour charger les styles complets sans bloquer le rendu
   - Exemple: \`<link rel="preload" as="style" href="styles.css" onload="this.onload=null;this.rel='stylesheet'">\`

3. **Purger le CSS inutilisé**:
   - Réduire la taille des fichiers CSS en supprimant les styles inutilisés
   - Utiliser des outils comme PurgeCSS pour éliminer les styles non utilisés

4. **Appliquer des media queries optimisées**:
   - Utiliser \`media="print"\` pour les styles d'impression
   - Utiliser \`media="(min-width: 768px)"\` pour les styles desktop uniquement

5. **Mise en œuvre technique recommandée**:

\`\`\`html
<!-- Dans l'en-tête HTML -->
<style>
  /* CSS critique */
  ${criticalCSS.substring(0, 500)}...
</style>

<!-- Chargement asynchrone du CSS complet -->
<link rel="preload" as="style" href="styles.css" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
\`\`\`

## Impact attendu sur les Core Web Vitals

- **LCP (Largest Contentful Paint)**: Amélioration significative en rendant les styles critiques disponibles immédiatement
- **FID/INP (First Input Delay/Interaction to Next Paint)**: Amélioration modérée en réduisant le travail du thread principal
- **CLS (Cumulative Layout Shift)**: Amélioration potentielle en garantissant des styles cohérents dès le premier rendu
`;

  // Créer un fichier séparé avec le CSS critique complet
  await fs.writeFile(
    path.join(REPORTS_DIR, 'critical.css'),
    criticalCSS
  );
  
  // Écrire le rapport dans un fichier
  const reportPath = path.join(REPORTS_DIR, 'css-optimization-report.md');
  await fs.writeFile(reportPath, reportContent);
  
  console.log(`Rapport d'optimisation CSS généré: ${reportPath}`);
  console.log(`CSS critique extrait: ${path.join(REPORTS_DIR, 'critical.css')}`);
  
  return reportPath;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    // Créer le dossier de rapports s'il n'existe pas
    await fs.ensureDir(REPORTS_DIR);
    
    // Extraire le CSS critique de la page d'accueil
    const criticalCSSData = await extractCriticalCSS(SITE_URL);
    
    // Analyser les dépendances CSS
    const cssAnalysisData = await analyzeCSSDependencies(SITE_URL);
    
    // Générer des recommandations
    await generateCSSOptimizationRecommendations(criticalCSSData, cssAnalysisData);
    
    console.log("Analyse d'optimisation CSS terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'optimisation CSS:", error);
  }
}

// Exécuter le script
main();