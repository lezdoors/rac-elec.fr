/**
 * Script d'optimisation des images pour améliorer le LCP
 * 
 * Ce script analyse les images du projet et fournit des recommandations
 * pour améliorer les performances de chargement des images
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const CLIENT_DIR = path.join(__dirname, '../client/src');
const REPORT_DIR = path.join(__dirname, '../analysis-reports');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Tailles cibles recommandées pour différents contextes
const TARGET_SIZES = {
  hero: {
    width: 1280,
    maxSize: 200 * 1024, // 200 KB
  },
  thumbnail: {
    width: 400,
    maxSize: 50 * 1024, // 50 KB
  },
  icon: {
    width: 80,
    maxSize: 10 * 1024, // 10 KB
  },
  background: {
    width: 1920,
    maxSize: 300 * 1024, // 300 KB
  }
};

/**
 * Parcourt récursivement un répertoire et renvoie tous les fichiers image
 */
function findAllImages(dir) {
  const results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        // Ignorer les node_modules et autres dossiers non pertinents
        if (file !== 'node_modules' && file !== '.git') {
          results.push(...findAllImages(fullPath));
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
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
 * Détermine la catégorie probable d'une image en fonction de son chemin et de sa taille
 */
function determineImageCategory(imagePath, size) {
  const filename = path.basename(imagePath).toLowerCase();
  
  if (size > 200 * 1024) {
    if (filename.includes('hero') || filename.includes('banner') || filename.includes('header')) {
      return 'hero';
    } else if (filename.includes('bg') || filename.includes('background')) {
      return 'background';
    } else {
      return 'large';
    }
  } else if (size > 50 * 1024) {
    if (filename.includes('thumb') || filename.includes('preview')) {
      return 'thumbnail';
    } else {
      return 'medium';
    }
  } else if (size < 15 * 1024) {
    if (filename.includes('icon') || filename.includes('logo')) {
      return 'icon';
    } else {
      return 'small';
    }
  } else {
    return 'medium';
  }
}

/**
 * Évalue si une image est optimisée en fonction de sa taille et de sa catégorie
 */
function evaluateImage(image) {
  const category = determineImageCategory(image.path, image.size);
  let recommendation = '';
  let status = 'ok';
  
  if (category === 'large' && image.size > 300 * 1024) {
    recommendation = `Image trop volumineuse (${Math.round(image.size / 1024)} KB). Réduire à moins de 300KB.`;
    status = 'warning';
  } else if (category === 'hero' && image.size > TARGET_SIZES.hero.maxSize) {
    recommendation = `Image hero trop volumineuse (${Math.round(image.size / 1024)} KB). Réduire à moins de ${TARGET_SIZES.hero.maxSize / 1024}KB.`;
    status = 'warning';
  } else if (category === 'background' && image.size > TARGET_SIZES.background.maxSize) {
    recommendation = `Image d'arrière-plan trop volumineuse (${Math.round(image.size / 1024)} KB). Réduire à moins de ${TARGET_SIZES.background.maxSize / 1024}KB.`;
    status = 'warning';
  } else if (category === 'thumbnail' && image.size > TARGET_SIZES.thumbnail.maxSize) {
    recommendation = `Vignette trop volumineuse (${Math.round(image.size / 1024)} KB). Réduire à moins de ${TARGET_SIZES.thumbnail.maxSize / 1024}KB.`;
    status = 'warning';
  }
  
  if (image.extension === '.jpg' || image.extension === '.jpeg' || image.extension === '.png') {
    recommendation += recommendation ? ' Convertir en WebP pour une meilleure compression.' : 'Convertir en WebP pour une meilleure compression.';
    if (status === 'ok') status = 'suggestion';
  }
  
  return {
    ...image,
    category,
    status,
    recommendation,
    sizeKB: Math.round(image.size / 1024)
  };
}

/**
 * Génère un rapport HTML avec les résultats et recommandations
 */
function generateReport(images) {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  // Regrouper par statut
  const warnings = images.filter(img => img.status === 'warning');
  const suggestions = images.filter(img => img.status === 'suggestion');
  const ok = images.filter(img => img.status === 'ok');
  
  // Calculer les statistiques
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const potentialSavings = images
    .filter(img => img.status === 'warning')
    .reduce((sum, img) => {
      const category = determineImageCategory(img.path, img.size);
      const targetSize = TARGET_SIZES[category]?.maxSize || img.size * 0.7;
      return sum + (img.size - targetSize);
    }, 0);
  
  let imageRows = '';
  
  // Ajouter d'abord les avertissements
  warnings.forEach(img => {
    imageRows += `
      <tr class="warning">
        <td>${img.relativePath}</td>
        <td>${img.category}</td>
        <td>${img.sizeKB} KB</td>
        <td>${img.extension}</td>
        <td>⚠️ ${img.recommendation}</td>
      </tr>
    `;
  });
  
  // Puis les suggestions
  suggestions.forEach(img => {
    imageRows += `
      <tr class="suggestion">
        <td>${img.relativePath}</td>
        <td>${img.category}</td>
        <td>${img.sizeKB} KB</td>
        <td>${img.extension}</td>
        <td>💡 ${img.recommendation}</td>
      </tr>
    `;
  });
  
  // Puis les images OK
  ok.forEach(img => {
    imageRows += `
      <tr class="ok">
        <td>${img.relativePath}</td>
        <td>${img.category}</td>
        <td>${img.sizeKB} KB</td>
        <td>${img.extension}</td>
        <td>✅ Bien optimisée</td>
      </tr>
    `;
  });
  
  // Générer des recommandations générales
  const generalRecommendations = `
    <h2>Recommandations générales</h2>
    <ul>
      <li>Utiliser les images WebP pour un meilleur rapport qualité/taille</li>
      <li>Implémenter le chargement paresseux (lazy loading) avec l'attribut <code>loading="lazy"</code> pour les images en dessous de la ligne de flottaison</li>
      <li>Spécifier les dimensions (width et height) de chaque image pour éviter les décalages de mise en page (CLS)</li>
      <li>Utiliser des images responsives avec <code>srcset</code> et <code>sizes</code> pour les différentes tailles d'écran</li>
      <li>Optimiser les images critiques (LCP) pour qu'elles soient chargées en priorité</li>
      <li>Précharger les images importantes avec <code>&lt;link rel="preload"&gt;</code></li>
      <li>Utiliser un CDN pour servir les images avec mise en cache efficace</li>
    </ul>
    
    <h3>Commandes utiles pour l'optimisation des images</h3>
    <pre>
# Conversion en WebP:
npm install -g imagemin-cli imagemin-webp
imagemin image.jpg --plugin=webp -o output/

# Compression de SVG:
npm install -g svgo
svgo image.svg -o output.svg

# Redimensionnement (avec sharp):
npm install -g sharp-cli
sharp -i input.jpg -o output.jpg resize 800
    </pre>
  `;
  
  // Construire le HTML
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'optimisation des images</title>
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
    tr.warning {
      background-color: #ffecec;
    }
    tr.suggestion {
      background-color: #fffde7;
    }
    tr.ok {
      background-color: #f1f8e9;
    }
    .summary {
      background-color: #e8f4fc;
      padding: 20px;
      border-radius: 5px;
      margin-top: 30px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>Rapport d'optimisation des images</h1>
  <p>Date de l'analyse: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <p><strong>Nombre total d'images:</strong> ${images.length}</p>
    <p><strong>Taille totale:</strong> ${Math.round(totalSize / (1024 * 1024) * 100) / 100} MB</p>
    <p><strong>Économies potentielles:</strong> ${Math.round(potentialSavings / (1024 * 1024) * 100) / 100} MB (${Math.round(potentialSavings / totalSize * 100)}% de réduction possible)</p>
    <p><strong>Images nécessitant une optimisation:</strong> ${warnings.length}</p>
    <p><strong>Images avec suggestions d'amélioration:</strong> ${suggestions.length}</p>
    <p><strong>Images bien optimisées:</strong> ${ok.length}</p>
  </div>
  
  ${generalRecommendations}
  
  <h2>Détails des images</h2>
  <table>
    <tr>
      <th>Chemin</th>
      <th>Catégorie</th>
      <th>Taille</th>
      <th>Format</th>
      <th>Recommandation</th>
    </tr>
    ${imageRows}
  </table>
  
  <footer>
    <p>Rapport généré automatiquement pour aider à améliorer le LCP (Largest Contentful Paint).</p>
  </footer>
</body>
</html>
  `;
  
  const reportPath = path.join(REPORT_DIR, 'image-optimization-report.html');
  fs.writeFileSync(reportPath, html);
  
  return reportPath;
}

/**
 * Fonction principale
 */
function main() {
  console.log("Analyse des images pour optimisation LCP...");
  
  // Trouver toutes les images dans les dossiers pertinents
  const publicImages = findAllImages(PUBLIC_DIR);
  const clientImages = findAllImages(CLIENT_DIR);
  const allImages = [...publicImages, ...clientImages];
  
  console.log(`Trouvé ${allImages.length} images à analyser.`);
  
  // Évaluer chaque image
  const evaluatedImages = allImages.map(evaluateImage);
  
  // Générer un rapport
  const reportPath = generateReport(evaluatedImages);
  
  console.log(`Analyse terminée! Le rapport est disponible: ${reportPath}`);
}

// Exécution du script
main();