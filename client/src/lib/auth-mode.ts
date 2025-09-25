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
    isVercel: hostname.includes('vercel.app'),
    isProduction: process.env.NODE_ENV === 'production' && !hostname.includes('localhost')
  });
  
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
  console.log('shouldUseMockAuth check, mode:', mode);
  // Use mock auth for Vercel deployments, Pi Browser, and development mock environments
  return mode === 'vercel-sandbox' || mode === 'development-mock' || mode === 'pi-browser';
}

export function shouldInitializePiSDK(): boolean {
  const mode = getAuthMode();
  console.log('shouldInitializePiSDK check, mode:', mode);
  // Initialize Pi SDK for Pi Browser, localhost development, and Vercel sandbox
  // Since this is a sandbox/testnet application, we should always try to initialize Pi SDK
  return mode === 'pi-browser' || mode === 'localhost-development' || mode === 'vercel-sandbox';
}

export function getPiSDKSandboxMode(): boolean {
  const mode = getAuthMode();
  console.log('getPiSDKSandboxMode check, mode:', mode);
  // Use sandbox mode for Pi Browser and localhost development
  return mode === 'pi-browser' || mode === 'localhost-development';
}