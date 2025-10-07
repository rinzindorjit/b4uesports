const path = require('path');
console.log('Current directory:', __dirname);
console.log('Resolved @ alias:', path.resolve(__dirname, "client", "src"));
console.log('Toaster path:', path.resolve(__dirname, "client", "src", "components", "ui", "toaster.tsx"));