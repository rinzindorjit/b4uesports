// Debug script to check environment variables
console.log('Checking environment variables...');

// Check if process.env is available
if (typeof process !== 'undefined' && process.env) {
  console.log('Process env available');
  
  // Check specific environment variables
  console.log('PI_SERVER_API_KEY:', process.env.PI_SERVER_API_KEY ? 
    `SET (length: ${process.env.PI_SERVER_API_KEY.length}, starts with: ${process.env.PI_SERVER_API_KEY.substring(0, 10)})` : 
    'NOT SET');
  console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
  console.log('NODE_ENV:', process.env.NODE_ENV);
} else {
  console.log('Process env not available');
}

// Try to check if there are any global variables
console.log('Global this keys:', Object.keys(globalThis || {}));

// Try to check if there are any other ways the API key might be set
console.log('Checking for possible API key sources...');

// Check if there might be a config object
if (typeof config !== 'undefined') {
  console.log('Config object found:', config);
}

// Check if there might be a global API key variable
if (typeof PI_SERVER_API_KEY !== 'undefined') {
  console.log('Global PI_SERVER_API_KEY found:', PI_SERVER_API_KEY);
}

console.log('Debug script completed');