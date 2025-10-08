const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } = require('fs');
const { join } = require('path');

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Compile API TypeScript files to JavaScript in the api directory
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Remove any existing .js files in the api directory to prevent conflicts
  const existingJsFiles = files.filter(file => file.endsWith('.js'));
  if (existingJsFiles.length > 0) {
    console.log('Removing existing JavaScript files:', existingJsFiles);
    for (const file of existingJsFiles) {
      const filePath = join(apiSourceDir, file);
      unlinkSync(filePath);
      console.log(`Removed ${filePath}`);
    }
  }
  
  // Compile each TypeScript file individually to the same api directory
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiSourceDir, file.replace('.ts', '.js'));
    
    console.log(`Compiling ${file} to ${destPath}...`);
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=esm --outfile="${destPath}"`, {
      stdio: 'inherit'
    });
    
    // Verify the file was created
    if (existsSync(destPath)) {
      console.log(`Successfully created ${destPath}`);
    } else {
      console.error(`Failed to create ${destPath}`);
    }
  }
  
  // Post-process compiled files to fix import extensions
  const updatedFiles = readdirSync(apiSourceDir);
  const compiledJsFiles = updatedFiles.filter(file => file.endsWith('.js'));
  
  console.log('Compiled JS files:', compiledJsFiles);
  
  for (const file of compiledJsFiles) {
    const filePath = join(apiSourceDir, file);
    let content = readFileSync(filePath, 'utf8');
    
    // Check for various import patterns that might need .js extension fixes
    // Pattern 1: Standard import from "./_utils"
    if (content.includes('from "./_utils"')) {
      content = content.replace('from "./_utils"', 'from "./_utils.js"');
      console.log(`Fixed import extensions in ${file} (Pattern 1)`);
    }
    
    // Pattern 2: Import with single quotes
    if (content.includes("from './_utils'")) {
      content = content.replace("from './_utils'", "from './_utils.js'");
      console.log(`Fixed import extensions in ${file} (Pattern 2)`);
    }
    
    // Pattern 3: More general pattern for any relative imports without extensions
    const importRegex = /(import\s+.*?\s+from\s+["']\.[^"']*?)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      // Check if it's a relative import without extension
      if (importPath.includes('./') && !importPath.includes('.js')) {
        const fixedPath = importPath + '.js';
        content = content.replace(importPath, fixedPath);
        console.log(`Fixed import extensions in ${file} (Pattern 3)`);
      }
    }
    
    // Write the file only if content was changed
    writeFileSync(filePath, content, 'utf8');
  }
  
  // Remove TypeScript files after compilation to avoid conflicts
  console.log('Removing TypeScript files to avoid conflicts...');
  for (const file of tsFiles) {
    const filePath = join(apiSourceDir, file);
    unlinkSync(filePath);
    console.log(`Removed ${filePath}`);
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}