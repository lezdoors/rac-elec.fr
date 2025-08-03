# Guide de Déploiement Vercel - Raccordement-Elec.fr

## 📋 Configuration Vercel Dashboard

Lors de l'importation de votre projet GitHub sur Vercel, utilisez ces paramètres exacts :

### ⚙️ Build & Development Settings

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
Development Command: npm run dev
```

### 🔑 Variables d'Environnement Obligatoires

Dans l'onglet "Environment Variables" de votre projet Vercel, ajoutez :

**Base de données :**
- `DATABASE_URL` = votre URL PostgreSQL complète

**Stripe :**
- `STRIPE_SECRET_KEY` = sk_live_... (ou sk_test_... pour test)
- `VITE_STRIPE_PUBLIC_KEY` = pk_live_... (ou pk_test_... pour test)

**Email SMTP :**
- `SMTP_HOST` = premium234.web-hosting.com
- `SMTP_PORT` = 587
- `SMTP_USER` = notification@portail-electricite.com
- `SMTP_PASS` = votre_mot_de_passe_smtp
- `SMTP_FROM` = notification@portail-electricite.com
- `SMTP_TO` = bonjour@portail-electricite.com

**Google Analytics :**
- `VITE_GA_MEASUREMENT_ID` = GT-MJKTJGCK

**Système :**
- `NODE_ENV` = production

## 📁 Fichiers Préparés pour le Déploiement

### ✅ Fichiers de Configuration Créés :
- `vercel.json` - Configuration principale Vercel
- `server/vercel-entry.js` - Point d'entrée serverless
- `.vercelignore` - Fichiers à ignorer lors du build
- `.env.example` - Template des variables d'environnement

## 🚀 Étapes de Déploiement

### 1. Préparation GitHub
```bash
# Commitez tous les changements
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Configuration Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Cliquez "New Project"
4. Importez votre repository
5. Configurez avec les paramètres ci-dessus

### 3. Vérification Post-Déploiement
- ✅ Homepage charge correctement
- ✅ Formulaire de raccordement fonctionne
- ✅ Paiements Stripe opérationnels
- ✅ Emails de notification envoyés
- ✅ Google Ads tracking actif

## 🔧 Commandes de Build Détaillées

Le processus de build Vercel exécute :
1. `npm install` - Installation des dépendances
2. `npm run build` - Build du frontend (Vite) + backend (ESBuild)
3. Création de `dist/public/` avec tous les assets
4. Déploiement de `server/vercel-entry.js` comme fonction serverless

## 🌐 Domaine Personnalisé

Après déploiement, configurez votre domaine :
1. Dans Vercel Dashboard → Settings → Domains
2. Ajoutez `portail-electricite.com`
3. Configurez les DNS selon les instructions Vercel

## 🔍 Debugging

Si le déploiement échoue :
1. Vérifiez les logs de build dans Vercel Dashboard
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que `dist/public/index.html` est généré
4. Contactez le support si nécessaire

## 📈 Performance

Configuration optimisée pour :
- ⚡ LCP < 2.5s (Critical Web Vitals)
- 🔄 Build time < 2 minutes
- 💾 Bundle size optimisé (652KB gzip)
- 🌍 CDN global Vercel