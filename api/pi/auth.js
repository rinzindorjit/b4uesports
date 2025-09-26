// Pi Network authentication endpoint for Vercel
export default async function authHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In Vercel, the request body is already parsed as JSON
    const body = request.body || {};

    // Check if this is a mock request (for Pi Browser development)
    if (body.isMockAuth) {
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

      return response.status(200).json({
        user: mockUser,
        token: mockToken
      });
    }

    // For non-mock requests, we need an access token
    const { accessToken } = body;

    if (!accessToken) {
      return response.status(400).json({ message: 'Access token required' });
    }

    // Validate access token format (basic validation)
    if (typeof accessToken !== 'string' || accessToken.length < 10) {
      return response.status(400).json({ message: 'Invalid access token format' });
    }

    // Verify the access token with Pi Network
    const piApiUrl = "https://sandbox.minepi.com/v2/me"; // Always Testnet

    console.log("🔄 Authenticating user with Pi Network Testnet API...");
    console.log("🌐 URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📥 Pi API Response Status:", piResponse.status);

    // Handle non-JSON responses
    const textResponse = await piResponse.text();
    
    // Check if response is HTML (indicating CDN error)
    if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
      console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
      return response.status(403).json({
        error: "CDN Blocking Request",
        message: "Request blocked by CDN - ensure you're hitting the correct Pi Network API endpoint",
        details: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.",
        rawResponsePreview: textResponse.substring(0, 500)
      });
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError.message);
      return response.status(500).json({
        error: "Invalid API Response",
        message: "Pi Network API returned non-JSON response",
        rawResponse: textResponse.substring(0, 1000)
      });
    }

    if (!piResponse.ok) {
      console.error(`❌ Pi API Error ${piResponse.status}:`, data);
      return response.status(piResponse.status).json({
        error: "Pi Network API Error",
        message: `API returned status ${piResponse.status}`,
        details: data
      });
    }

    const piUser = data;

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

    console.log("✅ Authentication successful for user:", user.username);
    response.status(200).json({
      user: user,
      token: token
    });
  } catch (error) {
    console.error("💥 Authentication failed:", error);
    // Ensure we always send a response
    if (!response.headersSent) {
      response.status(500).json({ 
        message: 'Authentication failed', 
        error: error.message,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      });
    }
  }
}