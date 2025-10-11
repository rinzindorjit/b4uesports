import type { VercelRequest, VercelResponse } from '@vercel/node';

// Consolidated handler for miscellaneous API endpoints
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://b4uesports.vercel.app' 
    : '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Get the path to determine which endpoint to handle
  const url = new URL(request.url || '', `https://${request.headers.host}`);
  const path = url.pathname;
  
  // Handle health check endpoint
  if (path === '/api/health') {
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
  
  // Default response for unknown endpoints
  return response.status(404).json({ message: 'Route not found' });
}