# 🔧 VERCEL DEPLOYMENT TROUBLESHOOTING

## Current Issue: Repository Access/Naming

Based on your screenshots, here are the exact steps to resolve the deployment issue:

### 1. Import Repository on Vercel (CORRECT METHOD)

**Instead of creating a deployment from the repository page:**

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"**
3. If you don't see your repository, click **"Adjust GitHub App permissions"**
4. Grant access to the `rac-elec.FR` repository
5. Select `lezdoors/rac-elec.FR` from the list

### 2. Verify Repository Name Format

Your repository name `rac-elec.FR` might need to be accessed as:
- `rac-elec-FR` (with hyphen instead of dot)
- Ensure the exact case matches: `rac-elec.FR`

### 3. Alternative: Direct Import URL

Try importing directly with this URL in Vercel:
```
https://github.com/lezdoors/rac-elec.FR
```

### 4. Check GitHub App Permissions

1. Go to **GitHub.com → Settings → Applications**
2. Find **"Vercel"** in "Installed GitHub Apps"
3. Click **"Configure"**
4. Ensure `rac-elec.FR` repository access is granted

### 5. Exact Vercel Configuration

Once imported, use these EXACT settings:

```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
Development Command: npm run dev
Root Directory: . (leave empty or use dot)
```

### 6. Environment Variables

Add these in Vercel dashboard:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `SMTP_HOST=premium234.web-hosting.com`
- `SMTP_PORT=587`
- `SMTP_USER=notification@raccordement-elec.fr`
- `SMTP_PASS=your_password`
- `SMTP_FROM=notification@raccordement-elec.fr`
- `SMTP_TO=bonjour@raccordement-elec.fr`
- `VITE_GA_MEASUREMENT_ID=GT-MJKTJGCK`
- `NODE_ENV=production`

## Quick Fix Steps:

1. **Use direct import**: Go to vercel.com/new instead of GitHub repository page
2. **Grant permissions**: Ensure Vercel has access to your repository
3. **Check exact name**: Repository name `rac-elec.FR` must match exactly
4. **Use correct settings**: Build command `npm run build`, Output `dist/public`

This should resolve the deployment issue completely.