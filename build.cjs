const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, copyFileSync, rmdirSync } = require('fs');
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
    
    // Copy Font Awesome webfonts to dist directory
    const fontAwesomeWebfontsDir = join(process.cwd(), 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts');
    const distWebfontsDir = join(rootDistDir, 'webfonts');
    if (existsSync(fontAwesomeWebfontsDir)) {
      copyRecursiveSync(fontAwesomeWebfontsDir, distWebfontsDir);
      console.log('Copied Font Awesome webfonts to dist/webfonts');
    }
    
    // Create a simple client bundle using esbuild
    const mainEntry = join(clientSrcDir, 'main.tsx');
    const testMainEntry = join(clientSrcDir, 'test-main.tsx');
    const simpleReactTestEntry = join(clientSrcDir, 'simple-react-test.tsx');
    const appEntry = join(clientSrcDir, 'App.tsx');
    const indexHtml = join(clientSourceDir, 'index.html');
    
    if (existsSync(mainEntry) && existsSync(indexHtml)) {
      // Copy index.html to dist
      const indexPath = join(rootDistDir, 'index.html');
      copyFileSync(indexHtml, indexPath);
      console.log('Copied client index.html');
      
      // Process CSS with Tailwind CLI first
      try {
        // Use Tailwind CLI to process the CSS with content hashing for cache busting
        const { execSync: cssExecSync } = require('child_process');
        const crypto = require('crypto');
        const fs = require('fs');
        
        // Generate a hash based on the CSS content
        const cssContent = fs.readFileSync(join(clientSrcDir, 'index.css'), 'utf8');
        const cssHash = crypto.createHash('md5').update(cssContent).digest('hex').substring(0, 8);
        const hashedCssName = `main-${cssHash}.css`;
        const hashedCssPath = join(rootDistDir, hashedCssName);
        
        cssExecSync(`npx tailwindcss -i "${join(clientSrcDir, 'index.css')}" -o "${hashedCssPath}" --minify`, {
          stdio: 'inherit'
        });
        console.log(`Processed CSS with Tailwind successfully: ${hashedCssName}`);
        
        // Update index.html to reference the hashed CSS file
        let indexContent = readFileSync(indexPath, 'utf8');
        indexContent = indexContent.replace(
          '<link rel="stylesheet" href="./main.css">',
          `<link rel="stylesheet" href="./${hashedCssName}">`
        );
        writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`Updated index.html to reference ${hashedCssName}`);
      } catch (cssError) {
        console.warn('CSS processing failed:', cssError.message);
        // Fallback: copy the original CSS file
        copyFileSync(join(clientSrcDir, 'index.css'), join(rootDistDir, 'main.css'));
      }
      
      // Try to build the client bundle
      try {
        // Specify the output file name to ensure consistency
        execSync(`npx esbuild "${mainEntry}" --bundle --outfile="${join(rootDistDir, 'main.js')}" --format=esm --jsx=automatic --alias:@=./client/src --alias:@shared=./shared --loader:.png=dataurl --loader:.jpg=dataurl --loader:.svg=dataurl --loader:.woff=dataurl --loader:.woff2=dataurl --loader:.ttf=dataurl --loader:.eot=dataurl`, {
          stdio: 'inherit'
        });
        console.log('Client bundle created successfully');
        
        // Build the test client bundle only if the file exists
        if (existsSync(testMainEntry)) {
          execSync(`npx esbuild "${testMainEntry}" --bundle --outfile="${join(rootDistDir, 'test.js')}" --format=esm --jsx=automatic --alias:@=./client/src --alias:@shared=./shared --loader:.png=dataurl --loader:.jpg=dataurl --loader:.svg=dataurl --loader:.woff=dataurl --loader:.woff2=dataurl --loader:.ttf=dataurl --loader:.eot=dataurl`, {
            stdio: 'inherit'
          });
          console.log('Test client bundle created successfully');
        } else {
          console.log('Test main entry file not found, skipping test bundle build');
        }
        
        // Build the simple react test client bundle only if the file exists
        if (existsSync(simpleReactTestEntry)) {
          execSync(`npx esbuild "${simpleReactTestEntry}" --bundle --outfile="${join(rootDistDir, 'simple-react-test.js')}" --format=esm --jsx=automatic --alias:@=./client/src --alias:@shared=./shared --loader:.png=dataurl --loader:.jpg=dataurl --loader:.svg=dataurl --loader:.woff=dataurl --loader:.woff2=dataurl --loader:.ttf=dataurl --loader:.eot=dataurl`, {
            stdio: 'inherit'
          });
          console.log('Simple React test client bundle created successfully');
        } else {
          console.log('Simple React test entry file not found, skipping simple react test bundle build');
        }
        
        // Update index.html to include the bundle and remove the original script tag
        let indexContent = readFileSync(indexPath, 'utf8');
        // Add CSS link if it doesn't exist or update it to hashed version
        const cssHash = require('crypto').createHash('md5').update(require('fs').readFileSync(join(clientSrcDir, 'index.css'), 'utf8')).digest('hex').substring(0, 8);
        const hashedCssName = `main-${cssHash}.css`;
        
        if (!indexContent.includes(hashedCssName)) {
          indexContent = indexContent.replace(
            '<link rel="stylesheet" href="./main.css">',
            `<link rel="stylesheet" href="./${hashedCssName}">`
          );
        }
        // Remove the original script tag and add the bundle script
        indexContent = indexContent.replace(
          '<script type="module" src="/src/main.tsx"></script>',
          '<script type="module" src="./main.js"></script>'
        );
        writeFileSync(indexPath, indexContent, 'utf8');
        
        // Create a test.html file only if test bundle was created
        if (existsSync(testMainEntry)) {
          const testHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test React App</title>
    <link rel="stylesheet" href="./${hashedCssName}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./test.js"></script>
  </body>
</html>`;
          writeFileSync(join(rootDistDir, 'test.html'), testHtml, 'utf8');
          console.log('Created test.html');
        }
        
        // Create a simple-react-test.html file only if simple react test bundle was created
        if (existsSync(simpleReactTestEntry)) {
          const simpleReactTestHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple React Test</title>
    <link rel="stylesheet" href="./${hashedCssName}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./simple-react-test.js"></script>
  </body>
</html>`;
          writeFileSync(join(rootDistDir, 'simple-react-test.html'), simpleReactTestHtml, 'utf8');
          console.log('Created simple-react-test.html');
        }
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
  
  // Compile API TypeScript files to JavaScript in the dist/api directory (not in api directory to avoid conflicts)
  console.log('Compiling API files...');
  const apiSourceDir = join(process.cwd(), 'api');
  
  // Create the API directory within dist for Vercel
  const distApiDir = join(rootDistDir, 'api');
  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
    console.log(`Created dist/api directory: ${distApiDir}`);
  }
  
  // Get all .ts files in the api directory
  const files = readdirSync(apiSourceDir);
  const tsFiles = files.filter(file => file.endsWith('.ts'));
  
  // Copy all TypeScript files to the dist/api directory
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(distApiDir, file);
    
    copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to ${destPath}`);
  }
  
  // Copy the shared schema file to dist/api for proper resolution
  const sharedSchemaSource = join(process.cwd(), 'shared', 'schema.ts');
  const sharedSchemaDest = join(distApiDir, 'schema.ts');
  if (existsSync(sharedSchemaSource)) {
    copyFileSync(sharedSchemaSource, sharedSchemaDest);
    console.log(`Copied shared/schema.ts to ${sharedSchemaDest}`);
  }
  
  // Copy package.json to dist/api for Vercel
  const packageJsonSource = join(apiSourceDir, 'package.json');
  const packageJsonDest = join(distApiDir, 'package.json');
  if (existsSync(packageJsonSource)) {
    copyFileSync(packageJsonSource, packageJsonDest);
    console.log(`Copied package.json to ${packageJsonDest}`);
  }
  
  // Remove any compiled JavaScript files that might have been copied
  const distApiFiles = readdirSync(distApiDir);
  const jsFiles = distApiFiles.filter(file => file.endsWith('.js') || file.endsWith('.d.ts') || file.endsWith('.d.ts.map'));
  for (const file of jsFiles) {
    const filePath = join(distApiDir, file);
    unlinkSync(filePath);
    console.log(`Removed compiled file: ${filePath}`);
  }
  
  // Copy server files to dist/server for Vercel
  const serverSourceDir = join(process.cwd(), 'server');
  const distServerDir = join(rootDistDir, 'server');
  if (existsSync(serverSourceDir)) {
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
        console.log(`Copied server file: ${src.replace(serverSourceDir, '')}`);
      }
    }
    
    // Copy all server files recursively
    copyRecursiveSync(serverSourceDir, distServerDir);
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}