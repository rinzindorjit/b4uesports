// Pi Network authentication endpoint for Vercel
// Use built-in fetch when available (Node.js 18+ in Vercel) to avoid compatibility issues
const fetch = globalThis.fetch;
import { withCORS, setCORSHeaders, handlePreflight } from '../utils/cors.js';

export default withCORS(authHandler);

async function authHandler(request, response) {
  console.log('=== AUTH API ENDPOINT CALLED ===');
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Process env keys:', Object.keys(process.env).filter(key => key.includes('PI')));
  console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
  console.log('PI_SANDBOX_MODE type:', typeof process.env.PI_SANDBOX_MODE);
  console.log('PI_SANDBOX_MODE truthy:', !!process.env.PI_SANDBOX_MODE);
  console.log('PI_SERVER_API_KEY configured:', !!process.env.PI_SERVER_API_KEY);
  
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Handling preflight OPTIONS request');
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    console.log('Invalid method, returning 405');
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
    
    console.log('Parsed body:', body);
    console.log('Body type:', typeof body);
    
    console.log('Body:', body);
    console.log('Body type:', typeof body);
    
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
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Sending mock auth response');
      return response.status(200).json({
        user: mockUser,
        token: mockToken
      });
    }
    
    // For non-mock requests, we need an access token
    const { accessToken } = body;
    console.log('Access token:', accessToken);
    
    if (!accessToken) {
      console.log('Missing access token');
      return response.status(400).json({ message: 'Access token required' });
    }

    // Validate access token format (basic validation)
    if (typeof accessToken !== 'string' || accessToken.length < 10) {
      console.log('Invalid access token format');
      return response.status(400).json({ message: 'Invalid access token format' });
    }
    
    console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);

    // Verify the access token with Pi Network
    console.log('Verifying access token with Pi Network');
    
    // Use sandbox endpoint for testnet mode - using user's suggested approach
    const piApiUrl = process.env.PI_SANDBOX_MODE 
      ? 'https://sandbox.minepi.com/v2/me' 
      : 'https://api.minepi.com/v2/me';
      
    console.log("Using Pi API URL:", piApiUrl);
      
    const piResponse = await fetch(piApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Pi Network response status:', piResponse.status);
    console.log('Pi Network response headers:', [...piResponse.headers.entries()]);
    
    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.log('Pi Network verification failed:', errorText.substring(0, 500));
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
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Sending real auth response');
    response.status(200).json({
      user: user,
      token: token
    });
  } catch (error) {
    console.error('Pi authentication error:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure we always send a response
    try {
      if (!response.headersSent) {
        response.status(500).json({ 
          message: 'Authentication failed', 
          error: error.message,
          // Don't expose the full stack trace in production
          ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
        });
      }
    } catch (responseError) {
      console.error('Error sending response:', responseError);
      // Last resort response
      if (!response.headersSent) {
        response.status(500).send('Authentication failed');
      }
    }
  } finally {
    console.log('=== AUTH API ENDPOINT FINISHED ===');
  }
}