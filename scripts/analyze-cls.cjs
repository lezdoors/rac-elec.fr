/**
 * Script d'analyse du CLS (Cumulative Layout Shift)
 * 
 * Ce script analyse les potentielles sources de CLS dans le HTML et CSS
 * et fournit des recommandations pour améliorer la stabilité visuelle.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const CLIENT_DIR = path.join(__dirname, '../client/src');
const REPORT_DIR = path.join(__dirname, '../analysis-reports');

// Motifs problématiques qui peuvent causer des CLS
const CLS_PATTERNS = [
  {
    type: 'html',
    pattern: /<img(?![^>]*width)(?![^>]*height)[^>]*>/gi,
    description: "Image sans attributs width et height spécifiés",
    severity: "high",
    fix: "Ajouter des attributs width et height à toutes les images"
  },
  {
    type: 'html',
    pattern: /<div[^>]*id=['"]?ad[^'">]*[^>]*>(?:(?!<\/div>).)*<\/div>/gis,
    description: "Espace publicitaire sans dimensions fixes",
    severity: "high",
    fix: "Définir une hauteur fixe pour les conteneurs d'annonces"
  },
  {
    type: 'html',
    pattern: /<iframe(?![^>]*width)(?![^>]*height)[^>]*>/gi,
    description: "iFrame sans attributs width et height spécifiés",
    severity: "high",
    fix: "Ajouter des attributs width et height à toutes les iframes"
  },
  {
    type: 'html',
    pattern: /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi,
    description: "Feuille de style bloquant le rendu",
    severity: "medium",
    fix: "Utiliser media='print' ou rel='preload' as='style' pour les styles non critiques"
  },
  {
    type: 'html',
    pattern: /<script(?![^>]*async)(?![^>]*defer)[^>]*src=[^>]*>/gi,
    description: "Script bloquant sans attributs async ou defer",
    severity: "medium",
    fix: "Ajouter async ou defer aux scripts non critiques"
  },
  {
    type: 'css',
    pattern: /@font-face\s*\{[^}]*\}/gi,
    description: "Déclaration de police qui peut causer un FOUT (Flash of Unstyled Text)",
    severity: "medium",
    fix: "Ajouter font-display: swap; ou utiliser preload pour les polices"
  },
  {
    type: 'css',
    pattern: /position\s*:\s*fixed|position\s*:\s*absolute/gi,
    description: "Éléments positionnés en fixe ou absolu qui peuvent causer des décalages",
    severity: "medium",
    fix: "S'assurer que les éléments positionnés ont une taille définie et n'affectent pas le flux"
  },
  {
    type: 'css',
    pattern: /height\s*:\s*auto/gi,
    description: "Hauteur automatique qui peut changer lors du chargement du contenu",
    severity: "medium",
    fix: "Définir des hauteurs fixes pour les conteneurs, surtout pour les images et médias"
  },
  {
    type: 'both',
    pattern: /transform\s*:\s*translate|margin-top|margin-left/gi,
    description: "Transformations ou marges qui peuvent modifier la position des éléments",
    severity: "low",
    fix: "Préférer transform pour les animations et éviter de modifier les marges après le chargement"
  },
  {
    type: 'html',
    pattern: /<div(?![^>]*style)(?![^>]*class)[^>]*>/gi,
    description: "Éléments sans styles définis qui peuvent changer de taille",
    severity: "low",
    fix: "Définir des classes ou styles pour tous les conteneurs principaux"
  },
  {
    type: 'js',
    pattern: /insertBefore|appendChild|prependChild|innerHTML|insertAdjacentHTML/gi,
    description: "Insertion dynamique de contenu qui peut provoquer des décalages",
    severity: "medium",
    fix: "Préallouer de l'espace pour le contenu dynamique et utiliser des placeholders"
  },
  {
    type: 'js',
    pattern: /addEventListener\(['"](load|DOMContentLoaded)['"]/gi,
    description: "Modification du DOM après le chargement de la page",
    severity: "medium",
    fix: "Éviter d'ajouter du contenu au-dessus du contenu existant après le chargement"
  }
];

/**
 * Parcourt récursivement un répertoire et renvoie les fichiers correspondant aux extensions
 */
function findFiles(dir, extensions) {
  const results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        // Ignorer les node_modules et autres dossiers non pertinents
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          results.push(...findFiles(fullPath, extensions));
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          results.push({
            path: fullPath,
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
 * Analyse un fichier pour les problèmes de CLS
 */
function analyzeFileForCLS(file) {
  const content = fs.readFileSync(file.path, 'utf8');
  const issues = [];
  
  // Déterminer le type de fichier
  let fileType = 'unknown';
  if (['.html', '.jsx', '.tsx'].includes(file.extension)) {
    fileType = 'html';
  } else if (['.css', '.scss', '.less'].includes(file.extension)) {
    fileType = 'css';
  } else if (['.js', '.jsx', '.ts', '.tsx'].includes(file.extension)) {
    fileType = 'js';
  }
  
  // Vérifier les motifs problématiques
  CLS_PATTERNS.forEach(pattern => {
    // Analyser seulement si le pattern s'applique à ce type de fichier ou à tous les types
    if (pattern.type === 'both' || pattern.type === fileType) {
      const matches = content.match(pattern.pattern);
      if (matches && matches.length > 0) {
        issues.push({
          ...pattern,
          count: matches.length,
          examples: matches.slice(0, 3).map(m => m.substring(0, 100)) // Limiter la longueur de l'exemple
        });
      }
    }
  });
  
  return {
    file,
    issues,
    hasIssues: issues.length > 0
  };
}

/**
 * Génère des recommandations générales pour éviter le CLS
 */
function generateGeneralRecommendations() {
  return `
    <h2>Recommandations générales pour réduire le CLS</h2>
    
    <h3>Pour les images et médias</h3>
    <ul>
      <li><strong>Toujours spécifier width et height</strong> - Cela permet au navigateur de réserver l'espace nécessaire.</li>
      <li><strong>Utiliser l'attribut aspect-ratio</strong> - Pour maintenir le rapport hauteur/largeur et éviter les sauts.</li>
      <li><strong>Implémenter des placeholders</strong> - Utiliser des techniques comme le blur-up ou les squelettes de chargement.</li>
      <li><strong>Éviter les images sans dimensions</strong> - Toujours définir des dimensions explicites pour les images.</li>
    </ul>
    
    <h3>Pour les polices</h3>
    <ul>
      <li><strong>Utiliser font-display: swap</strong> - Pour éviter que le texte ne soit invisible pendant le chargement de la police.</li>
      <li><strong>Précharger les polices critiques</strong> - Avec &lt;link rel="preload" as="font"&gt;.</li>
      <li><strong>Considérer le system font stack</strong> - Utiliser des polices système pour les performances.</li>
      <li><strong>Utiliser size-adjust et font-family fallbacks</strong> - Pour minimiser les changements de taille entre les polices de substitution et les polices web.</li>
    </ul>
    
    <h3>Pour les annonces et embeds</h3>
    <ul>
      <li><strong>Réserver un espace fixe</strong> - Toujours définir une hauteur et une largeur fixes pour les conteneurs d'annonces.</li>
      <li><strong>Utiliser des dimensions fixes pour les iframes</strong> - Définir width et height pour tous les iframes.</li>
      <li><strong>Injecter le contenu dynamique vers le bas</strong> - Éviter d'insérer du contenu au-dessus du contenu existant après le chargement.</li>
    </ul>
    
    <h3>Pour le contenu dynamique</h3>
    <ul>
      <li><strong>Préallouer l'espace</strong> - Utiliser min-height pour réserver de l'espace pour le contenu qui sera chargé.</li>
      <li><strong>Utiliser des squelettes de chargement</strong> - Montrer une version "squelette" du contenu pendant le chargement.</li>
      <li><strong>Éviter les transformations qui changent la taille</strong> - Préférer transform aux changements de taille pour les animations.</li>
      <li><strong>Utiliser position: absolute</strong> - Pour les éléments qui ne devraient pas affecter le flux de la page.</li>
    </ul>
    
    <h3>Techniques de chargement</h3>
    <ul>
      <li><strong>Charger les styles critiques en ligne</strong> - Mettre les styles essentiels dans le &lt;head&gt; pour éviter les FOUC.</li>
      <li><strong>Différer les scripts non critiques</strong> - Utiliser async ou defer pour les scripts qui ne sont pas essentiels.</li>
      <li><strong>Charger le contenu tiers de manière asynchrone</strong> - Utiliser des techniques comme l'Intersection Observer pour charger le contenu uniquement lorsqu'il est nécessaire.</li>
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
  
  // Calculer quelques statistiques
  const filesWithIssues = results.filter(r => r.hasIssues).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  
  // Regrouper les problèmes par type et sévérité pour les statistiques
  const issueStats = {
    high: 0,
    medium: 0,
    low: 0,
    byType: {
      html: 0,
      css: 0,
      js: 0
    }
  };
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      issueStats[issue.severity]++;
      if (issue.type !== 'both') {
        issueStats.byType[issue.type]++;
      }
    });
  });
  
  // Générer les lignes pour les fichiers avec problèmes
  let fileRows = '';
  results.filter(r => r.hasIssues).forEach(result => {
    const highCount = result.issues.filter(i => i.severity === 'high').length;
    const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
    const lowCount = result.issues.filter(i => i.severity === 'low').length;
    
    const severityClass = highCount > 0 ? 'high' : mediumCount > 0 ? 'medium' : 'low';
    
    fileRows += `
      <tr class="${severityClass}">
        <td>${result.file.relativePath}</td>
        <td>${highCount}</td>
        <td>${mediumCount}</td>
        <td>${lowCount}</td>
        <td>
          <button onclick="toggleDetails('${result.file.relativePath.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')">Voir détails</button>
        </td>
      </tr>
    `;
  });
  
  // Générer les sections détaillées pour chaque fichier avec problèmes
  let detailedSections = '';
  results.filter(r => r.hasIssues).forEach(result => {
    let issueList = '';
    result.issues.forEach(issue => {
      issueList += `
        <div class="issue ${issue.severity}">
          <h4>${issue.description} (${issue.count} occurrences)</h4>
          <p><strong>Correction recommandée:</strong> ${issue.fix}</p>
          ${issue.examples && issue.examples.length > 0 
            ? `<p><strong>Exemples:</strong></p><pre>${issue.examples.join('\n\n')}</pre>` 
            : ''}
        </div>
      `;
    });
    
    detailedSections += `
      <div id="details-${result.file.relativePath.replace(/\//g, '-').replace(/\\/g, '-').replace(/\./g, '-')}" class="file-details" style="display: none;">
        <h3>Problèmes de CLS dans ${result.file.relativePath}</h3>
        ${issueList}
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
  <title>Rapport d'analyse CLS (Cumulative Layout Shift)</title>
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
    tr.high {
      background-color: #ffecec;
    }
    tr.medium {
      background-color: #fff5e6;
    }
    tr.low {
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
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      font-size: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
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
    .chart-container {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .chart {
      width: 48%;
      min-width: 300px;
      margin-bottom: 20px;
      background-color: #fff;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .chart h3 {
      margin-top: 0;
    }
    .bar {
      height: 30px;
      margin: 10px 0;
      background-color: #3498db;
      text-align: right;
      color: white;
      padding-right: 10px;
      line-height: 30px;
      border-radius: 3px;
    }
    .bar.high {
      background-color: #e74c3c;
    }
    .bar.medium {
      background-color: #f39c12;
    }
    .bar.low {
      background-color: #95a5a6;
    }
    .bar.html {
      background-color: #3498db;
    }
    .bar.css {
      background-color: #9b59b6;
    }
    .bar.js {
      background-color: #2ecc71;
    }
  </style>
</head>
<body>
  <h1>Rapport d'analyse CLS (Cumulative Layout Shift)</h1>
  <p>Date de l'analyse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <p><strong>Nombre total de fichiers analysés:</strong> ${results.length}</p>
    <p><strong>Fichiers avec problèmes potentiels de CLS:</strong> ${filesWithIssues} (${Math.round(filesWithIssues / results.length * 100)}%)</p>
    <p><strong>Nombre total de problèmes détectés:</strong> ${totalIssues}</p>
    <p><strong>Problèmes de haute sévérité:</strong> ${issueStats.high}</p>
    <p><strong>Problèmes de sévérité moyenne:</strong> ${issueStats.medium}</p>
    <p><strong>Problèmes de faible sévérité:</strong> ${issueStats.low}</p>
    
    <div class="chart-container">
      <div class="chart">
        <h3>Problèmes par sévérité</h3>
        <div class="bar high" style="width: ${issueStats.high ? (issueStats.high / totalIssues * 100) : 0}%">${issueStats.high} (${Math.round(issueStats.high / totalIssues * 100)}%)</div>
        <div class="bar medium" style="width: ${issueStats.medium ? (issueStats.medium / totalIssues * 100) : 0}%">${issueStats.medium} (${Math.round(issueStats.medium / totalIssues * 100)}%)</div>
        <div class="bar low" style="width: ${issueStats.low ? (issueStats.low / totalIssues * 100) : 0}%">${issueStats.low} (${Math.round(issueStats.low / totalIssues * 100)}%)</div>
      </div>
      
      <div class="chart">
        <h3>Problèmes par type de fichier</h3>
        <div class="bar html" style="width: ${issueStats.byType.html ? (issueStats.byType.html / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100) : 0}%">HTML: ${issueStats.byType.html} (${Math.round(issueStats.byType.html / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100)}%)</div>
        <div class="bar css" style="width: ${issueStats.byType.css ? (issueStats.byType.css / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100) : 0}%">CSS: ${issueStats.byType.css} (${Math.round(issueStats.byType.css / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100)}%)</div>
        <div class="bar js" style="width: ${issueStats.byType.js ? (issueStats.byType.js / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100) : 0}%">JS: ${issueStats.byType.js} (${Math.round(issueStats.byType.js / (issueStats.byType.html + issueStats.byType.css + issueStats.byType.js) * 100)}%)</div>
      </div>
    </div>
  </div>
  
  ${generateGeneralRecommendations()}
  
  <h2>Fichiers avec problèmes potentiels de CLS</h2>
  ${filesWithIssues === 0 ? 
    '<div class="no-issues">✅ Aucun problème potentiel de CLS détecté dans les fichiers analysés.</div>' :
    `<table>
      <tr>
        <th>Fichier</th>
        <th>Problèmes haute sévérité</th>
        <th>Problèmes sévérité moyenne</th>
        <th>Problèmes faible sévérité</th>
        <th>Actions</th>
      </tr>
      ${fileRows}
    </table>`
  }
  
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
  
  const reportPath = path.join(REPORT_DIR, 'cls-analysis-report.html');
  fs.writeFileSync(reportPath, html);
  
  return reportPath;
}

/**
 * Fonction principale
 */
function main() {
  console.log("Analyse des problèmes potentiels de CLS (Cumulative Layout Shift)...");
  
  // Trouver tous les fichiers HTML, CSS et JS
  const htmlFiles = findFiles(CLIENT_DIR, ['.html', '.jsx', '.tsx']);
  const cssFiles = findFiles(CLIENT_DIR, ['.css', '.scss', '.less']);
  const jsFiles = findFiles(CLIENT_DIR, ['.js', '.jsx', '.ts', '.tsx']);
  const publicFiles = findFiles(PUBLIC_DIR, ['.html', '.css', '.js']);
  
  const allFiles = [...htmlFiles, ...cssFiles, ...jsFiles, ...publicFiles];
  
  console.log(`Trouvé ${allFiles.length} fichiers à analyser (${htmlFiles.length} HTML, ${cssFiles.length} CSS, ${jsFiles.length} JS, ${publicFiles.length} dans /public).`);
  
  // Analyser chaque fichier
  const analysisResults = allFiles.map(analyzeFileForCLS);
  
  // Générer un rapport
  const reportPath = generateReport(analysisResults);
  
  console.log(`Analyse terminée! Le rapport est disponible: ${reportPath}`);
}

// Exécution du script
main();