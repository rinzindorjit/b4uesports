const { execSync } = require('child_process');
const { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } = require('fs');
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
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Bundle server files
  console.log('Bundling server files...');
  execSync('npx esbuild server/index.ts server/vercel-handler.ts server/routes.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
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
  
  // Compile API TypeScript files to JavaScript without bundling
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  const apiDestDir = join(process.cwd(), 'dist', 'api');
  
  // Create the API directory
  if (!existsSync(apiDestDir)) {
    mkdirSync(apiDestDir, { recursive: true });
  }
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Remove existing .ts files from the destination directory to avoid conflicts
  const destFiles = readdirSync(apiDestDir);
  const destTsFiles = destFiles.filter(file => file.endsWith('.ts'));
  for (const file of destTsFiles) {
    const destPath = join(apiDestDir, file);
    unlinkSync(destPath);
    console.log(`Removed existing .ts file: ${file}`);
  }
  
  // Compile each TypeScript file individually
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiDestDir, file.replace('.ts', '.js'));
    
    console.log(`Compiling ${file}...`);
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=esm --outfile="${destPath}"`, {
      stdio: 'inherit'
    });
  }
  
  // Post-process compiled files to fix import extensions
  const compiledFiles = readdirSync(apiDestDir);
  const compiledJsFiles = compiledFiles.filter(file => file.endsWith('.js'));
  
  for (const file of compiledJsFiles) {
    const filePath = join(apiDestDir, file);
    let content = require('fs').readFileSync(filePath, 'utf8');
    
    // Check if the file contains the specific import we're looking for
    if (content.includes('from "./_utils"')) {
      content = content.replace('from "./_utils"', 'from "./_utils.js"');
      // Write the file only if content was changed
      require('fs').writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed import extensions in ${file}`);
    }
  }
  
  console.log('Build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}