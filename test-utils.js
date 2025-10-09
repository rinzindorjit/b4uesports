// Test script to verify _utils.js is working correctly
import { getStorage, getPiNetworkService, jwtSign, jwtVerify } from './dist/api/_utils.js';

console.log('Testing _utils.js functions...');

// Test 1: Check getStorage
try {
  const store = getStorage();
  console.log('✓ getStorage() works');
  console.log('  Store structure:', Object.keys(store));
} catch (error) {
  console.error('✗ getStorage() failed:', error.message);
}

// Test 2: Check getPiNetworkService
try {
  const piService = getPiNetworkService();
  console.log('✓ getPiNetworkService() works');
  console.log('  Service methods:', Object.keys(piService));
} catch (error) {
  console.error('✗ getPiNetworkService() failed:', error.message);
}

// Test 3: Check JWT functions
try {
  const payload = { test: 'data', id: 123 };
  const token = jwtSign(payload);
  console.log('✓ jwtSign() works');
  console.log('  Token generated (first 20 chars):', token.substring(0, 20) + '...');
  
  const decoded = jwtVerify(token);
  console.log('✓ jwtVerify() works');
  console.log('  Decoded payload:', decoded);
} catch (error) {
  console.error('✗ JWT functions failed:', error.message);
}

// Test 4: Check environment variables
console.log('Environment variables:');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set (using default)');
console.log('  PI_SERVER_API_KEY:', process.env.PI_SERVER_API_KEY ? 'Set' : 'Not set (using default)');