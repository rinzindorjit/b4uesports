// Pi Network authentication endpoint for Vercel
export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken } = request.body;
    if (!accessToken) {
      return response.status(400).json({ message: 'Access token required' });
    }

    // For mock purposes, we'll return a mock user
    // In a real implementation, you would verify the access token with Pi Network
    const piUser = {
      uid: 'mock-user-uid-' + Date.now(),
      username: 'mock_user',
      roles: ['user']
    };

    // For mock purposes, we'll return a mock user
    // In a real implementation, you would create/update the user in your database
    const mockUser = {
      id: 'user-' + piUser.uid,
      piUID: piUser.uid,
      username: piUser.username,
      email: '',
      phone: '',
      country: 'US',
      language: 'en',
      walletAddress: '',
      gameAccounts: {},
      profileImageUrl: null,
      isProfileVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate a mock JWT token
    const mockToken = 'mock-jwt-token-' + Date.now();

    response.status(200).json({
      user: mockUser,
      token: mockToken
    });
  } catch (error) {
    console.error('Pi authentication error:', error);
    response.status(500).json({ message: 'Authentication failed' });
  }
}