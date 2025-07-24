#!/bin/bash

# Script de build pour Vercel
echo "🚀 Début du build Vercel..."

# 1. Nettoyer les anciens builds
rm -rf dist/

# 2. Build du frontend avec Vite
echo "📦 Build frontend (Vite)..."
npm run build

# 3. Vérifier que les fichiers sont bien générés
if [ -f "dist/public/index.html" ]; then
    echo "✅ Frontend build réussi"
else
    echo "❌ Erreur: dist/public/index.html manquant"
    exit 1
fi

# 4. Vérifier que les assets existent
if [ -d "dist/public/assets" ]; then
    echo "✅ Assets générés"
    ls -la dist/public/assets/ | head -3
else
    echo "❌ Erreur: dossier assets manquant"
    exit 1
fi

# 5. Vérifier la taille du build
BUILD_SIZE=$(du -sh dist/public | cut -f1)
echo "📊 Taille du build: $BUILD_SIZE"

echo "🎉 Build Vercel terminé avec succès !"
echo "📁 Fichiers prêts dans: dist/public/"