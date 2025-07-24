/**
 * Script d'analyse des Core Web Vitals
 * 
 * Ce script utilise Lighthouse pour analyser les performances web du site
 * et générer un rapport détaillé sur les Core Web Vitals (LCP, CLS, FID/INP)
 */

const fs = require('fs-extra');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const path = require('path');
const { URL } = require('url');

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
 * Lance l'analyse Lighthouse et génère un rapport pour un site
 */
async function analyzeSite(site, device = 'mobile') {
  console.log(`Analyse de ${site.name} (${site.url}) en mode ${device}...`);
  
  // Création du dossier de rapports s'il n'existe pas
  await fs.ensureDir(REPORTS_DIR);
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  
  try {
    // Configuration de Lighthouse
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      port: chrome.port,
      onlyCategories: ['performance'],
      formFactor: device,
      screenEmulation: device === 'desktop' 
        ? { width: 1350, height: 940, deviceScaleFactor: 1, mobile: false } 
        : { width: 360, height: 640, deviceScaleFactor: 2.625, mobile: true },
      throttling: {
        // Valeurs recommandées pour une simulation plus réaliste
        cpuSlowdownMultiplier: device === 'mobile' ? 4 : 2,
        rttMs: device === 'mobile' ? 150 : 40,
        throughputKbps: device === 'mobile' ? 1638 : 10240,
      },
    };
    
    const runnerResult = await lighthouse(site.url, options);

    // Extraction des Core Web Vitals du rapport
    const lcp = runnerResult.lhr.audits['largest-contentful-paint'].numericValue;
    const cls = runnerResult.lhr.audits['cumulative-layout-shift'].numericValue;
    const tbt = runnerResult.lhr.audits['total-blocking-time'].numericValue; // Proxy pour INP
    const fcp = runnerResult.lhr.audits['first-contentful-paint'].numericValue;
    
    // Formatage des résultats
    const formattedResults = {
      url: site.url,
      name: site.name,
      device,
      date: new Date().toISOString(),
      scores: {
        performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
        lcp: {
          value: Math.round(lcp),
          unit: 'ms',
          score: runnerResult.lhr.audits['largest-contentful-paint'].score,
          displayValue: runnerResult.lhr.audits['largest-contentful-paint'].displayValue
        },
        cls: {
          value: cls.toFixed(3),
          score: runnerResult.lhr.audits['cumulative-layout-shift'].score,
          displayValue: runnerResult.lhr.audits['cumulative-layout-shift'].displayValue
        },
        tbt: {
          value: Math.round(tbt),
          unit: 'ms',
          score: runnerResult.lhr.audits['total-blocking-time'].score,
          displayValue: runnerResult.lhr.audits['total-blocking-time'].displayValue
        },
        fcp: {
          value: Math.round(fcp),
          unit: 'ms',
          score: runnerResult.lhr.audits['first-contentful-paint'].score,
          displayValue: runnerResult.lhr.audits['first-contentful-paint'].displayValue
        }
      },
      opportunities: extractOpportunities(runnerResult.lhr.audits)
    };
    
    // Sauvegarde des rapports
    const hostname = new URL(site.url).hostname;
    const fileBase = `${hostname}-${device}`;
    
    await fs.writeFile(
      path.join(REPORTS_DIR, `${fileBase}-results.json`),
      JSON.stringify(formattedResults, null, 2)
    );
    
    await fs.writeFile(
      path.join(REPORTS_DIR, `${fileBase}-lighthouse.html`),
      runnerResult.report[0]
    );
    
    await fs.writeFile(
      path.join(REPORTS_DIR, `${fileBase}-lighthouse.json`),
      runnerResult.report[1]
    );
    
    console.log(`Analyse de ${site.name} (${device}) terminée ✅`);
    console.log(`Performance: ${formattedResults.scores.performance}/100`);
    console.log(`LCP: ${formattedResults.scores.lcp.displayValue}`);
    console.log(`CLS: ${formattedResults.scores.cls.displayValue}`);
    console.log(`TBT: ${formattedResults.scores.tbt.displayValue}`);
    console.log('---------------------------------------------------');
    
    return formattedResults;
  } finally {
    await chrome.kill();
  }
}

/**
 * Extrait les opportunités d'amélioration du rapport Lighthouse
 */
function extractOpportunities(audits) {
  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'offscreen-images',
    'unminified-css',
    'unminified-javascript',
    'uses-optimized-images',
    'uses-webp-images',
    'uses-responsive-images',
    'uses-text-compression',
    'server-response-time',
    'font-display',
    'preload-lcp-image'
  ];
  
  return opportunityAudits
    .filter(id => audits[id] && audits[id].details && audits[id].details.items && audits[id].details.items.length > 0)
    .map(id => ({
      id,
      title: audits[id].title,
      description: audits[id].description,
      score: audits[id].score,
      displayValue: audits[id].displayValue,
      details: audits[id].details,
      numericValue: audits[id].numericValue
    }))
    .sort((a, b) => (a.score || 0) - (b.score || 0));
}

/**
 * Génère un tableau comparatif des résultats
 */
async function generateComparativeReport(results) {
  const mobileResults = results.filter(r => r.device === 'mobile');
  const desktopResults = results.filter(r => r.device === 'desktop');
  
  // Tableau comparatif pour mobile
  let mobileComparisonTable = '## Comparaison Mobile\n\n';
  mobileComparisonTable += '| Site | Performance | LCP | CLS | TBT |\n';
  mobileComparisonTable += '|------|------------|-----|-----|-----|\n';
  
  mobileResults.forEach(result => {
    mobileComparisonTable += `| ${result.name} | ${result.scores.performance}/100 | ${result.scores.lcp.displayValue} | ${result.scores.cls.displayValue} | ${result.scores.tbt.displayValue} |\n`;
  });
  
  // Tableau comparatif pour desktop
  let desktopComparisonTable = '## Comparaison Desktop\n\n';
  desktopComparisonTable += '| Site | Performance | LCP | CLS | TBT |\n';
  desktopComparisonTable += '|------|------------|-----|-----|-----|\n';
  
  desktopResults.forEach(result => {
    desktopComparisonTable += `| ${result.name} | ${result.scores.performance}/100 | ${result.scores.lcp.displayValue} | ${result.scores.cls.displayValue} | ${result.scores.tbt.displayValue} |\n`;
  });
  
  // Génération du rapport comparatif
  const reportContent = `# Rapport Comparatif des Core Web Vitals
Date: ${new Date().toLocaleDateString()}

${mobileComparisonTable}

${desktopComparisonTable}

## Légende
- LCP: Largest Contentful Paint (chargement de l'élément principal)
- CLS: Cumulative Layout Shift (stabilité visuelle)
- TBT: Total Blocking Time (proxy pour l'interactivité)
`;

  await fs.writeFile(
    path.join(REPORTS_DIR, 'comparative-report.md'),
    reportContent
  );
  
  console.log('Rapport comparatif généré ✅');
}

/**
 * Génère des recommandations basées sur les résultats
 */
async function generateRecommendations(siteResults) {
  // Filtrer uniquement les résultats de notre site
  const ourSiteResults = siteResults.filter(result => result.name === 'Raccordement.net');
  
  if (ourSiteResults.length === 0) {
    console.error('Aucun résultat trouvé pour notre site');
    return;
  }
  
  // Recommandations générales
  let recommendations = `# Recommandations d'amélioration des Core Web Vitals
Date: ${new Date().toLocaleDateString()}

## Résumé des performances actuelles

`;

  // Ajouter les résultats actuels
  ourSiteResults.forEach(result => {
    recommendations += `### ${result.device === 'mobile' ? 'Mobile' : 'Desktop'}\n`;
    recommendations += `- Score de performance: ${result.scores.performance}/100\n`;
    recommendations += `- LCP: ${result.scores.lcp.displayValue}\n`;
    recommendations += `- CLS: ${result.scores.cls.displayValue}\n`;
    recommendations += `- TBT: ${result.scores.tbt.displayValue}\n\n`;
  });
  
  // Recommandations spécifiques par catégorie
  recommendations += `## Recommandations prioritaires\n\n`;
  
  // Combiner les opportunités des versions mobile et desktop
  const allOpportunities = ourSiteResults.flatMap(result => 
    result.opportunities.map(opp => ({
      ...opp,
      device: result.device
    }))
  );
  
  // Catégoriser les recommandations
  const imageOptimizations = allOpportunities.filter(opp => 
    ['uses-optimized-images', 'uses-webp-images', 'uses-responsive-images', 'offscreen-images', 'preload-lcp-image']
    .includes(opp.id)
  );
  
  const cssOptimizations = allOpportunities.filter(opp => 
    ['render-blocking-resources', 'unused-css-rules', 'unminified-css']
    .includes(opp.id)
  );
  
  const jsOptimizations = allOpportunities.filter(opp => 
    ['unused-javascript', 'unminified-javascript']
    .includes(opp.id)
  );
  
  const serverOptimizations = allOpportunities.filter(opp => 
    ['server-response-time', 'uses-text-compression']
    .includes(opp.id)
  );
  
  // Ajouter les recommandations par catégorie
  if (imageOptimizations.length > 0) {
    recommendations += `### 1. Optimisation des Images\n\n`;
    imageOptimizations.forEach(opp => {
      recommendations += `- **${opp.title}** (${opp.device}): ${opp.description}\n`;
      if (opp.displayValue) {
        recommendations += `  - Impact potentiel: ${opp.displayValue}\n`;
      }
      recommendations += '\n';
    });
  }
  
  if (cssOptimizations.length > 0) {
    recommendations += `### 2. Optimisation CSS\n\n`;
    cssOptimizations.forEach(opp => {
      recommendations += `- **${opp.title}** (${opp.device}): ${opp.description}\n`;
      if (opp.displayValue) {
        recommendations += `  - Impact potentiel: ${opp.displayValue}\n`;
      }
      recommendations += '\n';
    });
  }
  
  if (jsOptimizations.length > 0) {
    recommendations += `### 3. Optimisation JavaScript\n\n`;
    jsOptimizations.forEach(opp => {
      recommendations += `- **${opp.title}** (${opp.device}): ${opp.description}\n`;
      if (opp.displayValue) {
        recommendations += `  - Impact potentiel: ${opp.displayValue}\n`;
      }
      recommendations += '\n';
    });
  }
  
  if (serverOptimizations.length > 0) {
    recommendations += `### 4. Optimisations Serveur\n\n`;
    serverOptimizations.forEach(opp => {
      recommendations += `- **${opp.title}** (${opp.device}): ${opp.description}\n`;
      if (opp.displayValue) {
        recommendations += `  - Impact potentiel: ${opp.displayValue}\n`;
      }
      recommendations += '\n';
    });
  }
  
  // Ajouter des étapes suivantes
  recommendations += `## Prochaines étapes recommandées\n\n`;
  recommendations += `1. Mettre en œuvre les optimisations d'images (priorité élevée)\n`;
  recommendations += `2. Optimiser le chargement des ressources CSS et JavaScript\n`;
  recommendations += `3. Implémenter la compression des textes et l'optimisation du serveur\n`;
  recommendations += `4. Réexécuter l'analyse pour mesurer les améliorations\n`;
  
  await fs.writeFile(
    path.join(REPORTS_DIR, 'recommendations.md'),
    recommendations
  );
  
  console.log('Recommandations générées ✅');
}

/**
 * Fonction principale d'exécution
 */
async function main() {
  console.log("Démarrage de l'analyse des Core Web Vitals...");
  
  try {
    const results = [];
    
    // Analyser chaque site en mode mobile et desktop
    for (const site of SITES) {
      results.push(await analyzeSite(site, 'mobile'));
      results.push(await analyzeSite(site, 'desktop'));
    }
    
    // Générer le rapport comparatif
    await generateComparativeReport(results);
    
    // Générer des recommandations pour notre site
    await generateRecommendations(results);
    
    console.log("Analyse complète terminée! Les rapports sont disponibles dans le dossier 'analysis-reports'");
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
  }
}

// Exécution du script
main();