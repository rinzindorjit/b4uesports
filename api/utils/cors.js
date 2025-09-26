// CORS utility functions for Vercel API routes

export function setCORSHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Max-Age', '86400');
  response.setHeader('Vary', 'Origin');
}

export function handlePreflight(request, response) {
  if (request.method === 'OPTIONS') {
    setCORSHeaders(response);
    response.status(200).end();
    return true;
  }
  return false;
}

export function withCORS(handler) {
  return async function(request, response) {
    // Set CORS headers for all requests
    setCORSHeaders(response);
    
    // Handle preflight requests
    if (handlePreflight(request, response)) {
      return;
    }
    
    // Continue with the actual handler
    return await handler(request, response);
  };
}