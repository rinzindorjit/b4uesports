import type { VercelRequest, VercelResponse } from '@vercel/node';

// Production-ready health check handler
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers - restrict in production
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
    : '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed. Only GET requests are allowed.' });
  }
  
  // Return health status with additional system information
  return response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}