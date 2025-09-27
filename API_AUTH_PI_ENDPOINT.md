# /api/auth/pi Endpoint Implementation

## Overview

The [/api/auth/pi](file:///C:/Users/HP/B4U%20Esports/api/auth/pi) endpoint handles user authentication with the Pi Network. It supports both mock authentication for development/testing and real Pi Network authentication.

## Implementation Details

### Route Configuration

The endpoint is configured in [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js) to route requests to the consolidated Pi API handler with the `auth` action:

```javascript
} else if (path === '/api/auth/pi') {
  // Handle /api/auth/pi endpoint by redirecting to Pi handler with auth action
  console.log('Routing to /api/auth/pi endpoint');
  const piHandler = (await import('./pi.js')).default;
  const modifiedRequest = {
    ...request,
    query: { action: 'auth' },
    headers: request.headers
  };
  return await piHandler(modifiedRequest, response);
}
```

### Authentication Handler

The actual authentication logic is implemented in [api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js) under the `auth` action case.

#### Mock Authentication

For development and testing, mock authentication can be triggered by sending `isMockAuth: true` in the request body:

```javascript
// Check if this is a mock request (for Pi Browser development)
if (body.isMockAuth) {
  console.log("Handling mock authentication");
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

  return res.status(200).json({
    user: mockUser,
    token: mockToken
  });
}
```

#### Real Pi Network Authentication

For real authentication, an `accessToken` must be provided in the request body:

```javascript
// For non-mock requests, we need an access token
const { accessToken } = body;

if (!accessToken) {
  return res.status(400).json({ message: 'Access token required' });
}

// Verify the access token with Pi Network
const piApiUrl = "https://sandbox.minepi.com/v2/me"; // Always Testnet

const piResponse = await fetch(piApiUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'B4U-Esports-Server/1.0'
  }
});
```

## Usage Examples

### Mock Authentication Request

```bash
curl -X POST https://b4uesports.vercel.app/api/auth/pi \
  -H "Content-Type: application/json" \
  -d '{"isMockAuth": true}'
```

### Real Authentication Request

```bash
curl -X POST https://b4uesports.vercel.app/api/auth/pi \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your_pi_access_token_here"}'
```

## Response Format

Both mock and real authentication return the same response format:

```json
{
  "user": {
    "id": "user-identifier",
    "piUID": "pi-user-id",
    "username": "user_name",
    "email": "user@example.com",
    "phone": "+1234567890",
    "country": "US",
    "language": "en",
    "walletAddress": "wallet_address",
    "gameAccounts": {},
    "profileImageUrl": null,
    "isProfileVerified": true,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "authentication_token"
}
```

## Error Handling

The endpoint handles various error conditions:

1. **Missing request body**: Returns 400 with error message
2. **Missing access token**: Returns 400 with "Access token required"
3. **Invalid access token format**: Returns 400 with "Invalid access token format"
4. **Pi Network API errors**: Returns appropriate status code with error details
5. **CDN blocking**: Detects and reports CDN blocking issues
6. **Non-JSON responses**: Handles and reports parsing errors

## Testnet Mode

The endpoint works in Testnet mode and allows authentication without requiring a real Pi Browser connection during development and testing.

## Security Considerations

1. **Header forwarding**: Properly forwards headers for Pi Browser detection
2. **Testnet restrictions**: Allows requests without Pi Browser in Testnet mode
3. **Access token validation**: Validates access token format before making API calls
4. **Error information**: Limits detailed error information in production environments