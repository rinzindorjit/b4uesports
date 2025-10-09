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
        execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=cjs --outfile="${jsDestPath}"`, {
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
    execSync(`npx esbuild "${sourcePath}" --platform=node --packages=external --format=cjs --outfile="${destPath}"`, {
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
  
  // Include _utils.js in the list of files to process
  const filesToProcess = [...compiledJsFiles];
  
  for (const file of filesToProcess) {
    const filePath = join(apiDestDir, file);
    // Check if file exists before processing
    if (!existsSync(filePath)) {
      console.log(`Skipping ${file} as it doesn't exist`);
      continue;
    }
    
    let content = readFileSync(filePath, 'utf8');
    
    // Write the file only if content was changed
    writeFileSync(filePath, content, 'utf8');
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}