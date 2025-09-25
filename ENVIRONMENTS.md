# Environment Configuration Guide

This document explains the different environments supported by the B4U Esports application and how they are configured.

## Environment Detection

The application automatically detects the environment based on the following criteria:

1. **Pi Browser Environment**
   - User agent contains "PiBrowser" or "Pi Network"
   - Uses real Pi Network authentication
   - Pi SDK loaded in sandbox mode

2. **Localhost Development**
   - Hostname is "localhost"
   - Uses mock authentication by default (can be configured)
   - Pi SDK loaded in sandbox mode

3. **Vercel Deployments**
   - Hostname contains "vercel.app"
   - Uses mock authentication (Pi SDK not loaded to prevent CORS issues)
   - Simulates Pi Network authentication flow

4. **Production Environment**
   - NODE_ENV is "production" and not localhost
   - Uses real Pi Network authentication
   - Pi SDK loaded in production mode

## Environment-Specific Configurations

### Pi SDK Loading Strategy

To prevent CORS issues, the Pi SDK is conditionally loaded based on the environment:

```javascript
// Check if we're in an environment that needs the Pi SDK
const hostname = window.location.hostname;
const userAgent = navigator.userAgent;
const isVercel = hostname.includes('vercel.app');
const isPiBrowser = userAgent.includes('PiBrowser') || userAgent.includes('Pi Network');
const isLocalhost = hostname === 'localhost';

// Only load Pi SDK for Pi Browser or localhost development
// Skip loading for Vercel deployments to avoid CORS issues
if (isPiBrowser || isLocalhost) {
  // Load Pi SDK
  const script = document.createElement('script');
  script.src = 'https://sandbox.minepi.com/pi-sdk.js';
  document.head.appendChild(script);
} else if (isVercel) {
  // Skip Pi SDK loading, use mock authentication
  console.log('Skipping Pi SDK load for Vercel deployment - using mock authentication');
}
```

### Authentication Flow by Environment

#### Pi Browser & Localhost Development
1. Pi SDK is loaded and initialized
2. Real authentication with Pi Network
3. Access token verification with Pi backend
4. User data stored in database

#### Vercel Deployments (Preview/Production)
1. Pi SDK is NOT loaded (prevents CORS issues)
2. Mock authentication flow
3. Generated mock user data and tokens
4. Data stored in localStorage for simulation

#### Production Environment
1. Pi SDK is loaded in production mode
2. Real authentication with Pi Network
3. Access token verification with Pi backend
4. User data stored in database

## Environment Variables

Different environments may require different environment variables:

### Development (.env.local)
```
NODE_ENV=development
PI_API_KEY=test_key_from_pi_developer_portal
PI_SECRET=test_secret_from_pi_developer_portal
DATABASE_URL=postgresql://user:password@localhost:5432/b4uesports_dev
JWT_SECRET=development_jwt_secret
```

### Production (Vercel Environment Variables)
```
NODE_ENV=production
PI_API_KEY=production_key_from_pi_developer_portal
PI_SECRET=production_secret_from_pi_developer_portal
DATABASE_URL=postgresql://user:password@prod-server:5432/b4uesports_prod
JWT_SECRET=production_jwt_secret
```

## Testing Different Environments

### Local Development Testing
1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Authentication will use mock mode by default
4. Can be configured to use real Pi Network if needed

### Pi Browser Testing
1. Deploy to Vercel or use localhost
2. Open URL in Pi Browser
3. Authentication will use real Pi Network
4. Pi SDK will be loaded in sandbox mode

### Vercel Preview Testing
1. Push changes to GitHub
2. Vercel automatically creates preview deployment
3. Open preview URL in any browser
4. Authentication will use mock mode
5. Pi SDK is not loaded (prevents CORS issues)

## Troubleshooting Environment Issues

### CORS Errors
If you see CORS errors related to Pi SDK:
1. Verify that Pi SDK is not being loaded on Vercel deployments
2. Check that conditional loading logic is working correctly
3. Ensure hostname detection is accurate

### Authentication Not Working
If authentication is not working in a specific environment:
1. Check browser console for errors
2. Verify environment detection is working correctly
3. Ensure correct authentication flow is being used
4. Check that required environment variables are set

### Pi SDK Not Loading
If Pi SDK is not loading when it should:
1. Check browser console for loading errors
2. Verify environment detection logic
3. Ensure script tag is being added to the DOM
4. Check network tab for blocked requests

## Best Practices

1. **Always test in multiple environments** before deploying to production
2. **Use mock authentication** for development and testing when Pi Network is not required
3. **Verify environment variables** are correctly set for each deployment target
4. **Monitor browser console** for environment-specific errors
5. **Document environment-specific configurations** for team members