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
  execSync('npx vite build && npx esbuild server/index.ts server/vercel-handler.ts server/routes.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit' 
  });
  
  // Copy server files
  console.log('Copying server files...');
  const sourceDir = join(process.cwd(), 'server');
  const destDir = join(process.cwd(), 'dist', 'server');
  
  // Create the server directory
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  
  // Copy only the files that are not bundled
  const filesToCopy = ['storage.ts', 'services', 'types', 'utils', 'vite.ts'];
  
  for (const file of filesToCopy) {
    const sourcePath = join(sourceDir, file);
    const destPath = join(destDir, file);
    
    if (existsSync(sourcePath)) {
      if (statSync(sourcePath).isDirectory()) {
        copyFolderRecursive(sourcePath, destPath);
      } else {
        copyFileSync(sourcePath, destPath);
      }
    }
  }
  
  // Copy API files to dist/api directory
  console.log('Copying API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  const apiDestDir = join(process.cwd(), 'dist', 'api');
  
  // Create the API directory
  if (!existsSync(apiDestDir)) {
    mkdirSync(apiDestDir, { recursive: true });
  }
  
  // Copy all API files
  copyFolderRecursive(apiSourceDir, apiDestDir);
  
  console.log('Server and API files copied successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}