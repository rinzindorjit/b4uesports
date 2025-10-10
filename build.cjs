const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync } = require('fs');
const { join } = require('path');

try {
  // Create the root dist directory for Vercel
  const rootDistDir = join(process.cwd(), 'dist');
  if (!existsSync(rootDistDir)) {
    mkdirSync(rootDistDir, { recursive: true });
    console.log(`Created root dist directory: ${rootDistDir}`);
  }
  
  // Build client-side application
  console.log('Building client application...');
  const clientSourceDir = join(process.cwd(), 'client');
  const clientSrcDir = join(clientSourceDir, 'src');
  
  // Check if client source exists
  if (existsSync(clientSrcDir)) {
    // Copy client public files if they exist
    const clientPublicDir = join(clientSourceDir, 'public');
    if (existsSync(clientPublicDir)) {
      // Function to copy files recursively
      function copyRecursiveSync(src, dest) {
        const stats = statSync(src);
        if (stats.isDirectory()) {
          // Create directory if it doesn't exist
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
          }
          // Copy all contents
          const files = readdirSync(src);
          for (const file of files) {
            const srcPath = join(src, file);
            const destPath = join(dest, file);
            copyRecursiveSync(srcPath, destPath);
          }
        } else if (stats.isFile()) {
          copyFileSync(src, dest);
          console.log(`Copied client public file: ${src.replace(clientPublicDir, '')}`);
        }
      }
      
      // Copy all files and directories from public recursively
      copyRecursiveSync(clientPublicDir, rootDistDir);
    }
    
    // Create a simple client bundle using esbuild
    const mainEntry = join(clientSrcDir, 'main.tsx');
    const appEntry = join(clientSrcDir, 'App.tsx');
    const indexHtml = join(clientSourceDir, 'index.html');
    
    if (existsSync(mainEntry) && existsSync(indexHtml)) {
      // Copy index.html to dist
      const indexPath = join(rootDistDir, 'index.html');
      copyFileSync(indexHtml, indexPath);
      console.log('Copied client index.html');
      
      // Try to build the client bundle
      try {
        const bundlePath = join(rootDistDir, 'bundle.js');
        execSync(`npx esbuild "${mainEntry}" --bundle --outfile="${bundlePath}" --format=esm`, {
          stdio: 'inherit'
        });
        console.log('Client bundle created successfully');
        
        // Update index.html to include the bundle and remove the original script tag
        let indexContent = readFileSync(indexPath, 'utf8');
        // Add CSS link if it doesn't exist
        if (!indexContent.includes('bundle.css')) {
          indexContent = indexContent.replace(
            '</head>',
            '  <link rel="stylesheet" href="./bundle.css">\n  </head>'
          );
        }
        // Remove the original script tag and add the bundle script
        indexContent = indexContent.replace(
          '<script type="module" src="/src/main.tsx"></script>',
          '<script type="module" src="./bundle.js"></script>'
        );
        writeFileSync(indexPath, indexContent, 'utf8');
      } catch (buildError) {
        console.warn('Client build failed, using simplified index.html:', buildError.message);
        // Use a simplified index.html if build fails
        const simpleIndex = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>B4U Esports - Pi Network Gaming Marketplace</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>B4U Esports - Pi Network Gaming Marketplace</h1>
      <p>API endpoints:</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/packages">/api/packages</a></li>
        <li><a href="/api/pi-price">/api/pi-price</a></li>
      </ul>
    </div>
  </body>
</html>`;
        writeFileSync(indexPath, simpleIndex, 'utf8');
      }
    } else {
      console.log('Client entry files not found, creating simple index.html');
      // Create a simple index.html if client files don't exist
      const simpleIndex = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>B4U Esports - Pi Network Gaming Marketplace</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>B4U Esports - Pi Network Gaming Marketplace</h1>
      <p>API endpoints:</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/packages">/api/packages</a></li>
        <li><a href="/api/pi-price">/api/pi-price</a></li>
      </ul>
    </div>
  </body>
</html>`;
      const indexPath = join(rootDistDir, 'index.html');
      writeFileSync(indexPath, simpleIndex, 'utf8');
    }
  } else {
    console.log('Client source directory not found, creating simple index.html');
    // Create a simple index.html if client directory doesn't exist
    const simpleIndex = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>B4U Esports - Pi Network Gaming Marketplace</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>B4U Esports - Pi Network Gaming Marketplace</h1>
      <p>API endpoints:</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/packages">/api/packages</a></li>
        <li><a href="/api/pi-price">/api/pi-price</a></li>
      </ul>
    </div>
  </body>
</html>`;
    const indexPath = join(rootDistDir, 'index.html');
    writeFileSync(indexPath, simpleIndex, 'utf8');
  }
  
  // Create the API directory within dist for Vercel
  const distApiDir = join(rootDistDir, 'api');
  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
    console.log(`Created dist/api directory: ${distApiDir}`);
  }
  
  // Compile API TypeScript files to JavaScript in the api directory (not dist/api)
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Compile each TypeScript file individually to the api directory as CommonJS
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiSourceDir, file.replace('.ts', '.js'));
    
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
  
  // Copy all non-TypeScript files to the api directory
  const nonTsFiles = files.filter(file => !file.endsWith('.ts') && !file.endsWith('.json') && !file.endsWith('.md'));
  for (const file of nonTsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(apiSourceDir, file);
    
    // Check if source file exists and is a file (not a directory)
    if (existsSync(sourcePath)) {
      const stats = statSync(sourcePath);
      if (stats.isFile()) {
        copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${destPath}`);
      }
    }
  }
  
  // Copy package.json to api directory for Vercel
  const packageJsonSource = join(apiSourceDir, 'package.json');
  const packageJsonDest = join(apiSourceDir, 'package.json');
  if (existsSync(packageJsonSource)) {
    copyFileSync(packageJsonSource, packageJsonDest);
    console.log(`Copied package.json to ${packageJsonDest}`);
  }
  
  // Also copy compiled files to dist/api for local development
  const distApiDirPath = join(rootDistDir, 'api');
  if (!existsSync(distApiDirPath)) {
    mkdirSync(distApiDirPath, { recursive: true });
    console.log(`Created dist/api directory: ${distApiDirPath}`);
  }
  
  // Copy all compiled JS files from api directory to dist/api
  const compiledJsFiles = tsFiles.map(file => file.replace('.ts', '.js'));
  for (const file of compiledJsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(distApiDirPath, file);
    
    if (existsSync(sourcePath)) {
      copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to ${destPath}`);
    }
  }
  
  // Copy package.json to dist/api for local development
  if (existsSync(packageJsonSource)) {
    const distPackageJsonDest = join(distApiDirPath, 'package.json');
    copyFileSync(packageJsonSource, distPackageJsonDest);
    console.log(`Copied package.json to ${distPackageJsonDest}`);
  }
  
  // Post-process compiled files in both api and dist/api directories
  const updatedFiles = readdirSync(apiSourceDir);
  const compiledJsFilesInApi = updatedFiles.filter(file => file.endsWith('.js'));
  
  console.log('Compiled JS files:', compiledJsFilesInApi);
  
  for (const file of compiledJsFilesInApi) {
    const filePath = join(apiSourceDir, file);
    // Check if file exists before processing
    if (!existsSync(filePath)) {
      console.log(`Skipping ${file} as it doesn't exist`);
      continue;
    }
    
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
    
    // Also update the file in dist/api
    const distFilePath = join(distApiDirPath, file);
    if (existsSync(distFilePath)) {
      writeFileSync(distFilePath, content, 'utf8');
    }
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}