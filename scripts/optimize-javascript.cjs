/**
 * Script d'optimisation JavaScript
 * 
 * Ce script analyse et optimise les ressources JavaScript du site pour améliorer les Core Web Vitals
 * - Analyse de la charge JavaScript
 * - Identification des longues tâches
 * - Recommandations pour le chargement différé et la division du code
 */

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const SITE_URL = 'https://raccordement.net/';
const REPORTS_DIR = path.join(__dirname, '../analysis-reports');

/**
 * Analyse le JavaScript utilisé sur une page
 */
async function analyzeJavaScript(url) {
  console.log(`Analyse du JavaScript sur ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Activer la couverture JS
    await page.coverage.startJSCoverage();
    
    // Collecter toutes les ressources
    const jsFiles = [];
    page.on('request', request => {
      const url = request.url();
      if (request.resourceType() === 'script') {
        jsFiles.push(url);
      }
    });
    
    // Charger la page
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Interagir avec la page pour déclencher des gestionnaires d'événements
    await simulateUserInteraction(page);
    
    // Récupérer les données de couverture JS
    const jsData = await page.coverage.stopJSCoverage();
    
    // Analyser les résultats
    let totalBytes = 0;
    let usedBytes = 0;
    const scriptAnalysis = [];
    
    for (const entry of jsData) {
      const scriptUrl = entry.url || 'inline script';
      totalBytes += entry.text.length;
      
      // Calculer les octets utilisés
      let scriptUsedBytes = 0;
      for (const range of entry.ranges) {
        scriptUsedBytes += range.end - range.start;
      }
      usedBytes += scriptUsedBytes;
      
      // Calculer le pourcentage d'utilisation
      const usagePercentage = (scriptUsedBytes / entry.text.length) * 100;
      
      scriptAnalysis.push({
        url: scriptUrl,
        totalBytes: entry.text.length,
        usedBytes: scriptUsedBytes,
        unusedBytes: entry.text.length - scriptUsedBytes,
        usagePercentage: usagePercentage.toFixed(2)
      });
    }
    
    // Récupérer les balises script
    const scriptTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map(script => {
        return {
          src: script.src || 'inline',
          async: script.async,
          defer: script.defer,
          type: script.type,
          location: script.parentNode.tagName
        };
      });
    });
    
    // Mesurer les longues tâches
    const longTasks = await measureLongTasks(page);
    
    return {
      url,
      jsFiles,
      scriptTags,
      longTasks,
      stats: {
        totalBytes,
        usedBytes,
        unusedBytes: totalBytes - usedBytes,
        usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
      },
      scriptAnalysis: scriptAnalysis.sort((a, b) => b.totalBytes - a.totalBytes)
    };
  } finally {
    await browser.close();
  }
}

/**
 * Simule l'interaction d'un utilisateur avec la page
 */
async function simulateUserInteraction(page) {
  try {
    // Faire défiler la page
    await autoScroll(page);
    
    // Cliquer sur des éléments interactifs courants (menus, accordéons, etc.)
    await page.evaluate(() => {
      const clickElements = [
        // Sélecteurs courants pour les éléments interactifs
        '.navbar-toggler',
        '.accordion-header',
        '.tab-link',
        'button:not([disabled])',
        'a[role="button"]',
        'details summary'
      ];
      
      clickElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          try {
            el.click();
          } catch (e) {
            // Ignorer les erreurs
          }
        });
      });
    });
    
    // Pause pour permettre l'exécution des gestionnaires d'événements
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error('Erreur lors de la simulation d\'interaction:', error);
  }
}

/**
 * Fait défiler la page pour déclencher le lazy loading
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Mesure les longues tâches JavaScript
 */
async function measureLongTasks(page) {
  try {
    return await page.evaluate(() => {
      return new Promise(resolve => {
        // Vérifier si l'API PerformanceObserver est disponible
        if (!window.PerformanceObserver || !PerformanceObserver.supportedEntryTypes ||
            !PerformanceObserver.supportedEntryTypes.includes('longtask')) {
          resolve([]);
          return;
        }
        
        const longTasks = [];
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
              attribution: entry.attribution ? entry.attribution.map(item => item.name) : []
            });
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        // Observer pendant 5 secondes
        setTimeout(() => {
          observer.disconnect();
          resolve(longTasks);
        }, 5000);
      });
    });
  } catch (error) {
    console.error('Erreur lors de la mesure des longues tâches:', error);
    return [];
  }
}

/**
 * Génère des recommandations d'optimisation JavaScript
 */
async function generateJSOptimizationRecommendations(jsAnalysisData) {
  console.log('Génération des recommandations d\'optimisation JavaScript...');
  
  // Créer le dossier de rapports s'il n'existe pas
  await fs.ensureDir(REPORTS_DIR);
  
  const { stats, scriptAnalysis, scriptTags, longTasks } = jsAnalysisData;
  
  // Identifier les scripts volumineux
  const largeScripts = scriptAnalysis
    .filter(script => script.totalBytes > 50 * 1024) // Scripts de plus de 50 KB
    .sort((a, b) => b.totalBytes - a.totalBytes);
  
  // Identifier les scripts avec beaucoup de code inutilisé
  const inefficientScripts = scriptAnalysis
    .filter(script => script.usagePercentage < 50 && script.totalBytes > 20 * 1024) // moins de 50% utilisé et plus de 20 KB
    .sort((a, b) => b.unusedBytes - a.unusedBytes);
  
  // Analyser les balises script
  const blockingScripts = scriptTags.filter(script => !script.async && !script.defer && script.src !== 'inline');
  const inlineScripts = scriptTags.filter(script => script.src === 'inline');
  const asyncScripts = scriptTags.filter(script => script.async);
  const deferScripts = scriptTags.filter(script => script.defer);
  
  // Générer le contenu du rapport
  let reportContent = `# Optimisation JavaScript - Recommandations
Date: ${new Date().toLocaleDateString()}

## Analyse du JavaScript

- Total JavaScript: ${Math.round(stats.totalBytes / 1024)} KB
- JavaScript utilisé: ${Math.round(stats.usedBytes / 1024)} KB (${stats.usagePercentage.toFixed(2)}%)
- JavaScript inutilisé: ${Math.round(stats.unusedBytes / 1024)} KB (${(100 - stats.usagePercentage).toFixed(2)}%)

## Balises Script

- Total: ${scriptTags.length} scripts
- Scripts bloquants: ${blockingScripts.length}
- Scripts inline: ${inlineScripts.length}
- Scripts async: ${asyncScripts.length}
- Scripts defer: ${deferScripts.length}

## Longues Tâches JavaScript

${longTasks.length > 0 
  ? `- ${longTasks.length} longues tâches détectées (> 50ms)
- Durée moyenne: ${(longTasks.reduce((sum, task) => sum + task.duration, 0) / longTasks.length).toFixed(2)}ms`
  : '- Aucune longue tâche détectée'}

## Scripts volumineux (>50 KB)

${largeScripts.length > 0 
  ? largeScripts.map(script => `- ${path.basename(script.url)}: ${Math.round(script.totalBytes / 1024)} KB (${script.usagePercentage}% utilisé)`).join('\n')
  : '- Aucun script volumineux détecté'}

## Scripts inefficaces (<50% utilisé et >20 KB)

${inefficientScripts.length > 0 
  ? inefficientScripts.map(script => `- ${path.basename(script.url)}: ${Math.round(script.unusedBytes / 1024)} KB inutilisés (${(100 - parseFloat(script.usagePercentage)).toFixed(2)}% du script)`).join('\n')
  : '- Aucun script inefficace détecté'}

## Problèmes identifiés

${blockingScripts.length > 3 ? '- ⚠️ **Trop de scripts bloquants**: ' + blockingScripts.length + ' scripts bloquent le rendu\n' : ''}
${stats.unusedBytes > 200 * 1024 ? '- ⚠️ **Excès de JavaScript inutilisé**: ' + Math.round(stats.unusedBytes / 1024) + ' KB de JavaScript non utilisé\n' : ''}
${largeScripts.length > 2 ? '- ⚠️ **Scripts trop volumineux**: ' + largeScripts.length + ' scripts de plus de 50 KB\n' : ''}
${longTasks.length > 0 ? '- ⚠️ **Longues tâches détectées**: ' + longTasks.length + ' tâches bloquant le thread principal\n' : ''}

## Recommandations d'optimisation

1. **Chargement différé et division du code**:
   - Utiliser \`import()\` dynamique pour charger le JavaScript à la demande
   - Diviser les bundles volumineux en chunks plus petits avec points d'entrée par route
   - Exemple: \`const Component = () => import('./Component.js')\`

2. **Attributs async/defer pour les scripts**:
   - Utiliser \`defer\` pour les scripts non critiques: \`<script defer src="..."></script>\`
   - Utiliser \`async\` pour les scripts indépendants: \`<script async src="..."></script>\`
   - Priorité: scripts critiques dans \`<head>\` avec \`defer\`, autres scripts avant \`</body>\`

3. **Optimisation des bibliothèques tierces**:
   - Importer uniquement les fonctions nécessaires (imports nommés)
   - Remplacer les bibliothèques complètes par des alternatives plus légères
   - Exemples: lodash-es au lieu de lodash, day.js au lieu de moment.js

4. **Prévention des longues tâches**:
   - Éviter les calculs intensifs dans le thread principal
   - Utiliser les Web Workers pour les opérations gourmandes en CPU
   - Diviser les opérations en petites tâches avec \`setTimeout\` ou \`requestAnimationFrame\`

5. **Mise en œuvre technique recommandée**:

\`\`\`html
<!-- Scripts critiques avec defer dans le head -->
<script defer src="critical.js"></script>

<!-- Scripts non-critiques avant la fermeture du body -->
<script defer src="non-critical.js"></script>

<!-- JavaScript chargé de manière conditionnelle -->
<script type="module">
  // Chargement différé à la demande
  if (document.querySelector('.feature')) {
    import('./feature.js').then(module => {
      module.initialize();
    });
  }
  
  // Observer l'intersection pour charger du code quand nécessaire
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        import('./lazy-loaded.js');
        observer.disconnect();
      }
    });
  });
  
  observer.observe(document.querySelector('.lazy-section'));
</script>
\`\`\`

## Impact attendu sur les Core Web Vitals

- **LCP (Largest Contentful Paint)**: Amélioration significative en réduisant le JavaScript bloquant initial
- **FID/INP (First Input Delay/Interaction to Next Paint)**: Amélioration majeure en réduisant les longues tâches et en optimisant le thread principal
- **CLS (Cumulative Layout Shift)**: Amélioration mineure en garantissant un chargement plus prévisible des ressources
`;

  // Écrire le rapport dans un fichier
  const reportPath = path.join(REPORTS_DIR, 'javascript-optimization-report.md');
  await fs.writeFile(reportPath, reportContent);
  
  console.log(`Rapport d'optimisation JavaScript généré: ${reportPath}`);
  
  return reportPath;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    // Créer le dossier de rapports s'il n'existe pas
    await fs.ensureDir(REPORTS_DIR);
    
    // Analyser le JavaScript de la page d'accueil
    const jsAnalysisData = await analyzeJavaScript(SITE_URL);
    
    // Générer des recommandations
    await generateJSOptimizationRecommendations(jsAnalysisData);
    
    console.log("Analyse d'optimisation JavaScript terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'optimisation JavaScript:", error);
  }
}

// Exécuter le script
main();