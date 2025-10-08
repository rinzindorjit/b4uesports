const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } = require('fs');
const { join } = require('path');

try {
  // Run the main build command for client
  console.log('Running client build...');
  execSync('npx vite build', { 
    stdio: 'inherit' 
  });
  
  // Ensure no JavaScript files exist in the api directory before compilation
  const apiSourceDir = join(process.cwd(), 'api');
  const apiFiles = readdirSync(apiSourceDir);
  const jsFiles = apiFiles.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length > 0) {
    console.log('Found existing JavaScript files in api directory, removing them:', jsFiles);
    for (const file of jsFiles) {
      const filePath = join(apiSourceDir, file);
      unlinkSync(filePath);
      console.log(`Removed ${filePath}`);
    }
  }
  
  // Create dist/api directory if it doesn't exist
  const distApiDir = join(process.cwd(), 'dist', 'api');
  if (!existsSync(distApiDir)) {
    mkdirSync(distApiDir, { recursive: true });
  }
  
  // Compile API TypeScript files to JavaScript in dist/api directory
  console.log('Compiling API files...');
  const tsFiles = apiFiles.filter(file => file.endsWith('.ts'));
  
  console.log('Found TypeScript files:', tsFiles);
  
  // Compile each TypeScript file individually to dist/api
  for (const file of tsFiles) {
    const sourcePath = join(apiSourceDir, file);
    const destPath = join(distApiDir, file.replace('.ts', '.js'));
    
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
  const compiledFiles = readdirSync(distApiDir);
  const compiledJsFiles = compiledFiles.filter(file => file.endsWith('.js'));
  
  console.log('Compiled JS files:', compiledJsFiles);
  
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
  console.error('Stack trace:', error.stack);
  process.exit(1);
}