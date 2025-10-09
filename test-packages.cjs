const { getStorage } = require('./api/_utils.js');

// Test the packages data
const store = getStorage();
console.log('Packages:', JSON.stringify(store.packages, null, 2));