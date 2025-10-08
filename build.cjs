const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Create dist/api directory if it doesn't exist
  const distApiDir = join(process.cwd(), 'dist', 'api');
  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
  }
  
  // Compile API TypeScript files to JavaScript in dist/api directory
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually to dist/api
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(distApiDir, file.replace('.ts', '.js'));
    
    console.log(`Compiling ${file}...`);
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=esm --outfile="${destPath}"`, {
      stdio: 'inherit'
    });
  }
  
  // Post-process compiled files to fix import extensions
  const compiledFiles = readdirSync(distApiDir);
  const compiledJsFiles = compiledFiles.filter(file => file.endsWith('.js'));
  
  for (const file of compiledJsFiles) {
    const filePath = join(distApiDir, file);
    let content = readFileSync(filePath, 'utf8');
    
    // Check if the file contains the specific import we're looking for
    if (content.includes('from "./_utils"')) {
      content = content.replace('from "./_utils"', 'from "./_utils.js"');
      // Write the file only if content was changed
      writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed import extensions in ${file}`);
    }
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}