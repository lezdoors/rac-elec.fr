# 🎯 EXACT VERCEL SETUP CONFIGURATION

## Vercel Dashboard Settings

### Framework Settings (Build and Deployment)
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
Development Command: npm run dev
Root Directory: (leave empty)
```

### Project Settings
```
Node.js Version: 20.x
Build & Development Settings: Override enabled for all commands
```

## GitHub Repository Structure Required

Your repository must contain these exact folders and files:

### Essential Source Code
```
client/
├── index.html                 (React entry point - 14KB)
├── src/                      (React components)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── pages/
│   └── lib/
└── public/                   (Static assets)
```

### Production Build Files
```
dist/public/                  (Generated build - 3MB total)
├── index.html               (Built HTML - 16KB)
├── assets/                  (JS/CSS bundles)
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── [other bundle files]
├── amex.svg                 (Payment icons)
├── cb.svg
├── mastercard.svg
└── visa.svg
```

### Configuration Files
```
package.json                 (Contains build script)
vite.config.ts              (Vite configuration)
.vercelignore               (Updated ignore rules)
```

## Environment Variables (if needed)
Set in Vercel dashboard under Settings > Environment Variables:
```
DATABASE_URL=your_database_url
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
SMTP_HOST=premium234.web-hosting.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Critical Fix Required
**Output Directory MUST be "dist/public" not just "dist"**

This is the key difference that will resolve your 404 error.