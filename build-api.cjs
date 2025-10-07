const { execSync } = require('child_process');
const { existsSync, mkdirSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

try {
  // Compile API TypeScript files to JavaScript without bundling
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), '..', 'api');
  const apiDestDir = join(process.cwd(), '..', 'dist', 'api');
  
  // Create the API directory
  if (!existsSync(apiDestDir)) {
    mkdirSync(apiDestDir, { recursive: true });
  }
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiDestDir, file.replace('.ts', '.js'));
    
    console.log(`Compiling ${file}...`);
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=esm --outfile="${destPath}"`, {
      stdio: 'inherit'
    });
  }
  
  console.log('API build completed successfully!');
  
} catch (error) {
  console.error('API build failed:', error.message);
  process.exit(1);
}