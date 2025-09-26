// Vercel middleware to handle CORS for all API routes
export default function middleware(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers
    });
  }

  // For all other requests, continue to the next handler
  // In Vercel Edge Functions, we return a Response with status 200
  // but the actual API handler will process the request
  // We just need to ensure CORS headers are set
  return new Response(null, {
    status: 200,
    headers
  });
}

export const config = {
  matcher: '/api/:path*',
};