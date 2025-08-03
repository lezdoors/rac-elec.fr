# 🚀 INSTRUCTIONS COMPLÈTES - DÉPLOIEMENT VERCEL

## 📋 CONFIGURATION VERCEL DASHBOARD (ÉTAPE PAR ÉTAPE)

### 1. Importation du Projet
1. Allez sur **[vercel.com](https://vercel.com)**
2. Cliquez **"New Project"**
3. Connectez votre repository GitHub
4. Sélectionnez votre projet **raccordement-elec**

### 2. Configuration Build Settings
**⚠️ IMPORTANT : Utilisez exactement ces paramètres**

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
Development Command: npm run dev
```

### 3. Variables d'Environnement OBLIGATOIRES
Dans l'onglet **"Environment Variables"** :

**🔐 Base de données**
- `DATABASE_URL` = `postgresql://username:password@hostname:port/database`

**💳 Stripe**  
- `STRIPE_SECRET_KEY` = `sk_live_...` (production) ou `sk_test_...` (test)
- `VITE_STRIPE_PUBLIC_KEY` = `pk_live_...` (production) ou `pk_test_...` (test)

**📧 Email SMTP**
- `SMTP_HOST` = `premium234.web-hosting.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = `notification@portail-electricite.com`
- `SMTP_PASS` = `[votre_mot_de_passe_smtp]`
- `SMTP_FROM` = `notification@portail-electricite.com`
- `SMTP_TO` = `bonjour@portail-electricite.com`

**📊 Google Analytics**
- `VITE_GA_MEASUREMENT_ID` = `GT-MJKTJGCK`

**⚙️ Système**
- `NODE_ENV` = `production`

## 📁 FICHIERS PRÉPARÉS POUR GITHUB

Les fichiers suivants ont été créés et configurés :

### ✅ Fichiers de Configuration Vercel
- **`vercel.json`** - Configuration routing et build Vercel
- **`server/vercel-entry.js`** - Point d'entrée serverless optimisé
- **`.vercelignore`** - Exclusions de déploiement
- **`.env.example`** - Template des variables d'environnement

### ✅ Scripts de Build
- **`build-vercel.sh`** - Script de test build local
- **Build automatique** via `npm run build` (652KB optimisé)

## 🔧 COMMANDES DE CONFIGURATION VERCEL

**Build Command:** `npm run build`  
**Output Directory:** `dist/public`  
**Install Command:** `npm install`  
**Development Command:** `npm run dev`

## 🌍 ÉTAPES DE DÉPLOIEMENT

### 1. Push vers GitHub
```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

### 2. Configuration Vercel
1. Importez le projet depuis GitHub
2. Configurez les Build Settings (voir ci-dessus)
3. Ajoutez TOUTES les variables d'environnement
4. Cliquez **"Deploy"**

### 3. Vérification Post-Déploiement
- ✅ Homepage se charge (polyfills compatibilité navigateur)
- ✅ Formulaire raccordement fonctionne  
- ✅ Paiements Stripe opérationnels
- ✅ Emails SMTP envoyés
- ✅ Google Ads tracking (conversions AW-16698052873)

## 📈 OPTIMISATIONS INCLUSES

### Performance
- **LCP < 2.5s** (Core Web Vitals optimisé)
- **Bundle 652KB** gzippé à 187KB
- **Browser polyfills** pour Safari < 13.1, Chrome < 80
- **CDN global** Vercel Edge Network

### Fonctionnalités
- **Google Ads conversions** : Form Start, Form Submit, Purchase
- **Stripe webhooks** intégrés
- **Email notifications** automatiques
- **Admin dashboard** complet
- **Mobile-first** responsive design

## 🆘 DEBUGGING

Si le déploiement échoue :

1. **Vérifiez les logs** dans Vercel Dashboard → Functions
2. **Variables d'environnement** toutes définies
3. **Build réussi** : `dist/public/index.html` doit exister
4. **Taille build** : ~3MB acceptable pour Vercel

## 🎯 RÉSULTAT ATTENDU

Après déploiement réussi :
- **URL Vercel** : `https://raccordement-elec.vercel.app`
- **Domaine personnalisé** : configurez `portail-electricite.com`
- **SSL automatique** activé
- **Performance optimale** sur mobile et desktop

---

**✨ PRÊT POUR LE DÉPLOIEMENT !**  
Tous les fichiers sont configurés et testés. Suivez simplement ces étapes dans l'ordre.