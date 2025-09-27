// Utility functions to determine authentication mode

export function getAuthMode() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  const hostname = window.location.hostname;
  const userAgent = window.navigator.userAgent;
  
  console.log('Auth mode detection:', {
    hostname,
    userAgent,
    isPiBrowser: userAgent.includes('PiBrowser') || userAgent.includes('Pi Network'),
    isLocalhost: hostname === 'localhost',
    isNetlify: hostname.includes('netlify.app'),
    isVercel: hostname.includes('vercel.app'),
    isProduction: process.env.NODE_ENV === 'production' && !hostname.includes('localhost')
  });
  
  // Pi Browser detection - highest priority
  if (userAgent.includes('PiBrowser') || userAgent.includes('Pi Network')) {
    return 'pi-browser';
  }
  
  // Localhost development
  if (hostname === 'localhost') {
    // Check if Pi SDK is available
    if (typeof window !== 'undefined' && window.Pi) {
      return 'localhost-with-pi-sdk';
    }
    return 'localhost-development';
  }
  
  // Netlify deployment (testnet mode)
  if (hostname.includes('netlify.app')) {
    return 'netlify-testnet';
  }
  
  // Vercel deployment (testnet mode)
  if (hostname.includes('vercel.app')) {
    return 'vercel-testnet';
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
  console.log('shouldUseMockAuth check, mode:', mode);
  // Use mock auth only for development environments
  // For production and testnet environments, use real authentication when possible
  // Allow Pi SDK usage on localhost if available
  return mode === 'development-mock' || mode === 'server';
}

export function shouldInitializePiSDK(): boolean {
  const mode = getAuthMode();
  console.log('shouldInitializePiSDK check, mode:', mode);
  // Initialize Pi SDK for all environments except development mock
  // For testnet environments, we still initialize the Pi SDK
  return mode !== 'development-mock' && mode !== 'server';
}

export function getPiSDKSandboxMode(): boolean {
  const mode = getAuthMode();
  console.log('getPiSDKSandboxMode check, mode:', mode);
  // Use sandbox mode for testnet environments, production mode for production
  // For testnet (Vercel, Netlify), we use sandbox mode
  return mode !== 'production';
}