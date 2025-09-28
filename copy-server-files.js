import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function copyFolderRecursive(source, destination) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const files = readdirSync(source);
  
  for (const file of files) {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);
    
    if (statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destPath);
    } else {
      copyFileSync(sourcePath, destPath);
    }
  }
}

// Copy server files
const sourceDir = join(process.cwd(), 'server');
const destDir = join(process.cwd(), 'dist', 'server');

console.log(`Copying files from ${sourceDir} to ${destDir}`);
copyFolderRecursive(sourceDir, destDir);
console.log('Server files copied successfully!');