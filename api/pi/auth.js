// Pi Network authentication endpoint for Vercel
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function authHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  console.log('=== AUTH API ENDPOINT CALLED ===');
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Process env keys:', Object.keys(process.env).filter(key => key.includes('PI')));
  console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
  console.log('PI_SERVER_API_KEY:', process.env.PI_SERVER_API_KEY ? '✅ SET' : '❌ MISSING');

  try {
    console.log('🔹 Verifying Pi authentication...');

    // In Vercel, the request body is already parsed as JSON
    const body = request.body || {};
    console.log('Parsed body:', body);

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

      console.log('✅ Mock authentication successful for user:', mockUser.username);
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

    // Verify the access token with Pi Network
    console.log('Verifying access token with Pi Network');

    // Ensure sandbox mode
    const piApiUrl = "https://sandbox.minepi.com/v2/me";
    console.log("Using Pi Testnet API URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Pi Network response status:', piResponse.status);

    if (piResponse.status === 403) {
      const text = await piResponse.text();
      return response.status(403).json({
        error: "Pi Testnet API access blocked",
        message: "403 Forbidden — Check endpoint & headers",
        response: text.substring(0, 500),
      });
    }

    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error('❌ Pi Network verification failed:', errorText.substring(0, 500));
      return response.status(401).json({ 
        message: 'Pi Network authentication failed',
        error: errorText 
      });
    }

    const piUser = await piResponse.json();
    console.log('Pi Network user data:', piUser);

    // Create or update user in our database
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
    const token = 'mock-jwt-token-' + Date.now() + '-' + piUser.uid;

    console.log('✅ Authentication successful for user:', user.username);
    response.status(200).json({
      user: user,
      token: token
    });
  } catch (error) {
    console.error('❌ Pi authentication error:', error);
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