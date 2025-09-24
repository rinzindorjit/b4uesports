// Test Pi SDK functionality
console.log('Testing Pi SDK...');

// Check if Pi SDK is loaded
if (typeof window !== 'undefined' && window.Pi) {
  console.log('Pi SDK is loaded');
  
  // Test initialization
  try {
    window.Pi.init({ version: "2.0", sandbox: true });
    console.log('Pi SDK initialized successfully');
  } catch (error) {
    console.error('Pi SDK initialization failed:', error);
  }
  
  // Test authentication (this will fail in Node.js environment)
  try {
    // This is just to test if the function exists
    console.log('Pi.authenticate function exists:', typeof window.Pi.authenticate === 'function');
  } catch (error) {
    console.error('Pi SDK authentication test failed:', error);
  }
} else {
  console.log('Pi SDK is not loaded');
}