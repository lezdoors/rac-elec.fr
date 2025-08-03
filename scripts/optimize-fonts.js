#!/usr/bin/env node

/**
 * Optimisation des Google Fonts en local
 * Évite les requêtes externes et améliore la vitesse de chargement
 */

import https from 'https';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Fonts utilisées sur le site
const GOOGLE_FONTS = [
  {
    family: 'Inter',
    weights: ['300', '400', '500', '600', '700'],
    display: 'swap'
  },
  {
    family: 'Roboto',
    weights: ['300', '400', '500'],
    display: 'swap'
  }
];

function generateFontCSS() {
  return `
/* Google Fonts optimisées localement pour portail-electricite.com */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('./fonts/inter-light.woff2') format('woff2'),
       url('./fonts/inter-light.woff') format('woff');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./fonts/inter-regular.woff2') format('woff2'),
       url('./fonts/inter-regular.woff') format('woff');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./fonts/inter-medium.woff2') format('woff2'),
       url('./fonts/inter-medium.woff') format('woff');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./fonts/inter-semibold.woff2') format('woff2'),
       url('./fonts/inter-semibold.woff') format('woff');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./fonts/inter-bold.woff2') format('woff2'),
       url('./fonts/inter-bold.woff') format('woff');
}

/* Variables CSS pour une utilisation facile */
:root {
  --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-roboto: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Classes utilitaires */
.font-inter { font-family: var(--font-inter); }
.font-roboto { font-family: var(--font-roboto); }
`;
}

async function main() {
  try {
    console.log('🔤 Optimisation des fonts...');
    
    const publicDir = path.join(projectRoot, 'public');
    const fontsDir = path.join(publicDir, 'fonts');
    
    await fs.ensureDir(fontsDir);
    
    // Génération du CSS optimisé
    const fontCSS = generateFontCSS();
    await fs.writeFile(path.join(publicDir, 'fonts.css'), fontCSS);
    
    console.log('✅ CSS des fonts optimisé créé');
    console.log('📁 Fichiers disponibles dans public/fonts/');
    console.log('\n💡 Pour utiliser les fonts optimisées:');
    console.log('1. Ajoutez <link rel="stylesheet" href="/fonts.css"> dans votre HTML');
    console.log('2. Utilisez font-family: var(--font-inter) dans votre CSS');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

main();