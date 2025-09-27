# Auth Endpoint Fix

## Issue
The [/api/auth/pi](file:///C:/Users/HP/B4U%20Esports/api/auth/pi) endpoint was returning a 404 "API endpoint not found" error because it wasn't properly routed in the main API handler.

## Solution
Added specific routing for the [/api/auth/pi](file:///C:/Users/HP/B4U%20Esports/api/auth/pi) endpoint in [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js) that redirects to the consolidated Pi API handler with the 'auth' action parameter.

## Code Changes
In [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js), added the following routing logic:

```javascript
} else if (path === '/api/auth/pi') {
  // Handle /api/auth/pi endpoint by redirecting to Pi handler with auth action
  console.log('Routing to /api/auth/pi endpoint');
  const piHandler = (await import('./pi.js')).default;
  const modifiedRequest = {
    ...request,
    query: { action: 'auth' }
  };
  console.log('Modified request for Pi handler - method:', modifiedRequest.method);
  console.log('Modified request for Pi handler - query:', modifiedRequest.query);
  return await piHandler(modifiedRequest, response);
}
```

## Expected Outcome
The [/api/auth/pi](file:///C:/Users/HP/B4U%20Esports/api/auth/pi) endpoint should now correctly route to the Pi handler and return mock authentication data for testing purposes.

## Verification
After deploying this fix, you can test the endpoint with:
```bash
curl -X POST https://b4uesports.vercel.app/api/auth/pi \
  -H "Content-Type: application/json" \
  -d '{"isMockAuth": true}'
```

This should return mock user data instead of a 404 error.