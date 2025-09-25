import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

console.log('Building testnet application...');

try {
  // Run the Vite build
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // DON'T copy the testnet-specific index.html to dist - let Vite handle it
  // Vite will generate the correct index.html with proper script references
  
  // Ensure validation-key.txt is in dist
  const publicValidationKey = resolve('client/public/validation-key.txt');
  const distValidationKey = resolve('dist', 'validation-key.txt');
  
  if (existsSync(publicValidationKey)) {
    console.log('Copying validation-key.txt to dist...');
    copyFileSync(publicValidationKey, distValidationKey);
    console.log('validation-key.txt copied successfully');
  }
  
  console.log('Testnet build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}