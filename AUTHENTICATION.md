# Authentication Flow Documentation

This document explains how authentication works in the B4U Esports application across different environments.

## Overview

The B4U Esports application supports two types of authentication:

1. **Real Pi Network Authentication** - For production and Pi Browser environments
2. **Mock Authentication** - For development, testing, and Vercel deployments

## Authentication Detection Logic

The application determines which authentication method to use based on the environment:

```typescript
// auth-mode.ts
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

export function shouldUseMockAuth(): boolean {
  const mode = getAuthMode();
  // Use mock auth for Vercel deployments, Pi Browser, and development mock environments
  return mode === 'vercel-sandbox' || mode === 'development-mock' || mode === 'pi-browser';
}
```

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
// use-pi-network.tsx
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
// use-pi-network.tsx
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
// api/pi/auth.js
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
    const token = 'mock-jwt-token-' + Date.now() + '-' + piUser.uid;

    response.status(200).json({
      user: user,
      token: token
    });
  }
}
```

## Environment-Specific Behavior

### Pi Browser
- Pi SDK loaded in sandbox mode
- Real authentication with Pi Network
- User data stored in database

### Localhost Development
- Pi SDK loaded in sandbox mode
- Can use either real or mock authentication
- User data stored in database

### Vercel Deployments
- Pi SDK NOT loaded (prevents CORS issues)
- Mock authentication only
- User data stored in localStorage

### Production
- Pi SDK loaded in production mode
- Real authentication with Pi Network
- User data stored in database

## Troubleshooting

### Authentication Stuck on "Connecting..."

This usually happens when the loading state is not properly reset. Check:

1. Ensure `setIsLoading(false)` is called in all code paths
2. Verify the `finally` block is executing
3. Check for unhandled exceptions

### CORS Errors

If you see CORS errors related to Pi SDK:

1. Verify Pi SDK is not being loaded on Vercel deployments
2. Check conditional loading logic in index.html
3. Ensure hostname detection is working correctly

### Mock Authentication Not Working

If mock authentication is not being triggered:

1. Check environment detection logic
2. Verify `shouldUseMockAuth()` returns true
3. Ensure backend endpoint handles `isMockAuth` flag