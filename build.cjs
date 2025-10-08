const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } = require('fs');
const { join } = require('path');

// Function to copy folders recursively
function copyFolderRecursive(source, destination) {
  console.log(`Copying from ${source} to ${destination}`);
  
  if (!existsSync(destination)) {
    console.log(`Creating directory ${destination}`);
    mkdirSync(destination, { recursive: true });
  }

  const files = readdirSync(source);
  console.log(`Found files in ${source}:`, files);
  
  for (const file of files) {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);
    
    const stats = statSync(sourcePath);
    if (stats.isDirectory()) {
      console.log(`Copying directory ${file}`);
      copyFolderRecursive(sourcePath, destPath);
    } else {
      console.log(`Copying file ${file}`);
      copyFileSync(sourcePath, destPath);
    }
  }
}

// Function to compile TypeScript files in a directory
function compileTsFiles(sourceDir) {
  console.log(`Compiling TypeScript files in ${sourceDir}...`);
  
  // Get all .ts files in the directory
  const files = readdirSync(sourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually
  for (const file of tsFiles) {
    const sourcePath = join(sourceDir, file);
    const destPath = join(sourceDir, file.replace('.ts', '.js'));
    
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
  
  // Recursively compile TypeScript files in subdirectories
  for (const file of files) {
    const sourcePath = join(sourceDir, file);
    const stats = statSync(sourcePath);
    if (stats.isDirectory()) {
      compileTsFiles(sourcePath);
    }
  }
}

// Function to remove TypeScript files after compilation
function removeTsFiles(dir) {
  console.log(`Removing TypeScript files from ${dir}...`);
  
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    
    if (stats.isDirectory()) {
      removeTsFiles(filePath);
    } else if (file.endsWith('.ts')) {
      unlinkSync(filePath);
      console.log(`Removed ${filePath}`);
    }
  }
}

// Function to fix import extensions in JavaScript files
function fixImportExtensions(dir) {
  console.log(`Fixing import extensions in ${dir}...`);
  
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    
    if (stats.isDirectory()) {
      fixImportExtensions(filePath);
    } else if (file.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf8');
      let contentChanged = false;
      
      // Check for various import patterns that might need .js extension fixes
      // Pattern 1: Standard import from "../storage"
      if (content.includes('from "../storage"')) {
        content = content.replace('from "../storage"', 'from "../storage.js"');
        console.log(`Fixed import extensions in ${file} (Pattern 1)`);
        contentChanged = true;
      }
      
      // Pattern 2: Import with single quotes
      if (content.includes("from '../storage'")) {
        content = content.replace("from '../storage'", "from '../storage.js'");
        console.log(`Fixed import extensions in ${file} (Pattern 2)`);
        contentChanged = true;
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
          contentChanged = true;
        }
      }
      
      // Write the file only if content was changed
      if (contentChanged) {
        writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // ONLY copy server files to api/dist_server for Vercel compatibility
  // Skip copying to dist/server to prevent Vercel from treating them as functions
  console.log('Copying server files to api/dist_server for Vercel compatibility...');
  const serverSourceDir = join(process.cwd(), 'server');
  const apiServerDestDir = join(process.cwd(), 'api', 'dist_server');
  if (existsSync(serverSourceDir)) {
    copyFolderRecursive(serverSourceDir, apiServerDestDir);
    console.log('Server files copied to api/dist_server successfully!');
    
    // Compile server TypeScript files to JavaScript in the api/dist_server directory
    console.log('Compiling server TypeScript files in api/dist_server...');
    compileTsFiles(apiServerDestDir);
    
    // Remove TypeScript files after compilation
    console.log('Removing server TypeScript files from api/dist_server...');
    removeTsFiles(apiServerDestDir);
    
    // Fix import extensions in server JavaScript files
    console.log('Fixing import extensions in api/dist_server JavaScript files...');
    fixImportExtensions(apiServerDestDir);
  }
  
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
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}