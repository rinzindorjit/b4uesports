// Debug script to test authentication flow step by step
const { getPiNetworkService, jwtSign } = require('./dist/api/_utils.js');

async function testAuth() {
  try {
    console.log('Testing Pi Network authentication flow...');
    
    // Test 1: Check environment variables
    console.log('\n1. Checking environment variables...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set (using default)');
    console.log('PI_SERVER_API_KEY:', process.env.PI_SERVER_API_KEY ? 'Set' : 'Not set (using default)');
    
    // Test 2: Test Pi Network service
    console.log('\n2. Testing Pi Network service...');
    const piService = getPiNetworkService();
    console.log('Pi Network service initialized');
    
    // Note: You'll need to replace this with a valid Pi Network access token
    const testToken = 'your_test_token_here'; // Replace with actual token
    
    if (testToken !== 'your_test_token_here') {
      console.log('Attempting to verify access token...');
      const userData = await piService.verifyAccessToken(testToken);
      console.log('User data received:', userData);
      
      // Test 3: Test JWT signing
      console.log('\n3. Testing JWT signing...');
      const token = jwtSign({ pi_id: userData.pi_id });
      console.log('JWT token generated:', token.substring(0, 20) + '...');
    } else {
      console.log('Skipping Pi Network verification - no valid test token provided');
      console.log('To test fully, replace "your_test_token_here" with a valid Pi Network access token');
    }
    
  } catch (error) {
    console.error('Error during authentication test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAuth();