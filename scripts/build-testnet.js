import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

console.log('Building testnet application...');

try {
  // Run the Vite build
  console.log('Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Copy the testnet-specific index.html to dist
  const distPath = resolve('dist');
  const publicIndexPath = resolve('public/index.html');
  const distIndexPath = resolve(distPath, 'index.html');
  
  if (existsSync(publicIndexPath)) {
    console.log('Copying testnet index.html to dist...');
    copyFileSync(publicIndexPath, distIndexPath);
    console.log('Testnet index.html copied successfully');
  } else {
    console.log('Public index.html not found, using built version');
  }
  
  // Ensure validation-key.txt is in dist
  const publicValidationKey = resolve('client/public/validation-key.txt');
  const distValidationKey = resolve(distPath, 'validation-key.txt');
  
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