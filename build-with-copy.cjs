const { execSync } = require('child_process');
const { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

function copyFolderRecursive(source, destination) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const files = readdirSync(source);
  
  for (const file of files) {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);
    
    if (statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destPath);
    } else {
      copyFileSync(sourcePath, destPath);
    }
  }
}

try {
  // Run the main build command
  console.log('Running main build...');
  execSync('npx vite build && npx esbuild server/index.ts server/vercel-handler.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit' 
  });
  
  // Copy server files
  console.log('Copying server files...');
  const sourceDir = join(process.cwd(), 'server');
  const destDir = join(process.cwd(), 'dist', 'server');
  
  console.log(`Copying files from ${sourceDir} to ${destDir}`);
  copyFolderRecursive(sourceDir, destDir);
  console.log('Server files copied successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}