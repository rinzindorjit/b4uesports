const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } = require('fs');
const { join } = require('path');

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Compile API TypeScript files to JavaScript in the api/dist directory
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  const apiOutputDir = join(apiSourceDir, 'dist');
  
  // Create output directory if it doesn't exist
  if (!existsSync(apiOutputDir)) {
    mkdirSync(apiOutputDir, { recursive: true });
    console.log(`Created output directory: ${apiOutputDir}`);
  }
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually to the output directory as CommonJS
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiOutputDir, file.replace('.ts', '.js'));
    
    console.log(`Compiling ${file} to ${destPath}...`);
    // Use CommonJS format for Vercel compatibility
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=cjs --bundle --outfile="${destPath}"`, {
      stdio: 'inherit'
    });
    
    // Verify the file was created
    if (existsSync(destPath)) {
      console.log(`Successfully created ${destPath}`);
    } else {
      console.error(`Failed to create ${destPath}`);
    }
  }
  
  // Copy all non-TypeScript files to the output directory
  const nonTsFiles = files.filter(file => !file.endsWith('.ts') && !file.endsWith('.json') && !file.endsWith('.md'));
  for (const file of nonTsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiOutputDir, file);
    
    // Check if source file exists and is a file (not a directory)
    if (existsSync(sourcePath)) {
      const stats = statSync(sourcePath);
      if (stats.isFile()) {
        copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${destPath}`);
      }
    }
  }
  
  // Post-process compiled files to fix import extensions and convert to CommonJS
  const updatedFiles = readdirSync(apiOutputDir);
  const compiledJsFiles = updatedFiles.filter(file => file.endsWith('.js'));
  
  console.log('Compiled JS files:', compiledJsFiles);
  
  for (const file of compiledJsFiles) {
    const filePath = join(apiOutputDir, file);
    let content = readFileSync(filePath, 'utf8');
    
    // Convert ES module exports to CommonJS exports
    // Replace 'export default async function handler' with 'module.exports ='
    content = content.replace(/export\s+default\s+async\s+function\s+handler/, 'const handler = async function');
    content = content.replace(/export\s+default\s+function\s+handler/, 'const handler = function');
    content = content.replace(/export\s+default\s+(\w+);/, 'module.exports = $1;');
    
    // Add module.exports at the end if we have a handler function
    if (content.includes('const handler =')) {
      content = content.replace(/const handler = async function[\s\S]*?};?\s*$/, '$&\nmodule.exports = handler;');
    }
    
    // Fix import statements to require statements for CommonJS
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];/g, 'const {$1} = require("$2");');
    content = content.replace(/import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"];/g, 'const $1 = require("$2");');
    content = content.replace(/import\s+['"]([^'"]+)['"];/g, 'require("$1");');
    
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
    const importRegex = /(require\(["']\.[^"']*?)["']/g;
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
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}