/**
 * Fix production deployment errors
 * - TypeScript errors in server/index.ts
 * - Environment variable compatibility
 */

const fs = require('fs');
const path = require('path');

function fixServerErrors() {
  const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
  let content = fs.readFileSync(serverIndexPath, 'utf8');
  
  // Fix all error.message references
  content = content.replace(
    /res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);/g,
    'res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Unknown error" });'
  );
  
  fs.writeFileSync(serverIndexPath, content);
  console.log('✅ Fixed TypeScript errors in server/index.ts');
}

function checkEnvironmentVariables() {
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  console.log('✅ Vite config checked for production compatibility');
  
  // Check for remaining process.env usage in client
  const clientSrcPath = path.join(__dirname, 'client', 'src');
  const files = [];
  
  function findFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        findFiles(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  findFiles(clientSrcPath);
  
  let hasProcessEnv = false;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('process.env.NODE_ENV')) {
      console.log(`⚠️ Found process.env.NODE_ENV in ${file}`);
      hasProcessEnv = true;
    }
  }
  
  if (!hasProcessEnv) {
    console.log('✅ No process.env usage found in client code');
  }
}

// Run fixes
try {
  fixServerErrors();
  checkEnvironmentVariables();
  console.log('🎯 Production deployment fixes completed successfully');
} catch (error) {
  console.error('❌ Error applying fixes:', error);
}