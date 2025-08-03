#!/usr/bin/env node

/**
 * Générateur de sitemap automatique pour portail-electricite.com
 * Améliore le référencement Google et l'indexation
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Configuration du site
const SITE_CONFIG = {
  baseUrl: 'https://portail-electricite.com',
  defaultChangefreq: 'weekly',
  defaultPriority: '0.8'
};

// Pages du site avec leurs priorités SEO
const SITE_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/raccordement-enedis', priority: '0.9', changefreq: 'weekly' },
  { url: '/particulier', priority: '0.9', changefreq: 'weekly' },
  { url: '/professionnel', priority: '0.9', changefreq: 'weekly' },
  { url: '/solaire', priority: '0.9', changefreq: 'weekly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
  { url: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
  { url: '/cgv', priority: '0.3', changefreq: 'yearly' }
];

function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  SITE_PAGES.forEach(page => {
    sitemap += `
  <url>
    <loc>${SITE_CONFIG.baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_CONFIG.baseUrl}/sitemap.xml

# Optimisation pour les moteurs de recherche
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Blocage des dossiers sensibles
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dist/
Disallow: /node_modules/

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1`;
}

async function main() {
  try {
    console.log('🗺️  Génération du sitemap...');
    
    const publicDir = path.join(projectRoot, 'public');
    await fs.ensureDir(publicDir);
    
    // Génération du sitemap.xml
    const sitemapContent = generateSitemap();
    await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    console.log('✅ sitemap.xml généré');
    
    // Génération du robots.txt
    const robotsContent = generateRobotsTxt();
    await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsContent);
    console.log('✅ robots.txt généré');
    
    console.log('\n🚀 SEO Configuration terminée!');
    console.log(`📊 ${SITE_PAGES.length} pages indexées`);
    console.log(`🔗 Sitemap: ${SITE_CONFIG.baseUrl}/sitemap.xml`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  }
}

main();