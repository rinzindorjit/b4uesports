// Pi Network authentication endpoint for Vercel
import fetch from 'node-fetch';

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
    console.log('Pi auth request received:', {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    // In Vercel, the request body is already parsed as JSON
    // So we don't need to parse it again
    const body = request.body || {};
    
    console.log('Body:', body);
    console.log('Body type:', typeof body);
    
    const { accessToken } = body;
    console.log('Access token:', accessToken);
    
    // Check if this is a mock request (for Pi Browser development)
    if (body.isMockAuth) {
      console.log('Using mock authentication for Pi Browser development');
      
      // Create mock user data
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        piUID: 'mock-pi-uid-' + Date.now(),
        username: 'pi_user_' + Math.floor(Math.random() * 10000),
        email: 'piuser@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        gameAccounts: {
          pubg: { ign: 'PiPlayer', uid: 'PID123456789' },
          mlbb: { userId: 'MLBB987654321', zoneId: 'ZONE1234' }
        },
        profileImageUrl: null,
        isProfileVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Generate a mock JWT token
      const mockToken = 'mock-jwt-token-' + Date.now();

      console.log('Mock authentication successful for user:', mockUser.username);
      
      return response.status(200).json({
        user: mockUser,
        token: mockToken
      });
    }
    
    if (!accessToken) {
      console.log('Missing access token');
      return response.status(400).json({ message: 'Access token required' });
    }

    // Validate access token format (basic validation)
    if (typeof accessToken !== 'string' || accessToken.length < 10) {
      console.log('Invalid access token format');
      return response.status(400).json({ message: 'Invalid access token format' });
    }

    // Verify the access token with Pi Network
    console.log('Verifying access token with Pi Network');
    const piResponse = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Pi Network response status:', piResponse.status);
    
    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.log('Pi Network verification failed:', errorText);
      return response.status(401).json({ 
        message: 'Pi Network authentication failed',
        error: errorText 
      });
    }

    const piUser = await piResponse.json();
    console.log('Pi Network user data:', piUser);

    // Create or update user in our database
    // For now, we'll use a mock implementation since we don't have a real database connection
    const user = {
      id: 'user-' + piUser.uid,
      piUID: piUser.uid,
      username: piUser.username,
      email: piUser.email || '',
      phone: piUser.phone || '',
      country: piUser.country || 'US',
      language: piUser.language || 'en',
      walletAddress: piUser.walletAddress || '',
      gameAccounts: {},
      profileImageUrl: piUser.profileImageUrl || null,
      isProfileVerified: !!(piUser.email && piUser.phone),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate a JWT token for our application
    // For now, we'll use a mock token since we don't have JWT implementation
    const token = 'mock-jwt-token-' + Date.now() + '-' + piUser.uid;

    console.log('Authentication successful for user:', user.username);
    
    response.status(200).json({
      user: user,
      token: token
    });
  } catch (error) {
    console.error('Pi authentication error:', error);
    console.error('Error stack:', error.stack);
    response.status(500).json({ 
      message: 'Authentication failed', 
      error: error.message,
      // Don't expose the full stack trace in production
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}