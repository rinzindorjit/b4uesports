// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Production-ready test endpoint handler
export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers - restrict in production
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
    : '*';
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Only allow GET requests in production
  if (process.env.NODE_ENV === 'production' && request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed. Only GET requests are allowed in production.' });
  }
  
  return response.json({ 
    message: 'API test endpoint', 
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    environment: process.env.NODE_ENV || 'development'
  });
}