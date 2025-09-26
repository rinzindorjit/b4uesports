// Pi Network user management endpoint for Vercel
import { withCORS, setCORSHeaders, handlePreflight } from '../utils/cors.js';

export default withCORS(userHandler);

async function userHandler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  try {
    if (request.method === 'GET') {
      // Get user info
      // For mock purposes, return mock user data
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        piUID: 'mock-pi-uid',
        username: 'mock_user',
        email: 'mock@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'mock-wallet-address',
        gameAccounts: {},
        profileImageUrl: null,
        isProfileVerified: true, // Set to true for mock
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      response.status(200).json(mockUser);
    } else if (request.method === 'PUT') {
      // Update user profile
      // In Vercel, the request body is already parsed as JSON
      const userData = request.body || {};
      
      // For mock purposes, return the updated user data
      // Check if profile is being completed (email and phone provided)
      const isProfileVerified = userData.email && userData.phone;
      
      const updatedUser = {
        id: 'mock-user-' + Date.now(),
        ...userData,
        isProfileVerified: isProfileVerified,
        updatedAt: new Date().toISOString()
      };

      response.status(200).json(updatedUser);
    } else {
      response.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User handler error:', error);
    response.status(500).json({ message: 'Failed to handle user request', error: error.message });
  }
}