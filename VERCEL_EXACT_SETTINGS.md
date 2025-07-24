# 🎯 VERCEL DEPLOYMENT - EXACT SETTINGS

Based on your screenshots, you're in the correct Vercel deployment interface. Here are the EXACT settings to use:

## ⚙️ Build & Development Settings

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
Development Command: npm run dev
Root Directory: . (leave blank or use single dot)
```

## 🔑 Environment Variables (CRITICAL)

Click "Environment Variables" and add these EXACT variables:

### Database
```
DATABASE_URL = postgresql://your_database_url_here
```

### Stripe Payment
```
STRIPE_SECRET_KEY = sk_live_... (or sk_test_ for testing)
VITE_STRIPE_PUBLIC_KEY = pk_live_... (or pk_test_ for testing)
```

### Email SMTP
```
SMTP_HOST = premium234.web-hosting.com
SMTP_PORT = 587
SMTP_USER = notification@raccordement-elec.fr
SMTP_PASS = your_smtp_password_here
SMTP_FROM = notification@raccordement-elec.fr
SMTP_TO = bonjour@raccordement-elec.fr
```

### Analytics
```
VITE_GA_MEASUREMENT_ID = GT-MJKTJGCK
```

### System
```
NODE_ENV = production
```

## 🚀 Deployment Steps

1. **Verify Build Settings** (see above)
2. **Add Environment Variables** (all of them - critical!)
3. **Click "Deploy"**
4. **Wait 2-3 minutes** for build to complete
5. **Your site will be live** at yourproject.vercel.app

## 🔍 Expected Build Output

- Frontend build: ~652KB optimized bundle
- Build time: ~30 seconds to 2 minutes
- Success: Site serves from dist/public/index.html

## ⚠️ Critical Notes

- **Don't skip environment variables** - the app needs DATABASE_URL and STRIPE keys to function
- **Output directory MUST be** `dist/public` (not just `dist`)
- **Build command MUST be** `npm run build` (this creates the dist/public folder)

Your repository is correctly connected. Just configure these settings and deploy!