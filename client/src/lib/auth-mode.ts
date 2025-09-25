// Utility functions to determine authentication mode

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
  
  // Pi Browser feature detection
  // @ts-ignore
  if (window.Pi && typeof window.Pi === 'object') {
    return 'pi-browser';
  }
  
  // Localhost development
  if (hostname === 'localhost' && window.location.port === '3005') {
    return 'localhost-preview';
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
  return mode !== 'production';
}

export function shouldInitializePiSDK(): boolean {
  const mode = getAuthMode();
  return mode === 'production' || mode === 'pi-browser';
}

export function getPiSDKSandboxMode(): boolean {
  const mode = getAuthMode();
  // Use sandbox mode for all non-production environments
  return mode !== 'production';
}