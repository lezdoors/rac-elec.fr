#!/usr/bin/env node

/**
 * Script d'optimisation d'images avec Sharp
 * Optimise automatiquement toutes les images pour des performances web maximales
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Configuration d'optimisation
const OPTIMIZATION_CONFIG = {
  jpeg: { quality: 85, progressive: true },
  png: { quality: 85, compressionLevel: 9 },
  webp: { quality: 85, effort: 6 },
  avif: { quality: 75, effort: 9 }
};

// Dossiers à traiter
const INPUT_DIRS = [
  path.join(projectRoot, 'attached_assets'),
  path.join(projectRoot, 'public/images'),
  path.join(projectRoot, 'client/src/assets')
];

const OUTPUT_DIR = path.join(projectRoot, 'public/optimized');

async function optimizeImage(inputPath, outputDir) {
  try {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const ext = path.extname(inputPath).toLowerCase();
    
    console.log(`🔄 Optimisation: ${filename}${ext}`);
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Redimensionnement intelligent pour différentes tailles
    const sizes = [
      { width: 1920, suffix: '_xl' },
      { width: 1200, suffix: '_lg' },
      { width: 768, suffix: '_md' },
      { width: 480, suffix: '_sm' }
    ];
    
    for (const size of sizes) {
      if (metadata.width && metadata.width >= size.width) {
        // WebP moderne
        await image
          .resize(size.width)
          .webp(OPTIMIZATION_CONFIG.webp)
          .toFile(path.join(outputDir, `${filename}${size.suffix}.webp`));
        
        // AVIF ultra-moderne
        await image
          .resize(size.width)
          .avif(OPTIMIZATION_CONFIG.avif)
          .toFile(path.join(outputDir, `${filename}${size.suffix}.avif`));
        
        // Fallback optimisé
        if (ext === '.jpg' || ext === '.jpeg') {
          await image
            .resize(size.width)
            .jpeg(OPTIMIZATION_CONFIG.jpeg)
            .toFile(path.join(outputDir, `${filename}${size.suffix}.jpg`));
        } else if (ext === '.png') {
          await image
            .resize(size.width)
            .png(OPTIMIZATION_CONFIG.png)
            .toFile(path.join(outputDir, `${filename}${size.suffix}.png`));
        }
      }
    }
    
    console.log(`✅ Optimisé: ${filename}`);
  } catch (error) {
    console.error(`❌ Erreur pour ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  if (!await fs.pathExists(dir)) {
    console.log(`⚠️  Dossier non trouvé: ${dir}`);
    return;
  }
  
  const files = await fs.readdir(dir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file)
  );
  
  console.log(`📁 Traitement de ${imageFiles.length} images dans ${dir}`);
  
  for (const file of imageFiles) {
    await optimizeImage(path.join(dir, file), OUTPUT_DIR);
  }
}

async function main() {
  console.log('🚀 Démarrage de l\'optimisation d\'images...\n');
  
  // Création du dossier de sortie
  await fs.ensureDir(OUTPUT_DIR);
  
  // Traitement de tous les dossiers
  for (const dir of INPUT_DIRS) {
    await processDirectory(dir);
  }
  
  console.log('\n✨ Optimisation terminée!');
  console.log(`📁 Images optimisées disponibles dans: ${OUTPUT_DIR}`);
}

main().catch(console.error);