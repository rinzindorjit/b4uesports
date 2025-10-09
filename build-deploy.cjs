const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } = require('fs');
const { join } = require('path');

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Compile server TypeScript files to JavaScript in dist/server directory
  console.log('Compiling server files...');
  const serverSourceDir = join(process.cwd(), 'server');
  const serverDestDir = join(process.cwd(), 'dist', 'server');
  
  // Create the server directory
  if (!existsSync(serverDestDir)) {
    mkdirSync(serverDestDir, { recursive: true });
  }
  
  // Function to compile TypeScript files recursively
  function compileServerFiles(sourceDir, destDir) {
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
  
    const files = readdirSync(sourceDir);
    
    for (const file of files) {
      const sourcePath = join(sourceDir, file);
      const destPath = join(destDir, file);
      
      if (statSync(sourcePath).isDirectory()) {
        compileServerFiles(sourcePath, destPath);
      } else if (file.endsWith('.ts')) {
        // Compile TypeScript files to JavaScript
        const jsDestPath = destPath.replace('.ts', '.js');
        execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=esm --outfile="${jsDestPath}"`, {
          stdio: 'inherit'
        });
        
        // Verify the file was created
        if (existsSync(jsDestPath)) {
          console.log(`Successfully created ${jsDestPath}`);
        } else {
          console.error(`Failed to create ${jsDestPath}`);
        }
      } else {
        // Copy other files directly
        copyFileSync(sourcePath, destPath);
      }
    }
  }
  
  compileServerFiles(serverSourceDir, serverDestDir);
  console.log('Server files compiled successfully!');
  
  // Handle API files for Vercel - copy JavaScript files directly
  console.log('Handling API files for Vercel...');
  const apiSourceDir = join(process.cwd(), 'api');
  const apiDestDir = join(process.cwd(), 'dist', 'api');
  
  // Create the API directory
  if (!existsSync(apiDestDir)) {
    mkdirSync(apiDestDir, { recursive: true });
  }
  
  // Get all files in the api directory
  const apiFiles = readdirSync(apiSourceDir);
  console.log('API files found:', apiFiles);
  
  // Get all .ts files in the api directory to compile
  const tsFiles = apiFiles.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually to the dist/api directory
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiDestDir, file.replace('.ts', '.js'));
    
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
  
  // Copy all .js files directly to dist/api (for Vercel serverless functions)
  const jsFiles = apiFiles.filter(file => file.endsWith('.js'));
  for (const file of jsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiDestDir, file);
    
    console.log(`Copying ${file} to ${destPath}...`);
    copyFileSync(sourcePath, destPath);
    console.log(`Successfully copied ${destPath}`);
  }
  
  // Copy package.json to dist/api for Vercel
  console.log('Copying package.json to dist/api...');
  copyFileSync(join(apiSourceDir, 'package.json'), join(apiDestDir, 'package.json'));
  
  // Post-process compiled files to fix import extensions (only for compiled TS files)
  const updatedFiles = readdirSync(apiDestDir);
  const compiledJsFiles = updatedFiles.filter(file => file.endsWith('.js') && tsFiles.includes(file.replace('.js', '.ts')));
  
  console.log('Compiled JS files:', compiledJsFiles);
  
  for (const file of compiledJsFiles) {
    const filePath = join(apiDestDir, file);
    let content = readFileSync(filePath, 'utf8');
    
    // Check for various import patterns that might need .js extension fixes
    // Pattern 1: Standard import from "./_utils"
    if (content.includes('from "./_utils"')) {
      content = content.replace('from "./_utils"', 'from "./_utils.js"');
      console.log(`Fixed import extensions in ${file} (Pattern 1)`);
    }
    
    // Pattern 1b: Standard import from "./_utils.ts"
    if (content.includes('from "./_utils.ts"')) {
      content = content.replace('from "./_utils.ts"', 'from "./_utils.js"');
      console.log(`Fixed import extensions in ${file} (Pattern 1b)`);
    }
    
    // Pattern 2: Import with single quotes
    if (content.includes("from './_utils'")) {
      content = content.replace("from './_utils'", "from './_utils.js'");
      console.log(`Fixed import extensions in ${file} (Pattern 2)`);
    }
    
    // Pattern 2b: Import with single quotes and .ts extension
    if (content.includes("from './_utils.ts'")) {
      content = content.replace("from './_utils.ts'", "from './_utils.js'");
      console.log(`Fixed import extensions in ${file} (Pattern 2b)`);
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
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}