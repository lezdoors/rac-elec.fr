/**
 * Script d'analyse CSS pour optimisation des performances
 * 
 * Ce script analyse les fichiers CSS du projet et fournit des recommandations
 * pour améliorer les performances et réduire le CLS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const CLIENT_DIR = path.join(__dirname, '../client/src');
const REPORT_DIR = path.join(__dirname, '../analysis-reports');

// Problèmes courants à rechercher dans le CSS
const CSS_ISSUES = [
  {
    pattern: /@import\s+url/gi,
    description: "Utilisation de @import qui bloque le rendu et ralentit le chargement",
    severity: "high",
    recommendation: "Remplacer par <link> dans le HTML ou combiner les fichiers CSS"
  },
  {
    pattern: /position:\s*absolute|position:\s*fixed/gi,
    description: "Position absolute/fixed pouvant causer des problèmes de CLS si mal utilisée",
    severity: "medium",
    recommendation: "Assurez-vous que les éléments positionnés ont des dimensions définies et des conteneurs avec position:relative"
  },
  {
    pattern: /!important/g,
    description: "Utilisation excessive de !important",
    severity: "medium",
    recommendation: "Éviter !important et utiliser des sélecteurs plus spécifiques"
  },
  {
    pattern: /transition|animation/gi,
    description: "Animations/transitions pouvant affecter les performances",
    severity: "low",
    recommendation: "Limiter aux propriétés transform et opacity pour de meilleures performances"
  },
  {
    pattern: /box-shadow|text-shadow|filter|backdrop-filter/gi,
    description: "Effets CSS gourmands en ressources",
    severity: "low",
    recommendation: "Limiter l'utilisation sur les grands éléments ou les animations"
  },
  {
    pattern: /@media\s+print/gi,
    description: "Styles d'impression mélangés aux styles principaux",
    severity: "low",
    recommendation: "Déplacer les styles d'impression dans un fichier séparé chargé avec media=print"
  },
  {
    pattern: /calc\(/gi,
    description: "Utilisation de calc() qui peut être coûteuse en performance",
    severity: "low",
    recommendation: "Préférer des valeurs précalculées quand possible"
  },
  {
    pattern: /(^|\s)\.\w{1,2}(\s|$|\{)/g,
    description: "Sélecteurs CSS très courts, possiblement non-descriptifs",
    severity: "low",
    recommendation: "Utiliser des noms de classe plus descriptifs pour améliorer la maintenabilité"
  },
  {
    pattern: /\*\s*\{/g,
    description: "Sélecteur universel (*) impactant les performances",
    severity: "medium",
    recommendation: "Éviter le sélecteur universel ou limiter sa portée"
  },
  {
    pattern: /[^0-9]0(px|em|rem|%)/g,
    description: "Unités inutiles pour la valeur zéro",
    severity: "improvement",
    recommendation: "Simplifier en utilisant juste 0 sans unité"
  },
  {
    pattern: /rgb\(|rgba\(/gi,
    description: "Utilisation de RGB/RGBA au lieu des notations hexadécimales plus courtes",
    severity: "improvement",
    recommendation: "Utiliser des notations hexadécimales (#fff) quand possible"
  },
  {
    pattern: /width:\s*100%;\s*height:\s*100%/gi,
    description: "width/height 100% peuvent causer des problèmes de mise en page",
    severity: "medium",
    recommendation: "Utiliser 'width: 100%; height: auto;' pour les images ou flexbox/grid pour les layouts"
  }
];

// Bonnes pratiques à vérifier
const BEST_PRACTICES = [
  {
    check: (content) => !content.includes(':root') && !content.includes('--'),
    description: "Pas d'utilisation de variables CSS (custom properties)",
    recommendation: "Utiliser des variables CSS pour la cohérence et la maintenabilité"
  },
  {
    check: (content) => !content.includes('@supports'),
    description: "Pas d'utilisation de @supports pour la détection de fonctionnalités",
    recommendation: "Utiliser @supports pour fournir des fallbacks pour les navigateurs plus anciens"
  },
  {
    check: (content) => content.indexOf('@media') === -1,
    description: "Pas de media queries pour le responsive design",
    recommendation: "Implémenter des media queries pour une expérience mobile optimisée"
  },
  {
    check: (content) => !content.includes('prefers-reduced-motion'),
    description: "Pas de support pour prefers-reduced-motion",
    recommendation: "Respecter les préférences d'accessibilité avec @media (prefers-reduced-motion: reduce)"
  }
];

/**
 * Parcourt récursivement un répertoire et renvoie tous les fichiers CSS
 */
function findAllCssFiles(dir) {
  const results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        // Ignorer les node_modules et autres dossiers non pertinents
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          results.push(...findAllCssFiles(fullPath));
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        // Inclure les fichiers CSS et les fichiers JavaScript/TypeScript qui peuvent contenir du CSS-in-JS
        if (ext === '.css' || ext === '.scss' || ext === '.less' || ext === '.jsx' || ext === '.tsx') {
          results.push({
            path: fullPath,
            size: stat.size,
            extension: ext,
            filename: file,
            relativePath: path.relative(__dirname, fullPath)
          });
        }
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la recherche dans ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Analyse un fichier CSS pour trouver des problèmes potentiels
 */
function analyzeCssFile(file) {
  const content = fs.readFileSync(file.path, 'utf8');
  const issues = [];
  const bestPracticeIssues = [];
  
  // Vérifier les problèmes courants
  CSS_ISSUES.forEach(issue => {
    const matches = content.match(issue.pattern);
    if (matches && matches.length > 0) {
      issues.push({
        ...issue,
        count: matches.length,
        examples: matches.slice(0, 3) // Limiter le nombre d'exemples
      });
    }
  });
  
  // Vérifier les bonnes pratiques
  BEST_PRACTICES.forEach(practice => {
    if (practice.check(content)) {
      bestPracticeIssues.push(practice);
    }
  });
  
  // Calculer quelques métriques de base
  const lineCount = content.split('\n').length;
  const selectorCount = (content.match(/\{/g) || []).length;
  const mediaQueryCount = (content.match(/@media/g) || []).length;
  const importCount = (content.match(/@import/g) || []).length;
  const fontFaceCount = (content.match(/@font-face/g) || []).length;
  
  const cssStats = {
    lineCount,
    selectorCount,
    mediaQueryCount,
    importCount,
    fontFaceCount,
    fileSize: Math.round(file.size / 1024 * 100) / 100, // en KB avec 2 décimales
    hasIssues: issues.length > 0 || bestPracticeIssues.length > 0
  };
  
  return {
    file,
    issues,
    bestPracticeIssues,
    stats: cssStats
  };
}

/**
 * Génère des recommandations générales pour l'optimisation CSS
 */
function generateGeneralRecommendations() {
  return `
    <h2>Recommandations générales pour l'optimisation CSS</h2>
    
    <h3>Réduction du CLS (Cumulative Layout Shift)</h3>
    <ul>
      <li>Spécifier les dimensions (width et height) pour toutes les images et médias</li>
      <li>Réserver de l'espace pour les contenus dynamiques (publicités, widgets, etc.)</li>
      <li>Éviter d'insérer du contenu au-dessus du contenu existant après le chargement</li>
      <li>Préciser les dimensions des polices de caractères et éviter les changements de police pendant le chargement</li>
      <li>Utiliser des transformations CSS au lieu de modifier width/height pour les animations</li>
    </ul>
    
    <h3>Optimisation des performances</h3>
    <ul>
      <li>Minimiser et concaténer les fichiers CSS</li>
      <li>Utiliser la propriété 'content-visibility: auto' pour les sections hors écran</li>
      <li>Éviter les sélecteurs très complexes et profondément imbriqués</li>
      <li>Privilégier les animations de 'transform' et 'opacity' pour de meilleures performances</li>
      <li>Utiliser 'will-change' avec parcimonie pour les éléments qui seront animés</li>
      <li>Charger les polices de façon optimisée avec 'font-display: swap'</li>
    </ul>
    
    <h3>Bonnes pratiques d'organisation</h3>
    <ul>
      <li>Organiser le CSS selon une méthodologie comme BEM, SMACSS ou ITCSS</li>
      <li>Utiliser des variables CSS (custom properties) pour les valeurs répétées</li>
      <li>Séparer les styles de base, les composants et les utilitaires</li>
      <li>Charger les styles critiques en ligne dans le head et les non-critiques de façon asynchrone</li>
      <li>Préférer les classes aux sélecteurs d'ID ou d'élément pour une meilleure réutilisabilité</li>
    </ul>
    
    <h3>Accessibilité</h3>
    <ul>
      <li>Assurer un contraste suffisant entre le texte et l'arrière-plan</li>
      <li>Respecter prefers-reduced-motion pour les utilisateurs sensibles aux animations</li>
      <li>Prévoir des styles pour le mode sombre avec prefers-color-scheme</li>
      <li>Éviter de masquer le focus outline sans alternative visible</li>
    </ul>
    
    <h3>Techniques de chargement optimisé</h3>
    <ul>
      <li>Utiliser <code>rel="preload"</code> pour les styles critiques</li>
      <li>Utiliser <code>media="print"</code> pour les styles d'impression</li>
      <li>Éviter <code>@import</code> qui bloque le rendu</li>
      <li>Charger les polices avec <code>font-display: swap</code> ou <code>font-display: optional</code></li>
    </ul>
  `;
}

/**
 * Génère un rapport HTML avec les résultats et recommandations
 */
function generateReport(results) {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  // Calculer quelques statistiques globales
  const totalFileSize = results.reduce((sum, res) => sum + res.stats.fileSize, 0);
  const totalSelectorCount = results.reduce((sum, res) => sum + res.stats.selectorCount, 0);
  const filesWithIssues = results.filter(res => res.stats.hasIssues).length;
  
  // Générer les lignes pour chaque fichier
  let fileRows = '';
  results.forEach(result => {
    const issueCount = result.issues.length + result.bestPracticeIssues.length;
    const statusClass = issueCount > 5 ? 'high-issues' : issueCount > 0 ? 'some-issues' : 'no-issues';
    
    fileRows += `
      <tr class="${statusClass}">
        <td>${result.file.relativePath}</td>
        <td>${result.stats.fileSize} KB</td>
        <td>${result.stats.selectorCount}</td>
        <td>${result.stats.mediaQueryCount}</td>
        <td>${result.issues.length}</td>
        <td>${result.bestPracticeIssues.length}</td>
        <td>
          ${issueCount > 0 
            ? `<button onclick="toggleDetails('${result.file.relativePath.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')">Voir détails</button>` 
            : '✅ Pas de problèmes'}
        </td>
      </tr>
    `;
  });
  
  // Générer les sections détaillées pour chaque fichier
  let detailedSections = '';
  results.forEach(result => {
    if (result.issues.length === 0 && result.bestPracticeIssues.length === 0) {
      return; // Ne pas créer de section détaillée pour les fichiers sans problème
    }
    
    let issueList = '';
    result.issues.forEach(issue => {
      issueList += `
        <div class="issue ${issue.severity}">
          <h4>${issue.description} (${issue.count} occurrences)</h4>
          <p><strong>Recommandation:</strong> ${issue.recommendation}</p>
          ${issue.examples && issue.examples.length > 0 
            ? `<p><strong>Exemples:</strong> <code>${issue.examples.join('</code>, <code>')}</code></p>` 
            : ''}
        </div>
      `;
    });
    
    let bestPracticeList = '';
    result.bestPracticeIssues.forEach(practice => {
      bestPracticeList += `
        <div class="issue improvement">
          <h4>${practice.description}</h4>
          <p><strong>Recommandation:</strong> ${practice.recommendation}</p>
        </div>
      `;
    });
    
    detailedSections += `
      <div id="details-${result.file.relativePath.replace(/\//g, '-').replace(/\\/g, '-').replace(/\./g, '-')}" class="file-details" style="display: none;">
        <h3>Détails pour ${result.file.relativePath}</h3>
        
        <div class="stats-card">
          <h4>Statistiques</h4>
          <p>Taille: ${result.stats.fileSize} KB</p>
          <p>Lignes: ${result.stats.lineCount}</p>
          <p>Sélecteurs: ${result.stats.selectorCount}</p>
          <p>Media queries: ${result.stats.mediaQueryCount}</p>
          <p>Imports: ${result.stats.importCount}</p>
          <p>Font-face: ${result.stats.fontFaceCount}</p>
        </div>
        
        ${result.issues.length > 0 
          ? `<div class="issues-section"><h4>Problèmes identifiés</h4>${issueList}</div>` 
          : ''}
        
        ${result.bestPracticeIssues.length > 0 
          ? `<div class="best-practices-section"><h4>Bonnes pratiques à implémenter</h4>${bestPracticeList}</div>` 
          : ''}
      </div>
    `;
  });
  
  // Créer le contenu HTML du rapport
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'analyse CSS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
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
    h4 {
      margin-top: 15px;
      margin-bottom: 5px;
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
    tr.high-issues {
      background-color: #ffecec;
    }
    tr.some-issues {
      background-color: #fffde7;
    }
    tr.no-issues {
      background-color: #f1f8e9;
    }
    .summary {
      background-color: #e8f4fc;
      padding: 20px;
      border-radius: 5px;
      margin-top: 30px;
      margin-bottom: 30px;
    }
    .file-details {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #3498db;
    }
    .stats-card {
      background-color: #f0f7ff;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .issue {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 5px;
    }
    .issue.high {
      background-color: #ffecec;
      border-left: 4px solid #e74c3c;
    }
    .issue.medium {
      background-color: #fff5e6;
      border-left: 4px solid #f39c12;
    }
    .issue.low {
      background-color: #f8f9fa;
      border-left: 4px solid #95a5a6;
    }
    .issue.improvement {
      background-color: #eafaf1;
      border-left: 4px solid #2ecc71;
    }
    button {
      background-color: #3498db;
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background-color: #2980b9;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 90%;
    }
    .back-to-top {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #3498db;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
    }
    ul li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <h1>Rapport d'analyse CSS</h1>
  <p>Date de l'analyse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <p><strong>Nombre total de fichiers:</strong> ${results.length}</p>
    <p><strong>Taille totale des fichiers CSS:</strong> ${totalFileSize.toFixed(2)} KB</p>
    <p><strong>Nombre total de sélecteurs:</strong> ${totalSelectorCount}</p>
    <p><strong>Fichiers avec problèmes ou suggestions:</strong> ${filesWithIssues} (${Math.round(filesWithIssues / results.length * 100)}%)</p>
  </div>
  
  ${generateGeneralRecommendations()}
  
  <h2>Analyse des fichiers CSS</h2>
  <table>
    <tr>
      <th>Fichier</th>
      <th>Taille (KB)</th>
      <th>Sélecteurs</th>
      <th>Media Queries</th>
      <th>Problèmes</th>
      <th>Suggestions</th>
      <th>Actions</th>
    </tr>
    ${fileRows}
  </table>
  
  <h2>Détails par fichier</h2>
  ${detailedSections}
  
  <a href="#" class="back-to-top">Retour en haut ↑</a>
  
  <script>
    function toggleDetails(filePath) {
      // Convertir le chemin en un identifiant valide
      const id = filePath.replace(/\//g, '-').replace(/\\\\/g, '-').replace(/\\./g, '-');
      const element = document.getElementById('details-' + id);
      if (element) {
        if (element.style.display === 'none') {
          element.style.display = 'block';
          // Faire défiler jusqu'à l'élément
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          element.style.display = 'none';
        }
      }
    }
  </script>
</body>
</html>
  `;
  
  const reportPath = path.join(REPORT_DIR, 'css-analysis-report.html');
  fs.writeFileSync(reportPath, html);
  
  return reportPath;
}

/**
 * Fonction principale
 */
function main() {
  console.log("Analyse des fichiers CSS pour optimisation des performances...");
  
  // Trouver tous les fichiers CSS dans les dossiers pertinents
  const publicCssFiles = findAllCssFiles(PUBLIC_DIR);
  const clientCssFiles = findAllCssFiles(CLIENT_DIR);
  const allCssFiles = [...publicCssFiles, ...clientCssFiles];
  
  console.log(`Trouvé ${allCssFiles.length} fichiers CSS à analyser.`);
  
  // Analyser chaque fichier CSS
  const analysisResults = allCssFiles.map(analyzeCssFile);
  
  // Générer un rapport
  const reportPath = generateReport(analysisResults);
  
  console.log(`Analyse terminée! Le rapport est disponible: ${reportPath}`);
}

// Exécution du script
main();