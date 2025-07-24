# 📤 UPLOAD GUIDE FOR NEW REPOSITORY

## Repository: https://github.com/lezdoors/raccordement-elec-deploy.git

Since Git commands are restricted, here's the manual upload process:

## 🗂️ FILES TO UPLOAD TO GITHUB

### Essential Configuration Files
- `package.json` - Dependencies and scripts
- `package-lock.json` - Exact dependency versions
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from Vercel build
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `drizzle.config.ts` - Database configuration
- `components.json` - UI components configuration

### Source Code Folders
- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared types and schemas
- `dist/` - Production build (3MB - critical for deployment)

### Documentation
- `INSTRUCTIONS_DEPLOYMENT_VERCEL.md` - Deployment guide
- `VERCEL_DEPLOYMENT_GUIDE.md` - Configuration details
- `NEW_REPO_SETUP.md` - Repository setup guide

## 🚀 MANUAL UPLOAD STEPS

### Step 1: Access Your Repository
1. Go to: https://github.com/lezdoors/raccordement-elec-deploy
2. Click "uploading an existing file" link

### Step 2: Upload Core Files First
Upload these files individually:
1. `package.json`
2. `vercel.json` 
3. `.vercelignore`
4. `tsconfig.json`
5. `vite.config.ts`
6. `drizzle.config.ts`

### Step 3: Upload Folders
Use "Choose your files" and select entire folders:
1. `client/` folder
2. `server/` folder  
3. `shared/` folder
4. `dist/` folder (CRITICAL - contains production build)

### Step 4: Commit
- Commit message: "Initial commit - Vercel deployment ready"
- Your email (ryanaoufal@gmail.com) will be used automatically

## 🎯 VERCEL DEPLOYMENT AFTER UPLOAD

Once uploaded, deploy to Vercel:

1. Go to **vercel.com/new**
2. Import **lezdoors/raccordement-elec-deploy**
3. Configuration:
   ```
   Build Command: npm run build
   Output Directory: dist/public
   Install Command: npm install
   ```
4. Add environment variables
5. Deploy

## ✅ VERIFICATION

After upload, verify these files exist:
- Repository shows ~50+ files
- `dist/public/index.html` exists
- `server/vercel-entry.js` exists
- All configuration files present

The new repository will have clean Git history with your proper email address!