# Pi Network Integration Guide

This document explains how Pi Network integration works in the B4U Esports application and how to properly configure it.

## Overview

The B4U Esports application supports two types of Pi Network authentication:

1. **Real Pi Network Authentication** - For production and Pi Browser environments
2. **Mock Authentication** - For development, testing, and Vercel deployments

## Configuration

To enable real Pi Network authentication, you need to configure the following environment variables in your `.env` file:

```env
# Pi Network Configuration
PI_SECRET_KEY=your_actual_pi_secret_key_here
PI_SERVER_API_KEY=your_actual_pi_server_api_key_here
PI_APP_ID=your_actual_app_id_here
```

### Obtaining Credentials

1. Visit the [Pi Network Developer Portal](https://minepi.com)
2. Create a new app and obtain your APP_ID
3. Generate your SECRET_KEY and SERVER_API_KEY from the developer console
4. Add your domain to the whitelist in the developer console

## Authentication Detection Logic

The application determines which authentication method to use based on the environment:

```javascript
// client/src/lib/auth-mode.ts
export function getAuthMode() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  const hostname = window.location.hostname;
  const userAgent = window.navigator.userAgent;
  
  // Pi Browser detection
  if (userAgent.includes('PiBrowser') || userAgent.includes('Pi Network')) {
    return 'pi-browser';
  }
  
  // Localhost development
  if (hostname === 'localhost') {
    return 'localhost-development';
  }
  
  // Netlify deployment (testnet mode)
  if (hostname.includes('netlify.app')) {
    return 'netlify-testnet';
  }
  
  // Vercel deployment (sandbox mode)
  if (hostname.includes('vercel.app')) {
    return 'vercel-sandbox';
  }
  
  // Production environment
  if (process.env.NODE_ENV === 'production' && !hostname.includes('localhost')) {
    return 'production';
  }
  
  // Default to mock mode for development
  return 'development-mock';
}
```

## Authentication Modes

### Pi Browser & Localhost Development
1. Pi SDK is loaded and initialized
2. Real authentication with Pi Network
3. Access token verification with Pi backend
4. User data stored in database

### Vercel Deployments (Preview/Production)
1. Pi SDK is NOT loaded (prevents CORS issues)
2. Mock authentication flow
3. Generated mock user data and tokens
4. Data stored in localStorage for simulation

### Production Environment
1. Pi SDK is loaded in production mode
2. Real authentication with Pi Network
3. Access token verification with Pi backend
4. User data stored in database

## Real Pi Network Authentication

Used in Pi Browser and production environments.

### Flow

1. User clicks "Sign In with Pi Network"
2. Pi SDK is loaded and initialized (sandbox mode for development)
3. `Pi.authenticate()` is called with required scopes
4. User approves authentication in Pi Browser
5. Access token is returned to the application
6. Access token is sent to backend for verification
7. Backend verifies token with Pi Network API
8. User data is returned and stored in database
9. JWT token is generated for application session
10. User is logged in

### Code Implementation

```typescript
// client/src/hooks/use-pi-network.tsx
const authResult = await piSDK.authenticate(['payments', 'username', 'wallet_address']);

if (authResult) {
  // Send access token to backend for verification
  const response = await apiRequest('POST', '/api/auth/pi', {
    accessToken: authResult.accessToken,
  });
  
  const data = await response.json();
  
  if (response.ok) {
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    // Save to localStorage
    localStorage.setItem('pi_token', data.token);
    localStorage.setItem('pi_user', JSON.stringify(data.user));
  }
}
```

## Mock Authentication

Used in Vercel deployments and development environments to avoid CORS issues and enable testing.

### Flow

1. User clicks "Sign In with Pi Network"
2. Application detects mock authentication environment
3. Mock user data is generated
4. Mock JWT token is created
5. Data is sent to backend with `isMockAuth: true`
6. Backend generates mock response with mock user data
7. User data is stored in localStorage
8. User is logged in

### Code Implementation

```typescript
// client/src/hooks/use-pi-network.tsx
if (useMockAuth || !isPiSDKAvailable) {
  // Send request to backend with mock auth flag
  const response = await apiRequest('POST', '/api/auth/pi', {
    isMockAuth: true
  });
  
  const data = await response.json();
  
  if (response.ok) {
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    // Save to localStorage
    localStorage.setItem('pi_token', data.token);
    localStorage.setItem('pi_user', JSON.stringify(data.user));
  }
}
```

## Backend Authentication Endpoint

The backend handles both real and mock authentication:

```javascript
// api/pi/auth.js or server/routes.ts
export default async function handler(request, response) {
  const body = request.body || {};
  
  // Check if this is a mock request
  if (body.isMockAuth) {
    // Create mock user data
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      piUID: 'mock-pi-uid-' + Date.now(),
      username: 'pi_user_' + Math.floor(Math.random() * 10000),
      // ... other mock data
    };

    // Generate a mock JWT token
    const mockToken = 'mock-jwt-token-' + Date.now();

    return response.status(200).json({
      user: mockUser,
      token: mockToken
    });
  }
  
  // For real authentication
  const { accessToken } = body;
  
  // Verify the access token with Pi Network
  const piResponse = await fetch('https://api.minepi.com/v2/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (piResponse.ok) {
    const piUser = await piResponse.json();
    
    // Create or update user in our database
    const user = {
      id: 'user-' + piUser.uid,
      piUID: piUser.uid,
      username: piUser.username,
      // ... other user data
    };

    // Generate a JWT token for our application
    const token = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: '7d' });

    response.status(200).json({
      user: user,
      token: token
    });
  }
}
```

## Payment Integration

The application supports both real Pi Network payments and mock payments for testing.

### Real Payments

1. User initiates a payment
2. Pi SDK creates a payment request
3. Backend approves the payment with Pi Network
4. Backend completes the payment with Pi Network
5. Transaction is recorded in the database

### Mock Payments

1. User initiates a payment
2. Mock payment flow is triggered
3. Mock transaction is created
4. Transaction is stored in localStorage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your domain is properly whitelisted in the Pi Network developer console
2. **Authentication Failures**: Check that your API keys are correct and not expired
3. **Payment Issues**: Verify that your app has the necessary permissions in the developer console

### Debugging Tips

1. Check the browser console for detailed error messages
2. Verify that the Pi SDK is properly loaded
3. Ensure your environment variables are correctly set
4. Check the network tab for failed API requests

## Security Considerations

1. All API keys are stored in environment variables
2. Access tokens are verified with Pi Network before user creation
3. JWT tokens are used for session management
4. HTTPS is enforced for all endpoints
5. Input validation is performed on all user inputs